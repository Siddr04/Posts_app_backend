const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt-updated");
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Posts_app",
});

const { sign } = require("jsonwebtoken");
const validateToken = require("../middlewares/AuthMiddleware");
const router = express.Router();

router.post("/registration", async (req, res) => {
  const Username = req.body.username;
  const password = req.body.password;
  const sqlFetch = "select * from Users where username=?";
  db.query(sqlFetch, [Username], async (err, result) => {
    if (err) {
      console.log(err);
      res.send({ error: "Internal Server Error" });
    } else if (result.length !== 0) {
      res.send({ error: "Username already exists , please choose a new one " });
    } else {
      let hashedPassword = await bcrypt.hash(password, 8);
      const sqlInsert = "Insert into Users (username,password) values (?,?);";
      db.query(sqlInsert, [Username, hashedPassword], (err, result) => {
        if (err) {
          console.log(err);
          res.send({ error: "Internal Server Error" });
        }
        res.send({
          message:
            "Registerd successfully , please login with your credentials",
        });
      });
    }
  });
});

router.post("/login", async (req, res) => {
  const Username = req.body.Username;
  const password = req.body.Password;
  const sqlfetch = "Select password,Uid from Users where username= ?;";
  db.query(sqlfetch, [Username], async (err, result) => {
    if (
      result.length === 0 ||
      !(await bcrypt.compare(password, result[0].password))
    ) {
      res.json({ error: "Incorrect User name or password!!" });
    } else {
      const accessToken = sign(
        { username: Username, id: result[0].Uid },
        "UseraccessToken"
      );

      res.json({ token: accessToken, username: Username, id: result[0].Uid });
    }
  });
});
router.put("/changePassword", validateToken, async (req, res) => {
  const oldpassWord = req.body.oldpassWord;
  const newpassWord = req.body.newpassWord;
  const userName = req.body.Username;
  const sqlfetch = "Select password from Users where username= ?;";

  db.query(sqlfetch, [userName], async (err, result) => {
    // console.log(result);
    if (
      result.length === 0 ||
      !(await bcrypt.compare(oldpassWord, result[0].password))
    ) {
      res.json({ error: "Incorrect old password!!" });
    } else {
      let hashedPassword = await bcrypt.hash(newpassWord, 8);
      const sqlUpdate = "update Users set password=? where username=?";
      db.query(sqlUpdate, [hashedPassword, userName], (err, result) => {
        if (err) {
          res.send({ error: "Internal Server error! Dont worry :)" });
        } else {
          res.send({ message: "Password updated successfully!" });
        }
      });
    }
  });
});
router.put("/changeUsername", validateToken, (req, res) => {
  const newUserName = req.body.newUsername;
  const userId = req.body.id;
  const sqlUpdate = "update Users set username=? where Uid=?";
  db.query(sqlUpdate, [newUserName, userId], (err, result) => {
    if (err) {
      console.log(err);
      res.send({ error: "Internal server error ! Don't Worry :)" });
    } else {
      res.send({
        message:
          "Username updated successfully ! Please login again to see the changes :)",
      });
    }
  });
});
router.get("/auth", validateToken, (req, res) => {
  res.json(req.body);
});

module.exports = router;
