import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Server } from "socket.io";
import fs from "fs/promises";
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import { initializeApp } from "firebase/app";
import { initializeFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0881204837",
  appId: "1:977113091505:web:1bb33efbb02fdb389ac190",
  apiKey: "AIzaSyALlXifBvWJLAHA1NEDu499z0HvhAn0XLM",
  authDomain: "gen-lang-client-0881204837.firebaseapp.com",
  storageBucket: "gen-lang-client-0881204837.firebasestorage.app",
  messagingSenderId: "977113091505",
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, "ai-studio-611cfb5e-7db4-434e-bb94-bb1a0df7c5b3");

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

  const SCHEDULE_FILE = path.join(process.cwd(), "scheduled_letters.json");

  // Helper to run a promise with a timeout
  function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore operation timed out")), timeoutMs)
      )
    ]);
  }

  // Helper to load letters from Firestore & Local backup hybrid
  async function getScheduledLetters() {
    let firestoreList: any[] = [];
    let localList: any[] = [];

    try {
      const querySnapshot = await withTimeout(
        getDocs(collection(firestoreDb, "scheduled_letters")),
        3000
      );
      querySnapshot.forEach((doc) => {
        firestoreList.push({ id: doc.id, ...doc.data() });
      });
    } catch (e) {
      console.error("Failed to fetch scheduled letters from firestore (timed out or error):", e);
    }

    try {
      const fileContent = await fs.readFile(SCHEDULE_FILE, 'utf8');
      localList = JSON.parse(fileContent);
    } catch (fileErr) {
      // file might not exist yet, that is fine
    }

    // Merge both lists, deduplicating by ID (prioritizing Firestore data)
    const mergedMap = new Map();
    for (const letter of localList) {
      if (letter && letter.id) {
        mergedMap.set(letter.id, letter);
      }
    }
    for (const letter of firestoreList) {
      if (letter && letter.id) {
        mergedMap.set(letter.id, letter);
      }
    }

    return Array.from(mergedMap.values());
  }

  // Helper to save letters to Firestore & Local backup
  async function saveScheduledLetters(letters: any[]) {
    // 1. Always save to local backup file first
    try {
      await fs.writeFile(SCHEDULE_FILE, JSON.stringify(letters, null, 2), 'utf8');
    } catch (fileErr) {
      console.error("Failed to save scheduled letters locally:", fileErr);
    }

    // 2. Try to save to Firestore in the background
    try {
      for (const letter of letters) {
        if (!letter.id) continue;
        const docRef = doc(firestoreDb, "scheduled_letters", letter.id);
        const cleanLetter = JSON.parse(JSON.stringify(letter));
        await withTimeout(setDoc(docRef, cleanLetter, { merge: true }), 3000);
      }
    } catch (e) {
      console.error("Failed to save scheduled letters to Firestore (timed out or quota limit):", e);
    }
  }

  async function sendScheduledLetterEmail(letter: any) {
    try {
      console.log(`[Email Sending] Attempting to send letter to ${letter.to}...`);
      
      let transporter;
      if (process.env.SMTP_HOST) {
         transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? '465' : '587'), 10),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
               user: process.env.SMTP_USER,
               pass: process.env.SMTP_PASS
            },
            connectionTimeout: 8000,
            greetingTimeout: 8000,
            socketTimeout: 10000
         });
      } else {
         console.log("No custom SMTP configured. Using JSON transport logs fallback.");
         transporter = nodemailer.createTransport({
            jsonTransport: true
         });
      }

      const letterTypeHeader = letter.letterType === 'past' ? '🎒 回溯往昔 · 寄往过去的信笺' : '✉️ 时光留影 · 寄往未来的信笺';
      const bgStyle = letter.bgImage ? `background-image: url('${letter.bgImage}'); background-size: cover; background-position: center;` : `background: #FAF6F0;`;
      
      let imagesMarkup = '';
      if (letter.images && letter.images.length > 0) {
         imagesMarkup = `
           <div style="margin-top: 30px; border-top: 1px dashed #dfd6c6; padding-top: 20px;">
             <p style="font-size: 11px; font-weight: bold; color: #8c7456; text-transform: uppercase;">📷 信件附页实拍照片：</p>
             <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
               ${letter.images.map((img: string) => `
                 <div style="border-radius: 12px; overflow: hidden; border: 1px solid #dfd6c6; display: inline-block; vertical-align: top; margin: 5px;">
                   <img src="${img}" style="width: 100%; height: auto; display: block;" />
                 </div>
               `).join('')}
             </div>
           </div>
         `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .letter-content img {
              max-width: 100%;
              border-radius: 12px;
              margin: 15px 0;
              border: 1px solid rgba(223, 214, 198, 0.5);
              box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0;">
          <div style="padding: 40px 20px; font-family: sans-serif; background-color: #f5f0e6; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #dfd6c6; overflow: hidden; ${bgStyle} padding: 40px; text-align: left; box-sizing: border-box; min-height: 500px;">
              
              <div style="border-bottom: 1px dashed #dfd6c6; padding-bottom: 20px; margin-bottom: 30px;">
                <span style="font-size: 12px; font-weight: 800; color: #a78358; background: rgba(167, 131, 88, 0.1); padding: 4px 12px; border-radius: 12px;">
                  ${letterTypeHeader}
                </span>
              </div>
              
              <div style="margin-bottom: 30px;">
                <p style="font-size: 13px; font-weight: bold; color: #8c7456; margin: 0 0 5px 0;">发往：${letter.recipient || '我的心里话'}</p>
                <h2 style="font-size: 20px; font-weight: 900; color: #352a1a; margin: 5px 0 15px 0; line-height: 1.3;">${letter.subject}</h2>
                <p style="font-size: 11px; font-weight: bold; color: #a88252; margin: 0; font-family: monospace;">信笺封存时间: ${new Date(letter.createdAt).toLocaleString()} | 解封交付时间: ${new Date(letter.deliverAt).toLocaleString()}</p>
              </div>

              <div class="letter-content" style="font-size: 14px; line-height: 2.2; color: #4d4030; white-space: pre-wrap; font-family: Georgia, serif; min-height: 200px; border-left: 2px solid rgba(223, 214, 198, 0.5); padding-left: 15px; margin-bottom: 30px;">
                ${letter.content}
                ${(letter.bodyImages || []).map((img: any) => `
                  <div style="margin-top: 15px; border: 1px solid #dfd6c6; border-radius: 12px; overflow: hidden; display: inline-block;">
                    <img src="${img.src}" style="max-width: 100%; display: block;" />
                  </div>
                `).join('')}
              </div>

              ${imagesMarkup}

              <div style="border-top: 1px dashed #dfd6c6; padding-top: 25px; margin-top: 30px; text-align: center;">
                 <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #9e2a2b; display: inline-block; vertical-align: middle; margin-right: 15px;">
                   <span style="line-height: 50px; color: white; font-size: 16px; font-weight: bold;">📬</span>
                 </div>
                 <div style="display: inline-block; text-align: left; vertical-align: middle;">
                   <p style="font-size: 12px; font-weight: 800; color: #352a1a; margin: 0;">屿·记 时光邮递系统</p>
                   <p style="font-size: 10px; color: #8c7456; margin: 2px 0 0 0;">让记忆漫游，时间会给出最好的回信。</p>
                 </div>
              </div>

            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions: any = {
         from: process.env.SMTP_FROM || `"屿·记 时光邮差" <${process.env.SMTP_USER}>`,
         to: letter.to,
         subject: `[屿·记时光信笺] ${letter.subject}`,
         html: htmlContent,
         headers: {
           'Priority': 'normal',
           'X-Mailer': 'Nodemailer'
         }
      };

      const attachments: any[] = [];
      
      if (letter.files && letter.files.length > 0) {
        // Base64 file attachments
        letter.files.forEach((f: any) => {
          if (f.url && typeof f.url === 'string' && f.url.includes('base64,')) {
            const b64 = f.url.split('base64,')[1];
            attachments.push({ filename: f.name, content: b64, encoding: 'base64' });
          }
        });
      }

      if (attachments.length > 0) {
         mailOptions.attachments = attachments;
      }

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Sent Success] Sent mail successfully to ${letter.to}. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[Email Sending Failed] Error occurred while sending to ${letter.to}:`, err);
      return false;
    }
  }

  app.get('/api/check-scheduled-letters', async (req, res) => {
    try {
      const letters = await getScheduledLetters();
      const now = Date.now();
      let updated = false;
      let sentCount = 0;
      for (const letter of letters) {
        const isEligible = letter.status === "pending" || 
                           (letter.status === "failed" && (letter.failedAttempts || 0) < 3);
        if (isEligible) {
          let deliveryTime = 0;
          let deliverStr = letter.deliverAt;
          if (!deliverStr.includes('Z') && !deliverStr.match(/[+-]\d{2}:\d{2}$/)) {
            deliverStr = deliverStr.replace(' ', 'T') + '+08:00';
          }
          deliveryTime = new Date(deliverStr).getTime();

          if (deliveryTime <= now) {
            const ok = await sendScheduledLetterEmail(letter);
            if (ok) {
              letter.status = "submitted";
              letter.sentTimestamp = new Date().toISOString();
              sentCount++;
            } else {
              letter.failedAttempts = (letter.failedAttempts || 0) + 1;
              letter.status = letter.failedAttempts >= 3 ? "failed_permanent" : "failed";
            }
            updated = true;
          }
        }
      }
      if (updated) {
        await saveScheduledLetters(letters);
      }
      res.json({ success: true, checked: true, sentCount });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Active loop checker (runs every 15 seconds)
  setInterval(async () => {
    try {
      const letters = await getScheduledLetters();
      const now = Date.now();
      let updated = false;
      for (const letter of letters) {
        const isEligible = letter.status === "pending" || 
                           (letter.status === "failed" && (letter.failedAttempts || 0) < 3);
        if (isEligible) {
          let deliveryTime = 0;
          let deliverStr = letter.deliverAt;
          // If the date string doesn't include timezone information, assume Beijing Time (UTC+8)
          if (!deliverStr.includes('Z') && !deliverStr.match(/[+-]\d{2}:\d{2}$/)) {
            deliverStr = deliverStr.replace(' ', 'T') + '+08:00';
          }
          deliveryTime = new Date(deliverStr).getTime();

          if (deliveryTime <= now) {
            const ok = await sendScheduledLetterEmail(letter);
            if (ok) {
              letter.status = "submitted";
              letter.sentTimestamp = new Date().toISOString();
            } else {
              letter.failedAttempts = (letter.failedAttempts || 0) + 1;
              letter.status = letter.failedAttempts >= 3 ? "failed_permanent" : "failed";
            }
            updated = true;
          }
        }
      }
      if (updated) {
        await saveScheduledLetters(letters);
      }
    } catch (e) {
      console.error('Scheduler task iteration failed:', e);
    }
  }, 15000);

  app.post('/api/test-email', async (req, res) => {
    try {
      const { to } = req.body;
      if (!process.env.SMTP_HOST) {
        return res.json({ success: false, error: 'No SMTP_HOST configured in secrets.' });
      }
       const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '465', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
             user: process.env.SMTP_USER,
             pass: process.env.SMTP_PASS
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 10000
       });
      const mailOptions = {
         from: process.env.SMTP_FROM || process.env.SMTP_USER,
         to: to || process.env.SMTP_USER,
         subject: 'Test Email from AI Studio',
         text: 'If you receive this, your email configuration is working.'
      };
      const info = await transporter.sendMail(mailOptions);
      res.json({ success: true, messageId: info.messageId });
    } catch (err: any) {
      console.error("Test email error:", err);
      res.json({ success: false, error: err.message, stack: err.stack, config: { host: process.env.SMTP_HOST, user: process.env.SMTP_USER, port: process.env.SMTP_PORT } });
    }
  });

  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, content, scheduleTime, type, images, bodyImages, bgImage, createdAt, recipient, files } = req.body;
      
      if (!to || !to.includes('@')) {
         return res.status(400).json({ error: 'Invalid email address' });
      }

      const letters = await getScheduledLetters();
      const newEntry = {
        id: 'sk-letter-' + Date.now(),
        to,
        subject,
        content,
        deliverAt: scheduleTime,
        createdAt: createdAt || new Date().toISOString().split('T')[0],
        letterType: type || 'future',
        images: images || [],
        bodyImages: bodyImages || [],
        bgImage: bgImage || '',
        recipient: recipient || '收件人',
        files: files || [],
        status: 'pending'
      };

      letters.push(newEntry);
      await saveScheduledLetters(letters);

      // Send an immediate confirmation email so the user knows SMTP is working
      if (process.env.SMTP_HOST) {
         try {
           const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST,
              port: parseInt(process.env.SMTP_PORT || (process.env.SMTP_SECURE === 'true' ? '465' : '587'), 10),
              secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
              auth: {
                 user: process.env.SMTP_USER,
                 pass: process.env.SMTP_PASS
              },
               connectionTimeout: 8000,
               greetingTimeout: 8000,
               socketTimeout: 10000
            });
           const confirmOptions = {
              from: process.env.SMTP_FROM || `"屿·记 时光邮差" <${process.env.SMTP_USER}>`,
              to: to,
              subject: `[屿·记] 信笺封存确认: ${subject}`,
              html: `<div style="padding: 30px; font-family: sans-serif; background-color: #f5f0e6; text-align: center; border-radius: 12px; border: 1px solid #dfd6c6;">
                       <h2 style="color: #352a1a;">信笺已成功封存 📬</h2>
                       <p style="color: #4d4030; font-size: 14px;">您的信笺 <b>${subject}</b> 已妥善交由时光邮差保管。</p>
                       <p style="color: #a88252; font-size: 12px; margin-top: 20px;">这封信将于 <b>${scheduleTime}</b> 准确送达您的邮箱。</p>
                     </div>`
           };
           transporter.sendMail(confirmOptions).catch(e => console.error('Confirmation email failed:', e));
         } catch (e) {
           console.error('Failed to init transporter for confirmation:', e);
         }
      }

      return res.json({ success: true, message: "Email scheduled & stored successfully", letterId: newEntry.id });
    } catch (e) {
      console.error('Email error:', e);
      res.status(500).json({ error: 'Failed to schedule email' });
    }
  });

  app.get('/api/link-preview', async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) return res.status(400).send('No URL provided');
      
      let meta = {
        title: "",
        artist: "",
        author: "",
        cover: "",
        description: "",
      };

      // Specific parsing for Netease Music
      if (targetUrl.includes('music.163.com')) {
        let songId = new URL(targetUrl).searchParams.get('id');
        if (!songId) {
          const match = targetUrl.match(/song\/(\d+)/) || targetUrl.match(/song\?id=(\d+)/);
          if (match) songId = match[1];
        }
        
        if (songId) {
          const response = await fetch(`https://music.163.com/api/song/detail/?id=${songId}&ids=[${songId}]`);
          const data = await response.json() as any;
          if (data && data.songs && data.songs.length > 0) {
            const song = data.songs[0];
            meta.title = song.name;
            meta.artist = song.artists.map((a: any) => a.name).join(', ');
            meta.cover = song.album?.picUrl;
            return res.json(meta);
          }
        }
      }

      // Specific parsing for Xiaohongshu and general OG tags
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        }
      });
      const html = await response.text();
      const $ = cheerio.load(html);

      meta.title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      meta.description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
      meta.cover = $('meta[property="og:image"]').attr('content') || $('link[rel="image_src"]').attr('href') || '';
      meta.author = $('meta[property="og:author"]').attr('content') || $('meta[name="author"]').attr('content') || '';

      if (targetUrl.includes('xiaohongshu.com')) {
          const titleTag = $('title').text();
          if (titleTag && !meta.title) meta.title = titleTag;
      }

      res.json(meta);
    } catch (err) {
      console.error('Preview error:', err);
      res.status(500).send('Error generating preview');
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
