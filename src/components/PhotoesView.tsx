import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Share2, Download, X, Maximize2, Grid, List } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  caption: string;
  date: string;
  location?: string;
  likes: number;
}

export const PhotoesView = () => {
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: 'https://picsum.photos/seed/photo1/800/1200',
      caption: '春日午后的阳光，透过窗帘洒在书桌上。',
      date: '2026-03-25',
      location: 'Home',
      likes: 124
    },
    {
      id: '2',
      url: 'https://picsum.photos/seed/photo2/1200/800',
      caption: '街角的那家咖啡店，总是飘着浓郁的香气。',
      date: '2026-03-22',
      location: 'Coffee Shop',
      likes: 89
    },
    {
      id: '3',
      url: 'https://picsum.photos/seed/photo3/800/800',
      caption: '雨后的街道，倒映着城市的霓虹。',
      date: '2026-03-20',
      location: 'Downtown',
      likes: 256
    },
    {
      id: '4',
      url: 'https://picsum.photos/seed/photo4/1000/1500',
      caption: '山顶的日落，那一抹橘红让人心醉。',
      date: '2026-03-18',
      location: 'Mountain Top',
      likes: 432
    },
    {
      id: '5',
      url: 'https://picsum.photos/seed/photo5/1500/1000',
      caption: '深夜的图书馆，只有翻书的声音。',
      date: '2026-03-15',
      location: 'Library',
      likes: 167
    },
    {
      id: '6',
      url: 'https://picsum.photos/seed/photo6/800/1200',
      caption: '公园里的长椅，静静地等待着归人。',
      date: '2026-03-12',
      location: 'Park',
      likes: 95
    }
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('masonry');

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7]">
      <div className="p-6 flex justify-between items-center border-b border-amber-900/10">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-950">photoes</h2>
          <p className="text-xs text-amber-800/60 font-serif italic">Visual Memories</p>
        </div>
        <div className="flex gap-2 p-1 bg-amber-900/5 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-900 text-white shadow-md' : 'text-amber-900/40 hover:text-amber-900/60'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('masonry')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'masonry' ? 'bg-amber-900 text-white shadow-md' : 'text-amber-900/40 hover:text-amber-900/60'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4'}>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              layoutId={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-amber-50 border border-amber-900/5 break-inside-avoid shadow-sm hover:shadow-md transition-all"
            >
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-xs font-serif line-clamp-2 mb-2">{photo.caption}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white/80 text-[10px]">
                    <Heart className="w-3 h-3 fill-white/80" />
                    <span>{photo.likes}</span>
                  </div>
                  <span className="text-white/60 text-[10px] font-serif">{photo.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={selectedPhoto.id}
              className="relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl border-4 border-white/20"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-80 flex flex-col gap-6 text-amber-950 shrink-0 bg-[#fdfbf7] p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-serif font-bold tracking-tight">{selectedPhoto.location || 'Untitled'}</h3>
                    <p className="text-sm text-amber-800/40 font-serif mt-1">{selectedPhoto.date}</p>
                  </div>
                  <button onClick={() => setSelectedPhoto(null)} className="p-2 hover:bg-amber-900/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-amber-900/40" />
                  </button>
                </div>
                
                <p className="text-lg font-serif leading-relaxed text-amber-900/80">
                  {selectedPhoto.caption}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-amber-900/10">
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-amber-900/5 flex items-center justify-center hover:bg-amber-900/10 transition-colors">
                      <Heart className="w-6 h-6 text-amber-900/60" />
                    </button>
                    <span className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">{selectedPhoto.likes}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-amber-900/5 flex items-center justify-center hover:bg-amber-900/10 transition-colors">
                      <Share2 className="w-6 h-6 text-amber-900/60" />
                    </button>
                    <span className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">Share</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 rounded-full bg-amber-900/5 flex items-center justify-center hover:bg-amber-900/10 transition-colors">
                      <Download className="w-6 h-6 text-amber-900/60" />
                    </button>
                    <span className="text-[10px] font-bold text-amber-900/40 uppercase tracking-widest">Save</span>
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
