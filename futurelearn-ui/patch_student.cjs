const fs = require('fs');

const path = 'src/StudentSession.jsx';
if (!fs.existsSync(path)) {
    console.error('StudentSession.jsx not found!');
    process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');

// 1. Replace the native alert in sendPrivateMessage
const targetAlert = 'alert("❌ Erreur lors de l\'envoi : " + (error.response?.data?.error || error.message));';
const replacementAlert = 'showToastNotification(error.response?.data?.error || "Erreur de connexion", "error");';

if (content.includes(targetAlert)) {
    content = content.replace(targetAlert, replacementAlert);
    console.log('Replaced alert with toast notification in sendPrivateMessage.');
} else {
    console.warn('Target alert not found!');
}

// 2. Add toast UI rendering at the end of the return statement
const targetJSX = `                    </div>
                </>
            );`;
const replacementJSX = `                    </div>

                    {/* Toast Notification Rendu Réel */}
                    {toast && (
                        <div className={\`toast-notification toast-\${toast.type}\`} style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: 'white',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            animation: 'slideInRight 0.3s ease-out forwards',
                            maxWidth: '400px',
                        }}>
                            <span style={{ fontSize: '20px' }}>
                                {toast.type === 'error' ? '⚠️' : '✅'}
                            </span>
                            <div>
                                <b>{toast.type === 'error' ? 'Erreur' : 'Succès'}</b>
                                <p>{toast.message}</p>
                            </div>
                        </div>
                    )}
                </>
            );`;

// Let's do a more robust find/replace that handles potential indentations
if (content.includes('</>\r\n            );') || content.includes('</>\n            );')) {
    // Normalise newlines for replacement
    content = content.replace(/<\/div>\s*<\/>\s*\);\s*};/g, `</div>
                    
                    {/* Toast Notification Rendu Réel */}
                    {toast && (
                        <div className={\`toast-notification toast-\${toast.type}\`} style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: 'white',
                            padding: '16px 24px',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            animation: 'slideInRight 0.3s ease-out forwards',
                            maxWidth: '400px',
                        }}>
                            <span style={{ fontSize: '20px' }}>
                                {toast.type === 'error' ? '⚠️' : '✅'}
                            </span>
                            <div>
                                <b>{toast.type === 'error' ? 'Erreur' : 'Succès'}</b>
                                <p>{toast.message}</p>
                            </div>
                        </div>
                    )}
                </>
            );
        };`);
    console.log('Replaced JSX end with toast UI rendering.');
} else {
    console.warn('Closing JSX fragment pattern not found!');
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done patching StudentSession.jsx!');
