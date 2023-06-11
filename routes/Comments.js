const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Posts_app'
});
const validateToken = require('../middlewares/AuthMiddleware');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { id } = req.body;
    const sqlFetch = 'SELECT * FROM Comments WHERE Pid = ?';
    const result = await queryAsync(sqlFetch, [id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
});

router.post('/new', validateToken, async (req, res) => {
  try {
    const { commentBody, Pid, Username } = req.body;
    const sqlInsert = 'INSERT INTO Comments (Pid, commentBody, Username) VALUES (?, ?, ?);';
    await queryAsync(sqlInsert, [Pid.id, commentBody, Username]);
    const sqlFetch = 'SELECT * FROM Comments WHERE Pid = ?';
    const result = await queryAsync(sqlFetch, [Pid.id]);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
});

router.put('/edit', validateToken, async (req, res) => {
  try {
    const commentID = req.body.commentid;
    const newComment = req.body.new_comment;
    const sqlUpdate = 'UPDATE Comments SET commentBody = ? WHERE Cid = ?';
    await queryAsync(sqlUpdate, [newComment, commentID]);
    res.send({ message: 'Comment Edited Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
  }
});

router.delete('/:postID/:commentID', validateToken, async (req, res) => {
  try {
    const commentID = req.params.commentID;
    const sqlDelete = 'DELETE FROM Comments WHERE Cid = ?';
    await queryAsync(sqlDelete, [commentID]);
    res.send({ message: 'Comment Deleted!' });
  } catch (error) {
    console.log(error);
    res.status(500).json('Internal Server Error');
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
