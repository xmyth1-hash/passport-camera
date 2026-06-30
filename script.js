const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusEl = document.getElementById("status");
const btn = document.getElementById("captureBtn");

/* =========================
   START CAMERA
========================= */
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: "environment" }
            },
            audio: false
        });

        video.srcObject = stream;

        video.onloadedmetadata = async () => {
            await video.play();

            setCameraRatio(); // 🔥 критично для исправления пропорций

            statusEl.innerText = "READY ✔";
        };

    } catch (err) {
        console.error(err);
        statusEl.innerText = "CAMERA ERROR";
    }
}

/* =========================
   FIX CAMERA RATIO (IMPORTANT)
========================= */
function setCameraRatio() {
    const track = video?.srcObject?.getVideoTracks?.()[0];
    if (!track) return;

    const settings = track.getSettings();

    if (settings.width && settings.height) {
        const ratio = settings.width / settings.height;

        document.documentElement.style.setProperty(
            "--cam-ratio",
            ratio
        );
    }
}

/* =========================
   CAPTURE + CROP PASSPORT AREA
========================= */
function capturePassport() {

    const ctx = canvas.getContext("2d");

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    ctx.drawImage(video, 0, 0, vw, vh);

    /* =========================
       FRAME GEOMETRY (matches CSS center layout)
    ========================= */
    const frameAspect = vw / vh;

    let frameH = vh * 0.92;
    let frameW = frameH * frameAspect;

    const frameX = (vw - frameW) / 2;
    const frameY = (vh - frameH) / 2;

    /* =========================
       OUTPUT CANVAS (CLEAN IMAGE)
    ========================= */
    const out = document.createElement("canvas");
    const octx = out.getContext("2d");

    out.width = Math.floor(frameW);
    out.height = Math.floor(frameH);

    octx.drawImage(
        canvas,
        frameX,
        frameY,
        frameW,
        frameH,
        0,
        0,
        out.width,
        out.height
    );

    /* =========================
       EXPORT JPEG
    ========================= */
    out.toBlob((blob) => {

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        const filename =
            "passport_" +
            new Date().toISOString().replace(/[:.]/g, "-") +
            ".jpg";

        a.href = url;
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
btn.addEventListener("click", capturePassport);

/* =========================
   INIT
========================= */
startCamera();