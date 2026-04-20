import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react"; // UI icons
import {
  useEffect, // Canvas context bootstrap
  useRef, // DOM + drawing flags + timer id
  useState, // Mode, index, completed, 2D context holder
  type MouseEvent, // Typed mouse handlers on canvas
  type TouchEvent, // Typed touch handlers on canvas
} from "react";
import { useNavigate } from "react-router"; // Back navigation

/**
 * Trace & Learn — child traces over a large faint letter (A–Z) or digit string (`1`–`10`) on canvas.
 *
 * **Drawing** — Mouse and touch; `canvasCoords` maps viewport → canvas pixels. Green stroke; template is CSS-layer only (not erased).
 * **Completion** — The first `draw` in a fresh canvas starts a one-shot 2s timer, then `completed` shows “Great Job” (reset via clear / next / mode change).
 * **Mode** — Switching letters/numbers resets index to 0 and clears the canvas.
 */
export default function Tracing() {
  const navigate = useNavigate(); // Router instance
  const [mode, setMode] = useState<"letters" | "numbers">("letters"); // Which glyph set is active
  /** Index into `letters` or `numbers` depending on `mode`. */
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Celebration overlay after the 2s post-first-draw timer fires. */
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Drawing surface ref
  /** 2D context from mount `useEffect`; line style preset there. */
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  /** `setTimeout` id for the 2s “done tracing” debounce, or null. */
  const completionTimerRef = useRef<number | null>(null);
  /** True between pointer/touch down and up (per gesture). */
  const isDrawingRef = useRef(false);

  const letters = [
    "A", // Latin uppercase sequence for tracing
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]; // String labels 1–10
  const items = mode === "letters" ? letters : numbers; // Active glyph list
  const current = items[currentIndex]; // Glyph string shown faintly under ink

  /** Grab canvas 2D context once (fixed 300×300 buffer). */
  useEffect(() => {
    const canvas = canvasRef.current; // Read DOM node once mounted
    if (!canvas) return; // Guard before context
    const context = canvas.getContext("2d"); // Acquire 2D API
    if (context) {
      context.lineWidth = 8; // Thick kid-friendly stroke
      context.lineCap = "round"; // Rounded line ends
      context.strokeStyle = "#10b981"; // Emerald stroke color
      setCtx(context); // Store for event handlers
    }
  }, []); // Run once on mount

  /** Cancel pending “trace complete” timeout (e.g. on reset or new stroke logic). */
  const clearCompletionTimer = () => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current); // Cancel pending completion
      completionTimerRef.current = null; // Mark timer slot empty
    }
  };

  /** Pointer position in canvas pixel space (accounts for CSS scaling vs `canvas.width`). */
  const canvasCoords = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current; // Need geometry
    if (!canvas) return { x: 0, y: 0 }; // Safe fallback
    const rect = canvas.getBoundingClientRect(); // CSS pixel bounds
    const scaleX = canvas.width / rect.width; // Horizontal CSS→buffer scale
    const scaleY = canvas.height / rect.height; // Vertical CSS→buffer scale
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX, // Touch X in canvas pixels
        y: (e.touches[0].clientY - rect.top) * scaleY, // Touch Y in canvas pixels
      };
    }
    if ("clientX" in e) {
      return {
        x: (e.clientX - rect.left) * scaleX, // Mouse X in canvas pixels
        y: (e.clientY - rect.top) * scaleY, // Mouse Y in canvas pixels
      };
    }
    return { x: 0, y: 0 }; // Unknown event shape
  };

  /** Begin stroke; `touchstart` calls `preventDefault` to reduce scroll while drawing. */
  const startDrawing = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in e) e.preventDefault(); // Reduce page scroll while drawing
    isDrawingRef.current = true; // Mark stroke in progress
    if (!ctx) return; // Wait until context ready
    const { x, y } = canvasCoords(e); // First point of polyline
    ctx.beginPath(); // Start new path
    ctx.moveTo(x, y); // Seed moveTo
  };

  /** Extend stroke; first paint schedules the 2s “Great Job” timer (see module doc). */
  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in e) e.preventDefault(); // Touch move scroll guard
    if (!isDrawingRef.current || !ctx || !canvasRef.current) return; // Ignore stray moves

    const { x, y } = canvasCoords(e); // Next vertex
    ctx.lineTo(x, y); // Extend path
    ctx.stroke(); // Rasterize segment

    if (!completed && completionTimerRef.current === null) {
      completionTimerRef.current = window.setTimeout(() => {
        setCompleted(true); // Show celebration overlay
        completionTimerRef.current = null; // Allow future timers after reset
      }, 2000); // Two seconds after first draw in session
    }
  };

  /** End current stroke segment (pointer up / leave / touch end). */
  const stopDrawing = () => {
    isDrawingRef.current = false; // End stroke; further moves ignored until next down
  };

  /** Clear ink, completion overlay, and idle timer. */
  const resetCanvas = () => {
    clearCompletionTimer(); // Cancel celebration timer
    isDrawingRef.current = false; // Stop any in-progress stroke flag
    if (canvasRef.current && ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Wipe ink
      setCompleted(false); // Hide overlay until next timer cycle
    }
  };

  /** Advance within current mode; clears canvas for the next glyph. */
  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1); // Advance glyph
      resetCanvas(); // Fresh canvas for new item
    }
  };

  /** Letters ↔ numbers: restart at first item and wipe canvas. */
  const handleModeChange = (newMode: "letters" | "numbers") => {
    setMode(newMode); // Switch alphabet vs numerals
    setCurrentIndex(0); // Restart sequence
    resetCanvas(); // Clear drawing state
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Full-screen padded layout */}
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-50 to-pink-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        {/* Card container */}
        <div className="flex items-center justify-between">
          {/* Header: title cluster + reset */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")} // Go home
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <h2 className="text-2xl font-bold text-purple-800">
              Trace & Learn
              {/* Screen title */}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetCanvas} // Manual clear
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
            {/* Reset icon */}
          </button>
        </div>

        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-md">
          {/* Segmented control */}
          <button
            type="button"
            onClick={() => handleModeChange("letters")} // Alphabet tracing
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === "letters"
                ? "bg-purple-500 text-white shadow-md"
                : "bg-transparent text-purple-600"
            }`}
          >
            Letters
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("numbers")} // Digit tracing
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === "numbers"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-transparent text-blue-600"
            }`}
          >
            Numbers
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl relative">
          {/* Canvas stage + overlay */}
          <div className="absolute top-4 right-4 text-sm font-bold text-purple-600">
            {currentIndex + 1} / {items.length}
            {/* Human-readable position in list */}
          </div>

          <div className="relative">
            {/* Stack faint template under interactive canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`text-9xl font-bold transition-all ${
                  mode === "letters" ? "text-purple-100" : "text-blue-100"
                }`}
              >
                {current}
                {/* Watermark glyph */}
              </div>
            </div>

            <canvas
              ref={canvasRef} // Bridge to imperative drawing API
              width={300} // Internal buffer width (px)
              height={300} // Internal buffer height (px)
              className="relative z-10 cursor-pointer touch-none w-full max-w-[300px] aspect-square mx-auto block"
              onMouseDown={startDrawing} // Desktop stroke start
              onMouseMove={draw} // Desktop stroke continue
              onMouseUp={stopDrawing} // Desktop stroke end
              onMouseLeave={stopDrawing} // Cancel stroke if pointer leaves
              onTouchStart={startDrawing} // Mobile stroke start
              onTouchMove={draw} // Mobile stroke continue
              onTouchEnd={stopDrawing} // Mobile stroke end
            />
          </div>

          {completed && (
            <div className="absolute inset-0 bg-green-500/10 rounded-3xl flex items-center justify-center pointer-events-none">
              {/* Translucent veil */}
              <div className="bg-white rounded-2xl p-4 shadow-xl flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12 text-green-500" />
                {/* Success icon */}
                <p className="text-lg font-bold text-green-700">
                  Great Job! 🎉
                  {/* Encouragement copy */}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-700">
            ✏️ Trace the {mode === "letters" ? "letter" : "number"} with your
            finger!
            {/* Hint text switches noun with mode */}
          </p>
        </div>

        <div className="space-y-4">
          {/* Footer: progress + optional next */}
          <div className="flex gap-2 justify-center">
            {items.map((_, idx) => (
              <div
                key={idx} // Index key
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? `w-12 ${mode === "letters" ? "bg-purple-600" : "bg-blue-600"}`
                    : idx < currentIndex
                      ? `w-8 ${mode === "letters" ? "bg-purple-400" : "bg-blue-400"}`
                      : "w-8 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {currentIndex < items.length - 1 && (
            <button
              type="button"
              onClick={handleNext} // Only before final item
              className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg hover:scale-105 transition-transform ${
                mode === "letters"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
            >
              Next {mode === "letters" ? "Letter" : "Number"} →
              {/* Dynamic CTA label */}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
