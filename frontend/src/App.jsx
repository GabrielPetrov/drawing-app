import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiGet, apiPost, apiDelete } from "./api.js";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(4);
  const [title, setTitle] = useState("Untitled");
  const [drawings, setDrawings] = useState([]);
  const [status, setStatus] = useState("");
  const redoStackRef = useRef([]);
  const [mode, setMode] = useState("draw"); // or "erase"

  // Strokes format:
  // [{ color, size, points: [{x,y,t}, ...] }, ...]
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);

  const ctx = useMemo(() => {
    const c = canvasRef.current;
    return c ? c.getContext("2d") : null;
  }, [canvasRef.current]);

  function setCanvasSize() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual pixel buffer size
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    const context = canvas.getContext("2d");

    // Map drawing coordinates to CSS pixels
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    redrawAll();
  }

  useEffect(() => {
    const handler = () => setCanvasSize();
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x: clamp(x, 0, rect.width), y: clamp(y, 0, rect.height) };
  }

  function beginStroke(e) {
    e.preventDefault();
    const p = getPos(e);
    const strokeColor = mode === "erase" ? "#ffffff" : color;
    const strokeSize = mode === "erase" ? Math.max(size, 12) : size;
    const stroke = { color: strokeColor, size: strokeSize, points: [{ ...p, t: Date.now() }] };
    currentStrokeRef.current = stroke;
    strokesRef.current.push(stroke);
    setIsDrawing(true);
    drawLastSegment();
  }

  function moveStroke(e) {
    if (!isDrawing || !currentStrokeRef.current) return;
    e.preventDefault();
    const p = getPos(e);
    currentStrokeRef.current.points.push({ ...p, t: Date.now() });
    drawLastSegment();
  }

  function endStroke(e) {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    currentStrokeRef.current = null;

    redoStackRef.current = [];
  }

  function drawLastSegment() {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const stroke = currentStrokeRef.current;
    if (!stroke) return;

    const pts = stroke.points;
    if (pts.length < 2) {
      // draw a dot
      const p = pts[0];
      context.beginPath();
      context.fillStyle = stroke.color;
      context.arc(p.x, p.y, stroke.size / 2, 0, Math.PI * 2);
      context.fill();
      return;
    }

    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];

    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.size;
    context.lineCap = "round";
    context.lineJoin = "round";

    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  function redrawAll() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);

    for (const stroke of strokesRef.current) {
      const pts = stroke.points;
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.size;
      context.lineCap = "round";
      context.lineJoin = "round";

      if (pts.length === 1) {
        const p = pts[0];
        context.beginPath();
        context.fillStyle = stroke.color;
        context.arc(p.x, p.y, stroke.size / 2, 0, Math.PI * 2);
        context.fill();
        continue;
      }

      context.beginPath();
      context.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        context.lineTo(pts[i].x, pts[i].y);
      }
      context.stroke();
    }
  }

  function clearCanvas() {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    redrawAll();
  }

  function undo() {
    const strokes = strokesRef.current;
    if (strokes.length === 0) return;
    const last = strokes.pop();
    redoStackRef.current.push(last);
    redrawAll();
  }

  function redo() {
    const redoStack = redoStackRef.current;
    if (redoStack.length === 0) return;
    const stroke = redoStack.pop();
    strokesRef.current.push(stroke);
    redrawAll();
  }

  async function refreshList() {
    const list = await apiGet("/drawings");
    setDrawings(list);
  }

  useEffect(() => {
    refreshList().catch((e) => setStatus(`Error: ${e.message}`));
  }, []);

  async function saveDrawing() {
    setStatus("Saving...");
    try {
      const payload = {
        title: title.trim() || "Untitled",
        data: { strokes: strokesRef.current },
      };
      await apiPost("/drawings", payload);
      setStatus("Saved.");
      await refreshList();
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  async function loadDrawing(id) {
    setStatus("Loading...");
    try {
      const d = await apiGet(`/drawings/${id}`);
      strokesRef.current = d.data?.strokes || [];
      setTitle(d.title || "Untitled");
      redrawAll();
      setStatus("Loaded.");
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  async function deleteDrawing(id) {
    setStatus("Deleting...");
    try {
      await apiDelete(`/drawings/${id}`);
      setStatus("Deleted.");
      // If the deleted drawing is currently loaded, you can choose to clear:
      // clearCanvas();
      await refreshList();
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }


  return (
    <div className="page">
      <header className="header">
        <div className="title">
          <h1>Drawing App</h1>
          <p>Draw on the canvas and save to PostgreSQL via FastAPI.</p>
        </div>
        <div className="status">{status}</div>
      </header>

      <div className="layout">
        <section className="panel">
          <div className="controls">
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label>
              Color
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            <button
              onClick={() => setMode((m) => (m === "draw" ? "erase" : "draw"))}
              className="secondary"
            >
              {mode === "draw" ? "Eraser" : "Draw"}
            </button>

            <button onClick={undo} className="secondary">Undo</button>
            <button onClick={redo} className="secondary">Redo</button>

            <label>
              Brush size
              <input
                type="range"
                min="1"
                max="20"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
              />
              <span className="small">{size}px</span>
            </label>

            <div className="buttons">
              <button onClick={saveDrawing}>Save</button>
              <button onClick={clearCanvas} className="secondary">Clear</button>
              <button onClick={() => refreshList().catch(() => {})} className="secondary">Refresh list</button>
            </div>
          </div>

          <div className="canvasWrap">
            <canvas
              ref={canvasRef}
              className="canvas"
              onMouseDown={beginStroke}
              onMouseMove={moveStroke}
              onMouseUp={endStroke}
              onMouseLeave={endStroke}
              onTouchStart={beginStroke}
              onTouchMove={moveStroke}
              onTouchEnd={endStroke}
            />
          </div>
        </section>

        <aside className="sidebar">
          <h2>Saved drawings</h2>
          <div className="list">
            {drawings.length === 0 ? (
              <div className="empty">No drawings yet.</div>
            ) : (
              drawings.map((d) => (
                <div key={d.id} className="listItemRow">
                  <button className="listItemMain" onClick={() => loadDrawing(d.id)} title={d.title}>
                    <div className="liTitle">{d.title}</div>
                    <div className="liMeta">
                      ID {d.id} • {new Date(d.created_at).toLocaleString()}
                    </div>
                  </button>

                  <button
                    className="deleteBtn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDrawing(d.id);
                    }}
                    title="Delete"
                    aria-label={`Delete drawing ${d.id}`}
                  >
                    Delete
                  </button>
                </div>
              ))

            )}
          </div>
        </aside>
      </div>

      <footer className="footer">
        Tip: Save multiple versions; click a saved item to load it back to the canvas.
      </footer>
    </div>
  );
}
