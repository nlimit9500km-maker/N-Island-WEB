import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Check, Plus, Trash2, Eye, EyeOff, 
  Volume2, VolumeX, Sparkles, User, Users, Flame, Award, 
  TrendingUp, Compass, Coffee, BookOpen, Clock, Sunset, Moon, 
  Smile, Settings, Minimize2, ExternalLink, Heart, Send, Sun
} from 'lucide-react';

// Types
interface Task {
  id: string;
  title: string;
  estimatedTomatoes: number;
  completedTomatoes: number;
  isCompleted: boolean;
  createdAt: number;
}

interface Peer {
  id: string;
  name: string;
  avatar: string;
  status: string;
  task: string;
  isFocused: boolean;
  joinedMinutesAgo: number;
}

interface Danmaku {
  id: string;
  text: string;
  top: number;
  duration: number;
}

interface StreamMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
}

const DESK_ACCESSORIES = [
  { id: 'coffee', label: '拿铁咖啡 ☕', icon: '☕' },
  { id: 'cactus', label: '迷你多肉 🌵', icon: '🌵' },
  { id: 'lamp', label: '复古台灯 💡', icon: '💡' },
  { id: 'flower', label: '郁金香花 🌷', icon: '🌷' },
  { id: 'journal', label: '复古手账 📒', icon: '📒' }
];

const DANMAKU_MESSAGES = [
  "坐标广东，高三加油！ 📝",
  "打卡第32天，大家都在努力呢 💪",
  "这首白噪音真好听 🌧️",
  "前方的路很明亮，不要害怕 ✨",
  "允许自己偶尔停下来，但永远不要放弃往前走的力量 🏃",
  "已经专注了两个小时啦，喝口水吧！ ☕",
  "数学好难，但我不会认输 📚",
  "滴答自修室的氛围真好 🌿",
  "在这里找到了久违的平静 🍃",
  "一切都会好起来的 🌤️",
  "为了理想的大学，拼了！ 🎓",
  "工作再忙也要记得好好生活 🌻",
  "考研上岸！ 🙏",
  "夜深了，还有人一起学习，真好 🌙"
];

// Mock Study Peers
const INITIAL_PEERS: Peer[] = [
  { id: '1', name: 'NotANumberO_', avatar: '🦖', status: '专注中', task: '设计 UI 界面 & 排版 🎨', isFocused: true, joinedMinutesAgo: 12 },
  { id: '2', name: 'Miya', avatar: '🐱', status: '阅读中', task: '《倒影映射出的你/我/他》 📚', isFocused: true, joinedMinutesAgo: 45 },
  { id: '3', name: '屿·守望者', avatar: '🌤️', status: '白日梦', task: '写一封寄给未来的信 ✉️', isFocused: false, joinedMinutesAgo: 8 },
  { id: '4', name: 'Luna', avatar: '🐰', status: '冥想中', task: '白噪音调息 🧘‍♀️', isFocused: true, joinedMinutesAgo: 30 },
  { id: '5', name: '阿木', avatar: '🐼', status: '专注中', task: '写代码与测试 💻', isFocused: true, joinedMinutesAgo: 60 }
];

// Aesthetic Quotes
const STIMULATING_QUOTES = [
  { text: "允许自己偶尔停下来，但永远不要放弃往前走的力量。", author: "滴答自修室" },
  { text: "你现在做的每一件微小的事，都在默默塑造明天的你。", author: "主理人寄语" },
  { text: "专注的时刻最温柔，仿佛时光也在为你慢下脚步。", author: "屿·记" },
  { text: "不期而遇的浪漫，总是在努力生活的路上撞见。", author: "Q-LINK-A" },
  { text: "把浮躁的心，揉碎在安静的雨夜和温暖的旋律中。", author: "还有音乐" }
];

