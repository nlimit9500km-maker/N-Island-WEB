const fs = require('fs');

let ldt = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

ldt = ldt.replace(
  "import React, { useState, useRef } from 'react';",
  "import React, { useState, useRef, useEffect } from 'react';"
);

fs.writeFileSync('src/components/LittleDiaryView.tsx', ldt);
