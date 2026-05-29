import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

let db;
async function initDb() {
  db = await open({
    filename: path.join(__dirname, "chat.sqlite3"),
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL UNIQUE,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    last_message TEXT,
    last_sender TEXT,
    updated_at TEXT
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    sender_id INTEGER NOT NULL,
    sender_name TEXT,
    type TEXT DEFAULT 'text',
    content TEXT,
    image_url TEXT,
    caption TEXT,
    timestamp TEXT
  );`);
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);`);
}
initDb();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5174",
      process.env.FRONTEND_URL || "http://localhost:5174",
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

app.use(cors());
app.use(express.json());

const activeConnections = new Map();
const roomUsers = new Map();
const onlineUsers = new Map();
const roomReceivers = new Map(); // roomId -> receiverUserId (set by the first participant to join)

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    activeConnections: activeConnections.size,
    onlineUsers: onlineUsers.size,
    rooms: roomUsers.size,
  });
});

app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stayeasy-chat",
      resource_type: "auto",
      quality: "auto",
    });
    fs.unlink(req.file.path, () => {});
    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: "Image upload failed" });
  }
});

app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db.all(
      `SELECT * FROM conversations WHERE user1_id = ? OR user2_id = ? ORDER BY updated_at DESC`,
      [Number(userId), Number(userId)]
    );
    res.json({ conversations: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const rows = await db.all(
      `SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC`,
      [req.params.roomId]
    );
    res.json({ messages: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", (data) => {
    try {
      const { roomId, userId, userName, userType, receiverUserId } = data;

      if (!roomId || !userId) {
        socket.emit("error", { message: "Missing required fields: roomId, userId" });
        return;
      }

      socket.join(roomId);

      activeConnections.set(socket.id, { userId, userName, userType, roomId });

      // Store the receiver's User ID for this room so notifications work
      // even if the receiver hasn't joined yet
      if (receiverUserId && !roomReceivers.has(roomId)) {
        roomReceivers.set(roomId, receiverUserId);
      }

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, { name: userName, status: "online", rooms: [] });
      }
      const userInfo = onlineUsers.get(userId);
      if (!userInfo.rooms.includes(roomId)) {
        userInfo.rooms.push(roomId);
      }

      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(userId);

      const onlineUsersList = Array.from(roomUsers.get(roomId) || []);
      io.to(roomId).emit("user-joined", {
        userId, userName, userType,
        timestamp: new Date().toISOString(),
        onlineUsers: onlineUsersList,
      });

      socket.emit("room-joined", {
        roomId,
        message: "Successfully joined chat room",
        onlineUsers: onlineUsersList,
      });

      console.log(`${userName} (${userType}) joined room: ${roomId}`);
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("join-user-room", (data) => {
    try {
      const { userId } = data;
      if (!userId) return;
      socket.join(`user_${userId}`);
    } catch (error) {
      console.error("Error in join-user-room:", error);
    }
  });

  socket.on("send-message", async (data) => {
    try {
      const { roomId, message, userId, userName, userType, receiverUserId } = data;
      if (!roomId || !message?.trim() || !userId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const messageData = {
        id: msgId,
        roomId,
        userId,
        userName,
        userType,
        message: message.trim(),
        timestamp,
        type: "text",
      };

      try {
        await db.run(
          `INSERT INTO messages (room_id, sender_id, sender_name, type, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
          [roomId, userId, userName, "text", message.trim(), timestamp]
        );
        const roomParticipants = Array.from(roomUsers.get(roomId) || []);
        const otherFromRoom = roomParticipants.find((id) => id !== userId) || 0;
        const receiverId = receiverUserId || roomReceivers.get(roomId) || otherFromRoom || 0;
        await db.run(
          `INSERT INTO conversations (room_id, user1_id, user2_id, last_message, last_sender, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(room_id) DO UPDATE SET last_message=excluded.last_message, last_sender=excluded.last_sender, updated_at=excluded.updated_at`,
          [roomId, userId, receiverId, message.trim(), userName, timestamp]
        );
      } catch (dbErr) {
        console.error("DB error:", dbErr);
      }

      io.to(roomId).emit("receive-message", messageData);
      const notifyUserId = receiverId;
      if (notifyUserId) {
        io.to(`user_${notifyUserId}`).emit("new-notification", messageData);
      }
    } catch (error) {
      console.error("Error in send-message:", error);
    }
  });

  socket.on("send-image", async (data) => {
    try {
      const { roomId, imageUrl, userId, userName, userType, caption, receiverUserId } = data;
      if (!roomId || !imageUrl || !userId) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      const msgId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      const messageData = {
        id: msgId,
        roomId,
        userId,
        userName,
        userType,
        imageUrl,
        caption: caption || "",
        timestamp,
        type: "image",
      };

      try {
        await db.run(
          `INSERT INTO messages (room_id, sender_id, sender_name, type, image_url, caption, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [roomId, userId, userName, "image", imageUrl, caption || "", timestamp]
        );
        await db.run(
          `INSERT INTO conversations (room_id, user1_id, user2_id, last_message, last_sender, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(room_id) DO UPDATE SET last_message=excluded.last_message, last_sender=excluded.last_sender, updated_at=excluded.updated_at`,
          [roomId, userId, receiverUserId || 0, "[Image]", userName, timestamp]
        );
      } catch (dbErr) {
        console.error("DB error:", dbErr);
      }

      io.to(roomId).emit("receive-image", messageData);
      io.to(roomId).emit("receive-message", messageData);
      if (receiverUserId) {
        io.to(`user_${receiverUserId}`).emit("new-notification", messageData);
      }
    } catch (error) {
      console.error("Error in send-image:", error);
    }
  });

  socket.on("user-typing", (data) => {
    try {
      const { roomId, userId, userName, isTyping } = data;
      io.to(roomId).emit("user-typing-indicator", { userId, userName, isTyping });
    } catch (error) {
      console.error("Error in user-typing:", error);
    }
  });

  socket.on("request-online-users", (data) => {
    try {
      const { roomId } = data;
      const users = roomUsers.get(roomId);
      const onlineUsersList = users ? Array.from(users) : [];
      socket.emit("online-users-list", { roomId, onlineUsers: onlineUsersList, count: onlineUsersList.length });
    } catch (error) {
      console.error("Error in request-online-users:", error);
    }
  });

  socket.on("request-history", async (data) => {
    try {
      const { roomId, limit = 50 } = data;
      const rows = await db.all(
        `SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC LIMIT ?`,
        [roomId, limit]
      );
      socket.emit("chat-history", { roomId, messages: rows, count: rows.length });
    } catch (error) {
      console.error("Error in request-history:", error);
    }
  });

  socket.on("leave-room", (data) => {
    try {
      const { roomId, userId, userName } = data;

      socket.leave(roomId);

      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId).delete(userId);
        if (roomUsers.get(roomId).size === 0) {
          roomUsers.delete(roomId);
          roomReceivers.delete(roomId);
        }
      }

      if (onlineUsers.has(userId)) {
        const userInfo = onlineUsers.get(userId);
        const idx = userInfo.rooms.indexOf(roomId);
        if (idx > -1) userInfo.rooms.splice(idx, 1);
        if (userInfo.rooms.length === 0) onlineUsers.delete(userId);
      }

      const remaining = roomUsers.get(roomId) ? Array.from(roomUsers.get(roomId)) : [];
      io.to(roomId).emit("user-left", { userId, userName, timestamp: new Date().toISOString(), onlineUsers: remaining });
    } catch (error) {
      console.error("Error in leave-room:", error);
    }
  });

  socket.on("disconnect", () => {
    try {
      const connData = activeConnections.get(socket.id);
      if (connData) {
        const { roomId, userId, userName } = connData;
        activeConnections.delete(socket.id);

        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(userId);
          if (roomUsers.get(roomId).size === 0) roomUsers.delete(roomId);
        }
        if (onlineUsers.has(userId)) {
          const userInfo = onlineUsers.get(userId);
          const idx = userInfo.rooms.indexOf(roomId);
          if (idx > -1) userInfo.rooms.splice(idx, 1);
          if (userInfo.rooms.length === 0) onlineUsers.delete(userId);
        }
        const remaining = roomUsers.get(roomId) ? Array.from(roomUsers.get(roomId)) : [];
        io.to(roomId).emit("user-left", { userId, userName, timestamp: new Date().toISOString(), onlineUsers: remaining });
      }
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
  });

  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n Socket.IO Chat Server running on http://localhost:${PORT}`);
  console.log(` Image upload: POST http://localhost:${PORT}/api/upload-image`);
});
