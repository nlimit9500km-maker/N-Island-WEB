import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Calendar, ChevronRight, Search, Plus, X, Trash2 } from 'lucide-react';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: string;
}

export const DiaryView = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([
    {
      id: '1',
      date: '2026-03-30',
      title: '春日漫步',
      content: '今天去公园散步，看到樱花都开了。微风拂过，花瓣如雪般落下，那一刻感觉时间都静止了。生活中的小确幸大概就是如此吧。',
      mood: '😊'
    },
    {
      id: '2',
      date: '2026-03-28',
      title: '深夜随笔',
      content: '最近在读《虽然想死，但还是想吃辣炒年糕》，感触颇深。每个人都有脆弱的时候，允许自己停下来，也是一种勇敢。',
      mood: '🌙'
    }
  ]);

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleAddEntry = () => {
    if (!newTitle || !newContent) return;
    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: newTitle,
      content: newContent,
      mood: '📝'
    };
    setEntries([newEntry, ...entries]);
    setIsAdding(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries(entries.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7]">
      <div className="p-6 flex justify-between items-center border-b border-amber-900/10">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-950">日记簿</h2>
          <p className="text-xs text-amber-800/60 font-serif italic">记录生活的点滴温情</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-900 text-white rounded-full text-sm font-medium hover:bg-amber-800 transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>新篇章</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              layoutId={entry.id}
              onClick={() => setSelectedEntry(entry)}
              className="p-5 bg-white border border-amber-900/5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-xs text-amber-800/40 font-serif">
                  <Calendar className="w-3 h-3" />
                  <span>{entry.date}</span>
                  {entry.mood && <span className="ml-2">{entry.mood}</span>}
                </div>
                <button 
                  onClick={(e) => handleDelete(entry.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-amber-950 mb-2 font-serif">{entry.title}</h3>
              <p className="text-sm text-amber-900/70 line-clamp-2 leading-relaxed">{entry.content}</p>
              <div className="mt-4 flex justify-end">
                <ChevronRight className="w-4 h-4 text-amber-900/20 group-hover:text-amber-900/50 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              layoutId={selectedEntry.id}
              className="bg-[#fdfbf7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-amber-900/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
                    {selectedEntry.mood}
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-950 font-serif">{selectedEntry.title}</h3>
                    <p className="text-xs text-amber-800/40 font-serif">{selectedEntry.date}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-amber-900/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-amber-900/40" />
                </button>
              </div>
              <div className="p-8 overflow-auto flex-1">
                <p className="text-amber-900/80 leading-loose whitespace-pre-wrap font-serif text-lg">
                  {selectedEntry.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsAdding(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-amber-950 mb-6 font-serif">开启新篇章</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900/40 uppercase tracking-widest mb-2">标题</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="给这段时光起个名字..."
                    className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/20 text-amber-950 font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900/40 uppercase tracking-widest mb-2">内容</label>
                  <textarea 
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="记录此刻的心情..."
                    rows={6}
                    className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-900/20 text-amber-950 font-serif resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-3 text-amber-900/60 font-bold hover:bg-amber-50 rounded-xl transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleAddEntry}
                    className="flex-1 py-3 bg-amber-900 text-white font-bold rounded-xl hover:bg-amber-800 transition-colors shadow-lg"
                  >
                    保存
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
