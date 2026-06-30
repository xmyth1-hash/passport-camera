const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const statusEl = document.getElementById("status");
const btn = document.getElementById("captureBtn");

/* =========================
   CAMERA START
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
            statusEl.innerText = "READY ✔";
        };

    } catch (err) {
        console.error(err);
        statusEl.innerText = "CAMERA ERROR";
    }
}

/* =========================
   CAPTURE + CROP
========================= */
function capturePassport() {

    const ctx = canvas.getContext("2d");

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    /* full frame canvas */
    canvas.width = vw;
    canvas.height = vh;

    ctx.drawImage(video, 0, 0, vw, vh);

    /* =========================
       ID-1 FRAME GEOMETRY
       MUST MATCH CSS
    ========================= */
    const frameAspect = 1.586;

    let frameW = vw * 0.88;
    let frameH = frameW / frameAspect;

    const frameX = (vw - frameW) / 2;
    const frameY = (vh - frameH) / 2;

    /* =========================
       OUTPUT CANVAS (NO DPI SCALING)
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
       EXPORT JPEG (balanced quality)
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

/* START */
startCamera();