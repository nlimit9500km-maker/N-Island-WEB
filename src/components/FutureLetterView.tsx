import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Clock, Lock, ShieldAlert, Sparkles, Check, CheckCircle, 
  Trash2, X, Plus, Calendar, ArrowRight, BookOpen, Send, Gift,
  Inbox, Archive
} from 'lucide-react';
import { 
  FutureLetter, STAMP_PRESETS, SEAL_COLORS 
} from './DiaryTypes';

const BG_PRESETS = [
  { name: '复古羊皮卷', url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800' },
  { name: '静谧深夜星', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80&w=800' },
  { name: '落樱晚霞', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800' },
  { name: '清新泥土绿', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800' },
  { name: '梦纪薰衣草', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800' }
];

interface FutureLetterProps {
  letters: FutureLetter[];
  setLetters: React.Dispatch<React.SetStateAction<FutureLetter[]>>;
  showCompose: boolean;
  setShowCompose: (b: boolean) => void;
}

export const FutureLetterView: React.FC<FutureLetterProps> = ({
  letters,
  setLetters,
  showCompose,
  setShowCompose
}) => {
  const [nowTime, setNowTime] = useState<number>(() => Date.now());

  // Active Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Time utilities
  const formatCountdown = (deliverStr: string) => {
    const deliverDate = new Date(deliverStr).getTime();
    const diff = deliverDate - nowTime;
    
    if (diff <= 0) return '已送达';

    const secs = Math.floor(diff / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    const displayHrs = hrs % 24;
    const displayMins = mins % 60;
    const displaySecs = secs % 60;

    return `${days}天 ${displayHrs}时 ${displayMins}分 ${displaySecs}秒`;
  };

  // Compose State (Now lifted to props)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('未来的我');
  const [deliveryYear, setDeliveryYear] = useState('1'); // '1' year, '3' years, '5' years, or 'custom'
  const [customDate, setCustomDate] = useState('');
  const [selectedStamp, setSelectedStamp] = useState('stamp-butterfly');
  const [selectedSeal, setSelectedSeal] = useState('#9e2a2b');
  
  // New States
  const [letterType, setLetterType] = useState<'future' | 'past'>('future');
  const [emailForDelivery, setEmailForDelivery] = useState('');
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Images, Files and Background Image State
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{name: string; url: string; size?: string; type?: string}[]>([]);
  const [bgImage, setBgImage] = useState<string>('');
  const [bgSize, setBgSize] = useState<string>('cover');
  const [bgPosition, setBgPosition] = useState<string>('center');
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  const handleBodyImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        alert('为了保证应用稳定性，不可上传音频或视频文件');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB，请压缩后再上传。');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string' && editorRef.current) {
          editorRef.current.focus();
          // Use a resizable span wrapper to ensure reliable resize handles in chrome/safari and allow block formatting
          const imgHtml = `
            <div contenteditable="false" style="display: inline-block; vertical-align: top; max-width: 100%; width: 50%; border: 1px dotted transparent; resize: both; overflow: hidden; margin: 4px;">
              <img src="${reader.result}" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
            </div>
            &nbsp;
          `;
          document.execCommand('insertHTML', false, imgHtml);
          isEditingRef.current = true;
          setContent(editorRef.current.innerHTML);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        alert('背景图不能是音频或视频文件');
        e.target.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('背景图片大小不能超过 2MB。');
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setBgImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      let hasOversized = false;
      let hasMedia = false;
      const validFiles = filesArray.filter(file => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
          hasMedia = true;
          return false;
        }
        if (file.size > 2 * 1024 * 1024) {
          hasOversized = true;
          return false;
        }
        return true;
      });

      if (hasMedia) {
        alert('为了应用稳定，已自动过滤音视频文件（本信笺暂不支持装载音视频音乐文件）。');
      }
      if (hasOversized) {
        alert('部分文件过大（超过2MB），已自动取消加载这部分文件以避免应用闪退。');
      }

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const kb = (file.size / 1024).toFixed(1);
            setAttachedFiles(prev => [...prev, {
              name: file.name,
              url: reader.result as string,
              size: `${kb} KB`,
              type: file.type
            }]);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  // Utility to convert Date to a string compatible with input type="datetime-local"
  const getLocalDateTimeString = (d: Date) => {
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  // Watch content state and sync with contentEditable manually if external
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content && !isEditingRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Synchronize base values and dates on letterType swap
  useEffect(() => {
    if (letterType === 'past') {
      if (recipient === '未来的我' || !recipient) {
        setRecipient('曾经的我');
      }
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setCustomDate(getLocalDateTimeString(yesterday));
    } else {
      if (recipient === '曾经的我' || !recipient) {
        setRecipient('未来的我');
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCustomDate(getLocalDateTimeString(tomorrow));
    }
  }, [letterType]);

  // Animation Sequence States
  const [animationStep, setAnimationStep] = useState<'idle' | 'folding' | 'melting' | 'stamping' | 'done'>('idle');
  const [selectedReadingLetter, setSelectedReadingLetter] = useState<FutureLetter | null>(null);
  const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
  const [deleteConfirmLetterId, setDeleteConfirmLetterId] = useState<string | null>(null);

  const getStamp = (id: string) => STAMP_PRESETS.find(item => item.id === id) || STAMP_PRESETS[0];

  // Wax sealing trigger
  const handleMailInTime = () => {
    if (!(title || '').trim() || !(content || '').trim()) return;

    // Trigger folding steps
    setAnimationStep('folding');

    setTimeout(() => {
      setAnimationStep('melting');
    }, 1500);

    setTimeout(() => {
      setAnimationStep('stamping');
    }, 3200);

    setTimeout(async () => {
      // Complete letter addition
      const today = new Date();
      let deliveryDateStr = '';
      let universalDeliveryISO = '';

      if (deliveryYear === 'custom') {
        const d = new Date(customDate || getLocalDateTimeString(new Date(today.getTime() + (letterType === 'past' ? -86400000 : 86400000))));
        deliveryDateStr = getLocalDateTimeString(d);
        universalDeliveryISO = d.toISOString();
      } else {
        const adYears = parseInt(deliveryYear, 10);
        if (letterType === 'future') {
          const futureDate = new Date(today.getFullYear() + adYears, today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
          deliveryDateStr = getLocalDateTimeString(futureDate);
          universalDeliveryISO = futureDate.toISOString();
        } else {
          const pastDate = new Date(today.getFullYear() - adYears, today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
          deliveryDateStr = getLocalDateTimeString(pastDate);
          universalDeliveryISO = pastDate.toISOString();
        }
      }

      // If email for delivery is configured, call API with rich styling fields
      if ((emailForDelivery || '').trim() && (emailForDelivery || '').includes('@')) {
         try {
           await fetch('/api/send-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               to: (emailForDelivery || '').trim(),
               subject: title,
               content: content,
               scheduleTime: deliveryDateStr,
               type: letterType,
               images: attachedImages,
               files: attachedFiles,
               bgImage: bgImage,
               recipient: recipient,
               createdAt: today.toISOString().split('T')[0],
               id: editingLetterId || undefined
             })
           });
         } catch(e) {
           console.log('Failed to schedule email delivery', e);
         }
      }

      if (editingLetterId) {
        setLetters(prev => prev.map(l => l.id === editingLetterId ? {
          ...l,
          deliverAt: deliveryDateStr.replace('T', ' '),
          title: title,
          content: content,
          recipient: recipient,
          stampId: selectedStamp,
          sealColor: selectedSeal,
          images: attachedImages,
          files: attachedFiles,
          bgImage: bgImage,
          bgSize: bgSize,
          bgPosition: bgPosition,
          letterType: letterType,
          recipientEmail: emailForDelivery
        } : l));
      } else {
        const newLtr: FutureLetter = {
          id: 'letter-' + Date.now(),
          createdAt: today.toISOString().split('T')[0] + ' ' + String(today.getHours()).padStart(2, '0') + ':' + String(today.getMinutes()).padStart(2, '0'),
          deliverAt: deliveryDateStr.replace('T', ' '),
          title: title,
          content: content,
          recipient: recipient,
          stampId: selectedStamp,
          sealColor: selectedSeal,
          isDelivered: false,
          images: attachedImages,
          files: attachedFiles,
          bgImage: bgImage,
          bgSize: bgSize,
          bgPosition: bgPosition,
          letterType: letterType,
          recipientEmail: emailForDelivery
        };

        setLetters(prev => [newLtr, ...prev]);
      }
      setAnimationStep('done');
    }, 5500);
  };

  const deleteLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmLetterId(id);
  };

  const confirmDeleteLetter = () => {
    if (deleteConfirmLetterId) {
      setLetters(prev => prev.filter(item => item.id !== deleteConfirmLetterId));
      setDeleteConfirmLetterId(null);
    }
  };

  const editLetter = (letter: FutureLetter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLetterId(letter.id);
    setTitle(letter.title || '');
    setContent(letter.content || '');
    setRecipient(letter.recipient || '未来的我');
    setSelectedStamp(letter.stampId);
    setSelectedSeal(letter.sealColor);
    setLetterType(letter.letterType || 'future');
    setEmailForDelivery(letter.recipientEmail || '');
    setAttachedImages(letter.images || []);
    setAttachedFiles(letter.files || []);
    setBgImage(letter.bgImage || '');
    setBgSize(letter.bgSize || 'cover');
    setBgPosition(letter.bgPosition || 'center');
    setAnimationStep('idle');
    setShowCompose(true);
  };

  const handleOpenLetter = (letter: FutureLetter) => {
    const isReady = new Date(letter.deliverAt.replace(' ', 'T')).getTime() <= nowTime;
    if (!isReady && !letter.isDelivered) {
      alert(`锁印完好！此处信章正悬停在时间的信道中。\n距离送达还有: ${formatCountdown(letter.deliverAt)}\n别着急，时间的邮差会绝对安全地守护它的。`);
      return;
    }
    setSelectedReadingLetter(letter);
  };

  const resetCompose = () => {
    setEditingLetterId(null);
    setTitle('');
    setContent('');
    setRecipient('未来的我');
    setDeliveryYear('1');
    setCustomDate('');
    setSelectedStamp('stamp-butterfly');
    setSelectedSeal('#9e2a2b');
    setAnimationStep('idle');
    setLetterType('future');
    setEmailForDelivery('');
    setAttachedImages([]);
    setAttachedFiles([]);
    setBgImage('');
    setShowCompose(false);
    setShowCancelPrompt(false);
  };

  const handleCancelClick = () => {
     if ((title || '').trim() || (content || '').trim() || attachedImages.length > 0 || bgImage) {
       setShowCancelPrompt(true);
     } else {
       resetCompose();
     }
  };

  const saveDraft = () => {
     const draftData = {
       type: 'letter',
       title,
       content,
       letterType,
       emailForDelivery,
       recipient,
       images: attachedImages,
       bgImage: bgImage,
       bgSize: bgSize,
       bgPosition: bgPosition,
       timestamp: Date.now()
     };
     let existingDrafts = [];
     try {
       const parsed = JSON.parse(localStorage.getItem('shared_drafts_pool') || '[]');
       if (Array.isArray(parsed)) existingDrafts = parsed;
     } catch {}
     existingDrafts.push(draftData);
     try {
       localStorage.setItem('shared_drafts_pool', JSON.stringify(existingDrafts));
       localStorage.setItem('future_letter_draft', JSON.stringify(draftData));
     } catch (e) {
       console.warn('Draft save failed due to quota', e);
     }
     resetCompose();
  };

  const handleComposeClick = () => {
     const savedDraft = localStorage.getItem('future_letter_draft');
     if (savedDraft) {
       setShowResumePrompt(true);
     } else {
       setShowCompose(true);
     }
  };

  const resumeDraft = () => {
     let savedDraft: any = {};
     try {
       savedDraft = JSON.parse(localStorage.getItem('future_letter_draft') || '{}');
     } catch {}
     setTitle(savedDraft.title || '');
     setContent(savedDraft.content || '');
     setLetterType(savedDraft.letterType || 'future');
     setEmailForDelivery(savedDraft.emailForDelivery || '');
     setRecipient(savedDraft.recipient || '未来的我');
     setAttachedImages(savedDraft.images || []);
     setBgImage(savedDraft.bgImage || '');
     setBgSize(savedDraft.bgSize || 'cover');
     setBgPosition(savedDraft.bgPosition || 'center');
     setShowResumePrompt(false);
     setShowCompose(true);
  };

  const discardDraft = () => {
     localStorage.removeItem('future_letter_draft');
     setShowResumePrompt(false);
     setShowCompose(true);
  };

  return (
    <div className="h-full flex flex-col bg-[#F6F2EA] text-[#4d4030] relative overflow-hidden font-sans">
      
      {/* Visual kraft wood header background */}
      <div 
        className="px-6 py-5 bg-cover bg-center border-b border-[#dfd6c6] shrink-0"
        style={{ backgroundImage: 'linear-gradient(to right, rgba(246,242,234,0.95), rgba(246,241,234,0.95)), url("https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600")' }}
      >
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-bold text-[#352a1a] tracking-tight flex items-center gap-2">
              <Mail className="w-5.5 h-5.5 text-[#a88252]" />
              时光邮局 (未来寄架)
            </h3>
            <p className="text-xs text-[#a88252] mt-1 font-bold">今天你投递了 {letters.filter(l => !l.isDelivered).length} 封前往未来的漂流信笺</p>
          </div>
          <div className="flex bg-[#e9e3d9] rounded-2xl p-1 shadow-inner border border-[#dfd6c6]/50 items-center justify-between w-28 gap-1">
            {/* Left standard Inbox icon button: triggers compose or draft choice dialog */}
            <button 
              onClick={handleComposeClick} 
              className="w-11 h-11 flex items-center justify-center text-[#a78358] hover:bg-white rounded-xl transition-all relative group shadow-3xs cursor-pointer active:scale-95"
            >
               <Inbox className="w-5 h-5" />
               <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#352a1a] text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg hidden group-hover:block whitespace-nowrap z-50 font-bold border border-[#dfd6c6]/30">草稿与撰写</span>
            </button>

            <div className="w-px h-6 bg-[#dfd6c6]"></div>

            {/* Right standard Archive/summary icon button: gathers delivery status & scheduled counts */}
            <button 
              onClick={() => setShowOutboxModal(true)} 
              className="w-11 h-11 flex items-center justify-center text-[#a78358] hover:bg-white rounded-xl transition-all relative group shadow-3xs cursor-pointer active:scale-95"
            >
               <Archive className="w-5 h-5" />
               <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-[#352a1a] text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg hidden group-hover:block whitespace-nowrap z-50 font-bold border border-[#dfd6c6]/30">传递计时汇总</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nostalgic Mailbox Grid of Letters */}
      <div className="flex-1 overflow-auto p-5 pb-24">
        <div className="max-w-4xl mx-auto">
          {letters.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
              <div className="w-20 h-20 bg-white/70 rounded-full flex items-center justify-center shadow-xs border border-[#dfd6c6] mb-5">
                <Mail className="w-8 h-8 text-[#a88252]/40" />
              </div>
              <h4 className="font-bold text-[#352a1a] mb-1">写一封封火漆蜡印的未来漂流信吧</h4>
              <p className="text-xs text-[#a88252]/70 max-w-sm leading-relaxed">
                这些信会被存放在时光信阁。时间未到以前，它们将被火漆严密锁住无法读取，在交付的那天，蜡印才会随之解开。
              </p>
              <button 
                onClick={handleComposeClick}
                className="mt-5 px-6 py-2.5 bg-[#a78358] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#866742] transition-transform hover:-translate-y-0.5"
              >
                开始执笔
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {letters.map((letter) => {
                const isReady = new Date(letter.deliverAt).getTime() <= nowTime;
                const stamp = getStamp(letter.stampId);
                const isDelivered = letter.isDelivered || isReady;

                return (
                  <motion.div
                    key={letter.id}
                    onClick={() => handleOpenLetter(letter)}
                    className={`relative rounded-3xl p-5 border text-left cursor-pointer overflow-hidden transition-all duration-300 shadow-sm ${
                      isDelivered 
                        ? 'bg-[#ffffff] border-[#e1d9cd] hover:shadow-md hover:translate-y-[-2px]' 
                        : 'bg-[#e9e3d9] border-[#cbd4ce]/20 opacity-92 hover:opacity-100 hover:shadow-xs'
                    }`}
                  >
                    {/* Retro Stamp top right */}
                    <div className="absolute top-4 right-4 text-center">
                      <div className={`w-11 h-13 rounded-md bg-gradient-to-tr ${stamp.color} border-2 border-dashed border-[#dfd6c6] flex flex-col items-center justify-center shadow-3xs relative`}>
                        <span className="text-base">{stamp.icon}</span>
                        <span className="text-[6px] font-mono tracking-tighter opacity-70 mt-0.5">POST</span>
                      </div>
                    </div>

                    <div className="mb-8 pr-12">
                      <div className="flex items-center gap-1.5 mb-2.5">
                        {isDelivered ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">已送达解封</span>
                        ) : (
                          <span className="bg-[#a78358]/10 text-[#a78358] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#a78358]/10">时间通道中</span>
                        )}
                        <span className="text-[10px] text-[#a88252] opacity-60 font-mono">寄: {letter.recipient}</span>
                      </div>
                      <h4 className="text-base font-black text-[#352a1a] truncate leading-tight pr-2">
                        {letter.title}
                      </h4>
                    </div>

                    {/* Countdown or Wax Seal view */}
                    <div className="space-y-2 text-[10px] font-bold text-[#8c7456] bg-[#fbf9f4]/70 p-3 rounded-2xl border border-dashed border-[#dfd6c6]">
                      <div className="flex justify-between font-mono">
                        <span>执笔日期:</span>
                        <span>{letter.createdAt}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span>计划开启:</span>
                        <span className="text-[#352a1a]">{letter.deliverAt}</span>
                      </div>
                    </div>

                    {/* Bottom Ticking countdown / open letter reminder */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#dfd6c6]/40 pt-3">
                      {isDelivered ? (
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> 纸锁已解开，点击阅信
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#a78358] font-bold flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 animate-pulse" /> {formatCountdown(letter.deliverAt)}
                        </span>
                      )}

                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => editLetter(letter, e)}
                          className="p-1 px-2.5 text-xs text-[#a78358] rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          修改
                        </button>
                        <button 
                          onClick={(e) => deleteLetter(letter.id, e)}
                          className="p-1 px-2.5 text-xs text-red-500 rounded-lg hover:bg-black/5 opacity-40 hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          粉碎
                        </button>
                      </div>
                    </div>

                    {/* Wax seal glass block for unarrived letters */}
                    {!isDelivered && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 w-14 h-14 rounded-full flex items-center justify-center shadow-lg border border-black/10 transition-transform hover:scale-105"
                        style={{ backgroundColor: letter.sealColor, boxShadow: `0 8px 16px ${letter.sealColor}40` }}
                      >
                        {/* Interactive melted imprint wax mark */}
                        <div className="absolute inset-1 border-2 border-dashed border-white/20 rounded-full" />
                        <Lock className="w-5 h-5 text-white/90" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drafts Modal */}
      <AnimatePresence>
        {showDraftsModal && (
           <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 bg-[#352a1a]/60 backdrop-blur-sm flex justify-end">
              <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} className="w-full max-w-md bg-[#FAF6F0] h-full shadow-2xl flex flex-col pt-safe px-6 pb-8">
                 <div className="flex justify-between items-center py-6 border-b border-[#dfd6c6]/50">
                    <h3 className="text-xl font-black text-[#352a1a] flex items-center gap-2">
                       <Inbox className="w-5 h-5 text-[#a78358]"/> 暂存信件草稿箱
                    </h3>
                    <button onClick={() => setShowDraftsModal(false)} className="p-2 hover:bg-[#dfd6c6]/50 rounded-full transition-colors">
                       <X className="w-4 h-4 text-[#8c7456]"/>
                    </button>
                 </div>
                 <div className="flex-1 overflow-auto py-4">
                    {/* Simplified Local Draft */}
                    {!localStorage.getItem('future_letter_draft') ? (
                       <div className="text-center py-12 text-[#a88252] opacity-70">
                         <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                         <p className="font-bold text-sm">空空如也，并没有保留的草稿哦</p>
                       </div>
                    ) : (
                       <div 
                         onClick={handleComposeClick}
                         className="p-4 bg-white rounded-2xl border border-[#dfd6c6]/50 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
                       >
                         <h4 className="font-bold text-[#352a1a] mb-1">
                           {(() => { try { return JSON.parse(localStorage.getItem('future_letter_draft') || '{}').title || '未命名信件'; } catch { return '未命名信件'; } })()}
                         </h4>
                         <p className="text-xs text-[#a88252] line-clamp-2">
                           {(() => { try { return JSON.parse(localStorage.getItem('future_letter_draft') || '{}').content || '没有内容...'; } catch { return '没有内容...'; } })()}
                         </p>
                         <div className="mt-3 flex gap-2">
                           <span className="text-[10px] bg-[#e9e3d9] text-[#8c7456] px-2 py-0.5 rounded-full font-bold">已保存: 刚刚</span>
                         </div>
                       </div>
                    )}
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Outbox Modal */}
      <AnimatePresence>
        {showOutboxModal && (
           <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-50 bg-[#352a1a]/60 backdrop-blur-sm flex justify-center items-center p-4">
              <motion.div initial={{scale: 0.95}} animate={{scale: 1}} exit={{scale: 0.95}} className="w-full max-w-lg bg-[#FAF6F0] rounded-[2rem] shadow-2xl flex flex-col p-6 max-h-[80vh]">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-[#352a1a] flex items-center gap-2">
                       <Archive className="w-5 h-5 text-[#a78358]"/> 传送收发汇总
                    </h3>
                    <button onClick={() => setShowOutboxModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                       <X className="w-4 h-4 text-[#8c7456]"/>
                    </button>
                 </div>
                 <div className="flex-1 overflow-auto space-y-3">
                    {letters.filter(l => !l.isDelivered).length === 0 ? (
                       <div className="text-center py-8 text-[#a88252] opacity-70 font-bold text-sm">
                         没有在传送途中的信件
                       </div>
                    ) : (
                       letters.filter(l => !l.isDelivered).map(letter => (
                         <div key={letter.id} className="p-4 bg-white rounded-xl border border-[#dfd6c6]/40 flex justify-between items-center hover:bg-[#fffdf9] transition-colors">
                           <div className="flex flex-col">
                             <span className="font-bold text-[#352a1a] text-sm max-w-[200px] truncate">{letter.title}</span>
                             <span className="text-[10px] text-[#a88252] font-mono mt-1">发往: {letter.recipient}</span>
                           </div>
                           <div className="text-right flex flex-col">
                             <span className="text-[9px] text-[#a78358] uppercase font-bold tracking-widest">距离投递时间</span>
                             <span className="font-mono text-xs font-black text-[#8c7456] mt-0.5 animate-pulse bg-[#fbf9f4] px-2 py-0.5 rounded-lg border border-[#dfd6c6]">{formatCountdown(letter.deliverAt)}</span>
                           </div>
                         </div>
                       ))
                    )}
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Prompt Modal */}
      <AnimatePresence>
         {showCancelPrompt && (
           <motion.div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
               <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-white p-6 rounded-3xl max-w-sm w-full text-center shadow-xl">
                 <h4 className="text-lg font-black text-[#352a1a] mb-2">保留当前草稿？</h4>
                 <p className="text-[#a88252] text-xs mb-6">退出将丢失已写的信件，是否将其保留在草稿箱以免丢失？</p>
                 <div className="flex gap-3">
                   <button onClick={() => { resetCompose(); setShowCancelPrompt(false); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-200">
                     直接退出
                   </button>
                   <button onClick={saveDraft} className="flex-1 py-2.5 bg-[#a78358] text-white rounded-xl font-bold text-xs hover:bg-[#866742] shadow-md">
                     保留草稿并退出
                   </button>
                 </div>
               </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Resume Draft Prompt Modal */}
      <AnimatePresence>
         {showResumePrompt && (
           <motion.div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
               <motion.div initial={{scale:0.9, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}} className="bg-[#FAF6F0] p-6 rounded-3xl max-w-sm w-full text-center shadow-xl border border-[#dfd6c6]">
                 <Inbox className="w-8 h-8 text-[#a78358] mx-auto mb-3" />
                 <h4 className="text-lg font-black text-[#352a1a] mb-2">发现一封未写完的信笺</h4>
                 <p className="text-[#8c7456] text-xs mb-6">之前有一封保存在草稿箱中的未写完的信，是否需要恢复继续编写？</p>
                 <div className="flex gap-3">
                   <button onClick={discardDraft} className="flex-1 py-2.5 bg-white border border-[#dfd6c6] text-[#8c7456] rounded-xl font-bold text-xs hover:bg-gray-50 shadow-sm">
                     删除旧稿，重新写
                   </button>
                   <button onClick={resumeDraft} className="flex-1 py-2.5 bg-[#a78358] text-white rounded-xl font-bold text-xs hover:bg-[#866742] shadow-md border border-[#866742]">
                     好，继续撰写
                   </button>
                 </div>
               </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* Create Future Letter Fullscreen Board with realistic folding wax animation */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="fixed inset-0 z-50 bg-[#F4EFF6] flex flex-col overflow-auto p-4 md:p-6"
          >
            {/* Modal Container */}
            <div className="bg-[#FAF6F0] rounded-[2.5rem] shadow-2xl border border-[#dfd6c6] max-w-3xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
              
              {/* Animation overlays wrapping the form */}
              {animationStep !== 'idle' ? (
                <div className="absolute inset-0 bg-[#352a1a]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-white">
                  <div className="max-w-md w-full flex flex-col items-center justify-center text-center">
                    
                    {/* Phase 1: Letter Folding */}
                    {animationStep === 'folding' && (
                      <motion.div 
                        initial={{ rotateX: 0, scale: 1 }}
                        animate={{ rotateX: 180, scale: 0.8, opacity: [1, 1, 0.7] }}
                        transition={{ duration: 1.5 }}
                        className="w-36 h-48 bg-white border border-gray-300 shadow-xl rounded-lg mb-8 relative flex items-center justify-center"
                      >
                        <div className="absolute inset-x-0 top-1/3 h-0.5 bg-gray-200" />
                        <div className="absolute inset-x-0 top-2/3 h-0.5 bg-gray-200" />
                        <Mail className="w-10 h-10 text-gray-400" />
                      </motion.div>
                    )}

                    {/* Phase 2: Spoon pouring melting wax seal base */}
                    {animationStep === 'melting' && (
                      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: [0, -25, 0], x: [-10, 10, -10] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-6 -left-6 text-4xl"
                        >
                          🥄
                        </motion.div>
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [1, 2.5], opacity: 1 }}
                          transition={{ duration: 1.5 }}
                          className="w-10 h-10 rounded-full blur-xs"
                          style={{ backgroundColor: selectedSeal }}
                        />
                        <span className="absolute text-[10px] font-bold bottom-0 opacity-85 text-center">正在匀速倾倒金色火漆蜡油...</span>
                      </div>
                    )}

                    {/* Phase 3: Metal Stamp imprint drops */}
                    {animationStep === 'stamping' && (
                      <div className="relative w-48 h-48 mb-6 flex flex-col items-center justify-center">
                        {/* Seal base */}
                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg relative" style={{ backgroundColor: selectedSeal }}>
                          <span className="text-3xl text-white/50">{getStamp(selectedStamp).icon}</span>
                        </div>
                        {/* Stamp handle dropping */}
                        <motion.div 
                          initial={{ y: -80, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                          className="absolute -top-10 text-6xl"
                        >
                          印
                        </motion.div>
                        <span className="absolute bottom-[-10px] text-[10px] font-bold opacity-80 mt-2">正在用力压按黄铜金属火漆印章...</span>
                      </div>
                    )}

                    {/* Phase 4: Delivered successfully */}
                    {animationStep === 'done' && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white mb-4">
                          <Check className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">信章火漆封好，已寄往时光邮筒</h4>
                        <p className="text-xs text-white/70 max-w-sm mb-6 leading-relaxed">
                          时间的邮差已将封条扣好。时间未到以前，这封信将绝对保密。静待交付吧！
                        </p>
                        <button 
                          onClick={resetCompose}
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold font-sans cursor-pointer"
                        >
                          返回未来信架
                        </button>
                      </motion.div>
                    )}

                    {animationStep !== 'done' && (
                      <>
                        <h5 className="font-bold text-sm text-center tracking-normal mt-4">
                          {animationStep === 'folding' ? '正在叠好便签信纸入信封...' : 
                           animationStep === 'melting' ? '正在滴落火漆封蜡...' : '正在盖上印记...'}
                        </h5>
                        <div className="w-36 h-1.5 bg-white/20 mt-3 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5 }}
                            className="h-full bg-amber-400"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Compose Editor Header */}
              <div className="h-14 bg-white border-b border-[#dfd6c6]/50 flex items-center justify-between px-5 shrink-0">
                <button 
                  onClick={handleCancelClick}
                  className="p-1 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
                <div className="flex bg-[#E9E3D9] p-1 rounded-full">
                   <button 
                     onClick={() => setLetterType('future')}
                     className={`px-4 py-1 text-xs font-black rounded-full transition-colors ${letterType === 'future' ? 'bg-white text-[#352a1a] shadow-sm' : 'text-[#8c7456] hover:bg-white/50'}`}
                   >
                     寄往未来
                   </button>
                   <button 
                     onClick={() => setLetterType('past')}
                     className={`px-4 py-1 text-xs font-black rounded-full transition-colors ${letterType === 'past' ? 'bg-white text-[#352a1a] shadow-sm' : 'text-[#8c7456] hover:bg-white/50'}`}
                   >
                     回溯往昔
                   </button>
                </div>
                <button 
                  onClick={handleMailInTime}
                  disabled={!(title || '').trim() || !(content || '').trim()}
                  className="px-5 py-1.5 bg-[#a78358] text-white hover:bg-[#866742] rounded-full text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  完成，火漆封好
                </button>
              </div>

              {/* Form and Stationary paper region */}
              <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#dfd6c6]/50 overflow-hidden">
                {/* Lined stationery paper pane with dynamic background settings */}
                <div 
                  className="flex-1 p-5 md:p-8 overflow-auto flex flex-col transition-all duration-500 relative"
                  style={bgImage ? {
                    backgroundImage: `linear-gradient(rgba(255,253,249,0.85), rgba(255,253,249,0.85)), url('${bgImage}')`,
                    backgroundSize: bgSize || 'cover',
                    backgroundPosition: bgPosition || 'center'
                  } : { backgroundColor: '#fffdf9' }}
                >
                  
                  {/* Stamp space in top right */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                       <div className="flex flex-col gap-2 relative">
                         <div className="flex items-center gap-1.5 text-xs text-[#a88252] font-black">
                           <span>TO RECIPIENT:</span>
                           <input 
                             type="text" 
                             value={recipient}
                             onChange={(e) => setRecipient(e.target.value)}
                             className="bg-black/5 hover:bg-black/10 border-none outline-none font-bold px-2 py-1 rounded text-[#352a1a] w-36"
                           />
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold ml-[7.5rem] mt-1 relative z-10">
                           <input 
                             type="email" 
                             placeholder="寄达至电子邮箱..."
                             value={emailForDelivery}
                             onChange={(e) => setEmailForDelivery(e.target.value)}
                             className="bg-black/5 hover:bg-black/10 border-none outline-none px-2 py-1 rounded text-[#352a1a] w-40 placeholder:font-normal placeholder:opacity-50"
                           />
                         </div>
                       </div>
                    </div>

                    <div className={`w-13 h-16 rounded-md bg-gradient-to-tr ${getStamp(selectedStamp).color} border-2 border-dashed border-[#dfd6c6] flex flex-col items-center justify-center shadow-3xs`}>
                      <span className="text-xl">{getStamp(selectedStamp).icon}</span>
                      <span className="text-[7px] font-mono tracking-tighter opacity-70 mt-1">TIME-POST</span>
                    </div>
                  </div>

                  {/* Lined stationery theme using CSS background */}
                  <div className="flex-1 flex flex-col gap-4 bg-[linear-gradient(#f0ebe1_1px,transparent_1px)] bg-[size:100%_2.2rem] min-h-[300px] border-l-2 border-orange-200/50 pl-5">
                    <input 
                      type="text" 
                      placeholder={letterType === 'future' ? "信章标题: 写往岁月的期待与诺言..." : "信章标题: 写给昨日的告解与释怀..."}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-transparent text-lg font-black outline-none w-full text-[#352a1a] placeholder-[#352a1a]/20 border-none h-11"
                    />

                    <div 
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning={true}
                      onInput={(e) => {
                        isEditingRef.current = true;
                        setContent(e.currentTarget.innerHTML);
                      }}
                      onBlur={(e) => {
                        isEditingRef.current = false;
                        setContent(e.currentTarget.innerHTML);
                      }}
                      data-placeholder={letterType === 'future' 
                        ? "亲爱的我，当你在这行文字中醒来时，你是否正站在理想小岛的海岸线上？曾经困扰我们的那些沮丧，在你现在看来，是不是都已经化成了漫漫浪花？\n\n快写下你对未来的期待与承诺..."
                        : "曾经的我，如果你能在这个瞬间听见我的声音。请原谅那个时候我们的笨拙与怯弱。不要害怕，你所经历的所有挣扎与阴霾，我都在未来平安为你趟过了，你很勇敢...\n\n把那些想对过去的自己诉说的话写下来..."
                      }
                      className="w-full flex-1 bg-transparent resize-none outline-none text-sm leading-[2.2rem] text-[#4d4030] font-serif min-h-[14rem] pb-4 editor-content-editable empty:before:content-[attr(data-placeholder)] empty:before:text-[#4d4030]/20 empty:before:whitespace-pre-wrap empty:before:pointer-events-none [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_img]:border [&_img]:border-[#dfd6c6]/50 [&_img]:shadow-sm"
                    />
                  </div>

                  {/* Attached images visualization container */}
                  {(attachedImages.length > 0 || attachedFiles.length > 0) && (
                    <div className="mt-5 border-t border-dashed border-[#dfd6c6] pt-4 shrink-0">
                      <span className="text-[10px] font-black text-[#8c7456] block mb-2">📎 信件随贴附件 ({attachedImages.length + attachedFiles.length}):</span>
                      <div className="flex gap-2.5 overflow-x-auto pb-1.5 min-h-[4rem] items-center">
                        {attachedImages.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-14 rounded-xl border border-[#dfd6c6] overflow-hidden shrink-0 group shadow-3xs">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                              onClick={() => setAttachedImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                        {attachedFiles.map((file, idx) => (
                          <div key={idx} className="relative w-20 h-14 bg-white rounded-xl border border-[#dfd6c6] shrink-0 group shadow-3xs flex flex-col items-center justify-center p-1 px-2">
                            <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center" title={file.name}>{file.name}</span>
                            <span className="text-[8px] text-gray-400 font-mono mt-0.5">{file.size}</span>
                            <button 
                              onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* End of Lined stationery paper pane */}
                </div>

                {/* Delivery schedule customizer */}
                <div className="w-full md:w-80 bg-[#FAFAF8] p-5 flex flex-col gap-5 overflow-auto shrink-0">
                  <span className="text-xs font-black tracking-widest text-[#a88252] uppercase">邮戳交付设定</span>
                  
                  {/* Delivering delay option */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700">
                      {letterType === 'future' ? '时光渡槽: 信件何时送达？' : '岁月重演: 追溯至哪刻？'}
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold font-sans">
                      {letterType === 'future' ? (
                        <>
                          <button 
                            onClick={() => setDeliveryYear('1')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '1' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            1年后 (2027年)
                          </button>
                          <button 
                            onClick={() => setDeliveryYear('3')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '3' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            3年后 (2029年)
                          </button>
                          <button 
                            onClick={() => setDeliveryYear('5')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '5' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            5年后 (2031年)
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => setDeliveryYear('1')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '1' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            1年前 (2025年)
                          </button>
                          <button 
                            onClick={() => setDeliveryYear('3')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '3' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            3年前 (2023年)
                          </button>
                          <button 
                            onClick={() => setDeliveryYear('5')}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === '5' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                          >
                            5年前 (2021年)
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setDeliveryYear('custom')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${deliveryYear === 'custom' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                      >
                        特定预约时刻
                      </button>
                    </div>

                    {deliveryYear === 'custom' && (
                      <div className="pt-2 animate-fadeIn">
                        <input 
                          type="datetime-local" 
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 font-bold font-mono text-xs p-2.5 rounded-xl outline-none focus:border-[#a78358]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Stamp selectors */}
                  <div className="space-y-2 pt-2 border-t border-t-[#dfd6c6]/30">
                    <span className="text-xs font-bold text-gray-700">时光邮票</span>
                    <div className="grid grid-cols-5 gap-2">
                      {STAMP_PRESETS.map(stamp => (
                        <button
                          key={stamp.id}
                          onClick={() => setSelectedStamp(stamp.id)}
                          className={`flex items-center justify-center w-11 h-14 rounded bg-gradient-to-tr ${stamp.color} border-2 border-dashed hover:scale-105 active:scale-95 transition-all text-xl cursor-copy shadow-3xs ${
                            selectedStamp === stamp.id ? 'ring-2 ring-[#a78358] border-white' : 'border-gray-300'
                          }`}
                          title={`${stamp.name}: ${stamp.desc}`}
                        >
                          {stamp.icon}
                        </button>
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold block pt-1">{getStamp(selectedStamp).name}: {getStamp(selectedStamp).desc}</span>
                  </div>

                  {/* Wax Seal customizers */}
                  <div className="space-y-2 pt-2 border-t border-t-[#dfd6c6]/30">
                    <span className="text-xs font-bold text-gray-700">火漆蜡印色彩</span>
                    <div className="flex gap-2.5 mb-4">
                      {SEAL_COLORS.map(seal => (
                        <button
                          key={seal.value}
                          onClick={() => setSelectedSeal(seal.value)}
                          className={`w-7 h-7 rounded-full border shadow-3xs cursor-pointer hover:scale-110 active:scale-95 transition-transform ${
                            selectedSeal === seal.value ? 'ring-2 ring-[#a78358] border-white scale-105' : 'border-gray-200'
                          }`}
                          title={seal.name}
                          style={{ backgroundColor: seal.value }}
                        />
                      ))}
                    </div>

                    <div className="border-t border-[#dfd6c6]/30 pt-3 flex flex-col gap-2.5">
                      <span className="text-xs font-bold text-gray-700">信件装帧与设计</span>
                      <label className="w-full px-3.5 py-2 bg-[#E9E3D9]/60 hover:bg-[#E9E3D9] text-[#8c7456] text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all active:scale-95">
                        <Plus className="w-3.5 h-3.5" />
                        在正文添加图片
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleBodyImageFileChange} 
                          className="hidden" 
                        />
                      </label>
                      
                      <div className="relative group/wp w-full">
                        <button className="w-full px-3.5 py-2 bg-[#E9E3D9]/60 hover:bg-[#E9E3D9] text-[#8c7456] text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all">
                          🎨 自定义信件背景图
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 bg-[#FAF6F0] border border-[#dfd6c6] p-3 rounded-2xl shadow-xl w-64 hidden group-hover/wp:block z-50 animate-fadeIn">
                          <span className="text-[10px] font-black text-[#8c7456] block mb-2">选择或上传背景：</span>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <button 
                              onClick={() => setBgImage('')}
                              className={`p-1.5 text-[10px] border rounded-lg font-bold truncate transition-colors ${!bgImage ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}
                            >
                              纯净原色
                            </button>
                            {BG_PRESETS.map((bg, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setBgImage(bg.url)}
                                className={`p-1.5 text-[10px] border rounded-lg font-bold truncate transition-colors ${bgImage === bg.url ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-100 hover:border-gray-200'}`}
                              >
                                {bg.name}
                              </button>
                            ))}
                          </div>
                          <label className="w-full px-3.5 py-1.5 bg-[#a78358] hover:bg-[#8c7456] text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all mt-1">
                            或者自己上传背景图
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleBgImageFileChange} 
                              className="hidden" 
                            />
                          </label>
                          {bgImage && (
                            <div className="mt-2 pt-2 border-t border-[#dfd6c6] flex gap-2">
                              <select 
                                value={bgSize} 
                                onChange={(e) => setBgSize(e.target.value)}
                                className="flex-1 bg-white border border-[#dfd6c6] text-[#8c7456] text-[10px] p-1 rounded outline-none"
                              >
                                <option value="cover">覆盖填充 (Cover)</option>
                                <option value="contain">完整自适应 (Contain)</option>
                                <option value="auto">100% (Auto)</option>
                              </select>
                              <select 
                                value={bgPosition} 
                                onChange={(e) => setBgPosition(e.target.value)}
                                className="flex-1 bg-white border border-[#dfd6c6] text-[#8c7456] text-[10px] p-1 rounded outline-none"
                              >
                                <option value="center">居中对齐</option>
                                <option value="top">顶部对齐</option>
                                <option value="bottom">底部对齐</option>
                                <option value="left">左对齐</option>
                                <option value="right">右对齐</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                      <label className="w-full px-3.5 py-2 bg-[#E9E3D9]/60 hover:bg-[#E9E3D9] text-[#8c7456] text-xs font-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs transition-all active:scale-95">
                        <Plus className="w-3.5 h-3.5" />
                        随机掉落附件OXO
                        <input 
                          type="file" 
                          multiple 
                          onChange={handleAnyFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reading Openable Letter modal board */}
      <AnimatePresence>
        {selectedReadingLetter && (
          <div className="fixed inset-0 bg-[#352a1af0] backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#FAFAF8] p-6 rounded-[2.5rem] border border-[#dfd6c6] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center pb-3 border-b border-[#dfd6c6]/50">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">已交付解封</span>
                <button 
                  onClick={() => setSelectedReadingLetter(null)}
                  className="p-1 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg text-xs cursor-pointer"
                >
                  关闭
                </button>
              </div>

              {/* Stationery details */}
              <div 
                className="flex-1 overflow-auto py-6 flex flex-col pl-4 border-l-2 border-orange-200/50 mt-4 leading-loose rounded-2xl relative p-4 transition-all"
                style={selectedReadingLetter.bgImage ? {
                  backgroundImage: `linear-gradient(rgba(255,253,249,0.85), rgba(255,253,249,0.85)), url('${selectedReadingLetter.bgImage}')`,
                  backgroundSize: selectedReadingLetter.bgSize || 'cover',
                  backgroundPosition: selectedReadingLetter.bgPosition || 'center'
                } : {
                  background: 'linear-gradient(#f0ebe1 1px, transparent 1px) 0 0 / 100% 2.2rem'
                }}
              >
                <span className="text-xs font-bold text-[#a88252] font-mono tracking-tight pb-3 relative z-10">TO: {selectedReadingLetter.recipient}</span>
                <h4 className="text-base font-black text-[#352a1a] mb-2 relative z-10">{selectedReadingLetter.title}</h4>
                <p className="text-xs text-[#a88252] font-bold font-mono mb-4 relative z-10">回忆于 {selectedReadingLetter.createdAt} 封存 | 开启于 {selectedReadingLetter.deliverAt}</p>
                <div 
                  className="text-sm font-sans text-gray-800 leading-[2.2rem] whitespace-pre-wrap leading-relaxed italic editor-content-html [&_img]:max-w-full [&_img]:rounded-xl [&_img]:my-4 [&_img]:border [&_img]:border-[#dfd6c6]/50 [&_img]:shadow-sm relative z-10"
                  dangerouslySetInnerHTML={{ __html: selectedReadingLetter.content }}
                />

                {/* Attached Files & Images when reading */}
                {((selectedReadingLetter.images && selectedReadingLetter.images.length > 0) || (selectedReadingLetter.files && selectedReadingLetter.files.length > 0)) && (
                  <div className="mt-5 border-t border-dashed border-[#dfd6c6] pt-4 shrink-0 relative z-10">
                    <span className="text-[10px] font-black text-[#8c7456] block mb-2">📎 附件包裹：</span>
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 min-h-[4rem] items-center">
                      {selectedReadingLetter.images?.map((img, idx) => (
                        <div key={idx} className="relative w-14 h-14 rounded-xl border border-[#dfd6c6] overflow-hidden shrink-0 group shadow-3xs cursor-pointer">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {selectedReadingLetter.files?.map((file, idx) => (
                        <div key={idx} className="relative w-20 h-14 bg-white/70 rounded-xl border border-[#dfd6c6] shrink-0 shadow-3xs flex flex-col items-center justify-center p-1 px-2 cursor-pointer">
                          <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center" title={file.name}>{file.name}</span>
                          <span className="text-[8px] text-gray-400 font-mono mt-0.5">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 border-t border-[#dfd6c6]/50 pt-4 flex gap-4 items-center justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: selectedReadingLetter.sealColor }}>
                  <CheckCircle className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-center font-bold text-xs text-[#8c7456]">
                  <span>火漆印封安全解开。</span><br/>
                  <span>这封信成功见证了时间的交替。</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Letter Confirm Overlay */}
      <AnimatePresence>
        {deleteConfirmLetterId && (
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
              <h3 className="text-base font-bold text-emerald-900 mb-2">确认粉碎这封信件吗？</h3>
              <p className="text-xs text-[#4E6156]/70 mb-5">
                删除后这封信将彻底消失在时间线中，无法恢复。是否继续？
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmLetterId(null)}
                  className="flex-1 py-2.5 rounded-full bg-[#F2F5F3] text-[#4E6156] text-xs font-bold hover:bg-[#E3EAE5] transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDeleteLetter}
                  className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md shadow-red-500/20 hover:bg-red-600 transition-colors"
                >
                  粉碎信件
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
