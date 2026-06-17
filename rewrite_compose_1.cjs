const fs = require('fs');

let content = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

// Insert editorRef somewhere near the top of the component
if (!content.includes('const editorRef = useRef<HTMLDivElement>(null);')) {
  // Find where other states are declared
  content = content.replace(
    "const [newTitle, setNewTitle] = useState('');",
    "const editorRef = useRef<HTMLDivElement>(null);\n  const [newTitle, setNewTitle] = useState('');"
  );
}

// Add applyFormat function
if (!content.includes('const applyFormat =')) {
  content = content.replace(
    "const startCompose = () => {",
    `
  useEffect(() => {
    if (editorRef.current && isAddingMoment) {
      if (editorRef.current.innerHTML !== newContent) {
        editorRef.current.innerHTML = newContent;
      }
    }
  }, [isAddingMoment, editingEntryId]);

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setNewContent(editorRef.current.innerHTML);
  };

  const startCompose = () => {`
  );
}

// Check saveEntry
content = content.replace(
  "const saveEntry = () => {\n    if (!newContent.trim() && !newTitle.trim()) return;",
  `const saveEntry = () => {
    const finalHtml = editorRef.current?.innerHTML || newContent;
    if (!finalHtml.trim() && !newTitle.trim()) return;`
);

content = content.replace(
  "content: newContent,",
  "content: finalHtml,"
);
content = content.replace(
  "content: newContent,", // Needs global replace or careful replace for the new entry case
  "content: finalHtml," 
);

// We need to inject the beautiful cards when attachment is added
// Replace handleImageUpload
content = content.replace(
  /const handleImageUpload =[\s\S]*?reader\.readAsDataURL\(file\);\n    }\n  };/,
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        editorRef.current?.focus();
        const htmlToInsert = \`<div contenteditable="false" style="margin:12px 0;user-select:none;">
          <img src="\${base64}" style="max-width:100%;border-radius:12px;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);" />
        </div><div><br/></div>\`;
        document.execCommand('insertHTML', false, htmlToInsert);
        if(editorRef.current) setNewContent(editorRef.current.innerHTML);
      };
      reader.readAsDataURL(file);
    }
  };`
);

// Replace handleFileUpload
content = content.replace(
  /const handleFileUpload =[\s\S]*?}\n  };/,
  `const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / 1024 / 1024).toFixed(2) + ' MB';
      editorRef.current?.focus();
      const htmlToInsert = \`<div contenteditable="false" style="display:inline-flex;align-items:center;padding:10px 14px;background:#fdfbf7;border:1px dashed #c3d0c9;border-radius:12px;margin:8px 0;gap:12px;user-select:none;font-family:sans-serif;">
        <span style="font-size:20px;">📎</span>
        <div style="display:flex;flex-direction:column;line-height:1.2;">
          <span style="font-size:12px;font-weight:bold;color:#1e2621;">\${file.name}</span>
          <span style="font-size:10px;color:#8a9a92;">额外文件大小: \${sizeStr}</span>
        </div>
      </div><div><br/></div>\`;
      document.execCommand('insertHTML', false, htmlToInsert);
      if(editorRef.current) setNewContent(editorRef.current.innerHTML);
    }
  };`
);

// We need to replace addLink
content = content.replace(
  /const addLink = \(\) => {[\s\S]*?setTempLink\(''\);\n  };/,
  `const addLink = () => {
    if (!tempLink) return;
    editorRef.current?.focus();
    let htmlToInsert = '';
    if (tempLink.includes('music.163.com') || tempLink.includes('y.qq.com')) {
      htmlToInsert = \`<div contenteditable="false" style="display:inline-flex;align-items:center;padding:12px;background:#FAFAF9;border-radius:16px;margin:8px 0;gap:12px;border:1px solid #DFE4E1;user-select:none;font-family:sans-serif;">
        <div style="width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg, #FFB6B9, #FAE3D9);display:flex;align-items:center;justify-content:center;font-size:20px;color:white;">🎵</div>
        <div style="display:flex;flex-direction:column;min-width:120px;line-height:1.2;">
          <span style="font-size:13px;font-weight:900;color:#1e2621;">分享的单曲收藏</span>
          <span style="font-size:11px;color:#4E6156;margin-top:2px;">点击播放源连结</span>
        </div>
        <div style="width:28px;height:28px;border-radius:50%;border:1px solid #DFE4E1;display:flex;align-items:center;justify-content:center;font-size:10px;">▶️</div>
      </div><div><br/></div>\`;
    } else {
      htmlToInsert = \`<div contenteditable="false" style="display:flex;flex-direction:column;background:#FAFAF9;border-radius:12px;margin:8px 0;width:240px;overflow:hidden;border:1px solid #DFE4E1;user-select:none;font-family:sans-serif;">
        <div style="width:100%;height:140px;background:#4E6156;display:flex;align-items:center;justify-content:center;color:white/50;font-size:12px;font-weight:bold;">🖼️ 媒体封面图</div>
        <div style="padding:12px;display:flex;flex-direction:column;">
           <span style="font-size:13px;font-weight:bold;color:#1e2621;">\${tempLink.length > 30 ? tempLink.substring(0, 30) + '...' : tempLink}</span>
           <span style="font-size:11px;color:#8a9a92;margin-top:4px;">来自外部媒体平台</span>
        </div>
      </div><div><br/></div>\`;
    }
    document.execCommand('insertHTML', false, htmlToInsert);
    if(editorRef.current) setNewContent(editorRef.current.innerHTML);
    setNewLinks(prev => [...prev, tempLink]);
    setTempLink('');
    setShowLinkInput(false);
  };`
);

fs.writeFileSync('src/components/LittleDiaryView.tsx', content);
console.log('Core functions rewritten.');
