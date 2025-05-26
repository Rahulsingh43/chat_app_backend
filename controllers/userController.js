const db = require('../config/db');

const getAllUsersExceptMe = async (req, res) => {
  const currentUser = req.user.userName;

  try {
    const [users] = await db.query(
      'SELECT * FROM users WHERE userName != ?',
      [currentUser]
    );

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// controllers/messageController.js
const sendMessage = async (req, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user.id;

  const [result] = await db.query(
    'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    [sender_id, receiver_id, content]
  );

  const [[message]] = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
  res.json(message);
};

module.exports = { getAllUsersExceptMe, sendMessage };
