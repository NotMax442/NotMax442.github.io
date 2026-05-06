function run(isEncrypt) {
    const text = document.getElementById('input').value;
    const key = document.getElementById('key').value;
    const output = document.getElementById('output');

    if (!text || !key) {
        alert("Please enter both a message and a secret key.");
        return;
    }

    let processedText = "";
    if (isEncrypt) {
        // Step 1: Encrypt
        for (let i = 0; i < text.length; i++) {
            let charCode = text.charCodeAt(i);
            let keyShift = key.charCodeAt(i % key.length);
            processedText += String.fromCharCode(charCode + keyShift);
        }
        // Step 2: Encode to Base64 (to make it safe for sending)
        output.value = btoa(unescape(encodeURIComponent(processedText)));
    } else {
        try {
            // Step 1: Decode from Base64
            let decoded = decodeURIComponent(escape(atob(text)));
            // Step 2: Decrypt
            for (let i = 0; i < decoded.length; i++) {
                let charCode = decoded.charCodeAt(i);
                let keyShift = key.charCodeAt(i % key.length);
                processedText += String.fromCharCode(charCode - keyShift);
            }
            output.value = processedText;
        } catch (e) {
            alert("Invalid code or key. Try again!");
        }
    }
}

function copyToClipboard() {
    const output = document.getElementById('output');
    output.select();
    output.setSelectionRange(0, 99999); // For mobile
    document.execCommand("copy");
    alert("Copied!");
}
