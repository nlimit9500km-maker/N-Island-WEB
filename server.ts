import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Server } from "socket.io";
import fs from "fs/promises";

const DATA_FILE = path.join(process.cwd(), "data.json");

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { momentsLikes: [], momentsComments: [] };
  }
}

async function saveData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/playlist", async (req, res) => {
    try {
      const response = await fetch("https://music.163.com/api/playlist/detail?id=6607728164", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://music.163.com/"
        }
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Failed to fetch playlist: Expected JSON, got", contentType, text);
        return res.status(500).json({ error: "Failed to fetch playlist: Expected JSON", details: text });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching playlist:", error);
      res.status(500).json({ error: String(error) });
    }
  });

  app.get("/api/lyric", async (req, res) => {
    try {
      const id = req.query.id;
      const response = await fetch(`https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": "https://music.163.com/"
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  let appData = await loadData();

  io.on("connection", (socket) => {
    // Send initial state to the connected client
    socket.emit("init_data", appData);

    socket.on("update_likes", async (likes) => {
      appData.momentsLikes = likes;
      await saveData(appData);
      socket.broadcast.emit("likes_updated", likes);
    });

    socket.on("update_comments", async (comments) => {
      appData.momentsComments = comments;
      await saveData(appData);
      socket.broadcast.emit("comments_updated", comments);
    });
  });
}

startServer();
