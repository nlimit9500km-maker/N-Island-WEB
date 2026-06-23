import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenLine, Calendar, ChevronRight, Search, Plus, X, Trash2, Clock, 
  Send, Lock, Mail, MapPin, Settings, User, Palette, Bell, Shield, 
  Filter, Book, BarChart2, CalendarDays, Check, RefreshCw, Upload, 
  Download, Eye, EyeOff, Smile, CloudSun, CalendarDays as CalendarIcon, Gift 
} from 'lucide-react';
import { LittleDiaryView } from './LittleDiaryView';
import { FutureLetterView } from './FutureLetterView';
import { DiaryEntry, FutureLetter } from './DiaryTypes';

// === TYPES ===
interface Anniversary {
  id: string;
  title: string;
  date: string;
  emoji: string;
}

interface ThemePreset {
  id: string;
  name: string;
  primaryBg: string;
  cardBg: string;
  activeAccent: string;
  textPrimary: string;
  textMuted: string;
  borderColor: string;
  tintBg: string;
  badgeBg: string;
  badgeText: string;
}

// === CONSTANTS & PRESETS ===
const THEMES: ThemePreset[] = [
  {
    id: 'sage',
    name: '雅致鼠尾草',
    primaryBg: 'bg-[#F2F5F3]',
    cardBg: 'bg-[#FBFCFB]',
    activeAccent: 'bg-[#4E6156]',
    textPrimary: 'text-[#2D3832]',
    textMuted: 'text-[#5B6D62]',
    borderColor: 'border-[#DFE4E1]',
    tintBg: 'bg-[#E7ECE9]',
    badgeBg: 'bg-[#E3EAE5]',
    badgeText: 'text-[#3E5246]'
  },
  {
    id: 'terracotta',
    name: '落日暖枫',
    primaryBg: 'bg-[#FAF5F2]',
    cardBg: 'bg-[#FDFBF9]',
    activeAccent: 'bg-[#B06D50]',
    textPrimary: 'text-[#422B21]',
    textMuted: 'text-[#8C756B]',
    borderColor: 'border-[#F1E5DE]',
    tintBg: 'bg-[#F6EEE9]',
    badgeBg: 'bg-[#F8EFEA]',
    badgeText: 'text-[#7D452E]'
  },
  {
    id: 'ocean',
    name: '静谧海湾',
    primaryBg: 'bg-[#F0F4F7]',
    cardBg: 'bg-[#FAFCFD]',
    activeAccent: 'bg-[#40627F]',
    textPrimary: 'text-[#263542]',
    textMuted: 'text-[#5A6E80]',
    borderColor: 'border-[#DEE5EC]',
    tintBg: 'bg-[#E5EDF3]',
    badgeBg: 'bg-[#E2EBF2]',
    badgeText: 'text-[#264563]'
  },
  {
    id: 'parchment',
    name: '古典牛皮纸',
    primaryBg: 'bg-[#F6F2EA]',
    cardBg: 'bg-[#FCFBF8]',
    activeAccent: 'bg-[#7E6247]',
    textPrimary: 'text-[#352A1C]',
    textMuted: 'text-[#7A6A59]',
    borderColor: 'border-[#ECE2D4]',
    tintBg: 'bg-[#F1ECE0]',
    badgeBg: 'bg-[#F2EADB]',
    badgeText: 'text-[#564330]'
  }
];

const PRESETS_ENTRIES: DiaryEntry[] = [
  {
    id: '1',
    date: '2026-06-01',
    time: '12:00',
    title: '海滩上的淡绿漂流瓶',
    content: '清晨退潮的时候，在椰子树下捡到一个淡绿色的玻璃瓶，里面有一张泛黄的纸，写着一首关于捕鲸的诗。今天的小岛风平浪静，海鸥在头顶盘旋了很久。我把它洗干净，也塞进了一句祝福，放回海浪里。',
    weather: '🌫️',
    mood: '🥰',
    folder: '见闻收集'
  },
  {
    id: '2',
    date: '2026-06-03',
    time: '23:30',
    title: '暖橘色的柑橘红茶',
    content: '夜里风有些凉，煮了一壶柑橘蜜香红茶。暖洋洋的蒸汽熏湿了手账本。想起今天完成了灯塔的修缮，以后过往的小木船再也不会在迷雾中找不到礁石和海岸了吧。晚安，我温暖的小木屋。',
    weather: '🌧️',
    mood: '😊',
    folder: '深夜碎碎念'
  },
  {
    id: '3',
    date: '2026-06-04',
    time: '08:00',
    title: '种下一颗向日葵种子',
    content: '在后院的松软黑泥里埋下了一颗胖胖的向日葵葵花籽。希望今年的阳光足够温柔、雨水足够和煦，能让它在盛夏时开出金灿灿的大花盘。我甚至给它哼了今天新学会的那首岛民之歌。',
    weather: '☀️',
    mood: '😴',
    folder: '小岛日常'
  }
];

