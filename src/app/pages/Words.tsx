import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Words() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [pendingAdvance, setPendingAdvance] = useState(false);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

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
    {
      word: "DOG",
      letters: ["D", "O", "G"],
      emoji: "🐶",
      options: ["DOG", "LOG", "FOG"],
      correct: 0,
      color: "from-blue-400 to-indigo-500",
    },
    {
      word: "HAT",
      letters: ["H", "A", "T"],
      emoji: "🎩",
      options: ["HAT", "BAT", "MAT"],
      correct: 0,
      color: "from-purple-400 to-pink-500",
    },
    {
      word: "FISH",
      letters: ["F", "I", "S", "H"],
      emoji: "🐟",
      options: ["DISH", "FISH", "WISH"],
      correct: 1,
      color: "from-cyan-400 to-blue-500",
    },
    {
      word: "BALL",
      letters: ["B", "A", "L", "L"],
      emoji: "⚽",
      options: ["BALL", "CALL", "TALL"],
      correct: 0,
      color: "from-green-400 to-emerald-500",
    },
    {
      word: "CAR",
      letters: ["C", "A", "R"],
      emoji: "🚗",
      options: ["CAR", "BAR", "FAR"],
      correct: 0,
      color: "from-red-400 to-pink-500",
    },
    {
      word: "TREE",
      letters: ["T", "R", "E", "E"],
      emoji: "🌳",
      options: ["TREE", "FREE", "BEE"],
      correct: 0,
      color: "from-lime-400 to-green-500",
    },
    {
      word: "BOOK",
      letters: ["B", "O", "O", "K"],
      emoji: "📚",
      options: ["LOOK", "BOOK", "COOK"],
      correct: 1,
      color: "from-indigo-400 to-purple-500",
    },
    {
      word: "MOON",
      letters: ["M", "O", "O", "N"],
      emoji: "🌙",
      options: ["MOON", "SOON", "NOON"],
      correct: 0,
      color: "from-gray-400 to-slate-500",
    },
    {
      word: "STAR",
      letters: ["S", "T", "A", "R"],
      emoji: "⭐",
      options: ["STAR", "CAR", "FAR"],
      correct: 0,
      color: "from-yellow-300 to-yellow-500",
    }
  ];

  const current = words[currentWord];

  const handleAnswer = (idx: number) => {
    if (pendingAdvance) return;
    setSelectedAnswer(idx);
    if (idx === current.correct) {
      setPendingAdvance(true);
      setTimeout(() => {
        setCurrentWord((w) => (w < words.length - 1 ? w + 1 : w));
        setSelectedAnswer(null);
        setPendingAdvance(false);
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
            onClick={() => speak(current.word.toLowerCase())}
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
                  disabled={pendingAdvance}
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
