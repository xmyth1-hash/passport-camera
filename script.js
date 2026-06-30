const video = document.getElementById("video");
const btn = document.getElementById("captureBtn");
const statusEl = document.getElementById("status");

/* =========================
   START CAMERA (HIGH QUALITY)
========================= */
async function startCamera() {
    try {
        statusEl.innerText = "REQUESTING CAMERA...";

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" },

                // 🔥 MAX QUALITY REQUEST
                width: { ideal: 3840 },
                height: { ideal: 2160 }
            },
            audio: false
        });

        video.srcObject = stream;

        video.addEventListener("loadedmetadata", () => {
            video.play()
                .then(() => {
                    statusEl.innerText = "READY ✔";
                    console.log("Camera resolution:", video.videoWidth, video.videoHeight);
                })
                .catch(err => {
                    console.error("PLAY ERROR:", err);
                    statusEl.innerText = "PLAY ERROR";
                });
        });

    } catch (err) {
        console.error("CAMERA ERROR:", err);
        statusEl.innerText = "CAMERA ERROR";
    }
}

/* =========================
   HIGH QUALITY CAPTURE
========================= */
function capturePhoto() {

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (!vw || !vh) {
        statusEl.innerText = "NO VIDEO DATA";
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = vw;
    canvas.height = vh;

    // 🔥 important for sharp image
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(video, 0, 0, vw, vh);

    canvas.toBlob((blob) => {

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;

        const filename =
            "passport_" +
            new Date().toISOString().replace(/[:.]/g, "-") +
            ".jpg";

        a.download = filename;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        statusEl.innerText = "SAVED ✔";

    }, "image/jpeg", 0.95);
}

/* =========================
   EVENTS
========================= */
btn.addEventListener("click", capturePhoto);

/* =========================
   INIT
========================= */
startCamera();