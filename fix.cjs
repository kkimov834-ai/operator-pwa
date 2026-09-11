const fs = require('fs');
let code = fs.readFileSync('src/pages/chats/ChatsPage.jsx', 'utf-8');

// Replace UI imports
code = code.replace(/import \{ Button \} from '@\/components\/ui\/button';/g, '');
code = code.replace(/import \{ ScrollArea \} from '@\/components\/ui\/scroll-area';/g, '');
code = code.replace(/import \{ Input \} from '@\/components\/ui\/input';/g, '');

// Replace UI Components
code = code.replace(/<ScrollArea/g, '<div style={{ overflowY: "auto", flex: 1 }}');
code = code.replace(/<\/ScrollArea>/g, '</div>');

code = code.replace(/<Button/g, '<button');
code = code.replace(/<\/Button>/g, '</button>');

code = code.replace(/<Input/g, '<input');

// Fix imports to not use @/
code = code.replace(/from '@\/services\/chat.service'/g, "from '../../services/chat.service'");
code = code.replace(/from '@\/hooks\/useRole'/g, "from '../../hooks/useRole'");

fs.writeFileSync('src/pages/chats/ChatsPage.jsx', code);
