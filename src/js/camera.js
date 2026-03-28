// 摄像头模块
export function initCamera() {
    const cameraBtn = document.getElementById('camera-btn');
    const cameraPreview = document.getElementById('camera-preview');
    const video = document.getElementById('video');
    const capturePhoto = document.getElementById('capture-photo');
    const cancelCamera = document.getElementById('cancel-camera');

    if (!cameraBtn || !cameraPreview || !video || !capturePhoto || !cancelCamera) {
        console.error('摄像头相关元素未找到');
        return;
    }

    cameraBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            cameraPreview.classList.remove('hidden');
        } catch (error) {
            console.error('无法访问摄像头:', error);
            alert('无法访问摄像头，请检查权限设置');
        }
    });

    cancelCamera.addEventListener('click', () => {
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
        cameraPreview.classList.add('hidden');
    });

    capturePhoto.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg');
        
        const stream = video.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        video.srcObject = null;
        cameraPreview.classList.add('hidden');
        
        if (window.processImage) {
            window.processImage(imageData);
        } else {
            console.error('processImage函数未定义');
        }
    });
}

export function initUpload() {
    const uploadBtn = document.getElementById('upload-btn');
    const uploadPreview = document.getElementById('upload-preview');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const processUpload = document.getElementById('process-upload');
    const cancelUpload = document.getElementById('cancel-upload');

    if (!uploadBtn || !uploadPreview || !imageUpload || !imagePreview || !processUpload || !cancelUpload) {
        console.error('上传相关元素未找到');
        return;
    }

    uploadBtn.addEventListener('click', () => {
        uploadPreview.classList.remove('hidden');
    });

    cancelUpload.addEventListener('click', () => {
        uploadPreview.classList.add('hidden');
        imageUpload.value = '';
        imagePreview.innerHTML = '';
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                img.style.maxHeight = '300px';
                imagePreview.innerHTML = '';
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    processUpload.addEventListener('click', () => {
        const file = imageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageData = event.target.result;
                uploadPreview.classList.add('hidden');
                imageUpload.value = '';
                imagePreview.innerHTML = '';
                
                if (window.processImage) {
                    window.processImage(imageData);
                } else {
                    console.error('processImage函数未定义');
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('请先选择图片');
        }
    });
}
