var express = require("express");
var sqlite3 = require("sqlite3");
var bodyParser = require("body-parser");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 3000;


var db = new sqlite3.Database("db.sqlite", (err) => {
    if (err) {
        // Can't open DB
        console.error(err.message);
        throw err
    } else {
        // DB opened
        console.log('Connected to the SQLite database.')
        db.run("CREATE TABLE phones (id INTEGER PRIMARY KEY AUTOINCREMENT, brand text, model text, os text, image text, screensize int)", function (err) {
            if (!err) {
                // Table created
                // Add placeholder rows
                var sql = 'INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)';
                db.run(sql, ["Apple","iPhone X","iOS","https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png","5"])
                db.run(sql, ["Samsung","Galaxy s8","Android","https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png","6"])
            }
        });  
    }
});

app.use((req, res, next) => {
    // Headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS" && req.originalUrl.includes("phones")) {
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH")
    } else if (req.method === "OPTIONS" && req.originalUrl.includes("reset")) {
        res.header("Access-Control-Allow-Methods", "DELETE")
    }
    
    next();
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT));
});

// GET /
// Base endpoint message
app.get("/api", (req, res, next) => {
    res.status(200).json({"message":"VUphone API v1"})
});


// GET phones (by id)
// Retreive information on all phones or a single one
app.get("/api/phones", (req, res, next) => {
    var sql;
    var id = req.query.id;
    
    if (id === undefined) { sql = "SELECT * FROM phones" }
    else { sql = "SELECT * FROM phones WHERE id = ?"; }
    
    db.all(sql, id, function (err, row) {
        if (err) { res.status(500).end() }
        else if (row.length === 0) { res.status(404).end() }
        else { res.status(200).json(row) }
    });
});

// POST phones
// Add a new phone
app.post("/api/phones", (req, res, next) => {
    var sql = "INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)";
    var data = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize]; 
    
    if (data.includes(undefined)) { res.status(400).end() }
    
    db.all(sql, data, function (err) {
        if (err) { res.status(500).end(); }
        else {
            res.status(201).json([{
                brand: data[0],
                model: data[1],
                os: data[2],
                image: data[3],
                screensize: data[4]
            }]);
        }
    });
});


// PATCH phones
// Change the contents of one phone
app.patch("/api/phones", (req, res, next) => {
    var id = req.query.id;

    if (id === undefined) { res.status(400).end() }
    else {
        var sql = "UPDATE phones set brand = COALESCE(NULLIF(?,''),brand),model = COALESCE(NULLIF(?,''),model),os = COALESCE(NULLIF(?,''),os),image = COALESCE(NULLIF(?,''),image),screensize = COALESCE(NULLIF(?,''),screensize) WHERE id = ?";
        var data = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize, id];
        
        db.run(sql, data, function (err) {
            if (err) { res.status(500).end(); }
            else { res.status(204).end() }
        });
    }    
});


// DELETE phones
// Remove a phone from the table
app.delete("/api/phones", (req, res, next) => {
    var id = req.query.id;

    if (id === undefined) { res.status(400).end() }
    else {
        db.run("DELETE FROM phones WHERE id = ?", id, function (err) {
            if (err) { res.status(500).end() }
            else { res.status(204).end() }
        });
    }
});


// DELETE reset
// Empty the table and add two placeholder phones
app.delete("/api/reset", (req, res, next) => {
    db.run("DELETE FROM phones", function (err) {
        if (err) { res.status(500).end() }
        else {
            var sql = "INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)";

            data = ["Apple", "iPhone X", "iOS", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png", "5"];
            db.run(sql, data, function (err) {
                if (err) { res.status(500).end() }
                else {
                    data = ["Samsung", "Galaxy s8", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png", "6"];
                    db.run(sql, data, function (err) {
                        if (err) { res.status(500).end() }
                        else {
                            res.status(204).end();
                        }
                    });
                }
            })
        }
    });
});