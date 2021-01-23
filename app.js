const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const queryString = require("query-string");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//listen on environment port or 5000
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});

//MySQL
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "password",
  database: "nodejs_example",
});
// /beer/?name=Buzz
const queryBuilder = (req) => {
  console.log(`queryBuilder= `);
  let queryArr = Object.values(req.query);
  let queryString = "";
  if (queryArr.length === 1) {
    queryString = `SELECT * from beers WHERE ${Object.keys(req.query)[0]} = ?`;
  }
  if (queryArr.length > 1) {
    // queryString = `SELECT * from beers WHERE ${Object.keys(req.query)[0]} = ?`;
    queryArr.forEach((value, index) => {
      console.log(`value= ${value}`);
      if (index === 0)
        queryString = `SELECT * from beers WHERE ${
          Object.keys(req.query)[0]
        } = ?`;
      if (index > 0)
        queryString = queryString + ` AND ${Object.keys(req.query)[index]} = ?`;
    });
  }

  return { queryString, queryArr };
};

app.get("/beer", (req, res) => {
  console.log(`query= `);
  pool.getConnection((err, connection) => {
    if (err) throw err;
    let queryString = "";
    let queryArr = [];

    if (Object.values(req.query).length === 0) {
      console.log("inside Object.values(req.query)=", Object.values(req.query));
      queryString = `SELECT * from beers`;
      connection.query(queryString, (err, rows) => {
        if (!err) {
          res.send(rows);
        } else {
          console.log(err);
        }
      });
    } else {
      queryString = queryBuilder(req).queryString;
      queryArr = queryBuilder(req).queryArr;
    }
    console.log(queryString);
    console.log(queryArr);

    connection.query(queryString, [...queryArr], (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});
//get all beers
app.get("/", (req, res) => {
  pool.getConnection((err, connection) => {
    // console.log(connection);
    // console.log(typeof connection);

    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    //qury(sqlString, callback)
    connection.query("SELECT * from beers", (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});
//get a beer by id
app.get("/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    //qury(sqlString, callback)
    const id = req.params.id;
    connection.query("SELECT * from beers WHERE id = ?", [id], (err, rows) => {
      if (!err) {
        res.send(rows);
      } else {
        console.log(err);
      }
    });
  });
});

//delete a record  / beer
app.delete("/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    //qury(sqlString, callback)
    const id = req.params.id;
    connection.query("DELETE from beers WHERE id = ?", [id], (err, rows) => {
      if (!err) {
        res.send(`Beer with id: ${id} has been deleted`);
      } else {
        console.log(err);
      }
    });
  });
});
//post a records  / beer
app.post("", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const params = req.body;
    connection.query("INSERT INTO beers SET ?", params, (err, rows) => {
      if (!err) {
        res.send(`Beer with id: ${params.name} has been added`);
      } else {
        console.log(err);
      }
    });
  });
});
//update a records  / beer
app.put("", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);

    const { id, name, tagline, desription, image } = req.body;

    if (!id || !name || !tagline || !desription || !image)
      return res.send(`some of the parameters for updating is missing`);

    connection.query(
      "UPDATE beers SET name = ? tagline = ? desription = ? image = ? WHERE id = ?",
      [name, tagline, id],
      (err, rows) => {
        if (!err) {
          res.send(`Beer with id: ${id} has been updated`);
        } else {
          console.log(err);
        }
      }
    );
  });
});
