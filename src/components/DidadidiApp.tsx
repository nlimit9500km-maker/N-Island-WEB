import React, { useState, useEffect, useRef, useMemo } from 'react';
import { doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

// ACHIEVEMENTS criteria and definitions
const ACHIEVEMENTS = [
  { id: 'first', icon: '🌱', name: '初次专注', cond: (s: any) => s.totalSessions >= 1 },
  { id: 'ten', icon: '🍅', name: '十个番茄', cond: (s: any) => s.totalSessions >= 10 },
  { id: 'fifty', icon: '🏵️', name: '五十番茄', cond: (s: any) => s.totalSessions >= 50 },
  { id: 'streak3', icon: '🔥', name: '三天连击', cond: (s: any) => s.streak >= 3 },
  { id: 'streak7', icon: '🌟', name: '七天连击', cond: (s: any) => s.streak >= 7 },
  { id: 'nightowl', icon: '🦉', name: '深夜猫头鹰', cond: () => new Date().getHours() >= 22 },
  { id: 'earlybird', icon: '🐦', name: '清晨鸟儿', cond: () => new Date().getHours() < 7 },
];

const themeTips: { [key: string]: string } = {
  night: '深呼吸三次，把手机调成勿扰模式，告诉自己：接下来的这段时间，只属于眼前的这一件事。',
  forest: '想象自己坐在雨后的森林小屋里，木头的气味和鸟鸣会让思绪慢慢安定下来。',
  rain: '窗外的雨声是最好的白噪音，让它替你屏蔽掉世界的嘈杂。'
};

const STARS = Array.from({ length: 70 }, (_, i) => ({
  id: i,
  left: ((i * 17) % 100) + '%',
  top: ((i * 13) % 55) + '%',
  delay: (i * 0.15).toFixed(1) + 's'
}));

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (10 + (i * 4.7) % 80) + '%',
  dx: ((i * 13) % 60 - 30) + 'px',
  duration: (6 + (i * 1.3) % 8) + 's',
  delay: (i * 0.45) + 's'
}));

const FIREFLY_POSITIONS = Array.from({ length: 24 }, (_, i) => {
  const cx = 32 + ((i * 17) % 36);
  const cy = 35 + ((i * 23) % 65);
  return { cx, cy };
});

