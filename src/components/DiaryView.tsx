import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, X, MapPin, Calendar, Clock, Smile, Cloud, Camera, Mail, Send, Lock, Unlock, MailOpen, Navigation, ArrowRight, Sparkles, ChevronRight, Search, Settings, ChevronLeft, Trash2, Download, LogOut, Folder, Check, Music, Volume2, VolumeX, Wand2, Palette, Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic, RotateCcw, ChevronUp } from 'lucide-react';

const safeGetItem = (k: string) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const safeSetItem = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch (e) {} };



interface DiaryEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  content: string;
  mood?: string;
  weather?: string;
  images?: string[];
  location?: string;
  folder?: string;
  isLocked?: boolean;
}

interface FutureLetter {
  id: string;
  writeDate: string;
  deliverDate: string;
  title: string;
  content: string;
  isOpened: boolean;
  stamp?: string;
  type: 'future' | 'other' | 'past';
  recipient?: string;
}

interface SpecialDay {
  id: string;
  title: string;
  date: string;
  category: 'anniversary' | 'birthday' | 'other';
  isCountUp: boolean;
}

const DiaryPasscodeCard = ({ entry, onUnlock, correctPin, t, theme }: any) => {
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setShake(true);
          setTimeout(() => {
            setShake(false);
            setPin('');
          }, 600);
        }
      }
    }
  };

  const handleClear = () => setPin('');
  const handleBackspace = () => setPin(pin.slice(0, -1));

  return (
    <motion.div 
      animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
      className={`flex flex-col w-full relative p-6 md:p-8 ${theme === 'night' ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/40'} border-[1.5px] backdrop-blur-[20px] rounded-[2rem] shadow-sm overflow-hidden text-center items-center justify-center`}
    >
      <div className={`w-12 h-12 rounded-full ${t.accent} text-white flex items-center justify-center shadow-md mb-3`}>
        <Lock className="w-5 h-5 animate-pulse" />
      </div>
      <h4 className={`text-lg font-black ${t.text} mb-1 font-cute-zh`}>已被锁定的日记</h4>
      <p className={`text-[10px] ${t.secondary} opacity-60 mb-4`}>请输入四位密码开启回忆</p>
      
      {/* Dot Indicators */}
      <div className="flex gap-2.5 mb-5 select-none">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className={`w-3.5 h-3.5 rounded-full border border-pink-200 transition-all duration-300 ${i < pin.length ? 'bg-pink-400 scale-110 shadow-sm' : 'bg-transparent'}`} 
          />
        ))}
      </div>

      {/* Retro Pastel Circular Pad */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-[180px] select-none">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            className="w-10 h-10 rounded-full bg-white/60 hover:bg-white active:scale-95 text-xs font-bold text-gray-700 font-mono shadow-sm border border-gray-100/50 flex items-center justify-center transition-all"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleClear}
          className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-95 text-[10px] font-bold text-rose-500 shadow-sm border border-rose-100/30 flex items-center justify-center transition-all"
        >
          C
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="w-10 h-10 rounded-full bg-white/60 hover:bg-white active:scale-90 text-xs font-bold text-gray-700 font-mono shadow-sm border border-gray-100/50 flex items-center justify-center transition-all"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 active:scale-95 text-[10px] font-bold text-gray-400 shadow-sm border border-gray-100/50 flex items-center justify-center transition-all"
        >
          ⌫
        </button>
      </div>
    </motion.div>
  );
};

