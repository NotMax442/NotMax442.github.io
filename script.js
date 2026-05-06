// 1. Derives a secure key from your password using PBKDF2
async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false, ["encrypt", "decrypt"]
    );
}

// 2. Encryption Handler
async function handleEncrypt() {
    const text = document.getElementById('message').value;
    const password = document.getElementById('password').value;
    if (!text || !password) return alert("Need text and password!");

    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Random IV for GCM
    const key = await deriveKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, key, encoder.encode(text)
    );

    // Package Salt + IV + Encrypted Data into a single Base64 string
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    document.getElementById('output').value = btoa(String.fromCharCode(...combined));
}

// 3. Decryption Handler
async function handleDecrypt() {
    try {
        const password = document.getElementById('password').value;
        const encryptedData = document.getElementById('message').value;
        if (!encryptedData || !password) return alert("Need code and password!");

        const combined = new Uint8Array(atob(encryptedData).split("").map(c => c.charCodeAt(0)));
        
        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const data = combined.slice(28);

        const key = await deriveKey(password, salt);
        const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

        document.getElementById('output').value = new TextDecoder().decode(decrypted);
    } catch (e) {
        alert("Error: Likely a wrong password or corrupted code.");
    }
}

// 4. Utility: Copy to Clipboard
function copyResult() {
    const output = document.getElementById('output');
    output.select();
    document.execCommand("copy");
    alert("Copied to clipboard!");
}
