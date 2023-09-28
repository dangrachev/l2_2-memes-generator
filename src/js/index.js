const inputFile = document.querySelector('#input-file');
const canvas = document.getElementById('canvas-meme');
const canvasWrapper = document.querySelector('.canvas-wrapper');

const imageName = document.querySelector('.image-info__name');
const imageSize = document.querySelector('.image-info__size');
const dropArea = document.querySelector('.drop-area');


document.querySelector('.btn-add-text').addEventListener('click', () => addMemeText());
document.querySelector('.btn-undo').addEventListener('click', () => canvasInstance.undo());
document.querySelector('.btn-redo').addEventListener('click', () => canvasInstance.redo());
const downloadBtn = document.querySelector('.btn-download-meme');



const canvasInstance = new CanvasState();
canvasInstance.setCanvas(canvas);
const ctx = canvas.getContext('2d');


inputFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    console.log(file);

    if (!file) {
        alert('Не выбран файл!');
        return;
    }

    if (!/^image/.test(file.type)) {
        alert('Выбранный файл не является изображением!');
        return;
    }

    downloadBtn.addEventListener('click', () => {
        downloadImg(file.lastModified.toString());
    });

    const reader = new FileReader();
    reader.addEventListener('error', (e) => {
        console.error(`Ошибка при чтении файла: ${file.name}`);
    });

    reader.addEventListener('load', (e) => {
        console.log(e.target.result);

        const img = new Image();
        img.onload = () => {
            // Присваиваем канвасу размеры изображения
            canvas.width = img.width;
            canvas.height = img.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Сохраняем начальное изображение в массив отмены действия
            canvasInstance.pushToUndo(canvas.toDataURL());
        }
        img.src = e.target.result;

        // Показываем информацию об изображении
        imageName.textContent = file.name;
        imageSize.textContent = `${(file.size / 1024).toFixed(1)} Кбайт`;
    });

    reader.readAsDataURL(file);
});


function downloadImg(imgName = 'my_meme') {
    const dataURL = canvasInstance.canvas.toDataURL();
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = imgName + '.jpg';

    document.body.append(a);
    a.click();
    document.body.removeChild(a);
}

function addMemeText() {
    if (!canvasWrapper.querySelector('textarea')) {
        const textField = document.createElement('textarea');
        textField.placeholder = 'Введите текст';
        textField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();

                // Берем ближайший к середине текста пробел и делим текст на две части
                const midPoint = Math.floor(textField.value.length / 2);
                const lastSpaceIndex = textField.value.lastIndexOf(' ', midPoint);
                const topText = textField.value.substring(0, lastSpaceIndex);
                const bottomText = textField.value.substring(lastSpaceIndex);
                console.log(topText, bottomText);

                ctx.font = '44px Impact';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';

                // Отрисовываем верхний текст
                const topTextX = canvas.width / 2;
                const topTextY = 50;
                ctx.fillText(topText, topTextX, topTextY);
                ctx.strokeText(topText, topTextX, topTextY);

                // Отрисовываем нижний текст
                const bottomTextX = canvas.width / 2;
                const bottomTextY = canvas.height - 50;
                ctx.fillText(bottomText, bottomTextX, bottomTextY);
                ctx.strokeText(bottomText, bottomTextX, bottomTextY);

                // Сохраняем действие
                canvasInstance.pushToUndo(canvas.toDataURL());

                canvasWrapper.removeChild(textField);
            }
        });

        canvasWrapper.appendChild(textField);
    }
}