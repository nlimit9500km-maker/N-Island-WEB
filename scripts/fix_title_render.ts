import fs from 'fs';
let code = fs.readFileSync('src/components/LittleDiaryView.tsx', 'utf8');

// Find the line that renders `{entry.title}`
// <h4 className="text-base font-black tracking-tighter mb-1.5 text-[#1e2621] pr-8">\n                      {entry.title}\n                    </h4>
const oldTitleRender = `<h4 className="text-base font-black tracking-tighter mb-1.5 text-[#1e2621] pr-8">
                      {entry.title}
                    </h4>`;
const newTitleRender = `<h4 className="text-base font-black tracking-tighter mb-1.5 text-[#1e2621] pr-8" dangerouslySetInnerHTML={{ __html: entry.title || '无题' }} />`;

if (code.includes(oldTitleRender)) {
    code = code.replace(oldTitleRender, newTitleRender);
    fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
    console.log("Success converting title render");
} else {
    // try softer match
    const altRegex = /<h4 className="text-base font-black tracking-tighter mb-1\.5 text-\[#1e2621\] pr-8">\s*\{entry\.title\}\s*<\/h4>/g;
    code = code.replace(altRegex, newTitleRender);
    fs.writeFileSync('src/components/LittleDiaryView.tsx', code);
    console.log("Success string replace regex");
}
