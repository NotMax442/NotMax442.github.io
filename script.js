let noClickCount = 0;
let canMove = true;
const moveDuration = 30000; // 30 seconds

const messages = [
    "Are you sure?",
    "Please click yes...",
    "You're hurting my feelings! 🥺",
    "Think about it again...",
    "But we're so cute together!",
    "I'm going to cry...",
    "Last chance!",
    "Okay, fine, click it one more time...",
    "Almost there...",
    "Just a few more...",
    "I won't let you say no!",
    "Still trying?",
    "You're persistent!",
    "Okay, check this out..."
];

function checkLock() {
    const day = document.getElementById('day').value;
    const month = document.getElementById('month').value;

    if (day == "13" && month == "10") {
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('proposal-screen').classList.remove('hidden');
        document.getElementById('proposal-screen').classList.add('fade-in');
        
        // Start the 30-second "No-Move" timer
        setTimeout(() => {
            canMove = false;
            const noBtn = document.getElementById('noBtn');
            noBtn.style.position = 'static'; 
            document.getElementById('guilt-message').innerText = "Fine... you caught it. But are you sure?";
        }, moveDuration);

    } else {
        document.getElementById('lock-error').innerText = "Incorrect date, try again! ❤️";
    }
}

function moveNo() {
    if (canMove) {
        const noBtn = document.getElementById('noBtn');
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
        
        noBtn.style.position = 'fixed';
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
    }
}

function handleNo() {
    noClickCount++;
    const guilt = document.getElementById('guilt-message');
    const noBtn = document.getElementById('noBtn');

    if (noClickCount <= messages.length) {
        guilt.innerText = messages[noClickCount - 1];
    }

    // After 15 clicks, force the 'Yes'
    if (noClickCount >= 15) {
        noBtn.innerText = "Yes";
        noBtn.style.backgroundColor = "#ff4d6d";
        noBtn.style.position = 'static';
        noBtn.onclick = celebrate;
        noBtn.onmouseover = null; 
        guilt.innerText = "I knew it! ❤️";
    }
}

function celebrate() {
    document.getElementById('proposal-screen').classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
}

// Background Heart Animation
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart-particle');
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = Math.random() * 2 + 3 + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
}
setInterval(createHeart, 300);
