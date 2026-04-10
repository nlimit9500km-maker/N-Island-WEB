import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Film, Book, Music, ExternalLink, Star, Search, Plus, X, PenLine, Check, MessageCircle, Trash2, Image as ImageIcon, Send, User, Repeat, ThumbsUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { io } from 'socket.io-client';

const socket = io({ reconnectionAttempts: 3, timeout: 5000 });

interface ReviewComment {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface Review {
  id: string;
  mediaId: string;
  isCurrentUser: boolean;
  userName: string;
  userAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  comments: ReviewComment[];
}

interface MediaItem {
  id: string;
  type: 'movie' | 'tv' | 'book';
  title: string;
  author: string;
  screenwriter?: string;
  translator?: string;
  cover: string;
  rating: number;
  description: string;
  url?: string;
}

export const MediaView = () => {
  const [items, setItems] = useState<MediaItem[]>([
    {
      id: '1',
      type: 'movie',
      title: '百万元与苦虫女',
      author: '棚田由纪',
      cover: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/p699101890-imagetourl.cloud-1774953220634-dec80r.webp',
      rating: 8.1,
      description: '佐藤铃子是一个平凡的女孩，在经历了一场意外的牢狱之灾后，她决定每赚够一百万日元就搬一次家，在不同的地方开启新的生活。',
      url: 'https://movie.douban.com/subject/2157504/'
    },
    {
      id: '2',
      type: 'tv',
      title: '我的解放日志',
      author: '金锡允',
      screenwriter: '朴惠英',
      cover: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/p2869925687-imagetourl.cloud-1774961446401-dk99p9.webp',
      rating: 9.0,
      description: '三兄妹想要逃离达到极限的烦闷生活，与神秘的外地人具氏之间发生的故事。',
      url: 'https://movie.douban.com/subject/35322421/'
    },
    {
      id: '4',
      type: 'book',
      title: '你的夏天还好吗',
      author: '金爱烂',
      translator: '薛舟',
      cover: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/s34320463-imagetourl.cloud-1774966252650-2zb4wo.jpg',
      rating: 8.7,
      description: '“去看里面八个如热带鱼一样残忍而发光的故事吧。去亲身感受金爱烂美丽又凶险的夏天吧。\n——如果可以的话，尽可能多读几遍。”\n\n《你的夏天还好吗？》是金爱烂的第三部短篇小说集，共收入八篇作品。书中形形色色的人物大多面临绝境，赤裸裸地暴露在现实之中，却试图寻找渺茫的希望。尤其值得一提的是，其中五篇作品聚焦于三十岁左右的年轻女性，细腻地描摹了她们在爱情、友情、婚姻、工作等方面的心理状态，或许会激起中国女性读者的共鸣。作为韩国文坛最有代表性的女作家，金爱烂赢得了大量读者的喜爱，很大程度上归功于作品主人公的力量。',
      url: 'https://book.douban.com/subject/36109174/'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'movie' | 'tv' | 'book'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showReviewsFor, setShowReviewsFor] = useState<MediaItem | null>(null);
  const [showThoughtsFor, setShowThoughtsFor] = useState<MediaItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewImage, setNewReviewImage] = useState<string | null>(null);
  const [activeCommentReviewId, setActiveCommentReviewId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [thoughtsLikes, setThoughtsLikes] = useState<string[]>([]);
  const [thoughtsComments, setThoughtsComments] = useState<{ id: string, name: string, avatar: string, content: string, timestamp: number }[]>([]);
  const [isCommentingThoughts, setIsCommentingThoughts] = useState(false);
  const [thoughtsCommentValue, setThoughtsCommentValue] = useState("");

  useEffect(() => {
    socket.on("init_data", (data: any) => {
      if (data.thoughtsLikes) setThoughtsLikes(data.thoughtsLikes);
      if (data.thoughtsComments) setThoughtsComments(data.thoughtsComments);
      if (data.reviews) setReviews(data.reviews);
    });

    socket.on("thoughts_likes_updated", (likes: string[]) => {
      setThoughtsLikes(likes);
    });

    socket.on("thoughts_comments_updated", (comments: any[]) => {
      setThoughtsComments(comments);
    });

    socket.on("reviews_updated", (updatedReviews: Review[]) => {
      setReviews(updatedReviews);
    });

    return () => {
      socket.off("init_data");
      socket.off("thoughts_likes_updated");
      socket.off("thoughts_comments_updated");
      socket.off("reviews_updated");
    };
  }, []);

  const [userProfile, setUserProfile] = useState(() => {
    const savedAvatar = localStorage.getItem('icity_avatar') || "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260331190749_135_129-imagetourl.cloud-1774955296881-pmp6sz.png";
    const savedSignature = localStorage.getItem('icity_signature');
    
    if (savedSignature && savedSignature !== "Island_乱码") {
      return { avatar: savedAvatar, signature: savedSignature };
    }
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    const defaultName = `Island_${randomNum}`;
    localStorage.setItem('icity_signature', defaultName);
    return { avatar: savedAvatar, signature: defaultName };
  });

  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      setUserProfile({
        avatar: e.detail.avatar,
        signature: e.detail.signature
      });
    };
    window.addEventListener('icity_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('icity_profile_updated', handleProfileUpdate);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewReviewImage(url);
    }
  };

  const filteredItems = activeFilter === 'all' ? items : items.filter(item => item.type === activeFilter);

  const getThoughtsContent = (id: string) => {
    if (id === '2') {
      return {
        date: '25-12-11 14:30 来自 岛屿的信箱',
        mainImage: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/ScreenShot_2026-03-31_215341_248-imagetourl.cloud-1774965237240-1qp729.png',
        images: [
          "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/1-imagetourl.cloud-1774964823576-xbumkz.jpg",
          "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/2-imagetourl.cloud-1774964823595-anu8n3.jpg",
          "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/3-imagetourl.cloud-1774964822560-awccc5.jpg",
          "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/4-imagetourl.cloud-1774964821839-as7zaz.jpg",
          "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/5-imagetourl.cloud-1774964822290-qeg3wz.jpg"
        ]
      };
    }
    return {
      date: '22-4-20 14:30 来自 岛屿的信箱',
      mainImage: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/2-imagetourl.cloud-1774960309581-q0ewfd.png',
      images: [
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/1-imagetourl.cloud-1774957080142-a15fxz.jpg",
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/2-imagetourl.cloud-1774957080061-z0prs7.jpg",
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/3-imagetourl.cloud-1774957080145-62xzov.jpg",
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/4-imagetourl.cloud-1774957080076-93t66l.jpg",
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/5-imagetourl.cloud-1774957080081-5sqxvg.jpg",
        "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/6-imagetourl.cloud-1774957080115-cgza4x.jpg"
      ]
    };
  };

  return (
    <div className="h-full flex flex-col bg-[#fdfbf7]">
      <div className="p-6 flex flex-col gap-6 border-b border-amber-900/10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-950">影音集</h2>
            <p className="text-xs text-amber-800/60 font-serif italic">Curated Media Collection</p>
          </div>
          <div className="flex gap-2 p-1 bg-amber-900/5 rounded-xl">
            {(['all', 'movie', 'tv', 'book'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeFilter === filter ? 'bg-amber-900 text-white shadow-md' : 'text-amber-900/40 hover:text-amber-900/60'}`}
              >
                {filter === 'tv' ? 'TV SHOWS' : filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setSelectedItem(item)}
              className="group cursor-pointer flex flex-col gap-3"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500 border border-amber-900/5">
                <img 
                  src={item.cover} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-amber-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-500">
                    {item.type === 'movie' ? <Play className="w-6 h-6 text-white fill-white" /> : 
                     item.type === 'book' ? <Book className="w-6 h-6 text-white" /> : 
                     <Film className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <div className="absolute top-3 right-3 px-2 py-1 bg-amber-950/60 backdrop-blur-md rounded-lg flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-200 fill-amber-200" />
                  <span className="text-[10px] font-bold text-white">{item.rating}</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="font-serif font-bold text-amber-950 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">{item.title}</h3>
                <p className="text-[10px] text-amber-900/40 font-serif italic truncate">{item.author}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              layoutId={selectedItem.id}
              className="bg-[#fdfbf7] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full md:w-72 aspect-[2/3] md:aspect-auto relative shrink-0">
                <img 
                  src={selectedItem.cover} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-transparent md:hidden" />
              </div>
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-100 rounded text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                        {selectedItem.type}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-amber-950">{selectedItem.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-amber-950 tracking-tight leading-tight">{selectedItem.title}</h3>
                    <p className="text-lg font-serif italic text-amber-800/40 mt-1">
                      {selectedItem.author}
                    </p>
                    {selectedItem.screenwriter && (
                      <p className="text-sm font-serif italic text-amber-800/40 mt-0.5">
                        编剧: {selectedItem.screenwriter}
                      </p>
                    )}
                    {selectedItem.translator && (
                      <p className="text-sm font-serif italic text-amber-800/40 mt-0.5">
                        译者: {selectedItem.translator}
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-amber-900/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-amber-900/40" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-auto custom-scrollbar mb-8 flex flex-col gap-4">
                  <div className="text-amber-900/70 leading-relaxed text-sm font-serif whitespace-pre-wrap">
                    {selectedItem.description}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setShowThoughtsFor(selectedItem)}
                    className="w-full py-4 bg-amber-50 text-amber-900 border border-amber-900/10 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-amber-100 transition-all shadow-sm active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>喃喃自语</span>
                  </button>
                  <div className="flex gap-4">
                    {selectedItem.url && (
                      <a 
                        href={selectedItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-amber-900 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-amber-800 transition-all shadow-xl active:scale-95"
                      >
                        <span>查看详情</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button 
                      onClick={() => setShowReviewsFor(selectedItem)}
                      className="w-14 h-14 rounded-2xl border-2 border-amber-100 text-amber-200 hover:bg-amber-50 transition-all flex items-center justify-center shrink-0"
                    >
                      <PenLine className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showReviewsFor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReviewsFor(null)}
          >
            <motion.div
              className="bg-[#fdfbf7] w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-amber-900/10 flex justify-between items-center bg-[#fdfbf7] shrink-0">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-amber-950">{showReviewsFor.title} - 观后感</h2>
                  <p className="text-xs text-amber-800/60 font-serif italic">Community Reviews & Notes</p>
                </div>
                <button onClick={() => setShowReviewsFor(null)} className="p-2 hover:bg-amber-900/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-amber-900/40" />
                </button>
              </div>

              {/* Reviews List */}
              <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-amber-900/5">
                {reviews.filter(r => r.mediaId === showReviewsFor.id).length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-amber-900/30 gap-2">
                    <MessageCircle className="w-12 h-12" />
                    <p className="text-sm font-serif">暂无观后感，来写下第一篇吧</p>
                  </div>
                ) : (
                  reviews.filter(r => r.mediaId === showReviewsFor.id).map((review, idx) => (
                    <div key={`${review.id}-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-amber-900/5 flex flex-col gap-4">
                      {/* User info & Delete */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full object-cover border border-amber-900/10" />
                          <div>
                            <p className="text-sm font-bold text-amber-950">{review.userName}</p>
                            <p className="text-[10px] text-amber-900/40">{review.createdAt}</p>
                          </div>
                        </div>
                        {review.isCurrentUser && (
                          <button 
                            onClick={() => {
                              const newReviews = reviews.filter(r => r.id !== review.id);
                              setReviews(newReviews);
                              socket.emit("update_reviews", newReviews);
                            }}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      {/* Content */}
                      <p className="text-sm text-amber-900/80 leading-relaxed whitespace-pre-wrap">{review.content}</p>
                      
                      {/* Image */}
                      {review.imageUrl && (
                        <img src={review.imageUrl} alt="Review attachment" className="rounded-xl max-h-80 object-cover border border-amber-900/10" />
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-3 border-t border-amber-900/5">
                        <button 
                          onClick={() => setActiveCommentReviewId(activeCommentReviewId === review.id ? null : review.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-900/60 hover:text-amber-900 transition-colors font-bold"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{review.comments.length} 评论</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {activeCommentReviewId === review.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col gap-3 pt-3 bg-amber-50/50 p-4 rounded-xl overflow-hidden"
                          >
                            {review.comments.map((comment, idx) => (
                              <div key={`${comment.id}-${idx}`} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-amber-950">{comment.userName}</span>
                                  <span className="text-[10px] text-amber-900/40">{comment.createdAt}</span>
                                </div>
                                <p className="text-xs text-amber-900/70">{comment.content}</p>
                              </div>
                            ))}
                            
                            {/* Add Comment */}
                            <div className="flex items-center gap-2 mt-2">
                              <input 
                                type="text" 
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="写下你的评论..."
                                className="flex-1 bg-white border border-amber-900/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-900/30 text-amber-950 placeholder:text-amber-900/30"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newCommentText.trim()) {
                                    const newComment = {
                                      id: crypto.randomUUID(),
                                      userName: userProfile.signature,
                                      content: newCommentText,
                                      createdAt: new Date().toISOString().split('T')[0]
                                    };
                                    const newReviews = reviews.map(r => r.id === review.id ? { ...r, comments: [...r.comments, newComment] } : r);
                                    setReviews(newReviews);
                                    socket.emit("update_reviews", newReviews);
                                    setNewCommentText('');
                                  }
                                }}
                              />
                              <button 
                                onClick={() => {
                                  if (!newCommentText.trim()) return;
                                  const newComment = {
                                    id: crypto.randomUUID(),
                                    userName: userProfile.signature,
                                    content: newCommentText,
                                    createdAt: new Date().toISOString().split('T')[0]
                                  };
                                  const newReviews = reviews.map(r => r.id === review.id ? { ...r, comments: [...r.comments, newComment] } : r);
                                  setReviews(newReviews);
                                  socket.emit("update_reviews", newReviews);
                                  setNewCommentText('');
                                }}
                                className="p-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review Input */}
              <div className="p-6 bg-[#fdfbf7] border-t border-amber-900/10 flex flex-col gap-3 shrink-0">
                {newReviewImage && (
                  <div className="relative w-24 h-24">
                    <img src={newReviewImage} alt="Upload preview" className="w-full h-full object-cover rounded-lg border border-amber-900/10" />
                    <button 
                      onClick={() => setNewReviewImage(null)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex items-stretch gap-3">
                  <div className="flex-1 flex flex-col gap-2 bg-white border border-amber-900/10 rounded-xl p-3 shadow-sm focus-within:border-amber-900/30 transition-colors">
                    <textarea 
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="分享你的观后感..."
                      className="w-full flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:text-amber-900/30 text-amber-950"
                    />
                    <div className="flex justify-between items-center">
                      <label className="cursor-pointer p-2 text-amber-900/40 hover:text-amber-900 hover:bg-amber-900/5 rounded-lg transition-colors">
                        <ImageIcon className="w-5 h-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 shrink-0">
                    <div className="flex flex-col items-center gap-2 p-2.5 bg-amber-900/5 rounded-2xl border border-amber-900/10 w-24">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-900/10 bg-white shrink-0 shadow-sm">
                        {userProfile.avatar ? (
                          <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-900/40">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-amber-950 truncate w-full text-center">{userProfile.signature}</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (!newReviewText.trim() && !newReviewImage) return;
                        const newReview: Review = {
                          id: crypto.randomUUID(),
                          mediaId: showReviewsFor.id,
                          isCurrentUser: true,
                          userName: userProfile.signature,
                          userAvatar: userProfile.avatar,
                          content: newReviewText,
                          imageUrl: newReviewImage || undefined,
                          createdAt: new Date().toISOString().split('T')[0],
                          comments: []
                        };
                        const newReviews = [newReview, ...reviews];
                        setReviews(newReviews);
                        socket.emit("update_reviews", newReviews);
                        setNewReviewText('');
                        setNewReviewImage(null);
                      }}
                      className="h-12 px-6 bg-amber-900 text-white rounded-xl font-bold text-sm hover:bg-amber-800 transition-all flex items-center gap-2 shadow-md active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>发布</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showThoughtsFor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowThoughtsFor(null)}
          >
            <motion.div
              className="bg-[#fdfbf7] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-amber-900/10 flex justify-between items-center bg-[#fdfbf7] shrink-0">
                <span className="font-serif font-bold text-amber-950 text-lg">喃喃自语</span>
                <button onClick={() => setShowThoughtsFor(null)} className="p-2 hover:bg-amber-900/5 rounded-full transition-colors">
                  <X className="w-6 h-6 text-amber-900/40" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto bg-[#fdfbf7]">
                <div className="p-6">
                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-900/10 shadow-sm">
                        <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260329125909_133_129-imagetourl.cloud-1774956795081-lwdbks.jpg" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px] text-amber-900">无棘莺落</span>
                        <span className="text-xs text-amber-900/40">{getThoughtsContent(showThoughtsFor.id).date}</span>
                      </div>
                    </div>
                    <button className="w-16 h-8 rounded-full border border-amber-600 text-amber-600 flex items-center justify-center gap-1 text-xs font-bold hover:bg-amber-600/10 transition-colors">
                      <Plus className="w-3 h-3" />
                      关注
                    </button>
                  </div>

                  {/* Text Content */}
                  <div className="mb-6 relative">
                    <img 
                      src={getThoughtsContent(showThoughtsFor.id).mainImage} 
                      alt="Thoughts" 
                      className="w-full h-auto rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className={showThoughtsFor.id === '1' ? "absolute bottom-2 left-1/2 -translate-x-1/2" : "absolute bottom-2 right-2"}>
                      <span className={showThoughtsFor.id === '1' ? "text-[6px] text-gray-300/90 bg-black/20 px-1 py-0 rounded-sm backdrop-blur-[2px] tracking-tighter scale-y-75 inline-block" : "text-[7px] text-white/60 bg-black/20 px-1.5 py-0 rounded-sm backdrop-blur-[2px] tracking-tighter scale-y-90 inline-block"}>@无棘莺落</span>
                    </div>
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {getThoughtsContent(showThoughtsFor.id).images.map((imgUrl, index) => (
                      <div 
                        key={index} 
                        className="aspect-square rounded-xl overflow-hidden border border-amber-900/10 shadow-sm relative cursor-pointer group"
                        onClick={() => setFullscreenImage(imgUrl)}
                      >
                        <img src={imgUrl} alt={`Image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" referrerPolicy="no-referrer" />
                        <div className={showThoughtsFor.id === '1' ? "absolute bottom-1 left-1/2 -translate-x-1/2" : "absolute bottom-1 right-1"}>
                          <span className={showThoughtsFor.id === '1' ? "text-[6px] text-gray-300/90 bg-black/20 px-1 py-0 rounded-sm backdrop-blur-[2px] tracking-tighter scale-y-75 inline-block" : "text-[7px] text-white/60 bg-black/20 px-1.5 py-0 rounded-sm backdrop-blur-[2px] tracking-tighter scale-y-90 inline-block"}>@无棘莺落</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {thoughtsComments.length > 0 && (
                <div className="bg-[#fdfbf7] border-t border-amber-900/10 p-6 shrink-0 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-bold text-amber-950 mb-4">评论 ({thoughtsComments.length})</h4>
                  <div className="space-y-4">
                    {thoughtsComments.map((comment, idx) => (
                      <div key={`${comment.id}-${idx}`} className="flex gap-3 group">
                        <img src={comment.avatar} alt={comment.name} className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-amber-900">{comment.name}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {comment.name === userProfile.signature && (
                                <button 
                                  onClick={() => {
                                    const newComments = thoughtsComments.filter(c => c.id !== comment.id);
                                    setThoughtsComments(newComments);
                                    socket.emit("update_thoughts_comments", newComments);
                                  }}
                                  className="text-red-500/70 hover:text-red-500 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-amber-950/80 mt-1">{comment.content}</p>
                          <span className="text-[10px] text-amber-900/40 mt-1 block">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {isCommentingThoughts && (
                <div className="bg-[#fdfbf7] border-t border-amber-900/10 p-4 shrink-0">
                  <div className="flex gap-3">
                    <img src={userProfile.avatar} alt="User" className="w-8 h-8 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        value={thoughtsCommentValue}
                        onChange={(e) => setThoughtsCommentValue(e.target.value)}
                        placeholder="写下你的评论..."
                        className="w-full bg-white border border-amber-900/20 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-900/20 resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsCommentingThoughts(false)}
                          className="px-4 py-1.5 rounded-full text-xs font-medium text-amber-900/60 hover:bg-amber-900/5 transition-colors"
                        >
                          取消
                        </button>
                        <button 
                          onClick={() => {
                            if (!thoughtsCommentValue.trim()) return;
                            const newComment = {
                              id: crypto.randomUUID(),
                              name: userProfile.signature,
                              avatar: userProfile.avatar,
                              content: thoughtsCommentValue,
                              timestamp: Date.now()
                            };
                            const newComments = [newComment, ...thoughtsComments];
                            setThoughtsComments(newComments);
                            socket.emit("update_thoughts_comments", newComments);
                            setThoughtsCommentValue("");
                            setIsCommentingThoughts(false);
                          }}
                          className="px-4 py-1.5 rounded-full text-xs font-medium bg-amber-900 text-white hover:bg-amber-800 transition-colors"
                        >
                          发送
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="bg-[#fdfbf7] border-t border-amber-900/10 flex items-center h-14 shrink-0">
                <div className="flex-1 flex items-center justify-center gap-2 text-amber-900/50 hover:text-amber-900 cursor-pointer transition-colors border-r border-amber-900/10">
                  <Repeat className="w-5 h-5" />
                  <span className="text-sm font-medium">转发</span>
                </div>
                <div 
                  className="flex-1 flex items-center justify-center gap-2 text-amber-900/50 hover:text-amber-900 cursor-pointer transition-colors border-r border-amber-900/10"
                  onClick={() => setIsCommentingThoughts(!isCommentingThoughts)}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">评论 {thoughtsComments.length > 0 && `(${thoughtsComments.length})`}</span>
                </div>
                <div 
                  className={`flex-1 flex items-center justify-center gap-2 cursor-pointer transition-colors ${thoughtsLikes.includes(userProfile.signature) ? 'text-amber-600' : 'text-amber-900/50 hover:text-amber-900'}`}
                  onClick={() => {
                    let newLikes;
                    if (thoughtsLikes.includes(userProfile.signature)) {
                      newLikes = thoughtsLikes.filter(name => name !== userProfile.signature);
                    } else {
                      newLikes = [...thoughtsLikes, userProfile.signature];
                    }
                    setThoughtsLikes(newLikes);
                    socket.emit("update_thoughts_likes", newLikes);
                  }}
                >
                  <ThumbsUp className={`w-5 h-5 ${thoughtsLikes.includes(userProfile.signature) ? 'fill-amber-600' : ''}`} />
                  <span className="text-sm font-medium">赞 {thoughtsLikes.length > 0 && `(${thoughtsLikes.length})`}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out"
            onClick={() => setFullscreenImage(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImage(null);
              }}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
            <div className={showThoughtsFor?.id === '1' ? "absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none" : "absolute bottom-8 right-8 pointer-events-none"}>
              <span className={showThoughtsFor?.id === '1' ? "text-[6px] text-gray-300/80 bg-black/30 px-1.5 py-0.5 rounded-sm backdrop-blur-sm tracking-tighter scale-y-75 inline-block" : "text-[7px] text-white/40 bg-black/30 px-2 py-0.5 rounded-sm backdrop-blur-sm tracking-tighter scale-y-90 inline-block"}>@无棘莺落</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