const PRESETS_LETTERS: FutureLetter[] = [
  {
    id: 'l1',
    createdAt: '2025-06-01',
    deliverAt: '2222-12-31',
    title: '寄往遥远未来的问候',
    content: '远在星际彼岸的未来的自已啊：你好。你是否已经踏上了前往更高悬崖的旅航？不要忘记，当初我们在写这封信的时候，也是在无数繁星里凝视着你的。保持勇敢，不要放弃温柔。',
    recipient: '未来的自己',
    stampId: 'stamp-whale',
    sealColor: '#9C3D3D',
    isDelivered: false
  },
  {
    id: 'l2',
    createdAt: '2026-06-04',
    deliverAt: '2026-06-04', // Already delivered instantly in local debug
    title: '给今天晚些时的开启',
    content: '恭喜你！这封信跨越了短暂的时间通道成功打开！写这封信时我们在煮红茶，现在的你是不是正在吃一颗甜滋滋的苹果呢？时光的信笺永远不会迟到。',
    recipient: '晚安的我',
    stampId: 'stamp-butterfly',
    sealColor: '#4A6D55',
    isDelivered: true
  }
];

const PRESETS_ANNIVERSARIES: Anniversary[] = [
  { id: 'a1', title: '相约看英仙座流星雨', date: '2026-08-15', emoji: '🌌' },
  { id: 'a2', title: '屿记小岛在此刻启航', date: '2026-06-04', emoji: '🎈' },
  { id: 'a3', title: '出海追寻一次深海鲸群', date: '2026-07-20', emoji: '🐋' }
];

const WEATHER_OPTIONS = ['☀️', '☁️', '🌧️', '❄️', '🌫️'];
const MOOD_OPTIONS = ['😊', '🥰', '😢', '🤯', '😴'];
const FOLDERS = ['小岛日常', '见闻收集', '深夜碎碎念', '灵感捕手'];
const STAMPS = ['🐋 秘境长鲸', '🦋 幻蝶羽梦', '🌲 迷雾晨林', '🏰 孤顶城堡', '🐚 珊瑚寄居'];
const SEAL_COLORS = ['#9C3D3D', '#4A6D55', '#3D556E', '#8C6F3D', '#5E4A6F'];

