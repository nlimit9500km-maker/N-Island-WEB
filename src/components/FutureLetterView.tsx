import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, Clock, Lock, ShieldAlert, Sparkles, Check, CheckCircle, 
  Trash2, X, Plus, Calendar, ArrowRight, BookOpen, Send, Gift
} from 'lucide-react';
import { 
  FutureLetter, STAMP_PRESETS, SEAL_COLORS 
} from './DiaryTypes';

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

  // Animation Sequence States
  const [animationStep, setAnimationStep] = useState<'idle' | 'folding' | 'melting' | 'stamping' | 'done'>('idle');
  const [selectedReadingLetter, setSelectedReadingLetter] = useState<FutureLetter | null>(null);

  const getStamp = (id: string) => STAMP_PRESETS.find(item => item.id === id) || STAMP_PRESETS[0];

  // Wax sealing trigger
  const handleMailInTime = () => {
    if (!title.trim() || !content.trim()) return;

    // Trigger folding steps
    setAnimationStep('folding');

    setTimeout(() => {
      setAnimationStep('melting');
    }, 1500);

    setTimeout(() => {
      setAnimationStep('stamping');
    }, 3200);

    setTimeout(() => {
      // Complete letter addition
      const today = new Date();
      let deliveryDateStr = '';

      if (deliveryYear === 'custom') {
        deliveryDateStr = customDate || new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0];
      } else {
        const adYears = parseInt(deliveryYear, 10);
        const futureDate = new Date(today.getFullYear() + adYears, today.getMonth(), today.getDate());
        deliveryDateStr = futureDate.toISOString().split('T')[0];
      }

      const newLtr: FutureLetter = {
        id: 'letter-' + Date.now(),
        createdAt: today.toISOString().split('T')[0],
        deliverAt: deliveryDateStr,
        title: title,
        content: content,
        recipient: recipient,
        stampId: selectedStamp,
        sealColor: selectedSeal,
        isDelivered: false
      };

      setLetters(prev => [newLtr, ...prev]);
      setAnimationStep('done');
    }, 5500);
  };

  const deleteLetter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认粉碎这一页寄往未来的信章吗？这会让它在时间线中彻底蒸发...')) {
      setLetters(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleOpenLetter = (letter: FutureLetter) => {
    const isReady = new Date(letter.deliverAt).getTime() <= nowTime;
    if (!isReady && !letter.isDelivered) {
      // Trigger a cozy nudge/shake
      alert(`锁印完好！寄往未来的信章正悬停在时间的信道中。\n距离送达还有: ${formatCountdown(letter.deliverAt)}\n别着急，时间的邮差会绝对安全地守护它的。`);
      return;
    }
    setSelectedReadingLetter(letter);
  };

  const resetCompose = () => {
    setTitle('');
    setContent('');
    setRecipient('未来的我');
    setDeliveryYear('1');
    setCustomDate('');
    setSelectedStamp('stamp-butterfly');
    setSelectedSeal('#9e2a2b');
    setAnimationStep('idle');
    setShowCompose(false);
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
          <button 
            onClick={() => setShowCompose(true)}
            className="px-5 py-2.5 bg-[#a88 52] bg-[#a78358] hover:bg-[#866742] text-white rounded-full text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" /> 笔写新信
          </button>
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
                onClick={() => setShowCompose(true)}
                className="mt-5 px-6 py-2.5 bg-[#a78358] text-white rounded-full text-xs font-bold shadow-md hover:bg-[#866742] transition-transform hover:-translate-y-0.5"
              >
                写给一年后的自己
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

                      <button 
                        onClick={(e) => deleteLetter(letter.id, e)}
                        className="p-1 px-2.5 text-xs text-red-500 rounded-lg hover:bg-black/5 opacity-40 hover:opacity-100 transition-opacity"
                      >
                        粉碎
                      </button>
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
                  onClick={() => setShowCompose(false)}
                  className="p-1 px-3 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full text-xs font-bold cursor-pointer"
                >
                  取消
                </button>
                <h4 className="font-black text-sm text-[#352a1a] flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#a78358]" /> 
                  邮编写给未来的我
                </h4>
                <button 
                  onClick={handleMailInTime}
                  disabled={!title.trim() || !content.trim()}
                  className="px-5 py-1.5 bg-[#a78358] text-white hover:bg-[#866742] rounded-full text-xs font-black disabled:opacity-40 cursor-pointer"
                >
                  完成，火漆封好
                </button>
              </div>

              {/* Form and Stationary paper region */}
              <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#dfd6c6]/50 overflow-hidden">
                {/* Lined stationery paper pane */}
                <div className="flex-1 p-5 md:p-8 overflow-auto flex flex-col bg-[#fffdf9]">
                  
                  {/* Stamp space in top right */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#a88252] font-black">
                        <span>TO RECIPIENT:</span>
                        <input 
                          type="text" 
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="bg-black/5 hover:bg-black/10 border-none outline-none font-bold px-2 py-1 rounded text-[#352a1a] w-36"
                        />
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
                      placeholder="信章标题: 写在XX年前的心里话..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-transparent text-lg font-black outline-none w-full text-[#352a1a] placeholder-[#352a1a]/20 border-none h-11"
                    />

                    <textarea 
                      placeholder="亲爱的我，当你在这行文字中醒来时，你是否正站在理想小岛的海岸线上？曾经困扰我们的那些沮丧，在你现在看来，是不是都已经化成了漫漫浪花？\n\n快写下你对未来的期待与承诺..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full flex-1 bg-transparent resize-none outline-none text-sm leading-[2.2rem] text-[#4d4030] placeholder-[#4d4030]/20 font-serif h-56"
                    />
                  </div>
                </div>

                {/* Delivery schedule customizer */}
                <div className="w-full md:w-80 bg-[#FAFAF8] p-5 flex flex-col gap-5 overflow-auto shrink-0">
                  <span className="text-xs font-black tracking-widest text-[#a88252] uppercase">邮戳交付设定</span>
                  
                  {/* Delivering delay option */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-700">时光渡槽: 信件何时送达？</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button 
                        onClick={() => setDeliveryYear('1')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${deliveryYear === '1' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                      >
                        1年后 (2027年)
                      </button>
                      <button 
                        onClick={() => setDeliveryYear('3')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${deliveryYear === '3' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                      >
                        3年后 (2029年)
                      </button>
                      <button 
                        onClick={() => setDeliveryYear('5')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${deliveryYear === '5' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                      >
                        5年后 (2031年)
                      </button>
                      <button 
                        onClick={() => setDeliveryYear('custom')}
                        className={`p-2.5 rounded-xl border text-center transition-all ${deliveryYear === 'custom' ? 'bg-[#a78358] text-white border-[#a78358]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                      >
                        特定预约日期
                      </button>
                    </div>

                    {deliveryYear === 'custom' && (
                      <div className="pt-2 animate-fadeIn">
                        <input 
                          type="date" 
                          min="2026-06-05"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="w-full bg-white border border-gray-200 font-bold font-mono text-xs p-2.5 rounded-xl outline-none focus:border-[#a78358]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Stamp selectors */}
                  <div className="space-y-2 pt-2 border-t border-[#dfd6c6]/30">
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
                  <div className="space-y-2 pt-2 border-t border-[#dfd6c6]/30">
                    <span className="text-xs font-bold text-gray-700">火漆蜡印色彩</span>
                    <div className="flex gap-2.5">
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
              <div className="flex-1 overflow-auto py-6 flex flex-col bg-[linear-gradient(#f0ebe1_1px,transparent_1px)] bg-[size:100%_2.2rem] pl-4 border-l-2 border-orange-200/50 mt-4 leading-loose">
                <span className="text-xs font-bold text-[#a88252] font-mono tracking-tight pb-3">TO: {selectedReadingLetter.recipient}</span>
                <h4 className="text-base font-black text-[#352a1a] mb-2">{selectedReadingLetter.title}</h4>
                <p className="text-xs text-[#a88252] font-bold font-mono mb-4">回忆于 {selectedReadingLetter.createdAt} 封存 | 开启于 {selectedReadingLetter.deliverAt}</p>
                <p className="text-sm font-sans text-gray-800 leading-[2.2rem] whitespace-pre-wrap leading-relaxed italic">
                  {selectedReadingLetter.content}
                </p>
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
    </div>
  );
};
