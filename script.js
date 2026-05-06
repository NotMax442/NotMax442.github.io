function run(isEncrypt) {
    const text = document.getElementById('input').value;
    const key = document.getElementById('key').value;
    const output = document.getElementById('output');

    if (!key) return alert("You need a Secret Keyword!");

    let result = "";
    let keyIdx = 0;

    for (let i = 0; i < text.length; i++) {
        let charCode = text.charCodeAt(i);
        
        // Only scramble standard characters (skip emojis/special symbols)
        if (charCode >= 32 && charCode <= 126) {
            const keyShift = key.charCodeAt(keyIdx % key.length);
            const shift = isEncrypt ? keyShift : -keyShift;
            
            // This math keeps the result within readable text characters (32-126)
            let newChar = ((charCode - 32 + shift) % 95);
            if (newChar < 0) newChar += 95;
            
            result += String.fromCharCode(newChar + 32);
            keyIdx++;
        } else {
            result += text[i];
        }
    }
    output.value = result;
}
