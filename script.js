const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusEl = document.getElementById("status");
const btn = document.getElementById("captureBtn");

/* =========================
   START CAMERA (STABLE)
========================= */
async function startCamera() {
    try {
        statusEl.innerText = "REQUESTING CAMERA...";

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        video.srcObject = stream;

        video.addEventListener("loadedmetadata", () => {
            video.play()
                .then(() => {
                    setCameraRatio();
                    statusEl.innerText = "READY ✔";
                })
                .catch(err => {
                    console.error("PLAY ERROR:", err);
                    statusEl.innerText = "PLAY BLOCKED";
                });
        });

    } catch (err) {
        console.error("CAMERA ERROR:", err);
        statusEl.innerText = "CAMERA ERROR";
    }
}

/* =========================
   CAMERA RATIO FIX
========================= */
function setCameraRatio() {
    const track = video?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;

    const settings = track.getSettings();

    if (settings.width && settings.height) {
        const ratio = settings.width / settings.height;
        document.documentElement.style.setProperty("--cam-ratio", ratio);
    }
}

/* =========================
   CAPTURE IMAGE
========================= */
function capturePhoto() {

    const ctx = canvas.getContext("2d");

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    ctx.drawImage(video, 0, 0, vw, vh);

    /* full frame export (MVP) */
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

    }, "image/jpeg", 0.92);
}

/* =========================
   EVENTS
========================= */
btn.addEventListener("click", capturePhoto);

/* =========================
   INIT
========================= */
startCamera();