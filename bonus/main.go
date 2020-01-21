package main

import (
	"database/sql"
	"encoding/json"
	_ "github.com/mattn/go-sqlite3"
	"net/http"
	"strconv"
)
var db *sql.DB
var add *sql.Stmt
var err error
var rows *sql.Rows

type Phone struct {
	Id int `json: "id"`
	Brand string `json: "brand"`
	Model string `json: "model"`
	Os string `json: "os"`
	Image string `json: "image"`
	Screensize int `json: "screensize"`
}
type Res struct {
	Message string `json: "message"`
	Data Phone `json: "data"`
	Id int `json: "id"`
}
// DB STUFF
func initDB() {
	db, err = sql.Open("sqlite3", "tables.db")
	if err != nil { panic(err) }

	_, err = db.Exec("CREATE TABLE IF NOT EXISTS phones (id INTEGER PRIMARY KEY AUTOINCREMENT, brand text, model text, os text, image text, screensize int)")
	if err != nil { panic(err) }

	add, err = db.Prepare("INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)")
	if err != nil { panic(err) }
}
func dropDB() {
	_, err := db.Exec("DROP TABLE phones")
	if err != nil { panic(err) }
}

func scanRowsToPhones(rows *sql.Rows) []*Phone {
	var phones []*Phone
	for rows.Next() {
		phone := new(Phone)

		err := rows.Scan(&phone.Id, &phone.Brand, &phone.Model, &phone.Os, &phone.Image, &phone.Screensize)
		if err != nil { panic(err) }

		phones = append(phones, phone)
	}
	if err := rows.Err(); err != nil { panic(err) }
	return phones
}
func writeToJson(w http.ResponseWriter, res interface{}) {
	jsonData, err := json.MarshalIndent(res, "", "    ")
	if err != nil { panic(err) }
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

// API Methods
func phones(w http.ResponseWriter, r *http.Request){
	switch r.Method {
	case http.MethodGet:
		var id = r.URL.Query().Get("id")
		if len(id) == 0 {
			// Get all rows
			rows, err = db.Query(`SELECT * FROM phones`)
			if err != nil { panic(err) }
		} else {
			// Get one row
			rows, err = db.Query(`SELECT * FROM phones where id=?`, id)
			if err != nil { panic(err) }
		}
		phones := scanRowsToPhones(rows)
		if len(phones) > 0 {
			writeToJson(w, phones)
		} else {
			w.WriteHeader(http.StatusBadRequest)
		}
	case http.MethodPost:
		r.ParseForm()

		var phone Phone
		phone.Brand = r.Form.Get("brand")
		phone.Model = r.Form.Get("model")
		phone.Os = r.Form.Get("os")
		phone.Image = r.Form.Get("image")
		phone.Screensize, err = strconv.Atoi(r.Form.Get("screensize"))
		if err != nil { panic(err) }

		result, err := add.Exec(phone.Brand, phone.Model, phone.Os, phone.Image, phone.Screensize)
		if err != nil { panic(err) }

		id, err := result.LastInsertId()
		if err != nil { panic(err) }
		phone.Id = int(id)

		var res Res
		res.Message = "success"
		res.Data = phone
		res.Id = phone.Id

		writeToJson(w, res)
	case http.MethodDelete:
		var id = r.URL.Query().Get("id")
		if len(id) != 0 {
			_, err = db.Exec(`DELETE FROM phones where id=?`, id)
			if err != nil { panic(err) }
		} else {
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	default:
		w.WriteHeader(http.StatusNotFound)
	}
}

func reset(w http.ResponseWriter, r *http.Request){
	switch r.Method {
	case http.MethodGet:
		dropDB()
		initDB()
		_, err = add.Exec("Apple", "iPhone X", "iOS", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png", "5")
		if err != nil { panic(err) }

		_, err = add.Exec("Samsung", "Galaxy s8", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png", 6)
		if err != nil { panic(err) }
	default:
		w.WriteHeader(http.StatusNotFound)
	}
}

func main(){
	initDB()

	http.Handle("/", http.FileServer(http.Dir("www/")))

	http.HandleFunc("/api/phones", phones)
	http.HandleFunc("/api/reset", reset)

	// dropDB()

	http.ListenAndServe(":8080", nil)
}