import { useNavigate } from "react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";

export default function Phonics() {
  const navigate = useNavigate();
  const [currentLetter, setCurrentLetter] = useState(0);
  const letters = [
    {
      letter: "A",
      sound: "Aa",
      examples: ["🍎 Apple", "🐜 Ant"],
      color: "from-red-400 to-pink-500",
    },
    {
      letter: "B",
      sound: "Buh",
      examples: ["🎈 Balloon", "🐝 Bee"],
      color: "from-blue-400 to-indigo-500",
    },
    {
      letter: "C",
      sound: "Kuh",
      examples: ["🐱 Cat", "🚗 Car"],
      color: "from-green-400 to-teal-500",
    },
    {
      letter: "D",
      sound: "Duh",
      examples: ["🐕 Dog", "🦆 Duck"],
      color: "from-yellow-400 to-orange-500",
    },
  ];

  const current = letters[currentLetter];

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
          </button>
          <h2 className="text-2xl font-bold text-purple-800">Learn Phonics</h2>
        </div>

        <div
          className={`bg-gradient-to-br ${current.color} rounded-3xl p-8 text-center shadow-xl`}
        >
          <div className="text-8xl text-white font-bold mb-4">{current.letter}</div>
          <button
            type="button"
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-800">Say "{current.sound}"</span>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-700">
            Words with {current.letter}:
          </h3>
          {current.examples.map((example, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl">{example.split(" ")[0]}</div>
              <div className="text-xl font-bold text-gray-700">
                {example.split(" ")[1]}
              </div>
              <button
                type="button"
                className="ml-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
              >
                <Volume2 className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {letters.map((_, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => setCurrentLetter(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentLetter ? "bg-purple-600 w-8" : "bg-purple-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
