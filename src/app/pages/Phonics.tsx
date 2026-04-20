import { ArrowLeft, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

/**
 * Letter clips in `src/app/sounds/{Letter}.mp3` (e.g. `A.mp3`).
 * Resolved at build time via Vite; add a file per letter you need.
 */
const letterSoundUrls = import.meta.glob<string>("../sounds/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

const letterSoundUrl = (letter: string): string | undefined => {
  const suffix = `${letter}.mp3`;
  for (const [path, url] of Object.entries(letterSoundUrls)) {
    if (path.endsWith(suffix)) return url;
  }
  return undefined;
};

/** Text after the emoji, e.g. "🍎 Apple" → "Apple", "🍦 Ice cream" → "Ice cream". */
const exampleWord = (example: string) =>
  example.split(/\s+/).slice(1).join(" ").trim();

export default function Phonics() {
  const navigate = useNavigate();
  const [currentLetter, setCurrentLetter] = useState(0);
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    letterAudioRef.current?.pause();
    letterAudioRef.current = null;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const playLetterSound = (letter: string, phonemeHint: string) => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    letterAudioRef.current?.pause();
    const url = letterSoundUrl(letter);
    if (!url) {
      speak(`${letter}. ${phonemeHint}`);
      return;
    }
    const audio = new Audio();
    letterAudioRef.current = audio;
    audio.preload = "auto";
    let settled = false;
    const fallback = () => {
      if (settled) return;
      settled = true;
      if (letterAudioRef.current === audio) letterAudioRef.current = null;
      speak(`${letter}. ${phonemeHint}`);
    };
    audio.addEventListener("error", fallback, { once: true });
    audio.src = url;
    audio.load();
    void audio
      .play()
      .then(() => {
        settled = true;
      })
      .catch(fallback);
    audio.addEventListener(
      "ended",
      () => {
        if (letterAudioRef.current === audio) letterAudioRef.current = null;
      },
      { once: true },
    );
  };

  const speakExampleWord = (example: string) => {
    const word = exampleWord(example);
    if (word) speak(word);
  };
  const letters = [
    {
      letter: "A",
      sound: "Ah",
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
    {
      letter: "E",
      sound: "Ah",
      examples: ["🥚 Egg", "🐘 Elephant"],
      color: "from-purple-400 to-pink-500",
    },
    {
      letter: "F",
      sound: "Fuh",
      examples: ["🐟 Fish", "🔥 Fire"],
      color: "from-cyan-400 to-blue-500",
    },
    {
      letter: "G",
      sound: "Guh",
      examples: ["🦒 Giraffe", "🍇 Grapes"],
      color: "from-green-500 to-lime-500",
    },
    {
      letter: "H",
      sound: "Huh",
      examples: ["🏠 House", "🐎 Horse"],
      color: "from-orange-400 to-red-500",
    },
    {
      letter: "I",
      sound: "Ih",
      examples: ["🍦 Ice cream", "🐛 Insect"],
      color: "from-indigo-400 to-purple-500",
    },
    {
      letter: "J",
      sound: "Juh",
      examples: ["🧃 Juice", "🐆 Jaguar"],
      color: "from-pink-400 to-rose-500",
    },
    {
      letter: "K",
      sound: "Kuh",
      examples: ["🔑 Key", "🪁 Kite"],
      color: "from-teal-400 to-green-500",
    },
    {
      letter: "L",
      sound: "Luh",
      examples: ["🦁 Lion", "🍋 Lemon"],
      color: "from-yellow-300 to-yellow-500",
    },
    {
      letter: "M",
      sound: "Mmm",
      examples: ["🐒 Monkey", "🥛 Milk"],
      color: "from-blue-300 to-blue-500",
    },
    {
      letter: "N",
      sound: "Nnn",
      examples: ["👃 Nose", "🪺 Nest"],
      color: "from-gray-400 to-gray-600",
    },
    {
      letter: "O",
      sound: "Ah",
      examples: ["🍊 Orange", "🐙 Octopus"],
      color: "from-orange-400 to-amber-500",
    },
    {
      letter: "P",
      sound: "Puh",
      examples: ["🐧 Penguin", "🍍 Pineapple"],
      color: "from-emerald-400 to-green-600",
    },
    {
      letter: "Q",
      sound: "Kwuh",
      examples: ["👑 Queen", "❓ Question"],
      color: "from-violet-400 to-purple-600",
    },
    {
      letter: "R",
      sound: "Rrr",
      examples: ["🐇 Rabbit", "🌈 Rainbow"],
      color: "from-red-400 to-orange-500",
    },
    {
      letter: "S",
      sound: "Sss",
      examples: ["🐍 Snake", "☀️ Sun"],
      color: "from-yellow-400 to-amber-500",
    },
    {
      letter: "T",
      sound: "Tuh",
      examples: ["🐯 Tiger", "🌳 Tree"],
      color: "from-green-400 to-emerald-600",
    },
    {
      letter: "U",
      sound: "Uh",
      examples: ["☂️ Umbrella", "🦄 Unicorn"],
      color: "from-blue-400 to-cyan-500",
    },
    {
      letter: "V",
      sound: "Vuh",
      examples: ["🎻 Violin", "🌋 Volcano"],
      color: "from-purple-400 to-indigo-600",
    },
    {
      letter: "W",
      sound: "Wuh",
      examples: ["🍉 Watermelon", "🐋 Whale"],
      color: "from-sky-400 to-blue-600",
    },
    {
      letter: "X",
      sound: "Ks",
      examples: ["❌ X-ray", "🦊 Fox"],
      color: "from-gray-400 to-slate-600",
    },
    {
      letter: "Y",
      sound: "Yuh",
      examples: ["🧶 Yarn", "🛳️ Yacht"],
      color: "from-pink-300 to-pink-500",
    },
    {
      letter: "Z",
      sound: "Zzz",
      examples: ["🦓 Zebra", "⚡ Zigzag"],
      color: "from-indigo-400 to-purple-500",
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
          <div className="text-8xl text-white font-bold mb-4">
            {current.letter}
          </div>
          <button
            type="button"
            onClick={() => playLetterSound(current.letter, current.sound)}
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-800">
              Say "{current.sound}"
            </span>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-purple-700">
            Words with {current.letter}:
          </h3>
          {current.examples.map((example) => (
            <div
              key={example}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl">{example.split(" ")[0]}</div>
              <div className="text-xl font-bold text-gray-700">
                {exampleWord(example)}
              </div>
              <button
                type="button"
                onClick={() => speakExampleWord(example)}
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
