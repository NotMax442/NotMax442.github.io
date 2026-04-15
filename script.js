const term = document.getElementById('terminal');

function log(text, type = 'normal') {
    const div = document.createElement('div');
    div.className = type === 'warning' ? 'warning' : 'msg';
    div.innerHTML = `> ${text}`;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
}

async function checkRoom() {
    const token = document.getElementById('token').value;
    const gid = document.getElementById('gistId').value;
    const code = document.getElementById('roomCode').value;
    const fileName = `room_${code}.json`;

    if (!token || !gid || !code) return;

    log(`SCANNING PORTAL: ${code}...`);

    try {
        const res = await fetch(`https://api.github.com/gists/${gid}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        const data = await res.json();

        if (data.files[fileName]) {
            log(`LINK DETECTED: YOU ARE JOINING AN ACTIVE ROOM.`, 'warning');
            
            const content = JSON.parse(data.files[fileName].content);
            const lastUsed = content.timestamp;
            const now = new Date().getTime();
            
            if (now - lastUsed > 7 * 24 * 60 * 60 * 1000) {
                log("NOTICE: ROOM EXPIRED (7+ DAYS INACTIVE). OVERWRITING...", "warning");
            }
        } else {
            log(`STATUS: PORTAL VACANT. INITIALIZING NEW LINK...`);
        }
    } catch (e) {
        log("ERROR: UNABLE TO REACH UPLINK. CHECK TOKEN/GIST_ID.");
    }
}

async function transmit() {
    const token = document.getElementById('token').value;
    const gid = document.getElementById('gistId').value;
    const code = document.getElementById('roomCode').value;
    const msg = document.getElementById('message').value;
    const fileName = `room_${code}.json`;

    if (!msg) return;

    const payload = {
        timestamp: new Date().getTime(),
        text: msg
    };

    log("TRANSMITTING...");

    try {
        const res = await fetch(`https://api.github.com/gists/${gid}`, {
            method: 'PATCH',
            headers: { 'Authorization': `token ${token}` },
            body: JSON.stringify({
                files: {
                    [fileName]: { content: JSON.stringify(payload) }
                }
            })
        });

        if (res.ok) {
            log("TRANSMISSION SUCCESSFUL.");
            document.getElementById('message').value = '';
        }
    } catch (e) {
        log("TRANSMISSION FAILED.");
    }
}
