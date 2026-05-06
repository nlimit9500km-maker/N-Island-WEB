import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, X, MapPin, Calendar, Clock, Smile, Cloud, Camera, Mail, Send, Lock, Unlock, MailOpen, Navigation, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className={`h-full flex flex-col ${isIsland ? 'bg-[#f8fafc] overflow-hidden' : bgClass} ${fontClass} relative`}>
      {isIsland && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e0f2fe]/40 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#fce7f3]/40 rounded-full blur-[120px] mix-blend-multiply" />
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-[#f3e8ff]/30 rounded-full blur-[120px] mix-blend-multiply" />
        </div>
      )}

      <div className={`relative z-10 w-full shrink-0 ${isIsland ? 'pt-8 pb-4' : 'border-b border-amber-900/10 p-6 flex flex-col gap-6'}`}>
        {!isIsland ? (
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
        ) : (
          <div className="max-w-6xl mx-auto px-4 md:px-10 flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-[1.2rem] flex items-center justify-center shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] border border-white rotate-[-5deg]">
                <Sparkles className="w-6 h-6 text-blue-500 drop-shadow-sm" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[28px] font-black text-gray-900 tracking-tight leading-none mb-1 shadow-sm opacity-90">
                  屿·记
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  Island Journal
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 custom-scrollbar ${isIsland ? 'pb-32' : ''}`}>
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
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 h-full pb-20">
            {/* Sidebar Calendar / Stats */}
            <div className="flex flex-col gap-6 sticky top-0 py-4 hidden md:flex h-fit z-20">
               <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] border border-white flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-pink-100/40 rounded-full blur-2xl -mr-10 -mt-10 transition-transform duration-700 group-hover:scale-150"></div>
                  
                  <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-white to-gray-50 rounded-[1.5rem] mb-6 flex items-center justify-center text-4xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] border border-white mt-2 ring-1 ring-black/5 rotate-[-3deg] group-hover:rotate-0 transition-all duration-500">📔</div>
                  
                  <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight relative z-10">定格记忆</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-1.5 relative z-10">Capture Moments</p>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8 relative z-10" />
                  
                  <div className="w-full grid grid-cols-2 gap-6 text-center relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-black text-gray-800 tracking-tighter">{entries.length}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">篇记录</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-black text-gray-800 tracking-tighter">{entries.filter(e => e.images?.length).length}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">张影像</div>
                    </div>
                  </div>
                  
                  <button 
                     onClick={() => setIsAddingEntry(true)}
                     className="mt-10 w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm transition-all shadow-[0_8px_20px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_30px_-12px_rgba(0,0,0,0.4)] active:scale-95 flex items-center justify-center gap-2 relative z-10 group/btn"
                  >
                    <PenLine className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 写新日记
                  </button>
               </div>
               
               {/* Mini Tags/Filters section */}
               <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-6 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] border border-white">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">筛选回忆</h4>
                  <div className="flex flex-col gap-1.5">
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className={`flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeFilter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]'}`}
                    >
                      <span className="flex items-center gap-2">全部日记</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{entries.length}</span>
                    </button>
                    <button 
                      onClick={() => setActiveFilter('with_images')}
                      className={`flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${activeFilter === 'with_images' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-white/60 hover:shadow-sm hover:scale-[1.02]'}`}
                    >
                      <span className="flex items-center gap-2">有图回忆</span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${activeFilter === 'with_images' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>{entries.filter(e => e.images?.length).length}</span>
                    </button>
                  </div>
               </div>
            </div>

            {/* Timeline & Custom Views */}
            <div className="flex flex-col py-4 gap-8 relative z-10">
              {/* Tab Switcher for Island Mode */}
              <div className="flex gap-1.5 bg-white/50 backdrop-blur-2xl p-1.5 rounded-[1.5rem] w-fit self-center md:self-start mb-2 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] border border-white/60">
                {[
                  { id: 'timeline', label: '时间排序', icon: 'Timeline' },
                  { id: 'gallery', label: '相册影像', icon: 'Gallery' },
                  { id: 'stats', label: '我的足迹', icon: 'Footprints' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-white text-gray-900 shadow-sm border border-gray-100/50' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="md:hidden mb-6 flex justify-between items-center bg-white/80 backdrop-blur-3xl p-5 rounded-[2rem] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.08)] border border-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-white to-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)] border border-white">📔</div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight">定格记忆</h3>
                    <p className="text-gray-400 text-xs font-bold mt-0.5">{entries.length} 篇记录</p>
                  </div>
                </div>
                <button onClick={() => setIsAddingEntry(true)} className="p-3.5 bg-gray-900 text-white rounded-[1.2rem] shadow-lg shadow-gray-900/20 active:scale-95 transition-transform">
                  <PenLine className="w-4 h-4" />
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === 'timeline' && (
                  <motion.div 
                    key="timeline"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-6"
                  >
                    {filteredEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-80 text-gray-400 gap-6 w-full">
                        <div className="w-20 h-20 bg-white/60 backdrop-blur-xl border border-white shadow-xl text-gray-300 rounded-[2rem] flex items-center justify-center text-4xl rotate-[-5deg]">📝</div>
                        <p className="text-sm font-bold tracking-widest uppercase">还没有任何记录，写下第一篇吧。</p>
                      </div>
                    ) : (
                      filteredEntries.map((entry, index) => {
                        const dateObj = new Date(entry.date);
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleString('zh-CN', { month: 'short' });
                        const weekday = dateObj.toLocaleString('zh-CN', { weekday: 'short' });
                        
                        return (
                          <motion.div
                             key={entry.id}
                             initial={{ opacity: 0, y: 30 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true, margin: "-50px" }}
                             transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.2), ease: "easeOut" }}
                             className="flex gap-4 md:gap-8 group"
                           >
                             {/* Timeline Marker */}
                             <div className="flex flex-col items-center w-[50px] md:w-[70px] pt-4 md:pt-6 relative">
                               <div className="text-3xl md:text-5xl font-black text-gray-800 leading-none mb-1.5 group-hover:scale-110 transition-transform duration-500 ease-out">{day < 10 ? `0${day}` : day}</div>
                               <div className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{month}</div>
                               <div className="absolute top-[100px] bottom-[-24px] w-[2px] bg-gradient-to-b from-gray-200 to-transparent group-last:opacity-0" />
                             </div>
                             
                             {/* Entry Card */}
                             <div 
                               onClick={() => setSelectedEntry(entry)}
                               className="flex-1 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-7 md:p-10 cursor-pointer border border-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 transition-all duration-500 group/card relative overflow-hidden"
                             >
                                {/* Decorative floating orb */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-bl from-pink-100/50 to-blue-100/50 rounded-full blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                                  <h4 className="text-2xl font-black text-gray-900 leading-tight tracking-tight group-hover/card:text-blue-600 transition-colors duration-300">{entry.title}</h4>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                     <span className="w-10 h-10 rounded-[1rem] bg-white/50 backdrop-blur-md border border-white shadow-sm flex items-center justify-center text-lg">{entry.mood}</span>
                                     <span className="w-10 h-10 rounded-[1rem] bg-white/50 backdrop-blur-md border border-white shadow-sm flex items-center justify-center text-lg">{entry.weather}</span>
                                  </div>
                                </div>
                                
                                <p className="text-[15px] text-gray-600 leading-[1.8] line-clamp-3 mb-8 relative z-10" dangerouslySetInnerHTML={{ __html: entry.content }} />
                                
                                {entry.images && entry.images.length > 0 && (
                                  <div className={`grid gap-2 mb-8 relative z-10 w-full ${entry.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
                                    {entry.images.slice(0, 3).map((img, i) => (
                                      <div key={i} className={`relative overflow-hidden rounded-2xl shadow-sm border border-white/50 ${entry.images!.length === 1 ? 'aspect-[2/1]' : 'aspect-square'}`}>
                                        <img src={img} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
                                      </div>
                                    ))}
                                    {entry.images.length > 3 && (
                                      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white via-white/80 to-transparent flex items-center justify-end pr-6">
                                        <div className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center border border-gray-100 text-gray-900 font-extrabold text-sm">
                                          +{entry.images.length - 2}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="flex justify-between items-center text-xs text-gray-400 font-bold pt-5 border-t border-gray-100/50 relative z-10">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50/80">
                                      <Clock className="w-3.5 h-3.5" />
                                      {entry.time}
                                    </div>
                                    {entry.location && (
                                      <div className="flex items-center gap-1.5 max-w-[200px] px-3 py-1.5 rounded-xl bg-gray-50/80">
                                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{entry.location}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                             </div>
                          </motion.div>
                        )
                      })
                    )}
                  </motion.div>
                )}

                {activeTab === 'gallery' && (
                  <motion.div 
                    key="gallery"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="columns-2 md:columns-3 gap-4 space-y-4"
                  >
                    {allImages.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center h-80 text-gray-400 gap-6 w-full">
                        <div className="w-20 h-20 bg-white/60 backdrop-blur-xl border border-white shadow-xl text-gray-300 rounded-[2rem] flex items-center justify-center text-4xl">🖼️</div>
                        <p className="text-sm font-bold tracking-widest uppercase">相册空空如也。</p>
                      </div>
                    ) : (
                      allImages.map((img, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="break-inside-avoid w-full rounded-[2rem] overflow-hidden border border-white/60 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 cursor-pointer group"
                          onClick={() => {
                            const entry = entries.find(e => e.images?.includes(img));
                            if (entry) setSelectedEntry(entry);
                          }}
                        >
                          <img src={img} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div 
                    key="stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
                      <h4 className="font-extrabold text-gray-900 text-xl mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 text-lg shadow-sm">📊</span> 心情分布
                      </h4>
                      <div className="grid grid-cols-3 gap-6">
                        {Object.entries(moodStats).map(([mood, count]) => (
                          <div key={mood} className="bg-white/60 p-4 rounded-[1.5rem] flex flex-col items-center gap-3 border border-white shadow-sm hover:scale-105 transition-transform">
                             <span className="text-3xl filter drop-shadow-sm">{mood}</span>
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{count} 次</span>
                          </div>
                        ))}
                        {Object.keys(moodStats).length === 0 && (
                          <div className="col-span-full text-center text-gray-400 font-bold text-sm py-12">
                            记录的第一篇日记将会开始统计心情哦
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)]">
                      <h4 className="font-extrabold text-gray-900 text-xl mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-lg shadow-sm">📍</span> 足迹清单
                      </h4>
                      <div className="flex flex-col gap-3">
                        {allLocations.map((loc, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-[1.2rem] border border-white shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                              <span className="text-sm font-bold text-gray-700 truncate">{loc}</span>
                            </div>
                            <span className="text-xs font-black text-gray-900 bg-gray-100/80 px-3 py-1 rounded-xl shrink-0">
                              {entries.filter(e => e.location === loc).length}
                            </span>
                          </div>
                        ))}
                        {allLocations.length === 0 && (
                          <div className="text-center text-gray-400 font-bold text-sm py-12">
                            带上位置记录你的足迹吧
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-100/40 via-indigo-100/40 to-pink-100/40 backdrop-blur-2xl p-12 rounded-[3rem] border border-white shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] md:col-span-2 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                       <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl mb-6 relative z-10 rotate-[-5deg] group-hover:rotate-[5deg] transition-transform duration-500">🏆</div>
                       <h5 className="font-black text-gray-900 text-2xl mb-4 relative z-10 tracking-tight">书写星空</h5>
                       <p className="text-gray-600 font-medium text-base max-w-sm leading-relaxed relative z-10">
                         你已经在日记中度过了 <span className="font-black text-gray-900 mx-1">{entries.length > 0 ? Math.ceil((new Date().getTime() - new Date(entries[entries.length-1].date).getTime()) / (1000 * 3600 * 24)) : 0}</span> 天之旅，每一页都是独一无二的星辰。
                       </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
                      onClick={() => isReady && setSelectedLetter(letter)}
                      className={`relative overflow-hidden rounded-[2.5rem] p-8 border shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col h-[280px] transition-all duration-500 ${isReady ? 'bg-white/90 backdrop-blur-xl border-white cursor-pointer hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-2 group' : 'bg-[#f4f4f5]/50 border-white/50 backdrop-blur-sm grayscale-[0.2] opacity-80'}`}
                    >
                      {/* Decorative Envelope Elements */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                         <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-gray-50 rounded-full mix-blend-overlay"></div>
                         {!isReady && (
                           <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.02)_10px,rgba(0,0,0,0.02)_20px)]" />
                         )}
                         {/* Flap Illusion */}
                         <svg className={`absolute top-0 w-full h-[120px] left-0 transition-opacity ${isReady ? 'opacity-30' : 'opacity-10'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                           <path d="M0,0 L50,80 L100,0" fill="none" stroke="currentColor" className="text-gray-200" strokeWidth="1" />
                         </svg>
                      </div>
                      
                      <div className="flex justify-between items-start mb-auto relative z-10">
                        <div className="text-5xl filter drop-shadow-sm transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 bg-white w-16 h-16 rounded-[1.2rem] flex items-center justify-center border border-gray-100 shadow-sm">
                          {isReady ? letter.stamp : '💌'}
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md ${isReady ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-200/50 text-gray-500 border border-gray-300/50'}`}>
                           {isReady ? 'Delivered' : 'Locked'}
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex flex-col mb-6 mt-8">
                        <h4 className={`font-black text-2xl tracking-tight mb-2 truncate ${isReady ? 'text-gray-900 group-hover:text-blue-600 transition-colors' : 'text-gray-400 blur-[1px]'}`}>
                          {isReady ? letter.title : 'Time Encrypted'}
                        </h4>
                        <p className={`text-[15px] line-clamp-2 leading-relaxed font-medium ${isReady ? 'text-gray-500' : 'text-gray-400 blur-[2px]'}`}>
                          {isReady ? letter.content : '这是一封写给未来的信，时光还没解开它的蜡封...'}
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100/60 flex justify-between items-center text-[10px] uppercase font-black tracking-widest relative z-10">
                        <div className="flex flex-col gap-1 text-gray-400">
                          <span className="text-gray-300">From</span>
                          <span>{letter.writeDate.replace(/-/g, '.')}</span>
                        </div>
                        {isReady ? (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50/80 px-4 py-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                             拆阅 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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

      {isIsland && (
        <div className="w-full shrink-0 bg-white/80 backdrop-blur-3xl border-t border-gray-100/50 pb-safe pt-2 px-6 flex justify-center relative z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
          <div className="flex w-full max-w-md justify-between">
            <button
              onClick={() => setMainTab('memory')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 ${mainTab === 'memory' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-12 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${mainTab === 'memory' ? 'bg-gray-100 scale-110' : 'bg-transparent'}`}>
                <Camera className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[10px] tracking-widest uppercase">定格记忆</span>
            </button>
            <button
              onClick={() => setMainTab('letter')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 transition-all duration-300 ${mainTab === 'letter' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`w-12 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${mainTab === 'letter' ? 'bg-gray-100 scale-110' : 'bg-transparent'}`}>
                <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[10px] tracking-widest uppercase">岛屿来信</span>
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
            onClick={() => {
                if (!selectedLetter.isOpened) {
                    setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { ...l, isOpened: true } : l));
                }
                setSelectedLetter(null);
            }}
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
                 onClick={() => {
                   if (!selectedLetter.isOpened) {
                     setLetters(prev => prev.map(l => l.id === selectedLetter.id ? { ...l, isOpened: true } : l));
                   }
                   setSelectedLetter(null);
                 }} 
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
