import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, Settings, Heart, Cookie, Volume2, VolumeX, 
  Sparkles, RotateCcw, Upload, ArrowRight, Activity, Smile,
  Lock, Unlock, Check, Plus, Gift, History, HelpCircle as HelpIcon,
  Compass, Eye
} from 'lucide-react';

// Preset Reactions
const REACTIONS = [
  "摸摸头~(≧▽≦) 好舒服呀~",
  "好痒呀！喵呜！(ฅ>ω<*ฅ)",
  "今天也要开心度过哦！(✿◡‿◡)",
  "我在听呢，你今天过得怎么样？(*/ω＼*)",
  "不要总是戳我啦，人家会害羞的 (。・ε・。)",
  "喵呜~ 🐾 伸个大大的懒腰~",
  "需要我为你指路吗？(◕ᴗ◕✿)",
  "我会一直陪伴着你的，不要难过哦 ✨",
  "给你一个暖呼呼的大大拥抱！(づ￣ 3￣)づ"
];

// Idle Talk Phrases
const IDLE_TALK = [
  "在写日记吗？我也想听你的精彩故事~(๑• . •๑)",
  "累了的话，就去【还有音乐】里放一首舒缓的歌吧 🎵",
  "今天有没有写一封寄给未来的信件呢？📬",
  "要不要去【关于我】看看主理人的精彩世界呀？🌤️",
  "【还有生活】里又更新了阅读进度，《倒影映射出的你/我/他》真好看呢 📚",
  "摸摸我的小耳朵，我会给你带来一整天的好运哦！(๑>ᴗ<๑)",
  "小岛上的天空今天也特别温柔，对吧？🌤️"
];

// Correct Site Guides aligning with actual apps
const GUIDES = [
  { 
    title: "屿·记 (心情日记) 📖", 
    desc: "你的私密心灵自留地。支持记录每日心情、丰富的情感表情、天气选择，还可以添加重要的纪念日倒数，并带有安全密码锁防止偷看哦！(๑•̀ㅂ•́)و✧" 
  },
  { 
    title: "Q-LINK-A (雨天信封) ✉️", 
    desc: "充满浪漫艺术感的雨夜信件中心。点击此处可浏览雨天互动空间、接收与寄送心意卡片，体验在雨声中探寻世界的美妙律动。" 
  },
  { 
    title: "关于我 (小红书卡片) 🌸", 
    desc: "精美的社交卡片式个人主页。展示了主理人 NotANumberO_ 的生动生活侧写、细致技能图谱以及极具美感的设计美学。" 
  },
  { 
    title: "还有音乐 (网易云律动) 🎵", 
    desc: "温暖复古的网易云音乐空间。支持播放个人珍藏的 LOVE 歌单、随笔散落的心情音轨，在深夜用旋律温存所有的情绪碎片。" 
  },
  { 
    title: "还有生活 (B站小宇宙) 📺", 
    desc: "Bilibili 风格的生活观察室。你可以随时翻阅书籍阅读进展（如《倒影映射出的你/我/他》）、观看精美生活记录，甚至打开电脑进行趣味操作！" 
  },
  { 
    title: "创意集 (灵感拼贴) 💡", 
    desc: "主理人天马行空的创意与设计作品集。包含了前沿 UI/UX 界面探索、新粗野主义排版实验及声色共鸣的动态视觉交互。" 
  }
];

// Food types
const FOOD_TYPES = [
  { id: 'cookie', name: '曲奇饼干 🍪', affection: 5, hunger: 15, sound: 'crunch', icon: '🍪' },
  { id: 'milk', name: '热牛奶 🥛', affection: 8, hunger: 25, sound: 'drink', icon: '🥛' },
  { id: 'fish', name: '香烤小鱼 🐟', affection: 15, hunger: 40, sound: 'meow', icon: '🐟' }
];

