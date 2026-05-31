const fs = require('fs');
const logFile = 'C:/Users/LENOVO/.gemini/antigravity/brain/0dafad15-1438-4098-bdd3-7d03b70d8ac2/.system_generated/logs/overview.txt';

const data = fs.readFileSync(logFile, 'utf8');
const lines = data.split('\n');

lines.forEach((line) => {
    if (!line.trim()) return;
    try {
        const obj = JSON.parse(line);
        // We look for any step that contains the output of view_file of LiveSessionControl.jsx
        if (obj.output && obj.output.includes('File Path:') && obj.output.includes('LiveSessionControl.jsx')) {
            console.log(`Found output in step ${obj.step_index}! Output length: ${obj.output.length}`);
            fs.writeFileSync(`step_${obj.step_index}_output.txt`, obj.output, 'utf8');
        }
    } catch (e) {
        // Not JSON
    }
});
