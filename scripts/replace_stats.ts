import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

const startStr = `        <AnimatePresence>\n          {showStats ? (`;
const endStr = `          ) : null}\n        </AnimatePresence>`;

const s = code.indexOf(startStr);
const e = code.indexOf(endStr, s);

if (s === -1 || e === -1) {
    console.error("error finding block");
    process.exit(1);
}

const replacement = `        <AnimatePresence>
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
`;

code = code.substring(0, s) + replacement + code.substring(e);
fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
console.log("Success replacing stats");
