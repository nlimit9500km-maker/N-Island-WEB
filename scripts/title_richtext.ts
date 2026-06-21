import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

const titleRefDec = `  const editorRef = useRef<HTMLDivElement>(null);\n  const titleRef = useRef<HTMLDivElement>(null);\n`;
code = code.replace(`  const editorRef = useRef<HTMLDivElement>(null);\n`, titleRefDec);

// Modify applyFormat to check active element:
const oldApplyFormat = `  const applyFormat = (command: string, value?: string) => {
    document.execCommand('styleWithCSS', false, 'true');
    if (command === 'hiliteColor') {
      applyCustomHighlight(value || '', markerHeight);
    } else if (command === 'fontSize' && value) {
      applyCustomFontSize(value);
    } else {
      document.execCommand(command, false, value);
      if (editorRef.current) setNewContent(editorRef.current.innerHTML);
    }
  };`;

const newApplyFormat = `  const applyFormat = (command: string, value?: string) => {
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
  };`;

code = code.replace(oldApplyFormat, newApplyFormat);

// Also applyCustomFontSize and applyCustomHighlight might need adjusting to update titleRef
code = code.replace(
    `if (editorRef.current) setNewContent(editorRef.current.innerHTML);`,
    `if (editorRef.current) setNewContent(editorRef.current.innerHTML);\n    if (titleRef.current) setNewTitle(titleRef.current.innerHTML);`
);

// We need to change the input element
const oldInput = `<input \n                    type="text" \n                    placeholder="给记忆取个美好的标题..."\n                    value={newTitle}\n                    onChange={(e) => setNewTitle(e.target.value)}\n                    dir="auto"\n                    className="bg-transparent text-lg font-black outline-none border-b border-[#2D3832]/10 pb-2 placeholder-[#1e2621]/20"\n                  />`;
const oldInputAlt = `<input 
                    type="text" 
                    placeholder="给记忆取个美好的标题..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    dir="auto"
                    className="bg-transparent text-lg font-black outline-none border-b border-[#2D3832]/10 pb-2 placeholder-[#1e2621]/20"
                  />`;

const newInput = `<div 
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="给记忆取个美好的标题..."
                    onInput={(e) => setNewTitle(e.currentTarget.innerHTML)}
                    onBlur={(e) => setNewTitle(e.currentTarget.innerHTML)}
                    dir="auto"
                    className="bg-transparent text-lg font-black outline-none border-b border-[#2D3832]/10 pb-2 empty:before:content-[attr(data-placeholder)] empty:before:text-[#1e2621]/30 empty:before:cursor-text min-h-[40px] whitespace-pre-wrap break-words"
                  />`;

if (code.includes(`<input \n                    type="text" \n                    placeholder="给记忆取个美好的标题..."`)) {
    code = code.replace(/<input \s*type="text" \s*placeholder="给记忆取个美好的标题\.\.\."\s*value=\{newTitle\}\s*onChange=\{\(e\) => setNewTitle\(e.target.value\)\}\s*dir="auto"\s*className="bg-transparent text-lg font-black outline-none border-b border\[#2D3832\]\/10 pb-2 placeholder\[#1e2621\]\/20"\s*\/>/g, newInput);
} else {
    // If exact regex fails, indexOf
    const iStart = code.indexOf(`                  <input `);
    const iEnd = code.indexOf(`/>`, iStart + 10) + 2;
    code = code.substring(0, iStart) + `                  ` + newInput + code.substring(iEnd);
}

// initialization for titleRef
const setEdits = [
    { s: `setNewTitle('');\n    setNewContent('');`, r: `setNewTitle('');\n    if (titleRef.current) titleRef.current.innerHTML = '';\n    setNewContent('');` },
    { s: `setNewTitle('');\n                      setNewContent('');`, r: `setNewTitle('');\n                      if (titleRef.current) titleRef.current.innerHTML = '';\n                      setNewContent('');` },
    { s: `setNewTitle(entry.title);\n    setNewContent(entry.content);`, r: `setNewTitle(entry.title);\n    if (titleRef.current) titleRef.current.innerHTML = entry.title || '';\n    setNewContent(entry.content);` },
    { s: `setNewTitle(draft.title);\n                              if (editorRef.current) {`, r: `setNewTitle(draft.title);\n                              if (titleRef.current) titleRef.current.innerHTML = draft.title || '';\n                              if (editorRef.current) {` }
];

setEdits.forEach(edit => {
    code = code.replace(edit.s, edit.r);
});

fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
console.log("Success replacing input with rich text title");
