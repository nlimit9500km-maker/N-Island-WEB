import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Server } from "socket.io";
import fs from "fs/promises";
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
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
      console.warn("Firestore fetch temporarily unavailable (timed out or quota limit). Falling back to local cache.");
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

  // Memory-based lock to prevent concurrent duplicate sending of the same letter
  const sendingLetterIds = new Set<string>();

  // Helper to save letters to Firestore & Local backup (optimized, non-blocking parallel saves)
  async function saveScheduledLetters(letters: any[]) {
    // 1. Always save to local backup file first (which is very fast)
    try {
      await fs.writeFile(SCHEDULE_FILE, JSON.stringify(letters, null, 2), 'utf8');
    } catch (fileErr) {
      console.error("Failed to save scheduled letters locally:", fileErr);
    }

    // 2. Try to save to Firestore in the background (parallel and non-blocking)
    Promise.all(
      letters.map(async (letter) => {
        if (!letter.id) return;
        const docRef = doc(firestoreDb, "scheduled_letters", letter.id);
        const cleanLetter = JSON.parse(JSON.stringify(letter));
        try {
          await withTimeout(setDoc(docRef, cleanLetter, { merge: true }), 3000);
        } catch (err) {
          // Ignore individual timeouts/quota limits so others can still succeed
        }
      })
    ).catch(e => {
      console.warn("Firestore parallel backup warnings:", e);
    });
  }

  // Helper to forward received reply emails back to the original sender
  async function forwardEmailToSender(senderEmail: string, originalSubject: string, replyContent: string, replierInfo: string) {
    try {
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
         return false;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .reply-box {
              background-color: #FAF6F0;
              border: 1px solid #dfd6c6;
              border-radius: 16px;
              padding: 25px;
              margin: 20px 0;
              font-family: Georgia, serif;
              color: #4d4030;
              line-height: 1.8;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f0e6; font-family: sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 30px 20px;">
            <div style="background-color: white; border-radius: 24px; border: 1px solid #dfd6c6; padding: 35px; box-shadow: 0 10px 30px rgba(0,0,0,0.04);">
              
              <div style="border-bottom: 1px dashed #dfd6c6; padding-bottom: 15px; margin-bottom: 25px;">
                <span style="font-size: 11px; font-weight: 800; color: #a78358; background: rgba(167, 131, 88, 0.1); padding: 4px 12px; border-radius: 12px; text-transform: uppercase;">
                  📬 屿·记 · 收到新回信转寄
                </span>
              </div>

              <p style="font-size: 14px; color: #665c4e; margin: 0 0 10px 0;">亲爱的岛民：</p>
              <p style="font-size: 14px; color: #4d4030; line-height: 1.6; margin: 0 0 25px 0;">
                您寄出的时光信笺《<b>${originalSubject}</b>》已收到来自 <b>${replierInfo}</b> 的回复！为了保护您的邮箱隐私，系统邮箱已为您完成匿名代理，并将回复内容安全转寄至您的绑定邮箱。
              </p>

              <div class="reply-box">${replyContent}</div>

              <p style="font-size: 11px; color: #a88252; text-align: center; margin-top: 30px; border-top: 1px dashed #dfd6c6; padding-top: 20px;">
                让记忆漫游，时间会给出最好的回信。<br/>
                屿·记 时光邮递中介系统
              </p>

            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
         from: process.env.SMTP_FROM || `"屿·记 时光邮差" <${process.env.SMTP_USER}>`,
         to: senderEmail,
         subject: `[屿·记回信代转]《${originalSubject}》收到新回复！`,
         html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Forward Success] Sent forwarded reply mail to sender ${senderEmail}. MessageID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[Forward Failed] Error forwarding reply mail to ${senderEmail}:`, err);
      return false;
    }
  }

  // Active IMAP checker to pull unread email replies, decode them, and forward to the correct senders
  async function checkAndForwardReplies() {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return;
    }
    
    const imapHost = process.env.IMAP_HOST || process.env.SMTP_HOST.replace('smtp.', 'imap.').replace('smtp', 'imap');
    const imapPort = parseInt(process.env.IMAP_PORT || '993', 10);
    
    const config = {
      imap: {
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASS,
        host: imapHost,
        port: imapPort,
        tls: true,
        authTimeout: 5000,
        connTimeout: 8000,
        tlsOptions: { rejectUnauthorized: false }
      }
    };

    try {
      const connection = await imaps.connect(config);
      await connection.openBox('INBOX');
      
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false
      };
      
      const messages = await connection.search(searchCriteria, fetchOptions);
      if (messages.length > 0) {
        console.log(`[IMAP Check] Found ${messages.length} unseen emails in INBOX.`);
      }
      
      for (const message of messages) {
        let part = message.parts.find(p => p.which === '');
        if (!part) continue;
        
        const parsed = await simpleParser(part.body);
        const subject = parsed.subject || '';
        const text = parsed.text || parsed.html || '';
        
        // Match letter reference ID: [Ref: letter-xxxxx] or [Ref: sk-letter-xxxxx]
        const match = subject.match(/\[Ref:\s*([a-zA-Z0-9_-]+)\]/);
        if (match) {
          const letterId = match[1];
          console.log(`[IMAP Match] Found reply for letter ID: ${letterId}`);
          
          const letters = await getScheduledLetters();
          const letter = letters.find(l => l.id === letterId);
          if (letter && letter.replyTo && letter.replyTo.includes('@')) {
            console.log(`[IMAP Forward] Forwarding reply to sender: ${letter.replyTo}`);
            const ok = await forwardEmailToSender(letter.replyTo, letter.subject, text, parsed.from?.text || '收件人');
            if (ok) {
              await connection.addFlags(message.attributes.uid, 'SEEN');
              console.log(`[IMAP Success] Message ${message.attributes.uid} marked as SEEN and forwarded.`);
            }
          } else {
            console.warn(`[IMAP Skip] Letter ${letterId} not found or no replyTo email address configured.`);
            await connection.addFlags(message.attributes.uid, 'SEEN');
          }
        }
      }
      
      connection.end();
    } catch (err) {
      // Quiet fail to avoid polluting the terminal console during standard intervals if credentials aren't perfect
      console.warn(`[IMAP Check Warning] IMAP check temporarily inactive:`, err instanceof Error ? err.message : err);
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
         subject: `[屿·记时光信笺] ${letter.subject} [Ref: ${letter.id}]`,
         html: htmlContent,
         headers: {
           'Priority': 'normal',
           'X-Mailer': 'Nodemailer'
         }
      };

      if (letter.replyTo && letter.replyTo.includes('@')) {
        mailOptions.replyTo = letter.replyTo;
      }

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
          if (sendingLetterIds.has(letter.id)) {
            continue; // Skip if already currently sending
          }

          let deliveryTime = 0;
          let deliverStr = letter.deliverAt;
          if (!deliverStr.includes('Z') && !deliverStr.match(/[+-]\d{2}:\d{2}$/)) {
            deliverStr = deliverStr.replace(' ', 'T') + '+08:00';
          }
          deliveryTime = new Date(deliverStr).getTime();

          if (deliveryTime <= now) {
            sendingLetterIds.add(letter.id);
            try {
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
            } finally {
              sendingLetterIds.delete(letter.id);
            }
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
  let imapCycleCounter = 0;
  setInterval(async () => {
    // 1. Send scheduled letters
    try {
      const letters = await getScheduledLetters();
      const now = Date.now();
      let updated = false;
      for (const letter of letters) {
        const isEligible = letter.status === "pending" || 
                           (letter.status === "failed" && (letter.failedAttempts || 0) < 3);
        if (isEligible) {
          if (sendingLetterIds.has(letter.id)) {
            continue; // Skip if already currently sending
          }

          let deliveryTime = 0;
          let deliverStr = letter.deliverAt;
          // If the date string doesn't include timezone information, assume Beijing Time (UTC+8)
          if (!deliverStr.includes('Z') && !deliverStr.match(/[+-]\d{2}:\d{2}$/)) {
            deliverStr = deliverStr.replace(' ', 'T') + '+08:00';
          }
          deliveryTime = new Date(deliverStr).getTime();

          if (deliveryTime <= now) {
            sendingLetterIds.add(letter.id);
            try {
              const ok = await sendScheduledLetterEmail(letter);
              if (ok) {
                letter.status = "submitted";
                letter.sentTimestamp = new Date().toISOString();
              } else {
                letter.failedAttempts = (letter.failedAttempts || 0) + 1;
                letter.status = letter.failedAttempts >= 3 ? "failed_permanent" : "failed";
              }
              updated = true;
            } finally {
              sendingLetterIds.delete(letter.id);
            }
          }
        }
      }
      if (updated) {
        await saveScheduledLetters(letters);
      }
    } catch (e) {
      console.error('Scheduler task iteration failed:', e);
    }

    // 2. Poll IMAP inbox for unread email replies every 30 seconds (every 2 cycles)
    imapCycleCounter++;
    if (imapCycleCounter % 2 === 0) {
      try {
        await checkAndForwardReplies();
      } catch (e) {
        console.error('IMAP reply forwarding failed:', e);
      }
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
      const { id, to, subject, content, scheduleTime, type, images, bodyImages, bgImage, createdAt, recipient, files, replyTo } = req.body;
      
      if (!to || !to.includes('@')) {
         return res.status(400).json({ error: 'Invalid email address' });
      }

      const letters = await getScheduledLetters();
      const existingIdx = id ? letters.findIndex(l => l.id === id) : -1;
      const existingLetter = existingIdx >= 0 ? letters[existingIdx] : null;

      const deliveryTime = new Date(scheduleTime).getTime();
      const now = Date.now();

      let status = 'pending';
      if (existingLetter) {
        if (existingLetter.status === 'submitted' || existingLetter.status === 'failed_permanent') {
          const oldDeliveryTime = new Date(existingLetter.deliverAt).getTime();
          if (deliveryTime > now && deliveryTime !== oldDeliveryTime) {
            status = 'pending';
          } else {
            status = existingLetter.status;
          }
        } else {
          status = existingLetter.status || 'pending';
        }
      } else {
        if (deliveryTime <= now) {
          status = 'submitted';
        } else {
          status = 'pending';
        }
      }

      const entry = {
        id: id || ('sk-letter-' + Date.now()),
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
        replyTo: replyTo || '',
        status
      };

      if (existingIdx >= 0) {
        letters[existingIdx] = entry;
      } else {
        letters.push(entry);
      }
      
      await saveScheduledLetters(letters);

      return res.json({ success: true, message: "Email scheduled & stored successfully", letterId: entry.id });
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
