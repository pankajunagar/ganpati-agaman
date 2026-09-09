"use client";

import { useEffect, useRef, useState } from "react";

// =====================================================
// ORIGINAL POSTER SETTINGS
// =====================================================

const CIRCLE = {
  x: 846.5,
  y: 932.5,
  r: 292,
};

const CANVAS_W = 1686;
const CANVAS_H = 2528;

const TEMPLATE_SRC = "/ganpati-template.png";

// Small editor circle shown to user
const EDITOR_SIZE = 260;

export default function Home() {
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const templateRef = useRef<HTMLImageElement | null>(null);

  const photoRef = useRef<HTMLImageElement | null>(null);

  const [templateLoaded, setTemplateLoaded] = useState(false);

  const [hasPhoto, setHasPhoto] = useState(false);

  const [fileName, setFileName] = useState("");

  const [zoom, setZoom] = useState(1);

  const [panX, setPanX] = useState(0);

  const [panY, setPanY] = useState(0);

  // ===================================================
  // DRAG REFS
  // ===================================================

  const draggingRef = useRef(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
  });

  const panStartRef = useRef({
    x: 0,
    y: 0,
  });

  // ===================================================
  // LOAD TEMPLATE
  // ===================================================

  useEffect(() => {
    const img = new Image();

    img.src = TEMPLATE_SRC;

    img.onload = () => {
      templateRef.current = img;
      setTemplateLoaded(true);
    };
  }, []);

  // ===================================================
  // PHOTO SCALE
  // ===================================================

  function getBaseScale(photo: HTMLImageElement) {
    return Math.max(EDITOR_SIZE / photo.width, EDITOR_SIZE / photo.height);
  }

  // ===================================================
  // CLAMP PHOTO
  // ===================================================

  function clampPan(nextZoom: number, nextPanX: number, nextPanY: number) {
    const photo = photoRef.current;

    if (!photo) {
      return {
        x: nextPanX,
        y: nextPanY,
      };
    }

    const baseScale = getBaseScale(photo);

    const scale = baseScale * nextZoom;

    const width = photo.width * scale;

    const height = photo.height * scale;

    const maxX = Math.max(0, width / 2 - EDITOR_SIZE / 2);

    const maxY = Math.max(0, height / 2 - EDITOR_SIZE / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, nextPanX)),

      y: Math.max(-maxY, Math.min(maxY, nextPanY)),
    };
  }

  // ===================================================
  // DRAW SMALL EDITOR CIRCLE
  // ===================================================

  useEffect(() => {
    drawEditor();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateLoaded, hasPhoto, zoom, panX, panY]);

  function drawEditor() {
    const canvas = editorCanvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, EDITOR_SIZE, EDITOR_SIZE);

    // =================================================
    // CIRCLE CLIP
    // =================================================

    ctx.save();

    ctx.beginPath();

    ctx.arc(EDITOR_SIZE / 2, EDITOR_SIZE / 2, EDITOR_SIZE / 2, 0, Math.PI * 2);

    ctx.closePath();

    ctx.clip();

    // =================================================
    // PHOTO
    // =================================================

    const photo = photoRef.current;

    if (photo) {
      const baseScale = getBaseScale(photo);

      const scale = baseScale * zoom;

      const width = photo.width * scale;

      const height = photo.height * scale;

      const x = EDITOR_SIZE / 2 - width / 2 + panX;

      const y = EDITOR_SIZE / 2 - height / 2 + panY;

      ctx.drawImage(photo, x, y, width, height);
    }

    // =================================================
    // EMPTY CIRCLE
    // =================================================

    if (!photo) {
      ctx.fillStyle = "#f5eee4";

      ctx.fillRect(0, 0, EDITOR_SIZE, EDITOR_SIZE);

      ctx.fillStyle = "#9b8065";

      ctx.font = "600 18px Arial";

      ctx.textAlign = "center";

      ctx.textBaseline = "middle";

      ctx.fillText("તમારો ફોટો", EDITOR_SIZE / 2, EDITOR_SIZE / 2 - 10);

      ctx.font = "14px Arial";

      ctx.fillText("અહીં સેટ કરો", EDITOR_SIZE / 2, EDITOR_SIZE / 2 + 16);
    }

    ctx.restore();

    // =================================================
    // EDITOR BORDER
    // =================================================

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      EDITOR_SIZE / 2,
      EDITOR_SIZE / 2,
      EDITOR_SIZE / 2 - 2,
      0,
      Math.PI * 2,
    );

    ctx.strokeStyle = "#cba579";

    ctx.lineWidth = 4;

    ctx.stroke();

    ctx.restore();
  }

  // ===================================================
  // UPLOAD PHOTO
  // ===================================================

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        photoRef.current = img;

        setFileName(file.name);

        setHasPhoto(true);

        // Reset position
        setZoom(1);

        setPanX(0);

        setPanY(0);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  }

  // ===================================================
  // ZOOM
  // ===================================================

  function handleZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextZoom = Number(e.target.value) / 100;

    const clamped = clampPan(nextZoom, panX, panY);

    setZoom(nextZoom);

    setPanX(clamped.x);

    setPanY(clamped.y);
  }

  // ===================================================
  // EDITOR COORDINATES
  // ===================================================

  function getEditorCoords(clientX: number, clientY: number) {
    const canvas = editorCanvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    const scaleX = EDITOR_SIZE / rect.width;

    const scaleY = EDITOR_SIZE / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,

      y: (clientY - rect.top) * scaleY,
    };
  }

  // ===================================================
  // START DRAG
  // ===================================================

  function startDrag(clientX: number, clientY: number) {
    if (!photoRef.current) {
      return;
    }

    const point = getEditorCoords(clientX, clientY);

    draggingRef.current = true;

    dragStartRef.current = point;

    panStartRef.current = {
      x: panX,
      y: panY,
    };
  }

  // ===================================================
  // MOVE DRAG
  // ===================================================

  function moveDrag(clientX: number, clientY: number) {
    if (!draggingRef.current) {
      return;
    }

    const point = getEditorCoords(clientX, clientY);

    const nextX = panStartRef.current.x + (point.x - dragStartRef.current.x);

    const nextY = panStartRef.current.y + (point.y - dragStartRef.current.y);

    const clamped = clampPan(zoom, nextX, nextY);

    setPanX(clamped.x);

    setPanY(clamped.y);
  }

  // ===================================================
  // END DRAG
  // ===================================================

  function endDrag() {
    draggingRef.current = false;
  }

  // ===================================================
  // POINTER EVENTS
  //
  // Vertical page scrolling works normally.
  // No preventDefault().
  // ===================================================

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) {
        return;
      }

      moveDrag(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      endDrag();
    };

    window.addEventListener("pointermove", handlePointerMove);

    window.addEventListener("pointerup", handlePointerUp);

    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);

      window.removeEventListener("pointerup", handlePointerUp);

      window.removeEventListener("pointercancel", handlePointerUp);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panX, panY, zoom]);

  // ===================================================
  // FINAL POSTER GENERATION
  //
  // User never sees the original poster.
  // It is generated only when downloading.
  // ===================================================

  function createFinalPoster(): HTMLCanvasElement | null {
    const template = templateRef.current;

    const photo = photoRef.current;

    if (!template || !photo) {
      return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = CANVAS_W;

    canvas.height = CANVAS_H;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    // =================================================
    // DRAW ORIGINAL POSTER
    // =================================================

    ctx.drawImage(template, 0, 0, CANVAS_W, CANVAS_H);

    // =================================================
    // CIRCLE CLIP
    // =================================================

    ctx.save();

    ctx.beginPath();

    ctx.arc(CIRCLE.x, CIRCLE.y, CIRCLE.r, 0, Math.PI * 2);

    ctx.closePath();

    ctx.clip();

    // =================================================
    // IMPORTANT:
    //
    // Convert small editor movement into
    // original poster coordinates.
    // =================================================

    const editorScale = (CIRCLE.r * 2) / EDITOR_SIZE;

    const baseScale = Math.max(
      (CIRCLE.r * 2) / photo.width,

      (CIRCLE.r * 2) / photo.height,
    );

    const scale = baseScale * zoom;

    const photoWidth = photo.width * scale;

    const photoHeight = photo.height * scale;

    // Convert editor pan to poster pan
    const finalPanX = panX * editorScale;

    const finalPanY = panY * editorScale;

    const dx = CIRCLE.x - photoWidth / 2 + finalPanX;

    const dy = CIRCLE.y - photoHeight / 2 + finalPanY;

    // =================================================
    // DRAW PHOTO INTO ORIGINAL POSTER
    // =================================================

    ctx.drawImage(photo, dx, dy, photoWidth, photoHeight);

    ctx.restore();

    return canvas;
  }

  // ===================================================
  // DOWNLOAD
  // ===================================================

  function handleDownload() {
    if (!hasPhoto) {
      alert("કૃપા કરીને પહેલા તમારો ફોટો પસંદ કરો.");

      return;
    }

    const finalCanvas = createFinalPoster();

    if (!finalCanvas) {
      alert("પોસ્ટર બનાવવામાં સમસ્યા આવી.");

      return;
    }

    finalCanvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = "ganpati-poster.png";

      document.body.appendChild(link);

      link.click();

      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    }, "image/png");
  }

  // ===================================================
  // WHATSAPP
  // ===================================================

