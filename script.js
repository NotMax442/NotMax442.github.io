let noClickCount = 0;
const messages = [
    "Are you sure?",
    "Please click yes...",
    "You're hurting my feelings! 🥺",
    "Think about it again...",
    "But we're so cute together!",
    "Okay, now you're just being mean!",
    "I'm going to cry...",
    "Last chance!"
];

function checkLock() {
    const day = document.getElementById('day').value;
    const month = document.getElementById('month').value;

    if (day == "13" && month == "10") {
        document.getElementById('lock-screen').classList.add('hidden');
        document.getElementById('proposal-screen').classList.remove('hidden');
    } else {
        document.getElementById('lock-error').innerText = "Wrong date! Try again ❤️";
    }
}

function moveNo() {
    // Only moves for the first 5 times
    if (noClickCount < 5) {
        const noBtn = document.getElementById('noBtn');
        const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
        const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
        
        noBtn.style.position = 'absolute';
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
    }
}

function handleNo() {
    noClickCount++;
    const guilt = document.getElementById('guilt-message');
    const noBtn = document.getElementById('noBtn');

    // Show different messages based on click count
    if (noClickCount <= messages.length) {
        guilt.innerText = messages[noClickCount - 1];
    }

    // After 15 clicks, the No button turns into a Yes button
    if (noClickCount >= 15) {
        noBtn.innerText = "Yes";
        noBtn.style.backgroundColor = "#ff4d6d";
        noBtn.onclick = celebrate;
        noBtn.onmouseover = null; // Stop it from moving
    }
}

function celebrate() {
    document.getElementById('proposal-screen').classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');
}
