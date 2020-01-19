
var express = require("express")
var app = express()

var db = require("./database.js")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 3000

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
  }
  next();
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});


app.get("/api/phones", (req, res, next) => {
    var sql = "select * from phones"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(rows)
      });
});

// Get a specific phone from the database
app.get("/api/phone/:id", (req, res, next) => {
    var sql = "select * from phones where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json(row)
      });
});

// POST API request 
app.post("/api/phone/", (req, res, next) => {
    var data = {
        brand: req.body.brand,
        model: req.body.model,
        os: req.body.os,
        image: req.body.image,
        screensize: req.body.screensize
    }
    var sql ='INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)'
    var params = [data.brand, data.model, data.os, data.image, data.screensize]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})


// Update a spcific id
app.patch("/api/phone/:id", (req, res, next) => {
    var data = {
        brand: req.body.brand,
        model: req.body.model,
        os: req.body.os,
        image: req.body.image,
        screensize: req.body.screensize,
        id: req.params.id
    }
    var sql = `UPDATE phones set brand = COALESCE(?,brand),model = COALESCE(?,model),os = COALESCE(?,os),image = COALESCE(?,image),screensize = COALESCE(?,screensize) WHERE id = ?`
    var params = [data.brand, data.model,data.os,data.image,data.screensize, data.id]
    db.run(sql,params, function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
    });
})


// Delete specific id
app.delete("/api/phone/:id", (req, res, next) => {
    db.run(
        'DELETE FROM phones WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes})
    });
})


//reset database
app.delete("/api/reset/", (req, res, next) => {
    db.run(
        'DELETE FROM phones WHERE id > 0',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes}) 

            var insert = 'INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)'
            db.run(insert, ["Apple","iPhone X","iOS","https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png","5"])
            db.run(insert, ["Samsung","Galaxy s8","Android","https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png","6"])  
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({"message":"VUphone API"})
});
