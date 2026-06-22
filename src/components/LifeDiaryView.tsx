import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Calendar, Search, MapPin, X, Plus, Trash2, Book } from 'lucide-react';

interface LifeDiaryEntry {
  id: string;
  date: string;
  time: string;
  title: string;
  content: string;
  weather: string;
  mood: string;
}

const PRESET_ENTRIES: LifeDiaryEntry[] = [
  {
    id: '1',
    date: '2026-06-01',
    time: '14:30',
    title: '今日的悠闲漫步',
    content: '夏初的风终于驱散了连日的闷热。走在湖边，波光粼粼的水面上荡漾着层层碎金。生活其实不需要太多刻意，只是坐在这里发发呆，就很好了。',
    weather: '☀️',
    mood: '😊'
  },
  {
    id: '2',
    date: '2026-05-28',
    time: '20:15',
    title: '看完一部老电影',
    content: '重温了《海上钢琴师》。那句"我停下来，不是因为我看到了什么，而是因为我没看到的。" 以前不懂，现在似乎明白了。世界太大了，但我只想守好属于自己的这方琴键。',
    weather: '🌧️',
    mood: '思考'
  }
];

export const LifeDiaryView = () => {
  const [entries, setEntries] = useState<LifeDiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('life_diary_entries');
      const parsed = saved && saved !== 'null' ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : PRESET_ENTRIES;
    } catch { return PRESET_ENTRIES; }
  });

  useEffect(() => {
    localStorage.setItem('life_diary_entries', JSON.stringify(entries));
  }, [entries]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showEditor, setShowEditor] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const filteredEntries = entries.filter(e => {
    return (e.title || '').includes(searchQuery) || (e.content || '').includes(searchQuery);
  });

  const handleSave = () => {
    if (!(newTitle || '').trim() && !(newContent || '').trim()) return;
    const now = new Date();
    const newEntry: LifeDiaryEntry = {
      id: `life-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      title: newTitle || '无题',
      content: newContent,
      weather: '☀️',
      mood: '😊'
    };
    setEntries([newEntry, ...entries]);
    setShowEditor(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这篇日记吗？')) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] overflow-hidden">
      {/* Header matching Media and Photoes */}
      <div className="p-8 flex justify-between items-center border-b border-amber-900/10 bg-[#fdfbf7] z-10 shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-bold text-amber-950 tracking-tight">日记簿</h2>
          <p className="text-xs text-amber-800/60 font-serif italic mt-1">Life Notes & Reflections</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search bits of life..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-amber-900/5 border-none text-xs px-4 py-2 pr-8 rounded-full outline-none focus:ring-1 focus:ring-amber-900/20 text-amber-950 placeholder:text-amber-800/30 transition-all font-serif"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-800/40" />
          </div>
          <button 
            onClick={() => setShowEditor(true)}
            className="w-10 h-10 rounded-full bg-amber-900 text-white flex items-center justify-center hover:bg-amber-800 hover:scale-105 transition-all shadow-md shadow-amber-900/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white border border-amber-900/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDelete(entry.id, e)}
                    className="p-1.5 text-amber-900/30 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center p-3 bg-[#fdfbf7] rounded-xl border border-amber-900/5 min-w-[70px]">
                    <span className="text-2xl font-serif font-bold text-amber-950 leading-none">
                      {entry.date.split('-')[2]}
                    </span>
                    <span className="text-[10px] text-amber-800/60 font-serif mt-1 font-bold">
                      {entry.date.split('-')[0]}.{entry.date.split('-')[1]}
                    </span>
                  </div>

                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-serif font-bold text-amber-950 group-hover:text-amber-800 transition-colors">
                        {entry.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-amber-800/40">
                        <span className="bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Calendar className="w-3 h-3"/> {entry.time}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-amber-900/70 leading-relaxed font-serif whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredEntries.length === 0 && (
             <div className="text-center py-20">
               <Book className="w-10 h-10 text-amber-900/10 mx-auto mb-3" />
               <p className="text-sm text-amber-800/40 font-serif italic">No stories found. Start a new chapter.</p>
             </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#fdfbf7]/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white max-w-2xl w-full rounded-[2rem] shadow-2xl shadow-amber-900/10 border border-amber-900/10 overflow-hidden"
            >
              <div className="p-6 border-b border-amber-900/5 flex justify-between items-center bg-[#fdfbf7]/50">
                <span className="text-sm font-serif font-bold text-amber-950 flex items-center gap-2">
                  <PenLine className="w-4 h-4 text-amber-700" />
                  撰写新日记
                </span>
                <button 
                  onClick={() => setShowEditor(false)}
                  className="p-1.5 text-amber-900/40 hover:text-amber-950 hover:bg-amber-900/5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <input
                  type="text"
                  placeholder="The Title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-2xl font-serif font-bold text-amber-950 placeholder:text-amber-900/20 outline-none bg-transparent"
                />
                
                <textarea
                  placeholder="What's going on today?"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-[300px] resize-none text-sm font-serif text-amber-900/80 placeholder:text-amber-900/30 outline-none leading-relaxed bg-transparent"
                />
              </div>

              <div className="p-6 border-t border-amber-900/5 bg-[#fdfbf7]/50 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={!(newTitle || '').trim() && !(newContent || '').trim()}
                  className="px-6 py-2 bg-amber-900 text-white rounded-full text-xs font-bold shadow-md hover:bg-amber-800 disabled:opacity-50 disabled:hover:bg-amber-900 transition-all font-serif tracking-wider uppercase"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
