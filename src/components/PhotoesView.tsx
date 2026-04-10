import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Heart, Share2, Download, X, Maximize2, Grid, List, MapPin, Calendar } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io({ reconnectionAttempts: 3, timeout: 5000 });

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
      url: 'https://cdn.imagetourl.cloud/uploads/2vi94lgu.jpg',
      caption: '横穿的电线划过满布繁星的夜空，留下一抹寂朗。',
      date: '2026-02-14',
      location: 'Starry Sky',
      likes: 0
    },
    {
      id: '3',
      url: 'https://cdn.imagetourl.cloud/uploads/6n09qdwq.jpg',
      caption: '腾空上升的花火，在巨大的声响中绽放，闪烁，飘散。',
      date: '2026-02-17',
      location: 'Fireworks',
      likes: 0
    },
    {
      id: '2',
      url: 'https://cdn.imagetourl.cloud/uploads/qebin2id.jpg',
      caption: '回程起航前的落日余晖亲历的当下，玻璃窗上错落有致的划痕诉说着的过往。',
      date: '2025-12-26',
      location: 'Sunset',
      likes: 0
    },
    {
      id: '4',
      url: 'https://cdn.imagetourl.cloud/uploads/lgfcykn0.jpg',
      caption: '本该空无一物的旷野上架设起轨道。',
      date: '2025-12-29',
      location: "I'm on my way",
      likes: 0
    }
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoLikes, setPhotoLikes] = useState<Record<string, string[]>>({});
  const [isSharing, setIsSharing] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    const savedAvatar = localStorage.getItem('icity_avatar') || "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260331190749_135_129-imagetourl.cloud-1774955296881-pmp6sz.png";
    const savedSignature = localStorage.getItem('icity_signature');
    
    if (savedSignature && savedSignature !== "Island_乱码") {
      return { avatar: savedAvatar, signature: savedSignature };
    }
    
    const randomId = Math.floor(100 + Math.random() * 900);
    const newSignature = `Island_${randomId}`;
    localStorage.setItem('icity_signature', newSignature);
    return { avatar: savedAvatar, signature: newSignature };
  });

  useEffect(() => {
    socket.emit("request_init_data");

    const handleInitData = (data: any) => {
      if (data.photoesLikes) setPhotoLikes(data.photoesLikes);
    };

    const handleLikesUpdated = (likes: Record<string, string[]>) => {
      setPhotoLikes(likes);
    };

    socket.on("init_data", handleInitData);
    socket.on("photoes_likes_updated", handleLikesUpdated);

    return () => {
      socket.off("init_data", handleInitData);
      socket.off("photoes_likes_updated", handleLikesUpdated);
    };
  }, []);

  const handleLike = (photoId: string) => {
    // Optimistic UI update
    const currentLikes = photoLikes[photoId] || [];
    let newLikes;
    if (currentLikes.includes(userProfile.signature)) {
      newLikes = currentLikes.filter(sig => sig !== userProfile.signature);
    } else {
      newLikes = [...currentLikes, userProfile.signature];
    }
    setPhotoLikes({ ...photoLikes, [photoId]: newLikes });
    
    // Send action to server for robust syncing
    socket.emit("toggle_photo_like", { photoId, signature: userProfile.signature });
  };

  const handleShare = async (photo: Photo) => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = `/api/proxy-image?url=${encodeURIComponent(photo.url)}`;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Add frosted glass watermark
      const fontSize = Math.max(12, img.height * 0.018);
      ctx.font = `500 ${fontSize}px "Inter", ui-sans-serif, system-ui, sans-serif`;
      const text = '@无棘莺落';
      const textMetrics = ctx.measureText(text);
      const paddingX = fontSize * 1.6;
      const paddingY = fontSize * 0.7;
      const rectWidth = textMetrics.width + paddingX * 2;
      const rectHeight = fontSize + paddingY * 2;
      const x = canvas.width / 2;
      const y = canvas.height - Math.max(25, img.height * 0.035) - rectHeight;

      const r = rectHeight / 2;
      const rx = x - rectWidth / 2;

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(rx, y, rectWidth, rectHeight, r);
      } else {
        ctx.moveTo(rx + r, y);
        ctx.lineTo(rx + rectWidth - r, y);
        ctx.arcTo(rx + rectWidth, y, rx + rectWidth, y + r, r);
        ctx.lineTo(rx + rectWidth, y + rectHeight - r);
        ctx.arcTo(rx + rectWidth, y + rectHeight, rx + rectWidth - r, y + rectHeight, r);
        ctx.lineTo(rx + r, y + rectHeight);
        ctx.arcTo(rx, y + rectHeight, rx, y + rectHeight - r, r);
        ctx.lineTo(rx, y + r);
        ctx.arcTo(rx, y, rx + r, y, r);
      }
      ctx.clip();

      // Frosted glass effect: blur the underlying image
      ctx.filter = 'blur(16px) saturate(1.8) brightness(1.05)';
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      // Semi-transparent overlay for the glass - more subtle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();

      // Extremely subtle white inner glow/border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Draw text with very soft shadow
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + rectHeight / 2 + fontSize * 0.05);
      ctx.shadowColor = 'transparent';

      const base64Image = canvas.toDataURL('image/jpeg', 0.9);

      const response = await fetch('/api/share-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      
      // Construct full URL using frontend origin
      const fullUrl = `${window.location.origin}${data.url}`;
      
      // Open in new tab
      window.open(fullUrl, '_blank');
      
      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch (e) {
        // Ignore clipboard errors
      }

    } catch (err) {
      console.error("Failed to generate watermarked image", err);
    } finally {
      setIsSharing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7] overflow-hidden">
      <div className="p-8 flex justify-between items-center border-b border-amber-900/10 bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <div>
          <h2 className="text-3xl font-serif font-bold text-amber-950 tracking-tight">photoes</h2>
          <p className="text-xs text-amber-800/60 font-serif italic mt-1">Capturing the essence of life</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-amber-900/40 uppercase tracking-[0.2em]">Curated by</span>
            <span className="text-xs font-serif text-amber-900/80">无棘莺落</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-900/5 border border-amber-900/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-amber-900/40" />
          </div>
        </div>
      </div>

      <motion.div 
        className="flex-1 overflow-auto p-6 md:p-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {photos.map((photo, idx) => {
            const likesCount = (photoLikes[photo.id] || []).length + photo.likes;
            const isLiked = (photoLikes[photo.id] || []).includes(userProfile.signature);

            return (
              <motion.div
                key={`${photo.id}-${idx}`}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white border border-amber-900/5 shadow-sm hover:shadow-2xl transition-all duration-500 break-inside-avoid"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={photo.caption} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-950/90 via-amber-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-white text-sm md:text-base font-serif leading-relaxed mb-4 drop-shadow-lg line-clamp-3 italic">
                        "{photo.caption}"
                      </p>
                      <div className="flex items-center justify-between border-t border-white/20 pt-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(photo.id);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-amber-500 text-white' : 'bg-white/20 text-white/90 hover:bg-white/30'}`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                            <span className="text-[10px] font-bold">{likesCount}</span>
                          </button>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-white/60 text-[10px] font-serif">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>{photo.location}</span>
                          </div>
                          <span className="text-white/40 text-[10px] font-serif mt-0.5">{photo.date}</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-[#fdfbf7]/95 backdrop-blur-xl"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-6xl h-full flex flex-col md:flex-row items-center justify-center gap-12"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                <motion.img 
                  layoutId={selectedPhoto.id}
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption} 
                  className="max-w-full max-h-full object-contain shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] rounded-3xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="w-full md:w-96 flex flex-col gap-8 text-amber-950 shrink-0 p-4">
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-900/40">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">{selectedPhoto.location || 'Unknown'}</span>
                      </div>
                      <h3 className="text-3xl font-serif font-bold tracking-tight text-amber-950">{selectedPhoto.location || 'Untitled'}</h3>
                    </div>
                    <button onClick={() => setSelectedPhoto(null)} className="p-3 hover:bg-amber-900/5 rounded-full transition-all hover:rotate-90 duration-300">
                      <X className="w-6 h-6 text-amber-900/40" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-amber-900/40 font-serif text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedPhoto.date}</span>
                  </div>

                  <p className="text-xl font-serif leading-relaxed text-amber-900/80 italic border-l-2 border-amber-900/10 pl-6 py-2">
                    "{selectedPhoto.caption}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-8 border-t border-amber-900/10">
                  <button 
                    onClick={() => handleLike(selectedPhoto.id)}
                    className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
                      (photoLikes[selectedPhoto.id] || []).includes(userProfile.signature)
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                        : 'bg-amber-900/5 text-amber-900/60 hover:bg-amber-900/10 border border-amber-900/5'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${(photoLikes[selectedPhoto.id] || []).includes(userProfile.signature) ? 'fill-white' : ''}`} />
                    <span className="text-sm font-bold uppercase tracking-widest">
                      {(photoLikes[selectedPhoto.id] || []).length + selectedPhoto.likes} Likes
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleShare(selectedPhoto)}
                    disabled={isSharing}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                      isSharing 
                        ? 'bg-amber-900/50 text-white/50 cursor-not-allowed shadow-none' 
                        : 'bg-amber-900 text-white hover:bg-amber-800 shadow-amber-900/20'
                    }`}
                    title="Share with Watermark"
                  >
                    {isSharing ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] text-amber-900/30 font-serif text-center uppercase tracking-[0.3em]">
                    Visual Memories &copy; 2026 无棘莺落
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