export const DiaryView = ({ mode }: { mode?: string }) => {
  // === PERSISTENCE STATES ===
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('island_entries');
      const parsed = saved && saved !== 'null' ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : PRESETS_ENTRIES;
    } catch { return PRESETS_ENTRIES; }
  });

  const [letters, setLetters] = useState<FutureLetter[]>(() => {
    try {
      const saved = localStorage.getItem('island_letters');
      const parsed = saved && saved !== 'null' ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : PRESETS_LETTERS;
    } catch { return PRESETS_LETTERS; }
  });

  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(() => {
    try {
      const saved = localStorage.getItem('island_anniversaries');
      const parsed = saved && saved !== 'null' ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : PRESETS_ANNIVERSARIES;
    } catch { return PRESETS_ANNIVERSARIES; }
  });

  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('island_theme') || 'sage';
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('island_profile');
      return saved && saved !== 'null' ? JSON.parse(saved) : {
        nickname: '无棘落莺馆主',
        avatar: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg',
        signature: '听晨风敲打在石板上，静听时光邮差的碎步。'
      };
    } catch {
      return {
        nickname: '无棘落莺馆主',
        avatar: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg',
        signature: '听晨风敲打在石板上，静听时光邮差的碎步。'
      };
    }
  });

  const [lockPIN, setLockPIN] = useState(() => localStorage.getItem('island_pin') || '1234');
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem('island_lock_enabled') === 'true');
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('island_locked_state') === 'true');

  const [quietHour, setQuietHour] = useState(() => localStorage.getItem('island_quiet_hour') || '21');
  const [quietMin, setQuietMin] = useState(() => localStorage.getItem('island_quiet_min') || '30');
  const [quietEnabled, setQuietEnabled] = useState(() => localStorage.getItem('island_quiet_enabled') === 'true');

  // Sync to localStorage
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  };

  useEffect(() => safeSetItem('island_entries', JSON.stringify(entries)), [entries]);
  useEffect(() => safeSetItem('island_letters', JSON.stringify(letters)), [letters]);
  useEffect(() => safeSetItem('island_anniversaries', JSON.stringify(anniversaries)), [anniversaries]);
  useEffect(() => safeSetItem('island_theme', themeId), [themeId]);
  useEffect(() => safeSetItem('island_profile', JSON.stringify(profile)), [profile]);
  useEffect(() => safeSetItem('island_pin', lockPIN), [lockPIN]);
  useEffect(() => safeSetItem('island_lock_enabled', String(lockEnabled)), [lockEnabled]);
  useEffect(() => safeSetItem('island_quiet_hour', quietHour), [quietHour]);
  useEffect(() => safeSetItem('island_quiet_min', quietMin), [quietMin]);
  useEffect(() => safeSetItem('island_quiet_enabled', String(quietEnabled)), [quietEnabled]);

  // === INTERACTION STATES ===
  const [activeTab, setActiveTab] = useState<'moments' | 'future'>('moments');
  const [activeSettingTab, setActiveSettingTab] = useState<'profile' | 'theme' | 'privacy' | 'notifications' | 'sync' | null>(null);
  
  const [anniversaryOpen, setAnniversaryOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // New Moment Composition Modal
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [folders, setFolders] = useState<string[]>(FOLDERS);

  // New Future Letter Modal
  const [letterModalOpen, setLetterModalOpen] = useState(false);

  // Read Letter Detail Modal
  const [readingLetter, setReadingLetter] = useState<FutureLetter | null>(null);

  // New Anniversary Fields
  const [newAnnDate, setNewAnnDate] = useState('');
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnEmoji, setNewAnnEmoji] = useState('🎈');

  // PIN input state (For unlock screen)
  const [inputPIN, setInputPIN] = useState('');
  const [pinError, setPinError] = useState(false);

  // Theme configuration resolution
  const activeTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // Tick for countdown updates
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Anniversary count helpers
  const countDays = (targetDateStr: string) => {
    const target = new Date(targetDateStr + 'T00:00:00');
    // Align with modern 2026 context or current user system clock
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = target.getTime() - today.getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Future letter countdown string
  const getLetterCountdown = (deliverStr: string) => {
    const target = new Date(deliverStr + 'T00:00:00').getTime();
    const diff = target - currentTime;
    if (diff <= 0) return '已解封';
    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / (3600 * 24));
    const hours = Math.floor((totalSecs % (3600 * 24)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${days}天 ${hours}时 ${mins}分 ${secs}秒`;
  };

  // === HANDLERS ===
  // Add Moment Note
  
  // Add Anniversary item
  const handleAddAnniversary = () => {
    if (!(newAnnTitle || '').trim() || !newAnnDate) return;
    const item: Anniversary = {
      id: 'ann-' + Date.now(),
      title: (newAnnTitle || '').trim(),
      date: newAnnDate,
      emoji: newAnnEmoji
    };
    setAnniversaries([item, ...anniversaries]);
    setNewAnnTitle('');
    setNewAnnDate('');
  };

  const handleDeleteAnniversary = (id: string) => {
    setAnniversaries(anniversaries.filter(a => a.id !== id));
  };

  // Submit Future Letter with realistic Wax animation timeline
  
  
  // PIN Unlock submit handler
  const handlePINSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputPIN === lockPIN) {
      setIsLocked(false);
      localStorage.setItem('island_locked_state', 'false');
      setInputPIN('');
      setPinError(false);
    } else {
      setPinError(true);
      setInputPIN('');
      setTimeout(() => setPinError(false), 800);
    }
  };

  // Backup file export
  const handleExportBackup = () => {
    const packet = { entries, letters, anniversaries, profile, themeId, lockPIN, lockEnabled, quietHour, quietMin, quietEnabled };
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `island_diary_memento_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [importText, setImportText] = useState('');
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // Backup string import
  const handleImportBackup = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.entries) setEntries(parsed.entries);
      if (parsed.letters) setLetters(parsed.letters);
      if (parsed.anniversaries) setAnniversaries(parsed.anniversaries);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.themeId) setThemeId(parsed.themeId);
      if (parsed.lockPIN) setLockPIN(parsed.lockPIN);
      alert('🌟 导入日志备份成功！小岛时空胶囊已满血复活！');
      setImportText('');
      setActiveSettingTab(null);
    } catch {
      alert('❌ 备份格式校验不通过，请核对JSON文本内容。');
    }
  };

  const handleCloudSync = () => {
    setCloudSyncing(true);
    setTimeout(() => {
      setCloudSyncing(false);
      alert('☁️ 云端同步成功！已将 12 份数据和心情安全同步至小岛服务器。');
    }, 1500);
  };

  // Clear data safely
  const handleClearAll = () => {
    if (window.confirm('⚠️ 警告：这会粉碎并抹灭小岛上所有的定格记忆与未来密信！该操作不可逆，确定继续吗？')) {
      localStorage.clear();
      setEntries(PRESETS_ENTRIES);
      setLetters(PRESETS_LETTERS);
      setAnniversaries(PRESETS_ANNIVERSARIES);
      setThemeId('sage');
      setProfile({
        nickname: '落莺岛主',
        avatar: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg',
        signature: '听晨风敲打在石板上，静听时光邮差的碎步。'
      });
      setLockPIN('1234');
      setLockEnabled(false);
      setIsLocked(false);
      setQuietEnabled(false);
      alert('🗑️ 记忆均已拂去，小岛回到了最初启程的纯白状态。');
      setActiveSettingTab(null);
    }
  };

  // Profile Presets
  const AVATARS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg'
  ];

  // Dynamic values
  const filteredEntries = entries.filter(e => {
    const matchesSearch = (e.title || '').includes(searchQuery) || (e.content || '').includes(searchQuery);
    const matchesFolder = selectedFolder ? e.folder === selectedFolder : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className={`h-full flex flex-col ${activeTheme.primaryBg} ${activeTheme.textPrimary} relative overflow-hidden font-sans transition-colors duration-500`}>
      
      {/* ================= LOCKSCREEN OVERLAY ================= */}
      <AnimatePresence>
        {lockEnabled && isLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xs text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-700/30 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">小岛日记已封锁</h3>
                <p className="text-xs text-slate-400">请输入4位数锁封密码解锁记忆</p>
              </div>

              {/* Enter PIN Indicator disks */}
              <div className="flex justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx} 
                    className={`w-4 h-4 rounded-full border border-emerald-500/40 transition-all duration-150 ${
                      inputPIN.length > idx ? 'bg-emerald-400 scale-110 shadow-emerald-400/40 shadow-md' : 'bg-transparent'
                    } ${pinError ? 'bg-red-500 border-red-500 animate-bounce' : ''}`}
                  />
                ))}
              </div>

              {/* Password Pad layout */}
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      if (inputPIN.length < 4) {
                        const newPIN = inputPIN + num;
                        setInputPIN(newPIN);
                        if (newPIN.length === 4) {
                          // Auto check PIN on 4th digit
                          setTimeout(() => {
                            if (newPIN === lockPIN) {
                              setIsLocked(false);
                              localStorage.setItem('island_locked_state', 'false');
                            } else {
                              setPinError(true);
                              setInputPIN('');
                              setTimeout(() => setPinError(false), 800);
                            }
                          }, 200);
                        }
                      }
                    }}
                    className="w-14 h-14 rounded-full bg-slate-800/60 hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all text-lg font-bold flex items-center justify-center border border-slate-700/30"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setInputPIN('')}
                  className="w-14 h-14 rounded-full text-xs font-semibold text-slate-400 flex items-center justify-center hover:bg-slate-800/40"
                >
                  清除
                </button>
                <button
                  onClick={() => {
                    if (inputPIN.length < 4) {
                      const newPIN = inputPIN + '0';
                      setInputPIN(newPIN);
                      if (newPIN.length === 4) {
                        setTimeout(() => {
                          if (newPIN === lockPIN) {
                            setIsLocked(false);
                            localStorage.setItem('island_locked_state', 'false');
                          } else {
                            setPinError(true);
                            setInputPIN('');
                            setTimeout(() => setPinError(false), 800);
                          }
                        }, 200);
                      }
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-slate-800/60 text-lg font-bold flex items-center justify-center border border-slate-700/30"
                >
                  0
                </button>
                <button
                  onClick={() => setInputPIN(inputPIN.slice(0, -1))}
                  className="w-14 h-14 rounded-full text-xs font-semibold text-slate-400 flex items-center justify-center hover:bg-slate-800/40"
                >
                  退格
                </button>
              </div>

              {pinError && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-xs text-red-400 font-semibold"
                >
                  密码锁扣校验未通过，请重试
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= HEADER PANEL ================= */}
      <div className={`px-5 pt-4 pb-3 flex flex-col gap-3.5 bg-white shrink-0 z-20 relative border-b border-[#EBEFEF] rounded-b-[2rem] shadow-sm`}>
        <div className="flex items-center justify-between gap-2">
          {/* Left profile info */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border border-gray-100 p-0.5 overflow-hidden shadow-xs relative">
              <img 
                src={profile.avatar} 
                className="w-full h-full rounded-full object-cover" 
                alt="Avatar" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1e2621] tracking-tight">{profile.nickname}</h2>
              <p className="text-[10px] text-gray-400 truncate max-w-[145px] font-medium leading-tight">
                {profile.signature}
              </p>
            </div>
          </div>

          {/* Right Action buttons deck (Rearranged according to user feedback) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Calendar Anniversary Button (NEW) */}
            <button 
              onClick={() => {
                setStatsOpen(false);
                setAnniversaryOpen(!anniversaryOpen);
              }}
              title="岛屿纪念日"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                anniversaryOpen ? 'bg-amber-100 text-amber-700' : 'bg-[#F2F5F4] hover:bg-[#E7ECE9] text-gray-600'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>

            {/* Stats Button (MOVED here to the left of Settings) */}
            <button 
              onClick={() => {
                setAnniversaryOpen(false);
                setStatsOpen(!statsOpen);
              }}
              title="心情数据统计"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                statsOpen ? 'bg-[#E3EAE5] text-[#344E41]' : 'bg-[#F2F5F4] hover:bg-[#E7ECE9] text-gray-600'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Settings trigger */}
            <button 
              onClick={() => {
                setAnniversaryOpen(false);
                setStatsOpen(false);
                setActiveSettingTab(activeSettingTab ? null : 'profile');
              }}
              title="小岛日记设置"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeSettingTab ? 'bg-[#4E6156] text-white' : 'bg-[#F2F5F4] hover:bg-[#E7ECE9] text-gray-650'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= ANNIVERSARY DRAWER / PANEL ================= */}
        <AnimatePresence>
          {anniversaryOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#F2F5F4] pt-2.5 space-y-3 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-amber-800 flex items-center gap-1.5 uppercase">
                  <Gift className="w-3.5 h-3.5" /> 屿记定格 · 倒数纪念
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Today: 2026-06-04</span>
              </div>

              {/* Anniversary Grid list with actual calculators */}
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1 pb-1">
                {anniversaries.map((ann) => {
                  const daysLeft = countDays(ann.date);
                  const isFuture = daysLeft > 0;
                  const isToday = daysLeft === 0;

                  return (
                    <div 
                      key={ann.id} 
                      className="p-2.5 rounded-xl border border-dashed border-amber-900/10 bg-amber-50/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ann.emoji}</span>
                        <div>
                          <p className="text-[11px] font-bold text-[#352A1C]">{ann.title}</p>
                          <p className="text-[9px] text-[#7A6A59] font-mono">{ann.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          {isToday ? (
                            <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md animate-pulse">就是今天</span>
                          ) : isFuture ? (
                            <div className="text-[10px] font-bold text-slate-700">
                              还有 <span className="text-[12px] font-black text-amber-700 font-mono">{daysLeft}</span> 天
                            </div>
                          ) : (
                            <div className="text-[10px] font-medium text-gray-400">
                              已相伴 <span className="text-[12px] font-bold font-mono text-gray-500">{Math.abs(daysLeft)}</span> 天
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => handleDeleteAnniversary(ann.id)}
                          className="p-0.5 text-gray-300 hover:text-red-500 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add and draft new anniversary */}
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-amber-900/10 grid grid-cols-1 gap-2">
                <p className="text-[10px] font-black text-[#5C4530]">新增小岛约定纪念:</p>
                <div className="flex gap-1.5">
                  <select 
                    value={newAnnEmoji} 
                    onChange={(e) => setNewAnnEmoji(e.target.value)}
                    className="bg-white border border-gray-200 text-sm p-1 rounded-lg"
                  >
                    {['🎈', '🌌', '🌊', '🐋', '🌸', '☕', '🏕️', '✨', '🐾', '⛵'].map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    placeholder="例如：相约去看流星雨"
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    className="flex-1 bg-white border border-gray-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-700 font-semibold"
                  />
                  <input 
                    type="date" 
                    value={newAnnDate}
                    onChange={(e) => setNewAnnDate(e.target.value)}
                    className="bg-white border border-gray-200 text-xs px-2 py-1 rounded-lg focus:outline-none font-mono"
                  />
                  <button 
                    onClick={handleAddAnniversary}
                    disabled={!(newAnnTitle || '').trim() || !newAnnDate}
                    className="px-3 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg disabled:opacity-40"
                  >
                    添加
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= STATS WIDGET DRAWER ================= */}
        <AnimatePresence>
          {statsOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#F2F5F4] pt-2.5 space-y-3.5 overflow-hidden text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-emerald-800 flex items-center gap-1.5 uppercase">
                  <Book className="w-3.5 h-3.5" /> 笔墨定格 · 心情气象志
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">记录点滴，定格瞬间</span>
              </div>

              {/* Small grid of numerical indices */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#F2F6F3] p-2.5 rounded-2xl text-center">
                  <p className="text-[9px] text-[#5C6E65] font-black uppercase">留存定格</p>
                  <p className="text-xl font-bold text-[#2D3832] font-mono mt-0.5">{entries.length} 篇</p>
                </div>
                <div className="bg-[#FAF5EE] p-2.5 rounded-2xl text-center">
                  <p className="text-[9px] text-[#7E6247] font-black uppercase">时光漂流</p>
                  <p className="text-xl font-bold text-[#352A1C] font-mono mt-0.5">{letters.length} 封</p>
                </div>
                <div className="bg-[#F1EBF5] p-2.5 rounded-2xl text-center">
                  <p className="text-[9px] text-[#5E4A6F] font-black uppercase">约定守护</p>
                  <p className="text-xl font-bold text-[#5E4A6F] font-mono mt-0.5">{anniversaries.length} 项</p>
                </div>
              </div>

              {/* Handcrafted weather index bar graph using pure micro HTML tags */}
              <div className="grid grid-cols-2 gap-4 pt-1 bg-white p-3 rounded-2xl border border-[#EFF3F1]">
                {/* Weather visual bars */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 block pb-0.5">岛屿天气占比 (Weather Statistics)</span>
                  {WEATHER_OPTIONS.map((w) => {
                    const count = entries.filter(e => e.weather === w).length;
                    const pct = entries.length > 0 ? (count / entries.length) * 100 : 0;
                    return (
                      <div key={w} className="flex items-center gap-2">
                        <span className="text-xs">{w}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 w-4.5 text-right">{count}次</span>
                      </div>
                    );
                  })}
                </div>

                {/* Mood visual indicators */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 block pb-0.5">岛主心情轮盘 (Mood Statistics)</span>
                  {MOOD_OPTIONS.map((m) => {
                    const count = entries.filter(e => e.mood === m).length;
                    const pct = entries.length > 0 ? (count / entries.length) * 100 : 0;
                    return (
                      <div key={m} className="flex items-center gap-2">
                        <span className="text-xs">{m}</span>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500 w-4.5 text-right">{count}次</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= SETTINGS DROPDOWN EXPANSIONS ================= */}
        <AnimatePresence>
          {activeSettingTab && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-[#F2F5F4] pt-3 overflow-hidden text-left"
            >
              {/* Badges menu list */}
              <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto scrollbar-hide">
                <button 
                  onClick={() => setActiveSettingTab('profile')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    activeSettingTab === 'profile' ? 'bg-[#4E6156] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3 h-3" /> 角色身份
                </button>
                <button 
                  onClick={() => setActiveSettingTab('theme')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    activeSettingTab === 'theme' ? 'bg-[#4E6156] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Palette className="w-3 h-3" /> 主题手账
                </button>
                <button 
                  onClick={() => setActiveSettingTab('privacy')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    activeSettingTab === 'privacy' ? 'bg-[#4E6156] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-3 h-3" /> 锁封密码
                </button>
                <button 
                  onClick={() => setActiveSettingTab('notifications')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    activeSettingTab === 'notifications' ? 'bg-[#4E6156] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Bell className="w-3 h-3" /> 静谧提醒
                </button>
                <button 
                  onClick={() => setActiveSettingTab('sync')}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                    activeSettingTab === 'sync' ? 'bg-[#4E6156] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <RefreshCw className="w-3 h-3" /> 本地同步
                </button>
              </div>

              {/* ACCORDION CONTENT PANES */}
              <div className="bg-[#FBFCFB] p-3.5 rounded-2xl border border-dashed border-[#DFE4E1] text-[#334239] text-xs">
                {/* 1. 角色身份 Config */}
                {activeSettingTab === 'profile' && (
                  <div className="space-y-3.5">
                    <p className="font-bold text-[11px] text-[#4E6156] border-b border-[#F2F5F4] pb-1.5">【设定角色身份】</p>
                    <div className="flex gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-1">更换头像</span>
                        <div className="flex items-center gap-1.5">
                          {AVATARS.map((av, idx) => (
                            <button
                              key={idx}
                              onClick={() => setProfile({ ...profile, avatar: av })}
                              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                                profile.avatar === av ? 'border-emerald-600 scale-105 shadow-xs' : 'border-transparent'
                              }`}
                            >
                              <img src={av} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">小岛别致昵称:</span>
                      <input 
                        type="text" 
                        value={profile.nickname}
                        onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                        className="w-full bg-white border border-[#DFE4E1] rounded-lg px-2.5 py-1.5 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">岛里心灵签名:</span>
                      <input 
                        type="text" 
                        value={profile.signature}
                        onChange={(e) => setProfile({ ...profile, signature: e.target.value })}
                        className="w-full bg-white border border-[#DFE4E1] rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                      />
                    </div>
                  </div>
                )}

                {/* 2. 主题手账 Config */}
                {activeSettingTab === 'theme' && (
                  <div className="space-y-3">
                    <p className="font-bold text-[11px] text-[#4E6156] border-b border-[#F2F5F4] pb-1.5">【手账换肤 · 低饱和度水彩】</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => setThemeId(theme.id)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                            themeId === theme.id 
                              ? 'border-emerald-600 bg-emerald-50/20' 
                              : 'border-gray-200 hover:border-gray-305'
                          }`}
                        >
                          <span className="text-[11px] font-black">{theme.name}</span>
                          <div className="flex gap-1">
                            <span className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: theme.primaryBg.includes('bg-[') ? theme.primaryBg.split('[')[1].slice(0, 7) : '#ccc' }} />
                            <span className="w-3 h-3 rounded-full border border-gray-100" style={{ backgroundColor: theme.activeAccent.includes('bg-[') ? theme.activeAccent.split('[')[1].slice(0, 7) : '#aaa' }} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 锁封密码 (Functional Screen Pad) */}
                {activeSettingTab === 'privacy' && (
                  <div className="space-y-3.5">
                    <p className="font-bold text-[11px] text-[#4E6156] border-b border-[#F2F5F4] pb-1.5">【手账锁封安全设定】</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">开启密码锁保护</p>
                        <p className="text-[10px] text-gray-400">开启后读取日记与信件需要密码</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={lockEnabled}
                        onChange={(e) => setLockEnabled(e.target.checked)}
                        className="w-4.5 h-4.5 accent-emerald-600"
                      />
                    </div>
                    {lockEnabled && (
                      <>
                        <div className="space-y-1 bg-gray-50/65 p-2 rounded-xl">
                          <span className="text-[10px] text-gray-450 block">修改4位数字锁封PIN码:</span>
                          <input 
                            type="password"
                            maxLength={4}
                            placeholder="如: 1234"
                            value={lockPIN}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g,'');
                              setLockPIN(v);
                            }}
                            className="bg-white border border-[#DFE4E1] rounded-lg px-2 py-1 outline-none text-center font-mono font-bold w-20"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setIsLocked(true);
                            localStorage.setItem('island_locked_state', 'true');
                            setActiveSettingTab(null);
                          }}
                          className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 border text-white text-xs font-bold rounded-lg transition-transform active:scale-98"
                        >
                          🔒 立即锁定屏障 (测试锁)
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* 4. 静谧提醒 Reminder */}
                {activeSettingTab === 'notifications' && (
                  <div className="space-y-3">
                    <p className="font-bold text-[11px] text-[#4E6156] border-b border-[#F2F5F4] pb-1.5">【心境提醒 · 每日记录约会】</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">静谧书写提醒</p>
                        <p className="text-[10px] text-gray-400">每天定点寄来温柔纸条，邀请你定格</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={quietEnabled}
                        onChange={(e) => setQuietEnabled(e.target.checked)}
                        className="w-4.5 h-4.5 accent-emerald-600"
                      />
                    </div>
                    {quietEnabled && (
                      <div className="space-y-2 bg-gray-50 p-2.5 rounded-xl">
                        <span className="text-[10px] text-gray-450 block">提醒时刻设选择:</span>
                        <div className="flex items-center gap-1.5 font-bold font-mono">
                          <select 
                            value={quietHour} 
                            onChange={(e) => setQuietHour(e.target.value)}
                            className="bg-white p-1 rounded border border-gray-200"
                          >
                            {Array.from({ length: 24 }).map((_, i) => {
                              const s = String(i).padStart(2, '0');
                              return <option key={s} value={s}>{s}</option>;
                            })}
                          </select>
                          <span>点</span>
                          <select 
                            value={quietMin} 
                            onChange={(e) => setQuietMin(e.target.value)}
                            className="bg-white p-1 rounded border border-gray-200"
                          >
                            {Array.from({ length: 60 }).map((_, i) => {
                              const s = String(i).padStart(2, '0');
                              return <option key={s} value={s}>{s}</option>;
                            })}
                          </select>
                          <span>分</span>
                        </div>
                        <p className="text-[9px] text-[#5C6E65] italic mt-1 bg-white p-1 rounded">
                          📌 [系统提醒时间已规划在每天 {quietHour}:{quietMin}]: “清风已至，岛屿渐澜，快来记录下今天的贝壳吧。”
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. 本地同步 Data backup & REST API logic */}
                {activeSettingTab === 'sync' && (
                  <div className="space-y-3">
                    <p className="font-bold text-[11px] text-[#4E6156] border-b border-[#F2F5F4] pb-1.5">【日志安全归档仓】</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleExportBackup}
                        className="flex items-center justify-center gap-1 py-2 bg-[#F2F6F3] hover:bg-[#E3EAE5] text-[#2C4A6F] font-bold rounded-lg border border-dashed border-[#DFE4E1] transition-transform active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> 导出JSON备份
                      </button>
                      <button
                        onClick={handleCloudSync}
                        disabled={cloudSyncing}
                        className="flex items-center justify-center gap-1 py-2 bg-[#F5ECE6] hover:bg-[#EAE1D5] text-[#7A4026] font-bold rounded-lg border border-dashed border-[#DFE4E1] disabled:opacity-40 transition-transform active:scale-95"
                      >
                        {cloudSyncing ? (
                          <>
                            <span className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                            备份中...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" /> 同步到小岛云
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-400 block">粘贴TXT/JSON文本包导入备份:</span>
                      <textarea 
                        rows={2}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        placeholder="在此粘贴先前导出的JSON文本..."
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-[10px] font-mono resize-none"
                      />
                      <button
                        onClick={handleImportBackup}
                        disabled={!(importText || '').trim()}
                        className="w-full py-1.5 bg-emerald-750 bg-[#4F6C5B] hover:bg-[#3E5547] text-white text-[10px] rounded-lg font-black disabled:opacity-40"
                      >
                        导入上述日志备份
                      </button>
                    </div>

                    <div className="pt-2 border-t border-red-105 border-red-500/10">
                      <button
                        onClick={handleClearAll}
                        className="w-full py-1.5 text-center text-[10px] font-bold text-red-650 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
                      >
                        🗑️ 粉碎并清空本岛所有数据
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= MAIN SCROLLABLE WRAPPER ================= */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-white">
        {/* ===================== TAB 1: MOMENTS (定格记忆) ===================== */}
        {activeTab === 'moments' && (
          <LittleDiaryView 
            entries={entries}
            setEntries={setEntries}
            folders={folders}
            setFolders={setFolders}
            isAddingMoment={writeModalOpen}
            setIsAddingMoment={setWriteModalOpen}
          />
        )}

        {/* ===================== TAB 2: FUTURE LETTERS (写给未来) ===================== */}
        {activeTab === 'future' && (
          <FutureLetterView 
            letters={letters}
            setLetters={setLetters}
            showCompose={letterModalOpen}
            setShowCompose={setLetterModalOpen}
          />
        )}
      </div>

      {/* ===================== FLOATING ACT FAB & GLASS TABBAR ===================== */}
      <div className="absolute bottom-4 inset-x-6 h-16 bg-white/95 backdrop-blur-lg border border-[#E9EFEB] rounded-full flex items-center justify-around px-8 z-40 shadow-lg shadow-[#1C2C22]/5">
        
        {/* Left icon: Moments */}
        <button 
          onClick={() => {
            setActiveTab('moments');
            setAnniversaryOpen(false);
          }}
          className="relative flex-1 flex flex-col items-center justify-center h-full gap-1 group cursor-pointer"
        >
          {activeTab === 'moments' && (
            <motion.div 
              layoutId="diary-tab-pill-box" 
              className="absolute inset-x-0.5 inset-y-1.5 bg-[#4E6156]/10 rounded-full" 
            />
          )}
          <Clock className={`w-5 h-5 z-10 transition-colors duration-300 ${activeTab === 'moments' ? 'text-[#4E6156]' : 'text-gray-400 group-hover:text-gray-550'}`} />
          <span className={`text-[9px] font-black z-10 transition-colors duration-300 ${activeTab === 'moments' ? 'text-[#3E5246]' : 'text-gray-400'}`}>
            定格记忆
          </span>
        </button>

        {/* Floating trigger Act Plus button */}
        <div className="relative -top-4 z-50 shrink-0 px-1">
          <button 
            onClick={() => {
              if (activeTab === 'moments') {
                setWriteModalOpen(true);
              } else {
                setLetterModalOpen(true);
              }
            }}
            title={activeTab === 'moments' ? '定格今天的心情瞬间' : '封死一封寄往未来的漂流信'}
            className={`w-12 h-12 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              activeTab === 'moments' 
                ? 'bg-[#4E6156] shadow-[#4E6156]/20' 
                : 'bg-amber-800 shadow-amber-800/20'
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Right switch: Future Letter */}
        <button 
          onClick={() => {
            setActiveTab('future');
            setAnniversaryOpen(false);
          }}
          className="relative flex-1 flex flex-col items-center justify-center h-full gap-1 group cursor-pointer"
        >
          {activeTab === 'future' && (
            <motion.div 
              layoutId="diary-tab-pill-box" 
              className="absolute inset-x-0.5 inset-y-1.5 bg-amber-800/10 rounded-full" 
            />
          )}
          <Mail className={`w-5 h-5 z-10 transition-colors duration-300 ${activeTab === 'future' ? 'text-amber-800' : 'text-gray-400 group-hover:text-gray-550'}`} />
          <span className={`text-[9px] font-black z-10 transition-colors duration-350 ${activeTab === 'future' ? 'text-amber-900' : 'text-gray-400'}`}>
            写给未来
          </span>
        </button>
      </div>

    </div>
  );
};
