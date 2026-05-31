const fs = require('fs');

const path = 'src/StudentSession.jsx';
let content = fs.readFileSync(path, 'utf8');

const lastIdx = content.lastIndexOf('</>');
if (lastIdx === -1) {
    console.error('Could not find </>');
    process.exit(1);
}

// Find the line that starts with </>; we want to replace from this point onwards.
// Let's get the text before </>, and the text after.
const prefix = content.substring(0, lastIdx);
const suffix = content.substring(lastIdx);

// suffix starts with `</>\r\n            );\r\n        };`
// We want to replace `</>\r\n            );` with our toast and the closing tags
const isCRLF = content.includes('\r\n');
const separator = isCRLF ? '\r\n' : '\n';

// Let's check how the suffix starts
const targetText = `</>${separator}            );`;
const replacementText = `{toast && (
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
                </>${separator}            );`;

if (suffix.startsWith(targetText)) {
    const newSuffix = suffix.replace(targetText, replacementText);
    fs.writeFileSync(path, prefix + newSuffix, 'utf8');
    console.log('Successfully patched StudentSession.jsx with toast component!');
} else {
    // Let's try matching with \n regardless
    const cleanSuffix = suffix.replace(/\r/g, '');
    const cleanTargetText = `</>\n            );`;
    if (cleanSuffix.startsWith(cleanTargetText)) {
        const newCleanSuffix = cleanSuffix.replace(cleanTargetText, replacementText.split(/\r?\n/).join(separator));
        fs.writeFileSync(path, prefix + newCleanSuffix, 'utf8');
        console.log('Successfully patched StudentSession.jsx (normalized line endings) with toast component!');
    } else {
        console.error('Suffix does not start with target text! Suffix start:', JSON.stringify(suffix.substring(0, 30)));
    }
}