async function handleWhatsAppShare() {
  const canvas = createFinalPoster();

  if (!canvas) {
    alert("પહેલા ફોટો પસંદ કરો.");
    return;
  }

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], "ganpati-poster.png", {
      type: "image/png",
    });

    const shareData = {
      files: [file],
      title: "શ્રી ગણપતિ બાપ્પા મોરિયા",
      text: "બાપ્પા આવી રહ્યા છે... ચાલો, સ્વાગત કરીએ! 🙏",
    };

    // Mobile browsers: image + text share
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // User cancelled share
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }

    // Fallback: WhatsApp message
    const message = encodeURIComponent(
      "બાપ્પા આવી રહ્યા છે... ચાલો, સ્વાગત કરીએ! 🙏"
    );

    window.open(
      `https://wa.me/?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  }, "image/png");
}
  // ===================================================
  // RESET
  // ===================================================

  function handleReset() {
    photoRef.current = null;

    draggingRef.current = false;

    setHasPhoto(false);

    setFileName("");

    setZoom(1);

    setPanX(0);

    setPanY(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      {/* HEADER */}

      <h1 className="title">|| શ્રી ગણપતિ બાપ્પા મોરિયા ||</h1>

      <div className="informative-sub">
        <div className="marquee-content">
          🙏 આવો... ભક્તિ, શ્રદ્ધા અને આનંદ સાથે બાપ્પાનું સ્વાગત કરીએ! 🙏
        </div>
      </div>

      <div className="organized-by">Friends Group દ્વારા આયોજિત</div>

      {/* =================================================
          PHOTO EDITOR
      ================================================= */}

      <div className="photo-editor">
        <div className="controls">
          <div className="field">
            <span className="field-label">તમારો ફોટો</span>

            <label className="upload-box">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />

              <div className="upload-icon">📷</div>

              <span className="upload-text">
                {fileName ? `✓ ${fileName}` : "ફોટો પસંદ કરો"}
              </span>
            </label>
          </div>

          {/* ===============================================
            DOWNLOAD
        ================================================ */}

          <button
            className="btn-download"
            onClick={handleDownload}
            disabled={!hasPhoto}
          >
            📥 પોસ્ટર ડાઉનલોડ કરો
          </button>

          {/* WHATSAPP */}

          <button
            className="btn-whatsapp"
            onClick={handleWhatsAppShare}
            disabled={!hasPhoto}
          >
            💬 WhatsApp પર શેર કરો
          </button>

          {/* RESET */}

          <button className="btn-reset" onClick={handleReset}>
            રીસેટ કરો
          </button>
        </div>
        <div className="poster-preview">
          {/* ===============================================
            SMALL CIRCLE EDITOR
        ================================================ */}

          <div className="circle-editor">
            <canvas
              ref={editorCanvasRef}
              width={EDITOR_SIZE}
              height={EDITOR_SIZE}
              className={
                hasPhoto ? "photo-editor-canvas active" : "photo-editor-canvas"
              }
              onPointerDown={(e) => {
                if (!hasPhoto) {
                  return;
                }

                startDrag(e.clientX, e.clientY);
              }}
            />
          </div>

          {/* INSTRUCTION */}

          <div className="zoom-hint">
            {hasPhoto
              ? "ફોટોને ખેંચીને circleમાં ગોઠવો ✋"
              : "પહેલા તમારો ફોટો પસંદ કરો"}
          </div>

          {/* ===============================================
            ZOOM
        ================================================ */}

          {hasPhoto && (
            <div className="zoom-section">
              <div className="zoom-title">
                <span>ફોટો ઝૂમ</span>

                <span>{Math.round(zoom * 100)}%</span>
              </div>

              <input
                className="zoom-range"
                type="range"
                min="100"
                max="300"
                value={Math.round(zoom * 100)}
                onChange={handleZoomChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}

      <footer className="site-footer">
        Design by: <strong>Pankaj Unagar</strong>
      </footer>
    </>
  );
  // return (
  //   <>
  //     {/* ================================================
  //         HEADER
  //     ================================================= */}

  //     <h1 className="title">|| શ્રી ગણપતિ બાપ્પા મોરિયા ||</h1>

  //     <div className="informative-sub">
  //       <div className="marquee-content">
  //         🙏 આવો... ભક્તિ, શ્રદ્ધા અને આનંદ સાથે બાપ્પાનું સ્વાગત કરીએ! 🙏
  //       </div>
  //     </div>

  //     <div className="organized-by">Friends Group દ્વારા આયોજિત</div>

  //     {/* ================================================
  //         MAIN LAYOUT
  //     ================================================= */}

  //     <div className="layout">
  //       {/* ==============================================
  //           CONTROLS
  //       =============================================== */}

  //       <div className="controls">
  //         {/* PHOTO UPLOAD */}

  //         <div className="field">
  //           <span className="field-label">તમારો ફોટો</span>

  //           <label className="upload-box">
  //             <input
  //               ref={fileInputRef}
  //               type="file"
  //               accept="image/*"
  //               onChange={handlePhotoChange}
  //             />

  //             <div className="upload-icon">📷</div>

  //             <span className="upload-text">
  //               {fileName ? `✓ ${fileName}` : "ફોટો પસંદ કરો"}
  //             </span>
  //           </label>
  //         </div>

  //         {/* ZOOM */}

  //         {hasPhoto && (
  //           <div className="field">
  //             <span className="field-label">
  //               ફોટો ઝૂમ (Zoom){" "}
  //               <span
  //                 style={{
  //                   color: "#cba579",
  //                   fontWeight: 400,
  //                 }}
  //               >
  //                 {Math.round(zoom * 100)}%
  //               </span>
  //             </span>

  //             <input
  //               type="range"
  //               min={100}
  //               max={300}
  //               value={Math.round(zoom * 100)}
  //               onChange={handleZoomChange}
  //             />

  //             <span className="zoom-hint">ફોટોને ખેંચીને (drag) ગોઠવો ✋</span>
  //           </div>
  //         )}

  //         {/* DOWNLOAD */}

  //         <button
  //           className="btn-download"
  //           onClick={handleDownload}
  //           disabled={!hasPhoto}
  //         >
  //           📥 પોસ્ટર ડાઉનલોડ કરો
  //         </button>

  //         {/* WHATSAPP */}

  //         <button
  //           className="btn-whatsapp"
  //           onClick={handleWhatsAppShare}
  //           disabled={!hasPhoto}
  //         >
  //           💬 WhatsApp પર શેર કરો
  //         </button>

  //         {/* RESET */}

  //         <button className="btn-reset" onClick={handleReset}>
  //           રીસેટ કરો
  //         </button>
  //       </div>

  //       {/* ==============================================
  //           POSTER
  //       =============================================== */}

  //       <div className="canvas-wrap">
  //         <canvas
  //           ref={canvasRef}
  //           width={CANVAS_W}
  //           height={CANVAS_H}
  //           className={hasPhoto ? "draggable" : ""}
  //           onPointerDown={(e) => {
  //             if (!userPhotoRef.current) {
  //               return;
  //             }

  //             startDrag(e.clientX, e.clientY);
  //           }}
  //         />
  //       </div>
  //     </div>

  //     {/* ================================================
  //         FOOTER
  //     ================================================= */}

  //     <footer className="site-footer">
  //       Design by: <strong>Pankaj Unagar</strong>
  //     </footer>
  //   </>
  // );
}
