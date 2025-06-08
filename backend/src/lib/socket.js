import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
  },
});

//* for real-time messaging
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  //* Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle incoming messages with mentions
  socket.on("sendMessage", (messageData) => {
    const { senderId, message, mentionedUsers } = messageData;

    // Notify all users about the new message
    io.emit("newMessage", { senderId, message });

    // Check if any users are mentioned
    if (mentionedUsers && mentionedUsers.length > 0) {
      mentionedUsers.forEach((mentionedUser) => {
        // Find the socket ID of the mentioned user
        const receiverSocketId = getReceiverSocketId(mentionedUser);
        if (receiverSocketId) {
          // Notify the mentioned user with the message
          io.to(receiverSocketId).emit("mentionNotification", {
            senderId,
            message,
          });
        }
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