// Immersive Animated Scenes for Bilibili Companion Style
const RainWindowScene = () => {
  return (
    <div className="absolute inset-0 bg-[#070a08]/95 overflow-hidden rounded-3xl">
      {/* Blurred background image of room lights */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-[8px] opacity-25 scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop')" }}
      />
      {/* Wooden Window frame grid */}
      <div className="absolute inset-0 border-[20px] border-[#18120f] pointer-events-none z-10 opacity-70" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-[#18120f] pointer-events-none z-10 opacity-70" />
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-3 bg-[#18120f] pointer-events-none z-10 opacity-70" />
      
      {/* Raindrops falling down */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {Array.from({ length: 25 }).map((_, i) => {
          const left = (i * 4) + Math.random() * 1.5;
          const duration = 1.0 + Math.random() * 1.2;
          const delay = Math.random() * 2.5;
          return (
            <div 
              key={i}
              className="absolute w-[1.5px] bg-gradient-to-b from-white/5 to-white/60 rounded-full"
              style={{
                left: `${left}%`,
                top: `-100px`,
                height: `${40 + Math.random() * 50}px`,
                animation: `ddd-rain-fall ${duration}s linear infinite`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const SunsetTrainScene = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-rose-500 to-[#1e152d] overflow-hidden rounded-3xl">
      {/* Glowing sun */}
      <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-amber-200 rounded-full blur-2xl opacity-50" />
      
      {/* Moving distant mountains */}
      <div 
        className="absolute bottom-12 left-0 w-[200%] h-32 flex pointer-events-none"
        style={{
          animation: 'ddd-train-scenery 25s linear infinite',
        }}
      >
        <div className="w-1/2 h-full flex items-end">
          <svg className="w-full h-20 text-rose-950/20 fill-current" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,20 Q15,4 30,20 T60,20 Q75,6 90,20 T100,20 L100,20 L0,20 Z" />
          </svg>
        </div>
        <div className="w-1/2 h-full flex items-end">
          <svg className="w-full h-20 text-rose-950/20 fill-current" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,20 Q15,4 30,20 T60,20 Q75,6 90,20 T100,20 L100,20 L0,20 Z" />
          </svg>
        </div>
      </div>

      {/* Moving medium hills/trees */}
      <div 
        className="absolute bottom-8 left-0 w-[200%] h-24 flex pointer-events-none"
        style={{
          animation: 'ddd-train-scenery 12s linear infinite',
        }}
      >
        <div className="w-1/2 h-full flex items-end">
          <svg className="w-full h-14 text-rose-950/45 fill-current" viewBox="0 0 100 15" preserveAspectRatio="none">
            <path d="M0,15 Q8,3 16,15 T32,15 T48,15 Q56,2 64,15 T80,15 L100,15 L100,15 L0,15 Z" />
          </svg>
        </div>
        <div className="w-1/2 h-full flex items-end">
          <svg className="w-full h-14 text-rose-950/45 fill-current" viewBox="0 0 100 15" preserveAspectRatio="none">
            <path d="M0,15 Q8,3 16,15 T32,15 T48,15 Q56,2 64,15 T80,15 L100,15 L100,15 L0,15 Z" />
          </svg>
        </div>
      </div>

      {/* Passing power poles / wires */}
      <div 
        className="absolute bottom-6 left-0 w-[200%] h-48 flex pointer-events-none z-10"
        style={{
          animation: 'ddd-train-scenery 3s linear infinite',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-1/4 h-full relative flex items-end">
            <div className="absolute left-10 bottom-0 w-1.5 h-36 bg-[#160f21]/70" />
            <div className="absolute left-4 bottom-28 w-12 h-1 bg-[#160f21]/70" />
            <div className="absolute left-10 bottom-20 w-1 h-16 bg-[#160f21]/70 skew-x-12" />
          </div>
        ))}
      </div>

      {/* Train window frame shadow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-20" />
      <div className="absolute inset-0 border-[24px] border-[#18141d] pointer-events-none opacity-85 rounded-3xl z-30" />
    </div>
  );
};

const BilibiliVideoScene = ({ bvid = "BV1UZ7H69Exp" }: { bvid?: string }) => {
  return (
    <div className="absolute inset-0 bg-black overflow-hidden rounded-3xl">
      <iframe
        src={`https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=1`}
        className="w-full h-full scale-[1.02] border-none"
        scrolling="no"
        frameBorder="no"
        allowFullScreen={true}
        allow="autoplay; fullscreen"
        style={{ pointerEvents: 'auto' }}
      ></iframe>
      {/* Vignette overlay to make text readable */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
      <div className="absolute inset-0 pointer-events-none bg-black/10 z-10" />
    </div>
  );
};

const CafeWindowScene = () => {
  return (
    <div className="absolute inset-0 bg-[#120e11] overflow-hidden rounded-3xl">
      {/* Seaside night light view */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-[6px] opacity-30"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200&auto=format&fit=crop')" }}
      />
      
      {/* Cafe sign neon effect */}
      <div className="absolute top-12 right-12 text-[#ff4b70] font-serif text-xs px-2.5 py-1 border border-[#ff4b70]/40 rounded-lg select-none shadow-[0_0_15px_rgba(255,75,112,0.35)] opacity-60 animate-pulse">
        ☕ L’Amour Café
      </div>

      {/* Floating cozy dust particles in the light ray */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {Array.from({ length: 18 }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = 3.5 + Math.random() * 5;
          const delay = Math.random() * 4;
          return (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-amber-200/40 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `ddd-float-particle ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

interface DeskForegroundProps {
  isLampOn: boolean;
  setIsLampOn: (b: boolean) => void;
  onCoffeeSip: () => void;
  onPetCat: () => void;
  activeAccessory: 'coffee' | 'cactus' | 'lamp' | 'flower' | 'journal';
}

const DeskForeground = ({ isLampOn, setIsLampOn, onCoffeeSip, onPetCat, activeAccessory }: DeskForegroundProps) => {
  return (
    <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#0e0a08] to-[#201712] border-t-4 border-[#2d211a] px-6 flex justify-between items-end pb-3 z-35 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      {/* Left Desk Items: Lamp & Cup */}
      <div className="flex items-end gap-5">
        {/* Toggleable Desk Lamp */}
        <div 
          onClick={() => setIsLampOn(!isLampOn)}
          className="cursor-pointer group flex flex-col items-center select-none animate-pulse"
          style={{ animationDuration: '3s' }}
          title="点击开关台灯"
        >
          {/* Light glow aura */}
          {isLampOn && (
            <div className="absolute -top-12 w-28 h-28 bg-amber-300/15 rounded-full blur-2xl pointer-events-none" />
          )}
          {/* Metal vintage lamp icon */}
          <div className="relative">
            {/* Lamp Head */}
            <div className={`w-7 h-5 rounded-t-full transition-colors ${isLampOn ? 'bg-amber-400 border border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'bg-zinc-600'}`} />
            {/* Lamp Stand */}
            <div className="w-1 h-10 bg-zinc-400 mx-auto" />
            {/* Lamp Base */}
            <div className="w-8 h-1.5 bg-zinc-500 rounded-full" />
          </div>
          <span className="text-[7px] text-zinc-400 mt-1 font-bold group-hover:text-amber-200 transition-colors">
            {isLampOn ? '💡 暖光开' : '🔌 暖光关'}
          </span>
        </div>

        {/* Coffee Mug */}
        <div 
          onClick={onCoffeeSip}
          className="cursor-pointer group flex flex-col items-center relative select-none"
          title="点击啜饮热咖啡"
        >
          {/* Animated Steam */}
          <div className="absolute -top-4 flex gap-0.5 justify-center w-full">
            <div className="w-[1.5px] h-3 bg-white/20 rounded-full" style={{ animation: 'ddd-steam-rise 1.8s infinite', animationDelay: '0s' }} />
            <div className="w-[1.5px] h-4 bg-white/20 rounded-full" style={{ animation: 'ddd-steam-rise 1.5s infinite', animationDelay: '0.3s' }} />
            <div className="w-[1.5px] h-3 bg-white/20 rounded-full" style={{ animation: 'ddd-steam-rise 2s infinite', animationDelay: '0.6s' }} />
          </div>
          
          {/* Porcelain Mug */}
          <div className="relative w-8 h-7 bg-amber-50 rounded-b-lg border-t border-amber-100 flex items-center justify-center shadow-md">
            {/* Handle */}
            <div className="absolute -right-1.5 top-1 w-2.5 h-3.5 border-2 border-amber-50 rounded-r-full" />
            {/* Cute pattern */}
            <span className="text-[8px]">☕</span>
          </div>
          <span className="text-[7px] text-zinc-400 mt-1 font-bold group-hover:text-amber-200 transition-colors">
            啜饮热咖啡
          </span>
        </div>
      </div>

      {/* Centered Study Book / Notebook */}
      <div className="w-40 h-24 bg-[#faf6f0] rounded-t-lg shadow-inner border-x-4 border-t-4 border-[#eae3da] p-2.5 text-left overflow-hidden relative shadow-lg transform -rotate-1 origin-bottom-left">
        <div className="border-b border-slate-200 pb-1 flex justify-between items-center">
          <span className="text-[7px] font-bold text-slate-400 tracking-wider">STUDY JOURNAL</span>
          <span className="text-[7px] font-bold text-[#627264]">滴答自修室</span>
        </div>
        <div className="mt-1 space-y-1">
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-emerald-600">✔</span>
            <p className="text-[7px] font-bold text-slate-600 truncate">心流专注：激活中</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-emerald-600">✔</span>
            <p className="text-[7px] font-bold text-slate-600 truncate">高解析陪伴环绕声</p>
          </div>
        </div>
        <div className="absolute bottom-1 right-2 flex items-center gap-0.5 scale-75 origin-bottom-right">
          <span className="text-[8px] text-rose-500">🍅</span>
          <span className="text-[7px] font-bold text-slate-400">Pomo</span>
        </div>
      </div>

      {/* Right Desk Items: sleeping cat & selected accessory */}
      <div className="flex items-end gap-4">
        {/* Desk Accessory choice */}
        <div className="flex flex-col items-center">
          <span className="text-[12px] drop-shadow">{activeAccessory === 'cactus' ? '🌵' : activeAccessory === 'flower' ? '🌷' : activeAccessory === 'journal' ? '📒' : activeAccessory === 'lamp' ? '💡' : '☕'}</span>
          <span className="text-[7px] text-zinc-400 mt-1 font-bold">我的摆件</span>
        </div>

        {/* Sleeping Cat */}
        <div 
          onClick={onPetCat}
          className="cursor-pointer group flex flex-col items-center relative select-none"
          title="抚摸治愈小猫"
        >
          {/* Sleeping Cat Body */}
          <div 
            className="w-12 h-8 bg-[#dfb15b] rounded-t-2xl rounded-b-lg relative flex items-center justify-center shadow-md border-b-2 border-amber-600/40"
            style={{
              animation: 'ddd-cat-breathe 3s ease-in-out infinite',
              transformOrigin: 'bottom'
            }}
          >
            {/* Cat tail wrap */}
            <div className="absolute -left-1.5 bottom-1 w-3.5 h-2.5 bg-[#dfb15b] rounded-l-full border-l border-amber-600/20" />
            {/* Ear 1 */}
            <div className="absolute -top-1 left-1.5 w-2.5 h-2.5 bg-[#dfb15b] rotate-45 rounded" />
            {/* Ear 2 */}
            <div className="absolute -top-1 right-1.5 w-2.5 h-2.5 bg-[#dfb15b] rotate-12 rounded" />
            {/* Sleep eyes */}
            <span className="text-[6px] text-amber-950/60 font-bold tracking-tight">💤 🐱</span>
          </div>
          <span className="text-[7px] text-zinc-400 mt-1 font-bold group-hover:text-amber-200 transition-colors">
            轻抚咪咪
          </span>
        </div>
      </div>
    </div>
  );
};

export default function DidadidiApp() {
  // --- States ---
  // Timer settings
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customWorkTime, setCustomWorkTime] = useState(25);
  const [customBreakTime, setCustomBreakTime] = useState(5);

  // Focus Task
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('didadidi_tasks');
      return saved ? JSON.parse(saved) : [
        { id: '1', title: '完成心情日记《今日心流》 📖', estimatedTomatoes: 2, completedTomatoes: 1, isCompleted: false, createdAt: Date.now() - 3600000 },
        { id: '2', title: '在网易云寻找一首治愈纯音乐 🎵', estimatedTomatoes: 1, completedTomatoes: 0, isCompleted: false, createdAt: Date.now() - 7200000 },
        { id: '3', title: '阅读生活观察书单 15 分钟 📚', estimatedTomatoes: 3, completedTomatoes: 0, isCompleted: false, createdAt: Date.now() - 10000000 }
      ];
    } catch { return []; }
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('didadidi_active_task_id') || '1';
    } catch { return '1'; }
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskEstTomatoes, setNewTaskEstTomatoes] = useState(2);

  // Immersive state
  const [isImmersive, setIsImmersive] = useState(false);
  const [immersiveScene, setImmersiveScene] = useState<'zen' | 'rain_window' | 'cafe' | 'train' | 'bilibili'>('bilibili');
  const [bilibiliVid, setBilibiliVid] = useState('BV1UZ7H69Exp');
  const [danmakus, setDanmakus] = useState<Danmaku[]>([]);
  const [showDanmaku, setShowDanmaku] = useState(true);
  const [sessionCompletedTicket, setSessionCompletedTicket] = useState<{
    minutes: number;
    taskTitle: string | null;
    date: string;
  } | null>(null);

  // Bilibili Companion & Korean Aesthetic states
  const [isLampOn, setIsLampOn] = useState(true);
  const [selectedDeskAccessory, setSelectedDeskAccessory] = useState<'coffee' | 'cactus' | 'lamp' | 'flower' | 'journal'>('coffee');
  const [viewerCount, setViewerCount] = useState(1482);
  const [likesCount, setLikesCount] = useState(6529);
  const [userChatInput, setUserChatInput] = useState('');
  const [liveStreamQuality, setLiveStreamQuality] = useState<'1080P' | '720P' | '蓝光4K'>('1080P');
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([
    { id: 'm1', sender: 'NotANumberO_ 🦖', avatar: '🦖', text: '坐标广东，高三冲刺！大家加油！ 📝', time: '10:05' },
    { id: 'm2', sender: 'Miya 🐱', avatar: '🐱', text: '这个雨声白噪音合成得太逼真了叭 🌧️', time: '10:06' },
    { id: 'm3', sender: 'Luna 🐰', avatar: '🐰', text: '打卡第32天，今晚继续啃完数学卷子 💪', time: '10:07' },
    { id: 'm4', sender: '阿木 🐼', avatar: '🐼', text: '考研上岸！来这里找回了久违的宁静 🍃', time: '10:08' },
    { id: 'm5', sender: '屿·守望者 🌤️', avatar: '🌤️', text: '不急不躁，每天进步一点点就很棒啦 ✨', time: '10:09' }
  ]);

  // Sound States
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'campfire' | 'waves' | 'cafe'>('none');
  const [soundVolume, setSoundVolume] = useState(50); // percentage

  // Stats
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('didadidi_stats');
      return saved ? JSON.parse(saved) : {
        totalMinutes: 75,
        completedTomatoes: 3,
        streakDays: 4,
        lastFocusedDate: new Date().toDateString()
      };
    } catch {
      return { totalMinutes: 75, completedTomatoes: 3, streakDays: 4, lastFocusedDate: new Date().toDateString() };
    }
  });

  // Self-study peers and interactive seat
  const [peers, setPeers] = useState<Peer[]>(INITIAL_PEERS);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [myDeskTheme, setMyDeskTheme] = useState<'minimal' | 'wood' | 'rain' | 'midnight'>('minimal');

  // Random quotes
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Audio Context Ref for real-time sound synthesis
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Source nodes for stopping synthesis
  const synthSourcesRef = useRef<{
    noiseSource?: AudioBufferSourceNode;
    gainNode?: GainNode;
    lfoSource?: OscillatorNode;
    intervalId?: NodeJS.Timeout;
  }>({});

  // --- Effects ---
  // Sync tasks to localstorage
  useEffect(() => {
    try {
      localStorage.setItem('didadidi_tasks', JSON.stringify(tasks));
    } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try {
      if (activeTaskId) {
        localStorage.setItem('didadidi_active_task_id', activeTaskId);
      } else {
        localStorage.removeItem('didadidi_active_task_id');
      }
    } catch (e) {}
  }, [activeTaskId]);

  // Sync Stats to localstorage
  useEffect(() => {
    try {
      localStorage.setItem('didadidi_stats', JSON.stringify(stats));
    } catch (e) {}
  }, [stats]);

  // Handle timer ticks
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Completed current state
      handleTimerCompletion();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, customWorkTime]);

  // Fluctuate Bilibili viewer count
  useEffect(() => {
    const timer = setInterval(() => {
      setViewerCount(prev => Math.max(1200, prev + Math.floor(Math.random() * 9) - 4));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Sync scene transitions with white noises
  useEffect(() => {
    if (!isImmersive) return;
    
    if (immersiveScene === 'rain_window') {
      setActiveSound('rain');
      startSynthNoise('rain');
    } else if (immersiveScene === 'cafe') {
      setActiveSound('cafe');
      startSynthNoise('cafe');
    } else if (immersiveScene === 'train') {
      setActiveSound('waves'); // waves resemble rhythmic train track clicks
      startSynthNoise('waves');
    } else {
      setActiveSound('none');
      stopSynthNoise();
    }
  }, [immersiveScene, isImmersive]);

  // Simulate Bilibili live study bullet chat and vertical chat pane
  useEffect(() => {
    if (!isImmersive) {
      setDanmakus([]);
      return;
    }

    const interval = setInterval(() => {
      const messagesPool = [
        { sender: '风之使者 🍃', avatar: '🍃', text: '滴答自修室的韩系UI真好看，赏心悦目 🌷' },
        { sender: '星轨巡航 ✨', avatar: '✨', text: '刚刚点了一下那杯咖啡，热气太治愈啦 ☕' },
        { sender: '橘子汽水 🍊', avatar: '🍊', text: '窗外的雨滴滑落效果好逼真！好想念雨天 🌧️' },
        { sender: '小海豹 🦭', avatar: '🦭', text: '有人在黄昏电车写代码吗？夕阳好温柔 🌅' },
        { sender: '甜心布丁 🍮', avatar: '🍮', text: '摸了一下那只小猫，居然在打呼噜，心融化了 ❤️' },
        { sender: '风吹草动 🌾', avatar: '🌾', text: '大家都在几号座位呀？求拼桌 🙋' },
        { sender: '泡泡茶 🍵', avatar: '🍵', text: '番茄钟一响，数字小票仪式感拉满 🧾' },
        { sender: '梦想家 ☁️', avatar: '☁️', text: '台灯开关很棒，可以转换白日和深夜的氛围 💡' },
        { sender: '一叶知秋 🍁', avatar: '🍁', text: '打卡！大家一起努力，我们一定会金榜题名 ✨' },
        { sender: '奶盖玛奇朵 🥛', avatar: '🥛', text: '韩系简约风深得我心，心流拉满！' }
      ];

      const randomMsg = messagesPool[Math.floor(Math.random() * messagesPool.length)];
      
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
      const newStreamMsg = {
        id: Date.now().toString() + Math.random().toString(),
        sender: randomMsg.sender,
        avatar: randomMsg.avatar,
        text: randomMsg.text,
        time: timeStr
      };

      setStreamMessages(prev => [...prev.slice(-35), newStreamMsg]);

      if (showDanmaku) {
        const textToDisplay = `[${randomMsg.sender}] ${randomMsg.text}`;
        const newD: Danmaku = {
          id: Date.now().toString() + Math.random().toString(),
          text: textToDisplay,
          top: 6 + Math.random() * 45, // Top 6% to 51% of screen
          duration: 12 + Math.random() * 8 // 12 to 20 seconds
        };
        setDanmakus(prev => [...prev, newD]);
        
        setTimeout(() => {
          setDanmakus(prev => prev.filter(d => d.id !== newD.id));
        }, newD.duration * 1000);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isImmersive, showDanmaku]);

  // Switch timer presets when mode changes
  useEffect(() => {
    if (mode === 'work') {
      setTimeLeft(customWorkTime * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(customBreakTime * 60);
    } else if (mode === 'longBreak') {
      setTimeLeft(15 * 60);
    }
    setIsActive(false);
  }, [mode, customWorkTime, customBreakTime]);

  // Periodically update other study peers to simulate live interactions
  useEffect(() => {
    const peerInterval = setInterval(() => {
      setPeers(prevPeers => {
        return prevPeers.map(peer => {
          // 25% chance of updating status/tasks
          if (Math.random() > 0.75) {
            const isNowFocused = !peer.isFocused;
            let status = '专注中';
            if (!isNowFocused) {
              const breakTypes = ['喝茶中 ☕', '伸懒腰 🐾', '发呆中 🌤️', '听歌中 🎵'];
              status = breakTypes[Math.floor(Math.random() * breakTypes.length)];
            }
            return {
              ...peer,
              isFocused: isNowFocused,
              status,
              joinedMinutesAgo: peer.joinedMinutesAgo + 1
            };
          }
          return peer;
        });
      });
    }, 15000);

    return () => clearInterval(peerInterval);
  }, []);

  // Update quote periodically
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % STIMULATING_QUOTES.length);
    }, 18000);
    return () => clearInterval(quoteInterval);
  }, []);

  // Sync active audio volume
  useEffect(() => {
    if (synthSourcesRef.current.gainNode && audioCtxRef.current) {
      const volumeRatio = soundVolume / 100;
      synthSourcesRef.current.gainNode.gain.setValueAtTime(volumeRatio * 0.15, audioCtxRef.current.currentTime);
    }
  }, [soundVolume]);

  // Handle synthesized noise cleanups on unmount
  useEffect(() => {
    return () => {
      stopSynthNoise();
    };
  }, []);

  // --- Sound Synthesis via Web Audio API ---
  const startSynthNoise = (type: typeof activeSound) => {
    stopSynthNoise();
    if (type === 'none') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Create raw white noise buffer
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      // Create White Noise Source
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter Node
      const biquadFilter = ctx.createBiquadFilter();
      
      // Gain Node (Volume control)
      const gainNode = ctx.createGain();
      const initialVol = (soundVolume / 100) * 0.15; // safety scaling
      gainNode.gain.setValueAtTime(initialVol, ctx.currentTime);

      // Connect nodes
      noiseSource.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === 'rain') {
        // High cut low-pass to simulate rain drops hit the ground/window
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(950, ctx.currentTime);
        noiseSource.start();

        // Random rain droplets crackling (frequent sharp high clicks)
        const dropletInterval = setInterval(() => {
          if (!audioCtxRef.current) return;
          const dropOsc = audioCtxRef.current.createOscillator();
          const dropGain = audioCtxRef.current.createGain();
          dropOsc.connect(dropGain);
          dropGain.connect(ctx.destination);

          dropOsc.type = 'sine';
          dropOsc.frequency.setValueAtTime(1500 + Math.random() * 800, audioCtxRef.current.currentTime);
          dropGain.gain.setValueAtTime(Math.random() * 0.003 * (soundVolume / 100), audioCtxRef.current.currentTime);
          dropGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.04);
          
          dropOsc.start();
          dropOsc.stop(audioCtxRef.current.currentTime + 0.04);
        }, 80);

        synthSourcesRef.current.intervalId = dropletInterval;

      } else if (type === 'campfire') {
        // Reddish brown low noise for hum + rapid tiny popping crackles
        biquadFilter.type = 'bandpass';
        biquadFilter.frequency.setValueAtTime(450, ctx.currentTime);
        biquadFilter.Q.setValueAtTime(1.0, ctx.currentTime);
        noiseSource.start();

        // Random fireplace wood snaps
        const sparkInterval = setInterval(() => {
          if (!audioCtxRef.current) return;
          const sparkOsc = audioCtxRef.current.createOscillator();
          const sparkGain = audioCtxRef.current.createGain();
          sparkOsc.connect(sparkGain);
          sparkGain.connect(ctx.destination);

          sparkOsc.type = 'triangle';
          sparkOsc.frequency.setValueAtTime(200 + Math.random() * 600, audioCtxRef.current.currentTime);
          sparkGain.gain.setValueAtTime(Math.random() * 0.02 * (soundVolume / 100), audioCtxRef.current.currentTime);
          sparkGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.08);
          
          sparkOsc.start();
          sparkOsc.stop(audioCtxRef.current.currentTime + 0.08);
        }, 220);

        synthSourcesRef.current.intervalId = sparkInterval;

      } else if (type === 'waves') {
        // LFO (Low frequency oscillator) sweeps the volume up and down at 0.08Hz to simulate tide waves
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(400, ctx.currentTime);
        noiseSource.start();

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow cycle (12 seconds)
        lfo.type = 'sine';
        
        lfoGain.gain.setValueAtTime(0.07 * (soundVolume / 100), ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain); // Modulate volume dynamically
        
        lfo.start();
        synthSourcesRef.current.lfoSource = lfo;

      } else if (type === 'cafe') {
        // Deep lowpass rumblings with double oscillators playing pleasant seventh chords softly
        biquadFilter.type = 'lowpass';
        biquadFilter.frequency.setValueAtTime(280, ctx.currentTime);
        noiseSource.start();

        // Cozy Rhodes-like synth keys hitting randomly for the jazz cafe vibe
        const cafeInterval = setInterval(() => {
          if (!audioCtxRef.current) return;
          const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25]; // Cmaj7, Em chord keys
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          
          const keyOsc = audioCtxRef.current.createOscillator();
          const keyGain = audioCtxRef.current.createGain();
          keyOsc.connect(keyGain);
          keyGain.connect(ctx.destination);

          keyOsc.type = 'sine';
          keyOsc.frequency.setValueAtTime(randomNote, audioCtxRef.current.currentTime);
          keyGain.gain.setValueAtTime(0.005 * (soundVolume / 100), audioCtxRef.current.currentTime);
          keyGain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 1.8);
          
          keyOsc.start();
          keyOsc.stop(audioCtxRef.current.currentTime + 1.8);
        }, 3000);

        synthSourcesRef.current.intervalId = cafeInterval;
      }

      synthSourcesRef.current.noiseSource = noiseSource;
      synthSourcesRef.current.gainNode = gainNode;

    } catch (e) {
      console.warn("Synthesis fail or blocked by permissions:", e);
    }
  };

  const stopSynthNoise = () => {
    try {
      if (synthSourcesRef.current.noiseSource) {
        synthSourcesRef.current.noiseSource.disconnect();
        synthSourcesRef.current.noiseSource.stop();
      }
      if (synthSourcesRef.current.lfoSource) {
        synthSourcesRef.current.lfoSource.disconnect();
        synthSourcesRef.current.lfoSource.stop();
      }
      if (synthSourcesRef.current.intervalId) {
        clearInterval(synthSourcesRef.current.intervalId);
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    } catch (e) {}

    synthSourcesRef.current = {};
    audioCtxRef.current = null;
  };

  const handleSoundToggle = (soundId: typeof activeSound) => {
    if (activeSound === soundId) {
      setActiveSound('none');
      stopSynthNoise();
    } else {
      setActiveSound(soundId);
      startSynthNoise(soundId);
    }
  };

  // --- Handlers ---
  const handleTimerCompletion = () => {
    setIsActive(false);
    playTimerAlertSound();

    if (mode === 'work') {
      // Reward stats
      const sessionMinutes = customWorkTime;
      const todayString = new Date().toDateString();
      
      let isNewStreakDay = false;
      if (stats.lastFocusedDate !== todayString) {
        isNewStreakDay = true;
      }

      setStats(prev => ({
        ...prev,
        totalMinutes: prev.totalMinutes + sessionMinutes,
        completedTomatoes: prev.completedTomatoes + 1,
        streakDays: isNewStreakDay ? prev.streakDays + 1 : prev.streakDays,
        lastFocusedDate: todayString
      }));

      let completedTaskTitle = null;
      // Reward task
      if (activeTaskId) {
        setTasks(prev => prev.map(t => {
          if (t.id === activeTaskId) {
            completedTaskTitle = t.title;
            const nextCompleted = t.completedTomatoes + 1;
            const isCompletedNow = nextCompleted >= t.estimatedTomatoes;
            return {
              ...t,
              completedTomatoes: nextCompleted,
              isCompleted: isCompletedNow
            };
          }
          return t;
        }));
      }

      setSessionCompletedTicket({
        minutes: sessionMinutes,
        taskTitle: completedTaskTitle || (activeTask ? activeTask.title : "专注静修"),
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
      });

      // Switch to break automatically
      setMode('shortBreak');
    } else {
      // Completed break, switch back to work
      setMode('work');
    }
  };

  const playTimerAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.type = 'triangle';
      // Delightful retro clock chime
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.85);
      
      osc.start(now);
      osc.stop(now + 0.85);
    } catch (e) {}
  };

  // Task creation
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      estimatedTomatoes: newTaskEstTomatoes,
      completedTomatoes: 0,
      isCompleted: false,
      createdAt: Date.now()
    };

    setTasks(prev => [newTask, ...prev]);
    setActiveTaskId(newTask.id);
    setNewTaskTitle('');
    setNewTaskEstTomatoes(2);
  };

  // Task delete
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (activeTaskId === id) {
      setActiveTaskId(null);
    }
  };

  const handleToggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    }));
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get active focus task name
  const activeTask = tasks.find(t => t.id === activeTaskId);

  return (
    <div className="w-full h-full text-slate-800 flex flex-col relative bg-[#F8F5F0] select-none font-sans overflow-hidden">
      
      {/* Dynamic Header (Minimalist Korean Design) */}
      <div className="px-6 py-4 border-b border-[#ebdcd0]/60 flex items-center justify-between shrink-0 bg-[#FCFBF9]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#8C9A86] rounded-xl flex items-center justify-center text-white font-serif font-black text-sm shadow-inner transform -rotate-3">
            滴
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#4E564D] tracking-wider flex items-center gap-1">
              滴答滴 · 24h 沉浸式伴学自修室
              <span className="text-[8px] bg-[#EBE7DF] text-[#6E786B] font-black px-1.5 py-0.5 rounded-md tracking-wider">PREMIUM</span>
            </h2>
            <p className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">在时光流淌中，揉碎生活的所有疲惫与轻浮。和 1,482 位同窗安静治愈</p>
          </div>
        </div>

        {/* Top widgets and Immersive Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#F1EDE4] px-3 py-1.5 rounded-full text-[9px] font-bold text-[#5C645A]">
            <Flame size={12} className="text-rose-400 animate-bounce" />
            <span>心流打卡 <strong className="text-rose-500 font-extrabold">{stats.streakDays}</strong> 天</span>
          </div>
          
          <button
            onClick={() => setIsImmersive(!isImmersive)}
            className="px-4 py-2 bg-[#8C9A86] text-white hover:bg-[#72806D] rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Sparkles size={11} className="animate-spin" style={{ animationDuration: '6s' }} />
            进入 B站式伴学沉浸
          </button>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 flex overflow-hidden p-5 gap-5 relative">
        
        {/* Left Column: Pomodoro Clock & Calming White Noise */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Main Rounded Clock Box (Korean Aesthetic Desk Mood) */}
          <div className="bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-sm min-h-[220px]">
            {/* Elegant SVG Circular Progress */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-0">
              <svg className="w-[200px] h-[200px] transform -rotate-90">
                <circle cx="100" cy="100" r="90" fill="transparent" stroke="#ebdcd0" strokeWidth="2" strokeDasharray="4 4" />
                <circle 
                  cx="100" cy="100" r="90" fill="transparent" stroke="#8C9A86" strokeWidth="3" 
                  strokeDasharray="565.48" 
                  strokeDashoffset={565.48 - (565.48 * (timeLeft / ((mode === 'work' ? customWorkTime : mode === 'shortBreak' ? customBreakTime : 15) * 60)))}
                  className="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Virtual Zen Plant that grows based on tomatoes */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0 pb-16">
              <span className="text-6xl filter grayscale hover:grayscale-0 transition-all duration-1000">
                {stats.completedTomatoes === 0 ? '🌱' : stats.completedTomatoes < 3 ? '🌿' : stats.completedTomatoes < 6 ? '🪴' : '🌳'}
              </span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex gap-1.5 bg-[#F1EDE4]/80 p-1 rounded-full relative z-10 scale-95 mb-4 border border-[#ebdcd0]/20">
              {[
                { id: 'work', label: '专注番茄 🍅' },
                { id: 'shortBreak', label: '短休时刻 ☕' },
                { id: 'longBreak', label: '深呼吸长休 🌤️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as any)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    mode === tab.id 
                      ? 'bg-[#FCFBF9] text-[#5C645A] shadow-sm font-extrabold' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Floating Timer Text */}
            <div className="text-center relative z-10 mb-4">
              <motion.span 
                key={timeLeft}
                initial={{ scale: 0.96, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-5xl font-black text-[#3C423B] tracking-tight block drop-shadow-sm"
              >
                {formatTime(timeLeft)}
              </motion.span>
              
              {/* Focus task indication */}
              <p className="text-[10px] text-[#606A5E] font-bold mt-2 bg-[#EBE7DF] px-3 py-1 rounded-full inline-block">
                {activeTask ? `当前专注目标: ${activeTask.title}` : '💡 先在右侧选择或新建一个专注任务吧'}
              </p>
            </div>

            {/* Timer controls */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                onClick={() => {
                  setIsActive(!isActive);
                  if (activeSound !== 'none' && !audioCtxRef.current) {
                    startSynthNoise(activeSound);
                  }
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95 ${
                  isActive 
                    ? 'bg-amber-500 hover:bg-amber-600' 
                    : 'bg-[#8C9A86] hover:bg-[#72806D]'
                }`}
                title={isActive ? '暂停' : '启动'}
              >
                {isActive ? <Pause size={20} fill="white" /> : <Play size={20} className="ml-0.5" fill="white" />}
              </button>

              <button
                onClick={() => {
                  setIsActive(false);
                  if (mode === 'work') setTimeLeft(customWorkTime * 60);
                  else if (mode === 'shortBreak') setTimeLeft(customBreakTime * 60);
                  else setTimeLeft(15 * 60);
                }}
                className="w-9 h-9 rounded-full bg-[#EBE7DF] hover:bg-[#dedad0] text-[#5C645A] flex items-center justify-center transition-all active:scale-95"
                title="重置计时"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Calming White Noises (Real-time Synthesized) */}
          <div className="bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-5 space-y-3.5 shadow-sm">
            <div className="flex justify-between items-center pb-2 border-b border-[#ebdcd0]/30">
              <span className="text-[10px] text-[#4E564D] font-black flex items-center gap-1 uppercase tracking-wider">
                <Volume2 size={12} className="text-[#8C9A86]" />
                高解析白噪音环绕 (实时声波合成)
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-[8px] text-slate-400 font-medium">音量 {soundVolume}%</span>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-16 accent-[#8C9A86] h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {[
                { id: 'rain', label: '森林细雨 🌧️', desc: '低频温润水滴' },
                { id: 'campfire', label: '深夜篝火 🔥', desc: '温暖干柴噼啪' },
                { id: 'waves', label: '潮汐海浪 🌊', desc: '周期呼吸律动' },
                { id: 'cafe', label: '爵士咖啡 ☕', desc: '空气环境钢琴' }
              ].map(sound => {
                const isCurrent = activeSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleSoundToggle(sound.id as any)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                      isCurrent 
                        ? 'bg-[#8C9A86]/10 border-[#8C9A86] text-[#4E564D] font-extrabold shadow-sm' 
                        : 'bg-white border-[#ebdcd0]/40 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold">{sound.label}</span>
                    <span className="text-[7px] text-slate-400 mt-1 leading-tight">{sound.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Settings adjustments */}
          <div className="bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-5 shadow-sm space-y-3.5">
            <span className="text-[10px] text-[#4E564D] font-black uppercase tracking-wider block">⏱️ 专注时制微调 (分钟)</span>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">工作番茄时间</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customWorkTime}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(120, Number(e.target.value)));
                      setCustomWorkTime(val);
                      if (mode === 'work') setTimeLeft(val * 60);
                    }}
                    className="w-full bg-[#FCFBF9] border border-[#ebdcd0]/40 rounded-xl px-2.5 py-1.5 text-[10px] text-[#4E564D] focus:outline-none focus:border-[#8C9A86]"
                  />
                  <span className="text-[9px] text-slate-400 shrink-0 font-bold">分钟</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">休假短息周期</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customBreakTime}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(60, Number(e.target.value)));
                      setCustomBreakTime(val);
                      if (mode === 'shortBreak') setTimeLeft(val * 60);
                    }}
                    className="w-full bg-[#FCFBF9] border border-[#ebdcd0]/40 rounded-xl px-2.5 py-1.5 text-[10px] text-[#4E564D] focus:outline-none focus:border-[#8C9A86]"
                  />
                  <span className="text-[9px] text-slate-400 shrink-0 font-bold">分钟</span>
                </div>
              </div>
            </div>
          </div>

          {/* Focus Activity Heatmap (GitHub-style) */}
          <div className="bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-5 shadow-sm space-y-3.5 shrink-0">
            <span className="text-[10px] text-[#4E564D] font-black uppercase tracking-wider flex items-center justify-between">
              <span>📅 本周专注刻印热力图</span>
              <span className="text-[8px] text-slate-400 font-bold">{stats.totalMinutes} 分钟总专注时长</span>
            </span>
            <div className="flex gap-1.5 justify-between">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => {
                const today = new Date().getDay();
                const actualTodayIdx = today === 0 ? 6 : today - 1; // 0 is monday
                const isToday = i === actualTodayIdx;
                const isPast = i < actualTodayIdx;
                // mock intensity based on real stats for today, random for past
                const intensity = isToday 
                  ? (stats.completedTomatoes >= 4 ? 3 : stats.completedTomatoes >= 2 ? 2 : stats.completedTomatoes > 0 ? 1 : 0) 
                  : isPast ? Math.floor(Math.random() * 4) : 0;
                
                const bgClass = intensity === 3 ? 'bg-[#8C9A86]' : intensity === 2 ? 'bg-[#8C9A86]/70' : intensity === 1 ? 'bg-[#8C9A86]/40' : 'bg-[#EBE7DF]/30';
                
                return (
                  <div key={day} className="flex flex-col items-center gap-1.5 flex-1 group relative">
                    <div className={`w-full aspect-square rounded-md border border-[#ebdcd0]/20 transition-all duration-500 ${bgClass} ${isToday ? 'ring-1 ring-[#8C9A86]/50 ring-offset-1 ring-offset-[#FAF9F5] scale-105' : 'hover:scale-105'}`} />
                    <span className={`text-[8px] font-bold ${isToday ? 'text-[#8C9A86]' : 'text-slate-400'}`}>{day}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-6 bg-[#4E564D] text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10 font-medium">
                      {isToday ? `今日完成 ${stats.completedTomatoes} 番茄` : isPast ? `完成 ${intensity * 2} 番茄` : '未开始'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: ToDo List Manager */}
        <div className="w-[310px] flex flex-col gap-4 overflow-hidden">
          
          {/* Create Task Form */}
          <div className="bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-5 shadow-sm space-y-3 shrink-0">
            <span className="text-[10px] text-[#4E564D] font-black uppercase tracking-wider block flex items-center gap-1">
              📝 誓约目标 · 新建番茄 ToDo
            </span>
            <form onSubmit={handleCreateTask} className="space-y-2.5">
              <input
                type="text"
                placeholder="想要完成什么？(例: 书写我的生活日记...)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-[#FCFBF9] border border-[#ebdcd0]/40 rounded-xl px-2.5 py-2 text-[10px] text-[#4E564D] outline-none focus:border-[#8C9A86] placeholder-slate-400 font-medium"
              />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-slate-400 font-bold">预估番茄数:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewTaskEstTomatoes(num)}
                        className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center transition-all ${
                          newTaskEstTomatoes === num 
                            ? 'bg-[#8C9A86] text-white shadow-sm' 
                            : 'bg-white border border-[#ebdcd0]/30 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#8C9A86] text-white rounded-xl px-3 py-1.5 text-[9px] font-bold hover:bg-[#72806D] transition-all flex items-center gap-0.5 shadow-sm active:scale-95"
                >
                  <Plus size={10} />
                  刻入自修
                </button>
              </div>
            </form>
          </div>

          {/* Tasks List Container */}
          <div className="flex-1 bg-[#FAF9F5] border border-[#ebdcd0]/40 rounded-3xl p-5 shadow-sm flex flex-col overflow-hidden">
            <div className="flex justify-between items-center pb-2 border-b border-[#ebdcd0]/30 mb-2.5 shrink-0">
              <span className="text-[10px] text-[#4E564D] font-black uppercase tracking-wider">誓约任务面板 ({tasks.length})</span>
              <span className="text-[8px] text-slate-400 font-bold">点击一行选为“当前专注”</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
              {tasks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4">
                  <span className="text-xl mb-1">🌿</span>
                  <p className="text-[10px] font-medium leading-relaxed">暂时没有誓约任务呢，去上方添加一个吧~</p>
                </div>
              ) : (
                tasks.map(task => {
                  const isActiveTask = task.id === activeTaskId;
                  return (
                    <div
                      key={task.id}
                      onClick={() => !task.isCompleted && setActiveTaskId(task.id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer relative group ${
                        task.isCompleted 
                          ? 'bg-slate-50 border-slate-100 opacity-60' 
                          : isActiveTask 
                            ? 'bg-[#8C9A86]/5 border-[#8C9A86] shadow-sm' 
                            : 'bg-[#FCFBF9] border-[#ebdcd0]/30 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-[10px] font-semibold leading-relaxed flex-1 ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[8px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-400">预计番茄:</span>
                          <span className="font-bold text-[#8C9A86]">
                            {Array.from({ length: task.estimatedTomatoes }).map((_, idx) => (
                              <span key={idx} className="mr-0.5 text-[8px]">
                                {idx < task.completedTomatoes ? '🍅' : '🤍'}
                              </span>
                            ))}
                          </span>
                        </div>

                        {task.isCompleted ? (
                          <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check size={8} className="stroke-[3]" /> 圆满达成
                          </span>
                        ) : isActiveTask ? (
                          <span className="bg-[#EBE7DF] text-[#4E564D] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse">
                            当前专注
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Peer Study Area: Interactive Seats & Statistics */}
      <div className="h-[120px] bg-[#FCFBF9] border-t border-[#ebdcd0]/60 p-4 shrink-0 flex items-center justify-between gap-6 overflow-hidden">
        
        {/* Aesthetic Quote Board */}
        <div className="w-[250px] border-r border-[#ebdcd0]/40 pr-5 flex flex-col justify-center shrink-0">
          <p className="text-[9px] text-[#8C9A86] font-black tracking-wider uppercase mb-1">心流名言 Board</p>
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5 }}
              className="space-y-0.5"
            >
              <p className="text-[10px] text-[#4E564D] leading-normal font-semibold italic">
                “{STIMULATING_QUOTES[quoteIndex].text}”
              </p>
              <span className="text-[8px] text-slate-400 font-bold block text-right">
                —— {STIMULATING_QUOTES[quoteIndex].author}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Co-Studying Seats (在线陪伴自修椅) */}
        <div className="flex-1 overflow-hidden flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] text-[#4E564D] font-black uppercase tracking-wider flex items-center gap-1">
              <Users size={11} className="text-[#8C9A86]" />
              并肩同屏共学椅 (共 6 席)
            </span>
            <span className="text-[8px] text-slate-400 font-medium">加入座位，与自律同窗一起安静陪伴、互相激励</span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {/* Render 5 other peers */}
            {peers.map((peer) => (
              <div 
                key={peer.id} 
                className="bg-[#FAF9F5] border border-[#ebdcd0]/30 rounded-xl p-1.5 flex items-center gap-1.5 shadow-sm overflow-hidden"
                title={`${peer.name} | ${peer.status}: ${peer.task}`}
              >
                <div className="w-6 h-6 bg-[#8C9A86]/10 rounded-lg flex items-center justify-center text-xs shrink-0 relative font-extrabold">
                  {peer.avatar}
                  {peer.isFocused && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-white animate-ping" />
                  )}
                </div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-[8px] font-bold text-slate-700 truncate leading-tight">{peer.name}</p>
                  <p className="text-[7px] text-[#8C9A86] font-semibold truncate leading-none mt-0.5">{peer.status}</p>
                </div>
              </div>
            ))}

            {/* My seat */}
            <button
              onClick={() => {
                if (selectedSeat !== null) {
                  setSelectedSeat(null);
                } else {
                  setSelectedSeat(1);
                  playTimerAlertSound();
                }
              }}
              className={`rounded-xl p-1.5 border flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                selectedSeat !== null 
                  ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse font-extrabold' 
                  : 'bg-white border-dashed border-[#8C9A86]/40 hover:bg-[#eaf2ed]/40 text-[#8C9A86]'
              }`}
            >
              <div className="w-5 h-5 bg-[#8C9A86]/10 rounded-lg flex items-center justify-center text-xs shrink-0">
                {selectedSeat !== null ? '🦖' : '➕'}
              </div>
              <div className="overflow-hidden text-left min-w-0 flex-1">
                <p className="text-[8px] font-bold truncate leading-tight">
                  {selectedSeat !== null ? '我的座位' : '点击入座'}
                </p>
                <p className="text-[7px] text-[#8C9A86] font-semibold truncate leading-none mt-0.5">
                  {selectedSeat !== null ? '安静专注中' : '心流自修位'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Global stats review */}
        <div className="w-[180px] border-l border-[#ebdcd0]/40 pl-5 flex flex-col justify-center shrink-0">
          <div className="space-y-1">
            <span className="text-[9px] text-[#8C9A86] font-black uppercase tracking-wider block">今日专注累积</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-slate-800">{stats.totalMinutes}</span>
              <span className="text-[8px] text-slate-400 font-bold">分钟</span>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-bold">
              <span>已获番茄:</span>
              <span className="text-rose-500">🍅 {stats.completedTomatoes} 个</span>
            </div>
          </div>
        </div>

      </div>

      {/* Majestic Immersive B站-style Companionship Overlay */}
      <AnimatePresence>
        {isImmersive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d100e] text-white z-[120] flex flex-col p-5 overflow-hidden font-sans"
          >
            {/* Ambient desk lamp warm light overlay when lamp is ON */}
            {isLampOn && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(253,230,138,0.18),transparent_75%)] pointer-events-none z-30 mix-blend-screen" />
            )}

            {/* Simulated Animated Backgrounds based on Scene Selection */}
            {immersiveScene === 'bilibili' && <BilibiliVideoScene bvid={bilibiliVid} />}
            {immersiveScene === 'rain_window' && <RainWindowScene />}
            {immersiveScene === 'train' && <SunsetTrainScene />}
            {immersiveScene === 'cafe' && <CafeWindowScene />}
            {immersiveScene === 'zen' && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-15 transition-opacity duration-1000" 
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop')" }} 
              />
            )}

            {/* Floating Danmaku Layer */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
              <AnimatePresence>
                {danmakus.map(d => (
                  <motion.div
                    key={d.id}
                    initial={{ x: '100vw', opacity: 0.95 }}
                    animate={{ x: '-100vw', opacity: 0.95 }}
                    transition={{ duration: d.duration, ease: "linear" }}
                    className="absolute whitespace-nowrap text-white text-xs font-semibold bg-black/35 px-3.5 py-1.5 rounded-full backdrop-blur-[2px] shadow-lg tracking-wide border border-white/5"
                    style={{ top: `${d.top}%` }}
                  >
                    {d.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Immersive Top Navigation Bar (High fidelity B站 style) */}
            <div className="flex justify-between items-center pb-3 border-b border-white/10 relative z-50 bg-black/55 px-4 py-2.5 rounded-2xl backdrop-blur-md shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#ff4b70] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider animate-pulse shadow-sm">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  LIVE 🔴
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold tracking-[0.1em] text-slate-100 flex items-center gap-1">
                    滴答自修室 · B站24H沉浸式伴学自播间
                    <span className="text-[8px] text-[#ff4b70] bg-[#ff4b70]/10 border border-[#ff4b70]/20 px-1 rounded font-black">4K 无损</span>
                  </span>
                  <span className="text-[9px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                    <Users size={10} className="text-amber-300" />
                    {viewerCount} 人正在同屏共修 · 累计点赞 {likesCount}
                  </span>
                </div>
              </div>

              {/* Scene Switchers */}
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 bg-black/30 p-1 rounded-full border border-white/5">
                  {[
                    { id: 'bilibili', label: '📺 B站沉浸伴学' },
                    { id: 'zen', label: '🌠 极简星云' },
                    { id: 'rain_window', label: '🌧️ 雨夜书房' },
                    { id: 'cafe', label: '☕ 暖冬咖啡' },
                    { id: 'train', label: '🌅 黄昏电车' }
                  ].map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => setImmersiveScene(scene.id as any)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                        immersiveScene === scene.id
                          ? 'bg-white text-black border-white shadow-md font-extrabold'
                          : 'bg-black/10 text-slate-300 border-transparent hover:bg-white/10'
                      }`}
                    >
                      {scene.label}
                    </button>
                  ))}
                </div>

                <div className="h-5 w-px bg-white/20 mx-1" />

                {immersiveScene === 'bilibili' && (
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-[10px] text-slate-300 font-bold">BV号:</span>
                    <input 
                      type="text" 
                      value={bilibiliVid}
                      onChange={(e) => setBilibiliVid(e.target.value.trim())}
                      placeholder="e.g. BV1UZ7H69Exp"
                      className="bg-black/30 text-white text-[10px] px-2 py-1 rounded-md border border-white/10 outline-none focus:border-[#ff4b70] w-28"
                    />
                  </div>
                )}

                {/* Danmaku Toggle */}
                <button
                  onClick={() => setShowDanmaku(!showDanmaku)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 border ${
                    showDanmaku 
                      ? 'bg-emerald-500 text-white border-emerald-400/30' 
                      : 'bg-white/10 text-slate-300 border-white/5'
                  }`}
                >
                  {showDanmaku ? <Eye size={11} /> : <EyeOff size={11} />}
                  弹幕
                </button>
                
                {/* Exit Immersive */}
                <button
                  onClick={() => setIsImmersive(false)}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 shadow-md border border-rose-400"
                >
                  <Minimize2 size={11} />
                  退出伴学
                </button>
              </div>
            </div>

            {/* Split Screen Stage: Left is Video Stream, Right is Interactive Live Panel */}
            <div className="flex-1 flex gap-5 mt-4 overflow-hidden relative z-40">
              
              {/* Left Column: Interactive Video Player Stage */}
              <div className="flex-1 rounded-3xl bg-black/35 backdrop-blur-sm border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-[0_15px_45px_rgba(0,0,0,0.4)]">
                
                {/* Active Scene Overlay Content */}
                {immersiveScene !== 'zen' && (
                  <DeskForeground 
                    isLampOn={isLampOn}
                    setIsLampOn={setIsLampOn}
                    onCoffeeSip={() => {
                      playTimerAlertSound();
                      const toastDanmaku = {
                        id: Date.now().toString(),
                        text: "☕ [提示] 你啜饮了一口香浓的热咖啡，心流源源不断涌现！",
                        top: 25 + Math.random() * 20,
                        duration: 8
                      };
                      setDanmakus(prev => [toastDanmaku, ...prev]);
                    }}
                    onPetCat={() => {
                      playTimerAlertSound();
                      const heartDanmaku = {
                        id: Date.now().toString(),
                        text: "🐱 [咪咪]：喵呜~ 呼噜噜…… (小猫被温柔地抚摸，露出了肚皮 ❤️)",
                        top: 30 + Math.random() * 20,
                        duration: 10
                      };
                      setDanmakus(prev => [heartDanmaku, ...prev]);
                    }}
                    activeAccessory={selectedDeskAccessory}
                  />
                )}

                {/* Big Zen Center Clock if scene is Zen, or small overlay clock if scene has foreground */}
                {immersiveScene === 'zen' ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {/* Giant elegant clock */}
                    <div className="relative w-64 h-64 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                      <motion.div 
                        animate={{ scale: isActive ? [1, 1.03, 1] : 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border border-emerald-500/20" 
                      />
                      <span className="text-[10px] text-emerald-400 tracking-[0.4em] uppercase font-black mb-2">
                        {mode === 'work' ? 'FOCUS TIME' : 'REST TIME'}
                      </span>
                      <motion.span 
                        key={timeLeft}
                        className="font-mono text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                      >
                        {formatTime(timeLeft)}
                      </motion.span>
                      <p className="text-[9px] text-slate-300 font-semibold mt-4 text-center px-6 max-w-[200px] leading-relaxed">
                        {activeTask ? activeTask.title : "保持呼吸，沉淀内心的杂念"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute top-8 left-8 z-30 bg-black/65 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center min-w-[150px] pointer-events-auto text-left">
                    <span className="text-[8px] text-amber-300 tracking-widest font-black uppercase mb-1">
                      {mode === 'work' ? '⏳ 专注中' : '☕ 休息中'}
                    </span>
                    <span className="font-mono text-3xl font-black text-white">
                      {formatTime(timeLeft)}
                    </span>
                    <p className="text-[8px] text-slate-300 max-w-[120px] truncate text-center mt-1 font-bold">
                      {activeTask ? activeTask.title : "无杂念静修"}
                    </p>
                  </div>
                )}

                {/* Floating To-Do List Widget in Immersive View */}
                <div className="absolute top-8 right-8 z-30 bg-black/55 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl w-52 max-h-[220px] flex flex-col pointer-events-auto">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 shrink-0">
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                      <Check size={10} /> 誓约任务
                    </span>
                    <span className="text-[8px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-bold">
                      {tasks.filter(t => !t.isCompleted).length} 待办
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                    {tasks.length === 0 && (
                      <p className="text-[9px] text-slate-400 text-center py-4">暂无专注任务</p>
                    )}
                    {tasks.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => !t.isCompleted && setActiveTaskId(t.id)}
                        className={`flex items-start gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                          t.isCompleted 
                            ? 'opacity-40 border-transparent bg-white/5' 
                            : t.id === activeTaskId 
                              ? 'border-emerald-500/40 bg-emerald-500/10 shadow-sm' 
                              : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`} 
                      >
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleToggleTaskCompletion(t.id);
                            playTimerAlertSound();
                          }} 
                          className={`w-3.5 h-3.5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                            t.isCompleted ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-emerald-400'
                          }`}
                        >
                          {t.isCompleted && <Check size={8} className="text-white" />}
                        </button>
                        <span className={`text-[9px] font-medium leading-tight flex-1 ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Translucent Video Controls Strip at the bottom of the player */}
                <div className="absolute bottom-4 left-4 right-4 z-40 bg-black/65 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl">
                  {/* Play & Reset controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        isActive ? 'bg-[#ff4b70] text-white animate-pulse' : 'bg-white text-black hover:bg-slate-200'
                      }`}
                    >
                      {isActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} className="ml-0.5" fill="currentColor" />}
                    </button>

                    <button
                      onClick={() => {
                        setIsActive(false);
                        if (mode === 'work') setTimeLeft(customWorkTime * 60);
                        else if (mode === 'shortBreak') setTimeLeft(customBreakTime * 60);
                        else setTimeLeft(15 * 60);
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/5"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>

                  {/* Sound Mixers */}
                  <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-1.5 scale-90">
                    <span className="text-[9px] text-slate-300 font-bold flex items-center gap-1 uppercase">
                      {activeSound !== 'none' ? (
                        <div className="flex items-end gap-[1.5px] h-3 mr-1">
                          <div className="w-[1.5px] bg-[#ff4b70] rounded-t-sm" style={{ height: '40%', animation: 'ddd-bounce-bar 0.8s ease-in-out infinite' }} />
                          <div className="w-[1.5px] bg-[#ff4b70] rounded-t-sm" style={{ height: '100%', animation: 'ddd-bounce-bar 1.2s ease-in-out infinite' }} />
                          <div className="w-[1.5px] bg-[#ff4b70] rounded-t-sm" style={{ height: '70%', animation: 'ddd-bounce-bar 0.9s ease-in-out infinite' }} />
                        </div>
                      ) : (
                        <Volume2 size={11} className="text-[#ff4b70]" />
                      )}
                      混音调节
                    </span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'rain', label: '🌧️ 雨' },
                        { id: 'campfire', label: '🔥 火' },
                        { id: 'waves', label: '🌊 海' },
                        { id: 'cafe', label: '☕ 咖' }
                      ].map(snd => {
                        const isSnd = activeSound === snd.id;
                        return (
                          <button
                            key={snd.id}
                            onClick={() => handleSoundToggle(snd.id as any)}
                            className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${
                              isSnd 
                                ? 'bg-white text-black shadow-sm' 
                                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15'
                            }`}
                          >
                            {snd.label}
                          </button>
                        );
                      })}
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={soundVolume}
                      onChange={(e) => setSoundVolume(Number(e.target.value))}
                      className="w-12 accent-[#ff4b70] h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Stream Quality / Heart */}
                  <div className="flex items-center gap-3">
                    <select
                      value={liveStreamQuality}
                      onChange={(e: any) => setLiveStreamQuality(e.target.value)}
                      className="bg-white/10 border border-white/10 text-white text-[9px] rounded px-2 py-1 focus:outline-none cursor-pointer"
                    >
                      <option value="720P" className="bg-neutral-900">高清 720P</option>
                      <option value="1080P" className="bg-neutral-900">超清 1080P</option>
                      <option value="蓝光4K" className="bg-neutral-900">蓝光 4K</option>
                    </select>

                    <button
                      onClick={() => {
                        setLikesCount(prev => prev + 1);
                        playTimerAlertSound();
                        const heartD = {
                          id: Date.now().toString() + Math.random().toString(),
                          text: "❤️ [支持] 谢谢你的点赞支持！大家一起加油！",
                          top: 40 + Math.random() * 20,
                          duration: 8
                        };
                        setDanmakus(prev => [heartD, ...prev]);
                      }}
                      className="w-8 h-8 rounded-full bg-[#ff4b70]/10 border border-[#ff4b70]/30 hover:bg-[#ff4b70]/30 text-[#ff4b70] flex items-center justify-center transition-all active:scale-95 shadow-md animate-bounce"
                      title="点赞自播间"
                    >
                      <Heart size={14} fill="#ff4b70" />
                    </button>
                  </div>

                </div>

              </div>

              {/* Right Column: Simulated Live Interaction Pane */}
              <div className="w-64 flex flex-col gap-4 overflow-hidden z-40">
                
                {/* Scrollable Live Chat Pane */}
                <div className="flex-1 bg-black/45 border border-white/5 rounded-3xl p-4 flex flex-col overflow-hidden shadow-2xl backdrop-blur-md">
                  <div className="pb-2 border-b border-white/10 mb-2 shrink-0 flex justify-between items-center">
                    <span className="text-[10px] text-slate-300 font-extrabold flex items-center gap-1">
                      💬 同频讨论区弹幕
                    </span>
                    <span className="text-[8px] bg-white/10 text-slate-300 px-1.5 py-0.5 rounded font-medium">伴学广播</span>
                  </div>

                  {/* Comment list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none scroll-smooth">
                    {streamMessages.map(msg => (
                      <div key={msg.id} className="text-left text-[10px] bg-white/[0.03] border border-white/5 p-2 rounded-xl hover:bg-white/[0.06] transition-colors">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-[#dfb15b] flex items-center gap-1">
                            <span>{msg.avatar}</span> {msg.sender}
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold">{msg.time}</span>
                        </div>
                        <p className="text-slate-100 font-medium leading-relaxed break-all">
                          {msg.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Chat Input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!userChatInput.trim()) return;
                      const now = new Date();
                      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
                      
                      const myMsg: StreamMessage = {
                        id: Date.now().toString(),
                        sender: '我 🦖',
                        avatar: '🦖',
                        text: userChatInput.trim(),
                        time: timeStr
                      };

                      setStreamMessages(prev => [...prev, myMsg]);
                      
                      // immediately float as danmaku too
                      if (showDanmaku) {
                        const myD = {
                          id: Date.now().toString() + Math.random().toString(),
                          text: `[我 🦖] ${userChatInput.trim()}`,
                          top: 10 + Math.random() * 40,
                          duration: 12
                        };
                        setDanmakus(prev => [myD, ...prev]);
                      }

                      setUserChatInput('');
                      playTimerAlertSound();
                    }}
                    className="mt-3 border-t border-white/10 pt-3 flex gap-1.5 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder="发送心流寄语给学友们~"
                      value={userChatInput}
                      onChange={(e) => setUserChatInput(e.target.value)}
                      className="flex-1 bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] text-white focus:outline-none focus:border-[#ff4b70] placeholder-slate-400"
                    />
                    <button
                      type="submit"
                      className="bg-[#ff4b70] text-white rounded-xl px-2.5 flex items-center justify-center hover:bg-rose-600 transition-colors active:scale-95 shadow-md"
                    >
                      <Send size={11} />
                    </button>
                  </form>
                </div>

                {/* Seat desk customizer widget inside immersive view */}
                <div className="bg-black/45 border border-white/5 rounded-3xl p-4 shrink-0 shadow-xl backdrop-blur-md space-y-2 text-left">
                  <span className="text-[9px] text-amber-300 font-extrabold block">🌱 精选书桌小摆件</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {DESK_ACCESSORIES.map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedDeskAccessory(acc.id as any);
                          playTimerAlertSound();
                        }}
                        className={`py-2 rounded-lg flex flex-col items-center justify-center text-[10px] border transition-all ${
                          selectedDeskAccessory === acc.id 
                            ? 'bg-white text-black border-white shadow-md scale-105 font-bold' 
                            : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                        }`}
                        title={acc.label}
                      >
                        <span>{acc.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Immersive quote footer */}
            <div className="text-center pt-3 border-t border-white/10 bg-black/40 backdrop-blur-sm rounded-2xl py-2 mt-4 text-slate-200 relative z-50 text-[10px] font-medium shadow-md flex items-center justify-center gap-2">
              <Sparkles size={11} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="animate-pulse">“{STIMULATING_QUOTES[quoteIndex].text}”</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Completed Ticket Modal */}
      <AnimatePresence>
        {sessionCompletedTicket && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#FCFBF9] rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden border border-[#ebdcd0]/40 text-center space-y-4"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#8C9A86]" />
              
              <div className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center mx-auto mb-2 text-3xl shadow-sm">
                🍅
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">专注旅程达成</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">滴答自修室授予你的数字心流小票</p>
              </div>

              <div className="bg-white border border-[#ebdcd0]/40 rounded-2xl p-5 space-y-3.5 text-left relative shadow-sm">
                {/* Decorative ticket cutout holes */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FCFBF9] rounded-full border-r border-[#ebdcd0]/40" />
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#FCFBF9] rounded-full border-l border-[#ebdcd0]/40" />
                
                <div className="border-b border-dashed border-slate-200 pb-3">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">专注任务</p>
                  <p className="text-xs font-semibold text-slate-700 mt-1">{sessionCompletedTicket.taskTitle}</p>
                </div>
                
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">投入时长</p>
                    <p className="text-base font-black text-[#8C9A86] mt-0.5">{sessionCompletedTicket.minutes} 分钟</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">印刻时间</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">{sessionCompletedTicket.date}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSessionCompletedTicket(null)}
                className="w-full py-3 bg-[#8C9A86] text-white rounded-2xl text-xs font-bold shadow-md hover:bg-[#72806D] transition-colors active:scale-95"
              >
                收起小票，继续自修
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
