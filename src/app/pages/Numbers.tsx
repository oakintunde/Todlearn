import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

/**
 * Learn Numbers — digit + English word + “count” row of emojis for 1–10.
 *
 * **Audio** — `Say` uses `speechSynthesis` on the word only (`current.word`), not digit+word.
 * **Navigation** — starts at index `0` (One) when opened from home; prev/next and dot strip jump within `numbers`.
 */
export default function Numbers() {
  const navigate = useNavigate();
  /** Index into `numbers`; `0` is One. */
  const [currentNumber, setCurrentNumber] = useState(0);

  /** US English TTS; cancels any in-progress utterance before speaking. */
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  /** Static slides: digit `num`, spoken `word`, counter `emoji`, card `color` (Tailwind gradient). */
  const numbers = [
    {
      num: 1,
      word: "One",
      emoji: "⭐",
      color: "from-pink-400 to-red-500",
    },
    {
      num: 2,
      word: "Two",
      emoji: "🦋",
      color: "from-purple-400 to-pink-500",
    },
    {
      num: 3,
      word: "Three",
      emoji: "🍎",
      color: "from-blue-400 to-cyan-500",
    },
    {
      num: 4,
      word: "Four",
      emoji: "🌸",
      color: "from-green-400 to-emerald-500",
    },
    {
      num: 5,
      word: "Five",
      emoji: "🐠",
      color: "from-yellow-400 to-orange-500",
    },
    { num: 6, word: "Six", emoji: "🌙", color: "from-indigo-400 to-blue-500" },
    {
      num: 7,
      word: "Seven",
      emoji: "🌈",
      color: "from-pink-500 to-yellow-500",
    },
    { num: 8, word: "Eight", emoji: "🧸", color: "from-rose-400 to-pink-600" },
    { num: 9, word: "Nine", emoji: "🚀", color: "from-sky-400 to-indigo-500" },
    { num: 10, word: "Ten", emoji: "🎉", color: "from-orange-400 to-red-500" },
  ];

  const current = numbers[currentNumber];

  /** Previous slide; no-op when already on One. */
  const handlePrev = () => {
    setCurrentNumber((prev) => (prev > 0 ? prev - 1 : prev));
  };

  /** Next slide; no-op on Ten. Dot strip sets index directly. */
  const handleNext = () => {
    setCurrentNumber((prev) => (prev < numbers.length - 1 ? prev + 1 : prev));
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-cyan-50 to-blue-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-blue-600" />
          </button>
          <h2 className="text-2xl font-bold text-blue-800">Learn Numbers</h2>
        </div>

        <div
          className={`bg-gradient-to-br ${current.color} rounded-3xl p-8 text-center shadow-xl`}
        >
          <div className="text-9xl text-white font-bold mb-2">
            {current.num}
          </div>
          <div className="text-3xl text-white font-bold mb-4">
            {current.word}
          </div>
          <button
            type="button"
            onClick={() => speak(current.word)}
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800">
              Say "{current.word}"
            </span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-sm font-bold text-blue-700 mb-4 text-center">
            Count with me!
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: current.num }).map((_, idx) => (
              <div
                key={idx}
                className="text-5xl animate-bounce"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {current.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentNumber === 0}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
          >
            <ArrowLeft className="w-6 h-6 text-blue-600" />
          </button>
          <div className="flex gap-2">
            {numbers.map((_, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setCurrentNumber(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentNumber ? "bg-blue-600 w-6" : "bg-blue-300"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentNumber === numbers.length - 1}
            className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
          >
            <ArrowLeft className="w-6 h-6 text-blue-600 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
