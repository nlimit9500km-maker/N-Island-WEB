import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

const cancelHandlerBlock = `
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
      date: \`\${now.getFullYear()}-\${String(now.getMonth() + 1).padStart(2, '0')}-\${String(now.getDate()).padStart(2, '0')}\`,
      time: \`\${String(now.getHours()).padStart(2, '0')}:\${String(now.getMinutes()).padStart(2, '0')}\`,
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
`;

const insertPos1 = code.indexOf(`  const saveEntry = () => {`);
if (insertPos1 !== -1) {
    code = code.substring(0, insertPos1) + cancelHandlerBlock + "\n" + code.substring(insertPos1);
} else {
    console.error("error 1");
    process.exit(1);
}

// Replace the Cancel button onClick
code = code.replace(
    `onClick={() => setIsAddingMoment(false)}\n                className="text-[#2D3832] hover:text-[#1e2621] p-1.5 hover:bg-[#F2F5F3] rounded-full transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"\n              >\n                <X className="w-4.5 h-4.5" /> 取消`,
    `onClick={handleCancelDraft}\n                className="text-[#2D3832] hover:text-[#1e2621] p-1.5 hover:bg-[#F2F5F3] rounded-full transition-colors font-bold text-sm flex items-center gap-1 cursor-pointer"\n              >\n                <X className="w-4.5 h-4.5" /> 取消`
);

// Add the confirmation overlay prompt
const overlayStr = `
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
        </AnimatePresence>`;

// Insert the overlay right after `</AnimatePresence>` of the directory folder creator modal.
const modalInsertPos = code.lastIndexOf(`</AnimatePresence>`);
if (modalInsertPos !== -1) {
    code = code.substring(0, modalInsertPos + `</AnimatePresence>`.length) + overlayStr + "\n" + code.substring(modalInsertPos + `</AnimatePresence>`.length);
} else {
    console.error("error 2");
    process.exit(1);
}

fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
console.log("Success adding cancel handler and drafts save");
