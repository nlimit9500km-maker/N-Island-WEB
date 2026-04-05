import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Server } from "socket.io";
import fs from "fs/promises";

const DATA_FILE = path.join(process.cwd(), "data.json");

async function loadData() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(data);
    return {
      momentsLikes: parsed.momentsLikes || [],
      momentsComments: parsed.momentsComments || [],
      thoughtsLikes: parsed.thoughtsLikes || [],
      thoughtsComments: parsed.thoughtsComments || [],
      reviews: parsed.reviews || [],
      photoesLikes: parsed.photoesLikes || {}
    };
  } catch (e) {
    return { 
      momentsLikes: [], 
      momentsComments: [],
      thoughtsLikes: [],
      thoughtsComments: [],
      reviews: [],
      photoesLikes: {}
    };
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

  app.use(express.json({ limit: '50mb' }));
  
  const sharedDir = path.join(process.cwd(), 'shared');
  fs.mkdir(sharedDir, { recursive: true }).catch(console.error);
  app.use('/shared', express.static(sharedDir));

  app.get('/api/proxy-image', async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) return res.status(400).send('No url provided');
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
      res.set('Access-Control-Allow-Origin', '*');
      res.send(Buffer.from(buffer));
    } catch (err) {
      console.error('Proxy error:', err);
      res.status(500).send('Error proxying image');
    }
  });

  app.post('/api/share-image', async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: 'No image provided' });

      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      const filename = `share_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const filepath = path.join(sharedDir, filename);

      await fs.writeFile(filepath, base64Data, 'base64');

      // Return relative URL so frontend can construct the correct full URL
      res.json({ url: `/shared/${filename}` });
    } catch (err) {
      console.error('Error saving shared image:', err);
      res.status(500).json({ error: 'Failed to save image' });
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

    socket.on("request_init_data", () => {
      socket.emit("init_data", appData);
    });

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

    socket.on("update_thoughts_likes", async (likes) => {
      appData.thoughtsLikes = likes;
      await saveData(appData);
      socket.broadcast.emit("thoughts_likes_updated", likes);
    });

    socket.on("update_thoughts_comments", async (comments) => {
      appData.thoughtsComments = comments;
      await saveData(appData);
      socket.broadcast.emit("thoughts_comments_updated", comments);
    });

    socket.on("update_reviews", async (reviews) => {
      appData.reviews = reviews;
      await saveData(appData);
      socket.broadcast.emit("reviews_updated", reviews);
    });

    socket.on("update_photoes_likes", async (photoesLikes) => {
      appData.photoesLikes = photoesLikes;
      await saveData(appData);
      socket.broadcast.emit("photoes_likes_updated", photoesLikes);
    });

    socket.on("toggle_photo_like", async ({ photoId, signature }) => {
      if (!appData.photoesLikes) appData.photoesLikes = {};
      if (!appData.photoesLikes[photoId]) appData.photoesLikes[photoId] = [];
      
      const likes = appData.photoesLikes[photoId];
      if (likes.includes(signature)) {
        appData.photoesLikes[photoId] = likes.filter((sig: string) => sig !== signature);
      } else {
        appData.photoesLikes[photoId].push(signature);
      }
      
      await saveData(appData);
      // Emit to ALL clients (including sender) to ensure perfect sync
      io.emit("photoes_likes_updated", appData.photoesLikes);
    });
  });
}

startServer();