export const DiaryView = ({ mode = 'life' }: { mode?: 'island' | 'life' }) => {
  const isIsland = mode === 'island';
  const storageKey = isIsland ? 'island_diary_entries' : 'diary_entries';
  const themeColor = isIsland ? 'from-[#ff9a9e] to-[#fecfef]' : 'from-amber-900/5 to-amber-900/10';
  const accentColor = isIsland ? 'text-[#ff7eb3]' : 'text-amber-950';
  const fontClass = isIsland ? 'font-sans' : 'font-serif';
  const bgClass = isIsland ? 'bg-white' : 'bg-[#fdfbf7]';

  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = safeGetItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Failed to parse ${storageKey}`, e);
      }
    }
    // Default data for both modes can be similar or different
    return isIsland ? [
      {
        id: 'island-1',
        date: '2026-05-06',
        time: '09:00',
        title: '开启屿·记',
        content: '这是我的独立日记空间。每一个瞬间都值得被铭记。',
        mood: '✨',
        weather: '☁️',
        location: '我的岛屿',
      }
    ] : [
      {
        id: '1',
        date: '2026-04-05',
        time: '14:23',
        title: '春日漫步',
        content: '今天去公园散步，看到樱花都开了。微风拂过，花瓣如雪般落下，那一刻感觉时间都静止了。生活中的小确幸大概就是如此吧。',
        mood: '😊',
        weather: '☀️',
        location: '浙江省 · 杭州市',
        images: ['https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774681518731-ajx7b8.jpg']
      },
      {
        id: '2',
        date: '2026-04-03',
        time: '23:15',
        title: '深夜随笔',
        content: '最近在读《虽然想死，但还是想吃辣炒年糕》，感触颇深。每个人都有脆弱的时候，允许自己停下来，也是一种勇敢。',
        mood: '🌙',
        weather: '🌧️',
      }
    ];
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'with_images'>('all');
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery' | 'stats'>('timeline');
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newMood, setNewMood] = useState('😊');
  const [newWeather, setNewWeather] = useState('☀️');
  const [newLocation, setNewLocation] = useState('');
  const [newFolder, setNewFolder] = useState('生活');
  const [isLocked, setIsLocked] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showWeatherPicker, setShowWeatherPicker] = useState(false);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // "小小日记" custom styled states
  const [newPaperStyle, setNewPaperStyle] = useState<'minimal' | 'milktea' | 'sakura' | 'forest' | 'midnight' | 'vintage'>('minimal');
  const [editorFontSize, setEditorFontSize] = useState<number>(16);
  const [editorFontFamily, setEditorFontFamily] = useState<string>('font-serif');
  const [editorTextAlign, setEditorTextAlign] = useState<'left' | 'center' | 'right'>('left');
  
  // Immersive physical feedback & Web Audio Synthesizers
  const [isTypewriterSoundActive, setIsTypewriterSoundActive] = useState<boolean>(true);
  const [editorBgmType, setEditorBgmType] = useState<'none' | 'lofi' | 'rain' | 'forest'>('none');
  const [editorStickers, setEditorStickers] = useState<string[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [unlockedEntries, setUnlockedEntries] = useState<Record<string, boolean>>({});
  const [customPinCode, setCustomPinCode] = useState<string>(() => safeGetItem('diary_custom_pin') || '1234');
  const [searchQuery, setSearchQuery] = useState('');
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);

  // Function to save/update local PIN
  const handleSavePin = (newPin: string) => {
    if (newPin.length === 4) {
      setCustomPinCode(newPin);
      safeSetItem('diary_custom_pin', newPin);
    }
  };

  // Web Audio on-the-fly crisp Typewriter clack mechanical-keyboard synthesizer!
  const playTypewriterSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.035);
      
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      noise.type = 'sine';
      noise.frequency.setValueAtTime(3200 + Math.random() * 800, ctx.currentTime);
      noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.002, ctx.currentTime + 0.012);
      
      osc.connect(gain);
      noise.connect(noiseGain);
      
      gain.connect(ctx.destination);
      noiseGain.connect(ctx.destination);
      
      osc.start();
      noise.start();
      osc.stop(ctx.currentTime + 0.045);
      noise.stop(ctx.currentTime + 0.015);
    } catch (e) {}
  };

  // Continuous relaxing atmospheric sound/ambient music generator
  const startContinuousSynth = (type: 'none' | 'lofi' | 'rain' | 'forest') => {
    try {
      stopContinuousSynth();
      if (type === 'none') return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const nodes: any[] = [];

      if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);

        const source = ctx.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        source.start();
        nodes.push(source, filter, gainNode);
      } else if (type === 'lofi') {
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.07, ctx.currentTime);
        gainNode.connect(ctx.destination);

        let noteCount = 0;
        const intervalId = setInterval(() => {
          if (ctx.state === 'closed') return;
          const oscIndex = noteCount % 4;
          const rootFreq = scale[oscIndex];
          const thirdIndex = (oscIndex + 2) % scale.length;
          const fifthIndex = (oscIndex + 4) % scale.length;
          const freqs = [rootFreq, scale[thirdIndex], scale[fifthIndex]];

          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq / 2, ctx.currentTime);
            
            noteGain.gain.setValueAtTime(0, ctx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.4 + idx * 0.15);
            noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.3);

            osc.connect(noteGain);
            noteGain.connect(gainNode);

            osc.start();
            osc.stop(ctx.currentTime + 2.4);
          });

          noteCount++;
        }, 2500);

        nodes.push({ stop: () => clearInterval(intervalId) });
      } else if (type === 'forest') {
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
        gainNode.connect(ctx.destination);

        const intervalId = setInterval(() => {
          if (ctx.state === 'closed') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(4600 + Math.random() * 400, now);
          
          chirpGain.gain.setValueAtTime(0, now);
          for (let i = 0; i < 4; i++) {
            chirpGain.gain.linearRampToValueAtTime(0.02, now + i * 0.04 + 0.01);
            chirpGain.gain.linearRampToValueAtTime(0, now + i * 0.04 + 0.03);
          }

          osc.connect(chirpGain);
          chirpGain.connect(gainNode);
          osc.start();
          osc.stop(now + 0.3);
        }, 1800);

        nodes.push({ stop: () => clearInterval(intervalId) });
      }

      audioNodesRef.current = nodes;
    } catch (e) {}
  };

  const stopContinuousSynth = () => {
    if (audioNodesRef.current && audioNodesRef.current.length > 0) {
      audioNodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      audioNodesRef.current = [];
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  // Safe release of audio on unmount
  useEffect(() => {
    return () => {
      stopContinuousSynth();
    };
  }, []);

  // Sync synthesizer state changes
  useEffect(() => {
    startContinuousSynth(editorBgmType);
  }, [editorBgmType]);

  // AI style text-polisher library
  const applyAiPolish = (style: 'poetic' | 'nonsense' | 'sassy' | 'warm') => {
    if (!newContent.trim()) return;
    
    let polished = newContent.trim();
    
    // Poetic Prose Enhancing
    if (style === 'poetic') {
      const headers = [
        "「在日光的缝隙中，日子被轻声写成了诗。」\n\n",
        "「当风拂过岛屿，有些细碎的思绪如潮水般涌来。」\n\n",
        "「星光不言，在时光的褶皱里，我写下这些句子。」\n\n"
      ];
      const footers = [
        "\n\n—— 愿所有的碎屑，都能在时光中开出温柔的花朵。🍂",
        "\n\n—— 时间很慢，我们慢慢走，在文字里相遇。🕯️",
        "\n\n—— 静守一隅，让那些微弱的心跳，在此处恒温。✨"
      ];
      const randomHead = headers[Math.floor(Math.random() * headers.length)];
      const randomFoot = footers[Math.floor(Math.random() * footers.length)];
      polished = randomHead + polished.replace(/[。！]/g, " —— ") + randomFoot;
      
    // Sassy Excitement Drama Formatter
    } else if (style === 'sassy') {
      const spammed = polished.split("\n").map(line => {
        if (!line.trim()) return line;
        return `${line} ！！！💅💃✨ 真的一整个被治愈到了（或者大动作）！👀💖💥`;
      }).join("\n");
      polished = `啊啊啊啊啊！救命！！！👇👇👇\n\n${spammed}\n\n天呐！今天的精神状况依然超级好！！！🌈🍕🥳`;
      
    // Nonsensical Rambling Literals
    } else if (style === 'nonsense') {
      const ramblingIntro = "「关于我正在写的这篇日记，其实质就是一件关于我写下内容的事情。俗话说得好，听君一席话，如听一席话...」\n\n";
      const ramblingOutro = "\n\n「总而言之，以上这些话讲完之后就是我讲的所有话，至于究竟讲了什么，大概就是大家看到的这一段文字所表达的主旨吧。」";
      polished = ramblingIntro + polished.split("。").join("，也就是说这确实就是这样。") + ramblingOutro;
      
    // Warm Affectionate Whispers
    } else if (style === 'warm') {
      polished = `⭐ 亲爱的你，辛苦啦。在这个温暖的世界里，请听我温柔地告诉你：\n\n${polished}\n\n希望今天做个好梦，生活虽然辛苦，但你已经亮得像星星一样啦！🧸🧁🌷🌙`;
    }

    setNewContent(polished);
  };

  const moodOptions = ['😊', '🥰', '😔', '😤', '😴', '✨', '☁️', '🌙', '🍃'];
  const weatherOptions = ['☀️', '☁️', '🌧️', '❄️', '🌪️', '🌫️', '🌤️', '🌙'];

  // Future Letter State
  const letterStorageKey = 'island_future_letters';
  const [letters, setLetters] = useState<FutureLetter[]>(() => {
    const saved = localStorage.getItem(letterStorageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Failed to parse letters', e); }
    }
    return [{
      id: 'letter-1',
      writeDate: '2026-05-01',
      deliverDate: '2026-06-01',
      title: '给未来的自己',
      content: '嗨！当你收到这封信的时候，是否已经完成那个设定的目标了呢？希望你一切都好。',
      isOpened: false,
      stamp: '🛸',
      type: 'future'
    } as FutureLetter];
  });

  const [mainTab, setMainTab] = useState<'memory' | 'letter'>('memory');
  const [isWritingLetter, setIsWritingLetter] = useState(false);
  
  // Letter Form
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterDeliverDate, setNewLetterDeliverDate] = useState('');
  const [newLetterStamp, setNewLetterStamp] = useState('💌');
  const [newLetterType, setNewLetterType] = useState<'future' | 'past' | 'other'>('future');
  const [newLetterRecipient, setNewLetterRecipient] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);

  // User Profile State for Island Mode
  const profileStorageKey = 'island_user_profile';
  const initProfile = () => {
    const saved = safeGetItem(profileStorageKey);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return {
          username: parsed.username || "岛主",
          signature: parsed.signature || "记录点滴，不负韶华",
          startupGreeting: parsed.startupGreeting || "屿 · 记",
          avatarUrl: parsed.avatarUrl || "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg"
        };
      } catch (e) {}
    }
    return {
      username: "岛主",
      signature: "记录点滴，不负韶华",
      startupGreeting: "屿 · 记",
      avatarUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg"
    }
  };
  const [theme, setTheme] = useState<'day' | 'night' | 'sunset' | 'misty'>(() => {
    const saved = safeGetItem('island_theme');
    return (saved as any) || 'day';
  });

  useEffect(() => {
    safeSetItem('island_theme', theme);
  }, [theme]);

  const [profile, setProfile] = useState(initProfile());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileMenuStep, setProfileMenuStep] = useState<'main' | 'edit_profile' | 'avatar_options' | 'calendar' | 'settings' | 'theme_picker' | 'special_days' | 'add_special_day'>('main');
  
  const [menuPosition, setMenuPosition] = useState({ top: 160, left: 32 });

  const openMenu = (e: React.MouseEvent, step: typeof profileMenuStep) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 340;
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 20) {
      left = window.innerWidth - menuWidth - 20;
    }
    setMenuPosition({ top: rect.bottom + 12, left: Math.max(20, left) });
    setProfileMenuStep(step);
    setShowProfileMenu(true);
  };

  const [customBgUrl, setCustomBgUrl] = useState<string | null>(() => safeGetItem('island_custom_bg'));
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = safeGetItem('island_bg_opacity');
    return saved ? parseFloat(saved) : 1;
  });

  const [specialDays, setSpecialDays] = useState<SpecialDay[]>(() => {
    const saved = safeGetItem('island_special_days');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: '1', title: '屿·记 诞生', date: '2026-05-01', category: 'anniversary', isCountUp: true }
    ];
  });

  const [newSpecialDayTitle, setNewSpecialDayTitle] = useState('');
  const [newSpecialDayDate, setNewSpecialDayDate] = useState('');
  const [newSpecialDayCategory, setNewSpecialDayCategory] = useState<'anniversary' | 'birthday' | 'other'>('anniversary');

  useEffect(() => {
    if (customBgUrl) safeSetItem('island_custom_bg', customBgUrl);
    else localStorage.removeItem('island_custom_bg');
  }, [customBgUrl]);

  useEffect(() => {
    safeSetItem('island_bg_opacity', bgOpacity.toString());
  }, [bgOpacity]);

  useEffect(() => {
    safeSetItem('island_special_days', JSON.stringify(specialDays));
  }, [specialDays]);

  const [showSigInput, setShowSigInput] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempProfileInput, setTempProfileInput] = useState('');
  const [editProfileForm, setEditProfileForm] = useState({ username: '', signature: '', startupGreeting: '' });
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bgFileInputRef = React.useRef<HTMLInputElement>(null);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    safeSetItem(profileStorageKey, JSON.stringify(profile));
  }, [profile, profileStorageKey]);

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({ ...profile, avatarUrl: event.target?.result as string });
        if (profileMenuStep !== 'edit_profile') {
          setShowProfileMenu(false);
          setProfileMenuStep('main');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomBgUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUrlSubmit = () => {
    if (tempProfileInput.trim()) {
      setProfile({ ...profile, avatarUrl: tempProfileInput.trim() });
    }
    if (profileMenuStep !== 'edit_profile') {
      setShowProfileMenu(false);
      setProfileMenuStep('main');
    }
    setShowUrlInput(false);
    setTempProfileInput('');
  };

  const handleSigSubmit = () => {
    if (tempProfileInput.trim()) {
      setProfile({ ...profile, signature: tempProfileInput.trim() });
    }
    setShowProfileMenu(false);
    setShowSigInput(false);
    setTempProfileInput('');
  };

  useEffect(() => {
    safeSetItem(letterStorageKey, JSON.stringify(letters));
  }, [letters, letterStorageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const filteredEntries = activeFilter === 'all' 
    ? entries 
    : entries.filter(e => e.images && e.images.length > 0);

  // Stats calculation
  const moodStats = entries.reduce((acc, curr) => {
    if (curr.mood) acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allImages = entries.flatMap(e => e.images || []).filter(Boolean);
  const allLocations = Array.from(new Set(entries.map(e => e.location).filter(Boolean)));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0] as Blob);
      setNewImages([...newImages, url]);
    }
  };

  const handleSaveEntry = () => {
    if (!newContent.trim()) return;

    const now = new Date();
    const newEntry: DiaryEntry = {
      id: Math.random().toString(36).substring(2, 11),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().substring(0, 5),
      title: newTitle.trim() || '无题',
      content: newContent,
      mood: newMood,
      weather: newWeather,
      images: newImages,
      location: newLocation,
      folder: newFolder,
      isLocked: isLocked,
      // @ts-ignore
      paperStyle: newPaperStyle,
      fontSize: editorFontSize,
      fontFamily: editorFontFamily,
      textAlign: editorTextAlign,
      stickers: editorStickers,
    };

    setEntries([newEntry, ...entries]);
    setIsAddingEntry(false);
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewImages([]);
    setNewMood('😊');
    setNewWeather('☀️');
    setNewLocation('');
    setNewFolder('生活');
    setIsLocked(false);
    setNewPaperStyle('minimal');
    setEditorFontSize(16);
    setEditorFontFamily('font-serif');
    setEditorTextAlign('left');
    setEditorBgmType('none');
    setEditorStickers([]);
  };

  const handleSaveLetter = () => {
    if (!newLetterContent.trim() || !newLetterDeliverDate) return;

    const now = new Date();
    const newLetter: FutureLetter = {
      id: crypto.randomUUID(),
      writeDate: now.toISOString().split('T')[0],
      deliverDate: newLetterType === 'past' ? now.toISOString().split('T')[0] : newLetterDeliverDate,
      title: newLetterTitle.trim() || (newLetterType === 'past' ? '给过去的一封信' : '无题信件'),
      content: newLetterContent,
      isOpened: newLetterType === 'past', // Past letters are openable immediately but conceptually to the past
      stamp: newLetterStamp,
      type: newLetterType,
      recipient: newLetterType === 'other' ? newLetterRecipient : undefined
    };

    setLetters([newLetter, ...letters]);
    setIsWritingLetter(false);
    // Reset form
    setNewLetterTitle('');
    setNewLetterContent('');
    setNewLetterDeliverDate('');
    setNewLetterStamp('💌');
    setNewLetterType('future');
    setNewLetterRecipient('');
  };

  const getThemeConfig = () => {
    switch (theme) {
      case 'day': return {
        bg: 'bg-[#fcfaf7]',
        paperBg: 'bg-transparent',
        panelBg: 'bg-[#fffefc]',
        text: 'text-[#5a544e]',
        secondary: 'text-[#8b7e74]',
        accent: 'bg-[#a3b18a]',
        accentText: 'text-[#588157]',
        border: 'border-[#e5e0d8] border-dashed',
        shadow: 'shadow-none',
        btnBg: 'bg-transparent',
        line: 'border-[#e5e0d8]'
      };
      case 'night': return {
        bg: 'bg-[#2b2d42]',
        paperBg: 'bg-transparent',
        panelBg: 'bg-[#3d405b]',
        text: 'text-[#f4f1de]',
        secondary: 'text-[#9fa4c4]',
        accent: 'bg-[#81b29a]',
        accentText: 'text-[#81b29a]',
        border: 'border-[#3d405b] border-dashed',
        shadow: 'shadow-none',
        btnBg: 'bg-transparent',
        line: 'border-[#3d405b]'
      };
      case 'sunset': return {
        bg: 'bg-[#fcf4e8]',
        paperBg: 'bg-transparent',
        panelBg: 'bg-[#fffbf0]',
        text: 'text-[#6d4c41]',
        secondary: 'text-[#a1887f]',
        accent: 'bg-[#e5989b]',
        accentText: 'text-[#e5989b]',
        border: 'border-[#f2e6d5] border-dashed',
        shadow: 'shadow-none',
        btnBg: 'bg-transparent',
        line: 'border-[#f2e6d5]'
      };
      case 'misty': return {
        bg: 'bg-[#f8fafb]',
        paperBg: 'bg-transparent',
        panelBg: 'bg-[#ffffff]',
        text: 'text-[#4a5568]',
        secondary: 'text-[#718096]',
        accent: 'bg-[#90be6d]',
        accentText: 'text-[#90be6d]',
        border: 'border-[#edf2f7] border-dashed',
        shadow: 'shadow-none',
        btnBg: 'bg-transparent',
        line: 'border-[#edf2f7]'
      };
      default: return {
        bg: 'bg-[#fcfaf7]',
        paperBg: 'bg-transparent',
        panelBg: 'bg-[#fffefc]',
        text: 'text-[#5a544e]',
        secondary: 'text-[#8b7e74]',
        accent: 'bg-[#a3b18a]',
        accentText: 'text-[#588157]',
        border: 'border-[#e5e0d8] border-dashed',
        shadow: 'shadow-none',
        btnBg: 'bg-transparent',
        line: 'border-[#e5e0d8]'
      };
    }
  };

  const t = getThemeConfig();

  return (
    <div className={`h-full flex flex-col ${isIsland ? `${t.bg} overflow-hidden` : bgClass} ${fontClass} relative paper-grain`}>
      {isIsland && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Subtle background texture */}
          <div className="absolute inset-0 transition-all duration-1000 opacity-20" style={{ 
            backgroundImage: customBgUrl ? `url(${customBgUrl})` : 'radial-gradient(#e5e0d8 0.5px, transparent 0.5px)',
            backgroundSize: customBgUrl ? 'cover' : '20px 20px',
            backgroundPosition: 'center',
          }} />
        </div>
      )}

      <div className={`relative z-10 w-full shrink-0 ${isIsland ? 'px-8 pt-8 pb-4' : 'border-b border-amber-900/10 p-6 flex flex-col gap-6'}`}>
        {isIsland ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full">
            <div className="flex justify-between items-center w-full">
               <div className="flex flex-col gap-4">
                  <div className="relative group/greeting">
                    <motion.h1 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className={`text-[54px] font-elegant-zh ${t.text} tracking-[0.1em] leading-none cursor-default select-none flex items-center gap-1 py-2`}
                    >
                      {profile.startupGreeting.split('').map((char, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 20, rotate: -20 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            type: "spring",
                            stiffness: 260,
                            damping: 20 
                          }}
                          whileHover={{ 
                            y: -12,
                            scale: 1.3,
                            rotate: index % 2 === 0 ? 8 : -8,
                            filter: "drop-shadow(0 0 12px rgba(255,191,0,0.4))",
                          }}
                          className="inline-block relative"
                        >
                          {char === ' ' ? '\u00A0' : char}
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            whileHover={{ opacity: 1, scale: 1 }}
                            className="absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none"
                          >
                            <div className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
                          </motion.div>
                        </motion.span>
                      ))}
                      <motion.div
                        animate={{ 
                          y: [0, -8, 0],
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="ml-3 group-hover/greeting:scale-125 transition-transform"
                      >
                        <div className="relative">
                          <Sparkles className="w-6 h-6 text-amber-500/80" />
                          <div className="absolute inset-0 blur-sm bg-amber-400/20 rounded-full scale-150 animate-pulse" />
                        </div>
                      </motion.div>
                    </motion.h1>
                    
                    {/* Decorative floating leaves/petals */}
                    <div className="absolute -top-4 -right-8 pointer-events-none overflow-visible">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            x: [0, 10 + i * 5, 0],
                            y: [0, i * 10 - 5, 0],
                            rotate: [0, 360],
                            opacity: [0, 0.6, 0]
                          }}
                          transition={{ 
                            duration: 10 + i * 2, 
                            repeat: Infinity, 
                            delay: i * 3,
                            ease: "linear"
                          }}
                          className="absolute"
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-200/40 blur-[1px]" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Profile + Stats Row */}
                  <div className="flex items-center gap-8">
                     <div className="flex items-center gap-3 relative group">
                        <div 
                           onClick={(e) => openMenu(e, 'main')}
                           className="relative cursor-pointer"
                        >
                           <img 
                             src={profile.avatarUrl} 
                             className={`w-12 h-12 rounded-2xl object-cover shadow-sm bg-white/10 border border-white/20 hover:opacity-80 transition-opacity`} 
                             referrerPolicy="no-referrer" 
                             alt="Avatar"
                           />
                           <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                              <Sparkles className={`w-2.5 h-2.5 ${t.accentText}`} />
                           </div>
                        </div>
                        <div className="flex flex-col">
                           <span className={`text-[12px] font-black ${t.text} uppercase tracking-tight`}>{profile.username || '岛民个人资料'}</span>
                           <span 
                              onClick={(e) => {
                                setEditProfileForm({
                                  username: profile.username || '',
                                  signature: profile.signature || '',
                                  startupGreeting: profile.startupGreeting || '屿 · 记'
                                });
                                openMenu(e, 'edit_profile');
                              }}
                              className={`text-[10px] ${t.secondary} font-medium opacity-80 cursor-pointer hover:${t.accentText} transition-colors flex items-center gap-1 mt-0.5`}
                           >
                              {profile.signature || '点击设置签名...'}
                              <PenLine className="w-2.5 h-2.5 opacity-40" />
                           </span>
                        </div>
                     </div>

                     <div className={`h-8 w-px bg-current opacity-10 mx-2`} />

                     <div className="flex items-center gap-6">
                        <div 
                          onClick={(e) => openMenu(e, 'entries_stats')}
                          className="flex flex-col items-start cursor-pointer group"
                        >
                           <span className={`text-[18px] font-black ${t.text} group-hover:${t.accentText} transition-colors`}>{entries.length}</span>
                           <span className={`text-[9px] font-bold ${t.secondary} uppercase tracking-widest opacity-60`}>笔触</span>
                        </div>
                        <div 
                          onClick={(e) => openMenu(e, 'letters_stats')}
                          className="flex flex-col items-start cursor-pointer group"
                        >
                           <span className={`text-[18px] font-black ${t.text} group-hover:${t.accentText} transition-colors`}>{letters.length}</span>
                           <span className={`text-[9px] font-bold ${t.secondary} uppercase tracking-widest opacity-60`}>飞鸽</span>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className={`flex items-center gap-2 md:gap-3 ${t.text} self-end pb-1`}>
                  <button onClick={(e) => openMenu(e, 'calendar')} className={`flex items-center gap-1.5 p-2.5 rounded-2xl bg-white/5 md:px-4 hover:-translate-y-0.5 transition-all group border border-white/10 backdrop-blur-md shadow-sm`}>
                     <Calendar className={`w-4 h-4 ${t.secondary} group-hover:text-amber-600 transition-colors`} />
                     <span className={`text-[11px] font-bold ${t.secondary} group-hover:${t.text} hidden md:inline`}>回忆录</span>
                  </button>
                  <button onClick={(e) => openMenu(e, 'special_days')} className={`flex items-center gap-1.5 p-2.5 rounded-2xl bg-white/5 md:px-4 hover:-translate-y-0.5 transition-all group border border-white/10 backdrop-blur-md shadow-sm relative`}>
                     <Clock className={`w-4 h-4 ${t.secondary} group-hover:text-pink-500 transition-colors`} />
                     <span className={`text-[11px] font-bold ${t.secondary} group-hover:${t.text} hidden md:inline`}>纪念日</span>
                     {specialDays.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse shadow-sm" />}
                  </button>
                  <button onClick={(e) => openMenu(e, 'settings')} className={`flex items-center gap-1.5 p-2.5 rounded-2xl bg-white/5 md:px-4 hover:-translate-y-0.5 transition-all group border border-white/10 backdrop-blur-md shadow-sm`}>
                     <Settings className={`w-4 h-4 ${t.secondary} group-hover:text-blue-500 transition-colors`} />
                     <span className={`text-[11px] font-bold ${t.secondary} group-hover:${t.text} hidden md:inline`}>设置</span>
                  </button>
               </div>
            </div>
          </div>

        ) : (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-amber-950 font-serif">
                日记簿
              </h2>
              <p className="text-xs text-amber-800/60 font-serif italic">
                Personal Diary Space
              </p>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isIsland ? 'pb-32 px-4' : 'p-4 md:p-10'}`}>
        {isIsland && (
          <div className="max-w-4xl mx-auto w-full relative">
            <div className={`flex justify-center gap-8 mb-12 relative h-1`}>
               {/* Original tab areas removed as requested, content managed via mainTab elsewhere if needed */}
               {/* Using hidden tabs to keep state consistency if necessary, but strictly following 'remove' instruction for the data bars replacing them */}
            </div>
          </div>
        )}


          <AnimatePresence mode="wait">
                {showProfileMenu && (
                  <>
                    <motion.div 
                      key="profile-menu-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[90]" 
                      onClick={() => {
                          setShowProfileMenu(false);
                          setProfileMenuStep('main');
                          setShowUrlInput(false);
                          setShowSigInput(false);
                      }}
                    />
                    <motion.div 
                      key="profile-menu-content"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className={`fixed w-[340px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col z-[100]`}
                      style={{ top: menuPosition.top, left: menuPosition.left }}
                    >
                    {/* Header showing current step */}
                    <div className={`bg-black/5 px-6 py-4 border-b border-white/10 flex items-center justify-between`}>
                      <span className={`text-[11px] font-black ${t.text} uppercase tracking-[0.15em] gap-2 flex items-center`}>
                        {profileMenuStep === 'main' && '岛心档案 Profile'}
                        {profileMenuStep === 'edit_profile' && '编辑档案 Edit Profile'}
                        {profileMenuStep === 'entries_stats' && '我的笔触统计 Stats'}
                        {profileMenuStep === 'letters_stats' && '飞鸽传书概览 Letters'}
                        {profileMenuStep === 'calendar' && '回忆录 Calendar'}
                        {profileMenuStep === 'special_days' && '纪念日 Days Matter'}
                        {profileMenuStep === 'add_special_day' && '纪录新日子'}
                        {profileMenuStep === 'settings' && '应用偏好 Settings'}
                        {profileMenuStep === 'theme_picker' && '岛屿气象 Theme'}
                        {profileMenuStep === 'avatar_options' && '修改形象'}
                      </span>
                      {['add_special_day', 'theme_picker', 'edit_profile'].includes(profileMenuStep) ? (
                        <button onClick={(e) => { e.stopPropagation(); setProfileMenuStep(profileMenuStep === 'add_special_day' ? 'special_days' : profileMenuStep === 'edit_profile' ? 'main' : 'settings'); }} className={`text-[10px] font-black text-white bg-black px-3 py-1 rounded-full transition-transform active:scale-95`}>返回</button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); }} className={`p-1.5 hover:bg-black/5 rounded-full transition-colors`}><X className="w-3.5 h-3.5" /></button>
                      )}
                    </div>

                    <div className="p-4 flex flex-col max-h-[500px] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                        {profileMenuStep === 'main' && !showSigInput && !showUrlInput && (
                          <div className="flex flex-col gap-4">
                             <div className="flex items-center gap-4 p-2">
                                <img 
                                  src={profile.avatarUrl} 
                                  className="w-16 h-16 rounded-3xl object-cover ring-2 ring-white/20" 
                                  alt="Avatar"
                                />
                                <div className="flex flex-col">
                                   <span className={`text-base font-black ${t.text}`}>{profile.username || '岛主'}，您好</span>
                                   <span className={`text-[10px] ${t.secondary} opacity-60 font-medium`}>正在由你定义的岛屿上漫游</span>
                                </div>
                             </div>

                             <div className="flex flex-col gap-1">
                                <button onClick={() => {
                                  setEditProfileForm({
                                    username: profile.username || '',
                                    signature: profile.signature || '',
                                    startupGreeting: profile.startupGreeting || ''
                                  });
                                  setProfileMenuStep('edit_profile');
                                }} className="w-full h-11 flex items-center gap-3 px-4 rounded-2xl hover:bg-black/5 transition-colors group">
                                   <PenLine className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                   <span className="text-[11px] font-bold">编辑个人资料</span>
                                </button>
                             </div>
                          </div>
                        )}

                        {profileMenuStep === 'edit_profile' && !showUrlInput && (
                          <div className="flex flex-col gap-4 p-2">
                            <div className="flex flex-col gap-1 items-center">
                                <img 
                                  src={profile.avatarUrl} 
                                  className="w-16 h-16 rounded-3xl object-cover ring-2 ring-white/20 mb-2" 
                                  alt="Avatar"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 text-[10px] font-bold bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">上传本地头像</button>
                                  <button onClick={() => { setTempProfileInput(''); setShowUrlInput(true); }} className="px-3 py-1.5 text-[10px] font-bold bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-colors shadow-sm">使用链接修改</button>
                                </div>
                            </div>
                            
                            <div className="h-px bg-white/20 w-full my-1"></div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">用户名 Username</label>
                              <input type="text" value={editProfileForm.username} onChange={e => setEditProfileForm({...editProfileForm, username: e.target.value})} placeholder="例如：岛主" className="w-full bg-white/50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">个性签名 Signature</label>
                              <input type="text" value={editProfileForm.signature} onChange={e => setEditProfileForm({...editProfileForm, signature: e.target.value})} placeholder="例如：记录点滴，不负韶华" className="w-full bg-white/50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">题头启动语 Startup Greeting</label>
                              <input type="text" value={editProfileForm.startupGreeting} onChange={e => setEditProfileForm({...editProfileForm, startupGreeting: e.target.value})} placeholder="例如：屿 · 记" className="w-full bg-white/50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>

                            <button onClick={() => {
                              setProfile({
                                ...profile,
                                username: editProfileForm.username,
                                signature: editProfileForm.signature,
                                startupGreeting: editProfileForm.startupGreeting || '屿 · 记'
                              });
                              setProfileMenuStep('main');
                            }} className="w-full py-2.5 mt-2 text-[11px] font-bold text-white bg-blue-500 rounded-xl shadow-md transition-all hover:scale-[1.02]">
                              保存个人资料
                            </button>
                          </div>
                        )}

                        {profileMenuStep === 'entries_stats' && (
                           <div className="p-2 flex flex-col gap-6">
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="p-4 rounded-3xl bg-black/5 flex flex-col gap-1">
                                    <span className="text-[24px] font-black">{entries.length}</span>
                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">累计笔触</span>
                                 </div>
                                 <div className="p-4 rounded-3xl bg-black/5 flex flex-col gap-1">
                                    <span className="text-[24px] font-black">{allImages.length}</span>
                                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest">影像存根</span>
                                 </div>
                              </div>
                              <div className="flex flex-col gap-3">
                                 <span className="text-[10px] font-black opacity-30 uppercase tracking-widest px-1">心境气候</span>
                                 <div className="flex flex-wrap gap-2">
                                    {Object.entries(moodStats).length > 0 ? Object.entries(moodStats).map(([mood, count]) => (
                                       <div key={mood} className="px-3 py-2 rounded-2xl bg-white/30 border border-white/20 flex items-center gap-2">
                                          <span className="text-lg">{mood}</span>
                                          <span className="text-[11px] font-black">{count}</span>
                                       </div>
                                    )) : <span className="text-[10px] opacity-40 px-1 italic">尚无波动记录</span>}
                                 </div>
                              </div>
                              <button 
                                 onClick={() => { setMainTab('memory'); setShowProfileMenu(false); }}
                                 className="w-full py-3 bg-black text-white text-[11px] font-bold rounded-2xl shadow-lg active:scale-95 transition-all mt-2"
                              >
                                 浏览记忆
                              </button>
                           </div>
                        )}

                        {profileMenuStep === 'letters_stats' && (
                           <div className="p-2 flex flex-col gap-6">
                              <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-50/50 to-blue-50/50 border border-white/20 flex flex-col gap-4">
                                 <div className="flex justify-between items-center">
                                    <Mail className="w-8 h-8 text-pink-300" />
                                    <span className="text-[32px] font-black text-[#5a544e]">{letters.length}</span>
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-[12px] font-black">时光飞鸽</span>
                                    <span className="text-[10px] opacity-60">共有 {letters.filter(l => !l.isOpened).length} 封未读的漂流信件</span>
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-2">
                                 {['future', 'past', 'other'].map(type => (
                                    <div key={type} className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-black/5">
                                       <span className="text-[16px] font-black">{letters.filter(l => l.type === type).length}</span>
                                       <span className="text-[8px] font-bold opacity-40 uppercase">{type === 'future' ? '未来' : type === 'past' ? '过去' : '他人'}</span>
                                    </div>
                                 ))}
                              </div>

                              <button 
                                 onClick={() => { setMainTab('letter'); setShowProfileMenu(false); }}
                                 className="w-full py-3 bg-black text-white text-[11px] font-bold rounded-2xl shadow-lg active:scale-95 transition-all mt-2"
                              >
                                 进入邮局
                              </button>
                           </div>
                        )}

                        {profileMenuStep === 'calendar' && (
                          <div className="p-2 flex flex-col gap-4">
                            <div className="flex justify-between items-center px-1">
                              <div className="text-[11px] font-black tracking-widest text-gray-800">
                                {calendarViewDate.getFullYear()}年 {calendarViewDate.getMonth() + 1}月
                              </div>
                              <div className="flex gap-1">
                                <button onClick={handlePrevMonth} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><ChevronLeft className="w-3 h-3 text-gray-600" /></button>
                                <button onClick={handleNextMonth} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><ChevronRight className="w-3 h-3 text-gray-600" /></button>
                              </div>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                               {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                                 <div key={d} className="text-center text-[9px] font-bold text-gray-400 py-1">{d}</div>
                               ))}
                               {Array.from({ length: getFirstDayOfMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth()) }).map((_, i) => (
                                 <div key={`empty-${i}`} className="h-7" />
                               ))}
                               {Array.from({ length: getDaysInMonth(calendarViewDate.getFullYear(), calendarViewDate.getMonth()) }).map((_, i) => {
                                 const day = i + 1;
                                 const dateStr = `${calendarViewDate.getFullYear()}-${String(calendarViewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                 const hasEntry = entries.some(e => e.date === dateStr);
                                 const isToday = day === new Date().getDate() && calendarViewDate.getMonth() === new Date().getMonth();
                                 return (
                                   <div key={day} className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold cursor-default ${hasEntry ? 'bg-blue-500 text-white shadow-md' : isToday ? 'bg-blue-50 text-blue-500 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                                     {day}
                                   </div>
                                 )
                               })}
                            </div>
                            <button onClick={() => setProfileMenuStep('special_days')} className="w-full py-2.5 bg-gray-50 hover:bg-blue-50 text-[10px] font-bold text-blue-600 rounded-xl transition-all border border-blue-100 mb-1">⚙️ 管理纪念日 Special Days</button>
                          </div>
                        )}

                        {profileMenuStep === 'special_days' && (
                          <div className="flex flex-col gap-2 p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">记录清单</span>
                               <button onClick={() => setProfileMenuStep('add_special_day')} className="text-[9px] font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full">+ 新增</button>
                            </div>
                            {specialDays.length === 0 ? (
                              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                                <span className="text-[10px] text-gray-400 font-bold">还没有记录重要的日子</span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {specialDays.map(sd => {
                                  const targetDate = new Date(sd.date);
                                  const today = new Date();
                                  today.setHours(0,0,0,0);
                                  targetDate.setHours(0,0,0,0);
                                  
                                  const diffTime = Math.abs(today.getTime() - targetDate.getTime());
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  const isFuture = targetDate > today;

                                  return (
                                    <div key={sd.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-between group shadow-sm">
                                      <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-black text-gray-800">{sd.title}</span>
                                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${sd.category === 'anniversary' ? 'bg-blue-50 text-blue-500' : sd.category === 'birthday' ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-500'}`}>
                                            {sd.category === 'anniversary' ? '纪念' : sd.category === 'birthday' ? '生日' : '其他'}
                                          </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-400 mt-1">{sd.date}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{isFuture ? '还有' : '已经'}</span>
                                          <div className="flex items-baseline gap-0.5">
                                            <span className={`text-lg font-black ${isFuture ? 'text-pink-500' : 'text-blue-500'}`}>{diffDays}</span>
                                            <span className="text-[9px] font-bold text-gray-400">天</span>
                                          </div>
                                        </div>
                                        <button 
                                          onClick={() => setSpecialDays(specialDays.filter(day => day.id !== sd.id))}
                                          className="p-1.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {profileMenuStep === 'add_special_day' && (
                          <div className="p-3 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">事件名称 Event name</label>
                              <input 
                                type="text" 
                                value={newSpecialDayTitle}
                                onChange={e => setNewSpecialDayTitle(e.target.value)}
                                placeholder="例：遇见你的第一天"
                                className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-100"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">日期 Date</label>
                              <input 
                                type="date" 
                                value={newSpecialDayDate}
                                onChange={e => setNewSpecialDayDate(e.target.value)}
                                className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-pink-100"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">类型 Category</label>
                              <div className="grid grid-cols-3 gap-2">
                                {(['anniversary', 'birthday', 'other'] as const).map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setNewSpecialDayCategory(cat)}
                                    className={`py-2 text-[9px] font-bold rounded-xl transition-all border ${newSpecialDayCategory === cat ? 'bg-pink-50 border-pink-200 text-pink-600 ring-2 ring-pink-50' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                                  >
                                    {cat === 'anniversary' ? '纪念日' : cat === 'birthday' ? '生日' : '其他'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => setProfileMenuStep('special_days')} className="flex-1 py-2.5 text-[10px] font-bold bg-gray-100 rounded-xl">取消</button>
                              <button 
                                onClick={() => {
                                  if(!newSpecialDayTitle || !newSpecialDayDate) return;
                                  setSpecialDays([{
                                    id: Math.random().toString(36).substring(2, 9),
                                    title: newSpecialDayTitle,
                                    date: newSpecialDayDate,
                                    category: newSpecialDayCategory,
                                    isCountUp: new Date(newSpecialDayDate) < new Date()
                                  }, ...specialDays]);
                                  setProfileMenuStep('special_days');
                                  setNewSpecialDayTitle('');
                                  setNewSpecialDayDate('');
                                }}
                                className="flex-1 py-2.5 text-[10px] font-bold text-white bg-pink-500 rounded-xl shadow-lg shadow-pink-200 transition-all hover:scale-105"
                              >
                                保存记录
                              </button>
                            </div>
                          </div>
                        )}

                        {profileMenuStep === 'settings' && (
                          <div className="flex flex-col gap-2 p-1">
                            <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-2xl border border-blue-100/50 mb-2">
                              <span className="text-[10px] font-black text-blue-900">屿·记 Island 记录空间</span>
                              <span className="text-[9px] text-blue-500 tracking-wider">Version 2.0 - UI Renewed</span>
                            </div>

                            <button onClick={() => setProfileMenuStep('theme_picker')} className="w-full flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-all group">
                              <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-pink-500" />
                                <span className="text-[11px] font-bold text-gray-700">背景 - 主题</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">{customBgUrl ? '自定义' : theme}</span>
                                <ChevronRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </button>

                            <button onClick={() => {
                               const data = { entries, letters, profile, specialDays };
                               const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                               const url = URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url; a.download = 'island_data.json'; a.click(); URL.revokeObjectURL(url);
                            }} className="w-full flex justify-between items-center bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors">
                              <div className="flex items-center gap-3">
                                <Download className="w-4 h-4 text-gray-500" />
                                <span className="text-[11px] font-bold text-gray-700">导出我的数据</span>
                              </div>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                            </button>
                            <button onClick={() => {
                                if(confirm('清除所有记录？此操作不可恢复')) {
                                  setEntries([]); setLetters([]); setSpecialDays([]);
                                }
                              }} 
                              className="w-full flex items-center gap-3 bg-red-50 hover:bg-red-100 rounded-xl px-4 py-3 transition-colors mt-2"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span className="text-[11px] font-bold text-red-600">清除所有记录</span>
                            </button>
                          </div>
                        )}

                        {profileMenuStep === 'theme_picker' && (
                          <div className="flex flex-col gap-4 p-2">
                            <div className="flex flex-col gap-1 px-1">
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">预设主题 Presets</span>
                               <div className="grid grid-cols-2 gap-2 mt-1">
                                 <button 
                                   onClick={() => { setTheme('day'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'day' && !customBgUrl ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-gray-100 hover:border-blue-100'}`}
                                 >
                                   <div className="w-full h-10 rounded-lg flex items-center justify-center text-lg bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }}>☀️</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">日间明亮</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('night'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'night' && !customBgUrl ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-100'}`}
                                 >
                                   <div className="w-full h-10 rounded-lg flex items-center justify-center text-lg bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #1e130c 0%, #9a8478 100%)' }}>🌙</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">深夜沉静</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('sunset'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'sunset' && !customBgUrl ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' : 'bg-white border-gray-100 hover:border-orange-100'}`}
                                 >
                                   <div className="w-full h-10 rounded-lg flex items-center justify-center text-lg bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' }}>🌅</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">落日余晖</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('misty'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'misty' && !customBgUrl ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
                                 >
                                   <div className="w-full h-10 rounded-lg flex items-center justify-center text-lg bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>🌲</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">森林氧吧</span>
                                 </button>
                               </div>
                            </div>

                            <div className="h-px bg-gray-100 mx-2" />

                            <div className="flex flex-col gap-3 px-1">
                               <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">自定义背景 Custom Background</span>
                                 {customBgUrl && (
                                   <button onClick={() => setCustomBgUrl(null)} className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">重置</button>
                                 )}
                               </div>
                               
                               <button 
                                 onClick={() => bgFileInputRef.current?.click()}
                                 className={`w-full py-3.5 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all group ${customBgUrl ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                               >
                                 <ImageIcon className={`w-4 h-4 ${customBgUrl ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                 <span className={`text-[11px] font-bold ${customBgUrl ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`}>
                                   {customBgUrl ? '更换背景图片' : '上传自定义背景图片'}
                                 </span>
                               </button>

                               <div className="flex flex-col gap-2 p-1">
                                 <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">背景透明度 Opacity</span>
                                   <span className="text-[10px] font-black text-blue-500">{Math.round(bgOpacity * 100)}%</span>
                                 </div>
                                 <input 
                                   type="range" 
                                   min="0.1" 
                                   max="1" 
                                   step="0.05" 
                                   value={bgOpacity} 
                                   onChange={e => setBgOpacity(parseFloat(e.target.value))}
                                   className="w-full accent-blue-500 h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                 />
                               </div>
                            </div>
                          </div>
                        )}

                        {/* avatar_options, url/sig input */}
                        {showUrlInput && (
                          <div className="p-3 flex flex-col gap-3">
                            <input type="text" value={tempProfileInput} onChange={e => setTempProfileInput(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            <div className="flex gap-2">
                              <button onClick={() => setShowUrlInput(false)} className="flex-1 py-2 text-[10px] font-bold bg-gray-100 rounded-xl">取消</button>
                              <button onClick={() => {
                                handleProfileUrlSubmit();
                                if (profileMenuStep === 'edit_profile') {
                                  setShowProfileMenu(true);
                                  setProfileMenuStep('edit_profile');
                                  setShowUrlInput(false);
                                }
                              }} className="flex-1 py-2 text-[10px] font-bold text-white bg-blue-500 rounded-xl">确定</button>
                            </div>
                          </div>
                        )}
                     </div>
                  </motion.div>
                  </>
                )}
              </AnimatePresence>
           <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleProfileFileChange} 
            />
            <input 
              type="file" 
              ref={bgFileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBgFileChange} 
            />

        {!isIsland && (
          <div className="max-w-4xl mx-auto flex flex-col gap-16 pb-20">
            {Array.from(new Set<string>(entries.map(e => e.date))).map(dateStr => {
              const entriesForDate = entries.filter(e => e.date === dateStr);
              const dateObj = new Date(dateStr);
              const day = dateObj.getDate();
              const month = dateObj.toLocaleString('zh-CN', { month: 'short' });
              const weekday = dateObj.toLocaleString('zh-CN', { weekday: 'long' });
              const year = dateObj.getFullYear();
              
              return (
                <div key={dateStr} className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-8">
                  {/* Date Sidebar - Icity Style */}
                  <div className="flex md:flex-col items-start md:items-end gap-2 md:gap-0 sticky top-0 bg-[#fdfbf7] z-10 py-2">
                    <span className="text-5xl font-serif font-black text-amber-950/90 leading-none tracking-tighter">
                      {day < 10 ? `0${day}` : day}
                    </span>
                    <div className="flex flex-col md:items-end pt-1">
                      <span className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">{month} · {year}</span>
                      <span className="text-[9px] font-medium text-amber-900/20 uppercase tracking-widest mt-0.5">{weekday}</span>
                    </div>
                  </div>
                  
                  {/* Entries Stream */}
                  <div className="flex flex-col gap-12">
                    {entriesForDate.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                        className="flex flex-col gap-6"
                      >
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-amber-900/5 shadow-[0_4px_20px_-4px_rgba(120,60,0,0.03)] transition-all duration-700">
                          <div className="flex flex-col">
                            {/* Visual Section */}
                            {entry.images && entry.images.length > 0 && (
                              <div className="w-full border-b border-amber-900/5 bg-amber-50/30">
                                {entry.images.length === 1 ? (
                                  <div className="w-full h-auto max-h-[600px] overflow-hidden relative flex justify-center items-center">
                                    <img 
                                      src={entry.images[0]} 
                                      alt="preview" 
                                      className="w-full object-cover max-h-[600px]"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1 bg-white">
                                    {entry.images.map((img, i) => (
                                      <div key={i} className="aspect-square relative overflow-hidden rounded-[1.5rem]">
                                        <img 
                                          src={img} 
                                          alt="preview" 
                                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Content Section */}
                            <div className="p-8 md:p-12 flex flex-col">
                              <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                  <span className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-xl shadow-inner">
                                    {entry.mood}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-amber-900/30 uppercase tracking-[0.2em] font-serif">
                                      {entry.time}
                                    </span>
                                    {entry.location && (
                                      <span className="text-[10px] text-amber-900/40 font-serif italic truncate flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 text-amber-900/30" />
                                        {entry.location}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-900/5 rounded-full border border-amber-900/10">
                                  <span className="text-xs text-amber-900/60 font-medium">{entry.weather}</span>
                                </div>
                              </div>
                              
                              <h3 className="text-3xl font-serif font-black text-amber-950 mb-6 leading-tight tracking-tight">
                                {entry.title}
                              </h3>
                              
                              <div 
                                className="text-amber-900/80 text-lg font-serif leading-[2.2] whitespace-pre-wrap selection:bg-amber-100 drop-shadow-sm" 
                                dangerouslySetInnerHTML={{ __html: entry.content }} 
                              />
                              
                              <div className="mt-10 pt-6 border-t border-amber-900/5 flex justify-between items-center">
                                <div className="flex gap-6">
                                  <button className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest hover:text-amber-900 transition-colors">
                                    喜欢
                                  </button>
                                  <button className="text-[10px] font-black text-amber-900/30 uppercase tracking-widest hover:text-amber-900 transition-colors">
                                    评论
                                  </button>
                                </div>
                                <div className="text-[9px] font-serif font-black italic text-amber-900/20 tracking-widest uppercase">
                                  Life Traces Archive
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="h-px w-12 bg-amber-900/10 mx-auto group-last:hidden mt-2" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isIsland && mainTab === 'memory' && (
          <div className="max-w-3xl mx-auto flex flex-col h-full pb-20 relative z-20 w-full">
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 gap-6 w-full mt-20 opacity-40">
                <div className="text-6xl">🖋️</div>
                <div className="flex flex-col items-center text-center">
                  <p className={`text-lg font-bold text-[#5a544e]`}>记录当下的每一刻</p>
                  <p className={`text-xs text-[#8b7e74] mt-2`}>让时光在这里缓慢流淌</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full relative mt-6">
                {/* Center / Left-ish Timeline Line */}
                <div className={`absolute left-[70px] md:left-[100px] top-8 bottom-8 w-[2px] ${t.line} z-0 opacity-30`} />
                
                <div className="flex flex-col gap-12 w-full relative z-10 py-4">
                  {entries.map((entry, index) => {
                    const dateObj = new Date(entry.date);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('zh-CN', { month: 'short' });
                    const weekday = dateObj.toLocaleDateString('zh-CN', { weekday: 'short' });
                    const year = dateObj.getFullYear();

                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className={`flex w-full relative group items-start`}
                      >
                         {/* Time Side (Left) */}
                         <div className="w-[70px] md:w-[100px] shrink-0 flex flex-col items-end pr-6 md:pr-10 pt-2">
                            <span className={`text-[32px] md:text-[40px] font-black ${t.text} leading-none tracking-tighter`}>{day < 10 ? `0${day}` : day}</span>
                            <span className={`text-[10px] md:text-[11px] font-bold uppercase tracking-widest ${t.secondary} opacity-60 mt-1`}>{month} {year}</span>
                            <span className={`text-[9px] font-bold ${t.secondary} opacity-40 mt-1`}>{weekday}</span>
                            <span className={`text-[10px] font-medium ${t.text} opacity-30 mt-2`}>{entry.time}</span>
                         </div>

                         {/* Timeline Dot */}
                         <div className={`absolute left-[70px] md:left-[100px] -translate-x-1/2 top-10 w-4 h-4 rounded-full border-4 ${theme === 'night' ? 'border-[#2b2d42]' : 'border-white'} ${t.accent} z-20 shadow-sm group-hover:scale-125 transition-transform`} />
                         
                         {/* Card Side (Right) */}
                         <div className="flex-1 min-w-0">
                           {entry.isLocked && !unlockedEntries[entry.id] ? (
                             <DiaryPasscodeCard 
                               entry={entry}
                               onUnlock={() => setUnlockedEntries(prev => ({ ...prev, [entry.id]: true }))}
                               correctPin={customPinCode || '1234'}
                               t={t}
                               theme={theme}
                             />
                           ) : (
                             <div className={`flex flex-col w-full relative p-6 md:p-8 ${theme === 'night' ? 'bg-white/5 border-white/10' : 'bg-white/30 border-white/40'} border-[1.5px] backdrop-blur-[20px] rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden`}>
                               {/* Paper Texture Accent */}
                               <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                                  <Sparkles className={`w-full h-full ${t.accentText}`} />
                               </div>

                               <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                     <span className="text-xl filter grayscale-[0.3]">{entry.mood}</span>
                                     <span className="text-xl filter grayscale-[0.3]">{entry.weather}</span>
                                  </div>
                                  {entry.location && (
                                     <div className={`flex items-center gap-2 px-3 py-1 ${t.panelBg} border ${t.line} rounded-lg text-[9px] font-bold ${t.secondary} tracking-wider bg-white/40 backdrop-blur-sm shadow-sm`}>
                                       <MapPin className="w-3 h-3 opacity-50" />
                                       {entry.location}
                                     </div>
                                  )}
                               </div>

                               <div 
                                 onClick={() => setSelectedEntry(entry)}
                                 className="cursor-pointer flex flex-col relative"
                               >
                                  <h4 className={`text-2xl font-bold ${t.text} mb-4 leading-tight font-cute-zh group-hover:${t.accentText} transition-colors`}>{entry.title}</h4>
                                  <div className={`text-[16px] md:text-[17px] ${t.text} leading-[2] text-justify font-serif opacity-90 mb-6 line-clamp-3`} dangerouslySetInnerHTML={{ __html: entry.content }} />

                                  {entry.images && entry.images.length > 0 && (
                                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 w-full custom-scrollbar relative z-20">
                                      {entry.images.map((img, i) => (
                                        <div key={i} className={`w-40 h-52 shrink-0 ${theme === 'night' ? 'bg-white/10' : 'bg-white/60'} p-2 pb-8 shadow-sm rotate-[1deg] hover:rotate-0 transition-all border ${t.line} relative`}>
                                          <div className="w-full h-full overflow-hidden rounded-sm">
                                            <img src={img} className="w-full h-full object-cover" alt="diary" referrerPolicy="no-referrer" />
                                          </div>
                                          <div className={`absolute bottom-2 left-0 right-0 text-center text-[8px] font-bold font-serif opacity-30 ${t.secondary}`}>P.{i+1}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                               </div>

                               <div className="mt-4 flex justify-between items-center opacity-30">
                                  <div className={`h-[1px] flex-1 ${t.line} mr-4`} />
                                  <ArrowRight className="w-4 h-4" />
                                </div>
                             </div>
                           )}
                         </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingEntry(true)} 
              className={`fixed bottom-12 right-12 w-16 h-16 ${t.accent} text-white rounded-full flex items-center justify-center z-50 shadow-xl hover:scale-110 transition-all active:scale-95 group border-4 border-white/30`}
            >
               <PenLine className="w-7 h-7 group-hover:rotate-12 transition-transform" />
            </motion.button>
          </div>
        )}

        {isIsland && mainTab === 'letter' && (
          <div className="max-w-3xl mx-auto flex flex-col h-full pb-20 relative z-20 w-full">
            {/* Future Letter UI Header */}
            <div className={`flex justify-between items-end w-full mb-8 pt-8 ${t.border} bg-transparent`}>
               <div className="flex items-center gap-6">
                 <div className="flex flex-col items-start border-l-4 pl-4 border-[#e5989b]">
                   <h3 className={`text-[32px] font-black ${t.text} tracking-tight leading-none mb-2 font-cute-zh`}>岛屿来信</h3>
                   <p className={`text-[10px] font-bold ${t.secondary} uppercase tracking-widest`}>Letters to the Future</p>
                 </div>
               </div>
               <button 
                 onClick={() => setIsWritingLetter(true)}
                 className={`flex items-center gap-2 px-6 py-2.5 border ${t.border} ${t.text} rounded-full font-black text-sm bg-white/50 hover:bg-white active:scale-95 transition-all outline-none shadow-sm`}
               >
                 <PenLine className="w-4 h-4" />
                 开启信笺 Write a Letter
               </button>
            </div>
            
            <div className="flex flex-col gap-1 w-full relative z-10">
              <AnimatePresence>
                {letters.map((letter, i) => {
                  const isReady = new Date(letter.deliverDate) <= new Date();
                  return (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                      onClick={() => {
                        if (isReady) {
                          setSelectedLetter(letter);
                          if (!letter.isOpened) {
                            const newLetters = letters.map(l => l.id === letter.id ? { ...l, isOpened: true } : l);
                            setLetters(newLetters);
                            safeSetItem(letterStorageKey, JSON.stringify(newLetters));
                          }
                        }
                      }}
                      className={`flex flex-col w-full pb-12 mb-8 relative px-4 group border-b ${t.line} last:border-b-0 ${isReady ? 'cursor-pointer hover:opacity-80 transition-opacity' : 'opacity-60'}`}
                    >
                      {/* Decorative Envelope Element for Paper */}
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
                         <Mail className={`w-full h-full ${t.accentText}`} />
                      </div>
                      
                      <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex gap-4 items-center">
                          <div className={`text-4xl filter drop-shadow-sm`}>
                            {isReady ? letter.stamp : '💌'}
                          </div>
                          <div className="flex flex-col">
                            <h4 className={`font-bold text-2xl tracking-tight mb-1 font-cute-zh ${isReady ? `${t.text}` : `${t.secondary} opacity-50`}`}>
                              {isReady ? (letter.isOpened ? letter.title : '你有未拆阅的信件') : '时光锁定的信件'}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${t.secondary} opacity-60`}>
                                Send: {letter.writeDate.replace(/-/g, '.')}
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${letter.type === 'future' ? 'bg-blue-50 text-blue-500' : letter.type === 'past' ? 'bg-amber-50 text-amber-600' : 'bg-pink-50 text-pink-500'}`}>
                                {letter.type === 'future' ? '写给未来' : letter.type === 'past' ? '写给过去' : '传送他人'}
                              </span>
                              {letter.recipient && (
                                <span className={`text-[8px] font-bold ${t.secondary} opacity-40 italic`}>To: {letter.recipient}</span>
                              )}
                            </div>
                          </div>
                          {isReady && !letter.isOpened && (
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse ml-2" />
                          )}
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest border ${isReady ? (letter.isOpened ? `${t.text} opacity-30 border-[#e5e0d8] bg-transparent` : `text-[#e5989b] border-[#e5989b]/30 bg-[#e5989b]/10`) : `${t.secondary} opacity-50 border-[#e5e0d8] bg-transparent`}`}>
                           {isReady ? (letter.isOpened ? '已开启' : '可开启') : '未到期'}
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col items-start mb-6 text-left pl-14">
                        <p className={`text-[16px] line-clamp-2 leading-[2.2] font-serif ${isReady ? `${t.text} opacity-90 notebook-lines pt-1` : `${t.secondary} opacity-50`}`}>
                          {isReady ? (letter.isOpened ? letter.content : '时光寄来了一封信，快来拆阅吧...') : '这是一封写给未来的信，时光还没解开它的蜡封...'}
                        </p>
                      </div>
                      
                      <div className="pt-6 border-t border-dashed border-[#e5e0d8] flex justify-between items-center text-[10px] uppercase font-bold tracking-widest relative z-10 pl-14">
                        {isReady ? (
                          <div className={`flex items-center gap-2 transition-all duration-300 ${letter.isOpened ? `${t.secondary}` : `text-[#e5989b]`}`}>
                             {letter.isOpened ? '再次阅读' : '拆阅信件'} <ArrowRight className={`w-3.5 h-3.5`} />
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 ${t.secondary} opacity-60`}>
                            <Lock className="w-3 h-3" /> 解锁日期: {letter.deliverDate.replace(/-/g, '.')}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {letters.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 gap-6 w-full mt-10 opacity-40">
                  <div className="text-6xl">📮</div>
                  <div className="flex flex-col items-center text-center">
                    <p className={`text-lg font-bold ${t.text}`}>邮筒里空空如也</p>
                    <p className={`text-xs ${t.secondary} mt-2`}>
                      不妨提笔，给很久以后的自己写下当下的期许吧。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Bar for Island Mode */}
      {isIsland && (
        <div className={`w-full shrink-0 ${t.bg} border-t ${t.line} pb-safe pt-2 flex justify-center relative z-40`}>
          {/* Subtle paper tab effect */}
          <div className={`grid grid-cols-2 w-full max-w-lg ${t.panelBg} rounded-t-[1.5rem] border-x border-t ${t.line} overflow-hidden`}>
            <button
              onClick={() => setMainTab('memory')}
              className={`flex flex-col items-center justify-center gap-1 py-4 transition-all duration-500 w-full relative ${mainTab === 'memory' ? t.text : `${t.secondary} opacity-50 hover:opacity-100`}`}
            >
              <Camera className={`w-5 h-5 transition-transform duration-500 ${mainTab === 'memory' ? 'scale-110' : ''}`} />
              <span className="font-bold text-[10px] tracking-widest uppercase mt-1">定格记忆</span>
              {mainTab === 'memory' && <motion.div layoutId="bottom-indicator" className={`absolute bottom-1 w-8 h-1 ${t.accent} rounded-full`} />}
            </button>
            <button
              onClick={() => setMainTab('letter')}
              className={`flex flex-col items-center justify-center gap-1 py-4 transition-all duration-500 w-full relative ${mainTab === 'letter' ? t.text : `${t.secondary} opacity-50 hover:opacity-100`}`}
            >
              <Sparkles className={`w-5 h-5 transition-transform duration-500 ${mainTab === 'letter' ? 'scale-110' : ''}`} />
              <span className="font-bold text-[10px] tracking-widest uppercase mt-1">岛屿来信</span>
              {mainTab === 'letter' && <motion.div layoutId="bottom-indicator" className={`absolute bottom-1 w-8 h-1 ${t.accent} rounded-full`} />}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 ${isIsland ? 'bg-black/40' : 'bg-amber-950/40 backdrop-blur-md'}`}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              layoutId={selectedEntry.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`w-full max-w-3xl ${t.panelBg} border ${t.border} p-1 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col relative`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEntry(null)} 
                className={`absolute top-6 right-6 p-2 rounded-xl transition-all z-30 group flex items-center justify-center ${isIsland ? `${t.btnBg} ${t.border} ${t.shadow} hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none` : 'hover:bg-amber-900/5'}`}
              >
                <X className={`w-6 h-6 transition-transform duration-500 group-hover:rotate-90 ${isIsland ? t.text : 'text-amber-900/20 group-hover:text-amber-900'}`} />
              </button>

              <div className={`flex flex-col h-full w-full overflow-hidden ${!isIsland && 'md:flex-row'}`}>
                {/* Visual Section */}
                {selectedEntry.images && selectedEntry.images.length > 0 && (
                  <div className={`relative ${isIsland ? 'h-[250px] shrink-0' : 'w-full md:w-[45%] bg-amber-50 h-[300px] md:h-auto overflow-hidden'}`}>
                    <motion.img 
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8 }}
                      src={selectedEntry.images[0]} 
                      alt={selectedEntry.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {!isIsland && (
                      <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/50 to-transparent">
                        <div className="flex gap-3 mb-4">
                           <span className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-lg">{selectedEntry.mood}</span>
                           <span className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-lg">{selectedEntry.weather}</span>
                        </div>
                        {selectedEntry.location && (
                          <div className="flex items-center gap-1.5 text-white/90 text-sm font-serif italic">
                            <MapPin className="w-4 h-4 text-white/60" />
                            {selectedEntry.location}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content Section */}
                <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col relative ${isIsland ? 'p-6 md:p-10' : 'p-8 md:p-14 bg-[#fdfbf7]'}`}>
                  {!isIsland && (
                    <>
                      <div className="absolute top-12 left-10 pointer-events-none opacity-[0.03]">
                        <span className="text-[140px] font-serif font-black select-none leading-none -ml-8">
                          {new Date(selectedEntry.date).getDate()}
                        </span>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-[0.04] pointer-events-none rotate-[12deg]">
                         <div className="border-[6px] border-amber-900 rounded-full w-full h-full flex flex-col items-center justify-center text-amber-900 font-black text-center uppercase tracking-tighter">
                           <span className="text-4xl text-amber-900">Authentic</span>
                           <span className="text-5xl border-y-2 border-amber-900 my-1 py-1 text-amber-900">2026</span>
                           <span className="text-4xl text-amber-900">Memories</span>
                         </div>
                      </div>
                    </>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col">
                    <header className={isIsland ? 'mb-8' : 'mb-14'}>
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className={`flex items-center gap-3 mb-4 ${isIsland ? `${t.secondary} text-xs font-medium` : 'text-amber-900/30 text-[10px] font-serif font-black uppercase tracking-[0.3em] mb-6'}`}
                      >
                        {isIsland ? (
                          <>
                            <div className={`flex items-center gap-1.5 ${t.btnBg} border ${t.border} px-2 py-1 rounded-md text-[10px] font-bold`}>
                              {new Date(selectedEntry.date).toLocaleString('zh-CN', { month: 'short', day: 'numeric' })}
                            </div>
                            <span className="text-gray-300">•</span>
                            <span>{selectedEntry.time}</span>
                            {selectedEntry.location && (
                              <>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{selectedEntry.location}</span>
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span>{selectedEntry.date.replace(/-/g, ' . ')}</span>
                            <div className="w-16 h-px bg-amber-900/10" />
                            <span>{selectedEntry.time}</span>
                          </>
                        )}
                      </motion.div>
                      
                      <div className={`flex ${isIsland ? 'justify-between items-start gap-4 mb-4' : 'flex-col'}`}>
                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`${isIsland ? `text-3xl md:text-4xl font-black ${t.text} leading-tight tracking-tight` : 'text-4xl md:text-6xl font-serif font-black text-amber-950 leading-[1.05] selection:bg-amber-100'}`}
                        >
                          {selectedEntry.title}
                        </motion.h2>
                        
                        {isIsland && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`flex items-center gap-1.5 ${t.panelBg} px-4 py-2 rounded-2xl shrink-0 border ${t.line} shadow-sm`}
                          >
                             <span className="text-xl drop-shadow-sm">{selectedEntry.mood}</span>
                             <span className="text-xl drop-shadow-sm">{selectedEntry.weather}</span>
                          </motion.div>
                        )}
                      </div>
                    </header>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex-1 pb-10"
                    >
                      <div 
                        className={`${isIsland ? `${t.text} opacity-90 font-medium text-[16px] leading-[2] whitespace-pre-wrap selection:bg-black/10` : 'text-amber-900/80 font-serif leading-[2.4] text-xl whitespace-pre-wrap selection:bg-amber-100 drop-shadow-sm indent-8'}`}
                        dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                      />
                      
                      {/* Additional images array for isIsland */}
                      {isIsland && selectedEntry.images && selectedEntry.images.length > 1 && (
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedEntry.images.slice(1).map((img, i) => (
                             <img key={i} src={img} className={`w-full aspect-square object-cover rounded-2xl shadow-sm border ${t.line}`} alt="" referrerPolicy="no-referrer" />
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {!isIsland && (
                      <motion.footer 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 pt-10 border-t border-amber-900/10 flex flex-col md:flex-row justify-between items-center gap-6"
                      >
                        <div className="flex gap-8">
                          <button className="relative overflow-hidden group/btn px-1 py-1">
                            <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.2em] group-hover/btn:text-amber-900 transition-colors">收藏此篇</span>
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 group-hover/btn:w-full transition-all duration-500" />
                          </button>
                          <button className="relative overflow-hidden group/btn px-1 py-1">
                            <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-[0.2em] group-hover/btn:text-amber-900 transition-colors">分享瞬间</span>
                            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-900 group-hover/btn:w-full transition-all duration-500" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 text-[9px] font-serif font-black italic text-amber-900/10 tracking-widest uppercase">
                          Icity Archive // Life Traces
                        </div>
                      </motion.footer>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAddingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-4xl h-[95vh] md:h-[90vh] bg-[#fdfbfc] rounded-[2.5rem] shadow-2xl border border-pink-100/50 flex flex-col overflow-hidden relative"
            >
              {/* Paper Selection Header Swapper Tray */}
              <div className="px-6 py-4 bg-white border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (newContent.trim() && !confirm("确定要放弃当前编写的日记吗？")) return;
                      setIsAddingEntry(false);
                    }}
                    className="text-gray-400 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-full transition-all"
                    title="丢弃"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-xs font-black tracking-widest text-amber-900/40 uppercase hidden sm:inline-block">小小手账本 // 岁月素锦</span>
                  <div className="flex items-center gap-1.5 ml-2">
                    {(['minimal', 'milktea', 'sakura', 'forest', 'midnight', 'vintage'] as const).map(styleKey => {
                      const styleLabels = {
                        minimal: '极简白', milktea: '暖奶茶', sakura: '落樱粉', forest: '常青森', midnight: '星空灰', vintage: '旧牛皮'
                      };
                      const styleColors = {
                        minimal: 'bg-[#FCFAF7] border-gray-300', milktea: 'bg-[#FAF3E0] border-amber-200', sakura: 'bg-[#FFF0F5] border-pink-200', forest: 'bg-[#F2F6F2] border-emerald-200', midnight: 'bg-[#0F172A] border-slate-700', vintage: 'bg-[#F4EAE1] border-[#d6ccc2]'
                      };
                      return (
                        <button
                          key={styleKey}
                          onClick={() => setNewPaperStyle(styleKey)}
                          className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-115 ${styleColors[styleKey]} ${newPaperStyle === styleKey ? 'ring-2 ring-pink-400 scale-110 shadow-md' : 'opacity-80'}`}
                          title={styleLabels[styleKey]}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* BGM Disc visual widget inside header */}
                  <motion.div 
                    animate={{ rotate: editorBgmType !== 'none' ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    onClick={() => setEditorBgmType(editorBgmType === 'none' ? 'lofi' : 'none')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border shadow-sm transition-all relative ${editorBgmType !== 'none' ? 'bg-[#ffccd5] border-pink-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                    title="白噪音伴奏（Lo-Fi / 森林 / 雨声）"
                  >
                    <Music className={`w-3.5 h-3.5 ${editorBgmType !== 'none' ? 'text-pink-600' : 'text-gray-400'}`} />
                    {editorBgmType !== 'none' && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                    )}
                  </motion.div>

                  <button 
                    onClick={handleSaveEntry}
                    disabled={!newContent.trim()}
                    className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 ${newContent.trim() ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:opacity-90 hover:shadow-lg' : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>定格发布</span>
                  </button>
                </div>
              </div>

              {/* Redesigned Journal Writing Paper */}
              {(() => {
                const colors = {
                  minimal: { bg: 'bg-[#FCFAF7]', line: 'border-amber-900/10', title: 'text-amber-950 placeholder:text-amber-900/20', content: 'text-amber-950/80 placeholder:text-amber-950/20', textGlow: 'bg-[#f5f1ea]/30', font: 'font-serif' },
                  milktea: { bg: 'bg-[#FAF3E0]', line: 'border-[#ebdcb9]', title: 'text-[#5a3825] placeholder:text-[#5a3825]/20', content: 'text-[#6d4c3d] placeholder:text-[#6d4c3d]/20', textGlow: 'bg-[#ebdcb9]/20', font: 'font-sans' },
                  sakura: { bg: 'bg-[#FFF0F5]', line: 'border-[#fbc4d8]', title: 'text-[#5c0632] placeholder:text-[#5c0632]/20', content: 'text-[#851c50] placeholder:text-[#851c50]/20', textGlow: 'bg-[#fbc4d8]/15', font: 'font-cute-zh' },
                  forest: { bg: 'bg-[#F2F6F2]', line: 'border-[#c8e2c8]', title: 'text-[#1a3a1a] placeholder:text-[#1a3a1a]/20', content: 'text-[#2b572b] placeholder:text-[#2b572b]/20', textGlow: 'bg-[#c8e2c8]/15', font: 'font-sans' },
                  midnight: { bg: 'bg-[#0F172A]', line: 'border-slate-800', title: 'text-slate-100 placeholder:text-slate-700', content: 'text-slate-300 placeholder:text-slate-700', textGlow: 'bg-slate-900/50', font: 'font-mono' },
                  vintage: { bg: 'bg-[#F4EAE1]', line: 'border-[#d6ccc2]', title: 'text-[#4e3c30] placeholder:text-[#4e3c30]/20', content: 'text-[#6c584c] placeholder:text-[#6c584c]/20', textGlow: 'bg-[#d6ccc2]/15', font: 'font-serif' }
                }[newPaperStyle];

                return (
                  <div className={`flex-1 relative overflow-y-auto p-4 sm:p-8 custom-scrollbar transition-colors duration-500 ${colors.bg} paper-grain flex flex-col`}>
                    
                    {/* Retro Metal Ring Notebook Spiral Binder (Visual Accent representing a real Handbound Journal) */}
                    <div className="absolute top-0 bottom-0 left-4 w-6 flex flex-col justify-around pointer-events-none z-20 opacity-30">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-5 h-2 bg-gradient-to-r from-gray-400 to-gray-200 rounded-full shadow-inner transform -translate-x-1" />
                      ))}
                    </div>

                    {/* Cute Letter ribbon / Header Tagline */}
                    <div className="pl-6 flex flex-wrap gap-3 items-center justify-between mb-6 shrink-0 relative z-10 border-b border-dashed border-gray-300/50 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-amber-900/60 shadow-sm border border-amber-900/5 font-mono">
                          📅 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-[10px] font-bold text-amber-900/60 shadow-sm border border-amber-900/5 font-mono">
                          ⏰ {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        
                        {/* Folder Tab Sticker */}
                        <div className="relative group">
                          <button 
                            onClick={() => setShowFolderPicker(true)}
                            className="px-3 py-1 bg-gradient-to-r from-teal-400 to-emerald-400 text-white rounded-lg text-[10px] font-black tracking-wide shadow-sm flex items-center gap-1 hover:brightness-95 active:scale-95 transition-all"
                          >
                            <Folder className="w-3 h-3" />
                            <span>{newFolder}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        {/* Interactive Mood sticker stamp */}
                        <button 
                          onClick={() => setShowMoodPicker(true)} 
                          className="w-8 h-8 rounded-full bg-white border border-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg shadow-sm"
                          title="心情标签"
                        >
                          {newMood}
                        </button>
                        {/* Interactive Weather sticker stamp */}
                        <button 
                          onClick={() => setShowWeatherPicker(true)} 
                          className="w-8 h-8 rounded-full bg-white border border-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-lg shadow-sm"
                          title="天气标签"
                        >
                          {newWeather}
                        </button>
                        {/* Add map pin */}
                        <button
                          onClick={() => {
                            const name = prompt("添加情境位置：", newLocation);
                            if (name !== null) setNewLocation(name);
                          }}
                          className={`h-8 px-3 rounded-full border flex items-center gap-1 text-[10px] font-bold active:scale-95 transition-all shadow-sm ${newLocation ? 'bg-amber-100/50 border-amber-200 text-amber-800' : 'bg-white border-gray-100 text-gray-400 hover:text-gray-600'}`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{newLocation || "添加情境"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Left margin visual rules guiding */}
                    <div className="pl-6 w-full flex-1 flex flex-col relative min-h-[350px]">
                      
                      {/* Notebook Horizontal ruled guidelines */}
                      <div className="absolute inset-0 pt-16 pr-4 pointer-events-none opacity-40 select-none">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className={`h-8 w-full border-b ${colors.line}`} />
                        ))}
                      </div>

                      {/* Floating Stickers Box (Hand-taped cute graphics added to notebook!) */}
                      {editorStickers.length > 0 && (
                        <div className="absolute top-2 right-4 flex flex-wrap gap-2 z-10 pointer-events-auto">
                          {editorStickers.map((sticker, idx) => (
                            <motion.div
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: (idx % 2 === 0 ? 6 : -6) }}
                              onClick={() => {
                                setEditorStickers(editorStickers.filter((_, i) => i !== idx));
                              }}
                              className="w-10 h-10 hover:brightness-90 active:scale-90 cursor-pointer bg-white/70 backdrop-blur-sm rounded-lg shadow-inner flex items-center justify-center text-2xl border border-dashed border-gray-300 relative group"
                              title="点击揭下贴纸"
                              key={idx}
                            >
                              <span className="select-none">{sticker}</span>
                              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-2.5 h-2.5" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Title input */}
                      <input 
                        type="text" 
                        value={newTitle}
                        onChange={(e) => {
                          if (isTypewriterSoundActive) playTypewriterSound();
                          setNewTitle(e.target.value);
                        }}
                        placeholder="给今日的瞬间起个标题罢..." 
                        className={`w-full bg-transparent border-none text-2xl font-black focus:outline-none mb-4 relative z-10 ${colors.title} ${colors.font}`}
                      />

                      {/* Ruled Textarea editor with custom font family, size and alignments! */}
                      <textarea 
                        value={newContent}
                        onChange={(e) => {
                          if (isTypewriterSoundActive) playTypewriterSound();
                          setNewContent(e.target.value);
                        }}
                        style={{ 
                          fontSize: `${editorFontSize}px`,
                          lineHeight: '2rem',
                          textAlign: editorTextAlign,
                        }}
                        placeholder="开始记录你的故事与岛屿低吟..."
                        className={`w-full flex-1 bg-transparent border-none focus:outline-none resize-none leading-8 relative z-10 overflow-y-hidden ${colors.content} ${editorFontFamily}`}
                        autoFocus
                      />

                      {/* Polaroid photographic frame tray */}
                      {newImages.length > 0 && (
                        <div className="flex flex-wrap gap-6 py-6 border-t border-dashed border-gray-200 mt-6 relative z-10 select-none">
                          {newImages.map((img, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ scale: 0.9, rotate: (i % 2 === 0 ? 2 : -2) }}
                              whileHover={{ scale: 1.05, rotate: 0 }}
                              className="bg-white p-3 pb-8 rounded-none border border-gray-200/60 shadow-md flex flex-col items-center gap-1.5 relative w-40 shrink-0 select-none"
                            >
                              {/* Overlay tape element */}
                              <div className="w-14 h-4 bg-yellow-200/50 absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-3deg] border border-yellow-300/30" />
                              
                              <div className="w-full aspect-[3/4] overflow-hidden rounded-sm relative bg-gray-50">
                                <img src={img} alt="polaroid-shoot" className="w-full h-full object-cover select-none" referrerPolicy="no-referrer" />
                              </div>

                              <div className="text-[8px] font-mono font-medium text-gray-400 mt-1 select-none">
                                PHOTO P.{i + 1} ✦ 岛屿
                              </div>

                              <button 
                                onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                                className="absolute top-2 right-2 w-5 h-5 bg-rose-500/80 backdrop-blur-md hover:bg-rose-600 transition-colors rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:opacity-100 border border-white/20 shadow-sm"
                                title="取下照片"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Floating Info ribbon bottom */}
                    <div className="pl-6 pr-4 pt-4 border-t border-dashed border-gray-200/50 flex flex-wrap gap-4 items-center justify-between shrink-0 text-[10px] font-medium text-amber-900/40 font-mono select-none">
                      <div className="flex items-center gap-4">
                        <span>✏️ {newContent.length} 字符数</span>
                        <span>💡 预计阅读 {Math.max(1, Math.ceil(newContent.length / 300))} 分钟</span>
                        {editorBgmType !== 'none' && (
                          <span className="flex items-center gap-1 text-pink-600 animate-pulse">
                            <Music className="w-3 h-3" />
                            <span>白噪音放音中</span>
                          </span>
                        )}
                      </div>
                      <span className="opacity-60">小小手记 ✦ 写你所见，爱你所选</span>
                    </div>

                  </div>
                );
              })()}

              {/* Immersive Controls dock for Hand-手账 (Stamps, Sounds, Fonts, AI Wizards) */}
              <div className="p-4 bg-white border-t border-gray-100 flex flex-wrap items-center justify-between shrink-0 select-none z-30">
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Polaroid camera roll trigger */}
                  <label htmlFor="diary-image-upload" className="cursor-pointer group h-10 px-3.5 bg-gray-50 border border-gray-200/50 rounded-2xl flex items-center justify-center hover:bg-pink-50 hover:border-pink-200 transition-colors">
                    <input 
                      type="file" 
                      id="diary-image-upload" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files) as File[];
                          const urls = files.map(file => URL.createObjectURL(file as Blob));
                          setNewImages([...newImages, ...urls]);
                        }
                      }}
                    />
                    <Camera className="w-5 h-5 text-gray-500 group-hover:text-pink-500 transition-colors" />
                    <span className="text-[10px] font-bold text-gray-400 group-hover:text-pink-600 transition-colors ml-1.5 uppercase tracking-wide">添加拍立得</span>
                  </label>

                  {/* Stamp Sticker Sticker Popover */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowStickerPicker(!showStickerPicker)}
                      className={`h-10 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-xs font-bold active:scale-95 ${showStickerPicker ? 'bg-pink-100 text-pink-600 border-pink-200' : 'bg-gray-50 border border-gray-200/50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      <Smile className="w-5 h-5" />
                      <span>我的贴纸</span>
                    </button>

                    <AnimatePresence>
                      {showStickerPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 15 }}
                          className="absolute bottom-12 left-0 w-64 bg-white rounded-2xl p-4 shadow-2xl border border-pink-100 grid grid-cols-5 gap-2 z-50 select-none pb-5"
                        >
                          <div className="col-span-1 border-b pb-2 mb-2 w-full flex items-center justify-between text-[11px] font-bold text-gray-400">
                            <span>贴纸库</span>
                          </div>
                          <div className="col-span-5 grid grid-cols-5 gap-2.5">
                            {['🧸', '🍒', '🍓', '🍰', '🧁', '🍟', '🍭', '🌸', '🌼', '🌷', '🐾', '🍀', '🌟', '🍼', '🎨', '🎠', '🛸', '🪁', '💭', '🔑'].map(sticker => (
                              <button
                                key={sticker}
                                onClick={() => {
                                  if (editorStickers.length >= 8) {
                                    alert("一页最多贴8张贴纸哦~");
                                    return;
                                  }
                                  setEditorStickers([...editorStickers, sticker]);
                                }}
                                className="w-full aspect-square text-xl hover:scale-120 active:scale-90 transition-all flex items-center justify-center p-1 rounded-xl bg-gray-50 hover:bg-pink-50"
                              >
                                {sticker}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Font Typography Adjuster */}
                  <div className="flex items-center bg-gray-50/50 border border-gray-200/50 rounded-2xl h-10 px-2 gap-1.5">
                    <button 
                      onClick={() => setEditorFontFamily(editorFontFamily === 'font-serif' ? 'font-cute-zh font-bold' : editorFontFamily === 'font-cute-zh font-bold' ? 'font-mono' : 'font-serif')}
                      className="p-1 px-2.5 rounded-lg text-[10px] font-bold text-gray-600 bg-white shadow-sm hover:bg-gray-50"
                      title="切换手写/宋体/等宽"
                    >
                      字形: {editorFontFamily === 'font-serif' ? '宋' : editorFontFamily === 'font-mono' ? '等' : '萌'}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setEditorTextAlign(editorTextAlign === 'left' ? 'center' : editorTextAlign === 'center' ? 'right' : 'left');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500"
                      title="文本对齐"
                    >
                      {editorTextAlign === 'left' && <AlignLeft className="w-4 h-4" />}
                      {editorTextAlign === 'center' && <AlignCenter className="w-4 h-4" />}
                      {editorTextAlign === 'right' && <AlignRight className="w-4 h-4" />}
                    </button>

                    <div className="flex items-center gap-1 pl-1 border-l border-gray-200">
                      <button 
                        onClick={() => setEditorFontSize(Math.max(12, editorFontSize - 1))}
                        className="p-1 text-xs font-bold text-gray-400 hover:text-gray-900"
                        title="减小字号"
                      >
                        A-
                      </button>
                      <span className="text-[10px] font-bold text-gray-600 w-5 text-center font-mono">{editorFontSize}</span>
                      <button 
                        onClick={() => setEditorFontSize(Math.min(24, editorFontSize + 1))}
                        className="p-1 text-xs font-bold text-gray-400 hover:text-gray-900"
                        title="增加字号"
                      >
                        A+
                      </button>
                    </div>
                  </div>

                  {/* BGM Ambient Choose */}
                  <div className="flex items-center bg-gray-50/50 border border-gray-200/50 rounded-2xl h-10 px-2 gap-1">
                    <button
                      onClick={() => setEditorBgmType(editorBgmType === 'lofi' ? 'none' : 'lofi')}
                      className={`px-2 py-1 text-[10px] rounded-lg font-bold transition-all ${editorBgmType === 'lofi' ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Lo-Fi ☕
                    </button>
                    <button
                      onClick={() => setEditorBgmType(editorBgmType === 'rain' ? 'none' : 'rain')}
                      className={`px-2 py-1 text-[10px] rounded-lg font-bold transition-all ${editorBgmType === 'rain' ? 'bg-teal-100 text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      听雨 🌦️
                    </button>
                    <button
                      onClick={() => setEditorBgmType(editorBgmType === 'forest' ? 'none' : 'forest')}
                      className={`px-2 py-1 text-[10px] rounded-lg font-bold transition-all ${editorBgmType === 'forest' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      虫鸣 🌲
                    </button>
                    <button
                      onClick={() => setIsTypewriterSoundActive(!isTypewriterSoundActive)}
                      className={`p-1.5 rounded-lg transition-all ${isTypewriterSoundActive ? 'text-pink-500 hover:bg-gray-100' : 'text-gray-300'}`}
                      title={isTypewriterSoundActive ? "机械键盘音: 已开启" : "机械键盘音: 已关闭"}
                    >
                      {isTypewriterSoundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Custom Privacy Pin Toggle */}
                  <button 
                    onClick={() => {
                      if (!isLocked) {
                        const pin = prompt("设置访问此日记的4位数字解锁密码（留空默认为 1234）：", customPinCode) || "1234";
                        if (pin && pin.length === 4 && /^\d+$/.test(pin)) {
                          handleSavePin(pin);
                          setIsLocked(true);
                          alert(`隐私锁启用成功！访问密码为 [${pin}]。`);
                        } else if (pin) {
                          alert("密码不符合规定（必须是4位纯数字）！");
                        }
                      } else {
                        setIsLocked(false);
                        alert("已关闭隐私锁");
                      }
                    }}
                    className={`h-10 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all text-xs font-bold active:scale-95 ${isLocked ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-gray-50 border border-gray-200/50 text-gray-500'}`}
                  >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span>隐私密码锁</span>
                  </button>

                </div>

                {/* Magical AI Generative Polish Assistant */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <div className="text-[10px] font-extrabold tracking-wider text-amber-900/40 uppercase font-mono">
                    🤖 AI 一键智能修辞:
                  </div>
                  <div className="flex bg-[#FCFAF7] border border-amber-900/10 rounded-2xl p-0.5 gap-1 shadow-inner">
                    <button
                      onClick={() => applyAiPolish('poetic')}
                      disabled={!newContent.trim()}
                      className="px-2.5 py-1.5 text-[9px] font-bold rounded-xl bg-white hover:bg-pink-50 active:scale-95 transition-all text-pink-600 leading-none flex items-center gap-0.5"
                    >
                      🌷 婉约文艺
                    </button>
                    <button
                      onClick={() => applyAiPolish('warm')}
                      disabled={!newContent.trim()}
                      className="px-2.5 py-1.5 text-[9px] font-bold rounded-xl bg-white hover:bg-amber-50 active:scale-95 transition-all text-amber-600 leading-none flex items-center gap-0.5"
                    >
                      🧁 温暖治愈
                    </button>
                    <button
                      onClick={() => applyAiPolish('sassy')}
                      disabled={!newContent.trim()}
                      className="px-2.5 py-1.5 text-[9px] font-bold rounded-xl bg-white hover:bg-rose-50 active:scale-95 transition-all text-rose-600 leading-none flex items-center gap-0.5"
                    >
                      🔥 夸张发疯
                    </button>
                    <button
                      onClick={() => applyAiPolish('nonsense')}
                      disabled={!newContent.trim()}
                      className="px-2.5 py-1.5 text-[9px] font-bold rounded-xl bg-white hover:bg-gray-100 active:scale-95 transition-all text-gray-600 leading-none flex items-center gap-0.5"
                    >
                      💫 废话随笔
                    </button>
                  </div>
                </div>

              </div>

              {/* Dropdown pickers container */}
              <AnimatePresence>
                {showMoodPicker && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-end justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowMoodPicker(false)}
                  >
                    <motion.div 
                      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                      className="w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative z-10"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-base font-black text-amber-950 font-cute-zh">✨ 挑选一个心灵印章</span>
                        <button onClick={() => setShowMoodPicker(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                      </div>
                      <div className="grid grid-cols-5 gap-3.5 pb-6">
                        {['😊', '🥰', '😔', '😤', '😴', '✨', '☁️', '🌙', '🍃', '🥳', '😭', '🤯', '🍕', '🧸', '🌈'].map(mood => (
                          <button
                            key={mood}
                            onClick={() => { setNewMood(mood); setShowMoodPicker(false); }}
                            className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95 ${newMood === mood ? 'bg-pink-100 text-pink-600 shadow-inner ring-2 ring-pink-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                          >
                            {mood}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {showWeatherPicker && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-end justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowWeatherPicker(false)}
                  >
                    <motion.div 
                      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                      className="w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative z-10"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-base font-black text-amber-950 font-cute-zh">🌤️ 挑选一个当日气象</span>
                        <button onClick={() => setShowWeatherPicker(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                      </div>
                      <div className="grid grid-cols-4 gap-4 pb-6">
                        {['☀️', '☁️', '🌧️', '❄️', '🌪️', '🌫️', '🌤️', '🌙', '⚡', '🌈'].map(weather => (
                          <button
                            key={weather}
                            onClick={() => { setNewWeather(weather); setShowWeatherPicker(false); }}
                            className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all hover:scale-105 active:scale-95 ${newWeather === weather ? 'bg-teal-100 text-teal-600 shadow-inner ring-2 ring-teal-300' : 'bg-gray-50 hover:bg-gray-100'}`}
                          >
                            {weather}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {showFolderPicker && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[120] flex items-end justify-center bg-black/30 backdrop-blur-sm"
                    onClick={() => setShowFolderPicker(false)}
                  >
                    <motion.div 
                      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                      className="w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl relative z-10 text-sans"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                        <span className="text-base font-black text-amber-950 font-cute-zh">🏷️ 选择你的专属档案夹</span>
                        <button onClick={() => setShowFolderPicker(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                      </div>
                      <div className="flex flex-col gap-2 pb-6 max-h-[300px] overflow-y-auto">
                        {['生活随笔', '奇思妙想', '恋爱日常', '小秘密', '治愈确幸'].map(folder => (
                          <button
                            key={folder}
                            onClick={() => { setNewFolder(folder); setShowFolderPicker(false); }}
                            className={`w-full px-6 py-4 rounded-2xl flex items-center justify-between text-[14px] font-bold transition-all ${newFolder === folder ? 'bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                          >
                            <span>{folder}</span>
                            {newFolder === folder && <Check className="w-5 h-5" />}
                          </button>
                        ))}
                        <button 
                          onClick={() => {
                            const name = prompt("输入新建档案夹名称：");
                            if (name) { setNewFolder(name); setShowFolderPicker(false); }
                          }}
                          className="w-full px-6 py-4 rounded-2xl bg-white border border-dashed border-gray-200 text-gray-400 text-[13px] font-bold hover:border-gray-400 hover:text-gray-600 transition-all font-sans"
                        >
                          + 新建专属档案...
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </motion.div>
        )}

        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
               initial={{ scale: 0.9, y: 30, opacity: 0, rotateX: 20 }}
               animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
               exit={{ scale: 0.9, y: 30, opacity: 0, rotateX: -20 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className={`w-full max-w-3xl ${t.panelBg} rounded-[2rem] shadow-2xl relative overflow-hidden preserve-3d h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col border ${t.border}`}
               onClick={(e) => e.stopPropagation()}
            >
               <div className={`relative z-20 px-8 py-6 flex justify-between items-center ${t.panelBg} sticky top-0 border-b ${t.line}`}>
                 <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 ${t.accent} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                     <MailOpen className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className={`font-bold ${t.text} text-xl leading-tight font-cute-zh`}>
                        {selectedLetter.type === 'future' && '写给未来的信'}
                        {selectedLetter.type === 'past' && '来自过去的回忆'}
                        {selectedLetter.type === 'other' && '传送而来的信笺'}
                     </h3>
                     <p className={`text-[10px] font-bold ${t.secondary} uppercase tracking-widest mt-0.5`}>Time Machine Post Office</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedLetter(null)} className={`p-3 rounded-full ${t.bg} border ${t.line} hover:opacity-80 transition-opacity`}>
                   <X className="w-5 h-5 text-[#5a544e]" />
                 </button>
               </div>
               
               <div className={`flex-1 p-6 md:p-10 overflow-y-auto custom-scrollbar relative z-10 ${t.bg} paper-grain`}>
                 <div className={`w-full max-w-2xl mx-auto bg-[#fffefc] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e5e0d8] relative p-8 md:p-12 mb-10`}>
                   {/* Postage stamp visual in top right */}
                   <div className="absolute top-8 right-8 border-2 border-dashed border-[#e5e0d8] p-1 rotate-[4deg]">
                     <div className="w-16 h-20 bg-[#f9f8f6] flex flex-col items-center justify-center text-3xl pb-2 shadow-inner border border-[#e5e0d8]">
                       {selectedLetter.stamp || '💌'}
                       <span className="text-[8px] font-mono text-[#8b7e74] mt-2 opacity-60 tracking-tighter">POSTAGE</span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6 relative z-10 w-full mt-6">
                     <div className="text-[10px] font-mono text-[#8b7e74] tracking-widest mb-4 flex items-center gap-3">
                       <span>{selectedLetter.writeDate.replace(/-/g, '.')}</span>
                       <span className="w-10 h-px bg-transparent border-b border-dashed border-[#8b7e74]" />
                       <span>{selectedLetter.deliverDate.replace(/-/g, '.')}</span>
                     </div>
                     
                     <h2 className="text-3xl md:text-4xl font-bold text-[#5a544e] tracking-tight leading-tight mb-2 font-serif pr-24">
                       {selectedLetter.title}
                     </h2>
                     <div className="w-full h-px bg-[#e5e0d8]" />
                     
                     <div className="relative pt-2 min-h-[300px]">
                       <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none notebook-lines opacity-100" />
                       <p className="w-full relative z-10 text-[17px] text-[#5a544e] leading-[2.4] font-serif text-justify whitespace-pre-wrap">
                         {selectedLetter.content}
                       </p>
                     </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          </motion.div>
        )}

        {isWritingLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm`}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: '100%', opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col ${t.panelBg} border ${t.border} h-[90vh] md:h-auto md:max-h-[85vh] relative`}
            >
              <div className={`relative z-10 px-8 py-6 flex justify-between items-center ${t.panelBg} sticky top-0 border-b ${t.line}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.accent} text-white rounded-xl flex items-center justify-center shadow-lg`}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${t.text} text-xl leading-tight font-cute-zh`}>给未来写封信</h3>
                    <p className={`text-[10px] font-bold ${t.secondary} uppercase tracking-widest mt-0.5`}>Time Machine Post Office</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsWritingLetter(false)} className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors ${t.secondary} hover:opacity-80`}>
                    返回
                  </button>
                  <button 
                    onClick={handleSaveLetter}
                    disabled={!newLetterContent.trim() || (newLetterType !== 'past' && !newLetterDeliverDate)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg transition-all ${t.accent} text-white hover:opacity-90 disabled:opacity-50 disabled:active:scale-100 active:scale-95`}
                  >
                    <Send className="w-4 h-4" />
                    盖戳寄出
                  </button>
                </div>
              </div>
              
              <div className={`p-6 md:p-10 overflow-y-auto flex flex-col gap-8 custom-scrollbar relative z-10 flex-1 ${t.bg} paper-grain`}>
                
                {/* Letter Type Selection */}
                <div className="flex gap-4 mb-2">
                   {(['future', 'other', 'past'] as const).map(type => (
                     <button
                       key={type}
                       onClick={() => setNewLetterType(type)}
                       className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all border ${newLetterType === type ? `${t.accent} text-white border-transparent shadow-md` : `bg-white/50 ${t.line} ${t.text} hover:bg-white`}`}
                     >
                       {type === 'future' && '写给未来'}
                       {type === 'other' && '传送他人'}
                       {type === 'past' && '写给过去'}
                     </button>
                   ))}
                </div>

                <div className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl border ${t.line} ${t.panelBg} shadow-sm`}>
                  {newLetterType !== 'past' ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <label className={`text-[11px] font-bold ${t.secondary} uppercase tracking-widest flex items-center gap-2`}>
                        <Calendar className="w-4 h-4" /> {newLetterType === 'other' ? '对方收信日期' : '指定收信日期'}
                      </label>
                      <input 
                        type="date" 
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                        value={newLetterDeliverDate}
                        onChange={(e) => setNewLetterDeliverDate(e.target.value)}
                        className={`w-full bg-transparent p-4 rounded-xl font-bold ${t.text} text-xl border ${t.line} focus:outline-none focus:border-[#a3b18a] transition-all cursor-pointer`}
                      />
                      <span className={`text-[10px] ${t.secondary} opacity-60`}>请选择一个未来的日子。在那之前，这封信将被时光尘封，无法预读。</span>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2">
                      <label className={`text-[11px] font-bold ${t.secondary} uppercase tracking-widest flex items-center gap-2`}>
                        <Clock className="w-4 h-4" /> 写于当下，送往回忆
                      </label>
                      <div className={`w-full p-4 rounded-xl font-bold ${t.text} text-xl border ${t.line} bg-black/5 flex items-center gap-2`}>
                        <Lock className="w-4 h-4 opacity-50" />
                        <span>立即开启的回忆之信</span>
                      </div>
                      <span className={`text-[10px] ${t.secondary} opacity-60`}>写给过去的信将作为一份“时光胶囊”，在保存后可立即翻阅。</span>
                    </div>
                  )}
                  
                  {newLetterType === 'other' && (
                    <div className="flex-1 flex flex-col gap-2">
                      <label className={`text-[11px] font-bold ${t.secondary} uppercase tracking-widest flex items-center gap-2`}>
                        <Mail className="w-4 h-4" /> 收信人 ID / 称呼
                      </label>
                      <input 
                        type="text" 
                        value={newLetterRecipient}
                        onChange={(e) => setNewLetterRecipient(e.target.value)}
                        placeholder="想寄给谁？"
                        className={`w-full bg-transparent p-4 rounded-xl font-bold ${t.text} text-xl border ${t.line} focus:outline-none focus:border-[#a3b18a] transition-all`}
                      />
                      <span className={`text-[10px] ${t.secondary} opacity-60`}>这封信将进入岛屿邮局，静静等待主人的开启。</span>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col gap-2">
                    <label className={`text-[11px] font-bold ${t.secondary} uppercase tracking-widest flex items-center gap-2`}>
                      <Smile className="w-4 h-4" /> 挑选邮票贴纸
                    </label>
                    <div className="flex flex-wrap gap-2 p-2">
                       {['💌', '🛸', '🚀', '🎁', '🎈', '🕊️', '🕰️', '🌌'].map(stamp => (
                         <button 
                           key={stamp}
                           onClick={() => setNewLetterStamp(stamp)}
                           className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 shadow-sm border ${newLetterStamp === stamp ? `bg-white border-[#e5989b] scale-110 shadow-md ${t.accentText}` : `bg-white/50 ${t.line} hover:bg-white`}`}
                         >
                           {stamp}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className={`w-full max-w-2xl mx-auto bg-[#fffefc] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e5e0d8] relative p-8 md:p-12 mb-10`}>
                   {/* Postage stamp visual in top right */}
                   <div className="absolute top-8 right-8 border-2 border-dashed border-[#e5e0d8] p-1 rotate-[4deg]">
                     <div className="w-16 h-20 bg-[#f9f8f6] flex flex-col items-center justify-center text-3xl pb-2 shadow-inner border border-[#e5e0d8]">
                       {newLetterStamp}
                       <span className="text-[8px] font-mono text-[#8b7e74] mt-2 opacity-60 tracking-tighter">POSTAGE</span>
                     </div>
                   </div>

                   <div className="flex flex-col gap-6 mt-6 relative z-10 w-full">
                     <input 
                       type="text" 
                       value={newLetterTitle}
                       onChange={(e) => setNewLetterTitle(e.target.value)}
                       placeholder={newLetterType === 'past' ? "回忆的主题..." : "写下这封信的主题..."} 
                       className="w-full bg-transparent text-3xl md:text-4xl font-bold text-[#5a544e] font-serif placeholder:text-[#e5e0d8] focus:outline-none tracking-tight pr-24"
                     />
                     <div className="w-full h-px bg-[#e5e0d8]" />
                     <div className="relative pt-2">
                       <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none notebook-lines opacity-100" />
                       <textarea 
                         value={newLetterContent}
                         onChange={(e) => setNewLetterContent(e.target.value)}
                         placeholder={
                           newLetterType === 'future' ? "展信佳，写下想对未来的自己说的话..." :
                           newLetterType === 'other' ? "展信佳，写下想告诉对方的话..." :
                           "回忆你好，写下对过去的总结与怀念..."
                         } 
                         className="w-full min-h-[450px] bg-transparent text-[17px] text-[#5a544e] placeholder:text-[#e5e0d8] focus:outline-none resize-none leading-[2.4] font-serif custom-scrollbar relative z-10 text-justify"
                       />
                     </div>
                     <div className="flex justify-end mt-4">
                       <span className="text-[#8b7e74] font-serif text-sm opacity-80 border-b border-dashed border-[#8b7e74]">
                         寄信人：{newLetterType === 'past' ? '正在成长的你' : '当前未来的你'}
                       </span>
                     </div>
                   </div>
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
