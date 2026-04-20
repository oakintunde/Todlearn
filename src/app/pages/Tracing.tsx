import { ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";
import { useNavigate } from "react-router";

export default function Tracing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"letters" | "numbers">("letters");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const completionTimerRef = useRef<number | null>(null);
  const isDrawingRef = useRef(false);

  const letters = [
    "A",
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

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const items = mode === "letters" ? letters : numbers;
  const current = items[currentIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (context) {
      context.lineWidth = 8;
      context.lineCap = "round";
      context.strokeStyle = "#10b981";
      setCtx(context);
    }
  }, []);

  const clearCompletionTimer = () => {
    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
  };

  const canvasCoords = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    if ("clientX" in e) {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in e) e.preventDefault();
    isDrawingRef.current = true;
    if (!ctx) return;
    const { x, y } = canvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>,
  ) => {
    if ("touches" in e) e.preventDefault();
    if (!isDrawingRef.current || !ctx || !canvasRef.current) return;

    const { x, y } = canvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    if (!completed && completionTimerRef.current === null) {
      completionTimerRef.current = window.setTimeout(() => {
        setCompleted(true);
        completionTimerRef.current = null;
      }, 2000);
    }
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const resetCanvas = () => {
    clearCompletionTimer();
    isDrawingRef.current = false;
    if (canvasRef.current && ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setCompleted(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((i) => i + 1);
      resetCanvas();
    }
  };

  const handleModeChange = (newMode: "letters" | "numbers") => {
    setMode(newMode);
    setCurrentIndex(0);
    resetCanvas();
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-50 to-pink-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <ArrowLeft className="w-6 h-6 text-purple-600" />
            </button>
            <h2 className="text-2xl font-bold text-purple-800">
              Trace & Learn
            </h2>
          </div>
          <button
            type="button"
            onClick={resetCanvas}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </button>
        </div>

        <div className="flex gap-2 bg-white rounded-2xl p-1 shadow-md">
          <button
            type="button"
            onClick={() => handleModeChange("letters")}
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
            onClick={() => handleModeChange("numbers")}
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
          <div className="absolute top-4 right-4 text-sm font-bold text-purple-600">
            {currentIndex + 1} / {items.length}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`text-9xl font-bold transition-all ${
                  mode === "letters" ? "text-purple-100" : "text-blue-100"
                }`}
              >
                {current}
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="relative z-10 cursor-pointer touch-none w-full max-w-[300px] aspect-square mx-auto block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          {completed && (
            <div className="absolute inset-0 bg-green-500/10 rounded-3xl flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-2xl p-4 shadow-xl flex flex-col items-center gap-2">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="text-lg font-bold text-green-700">
                  Great Job! 🎉
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <p className="text-sm text-purple-700">
            ✏️ Trace the {mode === "letters" ? "letter" : "number"} with your
            finger!
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {items.map((_, idx) => (
              <div
                key={idx}
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
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl text-white font-bold shadow-lg hover:scale-105 transition-transform ${
                mode === "letters"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gradient-to-r from-blue-500 to-cyan-500"
              }`}
            >
              Next {mode === "letters" ? "Letter" : "Number"} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
