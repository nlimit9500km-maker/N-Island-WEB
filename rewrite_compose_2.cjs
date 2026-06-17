const fs = require('fs');

let content = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

// Replace standard <textarea> with <div contentEditable ...
content = content.replace(
  /<textarea \n[\s\S]*?className="w-full flex-1 bg-transparent resize-none outline-none leading-loose font-serif placeholder-\[#1e2621\]\/20 py-2 transition-all"\n[\s\S]*?\/>/,
  `<div 
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="有什么微小的事发生吗？或是某个让你心动的落日... 在这里写下来..."
                    style={{ 
                      color: selectedInkColor
                    }}
                    dir="auto"
                    className="w-full flex-1 bg-transparent resize-none outline-none leading-loose font-serif py-2 transition-all min-h-[50vh] empty:before:content-[attr(data-placeholder)] empty:before:text-[#1e2621]/20 empty:before:pointer-events-none empty:before:opacity-60"
                  />`
);

// We should remove the old newImages display
content = content.replace(
  /\{\/\* Dynamic media list blocks \*\/\}[\s\S]*?\{\/\* Position label indicator \*\/\}/,
  `{/* Media blocks are injected directly into the editor now */}
                  {/* Position label indicator */}`
);

// We should remove the Position label indicator as it will be inside as well
content = content.replace(
  /\{\/\* Position label indicator \*\/\}[\s\S]*?<\/\div>\n                  \)/,
  ``
);

// For Mood and Weather dropdowns
content = content.replace(
  /<select \n                      value=\{newMood\}[\s\S]*?<\/select>/,
  `<input 
                      list="moods"
                      value={newMood}
                      onChange={(e) => setNewMood(e.target.value)}
                      placeholder="心情"
                      className="bg-white/80 border border-[#2D3832]/10 text-xs px-2 py-1.5 rounded-xl font-bold font-sans outline-none focus:border-[#4E6156] shadow-3xs cursor-text w-[6.5rem] text-[#2D3832]"
                    />
                    <datalist id="moods">
                      {COZY_MOOD_PRESETS.map(p => (
                        <option key={p.icon} value={p.icon}>{p.icon} {p.label}</option>
                      ))}
                    </datalist>`
);

content = content.replace(
  /<select \n                      value=\{newWeather\}[\s\S]*?<\/select>/,
  `<input 
                      list="weathers"
                      value={newWeather}
                      onChange={(e) => setNewWeather(e.target.value)}
                      placeholder="天气"
                      className="bg-white/80 border border-[#2D3832]/10 text-xs px-2 py-1.5 rounded-xl font-bold font-sans outline-none focus:border-[#4E6156] shadow-3xs cursor-text w-[6.5rem] text-[#2D3832]"
                    />
                    <datalist id="weathers">
                      {COZY_WEATHER_PRESETS.map(p => (
                        <option key={p.icon} value={p.icon}>{p.icon} {p.label}</option>
                      ))}
                    </datalist>`
);

content = content.replace(
  /<select \n                      value=\{newFolder\}[\s\S]*?<\/select>/,
  `<input 
                      list="folders"
                      value={newFolder}
                      onChange={(e) => setNewFolder(e.target.value)}
                      placeholder="归档"
                      className="bg-white/80 border border-[#2D3832]/10 text-xs px-2 py-1.5 rounded-xl font-bold font-sans outline-none focus:border-[#4E6156] shadow-3xs cursor-text w-[6.5rem] text-[#2D3832]"
                    />
                    <datalist id="folders">
                      {folders.filter(f => f !== '全部').map(folderName => (
                        <option key={folderName} value={folderName}>📁 {folderName}</option>
                      ))}
                    </datalist>`
);

// Formatting buttons applying formats to selection:
content = content.replace(
  /<button \n                      onClick=\{\(\) => setIsBold\(!isBold\)\}[\s\S]*?<\/button>/,
  `<button 
                      onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                      className="p-2 rounded-xl text-xs font-black w-10 border transition-colors bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100"
                    >
                      B
                    </button>`
);

content = content.replace(
  /<button \n                      onClick=\{\(\) => setIsUnderline\(!isUnderline\)\}[\s\S]*?<\/button>/,
  `<button 
                      onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                      className="p-2 rounded-xl text-xs font-black underline w-10 border transition-colors bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100"
                    >
                      U
                    </button>`
);

content = content.replace(
  /<select\n                      value=\{selectedFontSize\}[\s\S]*?onChange=\{\(e\) => setSelectedFontSize\(e.target.value\)\}[\s\S]*?<\/select>/,
  `<select
                      value="size"
                      onChange={(e) => applyFormat('fontSize', e.target.value)}
                      className="bg-gray-50 border border-gray-100 font-bold font-mono text-xs p-2 rounded-xl text-gray-700 outline-none flex-1 cursor-pointer focus:border-[#4E6156]"
                    >
                      <option value="size" disabled>字号</option>
                      {['1', '2', '3', '4', '5', '6'].map(sz => (
                        <option value={sz} key={sz}>标准字号 {sz}</option>
                      ))}
                    </select>`
);

// Color palette
content = content.replace(
  /<div className="flex gap-2">/,
  `<div className="flex flex-wrap gap-2 items-center">
                    <input 
                      type="color"
                      onChange={(e) => { 
                        setSelectedInkColor(e.target.value); 
                        applyFormat('foreColor', e.target.value);
                      }}
                      className="w-5.5 h-5.5 rounded-full border border-gray-200 cursor-pointer shadow-3xs p-0 min-w-[22px]"
                      title="自定义颜色"
                    />`
);
content = content.replace(
  /onClick=\{\(\) => setSelectedInkColor\(color\.value\)\}/g,
  `onMouseDown={(e) => { e.preventDefault(); setSelectedInkColor(color.value); applyFormat('foreColor', color.value); }}`
);

// Highlight marker
content = content.replace(
  /onClick=\{\(\) => setSelectedHighlight\(marker\.value\)\}/g,
  `onMouseDown={(e) => { e.preventDefault(); applyFormat('hiliteColor', marker.value); }}`
);

// Add location button update
content = content.replace(
  /setNewLocation\(\`中国 · 理想小岛 · \$\{pick\}\`\);\n                      \}, 400\);/g,
  `editorRef.current?.focus();
                        const htmlToInsert = \`<div contenteditable="false" style="display:inline-flex;align-items:center;padding:6px 12px;background:#e9f0ec;color:#2d3832;border-radius:16px;font-size:11px;font-weight:bold;margin:8px 0;user-select:none;font-family:sans-serif;box-shadow: 0 2px 4px -1px rgba(0,0,0,0.05);"><span style="margin-right:4px;">📍</span> 中国 · 理想小岛 · \${pick}</div><div><br/></div>\`;
                        document.execCommand('insertHTML', false, htmlToInsert);
                        if(editorRef.current) setNewContent(editorRef.current.innerHTML);
                      }, 400);`
);

fs.writeFileSync('src/components/LittleDiaryView.tsx', content);
console.log('UI elements rewritten.');
