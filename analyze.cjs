const fs = require('fs');
let code = fs.readFileSync('src/pages/chats/ChatsPage.jsx', 'utf-8');
const classRegex = /className="([^"]+)"/g;
let match;
const classCounts = {};
while ((match = classRegex.exec(code)) !== null) {
  const classes = match[1].split(' ');
  for (const c of classes) {
    if (!c) continue;
    classCounts[c] = (classCounts[c] || 0) + 1;
  }
}
const sorted = Object.entries(classCounts).sort((a, b) => b[1] - a[1]).slice(0, 50);
console.log(sorted.map(s => s[0]).join(', '));
