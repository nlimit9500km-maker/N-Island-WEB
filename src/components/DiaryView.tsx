import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenLine, Calendar, ChevronRight, Search, Plus, X, Trash2, Clock, Send, Lock, Mail, MapPin, Settings, User, Palette, Bell, Shield, Filter, SortAsc, MoreHorizontal, CalendarDays, BarChart2, Cloud, ArrowLeft, Camera, Image as ImageIcon, Book, Check, Type as TypeIcon, Paperclip, Link as LinkIcon, Highlighter, Bold, Underline, Strikethrough, FileText, Music, Video } from 'lucide-react';

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
  files?: { name: string; url: string; size?: string }[];
  links?: string[];
  textFormat?: {
    color?: string;
    size?: string;
    bold?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    highlight?: string;
  };
}

interface FutureLetter {
  id: string;
  createdAt: string;
  deliverAt: string;
  title: string;
  content: string;
  isDelivered: boolean;
  recipient: string;
}

export const DiaryView = () => {
  const [activeTab, setActiveTab] = useState<'moments' | 'future'>('moments');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSetting, setActiveSetting] = useState<'profile' | 'theme' | 'privacy' | 'notifications' | 'sync' | null>(null);

  // --- Moments State ---
  const [entries, setEntries] = useState<DiaryEntry[]>(() => {
    const saved = localStorage.getItem('diary_entries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary_entries', e);
      }
    }
    return [
      {
        id: '1',
        date: '2026-04-05',
        time: '14:23',
        title: '春日漫步',
        content: '今天去公园散步，看到樱花都开了。微风拂过，花瓣如雪般落下，那一刻感觉时间都静止了。生活中的小确幸大概就是如此吧。',
        mood: '😊',
        weather: '☀️',
        folder: '生活碎片',
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
        folder: '默认日记本'
      }
    ];
  });
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  
  // New Diary Form State (icity style)
  const [isAddingMoment, setIsAddingMoment] = useState(false);
  const [newMomentContent, setNewMomentContent] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [newFolder, setNewFolder] = useState('默认日记本');
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('diary_folders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary_folders', e);
      }
    }
    return ['默认日记本', '生活碎片', '旅行日记', '工作灵感', '梦境记录'];
  });
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // New features states
  const [showTextFormatMenu, setShowTextFormatMenu] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [newFiles, setNewFiles] = useState<{ name: string; url: string; size?: string }[]>([]);
  const [newLinks, setNewLinks] = useState<string[]>([]);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // New states for calendar, folders, and stats
  const [showFoldersView, setShowFoldersView] = useState(false);
  const [showStatsView, setShowStatsView] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-04-05');
  const [isCalendarEditMode, setIsCalendarEditMode] = useState(false);
  const [markedDates, setMarkedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('diary_marked_dates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary_marked_dates', e);
      }
    }
    return [];
  });
  const [calendarEvents, setCalendarEvents] = useState<{id: string, date: string, title: string}[]>(() => {
    const saved = localStorage.getItem('diary_calendar_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary_calendar_events', e);
      }
    }
    return [
      { id: 'e1', date: '2026-04-05', title: '下午3点和朋友喝咖啡' }
    ];
  });
  const [newEventTitle, setNewEventTitle] = useState('');

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem('diary_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('diary_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('diary_marked_dates', JSON.stringify(markedDates));
  }, [markedDates]);

  useEffect(() => {
    localStorage.setItem('diary_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  useEffect(() => {
    if (isAddingMoment && editorRef.current) {
      if (editorRef.current.innerHTML !== newMomentContent) {
        editorRef.current.innerHTML = newMomentContent;
      }
    }
  }, [isAddingMoment]);

  const zebraVintageColors = [
    { name: 'Dark Blue', color: '#2c3e50' },
    { name: 'Blue Gray', color: '#5d6d7e' },
    { name: 'Green Black', color: '#2d3e2d' },
    { name: 'Brown Gray', color: '#6e5a4e' },
    { name: 'Red Black', color: '#7b241c' },
    { name: 'Camel Yellow', color: '#b7950b' },
    { name: 'Cassis Red', color: '#943126' },
    { name: 'Bordeaux Purple', color: '#641e16' },
    { name: 'Sepia Black', color: '#3e2723' }
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '32px', '36px', '42px', '48px', '56px', '64px', '68px'];

  const getLinkType = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('music.163.com') || lowerUrl.includes('qq.com/music') || lowerUrl.includes('spotify.com') || lowerUrl.includes('apple.com/music')) return 'music';
    if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) return 'xhs';
    if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) return 'bilibili';
    if (lowerUrl.includes('weibo.com') || lowerUrl.includes('weibo.cn')) return 'weibo';
    if (lowerUrl.includes('douyin.com')) return 'douyin';
    return 'default';
  };

  const renderLinkCard = (link: string, isPreview = false, key?: string | number) => {
    const type = getLinkType(link);
    const commonClasses = "flex items-center gap-5 p-6 rounded-[32px] border transition-all group relative overflow-hidden w-full max-w-full backdrop-blur-2xl";
    
    const configs = {
      music: {
        bg: "bg-gradient-to-br from-rose-50/90 via-white/70 to-rose-100/80 border-rose-200/30",
        icon: <Music className="w-8 h-8 text-rose-500" />,
        text: "text-rose-950",
        label: "MUSIC · 正在播放",
        accent: "bg-rose-500/10",
        desc: "点击跳转播放",
        glow: "shadow-[0_20px_50px_rgba(244,63,94,0.12)]"
      },
      xhs: {
        bg: "bg-gradient-to-br from-red-50/90 via-white/70 to-red-100/80 border-red-200/30",
        icon: <PenLine className="w-8 h-8 text-red-500" />,
        text: "text-red-950",
        label: "XHS · 笔记详情",
        accent: "bg-red-500/10",
        desc: "查看精彩分享",
        glow: "shadow-[0_20px_50px_rgba(239,68,68,0.12)]"
      },
      bilibili: {
        bg: "bg-gradient-to-br from-sky-50/90 via-white/70 to-sky-100/80 border-sky-200/30",
        icon: <Video className="w-8 h-8 text-sky-500" />,
        text: "text-sky-950",
        label: "BILIBILI · 视频内容",
        accent: "bg-sky-500/10",
        desc: "点击观看视频",
        glow: "shadow-[0_20px_50px_rgba(14,165,233,0.12)]"
      },
      weibo: {
        bg: "bg-gradient-to-br from-orange-50/90 via-white/70 to-orange-100/80 border-orange-200/30",
        icon: <Send className="w-8 h-8 text-orange-500" />,
        text: "text-orange-950",
        label: "WEIBO · 动态详情",
        accent: "bg-orange-500/10",
        desc: "查看最新动态",
        glow: "shadow-[0_20px_50px_rgba(249,115,22,0.12)]"
      },
      douyin: {
        bg: "bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-black border-gray-700/30",
        icon: <Video className="w-8 h-8 text-white" />,
        text: "text-white",
        label: "DOUYIN · 短视频",
        accent: "bg-white/10",
        desc: "观看热门视频",
        glow: "shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
      },
      default: {
        bg: "bg-gradient-to-br from-gray-50/90 via-white/70 to-gray-100/80 border-gray-200/30",
        icon: <LinkIcon className="w-8 h-8 text-gray-500" />,
        text: "text-gray-950",
        label: "LINK · 外部链接",
        accent: "bg-gray-500/10",
        desc: "访问网页内容",
        glow: "shadow-[0_20px_50px_rgba(107,114,128,0.08)]"
      }
    };

    const config = configs[type as keyof typeof configs] || configs.default;

    return (
      <a 
        key={key}
        href={link} 
        target="_blank" 
        rel="noreferrer" 
        onClick={(e) => e.stopPropagation()}
        className={`${commonClasses} ${config.bg} ${config.glow} hover:translate-y-[-6px] hover:shadow-2xl active:scale-[0.97]`}
      >
        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 opacity-[0.08] rotate-12 pointer-events-none group-hover:scale-150 group-hover:rotate-0 transition-all duration-1000">
          {React.cloneElement(config.icon as React.ReactElement, { className: "w-48 h-48" })}
        </div>

        {/* Dynamic glass shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out pointer-events-none" />

        <div className={`w-20 h-20 rounded-[28px] ${config.accent} flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
          <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
          {config.icon}
          {/* Subtle pulse ring */}
          <div className="absolute inset-0 border-2 border-white/20 rounded-[28px] animate-ping opacity-0 group-hover:opacity-100" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${config.text} bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/50 shadow-sm`}>
              {config.label.split(' · ')[0]}
            </span>
            <span className={`text-[12px] font-bold opacity-40 ${config.text} tracking-tight italic`}>
              {config.label.split(' · ')[1] || config.desc}
            </span>
          </div>
          <h4 className={`text-xl font-black truncate ${config.text} mb-1 tracking-tighter leading-tight`}>
            {link.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
          </h4>
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${config.text} opacity-30 animate-pulse`} />
            <p className={`text-[12px] font-bold opacity-40 truncate ${config.text} tracking-wide font-mono`}>
              {link}
            </p>
          </div>
        </div>

        <div className={`w-14 h-14 rounded-[24px] ${config.accent} flex items-center justify-center shrink-0 group-hover:translate-x-3 transition-all group-hover:bg-white/40 backdrop-blur-md border border-white/20 shadow-sm`}>
          <ChevronRight className={`w-8 h-8 opacity-60 ${config.text}`} />
        </div>
        
        {isPreview && (
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setNewLinks(newLinks.filter(l => l !== link)); }}
            className="absolute top-5 right-5 p-3 text-gray-400 hover:text-red-500 bg-white/95 backdrop-blur-md rounded-[22px] shadow-2xl opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:scale-110 active:scale-90 z-20"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </a>
    );
  };

  // --- Future Letters State ---
  const [letters, setLetters] = useState<FutureLetter[]>(() => {
    const saved = localStorage.getItem('diary_letters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse diary_letters', e);
      }
    }
    return [
      {
        id: 'f1',
        createdAt: '2025-01-01',
        deliverAt: '2026-01-01',
        title: '给一年后的自己',
        content: '你好，一年后的我。你现在过得好吗？有没有实现当初的愿望？希望你依然保持热爱，奔赴山海。',
        isDelivered: true,
        recipient: '未来的我'
      },
      {
        id: 'f2',
        createdAt: '2026-04-01',
        deliverAt: '2027-04-01',
        title: '写在春天',
        content: '希望明年的春天，你已经去过了想去的地方。',
        isDelivered: false,
        recipient: '未来的我'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('diary_letters', JSON.stringify(letters));
  }, [letters]);
  const [selectedLetter, setSelectedLetter] = useState<FutureLetter | null>(null);
  const [isAddingLetter, setIsAddingLetter] = useState(false);
  const [newLetterTitle, setNewLetterTitle] = useState('');
  const [newLetterContent, setNewLetterContent] = useState('');
  const [newLetterDate, setNewLetterDate] = useState('');

  // --- Handlers ---
  const applyStyle = (styleType: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    if (styleType === 'bold') document.execCommand('bold', false, undefined);
    else if (styleType === 'underline') document.execCommand('underline', false, undefined);
    else if (styleType === 'strikethrough') document.execCommand('strikeThrough', false, undefined);
    else if (styleType === 'color') document.execCommand('foreColor', false, value);
    else if (styleType === 'fontSize' || styleType === 'highlight') {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      if (styleType === 'fontSize' && value) {
        span.style.fontSize = value;
      } else if (styleType === 'highlight' && value) {
        // Mimic WPS bottom highlight: wraps text with slight overflow
        span.style.backgroundColor = value;
        span.style.padding = '2px 4px';
        span.style.borderRadius = '3px';
        span.style.boxDecorationBreak = 'clone';
        (span.style as any).webkitBoxDecorationBreak = 'clone';
        span.style.display = 'inline';
      }
      span.appendChild(range.extractContents());
      range.insertNode(span);
      selection.removeAllRanges();
    }

    if (editorRef.current) {
      setNewMomentContent(editorRef.current.innerHTML);
    }
  };

  const handleAddMoment = () => {
    if (!newMomentContent.trim() && newImages.length === 0 && newFiles.length === 0 && newLinks.length === 0) return;
    const now = new Date();
    // Strip HTML tags for title generation
    const plainTextContent = newMomentContent.replace(/<[^>]+>/g, '');
    
    if (editingEntryId) {
      setEntries(entries.map(entry => {
        if (entry.id === editingEntryId) {
          return {
            ...entry,
            title: plainTextContent.split('\n')[0].substring(0, 15) || '无题',
            content: newMomentContent,
            images: newImages,
            location: newLocation,
            folder: newFolder,
            files: newFiles,
            links: newLinks
          };
        }
        return entry;
      }));
      setEditingEntryId(null);
    } else {
      const newEntry: DiaryEntry = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().substring(0, 5),
        title: plainTextContent.split('\n')[0].substring(0, 15) || '无题',
        content: newMomentContent,
        mood: '📝',
        weather: '☁️',
        images: newImages,
        location: newLocation,
        folder: newFolder,
        files: newFiles,
        links: newLinks
      };
      setEntries([newEntry, ...entries]);
    }
    
    setIsAddingMoment(false);
    setNewMomentContent('');
    setNewImages([]);
    setNewLocation('');
    setNewFolder('默认日记本');
    setNewFiles([]);
    setNewLinks([]);
  };

  const handleEditMoment = (entry: DiaryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntryId(entry.id);
    setNewMomentContent(entry.content);
    setNewImages(entry.images || []);
    setNewLocation(entry.location || '');
    setNewFolder(entry.folder || '默认日记本');
    setNewFiles(entry.files || []);
    setNewLinks(entry.links || []);
    setIsAddingMoment(true);
  };

  const handleDeleteMoment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEntries(entries.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) setSelectedEntry(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewImages([...newImages, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
    setShowCameraMenu(false);
  };

  const handleGetLocation = () => {
    setNewLocation('正在定位...');
    // Simulate geolocation delay
    setTimeout(() => {
      setNewLocation('中国 · 浙江省');
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      setNewFiles([...newFiles, { name: file.name, url, size }]);
    }
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      setNewLinks([...newLinks, newLinkUrl.trim()]);
      setNewLinkUrl('');
      setShowLinkMenu(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders([...folders, newFolderName.trim()]);
      setNewFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
      setShowFolderMenu(false);
    }
  };

  const handleAddLetter = () => {
    if (!newLetterTitle || !newLetterContent || !newLetterDate) return;
    const newLetter: FutureLetter = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
      deliverAt: newLetterDate,
      title: newLetterTitle,
      content: newLetterContent,
      isDelivered: false,
      recipient: '未来的我'
    };
    setLetters([newLetter, ...letters]);
    setIsAddingLetter(false);
    setNewLetterTitle('');
    setNewLetterContent('');
    setNewLetterDate('');
  };

  // --- Renderers ---
  const renderSettingsView = () => {
    if (!activeSetting) return null;

    const settingConfig = {
      profile: { title: '个人资料', icon: <User className="w-6 h-6 text-blue-500" /> },
      theme: { title: '主题装扮', icon: <Palette className="w-6 h-6 text-purple-500" /> },
      privacy: { title: '隐私密码', icon: <Shield className="w-6 h-6 text-green-500" /> },
      notifications: { title: '提醒设置', icon: <Bell className="w-6 h-6 text-orange-500" /> },
      sync: { title: '数据同步', icon: <Cloud className="w-6 h-6 text-indigo-500" /> }
    };

    const config = settingConfig[activeSetting];

    return (
      <motion.div 
        initial={{ opacity: 0, x: '100%' }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute inset-0 bg-[#f7f9f8] z-50 flex flex-col"
      >
        <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 shrink-0">
          <button onClick={() => setActiveSetting(null)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="flex-1 text-center font-bold text-gray-800 mr-7">{config.title}</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[40vh]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{config.title}设置</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              这里是{config.title}的详细配置页面。<br/>
              您可以根据个人喜好进行自定义调整，打造专属的日记体验。
            </p>
            
            {activeSetting === 'profile' && (
              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-700">头像</span>
                  <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774681518731-ajx7b8.jpg" className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-700">昵称</span>
                  <span className="text-sm text-gray-500">无棘莺落</span>
                </div>
              </div>
            )}

            {activeSetting === 'theme' && (
              <div className="mt-8 w-full grid grid-cols-3 gap-3">
                {['bg-amber-50', 'bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-rose-50', 'bg-gray-900'].map((color, i) => (
                  <div key={`theme-color-${i}`} className={`aspect-square rounded-2xl ${color} border-2 border-transparent hover:border-gray-300 cursor-pointer transition-all`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMoments = () => (
    <div className="flex-1 overflow-auto bg-[#F7F9F8] pb-28 relative">
      {/* Little Diary Header / Calendar Strip */}
      <div className="bg-white px-6 py-5 rounded-b-[2rem] shadow-sm mb-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#2c3e38]">2026年4月</span>
            <span className="text-xs text-[#8ba39e] mt-1 font-medium">今天是你记录的第 24 天</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFoldersView(true)}
              className="w-10 h-10 rounded-full bg-[#f0f4f2] flex items-center justify-center text-[#5c7a73] hover:bg-[#e2e8e4] transition-colors shadow-sm"
            >
              <Book className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowCalendarView(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${showCalendarView ? 'bg-[#5c7a73] text-white' : 'bg-[#f0f4f2] text-[#5c7a73] hover:bg-[#e2e8e4]'}`}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowStatsView(true)}
              className="w-10 h-10 rounded-full bg-[#f0f4f2] flex items-center justify-center text-[#5c7a73] hover:bg-[#e2e8e4] transition-colors shadow-sm"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Week Strip */}
        <div className="flex justify-between items-center">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => {
            const dateStr = `2026-04-0${5 + i}`;
            const isMarked = markedDates.includes(dateStr);
            return (
              <div 
                key={`week-day-${i}`} 
                onClick={() => {
                  if (isCalendarEditMode) {
                    setMarkedDates(prev => 
                      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
                    );
                  }
                }}
                className={`relative flex flex-col items-center gap-1.5 p-2 w-11 rounded-2xl transition-all ${isCalendarEditMode ? 'cursor-pointer hover:scale-105' : ''} ${i === 0 ? 'bg-[#5c7a73] text-white shadow-md' : 'text-[#8ba39e] hover:bg-[#f0f4f2]'}`}
              >
                <span className="text-[10px] font-medium">{day}</span>
                <span className="text-sm font-bold">{i === 0 ? '5' : 5 + i}</span>
                {isMarked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Entries List */}
      <div className="px-6 space-y-4 max-w-2xl mx-auto">
        {entries.filter(e => e.title.includes(searchQuery) || e.content.includes(searchQuery)).map((entry, idx) => (
          <motion.div
            key={`${entry.id}-${idx}`}
            layoutId={`moment-${entry.id}`}
            onClick={() => setSelectedEntry(entry)}
            className="bg-white p-5 rounded-3xl shadow-sm border border-[#e2e8e4] cursor-pointer hover:shadow-md transition-all flex gap-4 group"
          >
            {/* Date Column */}
            <div className="flex flex-col items-center shrink-0 w-12 pt-1">
              <span className="text-2xl font-bold text-[#2c3e38]">{entry.date.split('-')[2]}</span>
              <span className="text-[10px] text-[#8ba39e] font-medium">{entry.time}</span>
            </div>
            
            {/* Content Column */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 mb-3 pr-6 flex-wrap">
                {entry.folder && (
                  <span className="bg-[#5c7a73]/10 text-[#5c7a73] px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                    <Book className="w-3 h-3" /> {entry.folder}
                  </span>
                )}
                {entry.weather && <span className="bg-[#f0f4f2] text-[#5c7a73] px-2 py-0.5 rounded-md text-[10px] font-bold">{entry.weather}</span>}
                {entry.mood && <span className="bg-[#f0f4f2] text-[#5c7a73] px-2 py-0.5 rounded-md text-[10px] font-bold">{entry.mood}</span>}
              </div>
              
              <div 
                className="text-sm text-[#2c3e38] line-clamp-4 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
              
              {entry.files && entry.files.length > 0 && (
                <div className="flex flex-col gap-3 mb-4 w-full max-w-full overflow-hidden">
                  {entry.files.map((file, idx) => (
                    <div key={`entry-file-${idx}`} className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#f8faf9] to-[#f0f4f2] rounded-[24px] border border-[#e2e8e4] w-full shadow-sm hover:shadow-md transition-all group">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-[#5c7a73]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-[#2c3e38] truncate tracking-tight">{file.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-[#8ba39e] bg-white/50 px-2 py-0.5 rounded-md border border-gray-100">FILE</span>
                          {file.size && <p className="text-[10px] font-bold text-[#8ba39e] opacity-60">{file.size}</p>}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4 text-[#5c7a73]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entry.links && entry.links.length > 0 && (
                <div className="flex flex-col gap-2 mb-3 w-full max-w-full overflow-hidden">
                  {entry.links.map((link, idx) => renderLinkCard(link, false, idx))}
                </div>
              )}
              
              {entry.images && entry.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                  {entry.images.map((img, idx) => (
                    <img key={`entry-image-${idx}`} src={img} alt="diary" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-gray-100" />
                  ))}
                </div>
              )}

              {entry.location && (
                <div className="flex items-center gap-1 text-[10px] text-[#8ba39e] font-medium">
                  <MapPin className="w-3 h-3" />
                  {entry.location}
                </div>
              )}
              
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                <button 
                  onClick={(e) => handleEditMoment(entry, e)}
                  className="p-1.5 bg-blue-50 text-blue-400 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all"
                  title="修改"
                >
                  <PenLine className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => handleDeleteMoment(entry.id, e)}
                  className="p-1.5 bg-red-50 text-red-400 rounded-full hover:bg-red-100 hover:text-red-600 transition-all"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderFuture = () => (
    <div className="flex-1 overflow-auto p-6 bg-[#f0f4f8] relative pb-28">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#2c3e50] mb-2">时光邮局</h3>
            <p className="text-sm text-[#7f8c8d]">写给未来的自己，寄托一份期许</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter, idx) => (
            <motion.div
              key={`${letter.id}-${idx}`}
              layoutId={`letter-${letter.id}`}
              onClick={() => setSelectedLetter(letter)}
              className={`relative p-6 rounded-2xl cursor-pointer transition-all ${
                letter.isDelivered 
                  ? 'bg-[#fdfbf7] shadow-md hover:shadow-lg border border-[#e8e6e1] transform hover:-translate-y-1' 
                  : 'bg-[#e8ecef] shadow-inner border border-[#d1d8dd] opacity-80 hover:opacity-100'
              }`}
            >
              {/* Stamp decorative */}
              <div className="absolute top-4 right-4 w-10 h-12 border-2 border-dashed border-[#bdc3c7] flex items-center justify-center opacity-50 rotate-12">
                <Mail className="w-5 h-5 text-[#95a5a6]" />
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-medium mb-1">
                  {letter.isDelivered ? (
                    <span className="text-green-600 flex items-center gap-1"><Mail className="w-3 h-3"/> 已送达</span>
                  ) : (
                    <span className="text-[#7f8c8d] flex items-center gap-1"><Clock className="w-3 h-3"/> 寄送中</span>
                  )}
                </div>
                <h4 className="text-lg font-serif font-bold text-[#2c3e50] pr-12">{letter.title}</h4>
              </div>

              <div className="space-y-2 text-xs text-[#7f8c8d] font-mono bg-white/50 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span>寄出:</span>
                  <span>{letter.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>收件:</span>
                  <span className="font-bold text-[#34495e]">{letter.deliverAt}</span>
                </div>
              </div>

              {!letter.isDelivered && (
                <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                  <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm flex items-center gap-2 text-sm font-medium text-[#34495e]">
                    <Lock className="w-4 h-4" />
                    未到期
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative">
      {/* Header & User Settings Section */}
      <div className="px-6 pt-6 pb-4 flex flex-col gap-5 bg-white shrink-0 z-20 relative shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-200 to-orange-100 p-0.5 shadow-sm">
              <img src="https://pub-141831e61e69445289222976a15b6fb3.r2.dev/Image_to_url_V2/----_20260322222225_24_569-imagetourl.cloud-1774681518731-ajx7b8.jpg" className="w-full h-full rounded-full object-cover border-2 border-white" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">日记簿</h2>
              <p className="text-xs text-gray-500 font-medium">已记录 {entries.length} 篇心情</p>
            </div>
          </div>
          <button onClick={() => setActiveSetting('profile')} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Settings Horizontal Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
          <button onClick={() => setActiveSetting('profile')} className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 hover:bg-blue-50 rounded-2xl text-xs font-bold text-blue-700 whitespace-nowrap transition-colors border border-blue-100/50">
            <User className="w-4 h-4" /> 个人资料
          </button>
          <button onClick={() => setActiveSetting('theme')} className="flex items-center gap-2 px-4 py-2 bg-purple-50/50 hover:bg-purple-50 rounded-2xl text-xs font-bold text-purple-700 whitespace-nowrap transition-colors border border-purple-100/50">
            <Palette className="w-4 h-4" /> 主题装扮
          </button>
          <button onClick={() => setActiveSetting('privacy')} className="flex items-center gap-2 px-4 py-2 bg-green-50/50 hover:bg-green-50 rounded-2xl text-xs font-bold text-green-700 whitespace-nowrap transition-colors border border-green-100/50">
            <Shield className="w-4 h-4" /> 隐私密码
          </button>
          <button onClick={() => setActiveSetting('notifications')} className="flex items-center gap-2 px-4 py-2 bg-orange-50/50 hover:bg-orange-50 rounded-2xl text-xs font-bold text-orange-700 whitespace-nowrap transition-colors border border-orange-100/50">
            <Bell className="w-4 h-4" /> 提醒设置
          </button>
          <button onClick={() => setActiveSetting('sync')} className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl text-xs font-bold text-indigo-700 whitespace-nowrap transition-colors border border-indigo-100/50">
            <Cloud className="w-4 h-4" /> 数据同步
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'moments' ? (
            <motion.div 
              key="moments"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0 flex flex-col"
            >
              {renderMoments()}
            </motion.div>
          ) : (
            <motion.div 
              key="future"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="absolute inset-0 flex flex-col"
            >
              {renderFuture()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Tab Bar with Center FAB */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-6 z-40">
        <button 
          onClick={() => setActiveTab('moments')}
          className="relative flex-1 flex flex-col items-center justify-center h-full gap-1 group"
        >
          {activeTab === 'moments' && (
            <motion.div layoutId="nav-bg" className="absolute inset-0 bg-[#5c7a73]/10 rounded-2xl m-2" />
          )}
          <Clock className={`w-6 h-6 z-10 transition-colors ${activeTab === 'moments' ? 'text-[#5c7a73]' : 'text-gray-400 group-hover:text-[#5c7a73]/70'}`} />
          <span className={`text-[10px] font-bold z-10 transition-colors ${activeTab === 'moments' ? 'text-[#5c7a73]' : 'text-gray-400'}`}>定格</span>
        </button>

        {/* Center Add Button */}
        <div className="relative -top-6 z-50 px-4">
          <button 
            onClick={() => activeTab === 'moments' ? setIsAddingMoment(true) : setIsAddingLetter(true)}
            className={`w-14 h-14 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all ${activeTab === 'moments' ? 'bg-[#5c7a73] shadow-[#5c7a73]/30' : 'bg-[#34495e] shadow-[#34495e]/30'}`}
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab('future')}
          className="relative flex-1 flex flex-col items-center justify-center h-full gap-1 group"
        >
          {activeTab === 'future' && (
            <motion.div layoutId="nav-bg" className="absolute inset-0 bg-indigo-50 rounded-2xl m-2" />
          )}
          <Mail className={`w-6 h-6 z-10 transition-colors ${activeTab === 'future' ? 'text-indigo-900' : 'text-gray-400 group-hover:text-indigo-700'}`} />
          <span className={`text-[10px] font-bold z-10 transition-colors ${activeTab === 'future' ? 'text-indigo-900' : 'text-gray-400'}`}>写给未来</span>
        </button>
      </div>

      {/* Settings Overlays */}
      <AnimatePresence>
        {renderSettingsView()}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* Moment Detail Modal */}
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              layoutId={`moment-${selectedEntry.id}`}
              className="bg-[#fdfbf7] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#e2e8e4] flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#f0f4f2] rounded-full flex items-center justify-center text-xl">
                    {selectedEntry.weather}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2c3e38]">{selectedEntry.title}</h3>
                    <p className="text-xs text-[#8ba39e]">{selectedEntry.date} {selectedEntry.time}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 overflow-auto flex-1 bg-[#fdfbf7]">
                {selectedEntry.images && selectedEntry.images.length > 0 && (
                  <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide">
                    {selectedEntry.images.map((img, idx) => (
                      <img key={`selected-image-${idx}`} src={img} alt="diary" className="h-40 rounded-2xl object-cover shrink-0 border border-gray-200 shadow-sm" />
                    ))}
                  </div>
                )}
                <div 
                  className="text-[#4a635d] leading-loose whitespace-pre-wrap text-lg"
                  dangerouslySetInnerHTML={{ __html: selectedEntry.content }}
                />

                {selectedEntry.files && selectedEntry.files.length > 0 && (
                  <div className="flex flex-col gap-3 mt-6 w-full max-w-full overflow-hidden">
                    {selectedEntry.files.map((file, idx) => (
                      <div key={`selected-file-${idx}`} className="flex items-center gap-4 p-5 bg-white rounded-[28px] border border-[#e2e8e4] shadow-sm w-full hover:shadow-md transition-all group">
                        <div className="w-14 h-14 bg-[#f0f4f2] rounded-[20px] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-3 transition-transform">
                          <FileText className="w-7 h-7 text-[#5c7a73]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-[#2c3e38] truncate tracking-tight">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-[#8ba39e] bg-[#f0f4f2] px-2.5 py-1 rounded-lg">DOCUMENT</span>
                            {file.size && <p className="text-xs font-bold text-[#8ba39e] opacity-60">{file.size}</p>}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#f0f4f2]/50 flex items-center justify-center group-hover:translate-x-1 transition-all">
                          <ChevronRight className="w-6 h-6 text-[#5c7a73] opacity-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedEntry.links && selectedEntry.links.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4 w-full max-w-full overflow-hidden">
                    {selectedEntry.links.map((link, idx) => renderLinkCard(link, false, idx))}
                  </div>
                )}
                
                {selectedEntry.location && (
                  <div className="mt-8 flex items-center gap-1.5 text-sm text-[#8ba39e] font-medium bg-white px-4 py-2 rounded-xl inline-flex border border-[#e2e8e4]">
                    <MapPin className="w-4 h-4" />
                    {selectedEntry.location}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Add Moment Modal (icity style) */}
        {isAddingMoment && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 bg-white flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              <button onClick={() => { setIsAddingMoment(false); setEditingEntryId(null); }} className="text-gray-500 hover:text-gray-800 p-2 -ml-2 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
              <span className="font-bold text-gray-800">{editingEntryId ? '修改随笔' : '写随笔'}</span>
              <button 
                onClick={handleAddMoment}
                disabled={!newMomentContent.trim() && newImages.length === 0}
                className="px-4 py-1.5 bg-[#5c7a73] text-white rounded-full text-sm font-bold disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-sm"
              >
                发布
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 flex flex-col gap-4 bg-[#fcfcfc]">
              <div
                ref={editorRef}
                contentEditable
                onInput={(e) => setNewMomentContent(e.currentTarget.innerHTML)}
                data-placeholder="这一刻的想法..."
                className="w-full flex-1 outline-none bg-transparent text-gray-800 leading-relaxed font-serif overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
                style={{ minHeight: '150px' }}
              />
              
              {/* Files Preview */}
              {newFiles.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {newFiles.map((file, idx) => (
                    <div key={`new-file-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        {file.size && <p className="text-xs text-gray-400">{file.size}</p>}
                      </div>
                      <button onClick={() => setNewFiles(newFiles.filter((_, i) => i !== idx))} className="p-1 text-gray-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Links Preview */}
              {newLinks.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {newLinks.map((link, idx) => renderLinkCard(link, true, idx))}
                </div>
              )}
              
              {/* Images Preview */}
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {newImages.map((img, idx) => (
                    <div key={`new-image-${idx}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setNewImages(newImages.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Meta Info Display (Location, Folder) */}
              <div className="flex flex-wrap gap-2 mt-auto pt-6">
                {newLocation && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-bold shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {newLocation}
                    <button onClick={() => setNewLocation('')} className="ml-1 text-gray-400 hover:text-gray-700"><X className="w-3.5 h-3.5"/></button>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5c7a73]/10 border border-[#5c7a73]/20 text-[#5c7a73] rounded-full text-xs font-bold shadow-sm">
                  <Book className="w-3.5 h-3.5" />
                  {newFolder}
                </div>
              </div>
            </div>

            {/* Text Format Menu */}
            <AnimatePresence>
              {showTextFormatMenu && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gray-50 border-t border-gray-100 overflow-visible shrink-0"
                >
                  <div className="p-4 flex flex-col gap-4">
                    {/* Zebra Vintage Colors */}
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
                      {zebraVintageColors.map(item => (
                        <button 
                          key={item.color}
                          onClick={() => applyStyle('color', item.color)}
                          className="w-8 h-8 rounded-full shrink-0 border-2 transition-all border-transparent hover:scale-110"
                          style={{ backgroundColor: item.color }}
                          title={item.name}
                        />
                      ))}
                    </div>
                    {/* Tools */}
                    <div className="flex items-center gap-4">
                      <button onClick={() => applyStyle('bold')} className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-200">
                        <Bold className="w-5 h-5" />
                      </button>
                      <button onClick={() => applyStyle('underline')} className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-200">
                        <Underline className="w-5 h-5" />
                      </button>
                      <button onClick={() => applyStyle('strikethrough')} className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-200">
                        <Strikethrough className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-gray-300" />
                      <div className="relative">
                        <button onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowFontSizePicker(false); }} className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-200">
                          <Highlighter className="w-5 h-5" />
                        </button>
                        {showHighlightPicker && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 flex gap-2 z-50">
                            <button 
                              onClick={() => { applyStyle('highlight', 'transparent'); setShowHighlightPicker(false); }}
                              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center bg-white"
                              title="无标亮"
                            >
                              <div className="w-4 h-px bg-red-500 rotate-45" />
                            </button>
                            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8'].map(color => (
                              <button 
                                key={color}
                                onClick={() => { applyStyle('highlight', color); setShowHighlightPicker(false); }}
                                className="w-6 h-6 rounded-full border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-px h-6 bg-gray-300" />
                      <div className="relative">
                        <button 
                          onClick={() => { setShowFontSizePicker(!showFontSizePicker); setShowHighlightPicker(false); }} 
                          className="px-3 py-1.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-1 text-gray-500 hover:bg-gray-200"
                        >
                          字号
                          <ChevronRight className={`w-3 h-3 transition-transform ${showFontSizePicker ? 'rotate-90' : ''}`} />
                        </button>
                        {showFontSizePicker && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[80px] z-50 max-h-48 overflow-auto scrollbar-hide">
                            {fontSizes.map(size => (
                              <button 
                                key={size}
                                onClick={() => { applyStyle('fontSize', size); setShowFontSizePicker(false); }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors text-gray-600"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Toolbar */}
            <div className="h-14 border-t border-gray-100 flex items-center px-6 gap-6 bg-white shrink-0 pb-safe overflow-x-auto scrollbar-hide">
              <button onClick={() => setShowTextFormatMenu(!showTextFormatMenu)} className={`transition-colors p-2 -ml-2 rounded-full shrink-0 ${showTextFormatMenu ? 'text-[#5c7a73] bg-[#5c7a73]/10' : 'text-gray-500 hover:text-[#5c7a73]'}`}>
                <TypeIcon className="w-6 h-6" />
              </button>
              <button onClick={() => setShowCameraMenu(true)} className="text-gray-500 hover:text-[#5c7a73] transition-colors p-2 rounded-full shrink-0">
                <Camera className="w-6 h-6" />
              </button>
              <button onClick={handleGetLocation} className="text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-full shrink-0">
                <MapPin className="w-6 h-6" />
              </button>
              <button onClick={() => setShowFolderMenu(true)} className="text-gray-500 hover:text-amber-600 transition-colors p-2 rounded-full shrink-0">
                <Book className="w-6 h-6" />
              </button>
              <label className="text-gray-500 hover:text-indigo-500 transition-colors p-2 rounded-full cursor-pointer shrink-0">
                <Paperclip className="w-6 h-6" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <button onClick={() => setShowLinkMenu(true)} className="text-gray-500 hover:text-blue-500 transition-colors p-2 rounded-full shrink-0">
                <LinkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Camera Menu Action Sheet */}
            <AnimatePresence>
              {showCameraMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    onClick={() => setShowCameraMenu(false)}
                  />
                  <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] overflow-hidden pb-safe"
                  >
                    <div className="p-2">
                      <label className="flex items-center justify-center gap-3 w-full py-5 text-gray-800 font-bold border-b border-gray-100 active:bg-gray-50 cursor-pointer transition-colors">
                        <Camera className="w-5 h-5 text-blue-500" />
                        使用相机拍摄
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                      </label>
                      <label className="flex items-center justify-center gap-3 w-full py-5 text-gray-800 font-bold active:bg-gray-50 cursor-pointer transition-colors">
                        <ImageIcon className="w-5 h-5 text-green-500" />
                        从图库中选择
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <div className="h-2 bg-gray-100" />
                    <button onClick={() => setShowCameraMenu(false)} className="w-full py-5 text-gray-500 font-bold active:bg-gray-50 transition-colors">
                      取消
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Folder Menu Action Sheet */}
            <AnimatePresence>
              {showFolderMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    onClick={() => setShowFolderMenu(false)}
                  />
                  <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[70] overflow-hidden flex flex-col max-h-[70vh] pb-safe"
                  >
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <span className="font-bold text-gray-800 text-lg">选择日记本</span>
                      <button onClick={() => setIsCreatingFolder(true)} className="text-[#5c7a73] font-bold text-sm bg-[#5c7a73]/10 px-3 py-1.5 rounded-full">
                        新建
                      </button>
                    </div>
                    
                    <div className="overflow-auto p-2">
                      {isCreatingFolder && (
                        <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50/50">
                          <input 
                            autoFocus
                            type="text" 
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="输入日记本名称..."
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#5c7a73]"
                          />
                          <button onClick={handleCreateFolder} className="p-2 bg-[#5c7a73] text-white rounded-xl">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setIsCreatingFolder(false)} className="p-2 bg-gray-200 text-gray-600 rounded-xl">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {folders.map((folder, idx) => (
                        <button 
                          key={`folder-menu-${idx}`}
                          onClick={() => { setNewFolder(folder); setShowFolderMenu(false); }}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <Book className={`w-5 h-5 ${newFolder === folder ? 'text-[#5c7a73]' : 'text-gray-400'}`} />
                            <span className={`font-medium ${newFolder === folder ? 'text-[#5c7a73]' : 'text-gray-700'}`}>{folder}</span>
                          </div>
                          {newFolder === folder && <Check className="w-5 h-5 text-[#5c7a73]" />}
                        </button>
                      ))}
                    </div>
                    <div className="h-2 bg-gray-100" />
                    <button onClick={() => setShowFolderMenu(false)} className="w-full py-5 text-gray-500 font-bold active:bg-gray-50 transition-colors">
                      关闭
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Link Menu Action Sheet */}
            <AnimatePresence>
              {showLinkMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-md z-[60]"
                    onClick={() => setShowLinkMenu(false)}
                  />
                  <motion.div 
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl rounded-t-[40px] z-[70] overflow-hidden pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                          <LinkIcon className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">添加链接</h3>
                          <p className="text-xs text-gray-400 font-medium">支持音乐、视频、社交媒体等</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <div className="relative group">
                          <input 
                            autoFocus
                            type="url" 
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            placeholder="粘贴或输入链接 https://..."
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-all group-hover:border-gray-200"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setShowLinkMenu(false)}
                            className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                          >
                            取消
                          </button>
                          <button 
                            onClick={handleAddLink} 
                            className="flex-[2] py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            确认添加
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Folders View Modal */}
        <AnimatePresence>
          {showFoldersView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              onClick={() => setShowFoldersView(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 border-b border-[#e2e8e4] flex justify-between items-center bg-[#fdfbf7]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#5c7a73]/10 rounded-[22px] shadow-sm flex items-center justify-center">
                      <Book className="w-7 h-7 text-[#5c7a73]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#2c3e38] text-xl tracking-tight">日记簿分类</h3>
                      <p className="text-xs text-[#5c7a73]/60 font-bold uppercase tracking-widest">Collections</p>
                    </div>
                  </div>
                  <button onClick={() => setShowFoldersView(false)} className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all active:scale-90 border border-[#e2e8e4]">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="p-8 overflow-auto flex-1 bg-[#fdfbf7]">
                  <div className="grid grid-cols-1 gap-4">
                    {folders.map((folder, idx) => {
                      const count = entries.filter(e => e.folder === folder).length;
                      return (
                        <div 
                          key={`folder-${folder}-${idx}`} 
                          className="bg-white rounded-[28px] p-6 border border-[#e2e8e4] hover:border-[#5c7a73]/30 hover:shadow-xl hover:translate-x-1 transition-all cursor-pointer group flex items-center gap-5"
                        >
                          <div className="w-16 h-16 bg-[#5c7a73]/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Book className="w-8 h-8 text-[#5c7a73]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-[#2c3e38] text-lg mb-1 truncate tracking-tight">{folder}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-[#5c7a73] bg-[#5c7a73]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">Collection</span>
                              <p className="text-xs text-gray-400 font-bold">{count} 篇随笔</p>
                            </div>
                          </div>
                          <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-[#5c7a73] transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-8 bg-white border-t border-[#e2e8e4]">
                  <button 
                    onClick={() => setIsCreatingFolder(true)}
                    className="w-full py-5 bg-[#5c7a73] text-white font-black rounded-[24px] shadow-lg shadow-[#5c7a73]/25 hover:bg-[#4a635d] transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Plus className="w-6 h-6" />
                    创建新日记簿
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Folder Modal */}
        <AnimatePresence>
          {isCreatingFolder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              onClick={() => setIsCreatingFolder(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden p-8 border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight">新建日记本</h3>
                </div>
                <input 
                  type="text"
                  placeholder="输入日记本名称..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-gray-800"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsCreatingFolder(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
                        setFolders([...folders, newFolderName.trim()]);
                        setNewFolderName('');
                        setIsCreatingFolder(false);
                      }
                    }}
                    className="flex-1 py-4 bg-indigo-500 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95"
                  >
                    创建
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats View Modal */}
        <AnimatePresence>
          {showStatsView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              onClick={() => setShowStatsView(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white/95 backdrop-blur-xl w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 border-b border-[#e2e8e4] flex justify-between items-center bg-[#fdfbf7]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#5c7a73]/10 rounded-[22px] shadow-sm flex items-center justify-center">
                      <BarChart2 className="w-7 h-7 text-[#5c7a73]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#2c3e38] text-xl tracking-tight">记录统计</h3>
                      <p className="text-xs text-[#5c7a73]/60 font-bold uppercase tracking-widest">Insights</p>
                    </div>
                  </div>
                  <button onClick={() => setShowStatsView(false)} className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all active:scale-90 border border-[#e2e8e4]">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="p-8 space-y-8 bg-[#fdfbf7]">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-white rounded-[28px] p-6 border border-[#e2e8e4] relative overflow-hidden group hover:border-[#5c7a73]/30 transition-colors">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#5c7a73]/5 rounded-full group-hover:scale-150 transition-transform" />
                      <p className="text-[10px] font-black text-[#5c7a73]/60 uppercase tracking-widest mb-2">总日记数</p>
                      <p className="text-4xl font-black text-[#2c3e38] tracking-tighter">{entries.length}</p>
                    </div>
                    <div className="bg-white rounded-[28px] p-6 border border-[#e2e8e4] relative overflow-hidden group hover:border-[#5c7a73]/30 transition-colors">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#5c7a73]/5 rounded-full group-hover:scale-150 transition-transform" />
                      <p className="text-[10px] font-black text-[#5c7a73]/60 uppercase tracking-widest mb-2">连续记录</p>
                      <p className="text-4xl font-black text-[#2c3e38] tracking-tighter">24 <span className="text-sm font-bold opacity-40">天</span></p>
                    </div>
                    <div className="bg-white rounded-[28px] p-6 border border-[#e2e8e4] relative overflow-hidden group hover:border-[#5c7a73]/30 transition-colors">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#5c7a73]/5 rounded-full group-hover:scale-150 transition-transform" />
                      <p className="text-[10px] font-black text-[#5c7a73]/60 uppercase tracking-widest mb-2">总字数</p>
                      <p className="text-4xl font-black text-[#2c3e38] tracking-tighter">
                        {entries.reduce((acc, curr) => acc + curr.content.replace(/<[^>]*>?/gm, '').length, 0)}
                      </p>
                    </div>
                    <div className="bg-white rounded-[28px] p-6 border border-[#e2e8e4] relative overflow-hidden group hover:border-[#5c7a73]/30 transition-colors">
                      <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#5c7a73]/5 rounded-full group-hover:scale-150 transition-transform" />
                      <p className="text-[10px] font-black text-[#5c7a73]/60 uppercase tracking-widest mb-2">媒体文件</p>
                      <p className="text-4xl font-black text-[#2c3e38] tracking-tighter">
                        {entries.reduce((acc, curr) => acc + (curr.images?.length || 0) + (curr.files?.length || 0), 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[32px] p-8 border border-[#e2e8e4] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-black text-[#2c3e38] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#5c7a73]" />
                        记录时段分布
                      </h4>
                      <span className="text-[10px] font-bold text-gray-400">最近7天</span>
                    </div>
                    <div className="flex items-end gap-3 h-32">
                      {[30, 50, 20, 80, 40, 60, 90].map((height, i) => (
                        <div key={`stats-bar-${i}`} className="flex-1 flex flex-col items-center gap-3 group">
                          <div className="w-full bg-[#f0f4f2] rounded-2xl relative h-full overflow-hidden">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
                              className="absolute bottom-0 left-0 right-0 bg-[#5c7a73] rounded-2xl transition-all group-hover:brightness-110"
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 font-black tracking-tighter">{['早', '上', '中', '下', '晚', '夜', '深'][i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar View Modal (iPhone Style) */}
        <AnimatePresence>
          {showCalendarView && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
              onClick={() => setShowCalendarView(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-8 border-b border-[#e2e8e4] flex justify-between items-center bg-[#fdfbf7]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#5c7a73]/10 rounded-[22px] shadow-sm flex items-center justify-center">
                      <CalendarDays className="w-7 h-7 text-[#5c7a73]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#2c3e38] text-xl tracking-tight">2026年4月</h3>
                      <p className="text-xs text-[#5c7a73]/60 font-bold uppercase tracking-widest">April</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsCalendarEditMode(!isCalendarEditMode)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border ${isCalendarEditMode ? 'bg-[#5c7a73] text-white border-[#5c7a73] shadow-lg shadow-[#5c7a73]/20' : 'bg-white text-gray-400 hover:bg-gray-50 border-[#e2e8e4]'}`}
                    >
                      <PenLine className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowCalendarView(false)} className="w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-all active:scale-90 border border-[#e2e8e4]">
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="p-8 bg-[#fdfbf7]">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                      <div key={day} className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {/* Placeholder for days before the 1st of April 2026 (April 1st 2026 is a Wednesday) */}
                    {[null, null, null].map((_, i) => <div key={`empty-${i}`} />)}
                    
                    {Array.from({ length: 30 }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = `2026-04-${day.toString().padStart(2, '0')}`;
                      const isToday = day === 5;
                      const isSelected = selectedCalendarDate === dateStr;
                      const isMarked = markedDates.includes(dateStr);
                      const hasEvent = calendarEvents.some(e => e.date === dateStr);
                      const hasEntry = entries.some(e => e.date === dateStr);
                      
                      return (
                        <button
                          key={`calendar-day-${day}`}
                          onClick={() => {
                            if (isCalendarEditMode) {
                              setMarkedDates(prev => 
                                prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
                              );
                            } else {
                              setSelectedCalendarDate(dateStr);
                            }
                          }}
                          className={`
                            relative h-12 flex flex-col items-center justify-center rounded-2xl transition-all
                            ${isSelected && !isCalendarEditMode ? 'bg-[#5c7a73] text-white shadow-lg shadow-[#5c7a73]/20' : ''}
                            ${!isSelected && isToday ? 'text-[#5c7a73] font-black' : ''}
                            ${!isSelected && !isToday ? 'text-[#2c3e38] hover:bg-white hover:shadow-sm' : ''}
                            ${isCalendarEditMode ? 'active:scale-90 border border-dashed border-[#5c7a73]/30' : ''}
                          `}
                        >
                          <span className={`text-sm ${isSelected || isToday ? 'font-black' : 'font-bold'}`}>
                            {day}
                          </span>
                          <div className="flex gap-1 mt-1">
                            {isMarked && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />}
                            {hasEvent && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : 'bg-indigo-400'}`} />}
                            {hasEntry && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-[#5c7a73]'}`} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="p-8 bg-[#fdfbf7] border-t border-[#e2e8e4] flex-1 overflow-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-black text-[#2c3e38] tracking-tight">
                      {selectedCalendarDate === '2026-04-05' ? '今天的记录' : `${selectedCalendarDate.split('-')[1]}月${selectedCalendarDate.split('-')[2]}日`}
                    </h4>
                    <button 
                      onClick={() => {
                        setNewLetterDate(selectedCalendarDate);
                        setIsAddingLetter(true);
                      }}
                      className="text-[10px] font-black text-[#5c7a73] bg-[#5c7a73]/10 px-3 py-1.5 rounded-full uppercase tracking-wider hover:bg-[#5c7a73]/20 transition-colors"
                    >
                      + 添加提醒
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="添加新事件..." 
                        className="flex-1 bg-white border border-[#e2e8e4] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#5c7a73] font-medium text-[#2c3e38]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newEventTitle.trim()) {
                            setCalendarEvents([...calendarEvents, { id: crypto.randomUUID(), date: selectedCalendarDate, title: newEventTitle.trim() }]);
                            setNewEventTitle('');
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (newEventTitle.trim()) {
                            setCalendarEvents([...calendarEvents, { id: crypto.randomUUID(), date: selectedCalendarDate, title: newEventTitle.trim() }]);
                            setNewEventTitle('');
                          }
                        }}
                        className="px-4 bg-[#5c7a73] text-white rounded-xl font-bold text-sm hover:bg-[#4a635d] transition-colors"
                      >
                        添加
                      </button>
                    </div>

                    {markedDates.includes(selectedCalendarDate) && (
                      <div className="flex items-center gap-4 p-5 bg-white rounded-[28px] border border-rose-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6 text-rose-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-[#2c3e38] truncate tracking-tight">重要标记事项</p>
                          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-widest">用户手动标记</p>
                        </div>
                        <button 
                          onClick={() => setMarkedDates(prev => prev.filter(d => d !== selectedCalendarDate))}
                          className="p-2 hover:bg-rose-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-rose-300" />
                        </button>
                      </div>
                    )}

                    {calendarEvents.filter(e => e.date === selectedCalendarDate).map((event, idx) => (
                      <div key={`${event.id}-${idx}`} className="flex items-center gap-4 p-5 bg-white rounded-[28px] border border-indigo-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Clock className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-[#2c3e38] truncate tracking-tight">{event.title}</p>
                          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">提醒事项</p>
                        </div>
                        <button 
                          onClick={() => setCalendarEvents(prev => prev.filter(e => e.id !== event.id))}
                          className="p-2 hover:bg-indigo-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 text-indigo-300" />
                        </button>
                      </div>
                    ))}
                    
                    {entries.filter(e => e.date === selectedCalendarDate).map((entry, i) => (
                      <div 
                        key={`entry-${entry.id}-${i}`} 
                        onClick={() => { setSelectedEntry(entry); setShowCalendarView(false); }}
                        className="flex items-center gap-4 p-5 bg-white rounded-[28px] border border-[#e2e8e4] shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-[#5c7a73]/10 rounded-2xl flex items-center justify-center shrink-0">
                          <Book className="w-6 h-6 text-[#5c7a73]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-black text-[#2c3e38] truncate tracking-tight">{entry.title || '无标题随笔'}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{entry.time}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200" />
                      </div>
                    ))}
                    
                    {!markedDates.includes(selectedCalendarDate) && calendarEvents.filter(e => e.date === selectedCalendarDate).length === 0 && entries.filter(e => e.date === selectedCalendarDate).length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#e2e8e4]">
                          <CalendarDays className="w-8 h-8 text-[#5c7a73]/40" />
                        </div>
                        <p className="text-sm font-black text-[#2c3e38] mb-1">今天还没有记录</p>
                        <p className="text-xs text-gray-400 font-bold">现在去记录一段时光吧</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Letter Detail Modal (Only if delivered) */}
        {selectedLetter && selectedLetter.isDelivered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              layoutId={`letter-${selectedLetter.id}`}
              className="bg-[#fdfbf7] w-full max-w-lg rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Letter texture/styling */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="p-8 pb-4 border-b border-dashed border-gray-300 relative z-10 flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#2c3e50] mb-2">{selectedLetter.title}</h3>
                  <div className="text-sm text-[#7f8c8d] font-mono">
                    <p>From: 过去的你 ({selectedLetter.createdAt})</p>
                    <p>To: {selectedLetter.recipient} ({selectedLetter.deliverAt})</p>
                  </div>
                </div>
                <button onClick={() => setSelectedLetter(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-8 overflow-auto flex-1 relative z-10">
                <p className="text-[#34495e] leading-loose whitespace-pre-wrap font-serif text-lg">
                  {selectedLetter.content}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Add Letter Modal */}
        {isAddingLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsAddingLetter(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#fdfbf7] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden p-8 border border-[#e8e6e1]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <Send className="w-6 h-6 text-[#34495e]" />
                <h3 className="text-xl font-serif font-bold text-[#2c3e50]">写给未来的一封信</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#7f8c8d] uppercase tracking-widest mb-1">收件日期</label>
                  <input 
                    type="date" 
                    value={newLetterDate}
                    onChange={(e) => setNewLetterDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#d1d8dd] rounded-lg focus:outline-none focus:border-[#34495e] text-[#2c3e50] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7f8c8d] uppercase tracking-widest mb-1">信件主题</label>
                  <input 
                    type="text" 
                    value={newLetterTitle}
                    onChange={(e) => setNewLetterTitle(e.target.value)}
                    placeholder="致未来的我..."
                    className="w-full px-4 py-3 bg-white border border-[#d1d8dd] rounded-lg focus:outline-none focus:border-[#34495e] text-[#2c3e50] font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#7f8c8d] uppercase tracking-widest mb-1">信件内容</label>
                  <textarea 
                    value={newLetterContent}
                    onChange={(e) => setNewLetterContent(e.target.value)}
                    placeholder="你想对未来的自己说什么？"
                    rows={6}
                    className="w-full px-4 py-3 bg-white border border-[#d1d8dd] rounded-lg focus:outline-none focus:border-[#34495e] text-[#2c3e50] font-serif resize-none leading-relaxed"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setIsAddingLetter(false)}
                    className="flex-1 py-3 text-[#7f8c8d] font-bold hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    放弃
                  </button>
                  <button 
                    onClick={handleAddLetter}
                    className="flex-1 py-3 bg-[#34495e] text-white font-bold rounded-lg hover:bg-[#2c3e50] transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    封存寄出
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
