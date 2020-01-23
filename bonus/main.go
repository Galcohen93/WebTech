package main

import (
	"database/sql"
	"encoding/json"
	_ "github.com/mattn/go-sqlite3"
	"net/http"
	"os"
	"strconv"
)
var db *sql.DB
var add *sql.Stmt
var drop *sql.Stmt
var patch *sql.Stmt
var err error
var rows *sql.Rows

type Phone struct {
	Id int `json:"id"`
	Brand string `json:"brand"`
	Model string `json:"model"`
	Os string `json:"os"`
	Image string `json:"image"`
	Screensize int `json:"screensize"`
}

func main(){
	prepareDB()

	createTable()

	http.Handle("/", http.FileServer(http.Dir("wwwroot/")))

	http.HandleFunc("/api/phones", phones)
	http.HandleFunc("/api/reset", reset)

	http.ListenAndServe(":8080", nil)
}

func prepareDB() {
	db, err = sql.Open("sqlite3", "tables.db")
	if err != nil { panic(err); os.Exit(1) }

	drop, err = db.Prepare("DROP TABLE phones")
	if err != nil { panic(err); os.Exit(1) }

	add, err = db.Prepare("INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)")
	if err != nil { panic(err); os.Exit(1) }

	patch, err = db.Prepare("UPDATE phones set brand = COALESCE(?,brand),model = COALESCE(?,model),os = COALESCE(?,os),image = COALESCE(?,image),screensize = COALESCE(?,screensize) WHERE id = ?")
	if err != nil { panic(err); os.Exit(1) }
}

func createTable() {
	_, err = db.Exec("CREATE TABLE phones (id INTEGER PRIMARY KEY AUTOINCREMENT, brand text, model text, os text, image text, screensize int)")
	if err == nil {
		// If there is no error (DB didn't exist yet)
		_, err = add.Exec("Apple", "iPhone X", "iOS", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png", "5")
		if err != nil { panic(err); os.Exit(1) }

		_, err = add.Exec("Samsung", "Galaxy s8", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png", 6)
		if err != nil { panic(err); os.Exit(1) }
	}
}

func scanRowsToPhones(rows *sql.Rows) []*Phone {
	var phones []*Phone
	for rows.Next() {
		phone := new(Phone)

		err := rows.Scan(&phone.Id, &phone.Brand, &phone.Model, &phone.Os, &phone.Image, &phone.Screensize)
		if err != nil { panic(err); os.Exit(1) }

		phones = append(phones, phone)
	}
	if err := rows.Err(); err != nil { panic(err); os.Exit(1) }
	return phones
}

func writeToJson(w http.ResponseWriter, res interface{}) {
	jsonData, err := json.MarshalIndent(res, "", "    ")
	if err != nil { panic(err) }
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
	return
}

// API Methods
func phones(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
	switch r.Method {
	case http.MethodGet:
		var id = r.URL.Query().Get("id")
		if len(id) == 0 {
			// Get all rows
			rows, err = db.Query(`SELECT * FROM phones`)
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }
		} else {
			// Get one row
			rows, err = db.Query(`SELECT * FROM phones where id=?`, id)
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }
		}
		phones := scanRowsToPhones(rows)
		if len(phones) > 0 {
			writeToJson(w, phones)
			return
		} else {
			w.WriteHeader(http.StatusNotFound)
			return
		}
	case http.MethodPost:
		r.ParseForm()

		var phone Phone
		phone.Brand = r.Form.Get("brand")
		phone.Model = r.Form.Get("model")
		phone.Os = r.Form.Get("os")
		phone.Image = r.Form.Get("image")
		phone.Screensize, err = strconv.Atoi(r.Form.Get("screensize"))
		if err != nil { w.WriteHeader(http.StatusInternalServerError); return }

		if phone.Brand == "" || phone.Model == "" || phone.Os == "" || phone.Image == "" || r.Form.Get("screensize") == "" {
			w.WriteHeader(http.StatusBadRequest); return
		} else {
			result, err := add.Exec(phone.Brand, phone.Model, phone.Os, phone.Image, phone.Screensize)
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }

			id, err := result.LastInsertId()
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }
			phone.Id = int(id)

			w.WriteHeader(http.StatusCreated)
			writeToJson(w, phone)
			return
		}
	case http.MethodPatch:
		var id = r.URL.Query().Get("id")

		r.ParseForm()

		var phone Phone
		phone.Brand = r.Form.Get("brand")
		phone.Model = r.Form.Get("model")
		phone.Os = r.Form.Get("os")
		phone.Image = r.Form.Get("image")
		phone.Screensize, err = strconv.Atoi(r.Form.Get("screensize"))
		if err != nil { w.WriteHeader(http.StatusInternalServerError); return }
		phone.Id, err = strconv.Atoi(id)
		if err != nil { w.WriteHeader(http.StatusInternalServerError); return }

		if len(id) != 0 {
			_, err = patch.Exec(phone.Brand, phone.Model, phone.Os, phone.Image, phone.Screensize, phone.Id)
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }

			w.WriteHeader(http.StatusNoContent)
			writeToJson(w, phone)
			return
		} else {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	case http.MethodDelete:
		var id = r.URL.Query().Get("id")
		if len(id) != 0 {
			_, err = db.Exec(`DELETE FROM phones where id=?`, id)
			if err != nil { w.WriteHeader(http.StatusInternalServerError); return }
			w.WriteHeader(http.StatusNoContent)
			return
		} else {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	default:
		w.WriteHeader(http.StatusNotFound)
		return
	}
}

func reset(w http.ResponseWriter, r *http.Request){
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
	switch r.Method {
	case http.MethodDelete:
		// Drop table
		_, err = drop.Exec()
		if err != nil { w.WriteHeader(http.StatusInternalServerError); return }

		// Create table
		createTable()

		w.WriteHeader(http.StatusNoContent)
		return
	default:
		w.WriteHeader(http.StatusNotFound)
		return
	}
}