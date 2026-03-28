// 摄像头相关功能
let stream = null;

// 启动摄像头
function startCamera() {
    const video = document.getElementById('video');

    // 检查浏览器兼容性
    if (!navigator.mediaDevices) {
        // 旧版浏览器兼容
        if (navigator.getUserMedia) {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia({ video: true }, function(s) {
                    stream = s;
                    video.srcObject = stream;
                    video.play();
                }, function(error) {
                    console.error('Error accessing camera:', error);
                    handleCameraError(error);
                });
            } else {
                alert('您的浏览器不支持摄像头功能');
            }
        } else {
            alert('您的浏览器不支持摄像头功能');
        }
        return;
    }

    // 现代浏览器
    const constraints = {
        video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(s) {
            stream = s;
            video.srcObject = stream;
            video.play();
        })
        .catch(function(error) {
            console.error('Error accessing camera:', error);
            handleCameraError(error);
        });
}

// 处理摄像头错误
function handleCameraError(error) {
    switch(error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
            alert('摄像头权限被拒绝，请在浏览器设置中允许访问摄像头');
            break;
        case 'NotFoundError':
            alert('未找到摄像头设备');
            break;
        case 'NotReadableError':
            alert('摄像头被其他应用占用');
            break;
        case 'OverconstrainedError':
            alert('摄像头参数设置错误');
            break;
        default:
            alert('无法访问摄像头：' + error.message);
    }
}

// 停止摄像头
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

// 拍摄照片
function capturePhoto() {
    const video = document.getElementById('video');
    
    // 检查视频是否已加载
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        alert('摄像头尚未准备就绪，请稍候');
        return;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 转换为base64格式
    try {
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        processImage(imageData);
    } catch (error) {
        console.error('Error capturing photo:', error);
        alert('拍摄失败，请重试');
    }
}

// 绑定拍摄按钮事件
document.addEventListener('DOMContentLoaded', function() {
    const captureBtn = document.getElementById('capture-photo');
    if (captureBtn) {
        captureBtn.addEventListener('click', capturePhoto);
    }
});