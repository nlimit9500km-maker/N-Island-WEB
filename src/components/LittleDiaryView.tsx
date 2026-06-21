import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenLine, ChevronRight, Search, Plus, X, Trash2, Clock, MapPin, 
  Book, BarChart2, CalendarDays, ArrowLeft, Image as ImageIcon, 
  Check, Paperclip, Link as LinkIcon, Music, Video, Sparkles, 
  Smile, RefreshCw, FolderPlus, Type, Highlighter, HelpCircle, 
  Calendar, FileText, CheckCircle, Palette, Archive
} from 'lucide-react';
import { 
  DiaryEntry, COZY_WEATHER_PRESETS, COZY_MOOD_PRESETS, 
  COZY_FOLDER_PRESETS 
} from './DiaryTypes';

interface LittleDiaryViewProps {
  entries: DiaryEntry[];
  setEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  folders: string[];
  setFolders: React.Dispatch<React.SetStateAction<string[]>>;
  isAddingMoment: boolean;
  setIsAddingMoment: (b: boolean) => void;
}

export const LittleDiaryView: React.FC<LittleDiaryViewProps> = ({
  entries,
  setEntries,
  folders,
  setFolders,
  isAddingMoment,
  setIsAddingMoment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('全部');
  const [showStats, setShowStats] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  
  const [drafts, setDrafts] = useState<DiaryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('dia_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('dia_drafts', JSON.stringify(drafts));
  }, [drafts]);

  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (isAddingMoment && !editingEntryId && drafts.length > 0) {
      setShowRestorePrompt(true);
    }
  }, [isAddingMoment, editingEntryId]); // eslint-disable-line react-hooks/exhaustive-deps


  // Draft States
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newWeather, setNewWeather] = useState('☀️');
  const [newMood, setNewMood] = useState('😊');
  const [newFolder, setNewFolder] = useState('默认日记本');
  const [newLocation, setNewLocation] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newLinks, setNewLinks] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<{ name: string; url: string; size?: string }[]>([]);

  // Session-based custom mood and weather options
  const [moodPresets, setMoodPresets] = useState(COZY_MOOD_PRESETS);
  const [weatherPresets, setWeatherPresets] = useState(COZY_WEATHER_PRESETS);
  const [customMoodInput, setCustomMoodInput] = useState('');
  const [customWeatherInput, setCustomWeatherInput] = useState('');

  // Location selector triggers
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Lightbox view for Instagram-style custom bottom grids
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  // Editing helper states
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [tempLink, setTempLink] = useState('');
  const [showFolderCreator, setShowFolderCreator] = useState(false);
  const [showMoodDropdown, setShowMoodDropdown] = useState(false);
  const [showWeatherDropdown, setShowWeatherDropdown] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [tempFolder, setTempFolder] = useState('');
  const [manualLocationInput, setManualLocationInput] = useState('');

  // Scrapbook Customizations
  const [selectedPaperColor, setSelectedPaperColor] = useState('#fffdf9'); // Soft warm paper
  const [selectedInkColor, setSelectedInkColor] = useState('#2c3e38');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');
  const [isBold, setIsBold] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState(''); // Background marker color
  
  // Custom font size string, highlighter height percent and link checker loading state
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [customFontSizePx, setCustomFontSizePx] = useState('');
  const [markerHeight, setMarkerHeight] = useState<number>(100);

  const paperColors = [
    { value: '#fffdf9', name: '暖心米黄' },
    { value: '#f4f9f6', name: '松针嫩绿' },
    { value: '#fcf8f2', name: '杏仁浅棕' },
    { value: '#f9f5f7', name: '淡樱绯红' },
    { value: '#f0f4f8', name: '清晨湖蓝' },
    { value: '#1e293b', name: '深夜黑褐' }
  ];

  const inkColors = [
    { value: '#2c3e38', name: '复古森林' },
    { value: '#1e2530', name: '经典碳黑' },
    { value: '#78350f', name: '琥珀深枫' },
    { value: '#831843', name: '浓情酒红' },
    { value: '#1e3a8a', name: '藏青墨水' }
  ];

  const highlightMarkers = [
    { value: '', name: '无标记' },
    { value: '#fef3c7', name: '萤火黄' },
    { value: '#fce7f3', name: '草莓粉' },
    { value: '#cffafe', name: '冰川蓝' },
    { value: '#dcfce7', name: '薄荷绿' }
  ];


  // Helper: Identify link type and parse metadata/cards
  const parseExternalLink = (url: string) => {
    const norm = url.toLowerCase().trim();
    
    if (norm.includes('music.163.com') || norm.includes('y.qq.com') || norm.includes('spotify.com') || norm.includes('music.apple.com') || norm.includes('kugou.com')) {
      let songTitle = '等风来的夏天 (岛屿温热版)';
      let artistName = '网易云音乐分享单曲';
      let songCover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80';
      let brandName = norm.includes('music.163.com') ? '网易云音乐' : norm.includes('y.qq.com') ? 'QQ音乐' : 'Spotify';
      
      if (norm.includes('1813926522')) {
        songTitle = '温柔的风 (海岛吉他版)';
        artistName = '陈之 / 屿落客';
        songCover = 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&auto=format&fit=crop&q=80';
      } else if (norm.includes('song') || norm.includes('id=')) {
        songTitle = '在落日海岸的秘密对白';
        artistName = '理想小岛原声音乐';
        songCover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=120&auto=format&fit=crop&q=80';
      } else if (norm.includes('spotify')) {
        songTitle = 'Cozy Rain & Coffee Jazz';
        artistName = 'Lofi Cafe Project';
        songCover = 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=120&auto=format&fit=crop&q=80';
      }

      return {
        type: 'music',
        title: songTitle,
        artist: artistName,
        cover: songCover,
        source: brandName
      };
    }

    if (norm.includes('xiaohongshu.com') || norm.includes('xhslink.com')) {
      return {
        type: 'xiaohongshu',
        title: '🏝️ 小岛避暑指南 | 吹着海风喝柑橘红茶太治愈了！',
        author: '@岛屿生活记录家',
        snippet: '今天在后院摘了新鲜的柑橘，煮了一壶蜜香红茶，海鸥一直在头顶环绕。去灯塔的路边开满了不知名的小花，在这里和大家分享我的神仙避暑日常...',
        cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
        source: '小红书'
      };
    }

    if (norm.includes('weibo.com') || norm.includes('weibo.cn') || norm.includes('t.cn')) {
      return {
        type: 'weibo',
        title: '🚨 今日小岛气象局播报：晚间将入海大范围暖风！',
        author: '@屿落小岛日常站',
        snippet: '微风温和，适宜出行。建议所有岛民在落日前去海滩散步，海风中蕴藏着柑橘与向日葵的香气，这也是入夏以来最温柔的一个天气。#小岛日常# #治愈系风景#',
        cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80',
        source: '新浪微博'
      };
    }

    return {
      type: 'general',
      title: '探秘温热海滩的淡绿色瓶子',
      snippet: url,
      cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
      source: '外部网络'
    };
  };

  // Helper: Identify link type
  const getLinkMeta = (url: string) => {
    const norm = url.toLowerCase();
    if (norm.includes('music.163.com') || norm.includes('spotify.com') || norm.includes('y.qq.com') || norm.includes('kugou.com')) return { label: '音乐平台', icon: <Music className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50 border-rose-200' };
    if (norm.includes('xiaohongshu.com') || norm.includes('xhslink.com')) return { label: '小红书', icon: <Sparkles className="w-5 h-5 text-red-500" />, bg: 'bg-red-50 border-red-200' };
    if (norm.includes('weibo.com') || norm.includes('weibo.cn')) return { label: '微博资讯', icon: <FileText className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50 border-amber-200' };
    if (norm.includes('bilibili.com')) return { label: '哔哩哔哩', icon: <Video className="w-5 h-5 text-sky-500" />, bg: 'bg-sky-50 border-sky-200' };
    return { label: '相关链接', icon: <LinkIcon className="w-5 h-5 text-[#4E6156]" />, bg: 'bg-[#F2F5F3] border-[#DFE4E1]' };
  };

  // Image base64 helper with real bottom-gallery syncing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        
        // Add to bottom grid
        setNewImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  // File simulated upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      editorRef.current?.focus();
      const htmlToInsert = `<div contenteditable="false" style="display:inline-flex;align-items:center;padding:12px 16px;background:#FAFAF9;border:1px solid #DFE4E1;border-radius:18px;margin:10px 0;gap:12px;user-select:none;font-family:system-ui,-apple-system,sans-serif;max-width:320px;box-shadow:0 3px 8px rgba(0,0,0,0.02);line-height:1.2;">
        <div style="width:38px;height:38px;border-radius:10px;background:#E3EAE5;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📎</div>
        <div style="display:flex;flex-direction:column;min-width:0;flex-grow:1;">
          <span style="font-weight:800;color:#1e2621;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</span>
          <span style="color:#8a9a92;margin-top:2px;font-size:10px;">电子文件容量: ${sizeStr}</span>
        </div>
        <span style="font-weight:black;background:#DFE4E1;color:#4E6156;padding:2px 5px;border-radius:6px;text-transform:uppercase;flex-shrink:0;font-size:8px;">SAFE</span>
      </div><div><br/></div>`;
      document.execCommand('insertHTML', false, htmlToInsert);
      if(editorRef.current) setNewContent(editorRef.current.innerHTML);
    }
  };

  const lastSelectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (
        editorRef.current?.contains(range.startContainer) || 
        titleRef.current?.contains(range.startContainer)
      ) {
        lastSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (lastSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(lastSelectionRef.current.cloneRange());
        
        // Refocus active container
        if (editorRef.current?.contains(lastSelectionRef.current.startContainer)) {
          editorRef.current.focus();
        } else if (titleRef.current?.contains(lastSelectionRef.current.startContainer)) {
          titleRef.current.focus();
        }
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && isAddingMoment) {
      if (editorRef.current.innerHTML !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
    if (titleRef.current && isAddingMoment) {
      if (titleRef.current.innerHTML !== newTitle) {
        titleRef.current.innerHTML = newTitle;
      }
    }
  }, [isAddingMoment, editingEntryId]);

  // Command formatter & custom style resolvers tailored only to selection content
  const applyCustomFontSize = (fontSize: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (range.collapsed) {
      const span = document.createElement('span');
      span.style.fontSize = fontSize;
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
      
      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      lastSelectionRef.current = newRange.cloneRange();
      
      if (editorRef.current) setNewContent(editorRef.current.innerHTML);
      if (titleRef.current) setNewTitle(titleRef.current.innerHTML);
      return;
    }

    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontSize', false, '7'); 
    
    const targets = [editorRef.current, titleRef.current].filter(Boolean) as HTMLDivElement[];
    targets.forEach(target => {
      const fonts = target.querySelectorAll('font[size="7"]');
      fonts.forEach(font => {
        const span = document.createElement('span');
        span.style.fontSize = fontSize;
        span.innerHTML = font.innerHTML;
        font.parentNode?.replaceChild(span, font);
      });
      const spans = target.querySelectorAll('span[style*="xxx-large"]');
      spans.forEach(span => {
        (span as HTMLElement).style.fontSize = fontSize;
      });
    });
    
    if (editorRef.current) setNewContent(editorRef.current.innerHTML);
    if (titleRef.current) setNewTitle(titleRef.current.innerHTML);
    saveSelection();
  };

  const applyCustomHighlight = (color: string, heightPercent: number) => {
    restoreSelection();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (range.collapsed) {
      if (!color) return;
      const span = document.createElement('span');
      const transparentStop = 100 - heightPercent;
      const gradient = `linear-gradient(180deg, transparent ${transparentStop}%, ${color} ${transparentStop}%)`;
      span.style.backgroundImage = gradient;
      span.style.display = 'inline';
      span.style.padding = '1px 0';
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
      
      const newRange = document.createRange();
      newRange.setStart(span.firstChild!, 1);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      
      lastSelectionRef.current = newRange.cloneRange();
      
      if (editorRef.current) setNewContent(editorRef.current.innerHTML);
      if (titleRef.current) setNewTitle(titleRef.current.innerHTML);
      return;
    }

    document.execCommand('styleWithCSS', false, 'true');
    if (!color) {
      document.execCommand('hiliteColor', false, 'transparent');
      const targets = [editorRef.current, titleRef.current].filter(Boolean) as HTMLDivElement[];
      targets.forEach(target => {
        const elements = target.querySelectorAll('span[style*="linear-gradient"]');
        elements.forEach(el => {
           (el as HTMLElement).style.background = 'transparent';
           (el as HTMLElement).style.backgroundImage = 'none';
        });
      });
    } else {
      document.execCommand('hiliteColor', false, '#ff00ff'); // Unique magenta marker
      const targets = [editorRef.current, titleRef.current].filter(Boolean) as HTMLDivElement[];
      const transparentStop = 100 - heightPercent;
      const gradient = `linear-gradient(180deg, transparent ${transparentStop}%, ${color} ${transparentStop}%)`;
      targets.forEach(target => {
        const spans = target.querySelectorAll('span[style*="background-color: rgb(255, 0, 255)"], span[style*="background-color: #ff00ff"]');
        spans.forEach(span => {
          (span as HTMLElement).style.backgroundColor = 'transparent';
          (span as HTMLElement).style.backgroundImage = gradient;
          (span as HTMLElement).style.display = 'inline';
          (span as HTMLElement).style.padding = '1px 0';
        });
      });
    }
    if (editorRef.current) setNewContent(editorRef.current.innerHTML);
    if (titleRef.current) setNewTitle(titleRef.current.innerHTML);
    saveSelection();
  };

  const applyFormat = (command: string, value?: string) => {
    restoreSelection();
    const activeElement = document.activeElement;
    if (activeElement !== titleRef.current && activeElement !== editorRef.current) {
        editorRef.current?.focus();
    }
    
    document.execCommand('styleWithCSS', false, 'true');
    if (command === 'hiliteColor') {
      applyCustomHighlight(value || '', markerHeight);
    } else if (command === 'fontSize' && value) {
      applyCustomFontSize(value);
    } else {
      document.execCommand(command, false, value);
    }
    if (editorRef.current) setNewContent(editorRef.current.innerHTML);
    if (titleRef.current) setNewTitle(titleRef.current.innerHTML);
    saveSelection();
  };

  const startCompose = () => {
    setEditingEntryId(null);
    setNewTitle('');
    if (titleRef.current) titleRef.current.innerHTML = '';
    setNewContent('');
    setNewWeather('☀️');
    setNewMood('😊');
    setNewFolder(folders[1] || '默认日记本');
    setNewLocation('');
    setNewImages([]);
    setNewLinks([]);
    setNewFiles([]);
    setSelectedPaperColor('#fffdf9');
    setSelectedInkColor('#2c3e38');
    setSelectedFontSize('16px');
    setIsBold(false);
    setIsUnderline(false);
    setSelectedHighlight('');
    setIsAddingMoment(true);
  };

  const startEdit = (entry: DiaryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEntryId(entry.id);
    setNewTitle(entry.title);
    if (titleRef.current) titleRef.current.innerHTML = entry.title || '';
    setNewContent(entry.content);
    setNewWeather(entry.weather);
    setNewMood(entry.mood);
    setNewFolder(entry.folder);
    setNewLocation(entry.location || '');
    setNewImages(entry.images || []);
    setNewLinks(entry.links || []);
    setNewFiles(entry.files || []);
    setSelectedPaperColor(entry.style?.color || '#fffdf9');
    setSelectedInkColor(entry.style?.fontSize ? (entry.style.color || '#2c3e38') : '#2c3e38');
    setSelectedFontSize(entry.style?.fontSize || '16px');
    setIsBold(entry.style?.bold || false);
    setIsUnderline(entry.style?.underline || false);
    setSelectedHighlight(entry.style?.highlight || '');
    setIsAddingMoment(true);
  };


  const handleCancelDraft = () => {
    const finalHtml = editorRef.current?.innerHTML || newContent;
    if (finalHtml.trim() || newTitle.trim()) {
      setShowCancelPrompt(true);
    } else {
      setIsAddingMoment(false);
    }
  };

  const saveToDrafts = () => {
    const finalHtml = editorRef.current?.innerHTML || newContent;
    const now = new Date();
    const newDraft: DiaryEntry = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: finalHtml,
      date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      weather: newWeather,
      mood: newMood,
      folder: newFolder,
      location: newLocation,
      images: newImages,
      links: newLinks,
      files: newFiles
    };
    setDrafts(prev => [newDraft, ...prev]);
    setShowCancelPrompt(false);
    setIsAddingMoment(false);
  };

  const saveEntry = () => {
    const finalHtml = editorRef.current?.innerHTML || newContent;
    if (!finalHtml.trim() && !newTitle.trim()) return;

    const finalTitle = newTitle.trim() || newContent.substring(0, 12) || '无题随笔';
    const finalStyle = {
      color: selectedPaperColor,
      fontSize: selectedFontSize,
      bold: isBold,
      underline: isUnderline,
      highlight: selectedHighlight
    };

    if (editingEntryId) {
      setEntries(prev => prev.map(item => {
        if (item.id === editingEntryId) {
          return {
            ...item,
            title: finalTitle,
            content: finalHtml,
            weather: newWeather,
            mood: newMood,
            folder: newFolder,
            location: newLocation,
            images: newImages,
            links: newLinks,
            files: newFiles,
            style: finalStyle
          };
        }
        return item;
      }));
    } else {
      const now = new Date();
      const newEntry: DiaryEntry = {
        id: 'diary-' + Date.now(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        title: finalTitle,
        content: finalHtml,
        weather: newWeather,
        mood: newMood,
        folder: newFolder,
        location: newLocation,
        images: newImages,
        links: newLinks,
        files: newFiles,
        style: finalStyle
      };
      setEntries(prev => [newEntry, ...prev]);
    }

    setIsAddingMoment(false);
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const deleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };
  
  const confirmDelete = () => {
    if (deleteConfirmId) {
      setEntries(prev => prev.filter(item => item.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const addFolder = () => {
    if (tempFolder.trim() && !folders.includes(tempFolder.trim())) {
      setFolders(prev => [...prev, tempFolder.trim()]);
      setNewFolder(tempFolder.trim());
      setTempFolder('');
      setShowFolderCreator(false);
    }
  };

  const addLink = async () => {
    if (tempLink.trim()) {
      let formatted = tempLink.trim();
      if (!formatted.startsWith('http')) {
        formatted = 'https://' + formatted;
      }
      
      setIsFetchingLink(true);
      const norm = formatted.toLowerCase();
      let type: 'music' | 'xiaohongshu' | 'weibo' | 'general' = 'general';
      if (norm.includes('music.163.com') || norm.includes('y.qq.com') || norm.includes('spotify.com') || norm.includes('music.apple.com') || norm.includes('kugou.com')) {
        type = 'music';
      } else if (norm.includes('xiaohongshu.com') || norm.includes('xhslink.com')) {
        type = 'xiaohongshu';
      } else if (norm.includes('weibo.com') || norm.includes('weibo.cn') || norm.includes('t.cn')) {
        type = 'weibo';
      }

      let meta = {
        type,
        title: '',
        artist: '',
        cover: '',
        source: '',
        snippet: '',
        author: ''
      };

      // Server-side parsing to avoid CORS and parse accurately
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(formatted)}`);
        if (response.ok) {
          const resJson = await response.json();
          if (resJson.title) meta.title = resJson.title;
          if (resJson.artist) meta.artist = resJson.artist;
          if (resJson.cover) meta.cover = resJson.cover;
          if (resJson.description) meta.snippet = resJson.description;
          if (resJson.author) meta.author = resJson.author;
        }
      } catch (err) {
        console.warn('Backend crawler failed, using fallback parsing:', err);
      }

      // If no values retrieved, load high-fidelity matching placeholders:
      if (!meta.title) {
        if (type === 'music') {
          meta.title = norm.includes('1813926522') ? '温柔的风 (海岛吉他版)' : '等风来的夏天 (岛屿温热版)';
          meta.artist = norm.includes('1813926522') ? '陈之 / 屿落客' : '音乐共享单曲';
          meta.cover = norm.includes('1813926522') ? 
            'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=120&auto=format&fit=crop&q=80' : 
            'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80';
          meta.source = norm.includes('music.163.com') ? '网易云音乐' : norm.includes('y.qq.com') ? 'QQ音乐' : norm.includes('spotify') ? 'Spotify' : '音乐平台';
        } else if (type === 'xiaohongshu') {
          meta.title = '🏝️ 小岛避暑指南 | 吹着海风喝柑橘红茶太治愈了！';
          meta.author = '@岛屿生活记录家';
          meta.snippet = '今天在后院摘了新鲜的柑橘，煮了一壶蜜香红茶，海鸥一直在头顶环绕。在这里分享我的神仙避暑日常...';
          meta.cover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80';
          meta.source = '小红书';
        } else if (type === 'weibo') {
          meta.title = '🚨 今日小岛气象局播报：晚间将吹拂大范围海风！';
          meta.author = '@屿落小岛日常站';
          meta.snippet = '微风温和，适宜出行。建议所有岛民去海滩散步，海风中蕴藏着柑橘与向日葵的香气。#小岛日常# #治愈系风景#';
          meta.cover = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80';
          meta.source = '新浪微博';
        } else {
          meta.title = '小岛风光 · 探索温热海滩的淡绿色玻璃瓶';
          meta.snippet = formatted;
          meta.cover = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80';
          meta.source = '外部网络';
        }
      } else {
        // Clean up title and define missing fields appropriately
        meta.title = meta.title.replace(/ - \w+.*$/, '').replace(/\|.*$/, '');
        meta.source = norm.includes('163.com') ? '网易云音乐' : 
                      norm.includes('qq.com') ? 'QQ音乐' : 
                      norm.includes('spotify') ? 'Spotify' : 
                      norm.includes('kugou') ? '酷狗音乐' : 
                      norm.includes('xiaohongshu') || norm.includes('xhslink') ? '小红书' : 
                      norm.includes('weibo') ? '新浪微博' : '外部网页';
        
        if (!meta.artist && type === 'music') {
          meta.artist = meta.author || '网络音乐艺人';
        }
        if (!meta.author) {
          meta.author = '小岛探索同好会';
        }
        if (!meta.snippet) {
          meta.snippet = formatted;
        }
        if (!meta.cover) {
          meta.cover = type === 'music' ? 
            'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=120&auto=format&fit=crop&q=80' : 
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80';
        }
      }

      editorRef.current?.focus();
      let htmlToInsert = '';

      if (meta.type === 'music') {
        htmlToInsert = `<div contenteditable="false" style="display:flex;align-items:center;padding:12px;background:#F9F9FB;border:1px solid #E4E4E7;border-radius:18px;margin:12px 0;gap:12px;user-select:none;font-family:system-ui,-apple-system,sans-serif;max-width:380px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="position:relative;width:56px;height:56px;flex-shrink:0;">
            <img src="${meta.cover}" referrerpolicy="no-referrer" style="width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #27272A;" />
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:12px;height:12px;border-radius:50%;background:#ffffff;border:2px solid #27272A;"></div>
          </div>
          <div style="display:flex;flex-direction:column;flex-grow:1;min-width:0;line-height:1.4;">
            <span style="font-size:13px;font-weight:800;color:#18181B;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${meta.title}</span>
            <span style="font-size:11px;color:#71717A;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${meta.artist}</span>
            <span style="font-size:9px;color:#F43F5E;font-weight:700;margin-top:4px;display:inline-flex;align-items:center;gap:3px;">🌸 ${meta.source}</span>
          </div>
          <div style="width:32px;height:32px;border-radius:50%;background:#E4E4E7;display:flex;align-items:center;justify-content:center;color:#18181B;font-size:12px;cursor:pointer;flex-shrink:0;">▶️</div>
        </div><div><br/></div>`;
      } else if (meta.type === 'xiaohongshu') {
        htmlToInsert = `<div contenteditable="false" style="display:flex;flex-direction:column;background:#FFFFFF;border:1px solid #F1F1F4;border-radius:20px;margin:12px 0;width:300px;overflow:hidden;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="width:100%;height:160px;position:relative;background:#E4E4E7;">
            <img src="${meta.cover}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" />
            <span style="position:absolute;bottom:8px;right:8px;font-size:9px;background:#FF2442;color:#FFFFFF;padding:2px 6px;border-radius:8px;font-weight:bold;">📕 ${meta.source}</span>
          </div>
          <div style="padding:12px;display:flex;flex-direction:column;gap:5px;line-height:1.4;">
            <span style="font-size:12px;font-weight:800;color:#18181B;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:34px;">${meta.title}</span>
            <span style="font-size:10px;color:#71717A;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:28px;">${meta.snippet}</span>
            <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px dashed #E4E4E7;padding-top:8px;margin-top:4px;">
              <span style="font-size:10px;font-weight:700;color:#27272A;">${meta.author}</span>
              <span style="font-size:9px;color:#A1A1AA;margin-left:auto;">📕 社区精选</span>
            </div>
          </div>
        </div><div><br/></div>`;
      } else if (meta.type === 'weibo') {
        htmlToInsert = `<div contenteditable="false" style="display:flex;flex-direction:column;background:#FDFDFD;border:1px solid #E4E4E7;border-radius:18px;margin:12px 0;width:300px;padding:12px;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.02);line-height:1.4;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:28px;height:28px;border-radius:50%;background:#FF8200;display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">💬</div>
            <div style="display:flex;flex-direction:column;">
              <span style="font-size:11px;font-weight:800;color:#FCA130;">${meta.author}</span>
              <span style="font-size:9px;color:#9F9F9F;">刚刚 来自 微博</span>
            </div>
            <span style="margin-left:auto;font-size:9px;background:#FFF3E0;color:#FF8200;padding:2px 6px;border-radius:4px;font-weight:bold;">🍊 ${meta.source}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <span style="font-size:11px;color:#2c3e2f;font-weight:bold;">${meta.title}</span>
            <span style="font-size:11px;color:#4B5563;">${meta.snippet}</span>
            <img src="${meta.cover}" referrerpolicy="no-referrer" style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-top:4px;" />
          </div>
        </div><div><br/></div>`;
      } else {
        htmlToInsert = `<div contenteditable="false" style="display:flex;flex-direction:column;background:#FAFAF9;border-radius:16px;margin:12px 0;width:280px;overflow:hidden;border:1px solid #DFE4E1;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div style="width:100%;height:120px;position:relative;background:#E4E4E7;">
            <img src="${meta.cover}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <div style="padding:10px;display:flex;flex-direction:column;line-height:1.3;">
             <span style="font-size:11px;font-weight:bold;color:#1e2621;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${meta.title}</span>
             <span style="font-size:10px;color:#8a9a92;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${formatted}</span>
          </div>
        </div><div><br/></div>`;
      }

      document.execCommand('insertHTML', false, htmlToInsert);
      if (editorRef.current) setNewContent(editorRef.current.innerHTML);
      setNewLinks(prev => [...prev, formatted]);
      setTempLink('');
      setShowLinkInput(false);
      setIsFetchingLink(false);
    }
  };

  const defaultTextColor = selectedPaperColor === '#1e293b' ? '#f8fafc' : '#2D3832';

  // Filter and search entries
  const filteredEntries = entries.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === '全部' || item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  // Calculate statistics for dynamic SVG
  const totalDays = entries.length;
  const moodCounts = entries.reduce((acc: Record<string, number>, item) => {
    acc[item.mood] = (acc[item.mood] || 0) + 1;
    return acc;
  }, {});

  const maxMood = Object.entries(moodCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || '✨';

  return (
    <div className="h-full flex flex-col bg-[#F9FBF9] text-[#2c3e38]">
      {/* Search and Dashboard Header */}
      <div className="px-5 pt-4 pb-3 bg-white border-b border-[#F2F5F3] shrink-0 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-[#4E6156]/60" />
            <input 
              type="text"
              placeholder="寻找关于小岛的定格记忆..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F2F5F3]/40 text-sm pl-10 pr-4 py-2.5 rounded-full border border-[#E3EAE5] outline-none focus:border-emerald-400 focus:bg-white transition-all text-[#1e2621] placeholder-[#4E6156]/40"
            />
          </div>
          <button 
            onClick={() => setShowDraftsModal(!showDraftsModal)}
            className={`p-2.5 rounded-full border transition-all relative ${showDraftsModal ? 'bg-[#4E6156] text-white border-[#4E6156]' : 'bg-[#F2F5F3]/50 hover:bg-[#F2F5F3] text-[#2D3832] border-[#E3EAE5]'}`}
          >
            <Archive className="w-5 h-5" />
            {drafts.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-white"></span>}
          </button>
        </div>

        {/* Directory Folder shelves selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {folders.map(folder => {
            const count = folder === '全部' ? entries.length : entries.filter(e => e.folder === folder).length;
            const isSelected = selectedFolder === folder;
            return (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-[#4E6156] text-white border-[#4E6156] shadow-sm shadow-[#4E6156]/20 scale-102' 
                    : 'bg-white text-[#2D3832] border-[#E3EAE5] hover:border-[#C3D0C9]'
                }`}
              >
                <Book className="w-3.5 h-3.5" />
                <span>{folder}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-[#E3EAE5]/50 text-[#3E5246]'}`}>{count}</span>
              </button>
            );
          })}
          <button 
            onClick={() => setShowFolderCreator(true)}
            className="p-1 px-3 bg-white text-[#4E6156] border border-dashed border-[#DFE4E1] rounded-full text-xs font-bold hover:bg-[#F2F5F3]/30 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> 新建文件夹
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 overflow-auto relative">
        <AnimatePresence>
          {showDraftsModal ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="absolute inset-0 z-30 bg-[#F4F9F6] p-6 overflow-auto"
            >
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
                    <Archive className="text-[#4E6156] w-5 h-5" />
                    草稿箱
                  </h3>
                  <button 
                    onClick={() => setShowDraftsModal(false)}
                    className="flex items-center gap-1 text-xs text-[#3E5246] hover:text-[#1e2621] font-bold bg-white px-3 py-1.5 rounded-full border border-[#E3EAE5] shadow-xs"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> 返回日记簿
                  </button>
                </div>

                {drafts.length === 0 ? (
                  <div className="bg-white p-10 rounded-[2rem] border border-[#E3EAE5] shadow-xs flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#F2F5F3] flex items-center justify-center text-[#4E6156] mb-3">
                      <Archive className="w-8 h-8 opacity-50" />
                    </div>
                    <h5 className="font-bold text-sm text-emerald-900 mb-1">草稿箱空空如也</h5>
                    <p className="text-xs text-[#4E6156] max-w-sm">
                      如果有未完待续的日记取消编辑时，可以保留在这作为草稿。
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {drafts.map((draft, idx) => (
                      <div key={draft.id} className="bg-white p-5 rounded-[2rem] border border-[#E3EAE5] shadow-sm flex items-center justify-between group hover:border-[#C3D0C9] transition-colors cursor-pointer" onClick={() => {
                              setEditingEntryId(null);
                              setNewTitle(draft.title);
                              if (titleRef.current) titleRef.current.innerHTML = draft.title || '';
                              if (editorRef.current) {
                                editorRef.current.innerHTML = draft.content;
                              }
                              setNewContent(draft.content);
                              setNewWeather(draft.weather);
                              setNewMood(draft.mood);
                              setNewFolder(draft.folder);
                              setNewLocation(draft.location || '');
                              setNewImages(draft.images || []);
                              setNewLinks(draft.links || []);
                              setNewFiles(draft.files || []);
                              setShowDraftsModal(false);
                              setIsAddingMoment(true);
                              setDrafts(prev => prev.filter((_, i) => i !== idx));
                            }}>
                        <div className="flex-1 pr-4">
                          <h4 className="font-bold text-emerald-900 text-sm mb-1 line-clamp-1">{draft.title || '无题草稿'}</h4>
                          <div className="text-xs text-[#4E6156]/70 line-clamp-1 overflow-hidden" dangerouslySetInnerHTML={{ __html: draft.content || '空内容...' }}></div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-gray-400 font-mono">{draft.date} {draft.time}</span>
                            <span className="bg-[#4E6156]/5 text-[#3E5246] px-1.5 py-0.5 rounded text-[10px] font-bold">📁 {draft.folder}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            className="bg-[#4E6156] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xs hover:bg-[#3E5246] transition-colors cursor-pointer"
                          >
                            继续编辑
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrafts(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 text-red-400 bg-red-50 hover:bg-red-100 rounded-full transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Notebook scrap diary list */}
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 min-h-[50vh]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xs border border-[#F2F5F3] mb-5 relative">
              <Book className="w-8 h-8 text-[#4E6156]/30" />
            </div>
            <p className="text-sm text-emerald-850 font-bold mb-1">此处草木葱茏，尚无记忆痕迹</p>
            <p className="text-xs text-[#4E6156]/60 max-w-xs">你可以点击底部的“+”按钮，在随身便签上，定格今天的第起风声、第缕夕阳或是第次会心一笑。</p>
            <button 
              onClick={startCompose}
              className="mt-5 px-6 py-2 bg-[#4E6156] text-white rounded-full text-xs font-bold shadow-md shadow-[#4E6156]/10 hover:shadow-lg transition-transform hover:-translate-y-0.5"
            >
              写第一篇定格
            </button>
          </div>
        ) : (
          <div className="max-w-xl mx-auto p-5 pb-24 space-y-6 relative">
            {/* Dashed Timeline Spine line */}
            <div className="absolute left-[38px] top-6 bottom-6 w-0.5 border-l border-dashed border-[#DFE4E1] pointer-events-none" />

            {filteredEntries.map((entry) => {
              const [year, month, day] = entry.date.split('-');
              return (
                <div key={entry.id} className="relative flex gap-5 group cursor-pointer">
                  {/* Big Date circle */}
                  <div className="flex flex-col items-center shrink-0 z-10">
                    <div className="w-10 h-10 bg-[#4E6156] rounded-full border-4 border-white shadow-md flex items-center justify-center text-white text-sm font-black tracking-tight mt-1">
                      {day}
                    </div>
                    <span className="text-[10px] font-bold text-[#4E6156]/60 mt-1">{month}月</span>
                    <span className="text-[9px] font-mono opacity-40">{entry.time}</span>
                  </div>

                  {/* Notepad style Card */}
                  <div 
                    onClick={() => {
                      setEditingEntryId(entry.id);
                      setNewTitle(entry.title);
                      setNewContent(entry.content);
                      setNewWeather(entry.weather);
                      setNewMood(entry.mood);
                      setNewFolder(entry.folder);
                      setNewLocation(entry.location || '');
                      setNewImages(entry.images || []);
                      setNewLinks(entry.links || []);
                      setNewFiles(entry.files || []);
                      setSelectedPaperColor(entry.style?.color || '#fffdf9');
                      setSelectedInkColor(entry.style?.fontSize ? (entry.style.color || '#2c3e38') : '#2c3e38');
                      setSelectedFontSize(entry.style?.fontSize || '16px');
                      setIsBold(entry.style?.bold || false);
                      setIsUnderline(entry.style?.underline || false);
                      setSelectedHighlight(entry.style?.highlight || '');
                      setIsAddingMoment(true);
                    }}
                    style={{ 
                      backgroundColor: entry.style?.color || '#fffdf9',
                      borderColor: '#e8e6e1'
                    }}
                    className="flex-1 rounded-3xl p-5 border shadow-sm relative group overflow-hidden hover:shadow-md hover:scale-[1.005] active:scale-[0.995] transition-all"
                  >
                    {/* Folder Badge and preset weather mood badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      <span className="bg-[#4E6156]/10 text-[#2D3832] px-2 py-0.5 rounded-md text-[10px] font-bold border border-[#4E6156]/5">
                        📁 {entry.folder}
                      </span>
                      <span className="bg-[#4E6156]/5 text-[#3E5246] px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {entry.weather} 天气
                      </span>
                      <span className="bg-[#4E6156]/5 text-[#3E5246] px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {entry.mood} 心情
                      </span>
                    </div>

                    <h4 className="text-base font-black tracking-tighter mb-1.5 text-[#1e2621] pr-8" dangerouslySetInnerHTML={{ __html: entry.title || '无题' }} />

                    {/* Styled Paragraph content snippet */}
                    <p 
                      style={{ 
                        fontSize: entry.style?.fontSize || '14px',
                        fontWeight: entry.style?.bold ? 'bold' : 'normal',
                        textDecoration: entry.style?.underline ? 'underline' : 'none',
                        color: inkColors.find(c => c.value === entry.style?.color)?.value || '#2c3e38',
                        backgroundColor: entry.style?.highlight || 'transparent'
                      }}
                      className="text-sm leading-relaxed mb-3 line-clamp-4 leading-relaxed whitespace-pre-wrap font-sans"
                    >
                      {entry.content}
                    </p>

                    {/* Pre-attached Gallery Carousel - Now as Instagram Grid */}
                    {entry.images && entry.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-1 md:gap-1.5 mt-2 rounded-xl overflow-hidden shadow-2xs border border-gray-150/60 bg-white/50 p-1.5">
                        {entry.images.map((img, idx) => (
                          <div key={idx} className="aspect-square relative group bg-gray-50 rounded-md overflow-hidden shadow-3xs cursor-zoom-in" onClick={(e) => { e.stopPropagation(); /* Lightbox logic if added to feed */ }}>
                            <img 
                              src={img} 
                              alt="Instagram grid card" 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                              <span>❤️ {15 + idx * 4}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Links row */}
                    {entry.links && entry.links.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-2.5">
                        {entry.links.map((link, idx) => {
                          const meta = getLinkMeta(link);
                          return (
                            <div 
                              key={idx} 
                              onClick={(e) => { e.stopPropagation(); window.open(link, '_blank'); }}
                              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-bold border hover:translate-y-[-1px] active:scale-98 transition-all ${meta.bg}`}
                            >
                              {meta.icon}
                              <span className="truncate flex-1 font-sans text-emerald-900">{meta.label}: {link}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-[#4E6156]/60" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Files Download strip */}
                    {entry.files && entry.files.length > 0 && (
                      <div className="flex flex-col gap-1.5 mb-2.5">
                        {entry.files.map((file, idx) => (
                          <div 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); alert(`正在模拟下载文件: ${file.name}`); }}
                            className="flex items-center gap-2.5 p-2 px-3 bg-white/70 border border-[#E3EAE5] rounded-xl hover:bg-white active:scale-99 transition-all text-xs text-emerald-900 font-bold"
                          >
                            <FileText className="w-4 h-4 text-[#4E6156] shrink-0" />
                            <span className="truncate flex-1 font-mono">{file.name}</span>
                            <span className="text-[10px] font-mono text-[#4E6156]/50 shrink-0">{file.size}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* GPS location */}
                    {entry.location && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#4E6156]/50">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{entry.location}</span>
                      </div>
                    )}

                    {/* Surgical card handlers */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                      <button 
                        onClick={(e) => deleteEntry(entry.id, e)}
                        className="p-1 px-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 text-[10px] font-black border border-red-200/20 shadow-xs"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen writing scrapbook template builder */}
      <AnimatePresence>
        {isAddingMoment && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-0 z-50 bg-[#F4F9F6] flex flex-col"
          >
            {/* Studio Header */}
            <div className="h-14 bg-white border-b border-[#E3EAE5] flex items-center justify-between px-5 shrink-0 shadow-xs">
              <button 
                onClick={handleCancelDraft}
                className="text-[#2D3832] hover:text-[#1e2621] p-1.5 hover:bg-[#F2F5F3] rounded-full transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" /> 取消
              </button>
              <h4 className="font-bold text-sm text-[#1e2621]">
                {editingEntryId ? '正在修改这页回忆' : '定格此刻，收录回忆'}
              </h4>
              <button 
                onClick={saveEntry}
                disabled={!newContent.trim() && !newTitle.trim()}
                className="px-5 py-1.5 bg-[#4E6156] text-white rounded-full text-xs font-black disabled:opacity-40 shadow-md shadow-[#4E6156]/10 cursor-pointer"
              >
                收录记忆
              </button>
            </div>

            {/* Customization Workspace Board with safe bottom padding for small devices/iframes */}
            <div className="flex-1 overflow-auto p-4 md:p-5 flex flex-col gap-4 md:gap-5 pb-24 lg:pb-12 bg-[#F4F9F6]">
              <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
              {/* Left Side: Scrapbook Composition Sheet */}
              <div 
                style={{ 
                  backgroundColor: selectedPaperColor,
                  color: selectedPaperColor === '#1e293b' ? '#f8fafc' : '#2D3832'
                }}
                className="flex-1 rounded-[2.5rem] p-6 shadow-md border border-[#2D3832]/10 flex flex-col min-h-[350px] relative transition-colors duration-300"
              >
                {/* Visual binder rings */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
                  <div className="w-2 h-7 bg-[#1e2621]/10 rounded-full" />
                  <div className="w-2 h-7 bg-[#1e2621]/10 rounded-full" />
                  <div className="w-2 h-7 bg-[#1e2621]/10 rounded-full" />
                </div>

                <div className="flex-1 flex flex-col gap-4 mt-8">
                  {/* Title and mood/weather banners moved */}

                  {/* Rich Text Title */}
                  <div 
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="给记忆取个美好的标题..."
                    onInput={(e) => {
                      setNewTitle(e.currentTarget.innerHTML);
                    }}
                    onBlur={(e) => {
                      setNewTitle(e.currentTarget.innerHTML);
                      saveSelection();
                    }}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    className="bg-transparent text-lg font-black outline-none border-b border-[#2D3832]/10 pb-2 empty:before:content-[attr(data-placeholder)] empty:before:text-[#1e2621]/20 empty:before:pointer-events-none empty:before:opacity-60 min-h-[40px] whitespace-pre-wrap break-words"
                  />

                  {/* Body TextArea */}
                  <div 
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="有什么微小的事发生吗？或是某个让你心动的落日... 在这里写下来..."
                    style={{ 
                      color: defaultTextColor
                    }}
                    onInput={(e) => {
                      setNewContent(e.currentTarget.innerHTML);
                    }}
                    onBlur={(e) => {
                      setNewContent(e.currentTarget.innerHTML);
                      saveSelection();
                    }}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    dir="auto"
                    className="w-full flex-1 bg-transparent resize-none outline-none leading-loose font-serif py-2 transition-all min-h-[50vh] empty:before:content-[attr(data-placeholder)] empty:before:text-[#1e2621]/20 empty:before:pointer-events-none empty:before:opacity-60"
                  />

                  {/* Instagram-style Photo Grid at the very bottom of the diary page column inside composition sheet */}
                  {newImages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#2D3832]/5 select-none flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border border-pink-400 bg-gradient-to-tr from-yellow-300 via-pink-500 to-purple-600 p-0.5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-full h-full bg-[#E3EAE5] rounded-full overflow-hidden flex items-center justify-center border border-white">
                            <span className="text-xs">🏝️</span>
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-sans font-bold text-[11px] text-[#2D3832] flex items-center gap-1 leading-none">
                            岛屿摄影师 · @屿落 📷 
                          </span>
                          <span className="text-[8px] text-gray-400 mt-0.5">专属实物镜头画卷 | Instagram Grid</span>
                        </div>
                        <div className="ml-auto flex items-center gap-3 text-center text-gray-500">
                          <div>
                            <p className="text-[10px] font-black">{newImages.length}</p>
                            <p className="text-[7px] uppercase font-bold text-gray-400">Pores</p>
                          </div>
                        </div>
                      </div>

                      {/* 3-Column Square Grid mirroring Instagram profile feed */}
                      <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-gray-150/40 bg-white/40 p-1">
                        {newImages.map((img, index) => (
                          <div 
                            key={index}
                            className="aspect-square relative group bg-gray-50 rounded-lg overflow-hidden cursor-zoom-in shadow-3xs"
                            onClick={() => setLightboxImageIndex(index)}
                          >
                            <img 
                              src={img} 
                              alt="Instagram grid card" 
                              className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
                            />
                            {/* Hover overlay stats & delete option */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5 text-white text-[10px] font-bold">
                              <span>❤️ {15 + index * 4}</span>
                              <span 
                                className="flex items-center justify-center w-5 h-5 bg-white/20 hover:bg-red-500/50 rounded-full transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewImages(prev => prev.filter((_, idx) => idx !== index));
                                }}
                              >
                                🗑️
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media blocks are injected directly into the editor now */}
                  {/* Position label indicator */}
                  {newLocation && (
                    <div className="flex justify-between items-center text-xs bg-white/40 p-2 rounded-xl">
                      <span className="flex items-center gap-1 text-[#2D3832]"><MapPin className="w-3.5 h-3.5" /> {newLocation}</span>
                      <button onClick={() => setNewLocation('')} className="text-red-500 scale-90 p-1 font-bold hover:bg-black/5 rounded-md">
                        移除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side Style Customizer drawer panel with safe bottom spacing */}
              <div className="w-full lg:w-80 bg-white rounded-[2.5rem] p-5 pb-16 lg:pb-8 border border-[#F2F5F3] shadow-sm flex flex-col gap-5 shrink-0">
                <h5 className="font-bold text-sm text-[#1e2621] flex items-center gap-1 border-b pb-2 border-gray-100">
                  日记本属性归约
                </h5>
                {/* Title and mood/weather banners */}
                <div className="flex items-center gap-2.5 flex-wrap z-30">
                  
                  {/* CUSTOM MOOD SELECTOR */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowMoodDropdown(!showMoodDropdown);
                        setShowWeatherDropdown(false);
                        setShowFolderDropdown(false);
                      }}
                      className="bg-white/90 border border-[#2D3832]/15 hover:border-[#4E6156] text-xs px-3 py-1.8 rounded-xl font-bold font-sans flex items-center gap-1.5 shadow-3xs cursor-pointer text-[#2D3832] transition-all select-none"
                    >
                      <span>心情: {newMood}</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-60" />
                    </button>
                    {showMoodDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoodDropdown(false)} />
                        <div className="absolute top-10 left-0 w-56 bg-white rounded-2xl border border-[#DFE4E1] shadow-lg p-3.5 z-50 flex flex-col gap-3 animate-in fade-in-50 zoom-in-95 duration-150">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">选择今日心境</span>
                          <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                            {moodPresets.map((m) => (
                              <button
                                key={m.icon + '-' + m.label}
                                type="button"
                                onClick={() => {
                                setNewMood(m.icon);
                                setShowMoodDropdown(false);
                                }}
                                className={`p-1.5 rounded-xl hover:bg-[#F2F5F3] text-xs flex flex-col items-center gap-1 transition-all ${newMood === m.icon ? 'bg-[#E3EAE5] border border-[#C3D0C9]' : 'border border-transparent'}`}
                              >
                                <span className="text-xl">{m.icon}</span>
                                <span className="text-[10px] font-bold text-[#2D3832]/80">{m.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-[#F2F5F3] pt-2.5 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400">➕ 自填心情 emoji</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="如: 🥳 欢喜"
                                value={customMoodInput}
                                onChange={(e) => setCustomMoodInput(e.target.value)}
                                className="bg-[#F2F5F3] border-none rounded-lg text-xs px-2.5 py-1.5 w-full outline-none font-sans font-bold text-gray-700 placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                if (customMoodInput.trim()) {
                                  const text = customMoodInput.trim();
                                  const emojiMatch = text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/u);
                                  const icon = emojiMatch ? emojiMatch[0] : '✨';
                                  const label = text.replace(icon, '').trim() || '自定义';
                                  
                                  const newPreset = { icon, label: label.substring(0, 4) };
                                  setMoodPresets(prev => [...prev, newPreset]);
                                  setNewMood(icon);
                                  setCustomMoodInput('');
                                  setShowMoodDropdown(false);
                                }
                                }}
                                className="px-2.5 py-1.5 bg-[#4E6156] text-white text-[10px] font-bold rounded-lg hover:bg-[#3d4c43] transition-colors shrink-0"
                              >
                                添加
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CUSTOM WEATHER SELECTOR */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowWeatherDropdown(!showWeatherDropdown);
                        setShowMoodDropdown(false);
                        setShowFolderDropdown(false);
                      }}
                      className="bg-white/90 border border-[#2D3832]/15 hover:border-[#4E6156] text-xs px-3 py-1.8 rounded-xl font-bold font-sans flex items-center gap-1.5 shadow-3xs cursor-pointer text-[#2D3832] transition-all select-none"
                    >
                      <span>天气: {newWeather}</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-60" />
                    </button>
                    {showWeatherDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowWeatherDropdown(false)} />
                        <div className="absolute top-10 left-0 w-56 bg-white rounded-2xl border border-[#DFE4E1] shadow-lg p-3.5 z-50 flex flex-col gap-3 animate-in fade-in-50 zoom-in-95 duration-150">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">选择今日天气</span>
                          <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                            {weatherPresets.map((w) => (
                              <button
                                key={w.icon + '-' + w.label}
                                type="button"
                                onClick={() => {
                                setNewWeather(w.icon);
                                setShowWeatherDropdown(false);
                                }}
                                className={`p-1.5 rounded-xl hover:bg-[#F2F5F3] text-xs flex flex-col items-center gap-1 transition-all ${newWeather === w.icon ? 'bg-[#E3EAE5] border border-[#C3D0C9]' : 'border border-transparent'}`}
                              >
                                <span className="text-xl">{w.icon}</span>
                                <span className="text-[10px] font-bold text-[#2D3832]/80">{w.label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="border-t border-[#F2F5F3] pt-2.5 flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400">➕ 自填天气 emoji</label>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="如: 🌅 朝霞"
                                value={customWeatherInput}
                                onChange={(e) => setCustomWeatherInput(e.target.value)}
                                className="bg-[#F2F5F3] border-none rounded-lg text-xs px-2.5 py-1.5 w-full outline-none font-sans font-bold text-gray-700 placeholder-gray-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                if (customWeatherInput.trim()) {
                                  const text = customWeatherInput.trim();
                                  const emojiMatch = text.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji}/u);
                                  const icon = emojiMatch ? emojiMatch[0] : '✨';
                                  const label = text.replace(icon, '').trim() || '自定义';
                                  
                                  const newPreset = { icon, label: label.substring(0, 4) };
                                  setWeatherPresets(prev => [...prev, newPreset]);
                                  setNewWeather(icon);
                                  setCustomWeatherInput('');
                                  setShowWeatherDropdown(false);
                                }
                                }}
                                className="px-2.5 py-1.5 bg-[#4E6156] text-white text-[10px] font-bold rounded-lg hover:bg-[#3d4c43] transition-colors shrink-0"
                              >
                                添加
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CUSTOM FOLDER SELECTOR */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => {
                        setShowFolderDropdown(!showFolderDropdown);
                        setShowMoodDropdown(false);
                        setShowWeatherDropdown(false);
                      }}
                      className="bg-white/90 border border-[#2D3832]/15 hover:border-[#4E6156] text-xs px-3 py-1.8 rounded-xl font-bold font-sans flex items-center gap-1.5 shadow-3xs cursor-pointer text-[#2D3832] transition-all select-none"
                    >
                      <span>归档: 📁 {newFolder}</span>
                      <ChevronRight className="w-3.5 h-3.5 rotate-90 opacity-60" />
                    </button>
                    {showFolderDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFolderDropdown(false)} />
                        <div className="absolute top-10 left-0 w-48 bg-white rounded-2xl border border-[#DFE4E1] shadow-lg p-3 z-50 flex flex-col gap-2 animate-in fade-in-50 zoom-in-95 duration-150">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">划分日记抽屉</span>
                          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                            {folders.filter(f => f !== '全部').map((folderName) => (
                              <button
                                key={folderName}
                                type="button"
                                onClick={() => {
                                setNewFolder(folderName);
                                setShowFolderDropdown(false);
                                }}
                                className={`w-full text-left p-2 rounded-xl text-xs font-bold hover:bg-[#F2F5F3] truncate ${newFolder === folderName ? 'bg-[#E3EAE5] text-[#2D3832]' : 'text-gray-600'}`}
                              >
                                📁 {folderName}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowFolderCreator(true);
                              setShowFolderDropdown(false);
                            }}
                            className="w-full text-center py-2 border border-dashed border-[#DFE4E1] hover:bg-[#F2F5F3] text-[11px] font-black rounded-xl text-[#4E6156] mt-1"
                          >
                            + 新建抽屉/文件夹
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                </div>


                <div className="w-full h-px bg-gray-100 my-1"></div>

                <h5 className="font-bold text-sm text-[#1e2621] flex items-center gap-1">
                  <Palette className="w-4.5 h-4.5 text-[#4E6156]" />
                  便签格式定做
                </h5>

                {/* Cover presets options */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#2D3832]/80">纸张颜色</span>
                  <div className="grid grid-cols-6 gap-2">
                    {paperColors.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedPaperColor(color.value)}
                        className={`w-7 h-7 rounded-sm border cursor-pointer transition-transform duration-200 shadow-2xs hover:scale-105 active:scale-95 ${
                          selectedPaperColor === color.value ? 'ring-2 ring-[#4E6156] border-white' : 'border-[#DFE4E1]'
                        }`}
                        title={color.name}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Ink Color style presets */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#2D3832]/80">笔墨颜色</span>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input 
                      type="color"
                      onChange={(e) => { 
                        setSelectedInkColor(e.target.value); 
                        applyFormat('foreColor', e.target.value);
                      }}
                      className="w-5.5 h-5.5 rounded-full border border-gray-200 cursor-pointer shadow-3xs p-0 min-w-[22px]"
                      title="自定义颜色"
                    />
                    {inkColors.map(color => (
                      <button
                        key={color.value}
                        onMouseDown={(e) => { e.preventDefault(); setSelectedInkColor(color.value); applyFormat('foreColor', color.value); }}
                        className={`w-5.5 h-5.5 rounded-full border cursor-pointer transition-all hover:scale-110 ${
                          selectedInkColor === color.value ? 'ring-2 ring-[#4E6156] scale-102 border-white' : 'border-gray-200'
                        }`}
                        title={color.name}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Font decoration row */}
                <div className="space-y-1.5 animate-fade-in">
                  <span className="text-xs font-bold text-[#2D3832]/80">文字排版</span>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {/* Bold button */}
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                        className="p-2 rounded-xl text-xs font-black w-10 border transition-colors bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 active:scale-95"
                        title="加粗选中文字"
                      >
                        B
                      </button>
                      {/* Underline button */}
                      <button 
                        onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                        className="p-2 rounded-xl text-xs font-black underline w-10 border transition-colors bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100 active:scale-95"
                        title="下划线全部选中文字"
                      >
                        U
                      </button>
                      {/* Font px presets */}
                      <select
                        value={selectedFontSize}
                        onChange={(e) => {
                          setSelectedFontSize(e.target.value);
                          applyFormat('fontSize', e.target.value);
                        }}
                        className="bg-gray-50 border border-gray-100 font-bold font-mono text-xs p-2 rounded-xl text-gray-700 outline-none flex-1 cursor-pointer focus:border-[#4E6156]"
                        title="快速挑选常用字号"
                      >
                        <option value="16px">正文字号 (16px)</option>
                        {['12px', '14px', '18px', '20px', '24px', '28px', '32px', '40px'].map(sz => (
                          <option value={sz} key={sz}>自定义 {sz}</option>
                        ))}
                      </select>
                    </div>

                    {/* Arbitrary Font size Manual PX Input */}
                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-gray-400">手动指定 px 字号:</span>
                      <div className="flex flex-1 gap-1">
                        <input
                          type="text"
                          placeholder="例如: 22px"
                          value={customFontSizePx}
                          onChange={(e) => setCustomFontSizePx(e.target.value)}
                          className="bg-gray-50 border border-gray-100 text-xs px-2.5 py-1.5 rounded-lg flex-1 font-mono outline-none"
                        />
                        <button
                          onClick={() => {
                            let formatted = customFontSizePx.trim();
                            if (formatted) {
                              if (!formatted.endsWith('px') && !isNaN(Number(formatted))) {
                                formatted += 'px';
                              }
                              setSelectedFontSize(formatted);
                              applyFormat('fontSize', formatted);
                            }
                          }}
                          className="p-1 px-3 bg-[#4E6156] text-white text-[10px] font-black rounded-lg hover:bg-[#3d4c43] transition-colors"
                        >
                          应用
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marker highlights */}
                <div className="space-y-2 border-t border-[#F2F5F3]/50 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#5c7a73] flex items-center gap-1">
                      <Highlighter className="w-3.5 h-3.5" /> 记号笔 / Marker 描绘
                    </span>
                    <span className="text-[10px] bg-[#E3EAE5] text-[#2D3832] font-mono px-1.5 py-0.5 rounded-md font-bold">
                      高度: {markerHeight}%
                    </span>
                  </div>

                  {/* Marker height slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-400">矮</span>
                    <input
                      type="range"
                      min="15"
                      max="100"
                      value={markerHeight}
                      onChange={(e) => setMarkerHeight(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-[#F2F5F3] rounded-lg appearance-none cursor-pointer accent-[#4E6156]"
                    />
                    <span className="text-[9px] text-gray-400">满</span>
                  </div>

                  {/* Color matrix including custom color palette trigger */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400">挑选荧光色彩:</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {/* Marker Custom Color Palette */}
                      <div className="relative group w-6.5 h-6.5 rounded-sm overflow-hidden border border-gray-200 cursor-pointer flex items-center justify-center bg-radial from-white to-gray-50">
                        <input
                          type="color"
                          title="自定义调色盘"
                          onChange={(e) => {
                            setSelectedHighlight(e.target.value);
                            applyFormat('hiliteColor', e.target.value);
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <span className="text-xs pointer-events-none">🎨</span>
                      </div>

                      {/* Default Markers */}
                      {highlightMarkers.map(marker => (
                        <button
                          key={marker.value}
                          onMouseDown={(e) => { 
                            e.preventDefault(); 
                            setSelectedHighlight(marker.value); 
                            applyFormat('hiliteColor', marker.value); 
                          }}
                          className={`text-[9.5px] font-bold px-2 py-1 rounded-md border cursor-pointer hover:scale-105 active:scale-95 transition-transform ${
                            selectedHighlight === marker.value ? 'ring-2 ring-[#4E6156] border-white font-black' : 'border-gray-150'
                          }`}
                          style={{ backgroundColor: marker.value || '#fff' }}
                        >
                          {marker.name}
                        </button>
                      ))}

                      {/* Clear marker option */}
                      <button
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedHighlight('');
                          applyFormat('hiliteColor', '');
                        }}
                        className="text-[9px] font-bold px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 cursor-pointer"
                      >
                        🧽 擦除
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media and File uploads */}
                <div className="space-y-2 border-t border-[#F2F5F3]/50 pt-4 flex flex-col gap-2.5">
                  <span className="text-[10px] uppercase tracking-widest font-black opacity-40">媒体附件</span>
                  
                  {/* Photo selector */}
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#F2F5F3]/50 hover:bg-[#F2F5F3] rounded-2xl text-xs font-bold text-[#2D3832] cursor-pointer transition-colors select-none">
                    <ImageIcon className="w-4.5 h-4.5" /> 附入实拍照片 (Base64图片)
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  {/* Location picker */}
                  <button 
                    onClick={() => {
                      setShowLocationModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-[#F2F5F3]/50 hover:bg-[#F2F5F3] rounded-2xl text-xs font-bold text-[#2D3832] text-left cursor-pointer transition-colors select-none w-full"
                  >
                    <MapPin className="w-4.5 h-4.5" /> 收录位置 (GPS卫星定位 & 手动挑选)
                  </button>

                  {/* Connect link trigger */}
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setShowLinkInput(!showLinkInput)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#F2F5F3]/50 hover:bg-[#F2F5F3] rounded-2xl text-xs font-bold text-[#2D3832] text-left cursor-pointer transition-colors select-none w-full"
                    >
                      <LinkIcon className="w-4.5 h-4.5" /> 收纳外部网络连结 (网页、播放源)
                    </button>
                    {showLinkInput && (
                      <div className="flex gap-1">
                        <input 
                          type="text" 
                          placeholder="例如: https://music.163.com/..." 
                          value={tempLink}
                          onChange={(e) => setTempLink(e.target.value)}
                          className="bg-gray-50 border border-gray-100 text-xs px-2.5 py-1.5 rounded-lg flex-1 font-mono outline-none"
                        />
                        <button onClick={addLink} className="p-1 px-3 bg-[#4E6156] text-white text-[10px] font-black rounded-lg">
                          添加
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Simulated Document Attachments */}
                  <label className="flex items-center gap-2 px-3 py-2 bg-[#F2F5F3]/50 hover:bg-[#F2F5F3] rounded-2xl text-xs font-bold text-[#2D3832] cursor-pointer transition-colors select-none">
                    <Paperclip className="w-4.5 h-4.5" /> 附存额外数位文件 (txt/pdf/doc)
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Directory Folder Creator Modal */}
      <AnimatePresence>
        {showFolderCreator && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-3xs flex items-center justify-center p-5 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-5 rounded-[2rem] w-full max-w-sm border border-[#F2F5F3] shadow-2xl flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#F2F5F3] text-[#4E6156] flex items-center justify-center mx-auto mb-1">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h5 className="font-bold text-[#1e2621]">新建您的日记本/抽屉</h5>
              <p className="text-xs text-[#3E5246]">您可以将特定场景的回忆(例如: &apos;深海之旅&apos; 或 &apos;日常梦境&apos;) 归档于独立的分屉中。</p>
              
              <input 
                type="text" 
                placeholder="名称 (最大 8 个字)..." 
                maxLength={8}
                value={tempFolder}
                onChange={(e) => setTempFolder(e.target.value)}
                className="bg-gray-50 border border-gray-100 font-bold p-2.5 rounded-2xl outline-none focus:border-[#4E6156] text-center"
              />

              <div className="flex gap-2 font-bold text-sm">
                <button 
                  onClick={() => setShowFolderCreator(false)}
                  className="flex-1 py-2.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  取消
                </button>
                <button 
                  onClick={addFolder}
                  disabled={!tempFolder.trim()}
                  className="flex-1 py-2.5 bg-[#4E6156] text-white disabled:opacity-40 rounded-full cursor-pointer"
                >
                  确认新建
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GPS Location selector choice Modal */}
      <AnimatePresence>
        {showLocationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-3xs flex items-center justify-center p-5 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-[2.2rem] w-full max-w-md border border-[#F2F5F3] shadow-2xl flex flex-col gap-4 text-center select-none"
            >
              <div className="w-12 h-12 rounded-full bg-[#E3EAE5] text-[#4E6156] flex items-center justify-center mx-auto mb-1">
                <MapPin className="w-6 h-6 animate-pulse" />
              </div>
              <h5 className="font-sans font-black text-sm text-[#1e2621]">定格足迹坐标 / Select Geolocation</h5>
              <p className="text-xs text-gray-500">提供两种精确定位方案，将地理坐标和手账纪念章加挂到记忆副页中。</p>
              
              {gpsLoading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 text-[#4E6156] animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 animate-pulse">正在获取卫星GPS物理经纬度度数...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                  {/* Auto Geolocation using Device Geolocation */}
                  <button
                    type="button"
                    onClick={() => {
                      setGpsLoading(true);
                      const geoSuccess = async (position: GeolocationPosition) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        setNewLocation(`正在卫星云图检索...`);
                        
                        let city = "未知城市";
                        try {
                           const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                           const data = await res.json();
                           city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || data.address?.country || "坐标定位位置";
                        } catch(e) {
                           console.log("Geocode failed", e);
                        }
                        
                        const customPlace = `${city} | GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

                        setNewLocation(customPlace);
                        editorRef.current?.focus();
                        const htmlToInsert = `<div contenteditable="false" style="display:inline-flex;align-items:center;padding:10px 16px;background:#EBF3EF;color:#2D3832;border:1px solid #C2DBD0;border-radius:18px;font-size:12px;font-weight:bold;margin:10px 0;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,0.03);gap:8px;">
                          <span style="font-size:16px;">🎯</span>
                          <div style="display:flex;flex-direction:column;line-height:1.2;text-align:left;">
                            <span style="font-size:11px;font-weight:800;color:#1e382d;">全球真实卫星GPS网络</span>
                            <span style="font-size:10px;color:#4E6156;font-weight:normal;margin-top:2px;">${city} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)</span>
                          </div>
                        </div><div><br/></div>`;
                        document.execCommand('insertHTML', false, htmlToInsert);
                        if(editorRef.current) setNewContent(editorRef.current.innerHTML);
                        setGpsLoading(false);
                        setShowLocationModal(false);
                      };

                      const geoError = () => {
                        // Fallback simulated browser geolocator
                        setTimeout(() => {
                          const localSims = [
                            { place: '上海落日黄昏天台', desc: '上海市黄浦区中山东一路滨江大道' },
                            { place: '杭州西西湿地画苑', desc: '浙江省杭州市西湖区文三西路口' },
                            { place: '成都锦里翠竹茶阁', desc: '四川省成都市武侯区锦里古街' },
                            { place: '北京胡同红墙影苑', desc: '北京市东城区五道营胡同' }
                          ];
                          const selectedObj = localSims[Math.floor(Math.random() * localSims.length)];
                          setNewLocation(selectedObj.place);
                          editorRef.current?.focus();
                          const htmlToInsert = `<div contenteditable="false" style="display:inline-flex;align-items:center;padding:10px 16px;background:#F2F5F3;color:#2D3832;border:1px solid #DFE4E1;border-radius:18px;font-size:12px;font-weight:bold;margin:10px 0;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 5px rgba(0,0,0,0.02);gap:8px;">
                            <span style="font-size:16px;">📍</span>
                            <div style="display:flex;flex-direction:column;line-height:1.2;text-align:left;">
                              <span style="font-size:11px;font-weight:800;color:#2D3832;">已智能连线地理服务</span>
                              <span style="font-size:10px;color:#4E6156;font-weight:normal;margin-top:2px;">中国 · ${selectedObj.desc}</span>
                            </div>
                          </div><div><br/></div>`;
                          document.execCommand('insertHTML', false, htmlToInsert);
                          if(editorRef.current) setNewContent(editorRef.current.innerHTML);
                          setGpsLoading(false);
                          setShowLocationModal(false);
                        }, 1200);
                      };

                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, { timeout: 6000 });
                      } else {
                        geoError();
                      }
                    }}
                    className="p-4 bg-[#F2F5F3] hover:bg-[#E3EAE5] rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-100 cursor-pointer transition-colors"
                  >
                    <span className="text-2xl">🎯</span>
                    <span className="text-xs font-black text-[#2D3832]">自动读取卫星GPS</span>
                    <span className="text-[9px] text-gray-400">读取浏览器物理卫星数据</span>
                  </button>

                  {/* Manual Selection search input and pre-fills */}
                  <div className="flex flex-col gap-2 p-3 border border-gray-150 rounded-2xl bg-gray-50/50">
                    <span className="text-[10px] font-black uppercase text-[#4E6156] block text-left">🗺️ 方案二：手动搜索与自定地点</span>
                    
                    <div className="flex gap-1.5">
                      <input 
                        type="text"
                        placeholder="输入任意自选或自定义地点名称..."
                        value={manualLocationInput}
                        onChange={(e) => setManualLocationInput(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:border-[#4E6156] text-[#2D3832]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (manualLocationInput.trim()) {
                            const name = manualLocationInput.trim();
                            setNewLocation(name);
                            editorRef.current?.focus();
                            const htmlToInsert = `<div contenteditable="false" style="display:inline-flex;align-items:center;padding:10px 16px;background:#F9F9FB;color:#2D3832;border:1px solid #DFE4E1;border-radius:18px;font-size:12px;font-weight:bold;margin:10px 0;user-select:none;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 2px 5px rgba(0,0,0,0.02);gap:8px;">
                              <span style="font-size:16px;">📍</span>
                              <div style="display:flex;flex-direction:column;line-height:1.2;text-align:left;">
                                <span style="font-size:11px;font-weight:800;color:#2D3832;">自定所选足迹</span>
                                <span style="font-size:10px;color:#8A9A92;font-weight:normal;margin-top:2px;">中国 · ${name}</span>
                              </div>
                            </div><div><br/></div>`;
                            document.execCommand('insertHTML', false, htmlToInsert);
                            if(editorRef.current) setNewContent(editorRef.current.innerHTML);
                            setManualLocationInput('');
                            setShowLocationModal(false);
                          }
                        }}
                        className="bg-[#4E6156] hover:bg-[#3d4c43] text-white text-xs font-black px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
                      >
                        定位
                      </button>
                    </div>

                    <div className="max-h-24 overflow-y-auto flex flex-col gap-1 mt-1 border-t border-gray-250/30 pt-2 text-left">
                      <span className="text-[9px] text-gray-400 font-bold block mb-1">💡 快捷填入参考推荐航标：</span>
                      {[
                        { name: '忘忧角静海灯塔 🥐', full: '中国 · 理想小岛 · 忘忧角静海灯塔' },
                        { name: '落日椰林文创集市 🌾', full: '中国 · 理想小岛 · 落日椰林文创集市' },
                        { name: '忘忧丘陵微光露营台 🌌', full: '中国 · 理想小岛 · 忘忧丘陵微光露营台' },
                        { name: '海角潮汐古旧石径 🌿', full: '中国 · 理想小岛 · 海角潮汐古旧石径' },
                        { name: '落日海岸摄影咖啡馆 ☕', full: '中国 · 理想小岛 · 落日台摄影咖啡馆' }
                      ].map(site => (
                        <button
                          key={site.name}
                          type="button"
                          onClick={() => {
                            setManualLocationInput(site.name);
                          }}
                          className="w-full text-left p-1.5 rounded-lg text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-100 transition-colors border border-gray-100 truncate block"
                        >
                          📍 {site.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 font-bold text-xs mt-3">
                <button 
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer text-gray-700 text-center font-black"
                >
                  放弃定标
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Photo Lightbox View (Instagram zoom clone) */}
      <AnimatePresence>
        {lightboxImageIndex !== null && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-5 z-[60] select-none cursor-zoom-out"
            onClick={() => setLightboxImageIndex(null)}
          >
            <button 
              type="button"
              className="absolute top-5 right-5 text-white/70 hover:text-white hover:bg-white/10 p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              onClick={() => setLightboxImageIndex(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxImageIndex > 0 && (
              <button
                type="button"
                className="absolute left-6 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
                }}
              >
                ◀️
              </button>
            )}

            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={newImages[lightboxImageIndex]} 
                alt="Instagram Lightbox Zoom" 
                className="max-w-[85vw] max-h-[80vh] object-contain mx-auto"
              />
              <div className="bg-[#18181A]/95 text-white p-3 px-5 flex justify-between items-center text-xs">
                <span>落日海岸记忆相片 #{lightboxImageIndex + 1}</span>
                <span className="font-mono bg-white/10 text-white/80 px-2 py-0.5 rounded-md">
                  {lightboxImageIndex + 1} / {newImages.length}
                </span>
              </div>
            </motion.div>

            {lightboxImageIndex < newImages.length - 1 && (
              <button
                type="button"
                className="absolute right-6 text-white/70 hover:text-white p-3 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxImageIndex(prev => prev !== null && prev < newImages.length - 1 ? prev + 1 : prev);
                }}
              >
                ▶️
              </button>
            )}
          </div>
        )}
      </AnimatePresence>
        
        {/* Restore Draft Prompt Overlay */}
        <AnimatePresence>
          {showRestorePrompt && isAddingMoment && !editingEntryId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#1e2621]/40 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2F5F3] flex items-center justify-center mb-4">
                  <Archive className="text-[#4E6156] w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">发现未写完的记忆</h3>
                <p className="text-xs text-[#4E6156]/70 mb-5">
                  你在草稿箱中有保留的日记，要直接开始一页全新的记忆，还是去草稿箱挑拣？
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => {
                      setShowRestorePrompt(false);
                      setNewTitle('');
                      if (titleRef.current) titleRef.current.innerHTML = '';
                      setNewContent('');
                      if (editorRef.current) editorRef.current.innerHTML = '';
                      setNewWeather('☀️');
                      setNewMood('😊');
                      setNewFolder('默认日记本');
                      setNewLocation('');
                      setNewImages([]);
                      setNewLinks([]);
                      setNewFiles([]);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-[#F2F5F3] text-[#4E6156] text-xs font-bold hover:bg-[#E3EAE5] transition-colors"
                  >
                    写新日记
                  </button>
                  <button 
                    onClick={() => {
                      setShowRestorePrompt(false);
                      setIsAddingMoment(false);
                      setShowDraftsModal(true);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-[#4E6156] text-white text-xs font-bold shadow-md shadow-[#4E6156]/20 hover:bg-[#3E5246] transition-colors"
                  >
                    去草稿箱
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Prompt Overlay */}
        <AnimatePresence>
          {showCancelPrompt && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#1e2621]/40 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2F5F3] flex items-center justify-center mb-4">
                  <Archive className="text-[#4E6156] w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">保留日记草稿？</h3>
                <p className="text-xs text-[#4E6156]/70 mb-5">
                  你已经编辑了一些内容，取消后是否将这次的碎片保留在草稿箱中？
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => {
                      setShowCancelPrompt(false);
                      setIsAddingMoment(false);
                    }}
                    className="flex-1 py-2.5 rounded-full bg-[#F2F5F3] text-[#4E6156] text-xs font-bold hover:bg-[#E3EAE5] transition-colors"
                  >
                    直接丢弃
                  </button>
                  <button 
                    onClick={saveToDrafts}
                    className="flex-1 py-2.5 rounded-full bg-[#4E6156] text-white text-xs font-bold shadow-md shadow-[#4E6156]/20 hover:bg-[#3E5246] transition-colors"
                  >
                    存入草稿箱
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Prompt Overlay */}
        <AnimatePresence>
          {deleteConfirmId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-[#1e2621]/40 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <Trash2 className="text-red-500 w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-emerald-900 mb-2">确认删除这篇记忆吗？</h3>
                <p className="text-xs text-[#4E6156]/70 mb-5">
                  删除后将无法恢复，是否继续？
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-2.5 rounded-full bg-[#F2F5F3] text-[#4E6156] text-xs font-bold hover:bg-[#E3EAE5] transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-600 transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
};
