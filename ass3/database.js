var sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

// Initialize DB
let db = new sqlite3.Database(DBSOURCE, (err) => {
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

module.exports = db;
