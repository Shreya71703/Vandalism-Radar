let totalEdits = 0;
let anonEdits = 0;
let suspiciousEdits = 0;

const totalEl = document.getElementById('total-edits');
const anonEl = document.getElementById('anon-edits');
const suspiciousEl = document.getElementById('suspicious-edits');
const feedEl = document.getElementById('radar-feed');
const terminalEl = document.getElementById('terminal-feed');

// Web Audio API for beeps
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBeep(isHighAlert) {
    if (audioCtx.state === 'suspended') return; // Browser autoplay policy
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = isHighAlert ? 'square' : 'sine';
    oscillator.frequency.setValueAtTime(isHighAlert ? 800 : 400, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// Ensure audio context starts on first interaction
document.body.addEventListener('click', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });


// Connect to Wikipedia EventStreams (Server-Sent Events)
const eventSource = new EventSource('https://stream.wikimedia.org/v2/stream/recentchange');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    
    // We only care about actual edits to articles (namespace 0) on wikipedias
    if (data.type !== 'edit' || data.namespace !== 0 || !data.server_name.includes('wikipedia.org')) return;

    totalEdits++;
    // Throttle DOM updates for performance
    if (totalEdits % 3 === 0) totalEl.textContent = totalEdits.toLocaleString(); 

    // Raw Terminal Output
    const logDiv = document.createElement('div');
    logDiv.className = 'terminal-log';
    logDiv.textContent = `[${new Date().toISOString()}] RECV: ${data.user} @ ${data.title}`;
    terminalEl.prepend(logDiv);
    if (terminalEl.children.length > 30) terminalEl.removeChild(terminalEl.lastChild);

    // EventStreams explicitly flags IPs
    const isActuallyAnon = data.anon === true; 
    
    if (isActuallyAnon) {
        anonEdits++;
        if (anonEdits % 2 === 0) anonEl.textContent = anonEdits.toLocaleString();
    }

    // Filter Logic: What makes an edit suspicious?
    let flags = [];
    let isSuspicious = false;

    if (isActuallyAnon) {
        flags.push({ class: 'anon', text: 'ANON_IP' });
    }

    // Check for massive deletions
    let lengthDiff = 0;
    if (data.length && data.length.new !== undefined && data.length.old !== undefined) {
        lengthDiff = data.length.new - data.length.old;
        if (lengthDiff < -500) {
            flags.push({ class: 'large-delete', text: `DEL_${Math.abs(lengthDiff)}` });
            isSuspicious = true; // Massive deletions are highly suspicious
        }
    }

    // Flag all anonymous edits to make the radar highly active
    if (isActuallyAnon) {
        isSuspicious = true;
    }

    if (isSuspicious) {
        suspiciousEdits++;
        suspiciousEl.textContent = suspiciousEdits.toLocaleString();
        
        // Play beep (High alert if large deletion)
        playBeep(lengthDiff < -500);

        renderSuspiciousEdit(data, flags);
    }
};

function renderSuspiciousEdit(data, flags) {
    // Remove waiting message if it exists
    const waiting = document.querySelector('.waiting-message');
    if (waiting) waiting.remove();

    const row = document.createElement('div');
    row.className = 'edit-row';

    const timeStr = new Date(data.timestamp * 1000).toLocaleTimeString();
    const userClass = data.anon ? 'anon-user' : 'user';
    const serverPrefix = data.server_name.replace('.org', '');

    let flagsHtml = flags.map(f => `<span class="flag ${f.class}">${f.text}</span>`).join('');

    // Link to the exact diff to revert it
    const diffUrl = `https://${data.server_name}/w/index.php?diff=${data.revision.new}&oldid=${data.revision.old}`;

    row.innerHTML = `
        <div class="time">${timeStr}</div>
        <div class="${userClass}">${data.user}</div>
        <div class="article"><a href="${data.meta.uri}" target="_blank">${data.title}</a> <span style="color:#666; font-size:0.8rem">(${serverPrefix})</span></div>
        <div class="flags">${flagsHtml}</div>
        <a href="${diffUrl}" target="_blank" class="action-btn">DIFF</a>
    `;

    feedEl.prepend(row);

    // Keep memory clean (max 50 items on screen)
    if (feedEl.children.length > 50) {
        feedEl.removeChild(feedEl.lastChild);
    }
}
