const video = document.getElementById("video");
const btn = document.getElementById("captureBtn");
const statusEl = document.getElementById("status");

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
   HIGH QUALITY CAPTURE
========================= */
async function capturePhoto() {
    try {
        statusEl.innerText = "CAPTURING...";

        let blob;

        // 🔥 PRO MODE (if supported)
        if (imageCapture && imageCapture.takePhoto) {
            blob = await imageCapture.takePhoto();
        } else {
            // fallback
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0);

            blob = await new Promise(res =>
                canvas.toBlob(res, "image/jpeg", 0.95)
            );
        }

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