export default function DesktopPet() {
  // Persistence States
  const [affection, setAffection] = useState(() => {
    try {
      return Number(localStorage.getItem('pet_affection') || '15');
    } catch { return 15; }
  });
  const [hunger, setHunger] = useState(() => {
    try {
      return Number(localStorage.getItem('pet_hunger') || '85');
    } catch { return 85; }
  });
  const [clicks, setClicks] = useState(() => {
    try {
      return Number(localStorage.getItem('pet_clicks') || '0');
    } catch { return 0; }
  });
  
  // Restricted Skin Selection: kidult vs chibi
  const [skinId, setSkinId] = useState<'kidult' | 'chibi'>(() => {
    try {
      const saved = localStorage.getItem('pet_skin_id');
      return (saved === 'kidult' || saved === 'chibi') ? saved : 'chibi';
    } catch { return 'chibi'; }
  });

  // Custom static / transparent assets for kidult & chibi loaded by user later
  const [kidultSkinUrl, setKidultSkinUrl] = useState(() => {
    try {
      return localStorage.getItem('pet_kidult_skin_url') || '';
    } catch { return ''; }
  });
  const [chibiSkinUrl, setChibiSkinUrl] = useState(() => {
    try {
      return localStorage.getItem('pet_chibi_skin_url') || '';
    } catch { return ''; }
  });

  // Position Lock Feature
  const [isLocked, setIsLocked] = useState(() => {
    try {
      return localStorage.getItem('pet_is_locked') === 'true';
    } catch { return false; }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('pet_sound_enabled') !== 'false';
    } catch { return true; }
  });
  const [chatFrequency, setChatFrequency] = useState(() => {
    try {
      return localStorage.getItem('pet_chat_frequency') || 'medium'; // high, medium, off
    } catch { return 'medium'; }
  });

  // Promise/Goal Feature inside control panel
  const [dailyPromise, setDailyPromise] = useState(() => {
    try {
      return localStorage.getItem('pet_daily_promise') || '';
    } catch { return ''; }
  });
  const [isPromiseDone, setIsPromiseDone] = useState(() => {
    try {
      return localStorage.getItem('pet_is_promise_done') === 'true';
    } catch { return false; }
  });

  // Interaction logs / journal
  const [interactionLogs, setInteractionLogs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pet_interaction_logs');
      return saved ? JSON.parse(saved) : ["✨ 首次召唤守护灵 N-！", "🧸 一切准备就绪，开启治愈之旅"];
    } catch {
      return ["✨ 首次召唤守护灵 N-！", "🧸 一切准备就绪，开启治愈之旅"];
    }
  });

  // UI States
  const [reaction, setReaction] = useState("你好呀！我是守护灵 N-。很高兴遇见你！✨");
  const [showGuide, setShowGuide] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; char: string }[]>([]);
  const [promiseInput, setPromiseInput] = useState('');

  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to localstorage
  useEffect(() => {
    try {
      localStorage.setItem('pet_affection', affection.toString());
      localStorage.setItem('pet_hunger', hunger.toString());
      localStorage.setItem('pet_clicks', clicks.toString());
      localStorage.setItem('pet_skin_id', skinId);
      localStorage.setItem('pet_kidult_skin_url', kidultSkinUrl);
      localStorage.setItem('pet_chibi_skin_url', chibiSkinUrl);
      localStorage.setItem('pet_is_locked', isLocked.toString());
      localStorage.setItem('pet_sound_enabled', soundEnabled.toString());
      localStorage.setItem('pet_chat_frequency', chatFrequency);
      localStorage.setItem('pet_daily_promise', dailyPromise);
      localStorage.setItem('pet_is_promise_done', isPromiseDone.toString());
      localStorage.setItem('pet_interaction_logs', JSON.stringify(interactionLogs));
    } catch (e) {}
  }, [
    affection, hunger, clicks, skinId, kidultSkinUrl, chibiSkinUrl, 
    isLocked, soundEnabled, chatFrequency, dailyPromise, isPromiseDone, interactionLogs
  ]);

  // Audio Synthesizer (Web Audio API) for retro healing sounds
  const playSynthSound = (type: 'meow' | 'bubble' | 'click' | 'crunch' | 'drink' | 'success' | 'magic') => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'bubble') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'meow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'crunch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(250, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'drink') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(660, now + 0.1);
        osc.frequency.setValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'magic') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context blocked or not supported:", e);
    }
  };

  // Blinking eyes logic
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 130);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Idle Talk cycle
  useEffect(() => {
    if (chatFrequency === 'off') {
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
      return;
    }

    const intervalMs = chatFrequency === 'high' ? 14000 : 28000;
    
    const triggerIdleTalk = () => {
      if (showGuide || showSettings) return;
      const sentence = IDLE_TALK[Math.floor(Math.random() * IDLE_TALK.length)];
      setReaction(sentence);
      playSynthSound('bubble');
      
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = setTimeout(() => {
        setReaction("");
      }, 5000);
    };

    idleIntervalRef.current = setInterval(triggerIdleTalk, intervalMs);
    return () => {
      if (idleIntervalRef.current) clearInterval(idleIntervalRef.current);
    };
  }, [chatFrequency, showGuide, showSettings]);

  // Hunger degradation
  useEffect(() => {
    const timer = setInterval(() => {
      setHunger(prev => Math.max(0, prev - 1));
    }, 60000 * 3.5); // -1 hunger every 3.5 minutes
    return () => clearInterval(timer);
  }, []);

  const spawnFloatingIcon = (char: string) => {
    const id = Date.now() + Math.random();
    const x = Math.random() * 80 - 40;
    const y = -10;
    setFloatingHearts(prev => [...prev, { id, x, y, char }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 1500);
  };

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    setInteractionLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  const handleTouch = () => {
    if (showGuide) return;
    setClicks(prev => prev + 1);
    
    const isSpecialMeow = Math.random() > 0.6;
    playSynthSound(isSpecialMeow ? 'meow' : 'click');
    
    setAffection(prev => prev + 1);
    spawnFloatingIcon('❤️');
    
    const randomReaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
    setReaction(randomReaction);
    
    addLog(`抚摸了${skinId === 'kidult' ? 'Kidult形态' : 'Chibi形态'}的 N-`);

    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setReaction("");
    }, 4000);
  };

  const handleFeed = (food: typeof FOOD_TYPES[0]) => {
    if (hunger >= 100) {
      setReaction("肚子已经鼓鼓的啦，吃不下啦~(。・ε・。)");
      playSynthSound('click');
      return;
    }
    
    setHunger(prev => Math.min(100, prev + food.hunger));
    setAffection(prev => Math.min(999, prev + food.affection));
    
    if (food.sound === 'crunch') playSynthSound('crunch');
    else if (food.sound === 'drink') playSynthSound('drink');
    else playSynthSound('meow');

    spawnFloatingIcon(food.icon);
    setReaction(`啊呜啊呜！好美味的${food.name.split(' ')[0]}！好感度+${food.affection}✨`);
    addLog(`喂食了${food.name.split(' ')[0]}`);
    
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    reactionTimeoutRef.current = setTimeout(() => {
      setReaction("");
    }, 4500);
  };

  const nextGuide = () => {
    playSynthSound('click');
    if (guideIndex < GUIDES.length - 1) {
      setGuideIndex(prev => prev + 1);
    } else {
      setShowGuide(false);
      setGuideIndex(0);
      setReaction("指引圆满完成！快去各个精致的板块里探索，寻找不期而遇的浪漫吧~(๑>ᴗ<๑)");
      addLog("学完了全站使用指南");
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
      reactionTimeoutRef.current = setTimeout(() => setReaction(""), 5000);
    }
  };

  // Add a promise/daily wish
  const handleAddPromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promiseInput.trim()) return;
    setDailyPromise(promiseInput.trim());
    setIsPromiseDone(false);
    setPromiseInput('');
    playSynthSound('success');
    setReaction(`收下了你的今日誓约：“${promiseInput.trim()}”！一定要加油实现它哦！🌟`);
    addLog(`立下了今日誓约: ${promiseInput.trim()}`);
  };

  // Check off promise
  const handleCompletePromise = () => {
    if (isPromiseDone) return;
    setIsPromiseDone(true);
    setAffection(prev => prev + 15);
    playSynthSound('magic');
    spawnFloatingIcon('🌟');
    setReaction("哇！你太棒了！成功践行了今日誓约，给你大大的鼓励！好感度 +15 💖");
    addLog(`完成了今日誓约: ${dailyPromise}`);
  };

  // Virtual Gifts / Affirmation Boxes based on Affection
  const getGiftStatus = (pointsRequired: number) => {
    return affection >= pointsRequired;
  };

  const handleClaimGift = (giftName: string, points: number) => {
    if (affection < points) {
      setReaction(`需要好感度达到 ${points} 才能解锁这件礼物哦~(｡•́_•̀｡)`);
      playSynthSound('click');
      return;
    }
    playSynthSound('magic');
    spawnFloatingIcon('🎁');
    
    let dialogue = "";
    if (giftName === "星空茶 ☕") dialogue = "把整片浩瀚的星河，装进精致的茶杯，温润你疲惫的一整天~✨";
    if (giftName === "秘密哼唱 🎵") dialogue = "（轻轻地哼起了一首摇篮曲...）愿你的梦里都是轻盈的云朵和温柔的风 🐾";
    if (giftName === "守护流星 💫") dialogue = "向黑夜借来了一颗转瞬即逝的光芒，它会化作守护，常驻在你的心灵深处 ✨";

    setReaction(`🎁 打开了 N- 赠予的【${giftName}】: “${dialogue}”`);
    addLog(`开启了好感度礼物: ${giftName}`);
  };

  // Skin custom uploads
  const handleCustomSkinUpload = (type: 'kidult' | 'chibi', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          if (type === 'kidult') {
            setKidultSkinUrl(base64);
            setReaction("已装载你的【Kidult形态】透明底立绘！(ฅ>ω<*ฅ)");
          } else {
            setChibiSkinUrl(base64);
            setReaction("已装载你的【Chibi形态】圆滚滚Q版图！(✿◡‿◡)");
          }
          playSynthSound('magic');
          addLog(`上传了自定义 ${type === 'kidult' ? 'Kidult' : 'Chibi'} 形象`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getAffectionTitle = () => {
    if (affection < 30) return "临时观察员 🧸";
    if (affection < 80) return "默契同行人 🌤️";
    if (affection < 180) return "灵魂共鸣者 💖";
    return "永远的心灵守望 ✨";
  };

  const dragConstraintsRef = useRef(null);

  return (
    <>
      {/* Invisible full-screen drag area */}
      <div ref={dragConstraintsRef} className="fixed inset-0 pointer-events-none z-[80]" />
      
      <motion.div
        drag={!isLocked}
        dragConstraints={dragConstraintsRef}
        dragMomentum={false}
        initial={{ x: window.innerWidth - 170, y: window.innerHeight - 230 }}
        className="fixed z-[85] select-none"
        style={{ 
          touchAction: 'none',
          cursor: isLocked ? 'default' : 'grab'
        }}
      >
        <div className="relative w-36 h-36 group flex items-center justify-center">
          
          {/* Particles generator */}
          <AnimatePresence>
            {floatingHearts.map(heart => (
              <motion.div
                key={heart.id}
                initial={{ opacity: 1, y: 0, scale: 0.8, x: heart.x }}
                animate={{ opacity: 0, y: -75, scale: 1.4, x: heart.x + (Math.random() * 24 - 12) }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.25, ease: "easeOut" }}
                className="absolute pointer-events-none text-xl z-50 select-none text-red-400 font-bold"
              >
                {heart.char}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Bubble speech box */}
          <AnimatePresence>
            {(reaction || showGuide) && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.8 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-[0_10px_25px_rgba(98,114,100,0.15)] border border-[#e2e8e3]/80 z-20 before:content-[''] before:absolute before:-bottom-2 before:left-1/2 before:-translate-x-1/2 before:border-l-8 before:border-r-8 before:border-t-8 before:border-l-transparent before:border-r-transparent before:border-t-white/95"
              >
                {showGuide ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center pb-1 border-b border-[#f0f4f1]">
                      <span className="text-xs font-bold text-[#4c554e] flex items-center gap-1">
                        <Smile size={13} className="text-[#627264]" />
                        {GUIDES[guideIndex].title}
                      </span>
                      <button 
                        onClick={() => { setShowGuide(false); setGuideIndex(0); playSynthSound('click'); }} 
                        className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <p className="text-xs text-[#5c685f] leading-relaxed font-semibold">
                      {GUIDES[guideIndex].desc}
                    </p>
                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-[#f0f4f1]">
                      <div className="flex gap-1">
                        {GUIDES.map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === guideIndex ? 'w-3 bg-[#627264]' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <button 
                        onClick={nextGuide}
                        className="text-[10px] font-bold bg-[#627264] text-white px-2.5 py-1 rounded-full hover:bg-[#4d5a4f] transition-all flex items-center gap-0.5"
                      >
                        {guideIndex < GUIDES.length - 1 ? '下一步' : '探索岛屿'}
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#4c554e] leading-relaxed text-center font-bold">
                    {reaction}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick sidebar overlay on hover */}
          <div className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowGuide(true); setReaction(""); setGuideIndex(0); playSynthSound('bubble'); }}
              className="w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-md flex items-center justify-center text-[#627264] hover:bg-[#eaf2ed] transition-colors border border-[#e2e8e3]"
              title="岛屿指南"
            >
              <HelpCircle size={15} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); playSynthSound('click'); }}
              className="w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-md flex items-center justify-center text-[#627264] hover:bg-[#eaf2ed] transition-colors border border-[#e2e8e3]"
              title="Connect with N-"
            >
              <Settings size={15} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsLocked(!isLocked); playSynthSound('click'); setReaction(isLocked ? "我被解锁啦，现在可以随意拖动我了哦！🐾" : "位置已锁定！我会乖乖待在这个地方。✨"); }}
              className="w-8 h-8 bg-white/95 backdrop-blur rounded-full shadow-md flex items-center justify-center text-[#627264] hover:bg-[#eaf2ed] transition-colors border border-[#e2e8e3]"
              title={isLocked ? "解锁位置" : "锁定位置"}
            >
              {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
          </div>

          {/* Core Interactive Sprite */}
          <motion.div 
            onClick={handleTouch}
            whileHover={{ scale: isLocked ? 1.05 : 1.08 }}
            whileTap={{ scale: 0.93 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-24 h-24"
          >
            {/* Soft Breathing Shadow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/10 rounded-[50%] blur-sm" />
            
            {/* Render Custom Image if URL is loaded, otherwise cute default CSS graphics */}
            {skinId === 'kidult' && kidultSkinUrl ? (
              <img 
                src={kidultSkinUrl} 
                alt="N- Kidult"
                className="w-full h-full object-contain pointer-events-none drop-shadow-md"
              />
            ) : skinId === 'chibi' && chibiSkinUrl ? (
              <img 
                src={chibiSkinUrl} 
                alt="N- Chibi"
                className="w-full h-full object-contain pointer-events-none drop-shadow-md"
              />
            ) : (
              /* High-quality CSS Sprites */
              <motion.div 
                animate={{ 
                  borderRadius: skinId === 'kidult' 
                    ? ["45% 45% 55% 55% / 40% 40% 60% 60%", "42% 42% 58% 58% / 45% 45% 55% 55%", "45% 45% 55% 55% / 40% 40% 60% 60%"]
                    : ["50% 50% 46% 54% / 46% 46% 54% 54%", "54% 54% 50% 50% / 50% 50% 50% 50%", "50% 50% 46% 54% / 46% 46% 54% 54%"]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className={`w-full h-full bg-gradient-to-br shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.06),0_6px_12px_rgba(0,0,0,0.08)] border-2 border-white/70 flex items-center justify-center relative z-10 transition-colors duration-500 ${
                  skinId === 'kidult' 
                    ? 'from-[#fefefe] to-[#ebf1ee] border-b-emerald-100' 
                    : 'from-[#fcf4ec] to-[#f5dac5] border-b-orange-100'
                }`}
              >
                {/* Ears for Kidult (Sleek, elegant long cat ears) */}
                {skinId === 'kidult' && (
                  <>
                    <div className="absolute -top-3.5 left-1.5 w-4 h-6 bg-gradient-to-br from-[#ffffff] to-[#ebf1ee] rounded-tl-full rotate-[-12deg] -z-10 border-l border-white" />
                    <div className="absolute -top-3.5 right-1.5 w-4 h-6 bg-gradient-to-br from-[#ffffff] to-[#ebf1ee] rounded-tr-full rotate-[12deg] -z-10 border-r border-white" />
                    <div className="absolute -top-2 left-2.5 w-2 h-4 bg-[#e8a3b0]/30 rounded-tl-full rotate-[-8deg]" />
                    <div className="absolute -top-2 right-2.5 w-2 h-4 bg-[#e8a3b0]/30 rounded-tr-full rotate-[8deg]" />
                    
                    {/* Sleek Golden Crown for Grown-Up Kidult */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-0.5 text-yellow-400 opacity-90 scale-90">
                      <Sparkles size={10} className="fill-yellow-400" />
                    </div>
                  </>
                )}

                {/* Ears for Chibi (Super chubby round cute baby bear ears) */}
                {skinId === 'chibi' && (
                  <>
                    <div className="absolute -top-2.5 left-1 w-5.5 h-5.5 bg-gradient-to-br from-[#fcf4ec] to-[#f5dac5] rounded-full -z-10 border border-white/40" />
                    <div className="absolute -top-2.5 right-1 w-5.5 h-5.5 bg-gradient-to-br from-[#fcf4ec] to-[#f5dac5] rounded-full -z-10 border border-white/40" />
                    <div className="absolute -top-1.5 left-2 w-3.5 h-3.5 bg-[#f5b8a5]/40 rounded-full" />
                    <div className="absolute -top-1.5 right-2 w-3.5 h-3.5 bg-[#f5b8a5]/40 rounded-full" />
                  </>
                )}

                {/* Facial layout */}
                <div className="flex flex-col items-center gap-1.5 mt-2 relative z-20">
                  {/* Eyes */}
                  <div className="flex gap-4">
                    {skinId === 'kidult' ? (
                      /* Intelligent, elegant half-closed eyes */
                      <>
                        <div className="flex flex-col gap-0.5">
                          <div className="w-3.5 h-0.5 bg-[#3a443e] rounded-full" />
                          <motion.div 
                            animate={{ scaleY: isBlinking ? 0 : 1 }}
                            className="w-2.5 h-1.5 bg-[#4c5851] rounded-b-full ml-0.5"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="w-3.5 h-0.5 bg-[#3a443e] rounded-full" />
                          <motion.div 
                            animate={{ scaleY: isBlinking ? 0 : 1 }}
                            className="w-2.5 h-1.5 bg-[#4c5851] rounded-b-full ml-0.5"
                          />
                        </div>
                      </>
                    ) : (
                      /* Large twinkling adorable chibi eyes */
                      <>
                        <motion.div 
                          animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                          transition={{ duration: 0.1 }}
                          className="w-3.5 h-3.5 bg-[#524134] rounded-full relative flex items-center justify-center"
                        >
                          {!isBlinking && (
                            <>
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                              <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full" />
                            </>
                          )}
                        </motion.div>
                        <motion.div 
                          animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                          transition={{ duration: 0.1 }}
                          className="w-3.5 h-3.5 bg-[#524134] rounded-full relative flex items-center justify-center"
                        >
                          {!isBlinking && (
                            <>
                              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                              <div className="absolute bottom-0.5 right-0.5 w-0.5 h-0.5 bg-white rounded-full" />
                            </>
                          )}
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Blush */}
                  <div className={`absolute top-2 w-3 h-2 bg-[#ffaab7] rounded-full opacity-60 blur-[0.6px] ${skinId === 'kidult' ? '-left-3' : '-left-3.5'}`} />
                  <div className={`absolute top-2 w-3 h-2 bg-[#ffaab7] rounded-full opacity-60 blur-[0.6px] ${skinId === 'kidult' ? '-right-3' : '-right-3.5'}`} />

                  {/* Mouth */}
                  {skinId === 'kidult' ? (
                    <div className="w-2.5 h-1 border-b-2 border-[#3a443e] rounded-full" />
                  ) : (
                    <div className="w-3 h-2 border-b-2 border-l border-r border-[#524134] rounded-b-full bg-orange-100/20" />
                  )}
                </div>

                {/* Sub-features */}
                {skinId === 'chibi' && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-4">
                    <div className="w-2.5 h-1.5 bg-white rounded-full border border-orange-100" />
                    <div className="w-2.5 h-1.5 bg-white rounded-full border border-orange-100" />
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Advanced Control Panel (Connect with N-) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed bottom-24 right-8 w-88 bg-white/95 backdrop-blur-xl border border-[#e2e8e3] rounded-3xl p-4.5 shadow-[0_20px_45px_rgba(98,114,100,0.2)] z-[95] text-left"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-2.5 border-b border-[#f0f4f1] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#627264] animate-pulse" />
                <h3 className="text-sm font-bold text-[#353e37] tracking-wide">
                  Connect with N-
                </h3>
              </div>
              <button 
                onClick={() => { setShowSettings(false); playSynthSound('click'); }} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={15} />
              </button>
            </div>

            {/* Inner Content Grid */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin">
              
              {/* Pet status and identity cards */}
              <div className="bg-[#fcfdfc] border border-[#eaf2ed] rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold">小岛守护灵状态</span>
                  <span className="text-[10px] text-[#627264] font-bold bg-[#e9f0eb] px-2 py-0.5 rounded-full">
                    {getAffectionTitle()}
                  </span>
                </div>
                
                {/* Stats lines */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-gray-500">
                  <div className="bg-white border border-[#f0f4f1] rounded-xl p-2 flex items-center justify-between">
                    <span>❤️ 亲密指数</span>
                    <span className="font-bold text-red-400">{affection}</span>
                  </div>
                  <div className="bg-white border border-[#f0f4f1] rounded-xl p-2 flex items-center justify-between">
                    <span>🍪 能量积蓄</span>
                    <span className={`font-bold ${hunger < 35 ? 'text-orange-400' : 'text-amber-500'}`}>{hunger}%</span>
                  </div>
                </div>

                {/* Growth visual bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] text-gray-400">
                    <span>亲密度经验阶段 (LV.{affection < 30 ? 1 : affection < 80 ? 2 : affection < 180 ? 3 : 4})</span>
                    <span>{affection}/300</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-[#f59e9b] h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (affection / 300) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Position Lock & Drag toggle in settings */}
              <div className="flex items-center justify-between bg-[#f8faf9] border border-[#edf2ef] px-3 py-2 rounded-xl text-[10px] text-gray-500 font-bold">
                <span className="flex items-center gap-1">
                  {isLocked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} className="text-emerald-500" />}
                  锁定屏幕上的悬浮位置
                </span>
                <button
                  onClick={() => {
                    setIsLocked(!isLocked);
                    playSynthSound('click');
                    setReaction(isLocked ? "解锁啦，现在可以带着我随便逛逛！🚀" : "锁定成功！我就固定在你的视线里啦~✨");
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${
                    isLocked 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-[#627264] text-white hover:bg-[#4d5a4f]'
                  }`}
                >
                  {isLocked ? '点击解锁' : '点击锁定'}
                </button>
              </div>

              {/* Daily Promise Section (今日誓约 🎋) */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold block">今日心愿誓约 🎋</span>
                
                {dailyPromise ? (
                  <div className="bg-[#fdfbf7] border border-[#f5ebd6] rounded-xl p-2.5 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex-1 overflow-hidden">
                      <p className={`text-[10px] font-semibold leading-relaxed truncate ${isPromiseDone ? 'line-through text-gray-400' : 'text-[#856404]'}`}>
                        📌 {dailyPromise}
                      </p>
                      <span className="text-[8px] text-gray-400 block mt-0.5">
                        {isPromiseDone ? '✨ 愿望已成真！好感度大幅上涨' : '⏳ 完成以后点击右侧，让 N- 为你见证'}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCompletePromise}
                      disabled={isPromiseDone}
                      className={`p-1.5 rounded-full transition-all ${
                        isPromiseDone 
                          ? 'bg-emerald-50 text-emerald-500' 
                          : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-105 active:scale-95'
                      }`}
                      title="标记为已完成"
                    >
                      <Check size={14} className="stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAddPromise} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="写下你今天的誓约(如: 喝8杯水, 锻炼半小时)..."
                      value={promiseInput}
                      onChange={(e) => setPromiseInput(e.target.value)}
                      className="flex-1 bg-white border border-[#e2e8e3] rounded-xl px-2.5 py-1.5 text-[9px] text-gray-600 outline-none focus:border-[#627264]"
                    />
                    <button
                      type="submit"
                      className="bg-[#627264] hover:bg-[#4d5a4f] text-white rounded-xl px-2.5 py-1.5 text-[9px] font-bold transition-all flex items-center gap-0.5 shrink-0"
                    >
                      <Plus size={10} />
                      刻印
                    </button>
                  </form>
                )}
              </div>

              {/* Exclusive Form Controls: kidult or chibi only */}
              <div className="space-y-2">
                <span className="text-[10px] text-gray-400 font-bold block">定制外观形态</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSkinId('kidult'); playSynthSound('click'); setReaction("变身为：Kidult形态！是不是多了一分优雅与沉稳呢？👑"); }}
                    className={`p-2 rounded-xl border text-left flex flex-col transition-all ${
                      skinId === 'kidult' 
                        ? 'bg-[#627264]/5 border-[#627264] text-[#627264]' 
                        : 'bg-white border-[#e2e8e3] text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Kidult形态 (成年态) 👑</span>
                    <span className="text-[8px] text-gray-400 mt-0.5">优雅沉稳、修长线条</span>
                  </button>
                  <button
                    onClick={() => { setSkinId('chibi'); playSynthSound('click'); setReaction("变身为：Chibi形态！圆滚滚的我是不是很可爱呢？🧸"); }}
                    className={`p-2 rounded-xl border text-left flex flex-col transition-all ${
                      skinId === 'chibi' 
                        ? 'bg-[#627264]/5 border-[#627264] text-[#627264]' 
                        : 'bg-white border-[#e2e8e3] text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold">Chibi形态 (Q版态) 🧸</span>
                    <span className="text-[8px] text-gray-400 mt-0.5">萌力全开、憨厚饱满</span>
                  </button>
                </div>

                {/* Sub-inputs for custom image paths (user will upload them later) */}
                <div className="bg-[#fafafa] border border-[#edf0ee] rounded-xl p-2.5 space-y-2 text-[9px]">
                  <div className="flex justify-between items-center text-gray-400 font-bold mb-1">
                    <span>图像图层绑定 (用于后期替换)</span>
                    <span className="text-[#627264] flex items-center gap-0.5 cursor-help" title="上传带有透明背景的PNG/GIF立绘">
                      <HelpIcon size={8} /> 立绘指南
                    </span>
                  </div>

                  {/* Kidult Input */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-gray-400 block">Kidult形态图像:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        placeholder="绑定你的Kidult立绘链接..."
                        value={kidultSkinUrl}
                        onChange={(e) => setKidultSkinUrl(e.target.value)}
                        className="flex-1 bg-white border border-[#e2e8e3] rounded px-1.5 py-0.5 text-[8px] text-gray-600 outline-none"
                      />
                      <label className="cursor-pointer bg-[#627264] hover:bg-[#4d5a4f] text-white px-2 py-0.5 rounded text-[8px] flex items-center gap-0.5 shrink-0 transition-colors">
                        <Upload size={8} />
                        传图
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleCustomSkinUpload('kidult', e)} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Chibi Input */}
                  <div className="space-y-1">
                    <span className="text-[8px] text-gray-400 block">Chibi形态图像:</span>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        placeholder="绑定你的Chibi立绘链接..."
                        value={chibiSkinUrl}
                        onChange={(e) => setChibiSkinUrl(e.target.value)}
                        className="flex-1 bg-white border border-[#e2e8e3] rounded px-1.5 py-0.5 text-[8px] text-gray-600 outline-none"
                      />
                      <label className="cursor-pointer bg-[#627264] hover:bg-[#4d5a4f] text-white px-2 py-0.5 rounded text-[8px] flex items-center gap-0.5 shrink-0 transition-colors">
                        <Upload size={8} />
                        传图
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleCustomSkinUpload('chibi', e)} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Feed Station */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold block">美味能量补给</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {FOOD_TYPES.map(food => (
                    <button
                      key={food.id}
                      onClick={() => handleFeed(food)}
                      className="flex flex-col items-center justify-center p-1.5 bg-white hover:bg-[#eaf2ed] active:scale-95 border border-[#e2e8e3] hover:border-[#627264] rounded-xl transition-all"
                    >
                      <span className="text-sm mb-0.5">{food.icon}</span>
                      <span className="text-[9px] font-bold text-gray-600">{food.name.split(' ')[0]}</span>
                      <span className="text-[8px] text-gray-400">好感+{food.affection}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Affection Milestones Box (好感礼物 🎁) */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 font-bold block">亲密度专属馈赠 🎁</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: "星空茶 ☕", pts: 20 },
                    { name: "秘密哼唱 🎵", pts: 60 },
                    { name: "守护流星 💫", pts: 120 }
                  ].map(gift => {
                    const isUnlocked = getGiftStatus(gift.pts);
                    return (
                      <button
                        key={gift.name}
                        onClick={() => handleClaimGift(gift.name, gift.pts)}
                        className={`flex flex-col items-center justify-center p-1.5 border rounded-xl transition-all ${
                          isUnlocked 
                            ? 'bg-rose-50/60 border-rose-200 text-rose-700 hover:bg-rose-100/80' 
                            : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-75'
                        }`}
                      >
                        <Gift size={13} className={isUnlocked ? 'text-rose-500 fill-rose-100 animate-pulse' : 'text-gray-300'} />
                        <span className="text-[9px] font-bold mt-1">{gift.name.split(' ')[0]}</span>
                        <span className="text-[7px] text-gray-400">LV.{gift.pts <= 20 ? 1 : gift.pts <= 60 ? 2 : 3} 解锁</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Silent and Voice controls */}
              <div className="border-t border-[#f0f4f1] pt-2.5 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span>复古合成音效</span>
                  <button 
                    onClick={() => { setSoundEnabled(!soundEnabled); playSynthSound('click'); }}
                    className="p-1 rounded hover:bg-gray-100 text-[#627264] transition-colors"
                  >
                    {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                  <span>闲聊频率控制</span>
                  <div className="flex gap-1">
                    {[
                      { id: 'high', label: '频繁' },
                      { id: 'medium', label: '适中' },
                      { id: 'off', label: '安静' }
                    ].map(freq => (
                      <button
                        key={freq.id}
                        onClick={() => { setChatFrequency(freq.id); playSynthSound('click'); }}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                          chatFrequency === freq.id 
                            ? 'bg-[#e9f0eb] text-[#627264]' 
                            : 'bg-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {freq.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interaction Records Log (心路手账 📝) */}
              <div className="space-y-1.5 border-t border-[#f0f4f1] pt-2.5">
                <span className="text-[10px] text-gray-400 font-bold block flex items-center gap-1">
                  <History size={11} /> 心路手账 (最近动态)
                </span>
                <div className="bg-[#fafafa] border border-[#f0f2f0] rounded-xl p-2 max-h-[80px] overflow-y-auto space-y-1 scrollbar-thin">
                  {interactionLogs.map((log, i) => (
                    <div key={i} className="text-[8px] text-gray-500 font-medium tracking-tight truncate">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reset Section */}
              <div className="flex justify-between items-center text-[8px] text-gray-400 border-t border-[#f0f4f1] pt-2.5">
                <span>交互次数: {clicks} 次</span>
                <button
                  onClick={() => {
                    setAffection(15);
                    setHunger(85);
                    setClicks(0);
                    setSkinId('chibi');
                    setKidultSkinUrl('');
                    setChibiSkinUrl('');
                    setIsLocked(false);
                    setDailyPromise('');
                    setIsPromiseDone(false);
                    setInteractionLogs(["✨ 重置守护灵记忆", "🧸 一切重新开始"]);
                    playSynthSound('click');
                    setReaction("好感度、形象绑定和誓约记忆已经全部重置啦！(｡•́_•̀｡)");
                  }}
                  className="flex items-center gap-0.5 hover:text-red-500 font-bold transition-colors"
                >
                  <RotateCcw size={8} />
                  重置记忆
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
