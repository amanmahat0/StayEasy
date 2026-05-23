
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

// SQLite DB setup
let db;
async function initDb() {
  db = await open({
    filename: path.join(__dirname, "chat.sqlite3"),
    driver: sqlite3.Database,
  });
  await db.exec(`CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    user1_id INTEGER NOT NULL,
    user2_id INTEGER NOT NULL,
    last_message TEXT,
    updated_at TEXT
  );`);
  await db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id TEXT NOT NULL,
    sender_id INTEGER NOT NULL,
    sender_name TEXT,
    type TEXT,
    content TEXT,
    image_url TEXT,
    caption TEXT,
    timestamp TEXT
  );`);
}
initDb();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// CORS configuration for Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5174",
      process.env.FRONTEND_URL || "http://localhost:5174",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(cors());
app.use(express.json());

// Active connections tracker
const activeConnections = new Map(); // { socketId: { userId, userName, userType, propertyId, landlordId, roomId } }
const roomUsers = new Map(); // { roomId: Set(userId) }
const onlineUsers = new Map(); // { userId: { name, status, rooms: [] } }
const conversationMessages = new Map(); // { roomId: [messages] } - in-memory storage (legacy, fallback)

// REST endpoint to check server health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    activeConnections: activeConnections.size,
    onlineUsers: onlineUsers.size,
    rooms: roomUsers.size,
  });
});

// REST endpoint for image upload
app.post("/api/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "stayeasy-chat",
      resource_type: "auto",
      quality: "auto",
    });

    // Delete temporary file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    // Clean up temp file on error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting temp file:", err);
      });
    }
    res.status(500).json({ error: "Image upload failed" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  /**
   * EVENT: User/Landlord joins a chat room
   * Room format: property_{propertyId}_user_{userId}_landlord_{landlordId}
   */
  socket.on("join-room", (data) => {
    try {
      const { propertyId, userId, landlordId, userName, userType } = data;

      if (!propertyId || !userId || !landlordId) {
        socket.emit("error", {
          message: "Missing required fields: propertyId, userId, landlordId",
        });
        return;
      }

      // Create room ID based on property, user, and landlord
      const roomId = `property_${propertyId}_user_${userId}_landlord_${landlordId}`;

      // Join the room
      socket.join(roomId);

      // Track connection
      activeConnections.set(socket.id, {
        userId,
        userName,
        userType,
        propertyId,
        landlordId,
        roomId,
      });

      // Track user online status
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, {
          name: userName,
          status: "online",
          rooms: [],
        });
      }
      const userInfo = onlineUsers.get(userId);
      if (!userInfo.rooms.includes(roomId)) {
        userInfo.rooms.push(roomId);
      }

      // Track users in room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Set());
      }
      roomUsers.get(roomId).add(userId);

      // Notify room that user joined
      const onlineUsersList = Array.from(roomUsers.get(roomId) || []);
      io.to(roomId).emit("user-joined", {
        userId,
        userName,
        userType,
        timestamp: new Date().toISOString(),
        onlineUsers: onlineUsersList,
      });

      // Send confirmation to joining user
      socket.emit("room-joined", {
        roomId,
        message: `Successfully joined chat for property ${propertyId}`,
        onlineUsers: onlineUsersList,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `👤 ${userName} (${userType}) joined room: ${roomId} | Total online: ${onlineUsersList.length}`
      );
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  /**
   * EVENT: Send text message to room
   */

  socket.on("send-message", async (data) => {
    try {
      const { roomId, message, userId, userName, userType } = data;
      if (!roomId || !message || !userId) {
        socket.emit("error", {
          message: "Missing required fields: roomId, message, userId",
        });
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
      // Save to DB
      await db.run(
        `INSERT INTO messages (room_id, sender_id, sender_name, type, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
        [roomId, userId, userName, "text", message.trim(), timestamp]
      );
      // Update conversation
      await db.run(
        `INSERT OR IGNORE INTO conversations (room_id, user1_id, user2_id, last_message, updated_at) VALUES (?, ?, ?, ?, ?)` +
        ` ON CONFLICT(room_id) DO UPDATE SET last_message=excluded.last_message, updated_at=excluded.updated_at`,
        [roomId, userId, 0, message.trim(), timestamp]
      );
      // Broadcast
      io.to(roomId).emit("receive-message", messageData);
      console.log(`💬 Message in ${roomId} from ${userName}: ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error("Error in send-message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  /**
   * EVENT: Send image message to room
   */

  socket.on("send-image", async (data) => {
    try {
      const { roomId, imageUrl, userId, userName, userType, caption } = data;
      if (!roomId || !imageUrl || !userId) {
        socket.emit("error", {
          message: "Missing required fields: roomId, imageUrl, userId",
        });
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
      // Save to DB
      await db.run(
        `INSERT INTO messages (room_id, sender_id, sender_name, type, image_url, caption, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [roomId, userId, userName, "image", imageUrl, caption || "", timestamp]
      );
      // Update conversation
      await db.run(
        `INSERT OR IGNORE INTO conversations (room_id, user1_id, user2_id, last_message, updated_at) VALUES (?, ?, ?, ?, ?)` +
        ` ON CONFLICT(room_id) DO UPDATE SET last_message=excluded.last_message, updated_at=excluded.updated_at`,
        [roomId, userId, 0, "[Image]", timestamp]
      );
      // Broadcast
      io.to(roomId).emit("receive-image", messageData);
      console.log(`🖼️  Image sent in ${roomId} by ${userName} | URL: ${imageUrl.substring(0, 50)}...`);
    } catch (error) {
      console.error("Error in send-image:", error);
      socket.emit("error", { message: "Failed to send image" });
    }
  });

  /**
   * EVENT: User typing indicator
   */
  socket.on("user-typing", (data) => {
    try {
      const { roomId, userId, userName, isTyping } = data;

      io.to(roomId).emit("user-typing-indicator", {
        userId,
        userName,
        isTyping,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in user-typing:", error);
    }
  });

  /**
   * EVENT: Get online users in room
   */
  socket.on("request-online-users", (data) => {
    try {
      const { roomId } = data;
      const users = roomUsers.get(roomId);
      const onlineUsersList = users ? Array.from(users) : [];

      socket.emit("online-users-list", {
        roomId,
        onlineUsers: onlineUsersList,
        count: onlineUsersList.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in request-online-users:", error);
    }
  });

  /**
   * EVENT: Request chat history
   * Frontend can request previous messages (if stored in database)
   */

  socket.on("request-history", async (data) => {
    try {
      const { roomId, limit = 50 } = data;
      const rows = await db.all(
        `SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC LIMIT ?`,
        [roomId, limit]
      );
      socket.emit("chat-history", {
        roomId,
        messages: rows,
        count: rows.length,
        timestamp: new Date().toISOString(),
      });
      console.log(
        `📖 History requested for room: ${roomId} | Returned ${rows.length} messages`
      );
    } catch (error) {
      console.error("Error in request-history:", error);
    }
  });
// REST endpoint: get all conversations for a user
app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await db.all(
      `SELECT * FROM conversations WHERE user1_id = ? OR user2_id = ? ORDER BY updated_at DESC`,
      [userId, userId]
    );
    res.json({ conversations: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// REST endpoint: get all messages for a conversation
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const rows = await db.all(
      `SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC`,
      [roomId]
    );
    res.json({ messages: rows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

  /**
   * EVENT: Leave room
   */
  socket.on("leave-room", (data) => {
    try {
      const { roomId, userId, userName } = data;
      const connData = activeConnections.get(socket.id);

      if (connData) {
        socket.leave(roomId);

        // Remove user from room
        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(userId);
          if (roomUsers.get(roomId).size === 0) {
            roomUsers.delete(roomId);
          }
        }

        // Update user info
        if (onlineUsers.has(userId)) {
          const userInfo = onlineUsers.get(userId);
          const roomIndex = userInfo.rooms.indexOf(roomId);
          if (roomIndex > -1) {
            userInfo.rooms.splice(roomIndex, 1);
          }
          if (userInfo.rooms.length === 0) {
            onlineUsers.delete(userId);
          }
        }

        // Notify room
        const remainingUsers = roomUsers.get(roomId)
          ? Array.from(roomUsers.get(roomId))
          : [];
        io.to(roomId).emit("user-left", {
          userId,
          userName,
          timestamp: new Date().toISOString(),
          onlineUsers: remainingUsers,
        });

        console.log(
          `👋 ${userName} left room: ${roomId} | Remaining: ${remainingUsers.length}`
        );
      }
    } catch (error) {
      console.error("Error in leave-room:", error);
    }
  });

  /**
   * EVENT: Disconnect
   */
  socket.on("disconnect", () => {
    try {
      const connData = activeConnections.get(socket.id);

      if (connData) {
        const { roomId, userId, userName } = connData;

        // Remove from active connections
        activeConnections.delete(socket.id);

        // Remove from room users
        if (roomUsers.has(roomId)) {
          roomUsers.get(roomId).delete(userId);
          if (roomUsers.get(roomId).size === 0) {
            roomUsers.delete(roomId);
          }
        }

        // Update user info
        if (onlineUsers.has(userId)) {
          const userInfo = onlineUsers.get(userId);
          const roomIndex = userInfo.rooms.indexOf(roomId);
          if (roomIndex > -1) {
            userInfo.rooms.splice(roomIndex, 1);
          }
          if (userInfo.rooms.length === 0) {
            onlineUsers.delete(userId);
          }
        }

        // Notify room
        const remainingUsers = roomUsers.get(roomId)
          ? Array.from(roomUsers.get(roomId))
          : [];
        io.to(roomId).emit("user-left", {
          userId,
          userName,
          timestamp: new Date().toISOString(),
          onlineUsers: remainingUsers,
        });

        console.log(
          `❌ User disconnected: ${socket.id} (${userName}) | Active users: ${activeConnections.size}`
        );
      }
    } catch (error) {
      console.error("Error in disconnect:", error);
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Socket.IO Chat Server running on http://localhost:${PORT}`);
  console.log(`📡 Listening for connections...`);
  console.log(`📸 Image upload endpoint: POST http://localhost:${PORT}/api/upload-image`);
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5174"}\n`);
});

export { io, app };
