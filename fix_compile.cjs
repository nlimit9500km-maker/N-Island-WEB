const fs = require('fs');

let dv = fs.readFileSync('src/components/DiaryView.tsx', 'utf8');

dv = dv.replace(/const handleSaveMoment = \(\) => \{[\s\S]*?setWriteModalOpen\(false\);\n  \};\n/g, '');

dv = dv.replace(/const handleSealFutureLetter = \(\) => \{[\s\S]*?\}, 4200\);\n  \};\n/g, '');

dv = dv.replace(/const resetLetterComposer = \(\) => \{[\s\S]*?setLetterModalOpen\(false\);\n  \};\n/g, '');

fs.writeFileSync('src/components/DiaryView.tsx', dv);

// Next fix LittleDiaryView.tsx missing useEffect import
let ldt = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');
if (!ldt.includes('useEffect')) {
  ldt = ldt.replace(
    "import React, { useState, useRef } from 'react';",
    "import React, { useState, useRef, useEffect } from 'react';"
  );
  fs.writeFileSync('src/components/LittleDiaryView.tsx', ldt);
}

