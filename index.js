const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoute');
const bodyParser = require('body-parser');
const helper = require('./Helper/Helper');
const db = require('./config/db');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: '*' },
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// Socket.IO handling
const onlineUsers = {}; // Map of userName -> socket.id
io.on('connection', async (socket) => {
  // console.log(socket.id,'socekt connected');
  
  // console.log('User connected:', socket.handshake.auth,'===========================???????????????');
  const user = await helper.getUserFromToken(socket.handshake.auth.token);
  
  socket.on("user_connected", async ({ currentUser, withUser }) => {
    // console.log(currentUser,withUser,'=======>>>>>>>>>');
    
    onlineUsers[user.userName] = socket.id;
    socket.userName = user.userName;
    console.log(onlineUsers,'onlineeeuserrr');

    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY timestamp ASC`,
      [currentUser, withUser, withUser, currentUser]
    );

    io.to(socket.id).emit("message_history", messages);
    
  });

  socket.on("typing", ({ to, from,isUserTyping }) => {
    // console.log(to,from,'frommmmmmmmmmtottoooooooo');
    const toSocket = onlineUsers[to];
    
    if (toSocket) io.to(toSocket).emit("typing", {from:from,isUserTyping:isUserTyping});
  });

  socket.on("send_message", async (msg) => {
    const { sender_id, receiver_id, content } = msg;

    const [result] = await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [sender_id, receiver_id, content]
    );

    const message = {
      id: result.insertId,
      sender_id,
      receiver_id,
      content,
      timestamp: new Date(),
      is_read: false,
      is_delivered: false,
    };

    const toSocket = onlineUsers[receiver_id];
    if (toSocket) {
      io.to(toSocket).emit("receive_message", message);
      message.is_delivered = true;
      await db.query("UPDATE messages SET is_delivered = 1 WHERE id = ?", [message.id]);
    }

    io.to(socket.id).emit("message_sent", message);
  });

  // Receiver reads the message
  socket.on("mark_as_read", async (msgId) => {
    await db.query("UPDATE messages SET is_read = 1 WHERE id = ?", [msgId]);
    io.to(socket.id).emit("message_read", msgId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on portss ${PORT}`);
  console.log(`Db HOST: ${process.env.DB_HOST} NAME: ${process.env.DB_NAME} USER: ${process.env.DB_USER} pass: ${process.env.DB_PASSWORD}`);
});
