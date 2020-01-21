
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
    if (req.method == "OPTIONS" && req.originalUrl.includes("phones")) {
        res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH")
    } else if (req.method == "OPTIONS" && req.originalUrl.includes("reset")) {
        res.header("Access-Control-Allow-Methods", "DELETE")
    }
    next();
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

// GET request, get all phones
app.get("/api/phones", (req, res, next) => {
    var sql = "SELECT * FROM phones"
    db.all(sql, function (err, row) {
        if (err) { res.status(500).end(); return; }
        else { res.status(200).json(row) }
    });
});

// Get a specific phone from the database by id
app.get("/api/phones/:id", (req, res, next) => {
    var sql = "SELECT * FROM phones WHERE id = ?"
    var data = [req.params.id]
    db.get(sql, data, function (err, row) {
        if (err) { res.status(500).end(); return; }
        else { res.status(200).json(row) }
    });
});

// POST API request 
app.post("/api/phones/", (req, res, next) => {
    var sql = "INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)"
    var data = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize]
    db.all(sql, data, function (err) {
        if (err) { res.status(500).end(); return; }
        else { res.status(201).json(data) }
    });
})


// Update a spcific id
app.patch("/api/phones/:id", (req, res, next) => {
    var sql = "UPDATE phones set brand = COALESCE(?,brand),model = COALESCE(?,model),os = COALESCE(?,os),image = COALESCE(?,image),screensize = COALESCE(?,screensize) WHERE id = ?"

    var data = [req.body.brand, req.body.model, req.body.os, req.body.image, req.body.screensize, req.params.id]
    db.run(sql, data, function (err) {
        if (err) { res.status(500).end(); return; }
        else { res.status(200).json(data) }
    });
})


// Delete specific id
app.delete("/api/phones/:id", (req, res, next) => {
    db.run("DELETE FROM phones WHERE id = ?", req.params.id, function (err) {
        if (err) { res.status(500).end(); return; }
        else { res.status(200).end(); }
    });
})


//reset database
app.delete("/api/reset", (req, res, next) => {
    db.run("DELETE FROM phones", function (err) {
        if (err) { res.status(500).end(); return; }
        else {
            var sql = "INSERT INTO phones (brand, model,os,image,screensize) VALUES (?,?,?,?,?)";

            data = ["Apple", "iPhone X", "iOS", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/IPhone_X_vector.svg/440px-IPhone_X_vector.svg.png", "5"];
            db.run(sql, data, function (err) {
                if (err) { res.status(500).end(); }
                else {
                    data = ["Samsung", "Galaxy s8", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Samsung_Galaxy_S8_and_S8_Plus.png/569px-Samsung_Galaxy_S8_and_S8_Plus.png", "6"];
                    db.run(sql, data, function (err) {
                        if (err) { res.status(500).end(); return; }
                        else {
                            res.status(200);
                            res.end();
                        }
                    });
                }
            })
        }
    });
})

app.get("/api", (req, res, next) => {
    res.json({"message":"VUphone API"})
});
