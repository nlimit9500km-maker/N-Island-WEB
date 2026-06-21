import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

// Use precise replacements.
const wrapperSource = `            {/* Customization Workspace Board with safe bottom padding for small devices/iframes */}
            <div className="flex-1 overflow-auto p-4 md:p-5 flex flex-col lg:flex-row gap-4 md:gap-5 pb-24 lg:pb-12 bg-[#F4F9F6]">`;
const wrapperTarget = `            {/* Customization Workspace Board with safe bottom padding for small devices/iframes */}
            <div className="flex-1 overflow-auto p-4 md:p-5 flex flex-col gap-4 md:gap-5 pb-24 lg:pb-12 bg-[#F4F9F6]">
              <div className="flex flex-col lg:flex-row gap-4 md:gap-5">`;

if (code.includes(wrapperSource)) {
    code = code.replace(wrapperSource, wrapperTarget);
} else {
    console.error("error 1"); process.exit(1);
}

const startExtract = `                  {/* Title and mood/weather banners */}\n                  <div className="flex items-center gap-2.5 flex-wrap z-30">`;
const endExtractStr = `                  </div>\n\n                  <input \n                    type="text" \n                    placeholder="给记忆取个美好的标题..."`;
const sStart = code.indexOf(startExtract);
const sEnd = code.indexOf(endExtractStr);
if (sStart === -1 || sEnd === -1) {
    console.error("error 2"); process.exit(1);
}

const extractedBlock = code.substring(sStart, sEnd + `                  </div>\n\n`.length);
code = code.substring(0, sStart) + `                  {/* Title and mood/weather banners moved */}\n\n` + code.substring(sEnd + `                  </div>\n\n`.length);

const rtPanel = `              {/* Right Side Style Customizer drawer panel with safe bottom spacing */}\n              <div className="w-full lg:w-80 bg-white rounded-[2.5rem] p-5 pb-16 lg:pb-8 border border-[#F2F5F3] shadow-sm flex flex-col gap-5 shrink-0">`;
if (!code.includes(rtPanel)) {
    console.error("error 3"); process.exit(1);
}

const replacementRtPanel = `              {/* Right Side Style Customizer drawer panel with safe bottom spacing */}\n              <div className="w-full lg:w-80 bg-white rounded-[2.5rem] p-5 pb-16 lg:pb-8 border border-[#F2F5F3] shadow-sm flex flex-col gap-5 shrink-0">\n                <h5 className="font-bold text-sm text-[#1e2621] flex items-center gap-1 border-b pb-2 border-gray-100">\n                  日记本属性归约\n                </h5>\n` + extractedBlock.replace(/                  /g, '                ') + `\n                <div className="w-full h-px bg-gray-100 my-1"></div>\n`;

code = code.replace(rtPanel, replacementRtPanel);

const imgGridStart = `                  {/* Instagram-style Bottom Photo Grid Section */}\n                  {newImages.length > 0 && (\n                    <div className="mt-8 pt-6 border-t border-[#2D3832]/10 select-none animate-fade-in">`;
const imgGridEndStr = `                      </div>\n                    </div>\n                  )}`;

const imgS = code.indexOf(imgGridStart);
const imgE = code.indexOf(imgGridEndStr) + imgGridEndStr.length;

if (imgS === -1 || imgE === -1) {
    console.error("error 4"); process.exit(1);
}

const extractedImgGrid = code.substring(imgS, imgE);
code = code.substring(0, imgS) + code.substring(imgE);

const endWrapperPos = code.indexOf(`              </div>\n\n              {/* Right Side Style Customizer drawer panel with safe bottom spacing */}`);
if (endWrapperPos === -1) {
    console.error("error 5"); process.exit(1);
}

const rightPanelEndCode = `                {/* Marker highlights */}`;
const endRightPanelIndex = code.indexOf(`              </div>\n            </div>\n          </motion.div>\n        )}`);

if (endRightPanelIndex === -1) {
    const endRightPanelAlt = code.indexOf(`              </div>\n            </div>\n          </motion.div>`);
    if (endRightPanelAlt === -1) {
        console.error("error 6"); process.exit(1);
    } else {
        const replacementEndWrapper = `              </div>\n            </div>\n` + extractedImgGrid.replace(/                  /g, '              ') + `\n          </motion.div>`;
        code = code.substring(0, endRightPanelAlt) + replacementEndWrapper + code.substring(endRightPanelAlt + `              </div>\n            </div>\n          </motion.div>`.length);
    }
} else {
    // We found `              </div>\n            </div>\n          </motion.div>\n        )}`
    // Wait, since we added the wrapper `<div className="flex flex-col lg:flex-row ...">`, we must also close it.
    
    // Oh we need to close the `<div className="flex flex-col lg:flex-row gap-4 md:gap-5">` after the right panel!
    const closingPointMatch = `              </div>\n            </div>\n          </motion.div>`;
    const idxClose = code.indexOf(closingPointMatch);
    if(idxClose !== -1) {
        // We find the right side panel's ending `</div>` which is `              </div>\n            </div>`
        // Wait, right side panel has an ending `</div>`.
        // Before `            </div>\n          </motion.div>`
        
        let newImgGridHTML = `\n              {/* Instagram-style Bottom Photo Grid Section outside columns */}\n              {newImages.length > 0 && (\n                <div className="w-full rounded-[2.5rem] p-6 pb-8 shadow-md border border-[#2D3832]/10 bg-white select-none animate-fade-in flex flex-col gap-4">\n` + extractedImgGrid.substring(extractedImgGrid.indexOf('                  <div className="flex items-center gap-3 mb-4">')).replace(/                  /g, '                  ') + '\n';
        
        // Wait, the structure right now:
        //             <div className="flex-1 overflow-auto ...">
        //               <div className="flex flex-col lg:flex-row gap-4 md:gap-5">
        //                 {/* Left Side */}
        //                 <div ...> ... </div>
        //                 {/* Right Side */}
        //                 <div ...> ... </div>
        //               </div>
        //               {/* Image Grid */}
        //             </div>
        //           </motion.div>
        
        const theEndMarker = `                </div>\n              </div>\n            </div>\n          </motion.div>`;
        const alternateEndMarker = `              </div>\n            </div>\n          </motion.div>`;
        
        // I will do a regex to find the end of the Right Side Panel.
        // It ends just before `</motion.div>`. 
        // We replace it completely.
    }
}

fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
console.log("Success!");
