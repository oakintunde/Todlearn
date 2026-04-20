import { useNavigate } from "react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";

export default function Words() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const words = [
    {
      word: "CAT",
      letters: ["C", "A", "T"],
      emoji: "🐱",
      options: ["DOG", "CAT", "BAT"],
      correct: 1,
      color: "from-orange-400 to-red-500",
    },
    {
      word: "SUN",
      letters: ["S", "U", "N"],
      emoji: "☀️",
      options: ["SUN", "RUN", "BUN"],
      correct: 0,
      color: "from-yellow-400 to-orange-500",
    },
    {
      word: "BEE",
      letters: ["B", "E", "E"],
      emoji: "🐝",
      options: ["SEE", "BEE", "TEE"],
      correct: 1,
      color: "from-amber-400 to-yellow-500",
    },
  ];

  const current = words[currentWord];

  const handleAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    if (idx === current.correct) {
      setTimeout(() => {
        setCurrentWord((w) => {
          if (w < words.length - 1) {
            queueMicrotask(() => setSelectedAnswer(null));
            return w + 1;
          }
          return w;
        });
      }, 1500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-green-50 to-emerald-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-green-600" />
          </button>
          <h2 className="text-2xl font-bold text-green-800">Simple Words</h2>
        </div>

        <div className="bg-white rounded-3xl p-8 flex items-center justify-center shadow-md">
          <div className="text-9xl">{current.emoji}</div>
        </div>

        <div
          className={`bg-gradient-to-br ${current.color} rounded-3xl p-6 text-center shadow-xl`}
        >
          <div className="text-5xl text-white font-bold mb-4">
            {current.word}
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {current.letters.map((letter, idx) => (
              <div
                key={idx}
                className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-700 shadow-md"
              >
                {letter}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800">
              Say "{current.word}"
            </span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          <h3 className="text-sm font-bold text-green-700 mb-3 text-center">
            Which word matches?
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {current.options.map((option, idx) => {
              const isCorrect = idx === current.correct;
              const isSelected = selectedAnswer === idx;

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={`h-14 rounded-xl font-bold text-sm transition-all ${
                    isSelected && isCorrect
                      ? "bg-green-500 text-white scale-105"
                      : isSelected && !isCorrect
                        ? "bg-red-400 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {option}
                  {isSelected && isCorrect && <div className="text-xl">✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          {words.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentWord
                  ? "w-12 bg-green-600"
                  : idx < currentWord
                    ? "w-8 bg-green-400"
                    : "w-8 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
