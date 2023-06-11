const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "Posts_app",
});
const validateToken = require("../middlewares/AuthMiddleware");

const router = express.Router();

// router.get('/', async (req, res) => {
//   try {
//     const sqlFetch = 'SELECT * FROM Posts;';
//     const result = await queryAsync(sqlFetch);
//     res.send(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json('Internal Server Error');
//   }
// });
router.get("/:username", async (req, res) => {
  try {
    const userName = req.params.username;

    const sqlFetch = `
      SELECT Posts.*, COUNT(Likes.Post_ID) AS likes_count
      FROM Posts
      LEFT JOIN Likes ON Posts.id = Likes.Post_ID
      WHERE Posts.username = ?
      GROUP BY Posts.id;
    `;

    const result = await queryAsync(sqlFetch, [userName]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.get("/", async (req, res) => {
  try {
    const sqlFetch = `
      SELECT Posts.*, COUNT(Likes.Post_ID) AS likes_count
      FROM Posts
      LEFT JOIN Likes ON Posts.id = Likes.Post_ID
      GROUP BY Posts.id;
    `;

    const result = await queryAsync(sqlFetch);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/", validateToken, async (req, res) => {
  try {
    // const { title, postText, username } = req.body;
    // console.log(req.body);
    const title = req.body.title;
    const postText = req.body.postText;
    const username = req.body.Username;
    const sqlInsert =
      "INSERT INTO Posts (title, postText, username) VALUES (?, ?, ?);";
    await queryAsync(sqlInsert, [title, postText, username]);
    const sqlFetch = "SELECT * FROM Posts;";
    const result = await queryAsync(sqlFetch);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

router.post("/post", async (req, res) => {
  try {
    const { id } = req.body;
    const sqlFetch = `
      SELECT Posts.*, COUNT(Likes.Post_ID) AS likes_count
      FROM Posts
      LEFT JOIN Likes ON Posts.id = Likes.Post_ID
      WHERE Posts.id = ?
      GROUP BY Posts.id;
    `;
    const result = await queryAsync(sqlFetch, [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});

router.put("/:postID/title", validateToken, async (req, res) => {
  try {
    const Pid = req.params.postID;
    const newTitle = req.body.title;
    const sqlUpdate = "update Posts set title=? where id=?";

    const result = await queryAsync(sqlUpdate, [newTitle, Pid]);
    res.send({ message: "Post Content Updated!" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
});
router.put("/:postID/content", validateToken, async (req, res) => {
  try {
    const Pid = req.params.postID;
    const newContent = req.body.content;
    const sqlUpdate = "update Posts set postText=? where id=?";

    const result = await queryAsync(sqlUpdate, [newContent, Pid]);
    res.send({ message: "Post Content Updated!" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }

  // db.query(sqlUpdate,[newContent,Pid],(err,result)=>{
  //   if(err)
  //   {
  //     console.log(err);
  //   }
  //   else
  //   {
  //   }
  // })
});
router.delete("/:postID", validateToken, async (req, res) => {
  try {
    const Pid = req.params.postID;

    const sqlDelete = "delete from Posts where id=?";

    const result = await queryAsync(sqlDelete, [Pid]);
    res.send({ message: "Post Deleted!!" });
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
