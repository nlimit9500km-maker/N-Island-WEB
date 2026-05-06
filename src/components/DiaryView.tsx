import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Image as ImageIcon, X, MapPin, Calendar, Clock, Smile, Cloud } from 'lucide-react';

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

export const DiaryView = ({ mode = 'life' }: { mode?: 'island' | 'life' }) => {
  const isIsland = mode === 'island';
  const storageKey = isIsland ? 'island_diary_entries' : 'diary_entries';
  const themeColor = isIsland ? 'from-[#ff9a9e] to-[#fecfef]' : 'from-amber-900/5 to-amber-900/10';
  const accentColor = isIsland ? 'text-[#ff7eb3]' : 'text-amber-950';
  const fontClass = isIsland ? 'font-sans' : 'font-serif';
  const bgClass = isIsland ? 'bg-white' : 'bg-[#fdfbf7]';

  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem(storageKey);
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
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  
  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newMood, setNewMood] = useState('😊');
  const [newWeather, setNewWeather] = useState('☀️');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(entries));
  }, [entries, storageKey]);

  const filteredEntries = activeFilter === 'all' 
    ? entries 
    : entries.filter(e => e.images && e.images.length > 0);

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
      id: crypto.randomUUID(),
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

  return (
    <div className={`h-full flex flex-col ${bgClass} ${fontClass}`}>
      <div className={`p-6 flex flex-col gap-6 border-b ${isIsland ? 'border-gray-100 bg-white/80 backdrop-blur-md' : 'border-amber-900/10'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className={`text-2xl font-bold ${isIsland ? 'text-gray-900' : 'text-amber-950'} ${!isIsland && 'font-serif'}`}>
              {isIsland ? '屿·记' : '日记簿'}
            </h2>
            <p className={`text-xs ${isIsland ? 'text-gray-400' : 'text-amber-800/60 font-serif italic'}`}>
              {isIsland ? 'Island Journal' : 'Personal Diary Space'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Control buttons removed as requested */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-10 custom-scrollbar">
        {!isIsland ? (
          <div className="max-w-4xl mx-auto flex flex-col gap-16 pb-20">
            {Array.from(new Set(entries.map(e => e.date))).map(dateStr => {
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
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.id}-${index}`}
                layoutId={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                <div className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 border bg-white flex flex-col ${isIsland ? 'border-gray-100' : 'border-amber-900/10'}`}>
                  {entry.images && entry.images.length > 0 ? (
                    <>
                      <img 
                        src={entry.images[0]} 
                        alt="cover" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute inset-0 opacity-80 ${isIsland ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent' : 'bg-gradient-to-t from-amber-950/80 via-amber-950/20 to-transparent'}`} />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className={`text-white font-bold text-sm line-clamp-2 ${!isIsland && 'font-serif'}`}>{entry.title}</p>
                        <p className="text-white/70 text-[10px] mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {entry.date}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full p-5 flex flex-col relative">
                      <div className="flex justify-between items-center opacity-40 mb-4">
                        <Calendar className={`w-4 h-4 ${isIsland ? 'text-gray-400' : 'text-amber-900'}`} />
                        <span className={`text-[10px] font-bold ${isIsland ? 'text-gray-400' : 'text-amber-900'}`}>{entry.date.replace(/-/g, '.')}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-base mb-2 line-clamp-2 ${isIsland ? 'text-gray-900' : 'text-amber-950 font-serif'}`}>{entry.title}</h3>
                        <p className={`text-xs leading-relaxed line-clamp-[8] ${isIsland ? 'text-gray-500' : 'text-amber-900/60 font-serif'}`} dangerouslySetInnerHTML={{ __html: entry.content }} />
                      </div>
                      <div className={`mt-4 pt-4 border-t flex items-center justify-between opacity-50 ${isIsland ? 'border-gray-50' : 'border-amber-900/10'}`}>
                        <div className="flex gap-1.5">
                          <span className="text-sm">{entry.mood}</span>
                          <span className="text-sm">{entry.weather}</span>
                        </div>
                        <span className={`text-[10px] font-medium ${isIsland ? 'text-gray-400' : 'text-amber-900/60'}`}>{entry.time}</span>
                      </div>
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 backdrop-blur-md rounded-lg flex items-center gap-1 border border-white/50 hidden group-hover:flex ${isIsland ? 'bg-white/40 text-gray-900 shadow-sm border-gray-200' : 'bg-amber-900/5 text-amber-950 border-amber-900/10'}`}>
                     <span className="text-[10px] font-bold">查看详情</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5 px-1">
                  <h3 className={`font-bold text-sm line-clamp-1 transition-colors ${isIsland ? 'text-gray-900 group-hover:text-blue-600' : 'text-amber-950 font-serif group-hover:text-amber-700'}`}>{entry.title}</h3>
                  <p className={`text-[10px] truncate ${isIsland ? 'text-gray-400' : 'text-amber-900/40 font-serif italic'}`}>{entry.date} {entry.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-amber-950/20 backdrop-blur-md"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              layoutId={selectedEntry.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className={`bg-white w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative border border-amber-900/5`}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedEntry(null)} 
                className="absolute top-8 right-8 p-4 rounded-full hover:bg-amber-900/5 transition-all z-30 group"
              >
                <X className="w-6 h-6 text-amber-900/20 group-hover:text-amber-900 group-hover:rotate-90 transition-all duration-500" />
              </button>

              <div className="flex flex-col md:flex-row h-full w-full overflow-hidden">
                {/* Visual Section */}
                <div className="w-full md:w-[45%] relative bg-amber-50 h-[300px] md:h-auto overflow-hidden">
                  {selectedEntry.images && selectedEntry.images.length > 0 ? (
                    <motion.img 
                      initial={{ scale: 1.1, filter: "blur(5px)" }}
                      animate={{ scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 1.2 }}
                      src={selectedEntry.images[0]} 
                      alt={selectedEntry.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100/50">
                      <ImageIcon className="w-20 h-20 text-amber-900/5" />
                    </div>
                  )}
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
                </div>

                {/* Content Section */}
                <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar flex flex-col bg-[#fdfbf7] relative">
                  {/* Decorative element: Big Date Background */}
                  <div className="absolute top-12 left-10 pointer-events-none opacity-[0.03]">
                    <span className="text-[140px] font-serif font-black select-none leading-none -ml-8">
                      {new Date(selectedEntry.date).getDate()}
                    </span>
                  </div>
                  
                  {/* Decorative Stamp */}
                  <div className="absolute -bottom-10 -right-10 w-72 h-72 opacity-[0.04] pointer-events-none rotate-[12deg]">
                     <div className="border-[6px] border-amber-900 rounded-full w-full h-full flex flex-col items-center justify-center text-amber-900 font-black text-center uppercase tracking-tighter">
                       <span className="text-4xl text-amber-900">Authentic</span>
                       <span className="text-5xl border-y-2 border-amber-900 my-1 py-1 text-amber-900">2026</span>
                       <span className="text-4xl text-amber-900">Memories</span>
                     </div>
                  </div>

                  <div className="relative z-10 flex-1 flex flex-col">
                    <header className="mb-14">
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 text-amber-900/30 text-[10px] font-serif font-black uppercase tracking-[0.3em] mb-6"
                      >
                        <span>{selectedEntry.date.replace(/-/g, ' . ')}</span>
                        <div className="w-16 h-px bg-amber-900/10" />
                        <span>{selectedEntry.time}</span>
                      </motion.div>
                      
                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl font-serif font-black text-amber-950 leading-[1.05] selection:bg-amber-100"
                      >
                        {selectedEntry.title}
                      </motion.h2>
                    </header>

                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex-1"
                    >
                      <div 
                        className="text-amber-900/80 font-serif leading-[2.4] text-xl whitespace-pre-wrap selection:bg-amber-100 drop-shadow-sm indent-8"
                        dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                      />
                    </motion.div>

                    <motion.footer 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
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
              <div className={`p-6 border-b flex justify-between items-center bg-white ${isIsland ? 'border-gray-100' : 'border-amber-900/10'}`}>
                <div>
                  <h3 className={`text-xl font-bold ${isIsland ? 'text-gray-900' : 'text-amber-950 font-serif'}`}>
                    {isIsland ? '刻录新瞬间' : '刻录新瞬间'}
                  </h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isIsland ? 'text-gray-300' : 'text-amber-900/40'}`}>Write a new diary</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingEntry(false)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${isIsland ? 'text-gray-400 hover:bg-gray-50' : 'text-amber-900/60 hover:bg-amber-900/5'}`}>
                    取消
                  </button>
                  <button 
                    onClick={handleSaveEntry}
                    className={`px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-colors ${isIsland ? 'bg-gray-900 text-white hover:bg-black' : 'bg-amber-900 text-white hover:bg-amber-950'}`}
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
                
                <div className={`flex flex-wrap items-center gap-4 py-4 border-y ${isIsland ? 'border-gray-50' : 'border-amber-900/10'}`}>
                  <div className="flex items-center gap-2">
                    <Smile className={`w-4 h-4 ${isIsland ? 'text-gray-300' : 'text-amber-900/40'}`} />
                    <input 
                      type="text" 
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                      className={`w-16 bg-transparent text-sm focus:outline-none ${isIsland ? 'text-gray-600' : 'font-serif text-amber-900/80'}`} 
                      placeholder="心情"
                    />
                  </div>
                  <div className={`w-px h-4 ${isIsland ? 'bg-gray-100' : 'bg-amber-900/10'}`} />
                  <div className="flex items-center gap-2">
                    <Cloud className={`w-4 h-4 ${isIsland ? 'text-gray-300' : 'text-amber-900/40'}`} />
                    <input 
                      type="text" 
                      value={newWeather}
                      onChange={(e) => setNewWeather(e.target.value)}
                      className={`w-16 bg-transparent text-sm focus:outline-none ${isIsland ? 'text-gray-600' : 'font-serif text-amber-900/80'}`} 
                      placeholder="天气"
                    />
                  </div>
                  <div className={`w-px h-4 ${isIsland ? 'bg-gray-100' : 'bg-amber-900/10'}`} />
                  <div className="flex items-center gap-2 flex-1">
                    <MapPin className={`w-4 h-4 ${isIsland ? 'text-gray-300' : 'text-amber-900/40'}`} />
                    <input 
                      type="text" 
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className={`flex-1 bg-transparent text-sm focus:outline-none ${isIsland ? 'text-gray-600 placeholder:text-gray-200' : 'font-serif text-amber-900/80 placeholder:text-amber-900/20'}`} 
                      placeholder="添加位置信息..."
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
      </AnimatePresence>
    </div>
  );
};
