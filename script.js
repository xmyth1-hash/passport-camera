const video = document.getElementById("video");
const btn = document.getElementById("captureBtn");
const statusEl = document.getElementById("status");
const passportFrame = document.querySelector(".passport-frame");

let imageCapture = null;

/* =========================
   CAMERA START
========================= */
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 4096 },
                height: { ideal: 2160 }
            },
            audio: false
        });

        video.srcObject = stream;

        const track = stream.getVideoTracks()[0];

        if ("ImageCapture" in window) {
            imageCapture = new ImageCapture(track);
        }

        video.addEventListener("loadedmetadata", async () => {
            await video.play();
            statusEl.innerText = "READY ✔";
        });

    } catch (err) {
        console.error(err);
        statusEl.innerText = "CAMERA ERROR";
    }
}

/* =========================
   FRAME CROP CAPTURE
========================= */
function getFrameCropRect() {
    const videoRect = video.getBoundingClientRect();
    const frameRect = passportFrame.getBoundingClientRect();

    const sourceRatio = video.videoWidth / video.videoHeight;
    const viewRatio = videoRect.width / videoRect.height;

    let renderedWidth;
    let renderedHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (viewRatio > sourceRatio) {
        renderedWidth = videoRect.width;
        renderedHeight = videoRect.width / sourceRatio;
        offsetY = (videoRect.height - renderedHeight) / 2;
    } else {
        renderedHeight = videoRect.height;
        renderedWidth = videoRect.height * sourceRatio;
        offsetX = (videoRect.width - renderedWidth) / 2;
    }

    const scaleX = video.videoWidth / renderedWidth;
    const scaleY = video.videoHeight / renderedHeight;

    const left = (frameRect.left - videoRect.left - offsetX) * scaleX;
    const top = (frameRect.top - videoRect.top - offsetY) * scaleY;
    const right = (frameRect.right - videoRect.left - offsetX) * scaleX;
    const bottom = (frameRect.bottom - videoRect.top - offsetY) * scaleY;

    const sx = Math.max(0, Math.round(left));
    const sy = Math.max(0, Math.round(top));
    const ex = Math.min(video.videoWidth, Math.round(right));
    const ey = Math.min(video.videoHeight, Math.round(bottom));

    return {
        sx,
        sy,
        sw: Math.max(1, ex - sx),
        sh: Math.max(1, ey - sy)
    };
}

async function capturePhoto() {
    try {
        statusEl.innerText = "CAPTURING...";

        if (!video.videoWidth || !video.videoHeight) {
            throw new Error("Video is not ready");
        }

        const crop = getFrameCropRect();
        const canvas = document.createElement("canvas");
        canvas.width = crop.sw;
        canvas.height = crop.sh;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(
            video,
            crop.sx, crop.sy, crop.sw, crop.sh,
            0, 0, crop.sw, crop.sh
        );

        const blob = await new Promise(res =>
            canvas.toBlob(res, "image/jpeg", 0.95)
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "passport_" + Date.now() + ".jpg";

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        statusEl.innerText = "SAVED ✔";

    } catch (err) {
        console.error(err);
        statusEl.innerText = "ERROR";
    }
}

/* =========================
   EVENTS
========================= */
btn.addEventListener("click", capturePhoto);

/* =========================
   INIT
========================= */
startCamera();