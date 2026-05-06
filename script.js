// The core logic: XOR combines the text and key at a binary level
function xorCipher(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode);
    }
    return result;
}

function process(isEncrypt) {
    const input = document.getElementById('input').value;
    const key = document.getElementById('key').value;
    const output = document.getElementById('output');

    if (!input || !key) {
        alert("Please enter a message and a secret key.");
        return;
    }

    try {
        if (isEncrypt) {
            // 1. Scramble 2. Base64 Encode (to make it safe to send)
            const scrambled = xorCipher(input, key);
            output.value = btoa(unescape(encodeURIComponent(scrambled)));
        } else {
            // 1. Base64 Decode 2. Scramble back (XOR again)
            const decodedBase64 = decodeURIComponent(escape(atob(input)));
            output.value = xorCipher(decodedBase64, key);
        }
    } catch (e) {
        alert("Error! Wrong key or the code you pasted is invalid.");
    }
}

function copyText() {
    const output = document.getElementById('output');
    if (!output.value) return;
    
    output.select();
    output.setSelectionRange(0, 99999); // Mobile compatibility
    document.execCommand("copy");
    
    // Visual feedback
    const btn = document.querySelector('.btn-copy');
    const oldText = btn.innerText;
    btn.innerText = "COPIED!";
    setTimeout(() => btn.innerText = oldText, 2000);
}
