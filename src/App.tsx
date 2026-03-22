import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'motion/react';
import { User, Music, Coffee, Lightbulb, X, Minus, Maximize2, Wifi, Battery, Search, ChevronRight, Upload, Check, GripVertical, Lock, Unlock, Palette, Type, Bell, ListMusic, ThumbsUp, Repeat, MessageSquare } from 'lucide-react';
import * as mm from 'music-metadata-browser';

// --- Components ---

const TopBar = () => {
  const [time, setTime] = useState(new Date());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);

  const handleMenuClick = (e: React.MouseEvent, menu: string) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (activeMenu && activeMenu !== menu) {
      setActiveMenu(menu);
    }
  };

  const menuItems = {
    'apple': ['关于本机', '系统设置...', 'App Store...', '睡眠', '重新启动...', '关机...'],
    'Island': ['关于 Island', '偏好设置...', '清空废纸篓'],
    '文件': ['新建窗口', '新建标签页', '打开...', '关闭窗口'],
    '编辑': ['撤销', '重做', '剪切', '复制', '粘贴'],
    '显示': ['作为图标', '作为列表', '作为分栏', '进入全屏'],
    '前往': ['返回', '前进', '上层文件夹', '桌面', '下载'],
    '窗口': ['最小化', '缩放', '将窗口移到屏幕左侧', '将窗口移到屏幕右侧'],
    '帮助': ['Island 帮助', 'macOS 帮助']
  };

  return (
    <div className="h-7 w-full bg-black/20 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 text-xs font-medium text-white z-50 fixed top-0 select-none">
      <div className="flex items-center h-full -ml-2">
        {/* Wind Chime Icon */}
        <div 
          className={`h-full px-3 flex items-center cursor-default relative ${activeMenu === 'apple' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          onClick={(e) => handleMenuClick(e, 'apple')}
          onMouseEnter={() => handleMenuHover('apple')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 2v4" />
            <path d="M8 6h8" />
            <path d="M9 6v8" />
            <path d="M12 6v12" />
            <path d="M15 6v10" />
            <circle cx="12" cy="20" r="2" />
          </svg>
          {activeMenu === 'apple' && (
            <div className="absolute top-full left-0 mt-0 w-56 bg-white/80 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-b-lg py-1.5 text-gray-800 font-normal">
              {menuItems['apple'].map((item, i) => (
                <div key={i} className="px-4 py-1 hover:bg-blue-500 hover:text-white cursor-default text-[13px]">{item}</div>
              ))}
            </div>
          )}
        </div>

        {/* Other Menus */}
        {['Island', '文件', '编辑', '显示', '前往', '窗口', '帮助'].map((menu) => (
          <div 
            key={menu}
            className={`h-full px-3 flex items-center cursor-default relative ${activeMenu === menu ? 'bg-white/20' : 'hover:bg-white/10'} ${menu === 'Island' ? 'font-bold' : ''}`}
            onClick={(e) => handleMenuClick(e, menu)}
            onMouseEnter={() => handleMenuHover(menu)}
          >
            {menu}
            {activeMenu === menu && (
              <div className="absolute top-full left-0 mt-0 w-56 bg-white/80 backdrop-blur-3xl border border-white/40 shadow-2xl rounded-b-lg py-1.5 text-gray-800 font-normal">
                {menuItems[menu as keyof typeof menuItems].map((item, i) => (
                  <div key={i} className="px-4 py-1 hover:bg-blue-500 hover:text-white cursor-default text-[13px]">{item}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Wifi className="w-3.5 h-3.5 cursor-pointer hover:text-white/80" />
        <Search className="w-3.5 h-3.5 cursor-pointer hover:text-white/80" />
        <Battery className="w-4 h-4 cursor-pointer hover:text-white/80" />
        <span className="cursor-pointer hover:text-white/80">
          {time.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const AboutContent = () => (
  <div className="flex h-full bg-white/60 backdrop-blur-3xl">
    <div className="w-48 bg-white/40 border-r border-black/5 p-4 flex flex-col gap-2 hidden sm:flex">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">个人资料</div>
      <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-500/10 text-blue-600 rounded-md cursor-pointer">
        <User className="w-4 h-4" />
        <span className="text-sm font-medium">基本信息</span>
      </div>
      <div className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:bg-black/5 rounded-md cursor-pointer">
        <Lightbulb className="w-4 h-4" />
        <span className="text-sm font-medium">技能栈</span>
      </div>
    </div>
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 p-1 shadow-lg shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">你好，我是开发者</h1>
            <p className="text-gray-500 mt-2 text-lg">前端工程师 / 设计爱好者 / 终身学习者</p>
          </div>
        </div>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <p className="text-lg">欢迎来到我的个人数字空间。这里不仅是我的作品集，更是我记录生活、分享灵感的地方。我致力于创造美观、易用且充满细节的数字体验。</p>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">核心技能</h2>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Framer Motion', 'UI/UX Design'].map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NetEaseEventContent = ({ onBack }: { onBack: () => void }) => (
  <div className="h-full w-full bg-[#f5f5f5] p-6 overflow-auto">
    <button onClick={onBack} className="mb-6 px-4 py-2 bg-white/50 hover:bg-white backdrop-blur-sm rounded-full text-sm text-gray-700 hover:text-gray-900 flex items-center gap-2 transition-all shadow-sm border border-gray-200/50">
      <ChevronRight className="w-4 h-4 rotate-180" /> 返回音乐库
    </button>
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8">
      <div 
        className="relative flex items-center gap-5 p-6 border border-gray-200 rounded-2xl mb-12 overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center blur-[2px] brightness-90"
          style={{ backgroundImage: "url('https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222156_23_569-imagetourl.cloud-1774191915118-6ywdlv.png')" }}
        />
        <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg" alt="Profile" className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
        <div className="relative p-3">
          <h2 className="text-3xl font-bold text-white drop-shadow-md">NotANumberO_</h2>
          <p className="text-white text-sm mt-1 font-medium drop-shadow-md">动态 5</p>
        </div>
      </div>
      <div className="space-y-10">
        {[
          { text: "", song: "i'm sorry", artist: "Versutus", date: "02-28", cover: "https://picsum.photos/seed/song1/100/100" },
          { text: "永恒序曲。Fix On。又一次的循环中，依旧动容。", song: "Tunnel", artist: "宋旼琦", date: "2025-10-19", cover: "https://picsum.photos/seed/song2/100/100" },
          { text: "一些伤痛正在被抚平，那些无畏并不需要有解的时刻得到了远方的宽慰。", song: "年少的我们永远轻狂", artist: "Crispy脆乐团", date: "2024-04-15", cover: "https://picsum.photos/seed/song3/100/100" },
          { text: "百转千回，一梦华胥。", song: "潮汐池 feat.丁文斌 of Foget And For...", artist: "Nerve Passenger (神经旅人) /Forget And Forgive", date: "2023-08-06", cover: "https://picsum.photos/seed/song4/100/100" },
          { text: "轻盈又笨重地驶向遥远的天际。", song: "轻轨", artist: "液蓝BLUE LIQUID", date: "2023-05-03", cover: "https://picsum.photos/seed/song5/100/100" }
        ].map((event, i) => (
          <div key={i} className="flex gap-4 pb-8 border-b border-gray-100 last:border-0">
            <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg" alt="Avatar" className="w-12 h-12 rounded-full mt-1" referrerPolicy="no-referrer" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-bold text-blue-800 text-sm">NotANumberO_</div>
                <div className="text-gray-400 text-xs">{event.date}</div>
              </div>
              {event.text && <div className="text-gray-800 mt-3 text-sm leading-relaxed">{event.text}</div>}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                <img src={event.cover} alt="Cover" className="w-14 h-14 bg-gray-300 rounded-lg shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{event.song}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">{event.artist}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-8 text-gray-500 text-xs">
                <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> 点赞
                </button>
                <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                  <Repeat className="w-4 h-4" /> 分享
                </button>
                <button className="flex items-center gap-1.5 hover:text-gray-800 transition-colors">
                  <MessageSquare className="w-4 h-4" /> 评论
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MusicContent = () => {
  const [view, setView] = useState<'library' | 'events'>('library');

  if (view === 'events') {
    return <NetEaseEventContent onBack={() => setView('library')} />;
  }

  return (
    <div className="flex h-full bg-cover bg-center" style={{ backgroundImage: "url('https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222331_27_569-imagetourl.cloud-1774189630093-kxesm1.png')" }}>
      <div className="flex h-full w-full bg-white/60 backdrop-blur-3xl">
        <div className="w-48 bg-white/40 border-r border-black/5 p-4 flex flex-col gap-2 hidden sm:flex">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">音乐库</div>
          
          {/* NetEase Cloud Music-style profile */}
          <div className="p-3 bg-white/50 rounded-xl border border-black/5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774189629541-pgaabi.jpg" alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
              <div className="overflow-hidden">
                <div className="font-bold text-[10px] text-gray-800 truncate">NotANumberO_</div>
                <div className="text-[10px] text-red-500 font-medium bg-red-100 px-1 py-0 rounded-full inline-block mt-0.5">Lv. 8</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-600 mb-3 px-1 truncate">
              时间是带走我的河流。
            </div>
            <button 
              onClick={() => setView('events')}
              className="w-full py-1 text-[10px] text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              Much More
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-pink-500/10 text-pink-600 rounded-md cursor-pointer">
              <Music className="w-4 h-4" />
              <span className="text-sm font-medium">LOVE Songs</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:bg-black/5 rounded-md cursor-pointer">
              <Coffee className="w-4 h-4" />
              <span className="text-sm font-medium">最最</span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">最近在听</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white/50 rounded-xl shadow-sm hover:shadow-md hover:bg-white/80 transition-all cursor-pointer group border border-white/40">
                <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm relative shrink-0">
                  <img src={`https://picsum.photos/seed/album${i}/200/200`} alt="Album cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 line-clamp-1">氛围音乐合集 {i}</h3>
                  <p className="text-sm text-gray-500">独立音乐人</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const LifeContent = () => (
  <div className="h-full bg-white/60 backdrop-blur-3xl p-8 overflow-auto">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">生活碎片</h1>
      
      {/* Folder Sections */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        {[
          { name: '日记簿', icon: '📖' },
          { name: '影音集', icon: '🎬' },
          { name: 'photo', icon: '📸' }
        ].map((folder) => (
          <div key={folder.name} className="flex flex-col items-center gap-3 p-6 bg-white/70 rounded-2xl border border-white/40 shadow-sm hover:shadow-md hover:bg-white/90 transition-all cursor-pointer group">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{folder.icon}</div>
            <span className="text-sm font-semibold text-gray-700">{folder.name}</span>
          </div>
        ))}
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => {
          const height = i % 3 === 0 ? 'h-80' : i % 2 === 0 ? 'h-64' : 'h-48';
          return (
            <div key={i} className="break-inside-avoid bg-white/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-white/40 group cursor-pointer">
              <div className={`w-full ${height} relative overflow-hidden`}>
                <img src={`https://picsum.photos/seed/life${i}/600/800`} alt="Life moment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <div className="p-4">
                <p className="text-gray-700 text-sm font-medium">记录生活的美好瞬间，发现平凡中的不平凡。</p>
                <p className="text-gray-400 text-xs mt-2 font-mono">2026.03.{10 + i}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const PortfolioContent = () => (
  <div className="h-full bg-white/60 backdrop-blur-3xl p-8 overflow-auto">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">创意集</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="group cursor-pointer bg-white/50 rounded-2xl p-4 border border-white/40 hover:bg-white/80 hover:shadow-xl transition-all duration-300">
            <div className="w-full h-56 rounded-xl mb-4 overflow-hidden relative">
              <img src={`https://picsum.photos/seed/project${i}/800/600`} alt="Project" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-medium px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm">查看详情</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">交互设计探索 #{i}</h3>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">这是一个关于探索未知与创新的设计项目，结合了最新的前端技术与交互理念，旨在提供极致的用户体验。</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const QLinkAContent = () => {
  const [loading, setLoading] = useState(true);
  const externalUrl = "https://www.brothergo.com//vwkqjb/web?t=1774106443";
  
  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative bg-[#0f172a]">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/95 backdrop-blur-3xl z-20">
          {/* Rainy Day Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i}
                className="absolute bg-gradient-to-b from-transparent via-blue-400/40 to-blue-200/60 w-[1.5px] h-10 rounded-full animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 40}%`,
                  animationDuration: `${0.25 + Math.random() * 0.25}s`,
                  animationDelay: `${Math.random() * 4}s`,
                  opacity: 0.3 + Math.random() * 0.6
                }}
              />
            ))}
          </div>

          <div className="flex flex-col items-center gap-12 z-30">
            <motion.div 
              animate={{ 
                y: [0, -35, 0],
                rotate: [0, -12, 12, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-28 h-28 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/10" />
              <span className="text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] z-10">✉️</span>
              
              {/* Rain splash effect on the envelope container */}
              <motion.div 
                animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="absolute inset-0 border-2 border-blue-400/20 rounded-[2.5rem]"
              />
            </motion.div>
            
            <div className="flex flex-col items-center gap-5">
              <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                <span className="text-[9px] font-black text-blue-300 uppercase tracking-[0.8em] animate-pulse">
                  Rainy Delivery
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 
        Ultimate fix for the "Create" button overlap in small windows:
        1. We use a very large height (2000px) to push the external site's fixed footer away.
        2. We wrap it in a container that handles scrolling.
        3. We add a large bottom padding (pb-40) to the scrollable area to ensure 
           the user can scroll well past any potential fixed elements.
      */}
      <div className="flex-1 w-full h-full bg-white overflow-y-auto scrollbar-hide">
        <div className="w-full flex flex-col min-h-full">
          <div className="w-full" style={{ height: '2000px' }}>
            <iframe 
              src={externalUrl} 
              className="w-full h-full border-none"
              title="Q-LINK-A External"
              allow="camera; microphone; geolocation"
              onLoad={() => setLoading(false)}
            />
          </div>
          {/* Extra safe space at the bottom to ensure the "Create" button is never obscured */}
          <div className="h-40 w-full bg-white border-t border-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 opacity-20">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">End of Content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Window = ({ app, isOpen, isMaximized, zIndex, onClose, onMaximize, onFocus }: any) => {
  const [isDragging, setIsDragging] = useState(false);
  if (!isOpen) return null;

  return (
    <motion.div
      drag={!isMaximized}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        width: isMaximized ? '100vw' : Math.min(app.defaultWidth || 850, window.innerWidth - 40),
        height: isMaximized ? 'calc(100vh - 28px)' : Math.min(app.defaultHeight || 550, window.innerHeight - 100),
        x: isMaximized ? 0 : undefined,
        y: isMaximized ? 28 : undefined,
        top: isMaximized ? 0 : '10%',
        left: isMaximized ? 0 : '10%',
      }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onPointerDown={onFocus}
      style={{ zIndex, position: 'absolute' }}
      className={`bg-white/70 backdrop-blur-2xl shadow-2xl border border-white/40 overflow-hidden flex flex-col ${isMaximized ? 'rounded-none border-none' : 'rounded-2xl'}`}
    >
      {/* Title Bar */}
      <div className="h-12 bg-gradient-to-b from-white/60 to-white/30 border-b border-black/5 flex items-center px-4 select-none cursor-grab active:cursor-grabbing shrink-0">
        <div className="flex gap-2 w-20">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center group">
            <X className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center group">
            <Minus className="w-2.5 h-2.5 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMaximize(); }} className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center group">
            <Maximize2 className="w-2 h-2 text-black/50 opacity-0 group-hover:opacity-100" />
          </button>
        </div>
        <div className="flex-1 text-center font-medium text-sm text-gray-700">
          {app.title}
        </div>
        <div className="w-20"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden relative cursor-default">
        {app.content}
        {isDragging && <div className="absolute inset-0 z-50 bg-transparent" />}
      </div>
    </motion.div>
  );
};

const APPS = [
  {
    id: 'qlinka',
    title: 'Q-LINK-A',
    icon: (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 bg-[#0f172a] rounded-xl flex items-center justify-center overflow-hidden relative">
          <span className="text-2xl z-10">✉️</span>
        </div>
      </div>
    ),
    color: 'bg-[#0f172a]',
    content: <QLinkAContent />,
    defaultWidth: 400,
    defaultHeight: 650
  },
  {
    id: 'about',
    title: '关于我',
    icon: <User className="w-8 h-8 text-white" strokeWidth={1.5} />,
    color: 'bg-gradient-to-b from-[#4facfe] to-[#00f2fe]',
    content: <AboutContent />
  },
  {
    id: 'music',
    title: '还有音乐',
    icon: <Music className="w-8 h-8 text-white" strokeWidth={1.5} />,
    color: 'bg-gradient-to-b from-[#ff0844] to-[#ffb199]',
    content: <MusicContent />
  },
  {
    id: 'life',
    title: '还有生活',
    icon: <Coffee className="w-8 h-8 text-white" strokeWidth={1.5} />,
    color: 'bg-gradient-to-b from-[#f6d365] to-[#fda085]',
    content: <LifeContent />
  },
  {
    id: 'portfolio',
    title: '创意集',
    icon: <Lightbulb className="w-8 h-8 text-white" strokeWidth={1.5} />,
    color: 'bg-gradient-to-b from-[#a18cd1] to-[#fbc2eb]',
    content: <PortfolioContent />
  }
];

const DesktopIcon = ({ app, onClick }: any) => {
  return (
    <div 
      className="flex flex-col items-center gap-1.5 w-24 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className={`w-16 h-16 rounded-[22%] shadow-lg flex items-center justify-center ${app.color} group-hover:scale-105 transition-transform duration-200 border border-white/20`}>
        {app.icon}
      </div>
      <span className="text-white text-xs font-medium text-center drop-shadow-md px-1.5 py-0.5 bg-black/20 rounded-md backdrop-blur-sm">
        {app.title}
      </span>
    </div>
  );
};

const HEALING_QUOTES = [
  { text: "不要因为今天的不堪，就对明天失去希望。", from: "《虽然想死，但还是想吃辣炒年糕》" },
  { text: "你不需要成为任何人，做那个最真实的自己就已经足够闪耀了。", from: "《决定以我自己的方式度过一生》" },
  { text: "即使是微不足道的日常，也值得被温柔以待。", from: "《语言的温度》" },
  { text: "允许自己偶尔停下脚步，感受风的温度和云的形状。", from: "《今天也要用心过生活》" },
  { text: "把所有的不期而遇，都当作是生活赠予的温柔礼物。", from: "《愿你按自己的意愿过一生》" },
  { text: "在疲惫的日子里，也要记得给自己买一束花，拥抱一下自己。", from: "《我决定活得像我》" },
  { text: "那些看似没有意义的时光，其实都在默默滋养着你的灵魂。", from: "《时间会证明一切》" },
  { text: "无论世界多么喧嚣，请在内心为自己保留一片安静的角落。", from: "《静下心来找回自己》" },
  { text: "今天也辛苦了，好好睡一觉，明天又是崭新且充满希望的一天。", from: "《晚安，我的宇宙》" },
  { text: "去爱那些能让你变得柔软的事物，去靠近那些给你带来光的人。", from: "《你的夏天还好吗》" }
];

type PlayerState = {
  isPlaying: boolean;
  currentTime: number;
  songName: string;
  cover: string | null;
  lyrics: { time: number; text: string }[];
  togglePlay?: () => void;
};

let globalPlayerState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  songName: "BLAME ON ME",
  cover: "https://p2.music.126.net/hBfYXsGBIf0JoCn8c61cQQ==/109951172092165022.jpg",
  lyrics: []
};

const playerListeners = new Set<() => void>();

export const usePlayerStore = () => {
  const [state, setState] = useState(globalPlayerState);
  useEffect(() => {
    const listener = () => setState(globalPlayerState);
    playerListeners.add(listener);
    return () => {
      playerListeners.delete(listener);
    };
  }, []);
  return state;
};

export const updatePlayerStore = (partial: Partial<PlayerState>) => {
  globalPlayerState = { ...globalPlayerState, ...partial };
  playerListeners.forEach(l => l());
};

const THEMES = [
  { id: 'default', bg: 'bg-white/10', text: 'text-white', iconBg: 'bg-white/20', iconHover: 'hover:bg-white/30' },
  { id: 'black', bg: 'bg-black/70', text: 'text-white', iconBg: 'bg-white/20', iconHover: 'hover:bg-white/30' },
  { id: 'blue', bg: 'bg-blue-200/70', text: 'text-blue-900', iconBg: 'bg-blue-900/10', iconHover: 'hover:bg-blue-900/20' },
  { id: 'pink', bg: 'bg-pink-200/70', text: 'text-pink-900', iconBg: 'bg-pink-900/10', iconHover: 'hover:bg-pink-900/20' },
  { id: 'green', bg: 'bg-green-200/70', text: 'text-green-900', iconBg: 'bg-green-900/10', iconHover: 'hover:bg-green-900/20' },
];

const DynamicIsland = ({ hasOpenWindows }: { hasOpenWindows?: boolean }) => {
  const { isPlaying, currentTime, songName, lyrics, togglePlay } = usePlayerStore();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [themeIndex, setThemeIndex] = useState(0);
  const [lyricSize, setLyricSize] = useState(16);
  const [tempLyricSize, setTempLyricSize] = useState(16);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const currentTheme = THEMES[themeIndex];
  const displayLyricSize = hasOpenWindows ? lyricSize : 16;

  useEffect(() => {
    if (isPlaying) {
      setIsDismissed(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!hasOpenWindows) {
      setIsLocked(true);
      setThemeIndex(0);
      animate(x, 0, { type: "spring", stiffness: 200, damping: 20 });
      animate(y, 0, { type: "spring", stiffness: 200, damping: 20 });
    } else {
      setThemeIndex((prev) => prev === 0 ? 1 : prev);
    }
  }, [hasOpenWindows]);

  const currentLyricIndex = lyrics.findIndex((lyric, index) => {
    const nextLyric = lyrics[index + 1];
    return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
  });
  const activeIndex = currentLyricIndex !== -1 ? currentLyricIndex : 0;
  const currentLyric = lyrics[activeIndex]?.text || "";

  const showIsland = (isPlaying || currentTime > 0) && !isDismissed;

  return (
    <>
      <AnimatePresence>
        {showIsland && (
          <motion.div 
            layout
            style={{ x, y, borderRadius: 9999 }}
            drag={hasOpenWindows && !isLocked}
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.2}
            dragMomentum={true}
            initial={{ y: -20, opacity: 0, filter: "blur(10px)", scale: 0.9 }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ y: -20, opacity: 0, filter: "blur(10px)", scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-12 left-16 z-[9999]"
          >
            <motion.div 
              layout
              className={`${currentTheme.bg} backdrop-blur-md ${currentTheme.text} rounded-full flex items-center justify-center h-10 px-4 py-1 shadow-lg min-w-[120px] max-w-[400px] transition-colors duration-500`}
            >
              
              {/* Drag Handle */}
              <AnimatePresence>
                {hasOpenWindows && !isLocked && (
                  <motion.div 
                    layout
                    initial={{ width: 0, opacity: 0, scale: 0.8 }}
                    animate={{ width: "auto", opacity: 1, scale: 1 }}
                    exit={{ width: 0, opacity: 0, scale: 0.8 }}
                    className="flex items-center shrink-0 overflow-hidden"
                  >
                    <div 
                      className={`mr-2 cursor-grab active:cursor-grabbing opacity-50 hover:opacity-100 transition-opacity`}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dragControls.start(e);
                      }}
                      title="拖拽移动"
                    >
                      <GripVertical size={14} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls */}
              <AnimatePresence>
                {hasOpenWindows && (
                  <motion.div
                    layout
                    initial={{ width: 0, opacity: 0, scale: 0.8 }}
                    animate={{ width: "auto", opacity: 1, scale: 1 }}
                    exit={{ width: 0, opacity: 0, scale: 0.8 }}
                    className="flex items-center shrink-0 overflow-hidden"
                  >
                    {/* Lock/Unlock Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); if (isLocked) setIsLocked(false); }}
                      onDoubleClick={(e) => { e.stopPropagation(); if (!isLocked) setIsLocked(true); }}
                      className={`mr-2 w-6 h-6 rounded-full ${currentTheme.iconBg} flex items-center justify-center ${currentTheme.iconHover} transition-colors shrink-0 cursor-pointer`}
                      title={isLocked ? "已锁定 (单击解锁)" : "已解锁 (双击锁定)"}
                    >
                      {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setThemeIndex((prev) => (prev + 1) % THEMES.length); }}
                      className={`mr-2 w-6 h-6 rounded-full ${currentTheme.iconBg} flex items-center justify-center ${currentTheme.iconHover} transition-colors shrink-0 cursor-pointer`}
                      title="切换主题颜色"
                    >
                      <Palette size={12} />
                    </button>

                    {/* Size Toggle */}
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setTempLyricSize(lyricSize);
                        setIsSizeModalOpen(true); 
                      }}
                      className={`mr-3 w-6 h-6 rounded-full ${currentTheme.iconBg} flex items-center justify-center ${currentTheme.iconHover} transition-colors shrink-0 cursor-pointer`}
                      title="调整歌词大小"
                    >
                      <Type size={12} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Play/Pause & Dismiss */}
              <motion.button 
                layout
                onClick={(e) => { e.stopPropagation(); togglePlay?.(); }}
                onDoubleClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                className={`mr-3 w-6 h-6 rounded-full ${currentTheme.iconBg} flex items-center justify-center ${currentTheme.iconHover} transition-colors shrink-0 cursor-pointer`}
                title="单击播放/暂停，双击隐藏"
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                )}
              </motion.button>

              {/* Lyrics */}
              <motion.div layout className="flex flex-col justify-center overflow-hidden whitespace-nowrap pr-2">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeIndex}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="font-medium drop-shadow-sm truncate tracking-wide transition-all duration-300"
                    style={{ fontSize: `${displayLyricSize}px` }}
                  >
                    {currentLyric || songName}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    {/* Size Modal */}
    <AnimatePresence>
      {isSizeModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/20 backdrop-blur-sm"
          onClick={() => setIsSizeModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl w-80 text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type size={18} />
              调整歌词大小
            </h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>小 (10px)</span>
                <span>当前: {tempLyricSize}px</span>
                <span>大 (24px)</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="24" 
                value={tempLyricSize}
                onChange={(e) => setTempLyricSize(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>

            <div className="mb-6 p-4 bg-black/5 rounded-xl flex items-center justify-center overflow-hidden">
               <span className="font-medium truncate" style={{ fontSize: `${tempLyricSize}px` }}>
                 {currentLyric || songName || "歌词预览"}
               </span>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsSizeModalOpen(false)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  setLyricSize(tempLyricSize);
                  setIsSizeModalOpen(false);
                }}
                className="px-4 py-2 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
              >
                确认
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

const LockScreenWidget = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="flex flex-col items-start text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] select-none pointer-events-none">
      <div className="text-2xl font-medium tracking-wider mb-[-10px] ml-2 opacity-90">{dateStr}</div>
      <div className="text-[120px] font-bold tracking-tighter leading-none" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {hours}:{minutes}
      </div>
    </div>
  );
};

const SONGS = [
  {
    name: "BLAME ON ME",
    singer: "Gummy B",
    cover: "https://p2.music.126.net/hBfYXsGBIf0JoCn8c61cQQ==/109951172092165022.jpg",
    src: "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy84M2MxZTEzYzA5OGQxODU2L0lRRFR6a0pONFN5cFFLbjBYVVFmYlhGbkFTblYxT1lWV1hLRVJFY2FOcVgxdDJrP2U9SnRsb09h.mp3",
    lyrics: [
      { time: 24.32, text: "I think it’s time" },
      { time: 27.14, text: "I think it’s time to say goodbye" },
      { time: 36.41, text: "愿你不再" },
      { time: 39.36, text: "愿你不再感到孤单" },
      { time: 47.82, text: "Blame on me" },
      { time: 50.18, text: "Put the blame on me" },
      { time: 52.15, text: "I will be fine" },
      { time: 58.10, text: "Just blame on me" },
      { time: 61.34, text: "Put the blame on me" },
      { time: 63.92, text: "我会习惯" },
      { time: 71.96, text: "若可以" },
      { time: 74.50, text: "我想离开这里" },
      { time: 76.36, text: "到一个 没人知道我的地方" },
      { time: 80.03, text: "随着时间 一切慢慢遗忘" },
      { time: 83.21, text: "若可以" },
      { time: 85.74, text: "请你 don’t worry about me" },
      { time: 89.52, text: "别来打探我的消息" },
      { time: 91.98, text: "或许有一天我会去找你" },
      { time: 117.22, text: "(Wait a minute)" },
      { time: 119.29, text: "(Wait a, wait a minute)" },
      { time: 122.83, text: "(Wait, wait, wait a minute)" },
      { time: 125.38, text: "(Wait, wait a)" },
      { time: 127.83, text: "(Wait, wait, wait, wait…)" },
      { time: 131.52, text: "(Wait a minute)" },
      { time: 135.02, text: "(Wait, wait, wait a minute)" },
      { time: 137.43, text: "(Wait, wait, wait, wait a minute)" },
      { time: 140.48, text: "(Wait, wait a)" },
      { time: 140.67, text: "(Wait, wait, wait, wait…)" },
      { time: 141.66, text: "Yeah I feel like Tony Stark and that’s my Ultron" },
      { time: 144.91, text: "My greatest creation 对我挥舞着刀枪" },
      { time: 147.88, text: "最大的敌人是我自己 该如何较量" },
      { time: 150.95, text: "但赢了这场战争谁会立我的雕像？" },
      { time: 153.76, text: "不愿伤及无辜 所以盖了座高墙" },
      { time: 156.73, text: "但还是挡不住 靠太近的都遭殃" },
      { time: 159.62, text: "So I ran away from ‘em 展开了逃亡" },
      { time: 162.65, text: "但不管跑往哪都始终关在这牢房" },
      { time: 165.65, text: "太过爱面子 太过现实 太过要强" },
      { time: 168.60, text: "太多怪点子 太过坚持 太多肖想" },
      { time: 171.63, text: "你说你哪首听到哭 shit 我不敢当" },
      { time: 174.52, text: "有多少坏的念头我是想都不敢想" },
      { time: 177.49, text: "我有了爱的人 爱教了我担当" },
      { time: 180.40, text: "去正视最真实的自己不再去官腔" },
      { time: 183.49, text: "虽然那些闪光依旧 make me dizzy" },
      { time: 186.47, text: "但我不能退下 还有人盼望能 see me" },
      { time: 189.39, text: "给我一点时间呼吸 一点时间准备" },
      { time: 192.73, text: "一点时间提醒 自己也是人类" },
      { time: 195.66, text: "一点都不在意 周遭人心的真伪" },
      { time: 198.59, text: "一年比一年卖力 为了无意的称谓" },
      { time: 201.60, text: "想起最一开始 那时多么纯粹" },
      { time: 204.59, text: "写满韵的白纸 耳机调高分贝" },
      { time: 207.53, text: "从来不是天才 配不上第一顺位" },
      { time: 210.44, text: "但感谢所有偏爱 我想你心领神会" },
      { time: 213.43, text: "Blame on me" },
      { time: 216.46, text: "Put the blame on me" },
      { time: 218.01, text: "I will be fine" },
      { time: 224.44, text: "Just blame on me" },
      { time: 227.88, text: "Put the blame on me" },
      { time: 229.83, text: "我会习惯" },
      { time: 237.10, text: "若可以" },
      { time: 239.87, text: "我想离开这里" },
      { time: 242.33, text: "到一个 没人知道我的地方" },
      { time: 246.02, text: "随着时间 一切慢慢遗忘" },
      { time: 248.92, text: "若可以" },
      { time: 251.69, text: "请你 don’t worry about me" },
      { time: 255.26, text: "别来打探我的消息" },
      { time: 257.96, text: "或许有一天我会去找你" },
      { time: 999, text: "" }
    ]
  },
  {
    name: "Tunnel",
    singer: "宋旼琦",
    cover: "https://p3.music.126.net/olf_R6JoatZc97VhVxQuhA==/109951172055224267.jpg",
    src: "https://m701.music.126.net/20260322214913/189fd9dbef3e2ce8d2ccc1df274c38b1/jdymusic/obj/wo3DlMOGwrbDjj7DisKw/62754213424/5c4e/1be3/0973/012f99a8853962e5bf42cf37d4426070.mp3",
    lyrics: [
      { time: 0, text: "正在获取歌词..." }
    ]
  }
];

const NansPlaylistWidget = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const currentSong = SONGS[currentSongIndex];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  
  const togglePlaylist = () => setIsPlaylistOpen(!isPlaylistOpen);
  
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  // When song changes, reset states
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentSongIndex]);

  const togglePlay = React.useCallback(async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.warn("播放尝试失败:", err);
        }
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    updatePlayerStore({ 
      isPlaying, 
      currentTime, 
      songName: currentSong.name, 
      cover: currentSong.cover, 
      lyrics: currentSong.lyrics, 
      togglePlay 
    });
  }, [isPlaying, currentTime, currentSong, togglePlay]);

  const currentLyricIndex = currentSong.lyrics.findIndex((lyric, index) => {
    const nextLyric = currentSong.lyrics[index + 1];
    return currentTime >= lyric.time && (!nextLyric || currentTime < nextLyric.time);
  });

  const activeIndex = currentLyricIndex !== -1 ? currentLyricIndex : 0;


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setSeekTime(time);
    if (!isSeeking) setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
    setIsSeeking(false);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setHasError(false);
    }
  };

  const handleAudioError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  return (
    <div className="w-[330px] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/20 bg-white/10 backdrop-blur-xl p-4 hover:bg-white/20 transition-all duration-300 group flex flex-col gap-3">
      {/* Playlist Modal */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-12 right-4 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 p-3 z-50 text-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">播放列表</h4>
              <button onClick={togglePlaylist} className="p-1 hover:bg-black/5 rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {SONGS.map((song, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setCurrentSongIndex(idx);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${idx === currentSongIndex ? 'bg-black/5' : 'hover:bg-black/5'}`}
                >
                  <img src={song.cover || undefined} alt="cover" className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{song.name}</div>
                    <div className="text-xs text-gray-500 truncate">{song.singer}</div>
                  </div>
                  {idx === currentSongIndex && (
                    <div className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded">播放中</div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-white/90" />
          <span className="text-xs font-bold text-white/90 tracking-wider">NAN's ♡ Playlist</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-95" title="提醒">
            <Bell className="w-3.5 h-3.5" />
          </button>
          <button onClick={togglePlaylist} className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-95" title="歌单播放列表">
            <ListMusic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        {/* Cover */}
        <div className={`w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-white/20 shrink-0 ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`} style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
          <img src={currentSong.cover || null} alt="cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>

        {/* Info & Lyrics */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="truncate text-sm font-bold text-white drop-shadow-md flex items-center gap-2">
            {currentSong.name}
            {hasError && <span className="text-[10px] bg-red-500/80 text-white px-1 rounded">ERROR</span>}
          </div>
          <div className="truncate text-xs text-white/70 mb-2">{currentSong.singer}</div>
          
          {/* Lyrics (2 lines) */}
          <div className="h-8 overflow-hidden relative" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}>
            <motion.div 
              className="absolute w-full flex flex-col gap-1"
              animate={{ y: -(activeIndex * 20) }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {currentSong.lyrics.map((lyric, idx) => (
                <div 
                  key={idx} 
                  className={`h-4 text-[11px] truncate transition-colors duration-300 ${idx === activeIndex ? 'text-white font-medium drop-shadow-md' : 'text-white/40'}`}
                  style={{ lineHeight: '16px' }}
                >
                  {lyric.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mt-1">
        <button 
          onClick={togglePlay} 
          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="h-1 w-full bg-white/10 rounded-full relative group/progress cursor-pointer">
            <input 
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={isSeeking ? seekTime : currentTime}
              onInput={handleSeek}
              onChange={handleSeekEnd}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div 
              className="absolute top-0 left-0 h-full bg-white/60 rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${((isSeeking ? seekTime : currentTime) / (duration || 1)) * 100}%` }}
            />
            {/* Knob visible on hover */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-all duration-200"
              style={{ 
                left: `${((isSeeking ? seekTime : currentTime) / (duration || 1)) * 100}%`,
                transform: `translate(-50%, -50%) scale(${isSeeking ? 1.2 : 1})`
              }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-white/40 font-mono">
            <span>{Math.floor((isSeeking ? seekTime : currentTime) / 60)}:{Math.floor((isSeeking ? seekTime : currentTime) % 60).toString().padStart(2, '0')}</span>
            <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentSong.src || null} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleAudioError}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
};

const GameControllerWidget = () => {
  const [showTranslation, setShowTranslation] = useState(false);

  return (
    <div className="w-[330px] h-20 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.15)] flex items-center justify-between px-8 relative overflow-hidden group hover:bg-white/10 transition-all duration-700">
      {/* Left Side: D-Pad */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* D-pad cross background glow */}
        <div className="absolute w-5 h-10 bg-white/5 rounded-full blur-[4px] group-hover:bg-white/10 transition-all"></div>
        <div className="absolute h-5 w-10 bg-white/5 rounded-full blur-[4px] group-hover:bg-white/10 transition-all"></div>
        
        <div className="z-10 grid grid-cols-3 grid-rows-3 gap-0.5">
          <div className="col-start-2 w-3.5 h-3.5 rounded-sm bg-white/20 shadow-inner flex items-center justify-center hover:bg-white/40 cursor-pointer transition-all active:scale-90">
            <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-b-[4px] border-b-white/60"></div>
          </div>
          <div className="row-start-2 col-start-1 w-3.5 h-3.5 rounded-sm bg-white/20 shadow-inner flex items-center justify-center hover:bg-white/40 cursor-pointer transition-all active:scale-90">
            <div className="w-0 h-0 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent border-r-[4px] border-r-white/60"></div>
          </div>
          <div className="row-start-2 col-start-2 w-3.5 h-3.5 bg-white/5 rounded-sm"></div>
          <div className="row-start-2 col-start-3 w-3.5 h-3.5 rounded-sm bg-white/20 shadow-inner flex items-center justify-center hover:bg-white/40 cursor-pointer transition-all active:scale-90">
            <div className="w-0 h-0 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent border-l-[4px] border-l-white/60"></div>
          </div>
          <div className="row-start-3 col-start-2 w-3.5 h-3.5 rounded-sm bg-white/20 shadow-inner flex items-center justify-center hover:bg-white/40 cursor-pointer transition-all active:scale-90">
            <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[2px] border-r-transparent border-t-[4px] border-t-white/60"></div>
          </div>
        </div>
      </div>

      {/* Middle: Select/Start & Status */}
      <div className="flex flex-col items-center justify-center relative flex-1">
        <div 
          className="relative cursor-pointer select-none min-h-[40px] flex items-center justify-center"
          onClick={() => setShowTranslation(!showTranslation)}
        >
          {/* Korean Text */}
          <div className={`flex flex-col items-center text-center transition-opacity duration-300 ${showTranslation ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-[16px] font-cute-ko text-white/70 leading-tight">삶에 정답은 없어.</div>
            <div className="text-[16px] font-cute-ko text-white/70 leading-tight">이제 그럼, 나가볼까？</div>
          </div>

          {/* Translation Overlay */}
          <AnimatePresence>
            {showTranslation && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center bg-transparent z-20"
              >
                <div className="text-[14px] font-cute-zh text-white/95 leading-tight whitespace-nowrap">人生没有正确答案。</div>
                <div className="text-[14px] font-cute-zh text-white/95 leading-tight whitespace-nowrap">那么现在，我们启程吗？</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side: Action Buttons */}
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5">
          <div className="col-start-2 w-3.5 h-3.5 rounded-full bg-white/10 shadow-md flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all hover:scale-110 active:scale-90 border border-white/5">
            <span className="text-[7px] font-bold text-white/40">Y</span>
          </div>
          <div className="row-start-2 col-start-1 w-3.5 h-3.5 rounded-full bg-white/10 shadow-md flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all hover:scale-110 active:scale-90 border border-white/5">
            <span className="text-[7px] font-bold text-white/40">X</span>
          </div>
          <div className="row-start-2 col-start-3 w-3.5 h-3.5 rounded-full bg-white/10 shadow-md flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all hover:scale-110 active:scale-90 border border-white/5">
            <span className="text-[7px] font-bold text-white/40">B</span>
          </div>
          <div className="row-start-3 col-start-2 w-3.5 h-3.5 rounded-full bg-white/10 shadow-md flex items-center justify-center hover:bg-white/30 cursor-pointer transition-all hover:scale-110 active:scale-90 border border-white/5">
            <span className="text-[7px] font-bold text-white/40">A</span>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
};

const StickyNotes = () => {
  const STORAGE_KEYS = {
    CONTENT: 'icity_content',
    AVATAR: 'icity_avatar',
    SIGNATURE: 'icity_signature'
  };

  const [icityContent, setIcityContent] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.CONTENT) || "“ 每一个不曾起舞的日子，都是对生命的辜负。”"
  );
  const [avatarUrl, setAvatarUrl] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.AVATAR) || "https://picsum.photos/seed/avatar/40/40"
  );
  const [signature, setSignature] = useState(() => 
    localStorage.getItem(STORAGE_KEYS.SIGNATURE) || "尼采"
  );

  const [inputValue, setInputValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Menu states
  const [showMenu, setShowMenu] = useState(false);
  const [menuStep, setMenuStep] = useState<'main' | 'avatar_options'>('main');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [showSigInput, setShowSigInput] = useState(false);
  const [tempValue, setTempValue] = useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONTENT, icityContent);
  }, [icityContent]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AVATAR, avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIGNATURE, signature);
  }, [signature]);

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setIcityContent(`“ ${inputValue.trim()} ”`);
      setInputValue("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        setShowMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (tempValue.trim()) {
      setAvatarUrl(tempValue.trim());
      setTempValue("");
      setShowUrlInput(false);
      setShowMenu(false);
    }
  };

  const handleSigSubmit = () => {
    if (tempValue.trim()) {
      setSignature(tempValue.trim());
      setTempValue("");
      setShowSigInput(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="absolute top-20 left-[420px] flex flex-col gap-6 z-0">
      {/* Note 1: Kraft Paper Style */}
      <div 
        className="w-56 h-56 rounded-sm shadow-[2px_4px_16px_rgba(0,0,0,0.2)] p-5 rotate-[-2deg] hover:rotate-0 hover:scale-105 transition-all duration-500 relative group overflow-hidden"
        style={{ 
          backgroundColor: '#d4b483',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/felt.png")`,
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.1), 4px 8px 20px rgba(0,0,0,0.2)'
        }}
      >
        {/* Tape effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-white/30 shadow-sm -mt-2 backdrop-blur-[2px] rounded-sm rotate-1"></div>
        
        <div className="flex flex-col h-full">
          <div className="text-[9px] font-mono text-black/40 mb-1 tracking-widest uppercase italic">Memo / 01</div>
          <textarea 
            className="w-full flex-1 bg-transparent resize-none outline-none text-gray-900/80 font-medium placeholder-black/30 leading-relaxed text-xs" 
            placeholder="在这里写下你的灵感..."
            defaultValue="在这里写下你的灵感...&#10;&#10;有些事现在不做&#10;一辈子都不会做了。&#10;&#10;✨ 保持热爱，奔赴山海。"
          ></textarea>
          <div className="text-[9px] text-black/30 text-right mt-1 font-serif italic">NAN's Space</div>
        </div>
      </div>

      {/* Note 2: iCity Embedded in Sticky Note */}
      <div 
        className="w-56 h-56 rounded-sm shadow-[2px_4px_16px_rgba(0,0,0,0.2)] p-5 rotate-[3deg] hover:rotate-0 hover:scale-105 transition-all duration-500 relative group overflow-hidden"
        style={{ 
          backgroundColor: '#bbf7d0', // Soft mint green paper
          backgroundImage: `url("https://www.transparenttextures.com/patterns/felt.png")`,
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.05), 4px 8px 20px rgba(0,0,0,0.15)'
        }}
      >
        {/* Success Notification Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
            >
              <div className="bg-black/70 backdrop-blur-md text-white text-[10px] px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="w-2 h-2 text-white"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                发布成功
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interaction Menus */}
        <AnimatePresence>
          {showMenu && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => {
                setShowMenu(false);
                setMenuStep('main');
                setShowUrlInput(false);
                setShowSigInput(false);
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-[180px] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {menuStep === 'main' && !showSigInput && (
                  <div className="flex flex-col divide-y divide-gray-100">
                    <button 
                      onClick={() => setMenuStep('avatar_options')}
                      className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                    >
                      修改头像 <ChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => setShowSigInput(true)}
                      className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
                    >
                      Bottom <ChevronRight className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}

                {menuStep === 'avatar_options' && !showUrlInput && (
                  <div className="flex flex-col divide-y divide-gray-100">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      从图库中选择
                    </button>
                    <button 
                      onClick={() => setShowUrlInput(true)}
                      className="px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors text-left"
                    >
                      添加URL链接
                    </button>
                    <button 
                      onClick={() => setMenuStep('main')}
                      className="px-4 py-2 text-[10px] font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 transition-colors text-center"
                    >
                      返回
                    </button>
                  </div>
                )}

                {showUrlInput && (
                  <div className="p-3 flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">输入图片URL</div>
                    <input 
                      autoFocus
                      type="text"
                      value={tempValue}
                      onChange={e => setTempValue(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowUrlInput(false)} className="flex-1 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-lg">取消</button>
                      <button onClick={handleUrlSubmit} className="flex-1 py-1.5 text-[10px] font-bold text-white bg-blue-500 rounded-lg">确定</button>
                    </div>
                  </div>
                )}

                {showSigInput && (
                  <div className="p-3 flex flex-col gap-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">修改署名</div>
                    <input 
                      autoFocus
                      type="text"
                      value={tempValue}
                      onChange={e => setTempValue(e.target.value)}
                      placeholder="输入新署名..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowSigInput(false)} className="flex-1 py-1.5 text-[10px] font-bold text-gray-500 bg-gray-100 rounded-lg">取消</button>
                      <button onClick={handleSigSubmit} className="flex-1 py-1.5 text-[10px] font-bold text-white bg-blue-500 rounded-lg">确定</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />

        {/* Tape effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-white/20 shadow-sm -mt-2 backdrop-blur-sm rounded-sm -rotate-1"></div>
        
        {/* iCity Widget Content Embedded */}
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-white/40 flex items-center justify-center shadow-sm">
                <Search className="w-3 h-3 text-gray-700" />
              </div>
              <span className="text-[10px] font-bold text-black/40 tracking-tight uppercase">iCity / Daily</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-blue-500/60 animate-pulse"></div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center py-2">
            <div className="text-sm font-semibold text-gray-800/90 leading-relaxed italic">
              {icityContent}
            </div>
            <div className="text-[10px] text-black/40 mt-2 flex items-center gap-1">
              <span className="w-3 h-[1px] bg-black/20"></span>
              {signature}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-black/5">
            <div className="flex-1 relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleSubmit}
                placeholder="记录此刻想法..."
                className="w-full bg-white/30 rounded-full px-3 py-1 text-[9px] outline-none placeholder-black/30 text-gray-800 border border-white/20 focus:bg-white/50 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-black/20 font-bold">↵</div>
            </div>
            <div 
              className="w-6 h-6 rounded-full border border-white/50 overflow-hidden bg-white/20 shrink-0 shadow-sm cursor-pointer hover:scale-110 transition-transform active:scale-95"
              onClick={() => {
                setMenuStep('main');
                setShowMenu(true);
              }}
            >
              <img src={avatarUrl || null} alt="user" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BottomBar = () => {
  const [quote, setQuote] = useState(HEALING_QUOTES[0]);

  useEffect(() => {
    // 每次刷新随机获取一句治愈系文案
    const randomQuote = HEALING_QUOTES[Math.floor(Math.random() * HEALING_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-14 bg-white/10 backdrop-blur-2xl border-t border-white/20 flex items-center justify-between pl-32 pr-4 z-40 shadow-2xl">
      {/* Polaroid Avatar (Frosted Glass) */}
      <div className="absolute bottom-2 left-8 w-20 h-24 bg-white/20 backdrop-blur-xl p-1.5 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] -rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-pointer border border-white/40 group rounded-sm">
        <div className="w-full h-full overflow-hidden bg-white/10 rounded-sm">
          <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" referrerPolicy="no-referrer" />
        </div>
      </div>
      
      {/* Quote */}
      <div className="flex-1 flex justify-end items-center text-white/90 text-sm drop-shadow-md gap-3">
        <span className="truncate tracking-widest font-light">「 {quote.text} 」</span>
        <span className="text-white/60 text-xs tracking-wider shrink-0">- {quote.from}</span>
      </div>
    </div>
  );
};

export default function App() {
  const [windows, setWindows] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const openApp = (appId: string) => {
    const existing = windows.find(w => w.id === appId);
    if (existing) {
      setActiveId(appId);
      return;
    }
    
    setWindows([...windows, {
      id: appId,
      isOpen: true,
      isMaximized: false,
    }]);
    setActiveId(appId);
  };

  const closeApp = (appId: string) => {
    setWindows(windows.filter(w => w.id !== appId));
    if (activeId === appId) {
      const remaining = windows.filter(w => w.id !== appId);
      setActiveId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  const toggleMaximize = (appId: string) => {
    setWindows(windows.map(w => 
      w.id === appId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
    setActiveId(appId);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center relative font-sans text-gray-900">
      <DynamicIsland hasOpenWindows={windows.length > 0} />
      <TopBar />
      
      {/* Left Column: Time & Music */}
      <div className="absolute top-24 left-16 flex flex-col gap-8 z-0">
        <LockScreenWidget />
        <NansPlaylistWidget />
        <GameControllerWidget />
      </div>

      {/* Middle Column: Sticky Notes */}
      <StickyNotes />
      
      {/* Desktop Icons */}
      <div className="pt-4 px-4 flex flex-col flex-wrap gap-4 h-[calc(100vh-76px)] content-end absolute right-4 top-7 z-10">
        {APPS.map(app => (
          <DesktopIcon 
            key={app.id} 
            app={app} 
            onClick={() => openApp(app.id)} 
          />
        ))}
      </div>

      {/* Windows */}
      <AnimatePresence>
        {windows.map((w, index) => {
          const app = APPS.find(a => a.id === w.id)!;
          return (
            <Window
              key={w.id}
              app={app}
              isOpen={w.isOpen}
              isMaximized={w.isMaximized}
              zIndex={activeId === w.id ? 50 : index + 10}
              onClose={() => closeApp(w.id)}
              onMaximize={() => toggleMaximize(w.id)}
              onFocus={() => setActiveId(w.id)}
            />
          );
        })}
      </AnimatePresence>
      
      {/* Bottom Bar */}
      <BottomBar />
    </div>
  );
}
