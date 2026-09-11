const fs = require('fs');
let code = fs.readFileSync('src/pages/chats/ChatsPage.jsx', 'utf-8');

// 1. Imports
code = code.replace(
    /import SipPhone from '\.\/SipPhone';/,
    "import SipPhone from './SipPhone';\nimport './ChatsPage.css';\nimport { useNavBarContext } from '../../components/NavBarContext';\nimport { ChevronLeft } from 'lucide-react';"
);

// 2. Context
code = code.replace(
    /const ChatsPage = \(\) => \{\n    const \{ isSu \} = useRole\(\);/,
    "const ChatsPage = () => {\n    const { isSu } = useRole();\n    const { themeStyles } = useNavBarContext();\n    const s = themeStyles || {};"
);

// 3. Top-level Container
code = code.replace(
    /<div className="flex flex-col flex-1 gap-4 overflow-hidden h-full w-full">/,
    `<div className="flex flex-col flex-1 gap-4 overflow-hidden h-full w-full" style={{ 
        '--card-bg': s.cardBg || '#1e1b2e',
        '--card-bg-60': s.cardBg ? \`\${s.cardBg}99\` : 'rgba(30, 27, 46, 0.6)',
        '--bg-color': s.navBg || '#161424',
        '--bg-color-50': s.navBg ? \`\${s.navBg}80\` : 'rgba(22, 20, 36, 0.5)',
        '--text-color': s.text || '#ffffff',
        '--border-color': s.border || '#2d2b3b',
        '--primary-color': '#7c3aed',
        '--text-muted': '#9ca3af',
        '--bg-muted': 'rgba(255,255,255,0.05)',
    }}>`
);

// 4. Mobile Layout Wrapping
// Replace the main flex row container
code = code.replace(
    /<div className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden h-full w-full">/,
    '<div className="mobile-chat-container">'
);

// Wrap Left Column
code = code.replace(
    /\{\/\* Левая часть: список чатов и телефон \*\/\}\n            <div className="flex flex-col w-full md:w-\[320px\] lg:w-\[380px\] gap-4 shrink-0 overflow-hidden h-full">/,
    '{/* Левая часть: список чатов и телефон */}\n            {!selectedChat && (\n            <div className="flex flex-col w-full gap-4 shrink-0 overflow-hidden h-full">'
);

// Close Left Column (before right column starts)
code = code.replace(
    /\{\/\* Правая часть: открытый чат \*\/\}/,
    '            )}\n\n            {/* Правая часть: открытый чат */}'
);

// Wrap Right Column
code = code.replace(
    /<div className="flex-1 flex flex-col bg-card\/60 backdrop-blur-md border border-border\/80 rounded-2xl shadow-xl overflow-hidden relative">/,
    '{selectedChat && (\n            <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl overflow-hidden relative">'
);

// Add Back Button
code = code.replace(
    /\{\/\* Шапка чата \*\/\}\n                        <div className="p-4 border-b border-border\/50 flex justify-between items-center bg-muted\/20">\n                            <div className="flex items-center gap-3">/,
    `{/* Шапка чата */}\n                        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">\n                            <div className="flex items-center gap-3">\n                                <button onClick={() => setSelectedChat(null)} className="h-8 w-8 flex items-center justify-center shrink-0">\n                                    <ChevronLeft size={24} />\n                                </button>`
);

// Close Right Column
code = code.replace(
    /<\/div>\n                \)\s*:\s*\([\s\S]*?Dəstək Çatı Paneli[\s\S]*?SIP telefondan zəng etmək üçün istifadə edin\.[\s\S]*?<\/div>\n                \)\}/,
    `</div>\n                )}`
);

// It might leave an extra </div> or miss one due to the ternary replacement. Let's handle the end of the Right Column properly.
// The original code has:
//                 ) : (
//                     <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
//                         <MessageSquare size={48} className="stroke-[1.5] mb-4 text-muted-foreground/50" />
//                         <h3 className="font-bold text-lg text-foreground mb-1">Dəstək Çatı Paneli</h3>
//                         ...
//                     </div>
//                 )}
//             </div>
//         </div>
// We can just replace the whole ternary else part since selectedChat is now a simple if condition.

code = code.replace(
    /<\/div>\n                \) : \(\n                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">[\s\S]*?<\/div>\n                \)\}\n            <\/div>/,
    `</div>\n            )}`
);

// Replace button imports if missed (already handled by fix.cjs, but just in case)
fs.writeFileSync('src/pages/chats/ChatsPage.jsx', code);
