import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from 'motion/react';
import { User, Music, Coffee, Lightbulb, X, Minus, Maximize2, Wifi, Battery, Search, ChevronRight, Upload, Check, GripVertical, Lock, Unlock, Palette, Type, Bell, ListMusic, ThumbsUp, Repeat, MessageSquare, RefreshCw, Folder, FileText, Settings, ChevronLeft, MoreVertical, Clock, Book, Home, ShoppingCart, ArrowLeft, Flower, Leaf, PenLine, Globe, Gamepad2, Mail, Menu, Heart } from 'lucide-react';
import * as mm from 'music-metadata-browser';
import { DogGame } from './components/DogGame';

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

const XiaohongshuHomepage = () => {
  return (
    <div 
      className="max-w-3xl mx-auto min-h-full p-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260323205927_74_2-imagetourl.cloud-1774346276006-57l8o2.png")' }}
    >
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="w-8 h-8" />
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white">▤</div>
            <div className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white">↗</div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260323223334_83_2-imagetourl.cloud-1774756876092-3dsrts.png" alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-lg" referrerPolicy="no-referrer" />
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-white text-lg font-bold border-2 border-white">+</div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              o-NAN-o
            </h2>
            <p className="text-sm text-gray-500">小红书号: NotANumberO_</p>
            <p className="text-sm text-gray-500">IP属地: 江西 ⓘ</p>
          </div>
          <div className="ml-auto">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-gray-700 shadow-lg flex items-center justify-center relative">
              <svg width="80" height="80" viewBox="0 0 100 100" className="stroke-gray-700" fill="none" strokeWidth="3">
                {/* Number 23 at 1 o'clock position */}
                <text x="64" y="26" fill="currentColor" stroke="none" fontSize="14" fontWeight="bold" className="fill-gray-700">23</text>
                {/* Hour hand pointing to 23 (1:00 position) - shortened to not touch */}
                <line x1="50" y1="50" x2="62" y2="29" strokeLinecap="round" />
                {/* Center dot */}
                <circle cx="50" cy="50" r="2" fill="currentColor" stroke="none" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="relative overflow-hidden rounded-2xl border border-white/30 p-6 my-4 w-full text-white text-sm shadow-xl"
          style={{ 
            backgroundImage: 'url("https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260323173509_69_2-imagetourl.cloud-1774346286709-l8y0gi.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 space-y-1">
            <p>“时间是带走我的河流。”</p>
            <p>LIFE & ME:colorful or off-white.</p>
          </div>
        </div>

        {/* Static Danmaku Section */}
        <div className="relative h-[450px] mt-8 w-full overflow-hidden">
          {/* Central 502 Bad Gateway Window Pattern */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-52 bg-white/40 backdrop-blur-sm border border-gray-400/40 rounded-lg shadow-2xl overflow-hidden opacity-50 transform scale-100 transition-all duration-700">
              <div className="bg-gray-400/20 px-3 py-1.5 border-b border-gray-400/30 flex justify-between items-center">
                <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase">System Error</span>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-400/30"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400/30"></div>
                </div>
              </div>
              <div className="p-6 flex flex-col items-center gap-2">
                <h1 className="text-base font-bold text-gray-600 font-mono tracking-tighter">502 Bad Gateway</h1>
                <div className="w-12 h-[1px] bg-gray-400/40 my-1"></div>
                <p className="text-[9px] text-gray-400 font-mono italic">-.Wellcome 2 THE ISLAND.-</p>
              </div>
            </div>
          </div>

          {/* Item 1: The Anchor */}
          <div 
            className="absolute top-[12%] left-1/2 -translate-x-1/2 px-6 py-3 bg-white/50 backdrop-blur-xl border border-white/60 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-900 text-sm font-medium shadow-xl transform hover:scale-110 transition-all duration-500 cursor-default z-30"
          >
            无棘莺落
          </div>

          {/* Item 2: Top Right */}
          <div 
            className="absolute top-[8%] right-[8%] px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md text-gray-700 text-xs font-medium shadow-sm transform rotate-3 hover:rotate-0 transition-all cursor-default z-10"
          >
            未命名诗集
          </div>

          {/* Item 3: Top Left */}
          <div 
            className="absolute top-[5%] left-[10%] px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-700 text-xs font-medium shadow-sm transform -rotate-6 hover:rotate-0 transition-all cursor-default z-10"
          >
            NANO
          </div>

          {/* Item 4: Mid Right */}
          <div 
            className="absolute top-[34%] right-[4%] px-5 py-2.5 bg-white/35 backdrop-blur-lg border border-white/45 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md text-gray-800 text-[10.75px] font-medium shadow-lg transform rotate-[10deg] hover:scale-110 hover:rotate-[5deg] transition-all duration-500 cursor-default z-20"
          >
            iStagNANt_flight
          </div>

          {/* Item 5: Mid Left */}
          <div 
            className="absolute top-[30%] left-[5%] px-4 py-2 bg-white/30 backdrop-blur-md border border-white/40 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-800 text-xs font-medium shadow-md transform rotate-2 hover:scale-105 transition-all cursor-default z-10"
          >
            INFP-t
          </div>

          {/* Item 6: Mid Right Lower */}
          <div 
            className="absolute top-[55%] right-[5%] px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md text-gray-700 text-xs font-medium shadow-sm transform rotate-12 hover:rotate-0 transition-all cursor-default z-10"
          >
            双鱼座
          </div>

          {/* Item 7: Mid Left Lower */}
          <div 
            className="absolute top-[60%] left-[15%] px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-700 text-xs font-medium shadow-sm transform -rotate-12 hover:rotate-0 transition-all cursor-default z-10"
          >
            狗狗教
          </div>

          {/* Item 8: Bottom Right */}
          <div 
            className="absolute bottom-[20%] right-[18%] px-5 py-2.5 bg-white/40 backdrop-blur-lg border border-white/50 rounded-tr-3xl rounded-bl-3xl rounded-tl-md rounded-br-md text-gray-800 text-xs font-medium shadow-lg transform -rotate-3 hover:scale-110 transition-all cursor-default z-20"
          >
            耳机重度依赖症
          </div>

          {/* Item 9: Bottom Left */}
          <div 
            className="absolute bottom-[15%] left-[8%] px-5 py-2.5 bg-white/40 backdrop-blur-lg border border-white/50 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-800 text-xs font-medium shadow-lg transform rotate-6 hover:scale-110 transition-all cursor-default z-20"
          >
            我有文艺病
          </div>

          {/* Item 10: Bottom Center-ish */}
          <div 
            className="absolute bottom-[5%] left-[48%] -translate-x-1/2 px-5 py-2.5 bg-white/40 backdrop-blur-lg border border-white/50 rounded-tl-3xl rounded-br-3xl rounded-tr-md rounded-bl-md text-gray-800 text-xs font-medium shadow-lg transform hover:scale-110 transition-all cursor-default z-20"
          >
            离开文字就无法运行.exe
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutContent = () => {
  const [activeView, setActiveView] = useState<'icity'>('icity');
  
  return (
    <div className="flex h-full bg-white/60 backdrop-blur-3xl">
      <div className="w-48 bg-white/40 border-r border-black/5 p-4 flex flex-col gap-2 hidden sm:flex">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">个人资料</div>
        <div 
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${activeView === 'icity' ? 'bg-blue-500/10 text-blue-600' : 'text-gray-600 hover:bg-black/5'}`}
          onClick={() => setActiveView('icity')}
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">个人主页</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-gray-600 hover:bg-black/5 rounded-md cursor-pointer">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">技能栈</span>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <XiaohongshuHomepage />
      </div>
    </div>
  );
};

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
          { text: "", song: "i'm sorry", artist: "Versutus", date: "02-28", cover: "https://p3.music.126.net/-OgjjO_arHqtpUX1xFt5Tg==/109951168143613156.jpg" },
          { text: "永恒序曲。Fix On。又一次的循环中，依旧动容。", song: "Tunnel", artist: "宋旼琦", date: "2025-10-19", cover: "https://p3.music.126.net/olf_R6JoatZc97VhVxQuhA==/109951172055224267.jpg" },
          { text: "一些伤痛正在被抚平，那些无畏并不需要有解的时刻得到了远方的宽慰。", song: "年少的我们永远轻狂", artist: "Crispy脆乐团", date: "2024-04-15", cover: "https://p3.music.126.net/SnDOvPQ0dLyf9-BvskgMNQ==/109951169479244432.jpg" },
          { text: "百转千回，一梦华胥。", song: "潮汐池 feat.丁文斌 of Foget And For...", artist: "Nerve Passenger (神经旅人) /Forget And Forgive", date: "2023-08-06", cover: "https://p3.music.126.net/bTCecZ4NUTfkIOx_wcNf2g==/109951168831714933.jpg" },
          { text: "轻盈又笨重地驶向遥远的天际。", song: "轻轨", artist: "液蓝BLUE LIQUID", date: "2023-05-03", cover: "https://p3.music.126.net/4Drcf3rTpQ0d9wnFB9QgOA==/109951168558920760.jpg" }
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
  const [activeTab, setActiveTab] = useState<'love_songs' | 'recent'>('love_songs');
  const [refreshKey, setRefreshKey] = useState(0);

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
            <div 
              onClick={() => setActiveTab('love_songs')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'love_songs' ? 'bg-pink-500/10 text-pink-600' : 'text-gray-600 hover:bg-black/5'}`}
            >
              <Music className="w-4 h-4" />
              <span className="text-sm font-medium">LOVE Songs</span>
            </div>
            <div 
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${activeTab === 'recent' ? 'bg-pink-500/10 text-pink-600' : 'text-gray-600 hover:bg-black/5'}`}
            >
              <Coffee className="w-4 h-4" />
              <span className="text-sm font-medium">最最</span>
            </div>
          </div>
        </div>
        <div className="flex-1 p-8 overflow-auto">
          {activeTab === 'love_songs' ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">LOVE Songs</h1>
                <button 
                  onClick={() => setRefreshKey(prev => prev + 1)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/60 hover:bg-white/90 text-gray-700 rounded-full shadow-sm border border-black/5 transition-all"
                  title="刷新内容"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">刷新</span>
                </button>
              </div>
              <div className="flex-1 w-full bg-black/5 rounded-2xl overflow-hidden shadow-sm border border-white/40">
                <iframe 
                  key={refreshKey}
                  src={`https://open.spotify.com/embed/playlist/4GVGnwkGf7CAZRazy1ObVe?si=GQxjbLsTQP6bLDujYg600g&t=${refreshKey}`}
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="w-full h-full min-h-[600px]"
                ></iframe>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BookOfAnswers = ({ type, onClose }: { type: string, onClose: () => void }) => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const answers = {
    YESTERDAY: [
      "放下执念，让它随风而去。", "那是一堂必经的课。", "你已经做得很好了。", 
      "原谅过去，也原谅自己。", "它成就了现在的你。", "珍藏回忆，但要继续前行。",
      "不要再沉溺其中了。", "一切都已成定局。", "遗憾也是一种美。", "时间会冲淡一切。", 
      "不必频频回头。", "旧梦已醒，无需再续。", "那只是沿途的风景。", 
      "错过的就让它错过吧。", "把回忆装进盒子里。", "有些事，记在心里就好。",
      "过去的就让它过去吧。", "感谢曾经的相遇。", "那是你成长的养料。", "挥别错的，才能和对的相逢。",
      "昨日之日不可留。", "让往事清零。", "原谅那个曾经笨拙的自己。", "所有的失去，都会以另一种方式归来。", 
      "不要用昨天的尺，量今天的衣。", "那段经历，是你独一无二的勋章。", "把悲伤留在昨天。", "一切过往，皆为序章。", 
      "它只是一段记忆，不再具有伤害你的力量。", "学会和解，是成长的必修课。", "有些答案，时间已经给出了。", 
      "不要让昨天的雨，淋湿今天的衣裳。", "回头看，轻舟已过万重山。", "感谢那段时光，让你变得坚强。", 
      "旧的篇章已经翻过。", "把遗憾化作前行的动力。", "那些眼泪，浇灌了今天的你。", "过去的你，也曾闪闪发光。", 
      "不要苛责过去的自己，当时你已尽力。", "把故事留在风中。"
    ],
    TODAY: [
      "立刻行动起来。", "深呼吸，感受当下。", "专注于眼前的事情。", 
      "今天你拥有改变的力量。", "拥抱未知与混乱。", "一步一个脚印地走。",
      "相信你的直觉。", "让今天变得有意义。", "做你现在能做的。", "享受这一刻的宁静。", 
      "不要把今天浪费在犹豫上。", "去见你想见的人。", "吃顿好的，犒劳自己。", 
      "今天是个好日子。", "行动胜于空想。", "感受微风，感受阳光。", 
      "把手头的事情做好。", "给自己一个微笑。", "倾听内心的声音。", "现在就是最好的时机。",
      "去创造属于今天的美好。", "别想太多，做就是了。", "今天也是限量版的一天。", "把注意力拉回此时此刻。", 
      "去拥抱今天的阳光。", "做一件让自己开心的事。", "不要为尚未发生的事焦虑。", "今天，你才是主角。", 
      "去尝试一个新事物。", "对身边的人说声谢谢。", "给自己放个小假。", "今天适合勇敢。", 
      "去流汗，去奔跑。", "把今天过得热气腾腾。", "不要等待，现在就出发。", "去感受生活中的小确幸。", 
      "今天，请善待自己。", "去完成那个搁置已久的计划。", "把今天当成生命的第一天。", "去爱，去感受，去生活。"
    ],
    TOMORROW: [
      "未来充满无限可能。", "静观其变。", "做好准备迎接挑战。", 
      "担忧改变不了什么。", "相信过程，顺其自然。", "一个新的开始在等你。",
      "耐心是关键。", "一切都会水到渠成。", "好戏还在后头。", "保持期待。", 
      "一切皆有可能。", "不要预支明天的烦恼。", "车到山前必有路。", 
      "明天又是新的一天。", "做好准备，迎接惊喜。", "顺其自然，静待花开。", 
      "你的未来由你创造。", "勇敢地迈出下一步。", "星光不问赶路人。", "时间会给你答案。",
      "明天会更好。", "去迎接未知的冒险。", "把期待拉满。", "明天，去见想见的人。", 
      "去创造属于你的奇迹。", "不要害怕未知的明天。", "明天，又是充满希望的一天。", "去迎接新的曙光。", 
      "把梦想照进现实。", "明天，去挑战不可能。", "去书写新的篇章。", "明天，去拥抱更广阔的世界。", 
      "去追逐你的星辰大海。", "明天，去成为更好的自己。", "去期待那些不期而遇的美好。", "明天，去开启新的旅程。", 
      "去相信，美好的事情即将发生。", "明天，去绽放你的光芒。", "去迎接生命中的每一个明天。", "明天，去创造无限可能。"
    ]
  };

  const handleAsk = () => {
    setIsThinking(true);
    setAnswer(null);
    setTimeout(() => {
      const list = answers[type as keyof typeof answers] || answers.TODAY;
      const randomAnswer = list[Math.floor(Math.random() * list.length)];
      setAnswer(randomAnswer);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="absolute inset-0 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] flex flex-col z-40 shadow-2xl">
      {/* Win98 Title Bar */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-1 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="text-sm leading-none">📖</span>
          <span className="text-white text-xs font-bold tracking-wide">Book of Answers: {type}</span>
        </div>
        <button 
          onClick={onClose}
          className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#808080] flex items-center justify-center text-black font-bold text-xs focus:outline-none active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
        >
          ×
        </button>
      </div>
      {/* Menu Bar */}
      <div className="flex gap-3 px-2 py-1 text-xs text-black border-b border-[#808080] shadow-[0_1px_0_white]">
        <span>File</span><span>Action</span><span>Help</span>
      </div>
      {/* Content Area */}
      <div className="flex-1 bg-[#f0ebd8] border-t-2 border-l-2 border-[#808080] border-b-2 border-r-2 border-white m-1 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
        {/* Vintage Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #5c4033 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
        
        <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-3 drop-shadow-sm z-10 tracking-widest">
          {type === 'YESTERDAY' ? '旧笺余墨' : type === 'TODAY' ? '此页正书' : '空章待序'}
        </h2>
        <p className="text-xs text-[#5d4037] mb-8 font-serif text-center max-w-[80%] z-10 italic">
          在心中默念关于{type === 'YESTERDAY' ? '昨天' : type === 'TODAY' ? '今天' : '明天'}的问题，然后翻开答案之书。
        </p>

        <div className="relative w-56 h-72 mb-8 z-10" style={{ perspective: '1200px' }}>
          <motion.div 
            className="w-full h-full relative cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: answer ? 180 : 0, scale: isThinking ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            onClick={!isThinking && !answer ? handleAsk : undefined}
          >
            {/* Book Front */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4e342e] to-[#3e2723] rounded-r-2xl border-l-[12px] border-[#261410] shadow-[10px_10px_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center p-4 border-2 border-[#5d4037] overflow-hidden" style={{ backfaceVisibility: 'hidden' }}>
              <div className="absolute inset-2 border border-[#795548]/30 rounded-r-xl pointer-events-none"></div>
              <div className="w-12 h-12 border-2 border-[#d7ccc8]/40 rounded-full flex items-center justify-center mb-1 mt-3 shadow-inner bg-[#3e2723]/50">
                <span className="text-[#d7ccc8] text-xl font-serif drop-shadow-md">?</span>
              </div>
              <span className="text-[#d7ccc8]/80 font-serif text-xs tracking-[0.2em] uppercase text-center w-full px-2 break-words leading-relaxed">The Book</span>
            </div>
            {/* Book Back / Inside */}
            <div className="absolute inset-0 bg-[#fdfbf7] rounded-l-2xl border-r-[12px] border-[#e0e0e0] shadow-[inset_15px_0_20px_-10px_rgba(0,0,0,0.15),-5px_5px_15px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center p-6 text-center overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              {/* Page styling lines */}
              <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-red-800/20"></div>
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(transparent 95%, #e0e0e0 100%)', backgroundSize: '100% 1.5rem' }}></div>
              
              <div className="relative z-10 w-full flex items-center justify-center">
                {isThinking ? (
                  <span className="text-[#8d6e63] font-serif italic text-base animate-pulse">正在寻找答案...</span>
                ) : (
                  <span className="text-[#2c1810] font-serif text-lg leading-relaxed font-bold drop-shadow-sm break-words">{answer}</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {answer ? (
          <button 
            onClick={() => setAnswer(null)}
            className="px-8 py-2.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] text-sm font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white z-10 text-black shadow-sm hover:bg-[#d0d0d0] transition-colors"
          >
            再问一次
          </button>
        ) : (
          <button 
            onClick={handleAsk}
            disabled={isThinking}
            className="px-8 py-2.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] text-sm font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white disabled:opacity-50 z-10 text-black shadow-sm hover:bg-[#d0d0d0] transition-colors"
          >
            {isThinking ? '翻阅中...' : '寻求答案'}
          </button>
        )}
      </div>
    </div>
  );
};

const LifeContent = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [openWindow, setOpenWindow] = useState<string | null>(null);
  const [isComputerOn, setIsComputerOn] = useState(false);
  const recentBooks = [
    { title: '倒影映射出的你/我/他', author: 'NotANumberO_', progress: 23, cover: 'https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222226_25_569-imagetourl.cloud-1774683345038-ekf9il.png' },
    { title: '发现平凡中的不平凡', author: 'NotANumberO_', progress: 12, cover: 'https://picsum.photos/seed/k2/300/450' },
    { title: '春日漫步随笔', author: 'NotANumberO_', progress: 100, cover: 'https://picsum.photos/seed/k3/300/450' },
  ];

  const collections = [
    { title: '日记簿', count: 4 },
    { title: '影音集', count: 12 },
    { title: 'photo', count: 36 },
  ];

  return (
    <div className="h-full bg-[#fcfcfc] text-[#333] font-sans overflow-hidden flex flex-col border-x border-gray-100">
      {/* Bilibili Style Header */}
      <div className="bg-white border-b border-gray-100 flex flex-col shrink-0 z-20 pt-3 pb-1 shadow-sm">
        {/* Top Row: Avatar, Search, Icons */}
        <div className="flex items-center justify-between px-4 h-10 gap-4 mb-2 relative">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 cursor-pointer">
            <img 
              src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774681518731-ajx7b8.jpg" 
              alt="avatar" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 h-8 bg-[#F1F2F3] rounded-full flex items-center px-3 gap-2 cursor-pointer hover:bg-[#E3E5E7] transition-colors mr-10 group">
            <Search className="w-4 h-4 text-[#99A2AA] group-hover:text-[#FB7299] transition-colors" />
            <span className="text-[13px] text-[#99A2AA] truncate group-hover:text-[#FB7299] transition-colors">CLICK HERE TO SEARCH</span>
          </div>
          
          {/* Right Menu Icon with Gradient Mask */}
          <div className="absolute right-0 top-0 h-full bg-gradient-to-l from-white via-white to-transparent w-16 flex items-center justify-end pr-4">
            <Menu className="w-5 h-5 text-[#757A81] cursor-pointer hover:text-[#FB7299] transition-colors" />
          </div>
        </div>

        {/* Bottom Row: Channel Tags & Scrolling Pixel Art Text */}
        <div className="h-10 bg-white border-t border-gray-100 flex items-center overflow-hidden relative">
          {/* Channel Tags */}
          <div className="flex items-center px-4 gap-6 h-full shrink-0 border-r border-gray-100/50 mr-2 bg-white z-10">
            <div 
              className="relative h-full flex items-center cursor-pointer group"
              onClick={() => setActiveTab('diary')}
            >
              <span className={`text-[15px] font-medium transition-colors ${activeTab === 'diary' ? 'text-[#FB7299]' : 'text-[#61666D] group-hover:text-[#FB7299]'}`}>日记簿</span>
              {activeTab === 'diary' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FB7299] rounded-full"></div>
              )}
            </div>
            <div 
              className="relative h-full flex items-center cursor-pointer group"
              onClick={() => setActiveTab('media')}
            >
              <span className={`text-[15px] font-medium transition-colors ${activeTab === 'media' ? 'text-[#FB7299]' : 'text-[#61666D] group-hover:text-[#FB7299]'}`}>影音集</span>
              {activeTab === 'media' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FB7299] rounded-full"></div>
              )}
            </div>
            <div 
              className="relative h-full flex items-center cursor-pointer group"
              onClick={() => setActiveTab('photo')}
            >
              <span className={`text-[15px] font-medium transition-colors ${activeTab === 'photo' ? 'text-[#FB7299]' : 'text-[#61666D] group-hover:text-[#FB7299]'}`}>photo</span>
              {activeTab === 'photo' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#FB7299] rounded-full"></div>
              )}
            </div>
          </div>

          {/* Scrolling Text Area */}
          <div className="flex-1 h-full flex items-center overflow-hidden relative">
            <div className="whitespace-nowrap animate-marquee-once flex items-center">
              <span className="text-[16px] text-[#FB7299] tracking-wider px-4 glitch-text" data-text="春天会复活，种下的花朵会重生。">
                春天会复活，种下的花朵会重生。
              </span>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=DotGothic16&display=swap');
            
            .glitch-text {
              font-family: 'DotGothic16', sans-serif;
              position: relative;
              display: inline-block;
              /* Combined glitch and dissipation animation */
              animation: main-glitch 8s step-end infinite, pixel-dissipate 4s step-end infinite;
            }
            
            /* Glitch Layers for "Broken" effect */
            .glitch-text::before,
            .glitch-text::after {
              content: attr(data-text);
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: transparent;
              display: block; /* Always display to ensure immediate effect */
              pointer-events: none;
            }
            
            .glitch-text::before {
              left: 2px;
              text-shadow: -2px 0 #ff00c1;
              clip-path: inset(10% 0 80% 0);
              animation: glitch-layer-1 5s step-end infinite;
              opacity: 0.7;
            }
            
            .glitch-text::after {
              left: -2px;
              text-shadow: 2px 0 #00fff9;
              clip-path: inset(70% 0 10% 0);
              animation: glitch-layer-2 7s step-end infinite;
              opacity: 0.7;
            }
            
            @keyframes main-glitch {
              0% { transform: translate(0); opacity: 1; }
              5% { transform: translate(2px, -1px); opacity: 0.9; }
              10% { transform: translate(-1px, 2px); opacity: 1; }
              15% { transform: translate(0); opacity: 0.8; }
              20% { transform: translate(-2px, -2px); opacity: 1; }
              25% { transform: translate(0); opacity: 1; }
              40% { transform: translate(3px, 1px); opacity: 0.7; }
              45% { transform: translate(0); opacity: 1; }
              60% { transform: translate(-3px, -1px); opacity: 0.8; }
              65% { transform: translate(0); opacity: 1; }
              80% { transform: translate(1px, 3px); opacity: 0.9; }
              85% { transform: translate(0); opacity: 1; }
              92% { transform: translate(5px, -2px); opacity: 0.6; }
              94% { transform: translate(-5px, 2px); opacity: 0.4; }
              96% { transform: translate(2px, 5px); opacity: 0.2; }
              98% { transform: translate(-2px, -5px); opacity: 1; }
            }
            
            @keyframes pixel-dissipate {
              0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
              10% { clip-path: polygon(0 0, 40% 0, 40% 20%, 60% 20%, 60% 0, 100% 0, 100% 100%, 0 100%); }
              20% { clip-path: polygon(0 0, 100% 0, 100% 40%, 80% 40%, 80% 60%, 100% 60%, 100% 100%, 0 100%); }
              30% { clip-path: polygon(0 0, 100% 0, 100% 100%, 20% 100%, 20% 80%, 40% 80%, 40% 100%, 0 100%); }
              40% { clip-path: polygon(0 20%, 20% 20%, 20% 0, 100% 0, 100% 100%, 0 100%); }
              50% { clip-path: polygon(0 0, 70% 0, 70% 30%, 80% 30%, 80% 0, 100% 0, 100% 100%, 0 100%); }
              60% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 60%, 20% 60%, 20% 40%, 0 40%); }
              70% { clip-path: polygon(0 0, 30% 0, 30% 40%, 50% 40%, 50% 0, 100% 0, 100% 100%, 0 100%); }
              80% { clip-path: polygon(0 0, 100% 0, 100% 70%, 90% 70%, 90% 90%, 100% 90%, 100% 100%, 0 100%); }
              90% { clip-path: polygon(0 0, 100% 0, 100% 100%, 10% 100%, 10% 10%, 0 10%); }
            }
            
            @keyframes glitch-layer-1 {
              0% { clip-path: inset(20% 0 50% 0); transform: translateX(-5px); }
              20% { clip-path: inset(80% 0 10% 0); transform: translateX(5px); }
              40% { clip-path: inset(40% 0 40% 0); transform: translateX(-3px); }
              60% { clip-path: inset(10% 0 80% 0); transform: translateX(3px); }
              80% { clip-path: inset(60% 0 10% 0); transform: translateX(-5px); }
              100% { clip-path: inset(20% 0 50% 0); transform: translateX(5px); }
            }
            
            @keyframes glitch-layer-2 {
              0% { clip-path: inset(10% 0 70% 0); transform: translateX(8px); }
              25% { clip-path: inset(50% 0 30% 0); transform: translateX(-8px); }
              50% { clip-path: inset(30% 0 50% 0); transform: translateX(4px); }
              75% { clip-path: inset(70% 0 10% 0); transform: translateX(-4px); }
              100% { clip-path: inset(10% 0 70% 0); transform: translateX(8px); }
            }
            
            @keyframes marquee-once {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            
            .animate-marquee-once {
              animation: marquee-once 18s linear infinite;
            }
          `}} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* From Your Library Section */}
          <div className="flex justify-between items-center mb-6">
            <div 
              className="relative inline-flex items-center pl-6 pr-10 py-2 shadow-md border-y border-amber-900/20" 
              style={{ 
                clipPath: 'polygon(0 0, 100% 0, 85% 50%, 100% 100%, 0 100%)',
                backgroundColor: '#d2b48c',
                backgroundImage: 'radial-gradient(#c3a37a 1px, transparent 0)',
                backgroundSize: '4px 4px',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 2px 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <h2 className="text-xl font-bold uppercase tracking-widest font-serif text-amber-950 drop-shadow-sm">I SEE U</h2>
            </div>
            
            {/* Complex Wavy Ornamental Line with more curvature - Shortened */}
            <div className="flex-1 mx-2 h-10 flex items-center relative z-0">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 20">
                {/* Triple Wavy Line for complexity */}
                <path 
                  d="M 0 10 C 20 2, 30 18, 50 10 C 70 2, 80 18, 100 10" 
                  fill="none" 
                  stroke="rgba(120, 53, 15, 0.15)" 
                  strokeWidth="0.5"
                />
                <path 
                  d="M 0 11 C 20 3, 30 19, 50 11 C 70 3, 80 19, 100 11" 
                  fill="none" 
                  stroke="rgba(120, 53, 15, 0.4)" 
                  strokeWidth="1.2"
                />
                <path 
                  d="M 0 12 C 20 4, 30 20, 50 12 C 70 4, 80 20, 100 12" 
                  fill="none" 
                  stroke="rgba(120, 53, 15, 0.15)" 
                  strokeWidth="0.5"
                />
              </svg>
              
              {/* Center Decorative Element with Tooltip covering it */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-900/40"></div>
                <div className="relative group cursor-help flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rotate-45 border border-amber-900/40 bg-[#d2b48c] shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-amber-900/20"></div>
                  </div>
                  {/* Tooltip Popup - Positioned to cover the square */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-amber-900/95 backdrop-blur-md text-white text-[11px] rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-2xl border border-amber-800/30 z-50 scale-90 group-hover:scale-100">
                    没关系，别害怕，不对称的状态才是日常。
                  </div>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-900/40"></div>
              </div>

              {/* Secondary Ornaments */}
              <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-900/20"></div>
              <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-900/20"></div>
            </div>

            <div 
              className="relative inline-flex items-center pr-6 pl-10 py-2 shadow-md border-y border-amber-900/20 cursor-pointer group" 
              style={{ 
                clipPath: 'polygon(15% 50%, 0 0, 100% 0, 100% 100%, 0 100%)',
                backgroundColor: '#d2b48c',
                backgroundImage: 'radial-gradient(#c3a37a 1px, transparent 0)',
                backgroundSize: '4px 4px',
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 2px 2px 5px rgba(0,0,0,0.2)'
              }}
            >
              <span className="text-sm font-bold uppercase tracking-widest font-serif text-amber-950 drop-shadow-sm group-hover:underline">See All</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Leftmost Image */}
            <div className="col-span-1 md:col-span-4 flex flex-col">
              <div className="group cursor-pointer">
                <div className="w-full aspect-[2/3] bg-gray-100 mb-4 border border-gray-300 shadow-md relative overflow-hidden">
                  <img 
                    src={recentBooks[0].cover} 
                    alt={recentBooks[0].title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                  />
                  {recentBooks[0].progress === 100 && (
                    <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                      Read
                    </div>
                  )}
                </div>
                <h3 className="font-serif font-bold text-base leading-snug mb-1 line-clamp-2 group-hover:underline">{recentBooks[0].title}</h3>
                <p className="text-sm text-gray-600 mb-1 font-serif italic">{recentBooks[0].author}</p>
              </div>
              
              {/* Straight Ornamental Line below Author */}
              <div className="w-full h-4 flex items-center relative z-0 mb-2 px-4">
                <div className="w-full h-[2px] bg-amber-900/20 relative">
                  {/* Center Decorative Element (No Tooltip) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-amber-900/40"></div>
                    <div className="w-2.5 h-2.5 rotate-45 border border-amber-900/40 bg-[#d2b48c] shadow-sm flex items-center justify-center">
                      <div className="w-1 h-1 bg-amber-900/20"></div>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-amber-900/40"></div>
                  </div>
                  {/* Secondary Ornaments */}
                  <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-amber-900/20"></div>
                  <div className="absolute right-[20%] top-1/2 -translate-y-1/2 w-0.5 h-0.5 rounded-full bg-amber-900/20"></div>
                </div>
              </div>

              {/* Interactive Dog Game Section */}
              <DogGame />
              <div className="flex items-center gap-3 mt-auto">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${recentBooks[0].progress}%` }}></div>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{recentBooks[0].progress}%</span>
              </div>
            </div>

            {/* Y2K Windows Interface with CRT Monitor Shell */}
            <div className="col-span-1 md:col-span-8 flex flex-col items-center relative">
              {/* Monitor Body */}
              <div className="w-full bg-[#d4d0c8] p-4 rounded-2xl border-t-4 border-l-4 border-white/50 border-b-4 border-r-4 border-black/20 shadow-2xl flex flex-col">
                {/* Screen Bezel (Dark inner frame) */}
                <div className="w-full bg-[#1a1a1a] p-3 rounded-xl border-t-4 border-l-4 border-black/60 border-b-4 border-r-4 border-white/10 flex-1 flex flex-col relative overflow-hidden shadow-inner">
                  {/* CRT Glass reflection effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-50 rounded-lg"></div>

                  <div className="w-full h-full min-h-[400px] bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] p-[2px] font-sans flex flex-col shadow-[2px_2px_0px_rgba(0,0,0,0.2)] relative">
                    <AnimatePresence mode="wait">
                      {isComputerOn ? (
                        <motion.div 
                          key="desktop"
                          initial={{ opacity: 0, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(10px)' }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          className="flex-1 flex flex-col relative h-full"
                        >
                          {/* Desktop Area */}
                        <div className="flex-1 m-1 p-4 overflow-hidden flex flex-col relative">
                          {/* Blurred Background Layer */}
                          <div 
                            className="absolute inset-0 z-0"
                            style={{ 
                              backgroundImage: 'url("https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222331_27_569-imagetourl.cloud-1774683355704-ttq8cs.png")',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              filter: 'blur(3px)'
                            }}
                          ></div>

                          {/* Desktop Icons Centered Vertically */}
                          <div className="relative z-10 flex flex-col gap-8 justify-center items-center h-full">
                            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setOpenWindow('YESTERDAY')}>
                              <span className="text-sm font-bold text-white text-center leading-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-blue-600/80 transition-all tracking-widest">YESTERDAY</span>
                            </div>
                            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setOpenWindow('TODAY')}>
                              <span className="text-sm font-bold text-white text-center leading-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-blue-600/80 transition-all tracking-widest">TODAY</span>
                            </div>
                            <div className="flex flex-col items-center cursor-pointer group" onClick={() => setOpenWindow('TOMORROW')}>
                              <span className="text-sm font-bold text-white text-center leading-tight drop-shadow-[1px_1px_2px_rgba(0,0,0,0.9)] px-4 py-2 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-blue-600/80 transition-all tracking-widest">TOMORROW</span>
                            </div>
                          </div>

                          {/* Windows Modals */}
                          {openWindow && (
                            <BookOfAnswers type={openWindow} onClose={() => setOpenWindow(null)} />
                          )}
                        </div>
                        
                        {/* Taskbar */}
                        <div className="h-7 bg-[#c0c0c0] border-t-2 border-white flex items-center px-0.5 gap-1 z-30">
                          <button className="h-[22px] px-1.5 bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#808080] flex items-center justify-center active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white group">
                            <span className="text-xs font-bold text-black">Start</span>
                          </button>
                          <div className="flex-1 h-[22px] border-t border-l border-[#808080] border-b border-r border-white mx-0.5"></div>
                          <div className="h-[22px] px-2 border-t border-l border-[#808080] border-b border-r border-white flex items-center justify-center">
                            <span className="text-[10px] text-black font-medium">
                              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                        <motion.div 
                          key="lockscreen"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
                          transition={{ duration: 1.2, ease: "easeInOut" }}
                          className="flex-1 m-1 flex items-center justify-center relative overflow-hidden"
                          style={{
                          backgroundImage: 'url("https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222331_27_569-imagetourl.cloud-1774690774047-jzt6ue.png")',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <div className="absolute inset-0 bg-black/30"></div>
                        <div 
                          className="relative z-10 flex flex-col items-center gap-4 cursor-pointer group"
                          onClick={() => setIsComputerOn(true)}
                        >
                          <div className="flex text-white/90 font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-[0.2em] sm:tracking-[0.3em] lg:tracking-[0.5em] whitespace-nowrap drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] group-hover:text-white group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-700">
                            {"WELCOME TO".split('').map((char, i) => (
                              <motion.span
                                key={i}
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                              >
                                {char === ' ' ? '\u00A0' : char}
                              </motion.span>
                            ))}
                          </div>
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2, duration: 1 }}
                            className="text-white/50 text-[10px] tracking-widest font-sans uppercase group-hover:text-white/80 transition-colors"
                          >
                            Click to unlock
                          </motion.div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Monitor Bottom Control Panel */}
                <div className="h-10 w-full mt-2 flex items-center justify-between px-6">
                  {/* Brand/Logo placeholder */}
                  <div className="text-gray-500 font-serif italic text-sm tracking-widest font-bold">INFINITY</div>
                  {/* Buttons */}
                  <div className="flex gap-3 items-center">
                    <div className="w-3 h-1 bg-gray-400 rounded-full shadow-inner"></div>
                    <div className="w-3 h-1 bg-gray-400 rounded-full shadow-inner"></div>
                    <div className="w-3 h-1 bg-gray-400 rounded-full shadow-inner"></div>
                    {/* Power Button */}
                    <button 
                      onClick={() => setIsComputerOn(!isComputerOn)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isComputerOn 
                          ? 'bg-green-500 border-green-700 shadow-[0_0_5px_#22c55e]' 
                          : 'bg-red-500 border-red-700 shadow-[0_0_5px_#ef4444]'
                      } ml-4 outline-none active:scale-95 cursor-pointer`}
                      title="Power"
                    >
                      <svg className="w-3 h-3 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m-4.5-2.5a9 9 0 109 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Monitor Stand */}
              <div className="w-1/3 h-8 bg-[#c0bcb4] border-l-4 border-white/40 border-r-4 border-black/20 z-0 relative -mt-2 shadow-lg"></div>
              <div className="w-1/2 h-4 bg-[#d4d0c8] rounded-b-xl border-b-4 border-black/20 shadow-xl z-10"></div>
            </div>
          </div>

          {/* Collections Section */}
          <div className="border-t-2 border-gray-200 pt-8">
            <h2 className="text-xl font-bold uppercase tracking-widest font-serif text-gray-900 mb-6">Your Collections</h2>
            <div className="flex flex-col border-y border-gray-200">
              {collections.map((col, idx) => (
                <div key={idx} className="flex justify-between items-center py-5 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors px-2 group">
                  <div className="flex items-center gap-4">
                    <Folder className="w-6 h-6 text-gray-400 group-hover:text-black transition-colors" strokeWidth={1.5} />
                    <span className="font-serif font-bold text-lg text-gray-800">{col.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{col.count} items</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  // 韩女文学
  { text: "不要因为今天的不堪，就对明天失去希望。", from: "《虽然想死，但还是想吃辣炒年糕》" },
  { text: "你不需要成为任何人，做那个最真实的自己就已经足够闪耀了。", from: "《决定以我自己的方式度过一生》" },
  { text: "即使是微不足道的日常，也值得被温柔以待。", from: "《语言的温度》" },
  { text: "允许自己偶尔停下脚步，感受风的温度和云的形状。", from: "《今天也要用心过生活》" },
  { text: "把所有的不期而遇，都当作是生活赠予的温柔礼物。", from: "《愿你按自己的意愿过一生》" },
  { text: "在疲惫的日子里，也要记得给自己买一束花，拥抱一下自己。", from: "《我决定活得像我》" },
  { text: "那些看似没有意义的时光，其实都在默默滋养着你的灵魂。", from: "《时间会证明一切》" },
  { text: "无论世界多么喧嚣，请在内心为自己保留一片安静的角落。", from: "《静下心来找回自己》" },
  { text: "今天也辛苦了，好好睡一觉，明天又是崭新且充满希望的一天。", from: "《晚安，我的宇宙》" },
  { text: "去爱那些能让你变得柔软的事物，去靠近那些给你带来光的人。", from: "《你的夏天还好吗》" },
  { text: "人生不是速度战，而是持久战。慢慢来，没关系。", from: "《就算稍微停下脚步也没关系》" },
  { text: "偶尔逃避一下也没关系，只要记得回来的路就好。", from: "《今天也要用心过生活》" },
  { text: "比起成为一个完美的人，我更想成为一个快乐的人。", from: "《即使不完美也没关系》" },
  { text: "不要把别人的期待当成自己的目标，你的人生由你自己做主。", from: "《我决定活得像我》" },
  { text: "不要因为别人走得快，就打乱了自己的节奏。", from: "《虽然想死，但还是想吃辣炒年糕》" },
  { text: "你不需要总是那么坚强，偶尔软弱一下也是可以的。", from: "《决定以我自己的方式度过一生》" },
  { text: "生活虽然充满艰辛，但总有一些微小的幸福在等待着你。", from: "《语言的温度》" },
  { text: "不要害怕失败，因为每一次失败都是成长的契机。", from: "《我决定活得像我》" },
  { text: "去爱那个不完美的自己，因为那是你最真实的模样。", from: "《你的夏天还好吗》" },
  { text: "即使是在最黑暗的时刻，也要相信光芒终会穿透阴霾。", from: "《即使不完美也没关系》" },
  { text: "不要把别人的评价看得太重，你的人生只有你自己能定义。", from: "《就算稍微停下脚步也没关系》" },
  { text: "偶尔放纵一下自己，去吃想吃的食物，去做想做的事。", from: "《今天也要用心过生活》" },
  { text: "比起追求外在的物质，内心的平静和满足更为重要。", from: "《静下心来找回自己》" },
  { text: "人生没有标准答案，你走过的路就是你的答案。", from: "《我决定活得像我》" },
  { text: "不要为了迎合别人而改变自己，因为你本来就很珍贵。", from: "《我是个年轻人，我心情不太好》" },
  
  // 日系文学
  { text: "岁月漫长，然而值得等待。", from: "村上春树《如果我们的语言是威士忌》" },
  { text: "不必太纠结于当下，也不必太忧虑未来，当你经历过一些事情的时候，眼前的风景已经和从前不一样了。", from: "村上春树《1Q84》" },
  { text: "孤独一人也没关系，只要能发自内心地爱着一个人，人生就会有救。", from: "村上春树《1Q84》" },
  { text: "不管前方的路有多苦，只要走的方向正确，不管多么崎岖不平，都比站在原地更接近幸福。", from: "宫崎骏《千与千寻》" },
  { text: "生活坏到一定程度就会好起来，因为它无法更坏。努力过后，才知道许多事情，坚持坚持，就过来了。", from: "宫崎骏《龙猫》" },
  { text: "世界这么大，人生这么长，总会有这么一个人，让你想要温柔的对待。", from: "宫崎骏《哈尔的移动城堡》" },
  { text: "有些烦恼，丢掉了，才有云淡风轻的机会。", from: "宫崎骏《龙猫》" },
  { text: "我本想这个冬日就死去的，可最近拿到一套鼠灰色细条纹的麻质和服，是适合夏天穿的，所以我还是先活到夏天吧。", from: "太宰治《晚年》" },
  { text: "请不要灰心，你也会有人爱的。", from: "太宰治《人间失格》" },
  { text: "只要活着，总会有好事发生的。", from: "樱桃子《樱桃小丸子》" },
  { text: "雨天听雨，下雪日观雪，夏天体验酷暑，冬天领受刺骨寒风……无论什么样的日子，尽情玩味其中就好。", from: "森下典子《日日是好日》" },
  { text: "所谓人生，大概就是一场不断相遇与告别的旅程吧。只要心中有光，便不惧路长。", from: "吉本芭娜娜《厨房》" },
  { text: "即使是在悲伤的时候，也要好好吃饭，好好睡觉。只有照顾好自己，才有力气去面对明天。", from: "吉本芭娜娜《白河夜船》" },
  { text: "世界上没有完美的人，也没有完美的生活。接受自己的不完美，才是幸福的开始。", from: "角田光代《第八日的蝉》" },
  { text: "不要总是为了未来而担忧，要学会享受当下的每一刻。因为当下，才是你真正拥有的。", from: "青山七惠《一个人的好天气》" },
  { text: "无论遇到什么困难，都不要放弃希望。因为希望，是支撑我们走下去的力量。", from: "东野圭吾《解忧杂货店》" },
  { text: "每个人都有自己的故事，每个人都在努力地生活着。请对这个世界多一份温柔和理解。", from: "夏目漱石《我是猫》" },
  { text: "人生就像一场旅行，重要的不是目的地，而是沿途的风景和看风景的心情。", from: "川端康成《雪国》" },
  { text: "即使是在最寒冷的冬天，也要相信春天终会到来。因为生命，总是充满着奇迹。", from: "三岛由纪夫《金阁寺》" },
  { text: "去爱吧，就像不曾受过伤一样；跳舞吧，就像没有人欣赏一样；唱歌吧，就像没有人聆听一样。", from: "艾佛列德·德索萨（日剧《悠长假期》引用）" },
  { text: "人生不如意事十之八九，但总有一两件美好的事情，值得我们去回味和珍惜。", from: "林真理子《平民之宴》" },
  { text: "不要害怕孤独，因为孤独是让你重新认识自己的最好机会。", from: "松浦弥太郎《100个基本》" },
  { text: "把每一天都当作是生命中的最后一天来过，你就会发现，原来生活中有那么多美好的事物。", from: "黑柳彻子《窗边的小豆豆》" },
  { text: "只要心中有爱，无论走到哪里，都会感到温暖和幸福。", from: "渡边淳一《失乐园》" }
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
            style={{ x, y, borderRadius: 24, top: 'auto', bottom: 'calc(100vh - 88px)' }}
            drag={hasOpenWindows && !isLocked}
            dragControls={dragControls}
            dragListener={false}
            dragElastic={0.2}
            dragMomentum={true}
            initial={{ y: -20, opacity: 0, filter: "blur(10px)", scale: 0.9 }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ y: -20, opacity: 0, filter: "blur(10px)", scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-16 z-[9999]"
          >
            <motion.div 
              layout
              className={`${currentTheme.bg} backdrop-blur-md ${currentTheme.text} rounded-3xl flex items-center justify-center min-h-[40px] px-4 py-2 shadow-lg min-w-[120px] max-w-[600px] transition-colors duration-500`}
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
              <motion.div layout className="flex flex-col justify-center overflow-hidden pr-2">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeIndex}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="font-medium drop-shadow-sm tracking-wide transition-all duration-300 text-center"
                    style={{ fontSize: `${displayLyricSize}px` }}
                  >
                    {(currentLyric || songName).split('\n').map((line, i) => (
                      <div key={i} className={i > 0 ? "text-[0.85em] opacity-80 mt-0.5" : ""}>{line}</div>
                    ))}
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

            <div className="mb-6 p-4 bg-black/5 rounded-xl flex flex-col items-center justify-center overflow-hidden text-center">
               {(currentLyric || songName || "歌词预览").split('\n').map((line, i) => (
                 <div key={i} className={`font-medium ${i > 0 ? "text-[0.85em] opacity-80 mt-0.5" : ""}`} style={{ fontSize: `${tempLyricSize}px` }}>
                   {line}
                 </div>
               ))}
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
      { time: 0, text: "作词 : Gummy B\n作曲 : Gummy B" },
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
    src: "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy84M2MxZTEzYzA5OGQxODU2L0lRRFFIbFBoa1E3MlFiVWNKUk5OUmVBYUFmVlByMC1YdWMyd0xMSWYxNlVDTEVZP2U9Y3ZvZFdT.mp3",
    lyrics: [
      { time: 0, text: "作词 : 宋旼琦" },
      { time: 1, text: "作曲 : 宋旼琦/Long Drive/QUAIMO" },
      { time: 2, text: "编曲 : 宋旼琦/Long Drive" },
      { time: 6.14, text: "바람에 흘려보냈어\n让风儿带走了一切" },
      { time: 9.68, text: "사진, 작은 마음까지도\n照片 甚至微小的思念" },
      { time: 12.88, text: "한 글자도 보기 어려워서\n因为每一个字都难以直视" },
      { time: 16.24, text: "다 떠나보냈어\n所以我让它们全部远去" },
      { time: 19.32, text: "" },
      { time: 19.54, text: "혼자 남겨진다는 게\n独自被留下这种滋味" },
      { time: 22.95, text: "해도 적응이 안 되나 봐\n无论如何都无法习惯吧" },
      { time: 26.20, text: "소중하다는 건 과연\n所谓珍贵究竟" },
      { time: 28.57, text: "나한테 무슨 의미일까?\n对我而言有何意义呢" },
      { time: 33.00, text: "" },
      { time: 35.06, text: "I gotta get outta f***ing love\n我必须摆脱这该死的爱恋" },
      { time: 38.65, text: "Everything I said was a lie\n我说的每句话都是谎言" },
      { time: 41.79, text: "이대로 모든 게 전부\n难道说这一切就这么" },
      { time: 45.24, text: "" },
      { time: 47.11, text: "다 지울 수 있는 기억들일까?\n全部都是可以抹去的记忆吗" },
      { time: 50.52, text: "한 번씩 습관처럼 떠올라\n时不时地像习惯一样浮现" },
      { time: 53.74, text: "아침부터 밤까지 이 시간이\n从清晨到黑夜 这段时光" },
      { time: 57.12, text: "왜 이렇게 마음이 허전할까\n为何会如此令人心头空虚呢" },
      { time: 60.47, text: "" },
      { time: 60.73, text: "Uh uh uh uh 이 시간이\nUh uh uh uh 这段时光" },
      { time: 63.92, text: "Uh uh uh uh 허전할까\nUh uh uh uh 会空虚吗" },
      { time: 67.14, text: "Uh uh uh uh 이 시간이\nUh uh uh uh 这段时光" },
      { time: 70.43, text: "Uh uh uh uh 허전할까\nUh uh uh uh 会空虚吗" },
      { time: 73.80, text: "" },
      { time: 73.97, text: "잊어도 봤어 잃어도 봤어\n试着忘记过 也试着失去过" },
      { time: 75.55, text: "끝에 공허한 마음\n结局是这片虚无的心境" },
      { time: 77.22, text: "며칠을 알코올에 담겨\n连着好几天沉浸在酒精里" },
      { time: 78.21, text: "흐릿해진 시간과의 싸움\n与模糊不清的时光进行搏斗" },
      { time: 80.68, text: "" },
      { time: 80.70, text: "됐어 잘 가\n算了 走好" },
      { time: 82.26, text: "쿨하게 보냈다\n假装洒脱地放手了" },
      { time: 83.82, text: "하면서 끝자락에\n却在最后的边缘" },
      { time: 85.08, text: "지긋이 앉아있는 조각\n静静坐着那片残存的碎片" },
      { time: 86.60, text: "" },
      { time: 86.81, text: "비워지겠지 아마도\n会慢慢清空的吧 或许" },
      { time: 89.24, text: "또다시 채워지겠지 아파도\n会再次被填满吧 即使心痛" },
      { time: 92.66, text: "현실을 마주보겠지 나라도\n我也会勇敢面对现实的 至少是我" },
      { time: 96.60, text: "꿈이었을 거야 마음도\n那一切不过是南柯一梦吧 心意也是" },
      { time: 100.45, text: "" },
      { time: 101.83, text: "I gotta get outta f***ing love\n我必须摆脱这该死的爱恋" },
      { time: 105.20, text: "Everything I said was a lie\n我说的每句话都是谎言" },
      { time: 108.76, text: "이대로 모든 게 전부\n难道说这一切就这么" },
      { time: 111.87, text: "" },
      { time: 113.40, text: "다 지울 수 있는 기억들일까?\n全部都是可以抹去的记忆吗" },
      { time: 117.04, text: "한 번씩 습관처럼 떠올라\n时不时地像习惯一样浮现" },
      { time: 120.42, text: "아침부터 밤까지 이 시간이\n从清晨到黑夜 这段时光" },
      { time: 123.72, text: "왜 이렇게 마음이 허전할까\n为何会如此令人心头空虚呢" },
      { time: 126.60, text: "" },
      { time: 127.05, text: "Uh uh uh uh 이 시간이\nUh uh uh uh 这段时光" },
      { time: 130.17, text: "Uh uh uh uh 허전할까\nUh uh uh uh 会空虚吗" },
      { time: 133.41, text: "Uh uh uh uh 이 시간이\nUh uh uh uh 这段时光" },
      { time: 136.98, text: "Uh uh uh uh 허전할까\nUh uh uh uh 会空虚吗" },
      { time: 999, text: "" }
    ]
  },
  {
    name: "NO PAIN",
    singer: "Silica Gel",
    cover: "https://p2.music.126.net/tOnKfdS9B2mhwfy9qKap1Q==/109951172481636354.jpg",
    src: "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy84M2MxZTEzYzA5OGQxODU2L0lRQjNiNkVKU2hPX1NKb1VMVThPYkdVb0FjMEY5YUNXX3JSUnhhRVNwS2VFRlRnP2U9ZWcxOTVz.mp3",
    lyrics: [
      { time: 0, text: "作词 : Silica Gel\n作曲 : Silica Gel\n编曲 : Silica Gel" },
      { time: 23.72, text: "내가 만든 집에서\n在我亲手筑造的家中" },
      { time: 26.77, text: "모두 함께 노래를 합시다\n大家一起 来放声歌唱吧" },
      { time: 33.38, text: "소외됐던 사람들\n被疏远冷落的人们" },
      { time: 36.93, text: "모두 함께 노래를 합시다\n一同齐聚 来纵声高歌吧" },
      { time: 43.65, text: "우리만의 따뜻한 불\n只属于我们的温暖火苗" },
      { time: 48.24, text: "영원한 꿈 영혼과 삶\n永恒的梦 灵魂 和人生" },
      { time: 55.00, text: "난 오늘 떠날 거라 생각을 했어\n我本以为 会在今天就此离开" },
      { time: 65.58, text: "날 미워하지 마\n请不要讨厌我" },
      { time: 74.96, text: "No pain no fail" },
      { time: 77.82, text: "음악 없는 세상\n没有音乐的世界" },
      { time: 80.52, text: "Nowhere no fear" },
      { time: 82.99, text: "바다 같은 색깔\n大海一般的颜色" },
      { time: 85.72, text: "No cap no cry" },
      { time: 88.10, text: "이미 죽은 사람 아냐 사실\n其实 并非一具冰冷死尸" },
      { time: 115.55, text: "태양에 맡겨 뒀던 가족과\n曾托付给太阳的家人" },
      { time: 121.03, text: "모든 분들의 사랑\n和所有人的爱" },
      { time: 125.50, text: "밤안개 짙어진 뒤\n在夜雾渐浓后" },
      { time: 128.99, text: "훔치려고 모인 자경단\n为偷盗 而聚首的居民自卫队" },
      { time: 136.44, text: "난\n我" },
      { time: 138.53, text: "난 오늘 떠날 거라고 생각했어\n我本以为 会在今天就此离开" },
      { time: 147.17, text: "날 미워하지 마\n请不要讨厌我" },
      { time: 156.41, text: "No pain no fail" },
      { time: 159.31, text: "음악 없는 세상\n没有音乐的世界" },
      { time: 161.99, text: "Nowhere no fear" },
      { time: 164.53, text: "바다 같은 색깔\n大海一般的颜色" },
      { time: 167.15, text: "No cap no cry" },
      { time: 169.72, text: "이미 죽은 사람 아냐\n其实 并非一具冰冷死尸" },
      { time: 177.16, text: "No pain no fail" },
      { time: 179.88, text: "음악 없는 세상\n没有音乐的世界" },
      { time: 182.42, text: "Nowhere no fear" },
      { time: 184.90, text: "바다 같은 색깔\n大海一般的颜色" },
      { time: 187.46, text: "No cap no cry" },
      { time: 190.16, text: "이미 죽은 사람 아냐 사실\n其实 并非一具冰冷死尸" },
      { time: 999, text: "" }
    ]
  },
  {
    name: "Blessing",
    singer: "福梦",
    cover: "https://p2.music.126.net/ROg_0J9P9z6blyY4kimnoA==/109951169954519480.jpg",
    src: "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy84M2MxZTEzYzA5OGQxODU2L0lRQU5IdGJNYVNCN1NZNmlfZjVNUHJuY0FUTndwSFB0cTlXNG5QQ3RoN0pEbEc4P2U9eTFPdnRk.mp3",
    lyrics: [
      { time: 0, text: "作词 : 陈王晧/李浩玮\n作曲 : 陈王晧/李浩玮" },
      { time: 12.23, text: "被留下的人都在哭泣" },
      { time: 14.48, text: "明明什么都愿意抛弃" },
      { time: 16.93, text: "却还在这里 我还在这里" },
      { time: 22.14, text: "倘若 狂风吹走的是我" },
      { time: 24.48, text: "也许 你就能重新拥有" },
      { time: 26.87, text: "却还在这里 还站在原地" },
      { time: 32.19, text: "把拼图 一 片 一 片 拼起来" },
      { time: 37.44, text: "找回曾经的 痛与爱" },
      { time: 41.87, text: "就放声哭了吧 好吗？" },
      { time: 46.43, text: "每一朵花都在为我们伴舞" },
      { time: 51.41, text: "手轻放在地上 逐渐的 填满" },
      { time: 56.62, text: "你苦涩的疤痕" },
      { time: 59.80, text: "治愈了空洞的世界" },
      { time: 67.15, text: "手上生命线的分岔" },
      { time: 70.07, text: "是无法预测的动荡" },
      { time: 72.65, text: "心悬在这里 还无从下笔" },
      { time: 77.81, text: "在那参天大树阴影下" },
      { time: 80.05, text: "像只蝼蚁却有着牵挂" },
      { time: 82.59, text: "多么渺小 多么无力" },
      { time: 87.92, text: "苦难的种子被深深埋下" },
      { time: 92.79, text: "生命在黑暗中萌芽" },
      { time: 97.10, text: "就放声哭了吧 好吗？" },
      { time: 101.94, text: "每一朵花都在为我们伴舞" },
      { time: 107.17, text: "手轻放在地上 逐渐的 填满" },
      { time: 112.08, text: "你苦涩的疤痕" },
      { time: 115.43, text: "治愈了空洞的世界" },
      { time: 137.45, text: "就放声哭了吧 好吗？" },
      { time: 142.65, text: "每一朵花都在为我们伴舞" },
      { time: 147.41, text: "手轻放在地上 逐渐的 填满" },
      { time: 152.62, text: "你苦涩的疤痕" },
      { time: 155.80, text: "治愈了空洞的世界" }
    ]
  },
  {
    name: "letters from god",
    singer: "nobody likes you pat",
    cover: "https://p2.music.126.net/5NCG08qMlA5SHjnu3m99qg==/109951167937905668.jpg",
    src: "https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL3UvYy84M2MxZTEzYzA5OGQxODU2L0lRQmVsMGFQaTl0MFJibVRZajgyT3ljVkFhcTB2elJzYkF6a3RWbUVsaEJTUGhvP2U9Vmp4ME9P.mp3",
    lyrics: [
      { time: 0, text: "作词 : nobody likes you pat\n作曲 : nobody likes you pat" },
      { time: 3.64, text: "I know that you're broken\n我知晓你内心深处的脆弱" },
      { time: 17.91, text: "I know that you're scared\n我知道你或许会害怕" },
      { time: 20.90, text: "That you won't live up to who you thought you'd be\n所以你不愿意再去为了理想的自己再进一步" },
      { time: 27.14, text: "I know you've lost hope and\n你或许已经绝望" },
      { time: 31.40, text: "I know you don't care\n我知道你也不在乎" },
      { time: 34.90, text: "About anything right now, especially me\n不在乎当下的一切，尤其是我(God)" },
      { time: 41.14, text: "But I love you when you don't love me\n但孩子你要知道 你不在乎我时我依然爱着你" },
      { time: 51.65, text: "I see you when you can't see clearly\n当你对前路迷茫时我仍注视着你" },
      { time: 58.64, text: "That I'm close to you when you feel far away\n当你感觉你我之间疏离时 我依然在侧" },
      { time: 65.65, text: "I hope that you understand\n我希望你能明白" },
      { time: 69.39, text: "I'll stay with you even when the world ends\n我会一直陪伴着你 哪怕是世界末日" },
      { time: 74.40, text: "Another shooting\n枪击案一件又一件" },
      { time: 81.64, text: "Another forest fire\n森林火灾一桩又一桩" },
      { time: 84.65, text: "It's so hard for anyone to see the good\n又有谁觉得这些事情是好事呢" },
      { time: 90.65, text: "You said \"What are you doing?\n你问我：“你为什么甩手不做点什么？" },
      { time: 94.65, text: "Will I be alright?\"\n我，还能好好的吗？”" },
      { time: 98.15, text: "Let me hold you like the father that you never had would\n孩子，让我像父亲那般给予你不曾有过的怀抱吧" },
      { time: 105.15, text: "'Cause I love you when you don't love me\n只因，你不爱我时 我依然爱你" },
      { time: 111.90, text: "And I see you when you can't see clearly\n当你看不清前路时 我还是在注视着你 期待着你" },
      { time: 118.40, text: "That I'm close to you when you feel far away\n你说我们之间太过遥远 可是孩子 我们心灵的距离是如此之近" },
      { time: 125.65, text: "I hope that you understand\n我希望你能明白" },
      { time: 132.40, text: "I'm sure you've heard it said\n我知道你或许已经听腻了我的这些话" },
      { time: 134.65, text: "So many times before\n在数不清多少日子的以前" },
      { time: 138.14, text: "And maybe 'cause of that\n或许也是因为如此" },
      { time: 141.15, text: "It has no meaning anymore\n让你感觉余生空无意义" },
      { time: 144.90, text: "But sometimes simple truths\n但孩子啊，有时候" },
      { time: 148.14, text: "Are the ones you need to know\n你只需明白一个简单的事实" },
      { time: 151.66, text: "I'll never let you go\n我依然陪伴着你啊" },
      { time: 156.90, text: "I'll never let you go\n绝不会放开手" },
      { time: 162.90, text: "I'll never let you go\n不会让你感到绝望" },
      { time: 176.14, text: "I'll never let you go\n不会让你空度余生" },
      { time: 189.40, text: "I'll never, never\n绝不" },
      { time: 198.60, text: "I'll never, never\n绝对不" },
      { time: 205.09, text: "I'll never, never let you go\n绝对不会放开你的手" },
      { time: 218.35, text: "'Cause I love you when you don't love me\n只因，你不爱我时 我依然爱你" },
      { time: 224.85, text: "And I see you when you don't see clearly\n当你看不清前路时 我还是在注视着你 期待着你" },
      { time: 231.10, text: "That I'm close to you when you feel far away\n你说我们之间太过遥远 可是孩子 我们心灵的距离是如此之近" },
      { time: 238.34, text: "I hope that you understand\n我希望你能明白" },
      { time: 242.35, text: "I'll stay with you even when the world ends\n我将一直陪伴着你 哪怕是世界末日" },
      { time: 999, text: "" }
    ]
  }
];

const ReminderModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="absolute inset-0 z-[110] bg-[#fffdf5]/98 backdrop-blur-xl rounded-2xl p-5 flex flex-col items-center justify-center overflow-hidden border border-white/40 shadow-2xl"
    onClick={(e) => e.stopPropagation()}
  >
    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 hover:bg-black/5 rounded-full transition-colors z-20">
      <X className="w-4 h-4 text-gray-400" />
    </button>
    
    <div className="relative flex flex-col items-center w-full max-w-[200px]">
      {/* Speech Bubble - Compact and Centered */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", damping: 15 }}
        className="relative mb-1 w-full"
      >
        <div className="bg-white border-[1.5px] border-gray-800/50 rounded-[1.2rem] p-2 shadow-[1px_1px_0px_rgba(0,0,0,0.05)] relative z-10">
          <p className="text-gray-800 font-cute-zh text-[11px] leading-[1.3] whitespace-pre-line text-center tracking-tight">
            {`我优中选优的人生曲
其实还有更贴切的
但是还是希望基调是温暖的
从而能够为每一个你鼓劲
故此 这样一个Playlist就诞生了
✌️(o^_^o)`}
          </p>
          {/* Bubble Tail - Centered */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-[1.5px] border-r-[1.5px] border-gray-800/50 rotate-[35deg] rounded-br-sm"></div>
        </div>
      </motion.div>

      {/* Cuter Fluffy Puppy SVG with New Kaomoji Face */}
      <div className="w-16 h-16 relative">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm">
          {/* Fluffy Body */}
          <path 
            d="M60,140 Q40,180 100,185 Q160,180 140,140 Q130,110 100,115 Q70,110 60,140" 
            fill="#ffffff" 
            stroke="#4b5563" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          {/* Fluffy Head */}
          <path 
            d="M65,85 Q55,40 100,35 Q145,40 135,85 Q130,120 100,120 Q70,120 65,85" 
            fill="#ffffff" 
            stroke="#4b5563" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          {/* Droopy Fluffy Ears */}
          <path 
            d="M68,55 Q45,45 48,95 Q50,110 65,100" 
            fill="#ffffff" 
            stroke="#4b5563" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path 
            d="M132,55 Q155,45 152,95 Q150,110 135,100" 
            fill="#ffffff" 
            stroke="#4b5563" 
            strokeWidth="4" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* New Kaomoji Face */}
          <text 
            x="100" 
            y="85" 
            textAnchor="middle" 
            className="fill-gray-700 font-sans font-bold text-[32px] select-none"
          >
            ・ᴥ -
          </text>

          {/* Little Paws */}
          <circle cx="85" cy="175" r="8" fill="#ffffff" stroke="#4b5563" strokeWidth="3" />
          <circle cx="115" cy="175" r="8" fill="#ffffff" stroke="#4b5563" strokeWidth="3" />
          {/* Tiny Tail */}
          <path d="M145,155 Q165,145 158,165" fill="none" stroke="#4b5563" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  </motion.div>
);

const NansPlaylistWidget = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const currentSong = SONGS[currentSongIndex];
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  
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
    <div className={`w-[330px] rounded-2xl relative shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/20 bg-white/10 backdrop-blur-xl p-4 hover:bg-white/20 transition-all duration-300 group flex flex-col gap-3 ${isPlaylistOpen ? 'z-[100]' : 'z-10'}`}>
      {/* Playlist Modal */}
      <AnimatePresence>
        {isPlaylistOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-12 right-4 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/40 p-3 z-[100] text-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">播放列表</h4>
              <button onClick={togglePlaylist} className="p-1 hover:bg-black/5 rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[184px] overflow-y-auto pr-1 glass-scrollbar">
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

      {/* Reminder Modal */}
      <AnimatePresence>
        {isReminderOpen && <ReminderModal onClose={() => setIsReminderOpen(false)} />}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-white/90" />
          <span className="text-xs font-bold text-white/90 tracking-wider">NAN's ♡ Playlist</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsReminderOpen(true)} className="p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-95" title="提醒">
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
          <div className="h-10 overflow-hidden relative" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)' }}>
            <motion.div 
              className="absolute w-full flex flex-col gap-2"
              style={{ paddingTop: '4px' }}
              animate={{ y: -(activeIndex * 40) }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              {currentSong.lyrics.map((lyric, idx) => (
                <div 
                  key={idx} 
                  className={`h-8 flex flex-col justify-center text-[11px] transition-colors duration-300 ${idx === activeIndex ? 'text-white font-medium drop-shadow-md' : 'text-white/40'}`}
                >
                  {lyric.text.split('\n').map((line, i) => (
                    <div key={i} className="truncate leading-[16px]">{line}</div>
                  ))}
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
  const [showMoments, setShowMoments] = useState(false);
  
  // Moments interaction states
  const [momentsLikes, setMomentsLikes] = useState<string[]>([]);
  const [momentsComments, setMomentsComments] = useState<{ name: string, content: string }[]>([]);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentValue, setCommentValue] = useState("");
  
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

  useEffect(() => {
    const handleClickOutside = () => {
      setShowActionMenu(false);
      if (!commentValue.trim()) {
        setIsCommenting(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [commentValue]);

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
      {/* Note 1 Wrapper */}
      <div className="relative">
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
            <div 
              className="text-[9px] text-black/30 text-right mt-1 font-serif italic cursor-pointer hover:text-black/60 transition-colors"
              onClick={() => setShowMoments(!showMoments)}
            >
              NAN's Space
            </div>
          </div>
        </div>

        {/* Moments Interface */}
        <AnimatePresence>
          {showMoments && (
            <motion.div
              initial={{ opacity: 0, x: -20, rotate: -2, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, rotate: -2, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-0 left-[110%] w-[360px] bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header Cover */}
              <div className="h-40 bg-gray-200 relative">
                <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222330_26_569-imagetourl.cloud-1774760503999-zj6cq0.png" className="w-full h-full object-cover" alt="Cover" referrerPolicy="no-referrer" />
                <div className="absolute -bottom-6 right-4 flex items-end gap-3 z-10">
                  <span className="text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-6">未命名诗集</span>
                  <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/---imagetourl.cloud-1774760497006-tgtvus.jpg" className="w-16 h-16 rounded-xl border-2 border-white object-cover bg-white shadow-sm" alt="Avatar" referrerPolicy="no-referrer" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 pt-10 flex gap-3">
                {/* Avatar Left */}
                <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/---imagetourl.cloud-1774760497006-tgtvus.jpg" className="w-10 h-10 rounded-md object-cover flex-shrink-0" alt="Avatar" referrerPolicy="no-referrer" />
                
                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#576b95] text-[15px] mb-1">未命名诗集</div>
                  <div className="text-[15px] text-gray-800 mb-2 leading-relaxed break-words">
                    “我希望我们都能过得幸福，像炽热且阳光普照的日子一样，没有一点伤痕。”
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center mt-3 relative">
                    <span className="text-xs text-gray-400">2022年7月29日 02:34</span>
                    <div className="relative">
                      <div 
                        className="bg-gray-100 rounded px-2 py-1 flex items-center gap-1 cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(!showActionMenu);
                        }}
                      >
                        <div className="w-1 h-1 bg-[#576b95] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#576b95] rounded-full"></div>
                      </div>

                      {/* Like/Comment Action Menu */}
                      <AnimatePresence>
                        {showActionMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 10 }}
                            className="absolute right-8 top-1/2 -translate-y-1/2 bg-[#3a3a3a] rounded-md flex items-center divide-x divide-black/20 overflow-hidden z-50"
                          >
                            <button 
                              className="px-2 py-1 flex items-center gap-1.5 text-white text-[11px] hover:bg-black/10 transition-colors whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                const hasLiked = momentsLikes.includes(signature);
                                if (hasLiked) {
                                  setMomentsLikes(momentsLikes.filter(name => name !== signature));
                                } else {
                                  setMomentsLikes([...momentsLikes, signature]);
                                }
                                setShowActionMenu(false);
                              }}
                            >
                              <Heart className={`w-3 h-3 ${momentsLikes.includes(signature) ? "fill-red-500 stroke-red-500" : ""}`} />
                              {momentsLikes.includes(signature) ? "取消" : "赞"}
                            </button>
                            <button 
                              className="px-2 py-1 flex items-center gap-1.5 text-white text-[11px] hover:bg-black/10 transition-colors whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCommenting(true);
                                setShowActionMenu(false);
                              }}
                            >
                              <MessageSquare className="w-3 h-3" />
                              评论
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  {/* Likes & Comments */}
                  {(momentsLikes.length > 0 || momentsComments.length > 0) && (
                    <div className="mt-3 bg-gray-50 rounded-sm p-2 flex flex-col gap-1 relative before:content-[''] before:absolute before:-top-1 before:left-3 before:w-2 before:h-2 before:bg-gray-50 before:rotate-45">
                      {momentsLikes.length > 0 && (
                        <div className={`flex items-center gap-2 text-xs text-[#576b95] font-medium ${momentsComments.length > 0 ? "border-b border-gray-200/50 pb-1" : ""}`}>
                          <Heart className="w-3 h-3" /> {momentsLikes.join(", ")}
                        </div>
                      )}
                      {momentsComments.map((comment, idx) => (
                        <div key={idx} className="text-xs text-gray-700 pt-1 flex justify-between items-start group/comment">
                          <div className="flex-1">
                            <span className="text-[#576b95] font-medium">{comment.name}:</span> {comment.content}
                          </div>
                          {comment.name === signature && (
                            <button 
                              onClick={() => setMomentsComments(momentsComments.filter((_, i) => i !== idx))}
                              className="text-[10px] text-[#576b95] opacity-0 group-hover/comment:opacity-60 hover:opacity-100 transition-opacity ml-2"
                            >
                              删除
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <AnimatePresence>
                    {isCommenting && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-3 flex items-center gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <input 
                          autoFocus
                          type="text"
                          className="flex-1 bg-gray-100 border-none rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#576b95]"
                          placeholder="评论"
                          value={commentValue}
                          onChange={e => setCommentValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && commentValue.trim()) {
                              setMomentsComments([...momentsComments, { name: signature, content: commentValue.trim() }]);
                              setCommentValue("");
                              setIsCommenting(false);
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (commentValue.trim()) {
                              setMomentsComments([...momentsComments, { name: signature, content: commentValue.trim() }]);
                              setCommentValue("");
                              setIsCommenting(false);
                            }
                          }}
                          className="bg-[#576b95] text-white text-[10px] px-2 py-1 rounded disabled:opacity-50"
                          disabled={!commentValue.trim()}
                        >
                          发送
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
    <div className="h-screen w-screen overflow-hidden bg-[url('https://dlink.host/1drv/aHR0cHM6Ly8xZHJ2Lm1zL2kvYy84M2MxZTEzYzA5OGQxODU2L0lRRFRzZk14SzBTMVJZMnZkZ2VyQThJZUFTdXJabFduWnpnMS1zblJFbExWM2FJP2U9ZG1ia3pD.png')] bg-cover bg-center relative font-sans text-gray-900">
      <DynamicIsland hasOpenWindows={windows.length > 0} />
      <TopBar />
      
      {/* Left Column: Time & Music */}
      <div className="absolute top-24 left-16 flex flex-col gap-8">
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
