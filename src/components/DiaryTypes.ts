export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  content: string;
  mood: string; // emoji
  weather: string; // emoji
  folder: string;
  images?: string[];
  location?: string;
  files?: { name: string; url: string; size?: string }[];
  links?: string[];
  style?: {
    color?: string;
    fontSize?: string;
    bold?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    highlight?: string; // color string
  };
}

export interface FutureLetter {
  id: string;
  createdAt: string; // YYYY-MM-DD
  deliverAt: string; // YYYY-MM-DD
  title: string;
  content: string;
  recipient: string;
  stampId: string;
  sealColor: string;
  isDelivered: boolean;
  images?: string[];
  files?: { name: string; url: string; size?: string; type?: string; }[];
  bgImage?: string;
  letterType?: 'future' | 'past';
  recipientEmail?: string;
}

export const PRESET_DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: 'preset-1',
    date: '2026-05-20',
    time: '23:33',
    title: '海岛的落日余晖',
    content: '今天在海滩上呆了整整一个下午。落日把海面染成淡淡的橘粉色，海浪轻轻拍打在脚踝上。那一刻，浮躁的心彻底安静了下来。原来大自然就是最神奇的治愈师。写下这段话的时候，窗外还能听到隐约的涛声。🐳✨',
    mood: '😊',
    weather: '☀️',
    folder: '海岛随笔',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600'],
    location: '海南 · 三亚大东海',
    links: ['https://music.163.com/#/song?id=1813926522']
  },
  {
    id: 'preset-2',
    date: '2026-05-12',
    time: '14:15',
    title: '深夜捕获的咖啡馆灵感',
    content: '街角那家二十四小时咖啡馆放着轻柔的爵士乐。在昏黄的台灯下，本以为只是去打发时间，却突然对最近的小岛建设计划有了非常清晰的思路。有时，最棒的点子并不在行军般的拼命工作中，而是在允许自己放空和游荡的间隙里。☕📝',
    mood: '🤔',
    weather: '🌧️',
    folder: '灵感捕手',
    location: '浙江 · 杭州西湖区'
  }
];

export const PRESET_FUTURE_LETTERS: FutureLetter[] = [
  {
    id: 'letter-preset-1',
    createdAt: '2026-01-01',
    deliverAt: '2026-06-01', // already delivered in our timeline of Jun 2026!
    title: '写给夏季的我的问候',
    content: '嗨！当你读到这封信时，应该是炎热的六月了吧。半年前立下的那些小目标，比如每周读完一本书、早起喝一杯温水，你是否都有在坚持呢？无论生活有多少微小的起伏，希望现在的你依然充满喜悦。你很棒，请继续保持。',
    recipient: '未来的自己',
    stampId: 'stamp-butterfly',
    sealColor: '#9e2a2b',
    isDelivered: true
  },
  {
    id: 'letter-preset-2',
    createdAt: '2026-05-24',
    deliverAt: '2027-05-24', // delivers in 2027
    title: '寄往2027年春天的一封秘密信件',
    content: '春天的风很温柔。希望明年的这个时候，我已经去到了梦寐以求的深海岛屿，见到了鲸鱼翻腾的瞬间。答应我，如果那时的你正面临抉择，一定要跟随直觉。大胆去飞，时间会给你最好的证明。',
    recipient: '2027年的我',
    stampId: 'stamp-lighthouse',
    sealColor: '#c3a13a',
    isDelivered: false
  }
];

export const STAMP_PRESETS = [
  { id: 'stamp-butterfly', name: '蓝翼梦蝶', icon: '🦋', color: 'from-blue-200 to-indigo-100', desc: '自由、浪漫与蜕变之梦' },
  { id: 'stamp-lighthouse', name: '星夜灯塔', icon: '🗼', color: 'from-amber-200 to-orange-100', desc: '黑夜中坚定的守护与港湾' },
  { id: 'stamp-plane', name: '纸飞机之翼', icon: '✈️', color: 'from-sky-200 to-teal-100', desc: '承载年少希冀的远航' },
  { id: 'stamp-cosmic', name: '宇宙齿轮', icon: '🪐', color: 'from-purple-200 to-pink-100', desc: '星海运转中时间的永恒' },
  { id: 'stamp-hourglass', name: '时光沙漏', icon: '⏳', color: 'from-emerald-200 to-yellow-100', desc: '留住指缝之间流逝的暖意' }
];

export const SEAL_COLORS = [
  { value: '#9e2a2b', name: '珊瑚古红' },
  { value: '#335c67', name: '墨松暗绿' },
  { value: '#c3a13a', name: '流沙雅金' },
  { value: '#5e548e', name: '微光紫罗' },
  { value: '#3a0ca3', name: '迷雾深蓝' }
];

export const COZY_WEATHER_PRESETS = [
  { icon: '☀️', label: '晴朗' },
  { icon: '☁️', label: '多云' },
  { icon: '🌧️', label: '下雨' },
  { icon: '❄️', label: '落雪' },
  { icon: '⚡', label: '雷雨' },
  { icon: '💨', label: '有风' }
];

export const COZY_MOOD_PRESETS = [
  { icon: '😊', label: '欢喜' },
  { icon: '🌙', label: '平静' },
  { icon: '🤔', label: '神游' },
  { icon: '😭', label: '柔弱' },
  { icon: '😴', label: '微醺' },
  { icon: '🤪', label: '奇妙' }
];

export const COZY_FOLDER_PRESETS = ['全部', '默认日记本', '海岛随笔', '灵感捕手', '梦境气泡', '日常碎碎念'];
