import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

const restorePromptBlock = `
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
        </AnimatePresence>`;

// Insert the overlay right after `showCancelPrompt` AnimatePresence.
const cancelPos = code.indexOf(`{/* Cancel Prompt Overlay */}`);
if (cancelPos !== -1) {
    code = code.substring(0, cancelPos) + restorePromptBlock + "\n\n        " + code.substring(cancelPos);
} else {
    // If we can't find it, append to the end right before the last closing tags
    const endPos = code.lastIndexOf(`</AnimatePresence>`);
    code = code.substring(0, endPos + `</AnimatePresence>`.length) + "\n" + restorePromptBlock + "\n" + code.substring(endPos + `</AnimatePresence>`.length);
}

// Intercept `isAddingMoment` changes to trigger `showRestorePrompt`
const useEffectBlock = `
  useEffect(() => {
    if (isAddingMoment && !editingEntryId && drafts.length > 0) {
      setShowRestorePrompt(true);
    }
  }, [isAddingMoment, editingEntryId]); // eslint-disable-line react-hooks/exhaustive-deps
`;

// Find where to insert useEffect
const initPos = code.indexOf(`const [editingEntryId, setEditingEntryId] = useState<string | null>(null);`);
if (initPos !== -1) {
    const afterInit = code.indexOf(`\n`, initPos);
    code = code.substring(0, afterInit) + "\n" + useEffectBlock + code.substring(afterInit);
} else {
    console.error("error finding initPos");
}

fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
console.log("Success add restore prompt");
