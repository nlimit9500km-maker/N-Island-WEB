import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, X, MapPin, Calendar, Clock, Smile, Cloud, Camera, Mail, Send, Lock, Unlock, MailOpen, Navigation, ArrowRight, Sparkles, ChevronRight, Search, Settings, ChevronLeft, Trash2, Download, LogOut } from 'lucide-react';

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
}

interface FutureLetter {
  id: string;
  writeDate: string;
  deliverDate: string;
  title: string;
  content: string;
  isOpened: boolean;
  stamp?: string;
}

interface SpecialDay {
  id: string;
  title: string;
  date: string;
  category: 'anniversary' | 'birthday' | 'other';
  isCountUp: boolean;
}

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
      stamp: '🛸'
    }];
  });

  const [mainTab, setMainTab] = useState<'memory' | 'letter'>('memory');
  const [isWritingLetter, setIsWritingLetter] = useState(false);
  
  // Letter Form
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterDeliverDate, setNewLetterDeliverDate] = useState('');
  const [newLetterStamp, setNewLetterStamp] = useState('💌');
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);

  // User Profile State for Island Mode
  const profileStorageKey = 'island_user_profile';
  const initProfile = () => {
    const saved = safeGetItem(profileStorageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      signature: "记录点滴，不负韶华",
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
  const [profileMenuStep, setProfileMenuStep] = useState<'main' | 'avatar_options' | 'calendar' | 'settings' | 'theme_picker' | 'special_days' | 'add_special_day'>('main');
  
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
        setShowProfileMenu(false);
        setProfileMenuStep('main');
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
    setShowProfileMenu(false);
    setShowUrlInput(false);
    setProfileMenuStep('main');
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
      const url = URL.createObjectURL(e.target.files[0]);
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
      location: newLocation
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
  };

  const handleSaveLetter = () => {
    if (!newLetterContent.trim() || !newLetterDeliverDate) return;

    const now = new Date();
    const newLetter: FutureLetter = {
      id: crypto.randomUUID(),
      writeDate: now.toISOString().split('T')[0],
      deliverDate: newLetterDeliverDate,
      title: newLetterTitle.trim() || '无题信件',
      content: newLetterContent,
      isOpened: false,
      stamp: newLetterStamp
    };

    setLetters([newLetter, ...letters]);
    setIsWritingLetter(false);
    // Reset form
    setNewLetterTitle('');
    setNewLetterContent('');
    setNewLetterDeliverDate('');
    setNewLetterStamp('💌');
  };

  return (
    <div className={`h-full flex flex-col ${isIsland ? 'bg-[#f4f7f6] overflow-hidden' : bgClass} ${fontClass} relative`}>
      {isIsland && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Base Ocean/Sky Gradient - Responsive to Theme */}
          <div className={`absolute inset-0 transition-colors duration-1000 ${
            customBgUrl ? '' :
            theme === 'day' ? 'bg-gradient-to-b from-[#b5e0f7] via-[#a3d9f3] to-[#88c4f2]' :
            theme === 'night' ? 'bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]' :
            theme === 'sunset' ? 'bg-gradient-to-b from-[#ff9a9e] via-[#fecfef] to-[#ffafbd]' :
            'bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#64748b]'
          }`} style={{ 
            backgroundImage: customBgUrl ? `url(${customBgUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgOpacity
          }} />
          
          {/* Night Mode Stars */}
          {theme === 'night' && (
            <div className="absolute inset-0 z-0">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: Math.random() * 2 + 'px',
                    height: Math.random() * 2 + 'px',
                    top: Math.random() * 70 + '%',
                    left: Math.random() * 100 + '%',
                    animationDelay: Math.random() * 5 + 's',
                    opacity: Math.random() * 0.5 + 0.3
                  }}
                />
              ))}
            </div>
          )}

          {/* Distant Clouds - Hidden in Misty theme */}
          {theme !== 'misty' && (
            <>
              <motion.div 
                animate={{ x: [0, 100, 0] }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                className="absolute top-[10%] left-[-10%] w-[40%] h-[30%] opacity-40"
              >
                <svg viewBox="0 0 200 100" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 50 A20 20 0 0 1 90 50 A25 25 0 0 1 140 60 A20 20 0 0 1 140 80 L30 80 A15 15 0 0 1 50 50 Z" />
                </svg>
              </motion.div>
              <motion.div 
                animate={{ x: [0, -80, 0] }}
                transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                className="absolute top-[20%] right-[-5%] w-[30%] h-[20%] opacity-20 scale-x-[-1]"
              >
                <svg viewBox="0 0 200 100" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 50 A20 20 0 0 1 90 50 A25 25 0 0 1 140 60 A20 20 0 0 1 140 80 L30 80 A15 15 0 0 1 50 50 Z" />
                </svg>
              </motion.div>
            </>
          )}

          {/* Misty Layer */}
          {theme === 'misty' && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] z-[5]" />
          )}

          {/* Island Base SVG at bottom */}
          <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[180%] md:w-[120%] h-[60vh] opacity-30 blur-[4px]">
             <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className={`w-full h-full transition-colors duration-1000 ${
               theme === 'night' ? 'fill-[#1b4332]' : 'fill-[#52b788]'
             }`}>
               <path d="M0 400 L0 250 Q250 150 500 250 T1000 200 L1000 400 Z" />
             </svg>
          </div>
          <div className="absolute bottom-[-5%] left-1/2 -translate-x-1/2 w-[140%] md:w-[100%] h-[50vh] opacity-95">
             <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className={`w-full h-full transition-colors duration-1000 ${
               theme === 'night' ? 'fill-[#2d6a4f]' : 'fill-[#74c69d]'
             }`}>
               <path d="M0 400 L0 200 Q300 80 600 200 T1000 180 L1000 400 Z" />
             </svg>
          </div>
          
          {/* Decorative Trees/Props on the island - No animations */}
          <div className="absolute bottom-[20%] left-[20%] text-6xl md:text-8xl filter drop-shadow-xl saturate-150 transition-all duration-1000">🌴</div>
          <div className="absolute bottom-[28%] right-[15%] text-6xl md:text-7xl filter drop-shadow-xl saturate-150 transition-all duration-1000">🌲</div>
          <div className="absolute bottom-[10%] left-[45%] text-4xl filter drop-shadow-sm">⛺️</div>
          <div className="absolute bottom-[25%] left-[55%] text-3xl filter drop-shadow-sm">🦆</div>
          
          {/* Distant Boat */}
          <motion.div 
            animate={{ x: [-200, 1000] }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[40%] left-[-100px] text-2xl opacity-20"
          >
            ⛵️
          </motion.div>

          {/* Sparkles on water */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2 + i, repeat: Infinity, delay: i }}
              className="absolute text-blue-200/40 text-xs"
              style={{ bottom: `${35 + i * 2}%`, left: `${10 + i * 15}%` }}
            >
              ✨
            </motion.div>
          ))}

          {/* Foreground WavesOverlay */}
          <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-[#48cae4]/40 to-transparent" />
        </div>
      )}

      <div className={`relative z-10 w-full shrink-0 ${isIsland ? 'hidden' : 'border-b border-amber-900/10 p-6 flex flex-col gap-6'}`}>
        {!isIsland && (
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-amber-950 font-serif">
                日记簿
              </h2>
              <p className="text-xs text-amber-800/60 font-serif italic">
                Personal Diary Space
              </p>
            </div>
            <div className="flex items-center gap-4">
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar ${isIsland ? 'pb-32' : ''}`}>
        {isIsland && (
          <div className="max-w-6xl mx-auto mb-10 px-0 md:px-0 flex flex-col md:flex-row justify-between items-start md:items-center w-full relative gap-6">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] border border-white rotate-[-5deg] group-hover:rotate-0 transition-all duration-700">
                  <span className="text-4xl">🏝️</span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ring-4 ring-[#f4f7f6]">
                  {entries.length}
                </div>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[40px] font-black text-gray-900 tracking-tighter leading-none mb-2">
                  屿·记
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex bg-white/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/50 shadow-sm items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">
                      Island Active
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unified Top Interaction Bar */}
            <div className="flex items-center gap-2 relative z-50">
              <div className="flex items-center bg-white/40 backdrop-blur-xl p-1.5 rounded-full border border-white/60 shadow-sm transition-all select-none">
                {/* Stats Section */}
                <div className="hidden md:flex items-center gap-4 px-4 py-1">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Memories</span>
                    <span className="text-sm font-black text-gray-800 leading-none">{entries.length}</span>
                  </div>
                  <div className="w-px h-6 bg-white/40" />
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Letters</span>
                    <span className="text-sm font-black text-gray-800 leading-none">{letters.length}</span>
                  </div>
                </div>
                
                <div className="w-px h-8 bg-white/40 mx-1 hidden md:block" />

                {/* Main Action Buttons & Profile */}
                <div className="flex items-center gap-1.5 px-1">
                  {/* Calendar Toggle */}
                  <button 
                    onClick={() => {
                      setProfileMenuStep('calendar');
                      setShowProfileMenu(true);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${profileMenuStep === 'calendar' && showProfileMenu ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/40 text-gray-700 hover:bg-white/60'}`}
                  >
                    <Calendar className="w-4 h-4" />
                  </button>

                  {/* Settings Toggle */}
                  <button 
                    onClick={() => {
                      setProfileMenuStep('settings');
                      setShowProfileMenu(true);
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${profileMenuStep === 'settings' && showProfileMenu ? 'bg-gray-800 text-white shadow-lg' : 'bg-white/40 text-gray-700 hover:bg-white/60'}`}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  <div className="w-px h-8 bg-white/40 mx-1" />

                  {/* Profile Section */}
                  <div 
                    onClick={() => {
                      if (!showProfileMenu) setProfileMenuStep('main');
                      setShowProfileMenu(!showProfileMenu);
                    }}
                    className="flex items-center gap-2 hover:bg-white/40 p-1 pr-3 rounded-full transition-all cursor-pointer group"
                  >
                    <img 
                      src={profile.avatarUrl} 
                      className="w-10 h-10 border-2 border-white rounded-full object-cover shadow-sm bg-white group-hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer" 
                      alt="Profile" 
                    />
                    <div className="flex flex-col hidden sm:flex text-left">
                      <span className="text-[11px] font-black text-gray-800 leading-none">个人中心</span>
                      <span className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter truncate max-w-[60px]">{profile.signature}</span>
                    </div>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-[60px] right-0 w-[300px] bg-white/95 backdrop-blur-3xl border border-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col z-[100]"
                  >
                    <div className="fixed inset-0 z-[-1]" onClick={() => {
                        setShowProfileMenu(false);
                        setProfileMenuStep('main');
                        setShowUrlInput(false);
                        setShowSigInput(false);
                    }} />
                    
                    {/* Header showing current step */}
                      <div className="bg-gray-50/50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest gap-1 flex items-center">
                          {profileMenuStep === 'main' && 'icity // 个人主页'}
                          {profileMenuStep === 'calendar' && '日历视图 Calendar'}
                          {profileMenuStep === 'special_days' && '倒数日 Days Matter'}
                          {profileMenuStep === 'add_special_day' && '添加纪念日'}
                          {profileMenuStep === 'settings' && '应用设置 Settings'}
                          {profileMenuStep === 'theme_picker' && '背景模式 Theme'}
                          {profileMenuStep === 'avatar_options' && '修改头像'}
                        </span>
                        {profileMenuStep !== 'main' && (
                          <button onClick={(e) => { e.stopPropagation(); setProfileMenuStep('main'); }} className="text-[9px] font-bold text-blue-500 hover:text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">返回</button>
                        )}
                     </div>

                     <div className="p-2 flex flex-col" onClick={e => e.stopPropagation()}>
                        {profileMenuStep === 'main' && !showSigInput && !showUrlInput && (
                          <div className="flex flex-col gap-1">
                             {/* icity style profile header */}
                             <div className="bg-white rounded-[1.5rem] p-4 flex flex-col gap-4 border border-gray-50">
                                <div className="flex justify-between items-start">
                                   <img 
                                     src={profile.avatarUrl} 
                                     className="w-16 h-16 rounded-2xl object-cover shadow-sm bg-gray-50 cursor-pointer hover:opacity-80 transition-opacity" 
                                     referrerPolicy="no-referrer" 
                                     alt="Avatar"
                                     onClick={() => setProfileMenuStep('avatar_options')}
                                   />
                                   <div className="flex gap-2">
                                      <div className="flex flex-col items-center">
                                         <span className="text-sm font-black text-gray-900">{entries.length}</span>
                                         <span className="text-[8px] font-bold text-gray-400 uppercase">Entries</span>
                                      </div>
                                      <div className="w-px h-6 bg-gray-100 my-auto mx-1" />
                                      <div className="flex flex-col items-center">
                                         <span className="text-sm font-black text-gray-900">{specialDays.length}</span>
                                         <span className="text-[8px] font-bold text-gray-400 uppercase">Days</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-xs font-black text-gray-900 uppercase tracking-tight">Personal Island Profile</span>
                                   <span className="text-[10px] text-gray-500 mt-1 cursor-pointer hover:text-blue-500 transition-colors flex items-center gap-1" onClick={() => { setTempProfileInput(profile.signature); setShowSigInput(true); }}>
                                     {profile.signature}
                                     <Sparkles className="w-2.5 h-2.5 opacity-50" />
                                   </span>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 gap-2 mt-2">
                                <button onClick={() => setProfileMenuStep('calendar')} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-2xl transition-all group">
                                   <div className="flex items-center gap-3">
                                      <Calendar className="w-4 h-4" />
                                      <span className="text-[11px] font-bold">日历 - 回忆录</span>
                                   </div>
                                   <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                </button>
                                <button onClick={() => setProfileMenuStep('special_days')} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-700 rounded-2xl transition-all group">
                                   <div className="flex items-center gap-3">
                                      <Clock className="w-4 h-4" />
                                      <span className="text-[11px] font-bold">倒数日 - 纪念</span>
                                   </div>
                                   <div className="flex items-center gap-2">
                                      {specialDays.length > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-pink-100 text-pink-600 rounded-md">New!</span>}
                                      <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                   </div>
                                </button>
                                <button onClick={() => setProfileMenuStep('settings')} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl transition-all group">
                                   <div className="flex items-center gap-3">
                                      <Settings className="w-4 h-4" />
                                      <span className="text-[11px] font-bold">应用设置</span>
                                   </div>
                                   <ChevronRight className="w-3 h-3 opacity-30 group-hover:opacity-100" />
                                </button>
                             </div>
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
                                   <div className="w-full h-10 bg-gradient-to-b from-[#b5e0f7] to-[#88c4f2] rounded-lg flex items-center justify-center text-lg">☀️</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">日间</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('night'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'night' && !customBgUrl ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-100'}`}
                                 >
                                   <div className="w-full h-10 bg-gradient-to-b from-[#1a1a2e] to-[#0f3460] rounded-lg flex items-center justify-center text-lg">🌙</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">深夜</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('sunset'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'sunset' && !customBgUrl ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' : 'bg-white border-gray-100 hover:border-orange-100'}`}
                                 >
                                   <div className="w-full h-10 bg-gradient-to-b from-[#ff9a9e] to-[#ffafbd] rounded-lg flex items-center justify-center text-lg">🌅</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">黄昏</span>
                                 </button>
                                 <button 
                                   onClick={() => { setTheme('misty'); setCustomBgUrl(null); }}
                                   className={`flex flex-col p-3 rounded-2xl border transition-all gap-2 ${theme === 'misty' && !customBgUrl ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-100' : 'bg-white border-gray-100 hover:border-slate-200'}`}
                                 >
                                   <div className="w-full h-10 bg-gradient-to-b from-[#cbd5e1] to-[#64748b] rounded-lg flex items-center justify-center text-lg">🌫️</div>
                                   <span className="text-[10px] font-bold text-gray-700 text-center">迷雾</span>
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
                        {profileMenuStep === 'avatar_options' && !showUrlInput && (
                          <div className="flex flex-col gap-1 mt-1">
                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left bg-white">从本地上传</button>
                            <button onClick={() => { setTempProfileInput(''); setShowUrlInput(true); }} className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-left bg-white">通过链接修改</button>
                          </div>
                        )}

                        {showUrlInput && (
                          <div className="p-3 flex flex-col gap-3">
                            <input type="text" value={tempProfileInput} onChange={e => setTempProfileInput(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            <div className="flex gap-2">
                              <button onClick={() => setShowUrlInput(false)} className="flex-1 py-2 text-[10px] font-bold bg-gray-100 rounded-xl">取消</button>
                              <button onClick={handleProfileUrlSubmit} className="flex-1 py-2 text-[10px] font-bold text-white bg-blue-500 rounded-xl">确定</button>
                            </div>
                          </div>
                        )}

                        {showSigInput && (
                          <div className="p-3 flex flex-col gap-3">
                            <input type="text" value={tempProfileInput} onChange={e => setTempProfileInput(e.target.value)} placeholder="输入新签名..." className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-100" />
                            <div className="flex gap-2">
                              <button onClick={() => setShowSigInput(false)} className="flex-1 py-2 text-[10px] font-bold bg-gray-100 rounded-xl">取消</button>
                              <button onClick={handleSigSubmit} className="flex-1 py-2 text-[10px] font-bold text-white bg-blue-500 rounded-xl">确定</button>
                            </div>
                          </div>
                        )}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
          </div>
        )}
        {!isIsland ? (
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
        ) : mainTab === 'memory' ? (
          <div className="max-w-2xl mx-auto flex flex-col gap-5 h-full pb-20 mt-4 relative z-20 w-full px-4">
            <div className="flex justify-between items-end mb-4 px-2">
              <div className="flex flex-col">
                <h3 className="text-[28px] font-black text-gray-900 tracking-tighter leading-none">定格记忆</h3>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Tiny Diary Records</span>
              </div>
              <div className="text-xs font-bold text-gray-500 bg-white/50 px-3 py-1 rounded-full border border-white/60 shadow-sm">
                共 {entries.length} 篇
              </div>
            </div>

            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-gray-400 gap-6 w-full bg-white/40 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] mt-10">
                <div className="w-20 h-20 bg-white/80 border border-white shadow-sm rounded-full flex items-center justify-center text-4xl">📝</div>
                <div className="flex flex-col items-center">
                  <p className="text-lg font-black text-gray-800 tracking-tight">记录当下的每一刻</p>
                  <p className="text-[10px] font-bold tracking-widest uppercase mt-2">No Entries Yet</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 relative">
                {/* Visual Timeline Bar */}
                <div className="absolute left-[35px] top-6 bottom-4 w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent" />
                
                {entries.map((entry, index) => {
                  const dateObj = new Date(entry.date);
                  const day = dateObj.getDate();
                  const monthStr = dateObj.toLocaleString('zh-CN', { month: 'short' });
                  return (
                    <motion.div 
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2) }}
                      className="flex gap-4 md:gap-6 relative group"
                    >
                      <div className="flex flex-col items-center w-[70px] shrink-0 z-10 pt-2">
                        <div className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 group-hover:shadow-md group-hover:border-blue-100 transition-all duration-300">
                          <span className="text-lg font-black text-gray-900 leading-none">{day}</span>
                          <span className="text-[8px] font-black uppercase text-blue-500 mt-0.5">{monthStr}</span>
                        </div>
                      </div>
                      
                      <div 
                        onClick={() => setSelectedEntry(entry)}
                        className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2rem] p-5 border border-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 justify-between"
                      >
                         <div className="flex flex-col flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-2">
                             <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">{entry.time}</span>
                               <span className="text-[10px] text-gray-500 font-bold">{entry.weather}</span>
                             </div>
                             <span className="text-lg leading-none filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{entry.mood}</span>
                           </div>
                           <h4 className="text-[15px] font-bold text-gray-900 truncate mb-1.5 leading-tight">{entry.title}</h4>
                           <div className="text-xs text-gray-500 font-medium leading-[1.6] line-clamp-2 md:line-clamp-3 mb-2" dangerouslySetInnerHTML={{ __html: entry.content }} />
                           {entry.location && (
                             <div className="mt-auto flex items-center gap-1 text-[9px] font-bold text-gray-400">
                               <MapPin className="w-3 h-3" />
                               {entry.location}
                             </div>
                           )}
                         </div>
                         {entry.images && entry.images.length > 0 && (
                           <div className="w-full sm:w-[100px] h-[100px] shrink-0 rounded-2xl overflow-hidden shadow-sm self-start hidden sm:block">
                             <img src={entry.images[0]} className="w-full h-full object-cover relative group-hover:scale-105 transition-transform duration-500" />
                           </div>
                         )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAddingEntry(true)} 
              className="fixed bottom-28 right-6 md:right-12 w-14 h-14 bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(37,99,235,0.6)] z-50 border border-blue-400 group"
            >
               <PenLine className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </motion.button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto w-full h-full flex flex-col items-center pb-20 relative z-10">
            {/* Future Letter UI */}
            <div className="flex justify-between items-end w-full mb-12 bg-white/60 backdrop-blur-3xl p-8 rounded-[3rem] border border-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-[1.5rem] flex items-center justify-center shadow-xl border border-gray-800 rotate-[-5deg] hover:rotate-0 transition-transform">
                   <MailOpen className="w-8 h-8 text-white" strokeWidth={1.5} />
                 </div>
                 <div className="flex flex-col">
                   <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">岛屿来信</h3>
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.3em]">Letters to the Future</p>
                 </div>
               </div>
               <button 
                 onClick={() => setIsWritingLetter(true)}
                 className="flex items-center gap-2.5 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:scale-95 transition-all outline-none group"
               >
                 <PenLine className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                 写封信给自己
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full auto-rows-max">
              <AnimatePresence>
                {letters.map((letter, i) => {
                  const isReady = new Date(letter.deliverDate) <= new Date();
                  return (
                    <motion.div
                      key={letter.id}
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
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
                      className={`relative overflow-hidden rounded-[2.5rem] p-8 border shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col h-[280px] transition-all duration-500 ${isReady ? (letter.isOpened ? 'bg-white/80 backdrop-blur-xl border-white cursor-pointer hover:shadow-md' : 'bg-white backdrop-blur-3xl border-white cursor-pointer shadow-[0_15px_40px_-12px_rgba(37,99,235,0.15)] hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.25)] hover:-translate-y-2 group ring-2 ring-blue-500/20') : 'bg-[#f4f4f5]/50 border-white/50 backdrop-blur-sm grayscale-[0.2] opacity-80'}`}
                    >
                      {/* Decorative Envelope Elements */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                         <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gray-50 rounded-full mix-blend-overlay"></div>
                         {!isReady && (
                           <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]" />
                         )}
                         {/* Flap Illusion */}
                         <svg className={`absolute top-0 w-full h-[120px] left-0 transition-all duration-700 ${isReady ? (letter.isOpened ? 'opacity-10 -translate-y-full' : 'opacity-30') : 'opacity-10'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                           <path d="M0,0 L50,80 L100,0" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="1" />
                         </svg>
                      </div>
                      
                      <div className="flex justify-between items-start mb-auto relative z-10">
                        <div className="relative">
                          <div className={`text-5xl filter drop-shadow-sm transition-transform duration-700 ${!letter.isOpened ? 'group-hover:scale-110 group-hover:rotate-6' : ''} bg-white w-16 h-16 rounded-[1.2rem] flex items-center justify-center border border-gray-100 shadow-sm`}>
                            {isReady ? letter.stamp : '💌'}
                          </div>
                          {isReady && !letter.isOpened && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                          )}
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${isReady ? (letter.isOpened ? 'bg-gray-50 text-gray-400 border border-gray-100' : 'bg-blue-500 text-white border border-blue-600 shadow-blue-500/20') : 'bg-gray-200/50 text-gray-500 border border-gray-300/50'}`}>
                           {isReady ? (letter.isOpened ? 'Opened' : 'New Letter') : 'Locked'}
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col mb-6 mt-8">
                        <h4 className={`font-black text-2xl tracking-tight mb-2 truncate ${isReady ? 'text-gray-900 group-hover:text-blue-600 transition-colors' : 'text-gray-400 blur-[1px]'}`}>
                          {isReady ? (letter.isOpened ? letter.title : '你有新的信件') : 'Time Encrypted'}
                        </h4>
                        <p className={`text-[15px] line-clamp-2 leading-relaxed font-medium ${isReady ? 'text-gray-500' : 'text-gray-400 blur-[2px]'}`}>
                          {isReady ? (letter.isOpened ? letter.content : '时光寄来了一封信，快来拆阅吧...') : '这是一封写给未来的信，时光还没解开它的蜡封...'}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100/60 flex justify-between items-center text-[10px] uppercase font-black tracking-widest relative z-10">
                        <div className="flex flex-col gap-1 text-gray-400">
                          <span className="text-gray-300">From</span>
                          <span>{letter.writeDate.replace(/-/g, '.')}</span>
                        </div>
                        {isReady ? (
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${letter.isOpened ? 'text-gray-400 bg-gray-50' : 'text-blue-600 bg-blue-50/80 group-hover:bg-blue-600 group-hover:text-white'}`}>
                             {letter.isOpened ? '重温' : '拆阅'} <ArrowRight className={`w-3.5 h-3.5 ${!letter.isOpened && 'group-hover:translate-x-1'} transition-transform`} />
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1 items-end text-gray-500 bg-gray-100/50 px-3 py-1.5 rounded-xl">
                            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Unlocks On</span>
                            <span>{letter.deliverDate.replace(/-/g, '.')}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              
              {letters.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center p-20 text-center bg-white/60 backdrop-blur-3xl rounded-[3rem] border border-white shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden">
                  <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-8 border border-white shadow-inner rotate-[-5deg] relative z-10">✉️</div>
                  <h4 className="font-black text-gray-900 text-2xl mb-4 relative z-10 tracking-tight">邮局还没收到信件</h4>
                  <p className="text-base font-medium text-gray-500 max-w-sm leading-relaxed relative z-10">
                    不妨提笔，给明年的自己，或者很久以后的自己写下当下的期许吧。
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar for Island Mode */}      {/* Bottom Bar for Island Mode */}
      {isIsland && (
        <div className="w-full shrink-0 bg-white/90 backdrop-blur-3xl border-t border-gray-100/50 pb-safe pt-1.5 flex justify-center relative z-40 shadow-[0_-15px_50px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-2 w-full max-w-lg divide-x divide-gray-100/30">
            <button
              onClick={() => setMainTab('memory')}
              className={`flex flex-col items-center justify-center gap-1 py-3 transition-all duration-500 w-full relative ${mainTab === 'memory' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-14 h-9 flex items-center justify-center rounded-2xl transition-all duration-500 ${mainTab === 'memory' ? 'bg-blue-50/80 scale-110 shadow-inner' : 'bg-transparent'}`}>
                <Camera className="w-[20px] h-[20px]" strokeWidth={2.5} />
              </div>
              <span className={`font-black text-[9px] tracking-[0.2em] uppercase transition-all duration-300 ${mainTab === 'memory' ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>定格记忆</span>
              {mainTab === 'memory' && <motion.div layoutId="bottom-indicator" className="absolute bottom-1 w-6 h-[3px] bg-blue-500 rounded-full" />}
            </button>
            <button
              onClick={() => setMainTab('letter')}
              className={`flex flex-col items-center justify-center gap-1 py-3 transition-all duration-500 w-full relative ${mainTab === 'letter' ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-14 h-9 flex items-center justify-center rounded-2xl transition-all duration-500 ${mainTab === 'letter' ? 'bg-pink-50/80 scale-110 shadow-inner' : 'bg-transparent'}`}>
                <Sparkles className="w-[20px] h-[20px]" strokeWidth={2.5} />
              </div>
              <span className={`font-black text-[9px] tracking-[0.2em] uppercase transition-all duration-300 ${mainTab === 'letter' ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>岛屿来信</span>
              {mainTab === 'letter' && <motion.div layoutId="bottom-indicator" className="absolute bottom-1 w-6 h-[3px] bg-pink-400 rounded-full" />}
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
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 backdrop-blur-md ${isIsland ? 'bg-black/20' : 'bg-amber-950/20'}`}
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              layoutId={selectedEntry.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`w-full ${isIsland ? 'max-w-3xl rounded-[2rem] bg-white' : 'max-w-4xl rounded-[3rem] bg-[#fdfbf7]'} max-h-[85vh] shadow-2xl overflow-hidden flex flex-col relative ${!isIsland && 'border border-amber-900/5'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEntry(null)} 
                className={`absolute top-6 right-6 p-3 rounded-full transition-all z-30 group ${isIsland ? 'hover:bg-gray-100 bg-white/50 backdrop-blur-md' : 'hover:bg-amber-900/5'}`}
              >
                <X className={`w-5 h-5 transition-transform duration-500 group-hover:rotate-90 ${isIsland ? 'text-gray-500' : 'text-amber-900/20 group-hover:text-amber-900'}`} />
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
                        className={`flex items-center gap-3 mb-4 ${isIsland ? 'text-gray-400 text-xs font-medium' : 'text-amber-900/30 text-[10px] font-serif font-black uppercase tracking-[0.3em] mb-6'}`}
                      >
                        {isIsland ? (
                          <>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md text-[10px] font-bold">
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
                          className={`${isIsland ? 'text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight' : 'text-4xl md:text-6xl font-serif font-black text-amber-950 leading-[1.05] selection:bg-amber-100'}`}
                        >
                          {selectedEntry.title}
                        </motion.h2>
                        
                        {isIsland && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-2xl shrink-0 border border-gray-100 shadow-sm"
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
                        className={`${isIsland ? 'text-gray-600 font-medium text-[16px] leading-[2] whitespace-pre-wrap selection:bg-blue-100' : 'text-amber-900/80 font-serif leading-[2.4] text-xl whitespace-pre-wrap selection:bg-amber-100 drop-shadow-sm indent-8'}`}
                        dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                      />
                      
                      {/* Additional images array for isIsland */}
                      {isIsland && selectedEntry.images && selectedEntry.images.length > 1 && (
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedEntry.images.slice(1).map((img, i) => (
                             <img key={i} src={img} className="w-full aspect-square object-cover rounded-2xl shadow-sm border border-gray-100" alt="" referrerPolicy="no-referrer" />
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
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm ${isIsland ? 'bg-black/20' : 'bg-amber-950/30'}`}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border ${isIsland ? 'border-gray-100' : 'border-amber-900/10'}`}
            >
              <div className={`px-8 py-6 border-b flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20 ${isIsland ? 'border-gray-100/50' : 'border-amber-900/10'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isIsland ? 'bg-gray-900 text-white' : 'bg-amber-900 text-amber-50'}`}>
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`font-bold leading-tight ${isIsland ? 'text-gray-900' : 'text-amber-950 font-serif text-xl'}`}>
                      {isIsland ? '记录此刻' : '刻录新瞬间'}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isIsland ? 'text-gray-400' : 'text-amber-900/40'}`}>Capture moment</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingEntry(false)} className={`px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors ${isIsland ? 'text-gray-500 hover:bg-gray-100/80' : 'text-amber-900/60 hover:bg-amber-900/5'}`}>
                    取消
                  </button>
                  <button 
                    onClick={handleSaveEntry}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 ${isIsland ? 'bg-gray-900 text-white hover:bg-black shadow-gray-900/10' : 'bg-amber-900 text-white hover:bg-amber-950 shadow-amber-900/10'}`}
                  >
                    保存
                  </button>
                </div>
              </div>
              <div className={`p-8 overflow-y-auto max-h-[70vh] flex flex-col gap-6 custom-scrollbar ${isIsland ? 'bg-white' : 'bg-[#fdfbf7]'}`}>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="标题 (可选)" 
                  className={`w-full bg-transparent text-2xl font-bold focus:outline-none ${isIsland ? 'text-gray-900 placeholder:text-gray-200' : 'font-serif text-amber-950 placeholder:text-amber-900/20'}`}
                />
                
                <div className={`flex flex-col gap-4 py-6 border-y ${isIsland ? 'border-gray-50' : 'border-amber-900/10'}`}>
                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                       <Smile className="w-3 h-3" /> 今日心情
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {moodOptions.map(mood => (
                        <button
                          key={mood}
                          onClick={() => setNewMood(mood)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${newMood === mood ? 'bg-blue-50 border-2 border-blue-200 scale-110 shadow-sm' : 'bg-gray-50 border border-transparent hover:border-gray-200'}`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                       <Cloud className="w-3 h-3" /> 今日天气
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {weatherOptions.map(weather => (
                        <button
                          key={weather}
                          onClick={() => setNewWeather(weather)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${newWeather === weather ? 'bg-orange-50 border-2 border-orange-200 scale-110 shadow-sm' : 'bg-gray-50 border border-transparent hover:border-gray-200'}`}
                        >
                          {weather}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                       <MapPin className="w-3 h-3" /> 足迹位置
                    </label>
                    <input 
                      type="text" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className={`w-full bg-gray-50 p-3 rounded-xl text-sm focus:outline-none border border-transparent focus:border-gray-200 transition-all ${isIsland ? 'text-gray-600 placeholder:text-gray-200' : 'font-serif text-amber-900/80 placeholder:text-amber-900/20'}`} 
                      placeholder="在哪留下了足迹？"
                    />
                  </div>
                </div>

                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="今天发生了什么故事？" 
                  className={`w-full min-h-[300px] bg-transparent text-base focus:outline-none resize-none leading-loose ${isIsland ? 'text-gray-700 placeholder:text-gray-200' : 'font-serif text-amber-900/80 placeholder:text-amber-900/20'}`}
                />

                <div className="flex flex-col gap-3">
                  {newImages.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {newImages.map((img, i) => (
                        <div key={i} className={`relative w-32 h-32 rounded-xl overflow-hidden border shadow-sm group ${isIsland ? 'border-gray-100' : 'border-amber-900/10'}`}>
                          <img src={img} alt="upload preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div>
                    <input 
                      type="file" 
                      id="diary-image" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label 
                      htmlFor="diary-image"
                      className={`inline-flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors shadow-sm ${isIsland ? 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50' : 'bg-white border-amber-900/10 text-amber-900/60 font-serif hover:bg-amber-50'}`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      添加图片
                    </label>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[70] flex items-center justify-center p-4 backdrop-blur-md bg-black/30`}
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
               initial={{ scale: 0.9, y: 30, opacity: 0, rotateX: 20 }}
               animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
               exit={{ scale: 0.9, y: 30, opacity: 0, rotateX: -20 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="w-full max-w-2xl bg-[#fffefc] rounded-[2.5rem] shadow-2xl relative overflow-hidden preserve-3d"
               onClick={(e) => e.stopPropagation()}
            >
               {/* Decorative stamp/seal */}
               <div className="absolute top-6 right-6 w-16 h-16 border-2 border-red-500/20 rounded-full flex items-center justify-center rotate-12 opacity-80 pointer-events-none">
                 <div className="w-14 h-14 border border-red-500/30 rounded-full flex flex-col items-center justify-center text-red-500/40 font-bold text-[8px] uppercase tracking-widest text-center leading-tight">
                   <span>Island</span>
                   <span className="w-8 border-t border-red-500/20 my-0.5" />
                   <span>Post</span>
                 </div>
               </div>
               
               <button 
                 onClick={() => setSelectedLetter(null)} 
                 className="absolute top-6 left-6 p-3 rounded-full hover:bg-gray-100 transition-colors z-30 group"
               >
                 <X className="w-5 h-5 text-gray-400 group-hover:text-gray-800 transition-colors" />
               </button>

               <div className="p-10 md:p-16 flex flex-col items-center text-center mt-4 relative z-10 custom-scrollbar overflow-y-auto max-h-[80vh]">
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                   <span>{selectedLetter.writeDate.replace(/-/g, '.')}</span>
                   <span className="w-10 h-px bg-gray-200" />
                   <span>{selectedLetter.deliverDate.replace(/-/g, '.')}</span>
                 </div>
                 
                 <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight mb-10 selection:bg-blue-100">
                   {selectedLetter.title}
                 </h2>
                 
                 <p className="text-gray-600 text-lg md:text-xl leading-[2.2] font-medium text-left w-full whitespace-pre-wrap selection:bg-blue-100">
                   {selectedLetter.content}
                 </p>
                 
               </div>
            </motion.div>
          </motion.div>
        )}

        {isWritingLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md bg-black/40`}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: '100%', opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white h-[90vh] md:h-auto md:max-h-[85vh] relative"
            >
              {/* Fancy header background */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
              
              <div className="relative z-10 px-8 py-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                    <PenLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">写给未来</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Write to future</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsWritingLetter(false)} className="px-5 py-2.5 rounded-2xl font-bold text-sm transition-colors text-gray-500 hover:bg-gray-100/80">
                    放弃
                  </button>
                  <button 
                    onClick={handleSaveLetter}
                    disabled={!newLetterContent.trim() || !newLetterDeliverDate}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/10 transition-all bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:active:scale-100 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    封装信件
                  </button>
                </div>
              </div>
              
              <div className="p-8 md:p-12 overflow-y-auto flex flex-col gap-8 custom-scrollbar relative z-10 flex-1">
                
                <div className="flex flex-col gap-6 bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100/60 shadow-inner">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> 送达日期
                    </label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={newLetterDeliverDate}
                      onChange={(e) => setNewLetterDeliverDate(e.target.value)}
                      className="bg-white p-4 rounded-xl font-bold text-gray-800 text-lg border border-gray-100 shadow-sm focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 transition-all cursor-pointer"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Smile className="w-3.5 h-3.5" /> 挑选邮票
                    </label>
                    <div className="flex flex-wrap gap-2">
                       {['💌', '🛸', '🚀', '🎁', '🎈', '🕊️', '🕰️', '🌌'].map(stamp => (
                         <button 
                           key={stamp}
                           onClick={() => setNewLetterStamp(stamp)}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-sm ${newLetterStamp === stamp ? 'bg-blue-50 border-2 border-blue-200 scale-110' : 'bg-white border border-gray-100 hover:border-gray-300'}`}
                         >
                           {stamp}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={newLetterTitle}
                    onChange={(e) => setNewLetterTitle(e.target.value)}
                    placeholder="信件标题" 
                    className="w-full bg-transparent text-3xl font-black text-gray-900 placeholder:text-gray-200 focus:outline-none tracking-tight"
                  />
                  <div className="w-16 h-1 bg-gray-100 rounded-full my-2" />
                  <div className="relative">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(transparent,transparent_31px,#000_31px,#000_32px)] mt-[6px]" />
                    <textarea 
                      value={newLetterContent}
                      onChange={(e) => setNewLetterContent(e.target.value)}
                      placeholder="写下你想对未来的自己说的话..." 
                      className="w-full min-h-[300px] bg-transparent text-lg text-gray-800 placeholder:text-gray-300 focus:outline-none resize-none leading-[32px] font-medium custom-scrollbar relative z-10 pt-2"
                    />
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
