"use client";

import { useEffect, useRef, useState } from "react";

// Photo-circle position on the template image (pixel coordinates at native 1686x2528 resolution)
const CIRCLE = { x: 846.5, y: 932.5, r: 292 };
const CANVAS_W = 1686;
const CANVAS_H = 2528;
const TEMPLATE_SRC = "/ganpati-template.png";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const userPhotoRef = useRef<HTMLImageElement | null>(null);

  const [baseLoaded, setBaseLoaded] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [fileName, setFileName] = useState("");

  const [zoom, setZoom] = useState(1); // 1.0 = photo fully covers the circle, no extra zoom
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  // dragging refs (don't need to trigger re-render on every mouse move)
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  // ---- load the base template image once ----
  useEffect(() => {
    const img = new Image();
    img.src = TEMPLATE_SRC;
    img.onload = () => {
      baseImgRef.current = img;
      setBaseLoaded(true);
    };
  }, []);

  // ---- helper: clamp pan so the photo always fully covers the circle ----
  function clampPan(nextZoom: number, nextPanX: number, nextPanY: number) {
    const photo = userPhotoRef.current;
    if (!photo) return { x: nextPanX, y: nextPanY };
    const baseScale = Math.max(
      (CIRCLE.r * 2) / photo.width,
      (CIRCLE.r * 2) / photo.height,
    );
    const scale = baseScale * nextZoom;
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    const maxPanX = Math.max(0, dw / 2 - CIRCLE.r);
    const maxPanY = Math.max(0, dh / 2 - CIRCLE.r);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, nextPanX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextPanY)),
    };
  }

  // ---- render the canvas whenever relevant state changes ----
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseLoaded, hasPhoto, zoom, panX, panY]);

  function render() {
    const canvas = canvasRef.current;
    const baseImg = baseImgRef.current;
    if (!canvas || !baseImg || !baseLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

    const photo = userPhotoRef.current;
    if (photo) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(CIRCLE.x, CIRCLE.y, CIRCLE.r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const baseScale = Math.max(
        (CIRCLE.r * 2) / photo.width,
        (CIRCLE.r * 2) / photo.height,
      );
      const scale = baseScale * zoom;
      const dw = photo.width * scale;
      const dh = photo.height * scale;
      const dx = CIRCLE.x - dw / 2 + panX;
      const dy = CIRCLE.y - dh / 2 + panY;
      ctx.drawImage(photo, dx, dy, dw, dh);
      ctx.restore();
    }
  }

  // ---- photo upload ----
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        userPhotoRef.current = img;
        setFileName(file.name);
        setHasPhoto(true);
        setZoom(1);
        setPanX(0);
        setPanY(0);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function handleZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const nextZoom = Number(e.target.value) / 100;
    const clamped = clampPan(nextZoom, panX, panY);
    setZoom(nextZoom);
    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  // ---- drag to reposition the photo inside the circle ----
  function getCanvasCoords(clientX: number, clientY: number) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function startDrag(clientX: number, clientY: number) {
    if (!userPhotoRef.current) return;
    draggingRef.current = true;
    dragStartRef.current = getCanvasCoords(clientX, clientY);
    panStartRef.current = { x: panX, y: panY };
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!draggingRef.current) return;
    const p = getCanvasCoords(clientX, clientY);
    const nextPanX = panStartRef.current.x + (p.x - dragStartRef.current.x);
    const nextPanY = panStartRef.current.y + (p.y - dragStartRef.current.y);
    const clamped = clampPan(zoom, nextPanX, nextPanY);
    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  function endDrag() {
    draggingRef.current = false;
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => {
      if (draggingRef.current && e.touches[0]) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      }
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panX, panY, zoom]);

  // ---- download ----
  function handleDownload() {
    if (!hasPhoto || !userPhotoRef.current) {
      alert("કૃપા કરીને પહેલા તમારો ફોટો પસંદ કરો.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "ganpati-poster.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // ---- WhatsApp share ----
  function handleWhatsAppShare() {
    if (!hasPhoto || !userPhotoRef.current) {
      alert("કૃપા કરીને પહેલા તમારો ફોટો પસંદ કરો.");
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;

      // First download poster
      const link = document.createElement("a");
      link.download = "ganpati-poster.png";
      link.href = URL.createObjectURL(blob);
      link.click();

      // Then open WhatsApp
      setTimeout(() => {
        const message = "બાપ્પા આવી રહ્યા છે... ચાલો, સ્વાગત કરીએ! 🙏";

        window.location.href =
          "https://wa.me/?text=" + encodeURIComponent(message);
      }, 500);
    }, "image/png");
  }

  // ---- reset ----
  function handleReset() {
    userPhotoRef.current = null;
    setHasPhoto(false);
    setFileName("");
    setZoom(1);
    setPanX(0);
    setPanY(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <>
      <h1 className="title">|| શ્રી ગણપતિ બાપ્પા મોરિયા ||</h1>
      <marquee direction="left" className="informative-sub">
        🙏. આવો... ભક્તિ, શ્રદ્ધા અને આનંદ સાથે બાપ્પા નું સ્વાગત કરીએ ! 🙏
      </marquee>
      <div className="organized-by">Friends Group દ્વારા આયોજિત</div>
      <div className="layout">
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

          {hasPhoto && (
            <div className="field">
              <span className="field-label">
                ફોટો ઝૂમ (Zoom){" "}
                <span style={{ color: "#cba579", fontWeight: 400 }}>
                  {Math.round(zoom * 100)}%
                </span>
              </span>
              <input
                type="range"
                min={100}
                max={300}
                value={Math.round(zoom * 100)}
                onChange={handleZoomChange}
              />
              <span className="zoom-hint">ફોટોને ખેંચીને (drag) ગોઠવો ✋</span>
            </div>
          )}

          <button
            className="btn-download"
            onClick={handleDownload}
            disabled={!hasPhoto}
          >
            📥 પોસ્ટર ડાઉનલોડ કરો
          </button>

          <button
            className="btn-whatsapp"
            onClick={handleWhatsAppShare}
            disabled={!hasPhoto}
          >
            💬 WhatsApp પર શેર કરો
          </button>
          <button className="btn-reset" onClick={handleReset}>
            રીસેટ કરો
          </button>
        </div>

        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={hasPhoto ? "draggable" : ""}
            onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches[0])
                startDrag(e.touches[0].clientX, e.touches[0].clientY);
            }}
          />
        </div>
      </div>

      <footer className="site-footer">
        Design by: <strong>Pankaj Unagar</strong>
      </footer>
    </>
  );
}