export default function DidadidiApp() {
  // --- Persistent State ---
  const [state, setState] = useState(() => {
    const STORE_KEY = 'didadi-state-v1';
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      todos: [] as { id: string; title: string; est: number; donePomos: number; done: boolean }[],
      stats: { daily: {} as { [key: string]: number }, totalSessions: 0, streak: 0, lastDate: null as string | null, fireflies: 0 },
      settings: { workMin: 50, breakMin: 10, theme: 'night', sound: { fire: 55, rain: 0, library: 25, white: 0 } },
      achievements: [] as string[]
    };
  });

  // --- Local Temp States ---
  const [activeTab, setActiveTab] = useState<'timer' | 'todo' | 'ambience' | 'stats' | 'room'>('timer');
  const [todoInput, setTodoInput] = useState('');
  const [todoEst, setTodoEst] = useState('1');
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({ show: false, msg: '' });
  const [joinInput, setJoinInput] = useState('');

  // --- Timer Engine State ---
  const [timer, setTimer] = useState({
    workMin: state.settings.workMin || 50,
    breakMin: state.settings.breakMin || 10,
    phase: 'work', // work | break
    remaining: (state.settings.workMin || 50) * 60,
    running: false,
    sessionsToday: 0,
    linkedTodoId: null as string | null
  });

  // --- Real-time Room Sync State ---
  const [clientId] = useState(() => 'user-' + Math.random().toString(36).substring(2, 11));
  const [nickname] = useState(() => '同学' + Math.floor(Math.random() * 900 + 100));
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [mySeat, setMySeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<(any | null)[]>(new Array(8).fill(null));
  const [floatingReactions, setFloatingReactions] = useState<{ id: string; emoji: string; left: string }[]>([]);

  // --- Web Audio Refs ---
  const [ambiencePlaying, setAmbiencePlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ [key: string]: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } }>({});

  const todayKey = () => new Date().toISOString().slice(0, 10);

  // --- Toast Trigger ---
  const toastTimeoutRef = useRef<any>(null);
  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast({ show: false, msg: '' });
    }, 2600);
  };

  // --- Save State effect ---
  useEffect(() => {
    localStorage.setItem('didadi-state-v1', JSON.stringify(state));
  }, [state]);

  // --- Audio Setup helpers ---
  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    return audioCtxRef.current;
  };

  const makeNoiseBuffer = (ctx: AudioContext, seconds = 2) => {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const buildSoundGraph = (ctx: AudioContext, type: string) => {
    const source = ctx.createBufferSource();
    source.buffer = makeNoiseBuffer(ctx, 2);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    gain.gain.value = 0;

    if (type === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 0.6;
    } else if (type === 'fire') {
      filter.type = 'lowpass';
      filter.frequency.value = 500;
      filter.Q.value = 1.2;
    } else if (type === 'library') {
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.4;
    } else if (type === 'white') {
      filter.type = 'allpass';
      filter.frequency.value = 1000;
    }

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    return { source, filter, gain };
  };

  const ensureSoundGraphs = () => {
    const ctx = getAudioCtx();
    ['fire', 'rain', 'library', 'white'].forEach((type) => {
      if (!soundNodesRef.current[type]) {
        soundNodesRef.current[type] = buildSoundGraph(ctx, type);
      }
    });
  };

  const setSoundVolume = (type: string, val01: number, isPlaying: boolean) => {
    if (!soundNodesRef.current[type]) return;
    const ctx = getAudioCtx();
    soundNodesRef.current[type].gain.gain.setTargetAtTime(isPlaying ? val01 * 0.5 : 0, ctx.currentTime, 0.15);
  };

  const playChime = () => {
    try {
      const ctx = getAudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSoundVolumeChange = (type: string, val: number) => {
    setState(prev => {
      const nextSound = { ...prev.settings.sound, [type]: val };
      return {
        ...prev,
        settings: { ...prev.settings, sound: nextSound }
      };
    });
    if (ambiencePlaying) {
      ensureSoundGraphs();
      setSoundVolume(type, val / 100, true);
    }
  };

  const toggleSound = () => {
    const nextPlaying = !ambiencePlaying;
    setAmbiencePlaying(nextPlaying);
    ensureSoundGraphs();
    ['fire', 'rain', 'library', 'white'].forEach((type) => {
      const vol = state.settings.sound[type as 'fire' | 'rain' | 'library' | 'white'] ?? 0;
      setSoundVolume(type, vol / 100, nextPlaying);
    });
  };

  const applyTheme = (themeName: string) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, theme: themeName }
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // --- Real-time Firebase Sync actions ---
  const broadcastTimer = async (phase: string, remaining: number, running: boolean, workMin: number, breakMin: number) => {
    if (roomCode && isHost) {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        'timer.phase': phase,
        'timer.remaining': remaining,
        'timer.running': running,
        'timer.workMin': workMin,
        'timer.breakMin': breakMin,
        'timer.updatedAt': Date.now()
      }).catch(err => console.error(err));
    }
  };

  // --- Timer Engine logic ---
  const recordCompletedSession = () => {
    setTimer(prev => ({ ...prev, sessionsToday: prev.sessionsToday + 1 }));

    const key = todayKey();
    setState((prev) => {
      const newDaily = { ...prev.stats.daily };
      newDaily[key] = (newDaily[key] || 0) + timer.workMin;

      const totalSessions = prev.stats.totalSessions + 1;
      const fireflies = prev.stats.fireflies + 1;

      const last = prev.stats.lastDate;
      let streak = prev.stats.streak;
      let lastDate = prev.stats.lastDate;

      if (last !== key) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().slice(0, 10);
        streak = (last === yesterdayKey) ? prev.stats.streak + 1 : 1;
        lastDate = key;
      }

      // Update linked todo tomato count
      let newTodos = prev.todos;
      if (timer.linkedTodoId) {
        newTodos = prev.todos.map(t => {
          if (t.id === timer.linkedTodoId) {
            return { ...t, donePomos: (t.donePomos || 0) + 1 };
          }
          return t;
        });
      }

      const nextStats = {
        ...prev.stats,
        daily: newDaily,
        totalSessions,
        fireflies,
        streak,
        lastDate
      };

      // Check achievements
      const nextAchievements = [...prev.achievements];
      const newUnlocked: string[] = [];
      ACHIEVEMENTS.forEach(a => {
        if (!nextAchievements.includes(a.id) && a.cond(nextStats)) {
          nextAchievements.push(a.id);
          newUnlocked.push(a.name);
        }
      });

      if (newUnlocked.length > 0) {
        setTimeout(() => {
          newUnlocked.forEach(name => {
            showToast(`🏅 解锁成就：${name}`);
          });
        }, 500);
      }

      return {
        ...prev,
        stats: nextStats,
        todos: newTodos,
        achievements: nextAchievements
      };
    });
  };

  const onPhaseComplete = () => {
    setTimer((prev) => {
      const nextPhase = prev.phase === 'work' ? 'break' : 'work';
      const nextRemaining = (nextPhase === 'work' ? prev.workMin : prev.breakMin) * 60;

      playChime();

      if (prev.phase === 'work') {
        recordCompletedSession();
        showToast('🍅 一个番茄完成！起来走一走，喝口水吧～');
      } else {
        showToast('☀️ 休息结束，继续加油！');
      }

      if (roomCode && isHost) {
        broadcastTimer(nextPhase, nextRemaining, false, prev.workMin, prev.breakMin);
      }

      return {
        ...prev,
        phase: nextPhase,
        remaining: nextRemaining,
        running: false
      };
    });
  };

  // --- Timer Ticker effect ---
  useEffect(() => {
    let intervalId: any = null;
    if (timer.running) {
      intervalId = setInterval(() => {
        setTimer((prev) => {
          if (prev.remaining <= 1) {
            clearInterval(intervalId);
            onPhaseComplete();
            return prev;
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timer.running, roomCode, isHost]);

  const startPause = () => {
    if (roomCode && !isHost) {
      showToast('👥 自习室联机中，只有房主能操作计时器噢～');
      return;
    }
    const nextRunning = !timer.running;
    setTimer(prev => {
      const nextState = { ...prev, running: nextRunning };
      if (roomCode && isHost) {
        broadcastTimer(nextState.phase, nextState.remaining, nextState.running, nextState.workMin, nextState.breakMin);
      }
      return nextState;
    });
  };

  const resetTimer = () => {
    if (roomCode && !isHost) {
      showToast('👥 自习室联机中，只有房主能操作计时器噢～');
      return;
    }
    setTimer(prev => {
      const nextState = {
        ...prev,
        running: false,
        phase: 'work',
        remaining: prev.workMin * 60
      };
      if (roomCode && isHost) {
        broadcastTimer('work', prev.workMin * 60, false, prev.workMin, prev.breakMin);
      }
      return nextState;
    });
  };

  const skipPhase = () => {
    if (roomCode && !isHost) {
      showToast('👥 自习室联机中，只有房主能操作计时器噢～');
      return;
    }
    setTimer(prev => {
      const nextPhase = prev.phase === 'work' ? 'break' : 'work';
      const nextRemaining = (nextPhase === 'work' ? prev.workMin : prev.breakMin) * 60;

      if (roomCode && isHost) {
        broadcastTimer(nextPhase, nextRemaining, false, prev.workMin, prev.breakMin);
      }

      showToast(prev.phase === 'work' ? '已跳过专注，去休息吧～' : '已跳过休息，继续专注吧！');

      return {
        ...prev,
        running: false,
        phase: nextPhase,
        remaining: nextRemaining
      };
    });
  };

  const handleModeClick = (w: string, b: string) => {
    if (roomCode && !isHost) {
      showToast('👥 自习室联机中，只有房主能操作计时器噢～');
      return;
    }
    let work = timer.workMin;
    let breakTime = timer.breakMin;
    if (w === 'custom') {
      const customW = parseInt(prompt('自定义专注时长（分钟）', timer.workMin.toString()) || '');
      const customB = parseInt(prompt('自定义休息时长（分钟）', timer.breakMin.toString()) || '');
      if (customW) work = customW;
      if (customB) breakTime = customB;
    } else {
      work = parseInt(w);
      breakTime = parseInt(b);
    }

    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, workMin: work, breakMin: breakTime }
    }));

    setTimer(prev => {
      const nextState = {
        ...prev,
        workMin: work,
        breakMin: breakTime,
        running: false,
        phase: 'work',
        remaining: work * 60
      };
      if (roomCode && isHost) {
        broadcastTimer('work', work * 60, false, work, breakTime);
      }
      return nextState;
    });
  };

  // --- Todo Actions ---
  const handleAddTodo = () => {
    const title = todoInput.trim();
    if (!title) return;
    setState((prev) => ({
      ...prev,
      todos: [...prev.todos, { id: 't' + Date.now(), title, est: parseInt(todoEst), donePomos: 0, done: false }]
    }));
    setTodoInput('');
  };

  const handleToggleTodo = (id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
    }));
  };

  const handleFocusTodo = (id: string) => {
    setTimer(prev => ({
      ...prev,
      linkedTodoId: prev.linkedTodoId === id ? null : id
    }));
  };

  const handleDeleteTodo = (id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter(t => t.id !== id)
    }));
    if (timer.linkedTodoId === id) {
      setTimer(prev => ({ ...prev, linkedTodoId: null }));
    }
  };

  // --- Room Sync Firebase Engine ---
  const createRoom = async () => {
    const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const initialSeats = new Array(8).fill(null);
    initialSeats[0] = { nickname, resting: timer.phase === 'break', clientId };
    const initialRoomData = {
      code,
      seats: initialSeats,
      hostId: clientId,
      timer: {
        remaining: timer.remaining,
        phase: timer.phase,
        running: timer.running,
        workMin: timer.workMin,
        breakMin: timer.breakMin,
        updatedAt: Date.now()
      },
      reactions: []
    };

    await setDoc(doc(db, 'rooms', code), initialRoomData);
    setRoomCode(code);
    setIsHost(true);
    setMySeat(0);
    setSeats(initialSeats);
    showToast(`自习室已创建，房间码 ${code}，发给朋友加入吧！`);
  };

  const joinRoom = async (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode.length < 4) {
      showToast('请输入正确的房间码');
      return;
    }
    const roomRef = doc(db, 'rooms', cleanCode);
    const snap = await getDoc(roomRef);
    if (!snap.exists()) {
      showToast('房间不存在！');
      return;
    }
    const data = snap.data();
    const currentSeats = [...data.seats];
    const emptyIndex = currentSeats.indexOf(null);
    if (emptyIndex === -1) {
      showToast('房间已满！');
      return;
    }

    currentSeats[emptyIndex] = { nickname, resting: timer.phase === 'break', clientId };
    await updateDoc(roomRef, { seats: currentSeats });
    setRoomCode(cleanCode);
    setIsHost(false);
    setMySeat(emptyIndex);
    showToast(`成功加入自习室 ${cleanCode}`);
  };

  const leaveRoom = async () => {
    if (roomCode) {
      const roomRef = doc(db, 'rooms', roomCode);
      const snap = await getDoc(roomRef);
      if (snap.exists()) {
        const data = snap.data();
        const currentSeats = [...data.seats];
        if (mySeat !== null) {
          currentSeats[mySeat] = null;
          const isRoomEmpty = currentSeats.every(s => s === null);
          if (isRoomEmpty) {
            await updateDoc(roomRef, { seats: currentSeats });
          } else {
            const updates: any = { seats: currentSeats };
            if (data.hostId === clientId) {
              const nextActiveUser = currentSeats.find(s => s !== null);
              if (nextActiveUser) {
                updates.hostId = nextActiveUser.clientId;
              }
            }
            await updateDoc(roomRef, updates);
          }
        }
      }
    }
    setRoomCode(null);
    setIsHost(false);
    setMySeat(null);
    setSeats(new Array(8).fill(null));
    showToast('已离开自习室');
  };

  const sitSeat = async (index: number) => {
    if (!roomCode) return;
    const roomRef = doc(db, 'rooms', roomCode);
    const snap = await getDoc(roomRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentSeats = [...data.seats];
      if (currentSeats[index]) return; // Occupied
      if (mySeat !== null) {
        currentSeats[mySeat] = null;
      }
      currentSeats[index] = { nickname, resting: timer.phase === 'break', clientId };
      await updateDoc(roomRef, { seats: currentSeats });
      setMySeat(index);
    }
  };

  const spawnReactionFloat = (emoji: string) => {
    const id = 'float-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const left = (30 + Math.random() * 40) + '%';
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1800);
  };

  const react = async (emoji: string) => {
    if (roomCode) {
      const roomRef = doc(db, 'rooms', roomCode);
      await updateDoc(roomRef, {
        reactions: arrayUnion({
          id: 'react-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          emoji,
          seat: mySeat,
          timestamp: Date.now()
        })
      });
    } else {
      spawnReactionFloat(emoji);
    }
  };

  // --- Firestore Snapshot Realtime Listener ---
  useEffect(() => {
    if (!roomCode) return;

    const seenReactionIds = new Set<string>();
    const roomRef = doc(db, 'rooms', roomCode);

    const unsubscribe = onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) {
        showToast('自习室已被销毁');
        leaveRoom();
        return;
      }
      const data = snap.data();
      setSeats(data.seats);

      if (data.hostId === clientId) {
        setIsHost(true);
      } else {
        setIsHost(false);
      }

      // Dynamic follower clock sync
      if (data.hostId !== clientId) {
        const roomTimer = data.timer;
        if (roomTimer) {
          let currentRemaining = roomTimer.remaining;
          if (roomTimer.running) {
            const elapsed = Math.floor((Date.now() - roomTimer.updatedAt) / 1000);
            currentRemaining = Math.max(0, roomTimer.remaining - elapsed);
          }
          setTimer((prev) => ({
            ...prev,
            remaining: currentRemaining,
            phase: roomTimer.phase,
            running: roomTimer.running,
            workMin: roomTimer.workMin,
            breakMin: roomTimer.breakMin
          }));
        }
      }

      // Floating Reactions Sync
      if (data.reactions && Array.isArray(data.reactions)) {
        data.reactions.forEach((r: any) => {
          if (Date.now() - r.timestamp < 10000 && !seenReactionIds.has(r.id)) {
            seenReactionIds.add(r.id);
            spawnReactionFloat(r.emoji);
          }
        });
      }
    }, (error) => {
      console.error('Firestore snapshot error:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, clientId]);

  // --- Real-time Seat resting updater ---
  useEffect(() => {
    if (roomCode && mySeat !== null) {
      const updateSeatResting = async () => {
        const roomRef = doc(db, 'rooms', roomCode);
        const snap = await getDoc(roomRef);
        if (snap.exists()) {
          const data = snap.data();
          const currentSeats = [...data.seats];
          if (currentSeats[mySeat]) {
            currentSeats[mySeat].resting = timer.phase === 'break';
            await updateDoc(roomRef, { seats: currentSeats });
          }
        }
      };
      updateSeatResting();
    }
  }, [timer.phase, roomCode, mySeat]);

  // --- Stats Helpers ---
  const heatmapDays = useMemo(() => {
    const days = 28;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const mins = state.stats.daily[key] || 0;
      const alpha = mins === 0 ? 0.06 : Math.min(0.15 + mins / 120, 1);
      return { key, mins, alpha };
    });
  }, [state.stats.daily]);

  // --- Render Formatting ---
  const fmt = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const total = (timer.phase === 'work' ? timer.workMin : timer.breakMin) * 60;
  const ratio = 1 - (timer.remaining / total);
  const strokeDashoffset = 628.318 * (timer.remaining / total);

  const activeTodo = state.todos.find(x => x.id === timer.linkedTodoId);

  return (
    <div className="didadi-root" data-theme={state.settings.theme || 'night'}>
      {/* Dynamic Embedded isolated styles to avoid polluting host frame */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .didadi-root {
          --ink-night: #0b1220;
          --dusk-blue: #1b2a45;
          --dusk-blue-soft: #233657;
          --ember-glow: #e8935a;
          --ember-hot: #ff8a4c;
          --candle-cream: #f3e7c9;
          --moss-green: #6b9c74;
          --lavender-mist: #a79bc9;
          --firefly-gold: #ffd873;
          --panel-glass: rgba(27,42,69,0.55);
          --panel-border: rgba(243,231,201,0.14);
          --text-main: #f3e7c9;
          --text-dim: #b9c3d6;
          --font-display: 'Fraunces', serif;
          --font-body: 'Nunito Sans', -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --radius-lg: 22px;
          --radius-md: 14px;
          --radius-sm: 8px;

          width: 100%;
          min-height: 100%;
          position: relative;
          font-family: var(--font-body);
          color: var(--text-main);
          background: var(--ink-night);
          overflow-x: hidden;
          box-sizing: border-box;
          padding-bottom: 24px;
        }

        .didadi-root[data-theme="forest"] {
          --ink-night: #0a1712;
          --dusk-blue: #16281f;
          --dusk-blue-soft: #1e3428;
          --ember-glow: #c9a24a;
          --moss-green: #7ab26b;
          --lavender-mist: #9fc79a;
        }

        .didadi-root[data-theme="rain"] {
          --ink-night: #0c1420;
          --dusk-blue: #182838;
          --dusk-blue-soft: #213648;
          --ember-glow: #6fa8dc;
          --moss-green: #5b8fa8;
          --lavender-mist: #8fb8d6;
        }

        .didadi-root * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        .didadi-root h1, .didadi-root h2, .didadi-root h3, .didadi-root .display {
          font-family: var(--font-display);
        }

        .didadi-root button {
          font-family: var(--font-body);
          cursor: pointer;
          outline: none;
        }

        .didadi-root ::selection {
          background: var(--firefly-gold);
          color: var(--ink-night);
        }

        /* Ambient Scene */
        .didadi-root .scene {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 50% at 78% 8%, rgba(243,231,201,0.10), transparent 60%),
            linear-gradient(180deg, var(--ink-night) 0%, var(--dusk-blue) 55%, #05070c 100%);
          transition: background 1.2s ease;
          pointer-events: none;
        }

        .didadi-root .scene * {
          pointer-events: auto;
        }

        .didadi-root .moon {
          position: absolute;
          top: 6%;
          right: 12%;
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, var(--candle-cream), #d8c98f 60%, transparent 75%);
          box-shadow: 0 0 60px 20px rgba(243,231,201,0.18), 0 0 140px 60px rgba(243,231,201,0.08);
          opacity: 0.9;
        }

        .didadi-root .stars {
          position: absolute;
          inset: 0;
        }

        .didadi-root .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: var(--candle-cream);
          border-radius: 50%;
          animation: didadi-twinkle 3.5s ease-in-out infinite;
          opacity: .5;
        }

        @keyframes didadi-twinkle {
          0%, 100% { opacity: .15 }
          50% { opacity: .9 }
        }

        .didadi-root .shelf-silhouette {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 220px;
          fill: #05070c;
          opacity: .92;
        }

        .didadi-root .window {
          position: absolute;
          left: 6%;
          top: 10%;
          width: 150px;
          height: 190px;
          background: linear-gradient(180deg, rgba(27,42,69,0.4), rgba(11,18,32,0.7));
          border: 6px solid #05070c;
          border-radius: 6px;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.6), 0 0 30px rgba(243,231,201,0.06);
        }

        .didadi-root .window::before, .didadi-root .window::after {
          content: '';
          position: absolute;
          background: #05070c;
        }

        .didadi-root .window::before {
          left: 50%;
          top: 0;
          bottom: 0;
          width: 6px;
          transform: translateX(-50%);
        }

        .didadi-root .window::after {
          top: 50%;
          left: 0;
          right: 0;
          height: 6px;
          transform: translateY(-50%);
        }

        .didadi-root .fireplace {
          position: absolute;
          left: 2%;
          bottom: 0;
          width: 190px;
          height: 170px;
          z-index: 2;
        }

        .didadi-root .fireplace .logs {
          position: absolute;
          bottom: 14px;
          left: 30px;
          width: 120px;
          height: 18px;
          background: #3b2a20;
          border-radius: 6px;
        }

        .didadi-root .flame {
          position: absolute;
          bottom: 26px;
          left: 60px;
          width: 60px;
          height: 80px;
          background: radial-gradient(ellipse at 50% 100%, var(--ember-hot), var(--ember-glow) 55%, transparent 75%);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          filter: blur(1px);
          animation: didadi-flicker 1.6s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .didadi-root .flame.f2 {
          left: 45px;
          width: 34px;
          height: 50px;
          animation-duration: 1.1s;
          opacity: .8;
        }

        .didadi-root .flame.f3 {
          left: 88px;
          width: 34px;
          height: 55px;
          animation-duration: 1.3s;
          opacity: .8;
        }

        @keyframes didadi-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(0deg); }
          25% { transform: scaleY(1.08) scaleX(.94) rotate(-2deg); }
          50% { transform: scaleY(0.92) scaleX(1.05) rotate(2deg); }
          75% { transform: scaleY(1.05) scaleX(.97) rotate(-1deg); }
        }

        .didadi-root .fireplace-glow {
          position: absolute;
          left: -40px;
          bottom: -40px;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,147,90,0.28), transparent 65%);
          pointer-events: none;
        }

        .didadi-root .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .didadi-root .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--firefly-gold);
          box-shadow: 0 0 8px 3px rgba(255,216,115,0.7);
          animation: didadi-float-up linear infinite;
          opacity: 0;
        }

        @keyframes didadi-float-up {
          0% { opacity: 0; transform: translate(0, 0); }
          10% { opacity: .9; }
          90% { opacity: .7; }
          100% { opacity: 0; transform: translate(var(--dx), -120px); }
        }

        .didadi-root .companion {
          position: absolute;
          bottom: 8%;
          left: 26%;
          width: 64px;
          z-index: 3;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.4));
          transition: transform .6s ease;
        }

        .didadi-root .companion svg {
          width: 100%;
          display: block;
        }

        .didadi-root .companion .eye {
          transition: transform .2s;
        }

        .didadi-root .companion.sleeping .eye {
          transform: scaleY(0.08);
        }

        .didadi-root .companion.sleeping {
          animation: didadi-breathe 3.2s ease-in-out infinite;
        }

        @keyframes didadi-breathe {
          0%, 100% { transform: translateY(0) }
          50% { transform: translateY(-3px) }
        }

        .didadi-root .zzz {
          position: absolute;
          top: -18px;
          right: -6px;
          font-family: var(--font-display);
          font-size: 14px;
          color: var(--text-dim);
          opacity: 0;
          animation: didadi-zz 2.4s ease-in-out infinite;
        }

        .didadi-root .companion.sleeping .zzz {
          opacity: 1;
        }

        @keyframes didadi-zz {
          0% { opacity: 0; transform: translateY(0) }
          30% { opacity: .8 }
          100% { opacity: 0; transform: translateY(-16px) }
        }

        /* Top Bar */
        .didadi-root .topbar {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 26px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .didadi-root .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .didadi-root .brand .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--firefly-gold);
          box-shadow: 0 0 10px 3px rgba(255,216,115,.7);
          animation: didadi-pulse-dot 1.6s ease-in-out infinite;
        }

        @keyframes didadi-pulse-dot {
          0%, 100% { opacity: .5 }
          50% { opacity: 1 }
        }

        .didadi-root .brand h1 {
          font-size: 22px;
          margin: 0;
          font-weight: 600;
          letter-spacing: .5px;
          color: var(--text-main);
        }

        .didadi-root .brand span.sub {
          font-size: 12px;
          color: var(--text-dim);
          display: block;
          font-family: var(--font-body);
          letter-spacing: 2px;
        }

        .didadi-root .mode-switch {
          display: flex;
          background: var(--panel-glass);
          border: 1px solid var(--panel-border);
          border-radius: 999px;
          padding: 4px;
          backdrop-filter: blur(10px);
        }

        .didadi-root .mode-switch button {
          border: none;
          background: transparent;
          color: var(--text-dim);
          padding: 8px 18px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: .5px;
          transition: .25s;
        }

        .didadi-root .mode-switch button.active {
          background: var(--ember-glow);
          color: #1c1204;
        }

        .didadi-root .top-actions {
          display: flex;
          gap: 8px;
        }

        .didadi-root .icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--panel-border);
          background: var(--panel-glass);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          backdrop-filter: blur(10px);
          transition: all 0.2s;
        }

        .didadi-root .icon-btn:hover {
          background: rgba(243,231,201,0.12);
        }

        /* Layout */
        .didadi-root .app-wrap {
          position: relative;
          z-index: 5;
          max-width: 1240px;
          margin: 0 auto;
          padding: 10px 26px 60px;
        }

        .didadi-root .layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 22px;
          align-items: start;
        }

        @media (max-width: 980px) {
          .didadi-root .layout {
            grid-template-columns: 1fr;
          }
        }

        .didadi-root .hero {
          padding: 18px 4px 26px;
        }

        .didadi-root .hero h2 {
          font-size: 38px;
          margin: 0 0 6px;
          font-weight: 600;
          line-height: 1.15;
          color: var(--text-main);
        }

        .didadi-root .hero p {
          color: var(--text-dim);
          font-size: 15px;
          max-width: 520px;
          margin: 0;
        }

        /* Glass Panel */
        .didadi-root .panel {
          background: var(--panel-glass);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
        }

        /* Tabs */
        .didadi-root .tabs {
          display: flex;
          gap: 6px;
          padding: 10px;
          overflow-x: auto;
        }

        .didadi-root .tabs button {
          flex: 1;
          white-space: nowrap;
          background: transparent;
          border: none;
          color: var(--text-dim);
          padding: 10px 12px;
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s;
        }

        .didadi-root .tabs button.active {
          background: rgba(243,231,201,0.12);
          color: var(--text-main);
        }

        .didadi-root .tab-panel {
          display: none;
          padding: 6px 22px 26px;
        }

        .didadi-root .tab-panel.active {
          display: block;
        }

        /* Timer Styles */
        .didadi-root .timer-modes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .didadi-root .chip {
          border: 1px solid var(--panel-border);
          background: rgba(243,231,201,0.06);
          color: var(--text-dim);
          padding: 7px 14px;
          border-radius: 999px;
          font-size: 12.5px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .didadi-root .chip.active {
          background: var(--ember-glow);
          color: #1c1204;
          border-color: transparent;
        }

        .didadi-root .ring-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px 0 6px;
        }

        .didadi-root .ring {
          position: relative;
          width: 230px;
          height: 230px;
        }

        .didadi-root .ring svg {
          transform: rotate(-90deg);
        }

        .didadi-root .bg-ring {
          stroke: rgba(243,231,201,0.1);
          fill: none;
          stroke-width: 10;
        }

        .didadi-root .fg-ring {
          fill: none;
          stroke-width: 10;
          stroke-linecap: round;
          transition: stroke-dashoffset .3s linear, stroke 0.3s;
        }

        .didadi-root .ring-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .didadi-root .ring-center .time {
          font-family: var(--font-mono);
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--text-main);
        }

        .didadi-root .ring-center .phase {
          font-size: 12px;
          color: var(--text-dim);
          letter-spacing: 3px;
          margin-top: 4px;
          text-transform: uppercase;
        }

        .didadi-root .current-task {
          text-align: center;
          margin: 14px 0;
          font-size: 14px;
          color: var(--text-dim);
          min-height: 20px;
        }

        .didadi-root .current-task b {
          color: var(--text-main);
        }

        .didadi-root .timer-controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 8px;
        }

        .didadi-root .btn {
          border: none;
          padding: 12px 22px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: .4px;
          transition: all 0.2s;
        }

        .didadi-root .btn-primary {
          background: var(--ember-glow);
          color: #1c1204;
        }

        .didadi-root .btn-ghost {
          background: rgba(243,231,201,0.08);
          color: var(--text-main);
          border: 1px solid var(--panel-border);
        }

        .didadi-root .btn:active {
          transform: scale(.96);
        }

        .didadi-root .session-dots {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-top: 16px;
        }

        .didadi-root .session-dots span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(243,231,201,0.2);
          transition: all 0.3s;
        }

        .didadi-root .session-dots span.done {
          background: var(--firefly-gold);
          box-shadow: 0 0 6px 2px rgba(255,216,115,.6);
        }

        /* Todo List Styles */
        .didadi-root .todo-add {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
        }

        .didadi-root .todo-add input[type=text] {
          flex: 1;
          background: rgba(11,18,32,0.4);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          color: var(--text-main);
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }

        .didadi-root .todo-add select {
          background: rgba(11,18,32,0.4);
          color: var(--text-main);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          padding: 0 8px;
          outline: none;
        }

        .didadi-root .todo-add button {
          background: var(--moss-green);
          color: #08170a;
          border: none;
          border-radius: var(--radius-md);
          padding: 0 16px;
          font-weight: 800;
        }

        .didadi-root .todo-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 340px;
          overflow-y: auto;
        }

        .didadi-root .todo-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(243,231,201,0.05);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          transition: all 0.2s;
        }

        .didadi-root .todo-item.focused {
          border-color: var(--ember-glow);
          background: rgba(232,147,90,0.1);
        }

        .didadi-root .todo-item.done .todo-title {
          text-decoration: line-through;
          color: var(--text-dim);
        }

        .didadi-root .todo-check {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid var(--moss-green);
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
          color: var(--text-main);
        }

        .didadi-root .todo-item.done .todo-check {
          background: var(--moss-green);
        }

        .didadi-root .todo-title {
          flex: 1;
          font-size: 14px;
          cursor: pointer;
        }

        .didadi-root .todo-meta {
          font-size: 11px;
          color: var(--text-dim);
          font-family: var(--font-mono);
        }

        .didadi-root .todo-actions {
          display: flex;
          gap: 6px;
        }

        .didadi-root .todo-actions button {
          background: transparent;
          border: none;
          color: var(--text-dim);
          font-size: 14px;
          transition: color 0.2s;
        }

        .didadi-root .todo-actions button:hover {
          color: var(--text-main);
        }

        .didadi-root .empty-hint {
          color: var(--text-dim);
          font-size: 13px;
          text-align: center;
          padding: 30px 0;
        }

        /* Sound Ambient Styles */
        .didadi-root .sound-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--panel-border);
        }

        .didadi-root .sound-row:last-child {
          border-bottom: none;
        }

        .didadi-root .sound-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(243,231,201,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex: none;
        }

        .didadi-root .sound-name {
          flex: none;
          width: 96px;
          font-size: 13.5px;
          font-weight: 700;
        }

        .didadi-root .sound-row input[type=range] {
          flex: 1;
          accent-color: var(--ember-glow);
          cursor: pointer;
        }

        .didadi-root .theme-row {
          display: flex;
          gap: 10px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .didadi-root .theme-swatch {
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          background: rgba(243,231,201,0.05);
          color: var(--text-dim);
          font-size: 12.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .didadi-root .theme-swatch.active {
          border-color: var(--ember-glow);
          color: var(--text-main);
        }

        .didadi-root .theme-swatch i {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          display: inline-block;
        }

        /* Stats Styles */
        .didadi-root .stat-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 18px;
        }

        .didadi-root .stat-card {
          background: rgba(243,231,201,0.05);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          padding: 12px;
          text-align: center;
        }

        .didadi-root .stat-card .num {
          font-family: var(--font-mono);
          font-size: 22px;
          font-weight: 700;
          color: var(--firefly-gold);
        }

        .didadi-root .stat-card .lbl {
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 2px;
        }

        .didadi-root .jar-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 4px 20px;
        }

        .didadi-root .jar-wrap svg {
          width: 90px;
          flex: none;
        }

        .didadi-root .jar-text {
          font-size: 13px;
          color: var(--text-dim);
          line-height: 1.6;
        }

        .didadi-root .jar-text b {
          color: var(--text-main);
          font-size: 16px;
        }

        .didadi-root .heatmap {
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          gap: 4px;
          margin: 14px 0;
        }

        .didadi-root .heat-cell {
          aspect-ratio: 1;
          border-radius: 3px;
          background: rgba(243,231,201,0.06);
          transition: background 0.3s;
        }

        .didadi-root .badges {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(74px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .didadi-root .badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 4px;
          border-radius: var(--radius-md);
          background: rgba(243,231,201,0.04);
          border: 1px solid var(--panel-border);
          opacity: .35;
          transition: all 0.3s;
        }

        .didadi-root .badge.unlocked {
          opacity: 1;
          background: rgba(255,216,115,0.08);
          border-color: rgba(255,216,115,0.3);
        }

        .didadi-root .badge .ic {
          font-size: 22px;
        }

        .didadi-root .badge .nm {
          font-size: 10px;
          color: var(--text-dim);
          text-align: center;
        }

        /* Room sync style */
        .didadi-root .room-empty {
          text-align: center;
          padding: 20px 6px;
        }

        .didadi-root .room-empty p {
          color: var(--text-dim);
          font-size: 13.5px;
          margin: 8px 0 18px;
          line-height: 1.6;
        }

        .didadi-root .room-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 280px;
          margin: 0 auto;
        }

        .didadi-root .room-actions .join-row {
          display: flex;
          gap: 8px;
        }

        .didadi-root .room-actions input {
          flex: 1;
          text-transform: uppercase;
          text-align: center;
          letter-spacing: 3px;
          font-family: var(--font-mono);
          background: rgba(11,18,32,0.4);
          border: 1px solid var(--panel-border);
          border-radius: var(--radius-md);
          color: var(--text-main);
          padding: 10px;
          outline: none;
        }

        .didadi-root .room-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .didadi-root .room-code-badge {
          font-family: var(--font-mono);
          background: rgba(255,216,115,0.12);
          border: 1px dashed var(--firefly-gold);
          color: var(--firefly-gold);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          letter-spacing: 3px;
          font-size: 14px;
        }

        .didadi-root .seat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 14px 0;
        }

        .didadi-root .seat {
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          border: 1px dashed var(--panel-border);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          background: rgba(243,231,201,0.03);
          font-size: 11px;
          color: var(--text-dim);
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }

        .didadi-root .seat.occupied {
          border-style: solid;
          border-color: var(--ember-glow);
          background: rgba(232,147,90,0.1);
          color: var(--text-main);
          cursor: default;
        }

        .didadi-root .seat.me {
          border-color: var(--firefly-gold);
          box-shadow: 0 0 0 2px rgba(255,216,115,0.25) inset;
        }

        .didadi-root .seat .avatar {
          font-size: 22px;
          transition: opacity 0.3s;
        }

        .didadi-root .seat .status-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--moss-green);
        }

        .didadi-root .seat.resting .status-dot {
          background: var(--lavender-mist);
        }

        .didadi-root .reaction-bar {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin: 14px 0;
        }

        .didadi-root .reaction-bar button {
          background: rgba(243,231,201,0.08);
          border: 1px solid var(--panel-border);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 16px;
          transition: background 0.2s;
        }

        .didadi-root .reaction-bar button:hover {
          background: rgba(243,231,201,0.18);
        }

        .didadi-root .reaction-float {
          position: absolute;
          font-size: 26px;
          pointer-events: none;
          z-index: 50;
          animation: didadi-react-up 1.8s ease-out forwards;
        }

        @keyframes didadi-react-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-90px) scale(1.4); }
        }

        .didadi-root .leave-btn {
          width: 100%;
          margin-top: 6px;
          background: transparent;
          border: 1px solid var(--panel-border);
          color: var(--text-dim);
          border-radius: var(--radius-md);
          padding: 10px;
          font-weight: 700;
          transition: all 0.2s;
        }

        .didadi-root .leave-btn:hover {
          background: rgba(243,231,201,0.05);
          color: var(--text-main);
        }

        .didadi-root .note-box {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: rgba(167,155,201,0.1);
          border: 1px solid rgba(167,155,201,0.3);
          font-size: 12px;
          color: var(--lavender-mist);
          line-height: 1.6;
          text-align: left;
        }

        /* Toast Styles */
        .didadi-root .toast {
          position: absolute;
          left: 50%;
          top: 24px;
          transform: translate(-50%, -140%);
          z-index: 100;
          background: var(--panel-glass);
          border: 1px solid var(--panel-border);
          backdrop-filter: blur(14px);
          padding: 12px 22px;
          border-radius: 999px;
          font-size: 13.5px;
          transition: transform .4s cubic-bezier(.2,.9,.3,1.2);
          max-width: 90%;
          text-align: center;
          pointer-events: none;
        }

        .didadi-root .toast.show {
          transform: translate(-50%, 0);
        }

        /* Jar Floating indicators */
        .didadi-root .jar-mini {
          position: absolute;
          right: 22px;
          bottom: 22px;
          z-index: 30;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--panel-glass);
          border: 1px solid var(--panel-border);
          backdrop-filter: blur(12px);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          color: var(--text-dim);
        }

        .didadi-root .jar-mini b {
          color: var(--firefly-gold);
          font-family: var(--font-mono);
        }

        @media (max-width: 600px) {
          .didadi-root .stat-cards {
            grid-template-columns: 1fr 1fr;
          }
          .didadi-root .seat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .didadi-root .hero h2 {
            font-size: 28px;
          }
          .didadi-root .heatmap {
            grid-template-columns: repeat(10, 1fr);
          }
        }
      `}</style>

      {/* Background Ambient Scene */}
      <div className="scene" id="scene">
        <div className="moon"></div>
        <div className="stars" id="stars">
          {STARS.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                left: star.left,
                top: star.top,
                animationDelay: star.delay
              }}
            />
          ))}
        </div>
        <div className="window"></div>
        <svg className="shelf-silhouette" viewBox="0 0 1200 220" preserveAspectRatio="none">
          <path d="M0 220 L0 40 L60 40 L60 90 L140 90 L140 30 L220 30 L220 100 L310 100 L310 20 L400 20 L400 80 L500 80 L500 10 L600 10 L600 70 L700 70 L700 30 L800 30 L800 95 L900 95 L900 20 L1000 20 L1000 60 L1100 60 L1100 5 L1200 5 L1200 220 Z"/>
        </svg>
        <div className="fireplace">
          <div className="fireplace-glow"></div>
          <div className="logs"></div>
          <div className="flame f1"></div>
          <div className="flame f2"></div>
          <div className="flame f3"></div>
        </div>
        <div className="particles" id="particles">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                bottom: '0px',
                // @ts-ignore
                '--dx': p.dx,
                animationDuration: p.duration,
                animationDelay: p.delay
              }}
            />
          ))}
        </div>
        <div className={`companion ${timer.running && timer.phase === 'work' ? 'sleeping' : ''}`} id="companion">
          <span className="zzz">z z z</span>
          <svg viewBox="0 0 100 100">
            <ellipse cx="50" cy="60" rx="34" ry="30" fill="#6b5c47"/>
            <circle cx="50" cy="34" r="22" fill="#7a6a52"/>
            <polygon points="30,22 40,4 46,26" fill="#7a6a52"/>
            <polygon points="70,22 60,4 54,26" fill="#7a6a52"/>
            <circle className="eye" cx="42" cy="34" r="5" fill="#1c1204"/>
            <circle className="eye" cx="58" cy="34" r="5" fill="#1c1204"/>
            <polygon points="46,42 54,42 50,48" fill="#3b2a20"/>
            <ellipse cx="50" cy="66" rx="14" ry="12" fill="#f3e7c9" opacity=".85"/>
          </svg>
        </div>
      </div>

      {/* Floating Reaction Animation container */}
      {floatingReactions.map((r) => (
        <div
          key={r.id}
          className="reaction-float"
          style={{
            left: r.left,
            bottom: '120px'
          }}
        >
          {r.emoji}
        </div>
      ))}

      {/* Top bar header */}
      <div className="topbar">
        <div className="brand">
          <span className="dot"></span>
          <div>
            <h1>滴答滴</h1>
            <span className="sub">夜读自习室 · TICK TICK STUDY</span>
          </div>
        </div>
        <div className="mode-switch">
          <button
            className={!roomCode ? 'active' : ''}
            onClick={() => {
              if (roomCode) leaveRoom();
              setActiveTab('timer');
            }}
          >
            🧍 单机专注
          </button>
          <button
            className={roomCode ? 'active' : ''}
            onClick={() => {
              setActiveTab('room');
            }}
          >
            👥 联机自习
          </button>
        </div>
        <div className="top-actions">
          <button
            className="icon-btn"
            id="themeBtn"
            title="切换场景"
            onClick={() => {
              const order = ['night', 'forest', 'rain'];
              const next = order[(order.indexOf(state.settings.theme || 'night') + 1) % order.length];
              applyTheme(next);
            }}
          >
            🎨
          </button>
          <button className="icon-btn" id="fsBtn" title="全屏沉浸" onClick={toggleFullscreen}>⛶</button>
        </div>
      </div>

      {/* Main app Layout wrapper */}
      <div className="app-wrap">
        <div className="layout">
          {/* Left panel: Info + Daily Hints */}
          <div>
            <div className="hero">
              <h2 className="display">深夜书房，与你一起安静地专注。</h2>
              <p>点一盏灯，煮一壶白噪音，让萤火虫替你记住每一次坚持。选择番茄时长，写下今晚要完成的事，剩下的交给这个安静的房间。</p>
            </div>
            <div className="panel" style={{ padding: '20px 22px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: 'var(--text-main)' }}>✨ 今晚的小提示</h3>
              <p id="tipText" style={{ color: 'var(--text-dim)', fontSize: '13.5px', lineHeight: 1.7, margin: 0 }}>
                {themeTips[state.settings.theme || 'night']}
              </p>
            </div>
          </div>

          {/* Right Panel: Feature Tabs */}
          <div className="panel">
            <div className="tabs" id="tabs">
              <button className={activeTab === 'timer' ? 'active' : ''} onClick={() => setActiveTab('timer')}>⏱ 专注</button>
              <button className={activeTab === 'todo' ? 'active' : ''} onClick={() => setActiveTab('todo')}>📋 清单</button>
              <button className={activeTab === 'ambience' ? 'active' : ''} onClick={() => setActiveTab('ambience')}>🌙 氛围</button>
              <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>🪐 数据</button>
              <button className={activeTab === 'room' ? 'active' : ''} onClick={() => setActiveTab('room')}>🔗 联机</button>
            </div>

            {/* Timer Tab Panel */}
            <div className={`tab-panel ${activeTab === 'timer' ? 'active' : ''}`}>
              <div className="timer-modes" id="timerModes">
                <button className={`chip ${timer.workMin === 25 && timer.breakMin === 5 ? 'active' : ''}`} onClick={() => handleModeClick('25', '5')}>25 / 5</button>
                <button className={`chip ${timer.workMin === 50 && timer.breakMin === 10 ? 'active' : ''}`} onClick={() => handleModeClick('50', '10')}>50 / 10</button>
                <button className={`chip ${timer.workMin === 90 && timer.breakMin === 20 ? 'active' : ''}`} onClick={() => handleModeClick('90', '20')}>90 / 20</button>
                <button className="chip" onClick={() => handleModeClick('custom', 'custom')}>自定义</button>
              </div>
              <div className="ring-wrap">
                <div className="ring">
                  <svg width="230" height="230">
                    <circle className="bg-ring" cx="115" cy="115" r="100"></circle>
                    <circle
                      className="fg-ring"
                      cx="115"
                      cy="115"
                      r="100"
                      style={{
                        strokeDasharray: 628.318,
                        strokeDashoffset: strokeDashoffset,
                        stroke: timer.phase === 'work' ? 'var(--ember-glow)' : 'var(--moss-green)'
                      }}
                    />
                  </svg>
                  <div className="ring-center">
                    <div className="time" id="timeDisplay">{fmt(timer.remaining)}</div>
                    <div className="phase" id="phaseDisplay">{timer.phase === 'work' ? '专注中' : '休息中'}</div>
                  </div>
                </div>
              </div>
              <div className="current-task" id="currentTaskLine">
                {activeTodo ? (
                  <>正在专注：<b>{activeTodo.title}</b></>
                ) : (
                  '还没有关联任务 · 去「清单」里选一个吧'
                )}
              </div>
              <div className="timer-controls">
                <button className="btn btn-ghost" onClick={resetTimer}>重置</button>
                <button className="btn btn-primary" onClick={startPause}>
                  {timer.running ? '暂停' : (timer.remaining < total ? '继续' : (timer.phase === 'work' ? '开始专注' : '开始休息'))}
                </button>
                <button className="btn btn-ghost" onClick={skipPhase}>跳过</button>
              </div>
              <div className="session-dots" id="sessionDots">
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    className={(i < (timer.sessionsToday % 4) || (timer.sessionsToday > 0 && timer.sessionsToday % 4 === 0 && i < 4)) ? 'done' : ''}
                  />
                ))}
              </div>
            </div>

            {/* Todo List Tab Panel */}
            <div className={`tab-panel ${activeTab === 'todo' ? 'active' : ''}`}>
              <div className="todo-add">
                <input
                  type="text"
                  placeholder="今晚要完成的一件事…"
                  value={todoInput}
                  onChange={(e) => setTodoInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTodo(); }}
                />
                <select value={todoEst} onChange={(e) => setTodoEst(e.target.value)}>
                  <option value="1">🍅×1</option>
                  <option value="2">🍅×2</option>
                  <option value="3">🍅×3</option>
                  <option value="4">🍅×4</option>
                </select>
                <button onClick={handleAddTodo}>添加</button>
              </div>
              <ul className="todo-list" id="todoList">
                {state.todos.length === 0 ? (
                  <div className="empty-hint">还没有任务，写下今晚想完成的第一件事吧 📝</div>
                ) : (
                  state.todos.map((t) => (
                    <li
                      key={t.id}
                      className={`todo-item ${t.done ? 'done' : ''} ${t.id === timer.linkedTodoId ? 'focused' : ''}`}
                    >
                      <div className="todo-check" onClick={() => handleToggleTodo(t.id)}>
                        {t.done ? '✓' : ''}
                      </div>
                      <div className="todo-title" onClick={() => handleFocusTodo(t.id)}>
                        {t.title}
                      </div>
                      <div className="todo-meta">
                        {t.donePomos || 0}/{t.est}🍅
                      </div>
                      <div className="todo-actions">
                        <button onClick={() => handleDeleteTodo(t.id)} title="删除">
                          ✕
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Ambient Ambient Sounds Tab Panel */}
            <div className={`tab-panel ${activeTab === 'ambience' ? 'active' : ''}`}>
              <div className="sound-row">
                <div className="sound-icon">🔥</div>
                <div className="sound-name">壁炉噼啪</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.settings.sound.fire}
                  onChange={(e) => handleSoundVolumeChange('fire', parseInt(e.target.value))}
                />
              </div>
              <div className="sound-row">
                <div className="sound-icon">🌧️</div>
                <div className="sound-name">窗外雨声</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.settings.sound.rain}
                  onChange={(e) => handleSoundVolumeChange('rain', parseInt(e.target.value))}
                />
              </div>
              <div className="sound-row">
                <div className="sound-icon">📚</div>
                <div className="sound-name">图书馆环境音</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.settings.sound.library}
                  onChange={(e) => handleSoundVolumeChange('library', parseInt(e.target.value))}
                />
              </div>
              <div className="sound-row">
                <div className="sound-icon">🌊</div>
                <div className="sound-name">纯白噪音</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={state.settings.sound.white}
                  onChange={(e) => handleSoundVolumeChange('white', parseInt(e.target.value))}
                />
              </div>
              <div style={{ marginTop: '14px' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={toggleSound}>
                  {ambiencePlaying ? '🔇 关闭声音氛围' : '🔈 开启声音氛围'}
                </button>
              </div>
              <h3 style={{ fontSize: '13.5px', margin: '20px 0 4px', color: 'var(--text-dim)' }}>场景主题</h3>
              <div className="theme-row" id="themeRow">
                <div className={`theme-swatch ${state.settings.theme === 'night' ? 'active' : ''}`} onClick={() => applyTheme('night')}>
                  <i style={{ background: '#1b2a45' }} />深夜图书馆
                </div>
                <div className={`theme-swatch ${state.settings.theme === 'forest' ? 'active' : ''}`} onClick={() => applyTheme('forest')}>
                  <i style={{ background: '#16281f' }} />森林小屋
                </div>
                <div className={`theme-swatch ${state.settings.theme === 'rain' ? 'active' : ''}`} onClick={() => applyTheme('rain')}>
                  <i style={{ background: '#182838' }} />雨夜咖啡馆
                </div>
              </div>
            </div>

            {/* Stats Tab Panel */}
            <div className={`tab-panel ${activeTab === 'stats' ? 'active' : ''}`}>
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="num">{state.stats.daily[todayKey()] || 0}</div>
                  <div className="lbl">今日专注(分钟)</div>
                </div>
                <div className="stat-card">
                  <div className="num">{state.stats.streak || 0}</div>
                  <div className="lbl">连续打卡(天)</div>
                </div>
                <div className="stat-card">
                  <div className="num">{state.stats.totalSessions || 0}</div>
                  <div className="lbl">累计番茄数</div>
                </div>
              </div>
              <div className="jar-wrap">
                <svg viewBox="0 0 100 120" id="jarSvg">
                  <path d="M30 20 L30 10 L70 10 L70 20" stroke="#f3e7c9" strokeWidth="4" fill="none"/>
                  <path d="M22 20 Q20 20 20 26 L20 100 Q20 112 34 112 L66 112 Q80 112 80 100 L80 26 Q80 20 78 20 Z" fill="rgba(243,231,201,0.08)" stroke="#f3e7c9" strokeWidth="3"/>
                  <g id="jarFireflies">
                    {FIREFLY_POSITIONS.slice(0, Math.min(state.stats.fireflies, 24)).map((pos, idx) => (
                      <circle
                        key={idx}
                        cx={pos.cx}
                        cy={pos.cy}
                        r={2.2}
                        fill="#ffd873"
                        style={{ filter: 'drop-shadow(0 0 3px #ffd873)' }}
                      />
                    ))}
                  </g>
                </svg>
                <div className="jar-text">
                  萤火虫瓶：每完成一个番茄，就有一只萤火虫飞进瓶子。
                  <br />
                  <b id="jarCount">{state.stats.fireflies}</b> 只萤火虫正在为你发光。
                </div>
              </div>
              <h3 style={{ fontSize: '13.5px', margin: '6px 0 4px', color: 'var(--text-dim)' }}>最近打卡</h3>
              <div className="heatmap" id="heatmap">
                {heatmapDays.map((day) => (
                  <div
                    key={day.key}
                    className="heat-cell"
                    title={`${day.key}: ${day.mins}分钟`}
                    style={{
                      background: day.mins === 0 ? 'rgba(243,231,201,0.06)' : `rgba(255,216,115,${day.alpha})`
                    }}
                  />
                ))}
              </div>
              <h3 style={{ fontSize: '13.5px', margin: '16px 0 4px', color: 'var(--text-dim)' }}>成就徽章</h3>
              <div className="badges" id="badges">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.id} className={`badge ${state.achievements.includes(a.id) ? 'unlocked' : ''}`}>
                    <div className="ic">{a.icon}</div>
                    <div className="nm">{a.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multiplayer Room Tab Panel */}
            <div className={`tab-panel ${activeTab === 'room' ? 'active' : ''}`}>
              {!roomCode ? (
                <div id="roomEmptyView" className="room-empty">
                  <div style={{ fontSize: '34px' }}>🏛️</div>
                  <p>创建一间自习室，把房间号发给朋友，就能选座位、一起沉浸式学习。</p>
                  <div className="room-actions">
                    <button className="btn btn-primary" onClick={createRoom}>创建房间</button>
                    <div className="join-row">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="房间码"
                        value={joinInput}
                        onChange={(e) => setJoinInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') joinRoom(joinInput); }}
                      />
                      <button className="btn btn-ghost" onClick={() => joinRoom(joinInput)}>加入</button>
                    </div>
                  </div>
                  <div className="note-box">
                    🚀 联机自习室已接入真正的云端通道 (Firebase Firestore Database)！现在支持跨设备、跨浏览器实时同步，支持多人自习、实时选座、氛围同步、以及鼓劲表情实时飘浮互动，快把房号分享给朋友吧！
                  </div>
                </div>
              ) : (
                <div id="roomActiveView">
                  <div className="room-header">
                    <div className="room-code-badge" id="roomCodeLabel">{roomCode}</div>
                    <button
                      className="icon-btn"
                      id="copyCodeBtn"
                      title="复制房间码"
                      onClick={() => {
                        navigator.clipboard?.writeText(roomCode || '');
                        showToast('房间码已复制');
                      }}
                    >
                      ⧉
                    </button>
                  </div>
                  <div className="seat-grid" id="seatGrid">
                    {seats.map((s, i) => {
                      const isOccupied = s !== null;
                      const isMe = isOccupied && s.clientId === clientId;
                      const isResting = isOccupied && s.resting;
                      return (
                        <div
                          key={i}
                          className={`seat ${isOccupied ? 'occupied' : ''} ${isMe ? 'me' : ''} ${isResting ? 'resting' : ''}`}
                          onClick={() => {
                            if (!isOccupied) {
                              sitSeat(i);
                            }
                          }}
                        >
                          {isOccupied && <span className="status-dot"></span>}
                          <div className="avatar" style={{ opacity: isOccupied ? 1 : 0.3 }}>
                            {isOccupied ? '🧑‍🎓' : '＋'}
                          </div>
                          <div>
                            {isOccupied ? (
                              <>
                                {s.nickname}
                                {isMe ? '（我）' : ''}
                              </>
                            ) : (
                              '空位'
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="reaction-bar">
                    <button onClick={() => react('📣')}>📣 加油</button>
                    <button onClick={() => react('☕')}>☕ 休息啦</button>
                    <button onClick={() => react('👍')}>👍 稳住</button>
                    <button onClick={() => react('🔥')}>🔥 冲刺</button>
                  </div>
                  <button className="leave-btn" id="leaveRoomBtn" onClick={leaveRoom}>离开房间</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mini indicator & Toast */}
      <div className="jar-mini" id="jarMini">
        🌟 今日番茄 <b id="jarMiniCount">{timer.sessionsToday}</b>
      </div>
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        {toast.msg}
      </div>
    </div>
  );
}
