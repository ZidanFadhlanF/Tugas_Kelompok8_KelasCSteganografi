document.addEventListener("DOMContentLoaded", function() {
    const menuIcon = document.getElementById('menuIcon');
    const menu = document.getElementById('menu');

    menuIcon.addEventListener('click', function() {
        menu.classList.toggle('hidden');
    });
});



function encode() {
    const imageInput = document.getElementById('imageInput');
    const textInput = document.getElementById('textInput');
    const output = document.getElementById('output');
    output.style.opacity = 1;
    const imageFile = imageInput.files[0];
    const text = textInput.value;

    if (!imageFile) {
        output.innerText = 'Please select an image.';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const textBinary = textToBinary(text);

            if (textBinary.length > imageData.data.length / 8) {
                output.innerText = 'Text is too long to hide in this image.';
                return;
            }

            for (let i = 0; i < textBinary.length; i++) {
                const pixelIndex = i * 8;
                const binary = textBinary.substr(i * 8, 8);
                for (let j = 0; j < 8; j++) {
                    imageData.data[pixelIndex + j] &= 0xFE; // Clear the least significant bit
                    imageData.data[pixelIndex + j] |= parseInt(binary[j], 2); // Set the least significant bit
                }
            }

            ctx.putImageData(imageData, 0, 0);

            const encodedImage = canvas.toDataURL('image/png');
            output.innerHTML = `<img src="${encodedImage}" alt="Encoded Image">`;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
}

function decode() {
    const imageInput = document.getElementById('imageInput');
    const output = document.getElementById('output');
    output.style.opacity = 1;
    const imageFile = imageInput.files[0];

    if (!imageFile) {
        output.innerText = 'Please select an image.';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let binary = '';

            for (let i = 0; i < imageData.data.length; i += 8) {
                let byte = '';
                for (let j = 0; j < 8; j++) {
                    byte += (imageData.data[i + j] & 1);
                }
                binary += byte;
            }
            const encodedText = binaryToText(binary);
            const encodedTextLength = encodedText.indexOf('\0');
            const finalDecodedText = encodedText.substring(0, encodedTextLength);

            output.innerText = 'Decoded Text: ' + finalDecodedText;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
} 


function textToBinary(text) {
    return text.split('').map(function(char) {
        const binary = char.charCodeAt(0).toString(2);
        return '0'.repeat(8 - binary.length) + binary;
    }).join('');
}

function binaryToText(binary) {
    return binary.match(/.{1,8}/g).map(function(byte) {
        return String.fromCharCode(parseInt(byte, 2));
    }).join('');
}
