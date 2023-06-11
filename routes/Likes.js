const express = require("express");
const cors = require("cors");
const router = express.Router();
const validateToken = require("../middlewares/AuthMiddleware");
const mysql = require("mysql");
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Posts_app",
});

router.post("/", validateToken, async (req, res) => {
    try {
      const User_ID = req.body.id;
      const Post_ID = req.body.Post_ID;
      const sqlCheck = "SELECT * FROM Likes WHERE Post_ID = ? AND User_ID = ?";
      
      const result = await queryAsync(sqlCheck, [Post_ID, User_ID]);
  
      if (result.length === 0) {
        const sqlInsert = "INSERT INTO Likes (Post_ID, User_ID) VALUES (?, ?)";
        await queryAsync(sqlInsert, [Post_ID, User_ID]);
        res.json({liked:true});
      } else {
        const sqlDelete = "DELETE FROM Likes WHERE Post_ID = ? AND User_ID = ?";
        await queryAsync(sqlDelete, [Post_ID, User_ID]);
        res.json({liked:false});
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal Server Error");
    }
  });
  
  // Helper function to promisify the db.query method
  function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
      db.query(sql, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
  
module.exports = router;
