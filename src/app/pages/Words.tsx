import { ArrowLeft, Volume2 } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

import clapUrl from "../sounds/clap.mp3?url";

/**
 * Simple Words — picture + spelling tiles + multiple-choice quiz.
 *
 * **Audio**
 * - Per-letter taps: `src/app/sounds/{A-Z}.mp3` (Vite glob); TTS fallback if missing or play fails.
 * - “Say …”: whole word via `speechSynthesis` (lowercase for natural reading).
 * - Correct quiz pick: `clap.mp3`; wrong pick: TTS “Oh no!”.
 * - One shared `letterAudioRef` so letter clips, clap, and TTS do not overlap awkwardly (`speak` / `playLetterSound` / `playClap` coordinate).
 *
 * **Quiz**
 * - Wrong answers stay tappable until correct (only `selectedAnswer` updates).
 * - After correct: `pendingAdvance` disables options ~1.5s, then next word (or stay on last).
 * - Quiz state is advanced in that timeout, not in a `useEffect` on `currentWord`, to satisfy React lint rules.
 */

/** All `.mp3` under `sounds/` at build time; letter files must be named `A.mp3` … `Z.mp3` (see `letterSoundUrl`). */
const letterSoundUrls = import.meta.glob<string>("../sounds/*.mp3", {
  eager: true,
  query: "?url",
  import: "default",
});

/** Resolve bundled URL for a single uppercase letter file, e.g. `T` → `…/T.mp3`. Ignores non-letter assets like `clap.mp3`. */
const letterSoundUrl = (letter: string): string | undefined => {
  const suffix = `${letter.toUpperCase()}.mp3`;
  for (const [path, url] of Object.entries(letterSoundUrls)) {
    if (path.endsWith(suffix)) return url;
  }
  return undefined;
};

export default function Words() {
  const navigate = useNavigate();
  /** Currently playing `HTMLAudioElement` (letter clip or clap), or null. */
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Index into `words`. */
  const [currentWord, setCurrentWord] = useState(0);
  /** Index into `current.options` for the quiz tile the child last tapped. */
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  /** True after a correct answer until the advance timeout fires; blocks further quiz taps. */
  const [pendingAdvance, setPendingAdvance] = useState(false);

  /** Speak text with US English TTS; stops any in-flight letter/clap audio first. */
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

  /** Play `{Letter}.mp3`; on missing file or `play()` error, fall back to TTS letter name. */
  const playLetterSound = (letter: string) => {
    if (typeof window === "undefined") return;
    const L = letter.toUpperCase();
    if (!/[A-Z]/.test(L)) return;
    window.speechSynthesis.cancel();
    letterAudioRef.current?.pause();
    const url = letterSoundUrl(L);
    if (!url) {
      speak(L);
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
      speak(L);
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

  /** Correct-answer feedback: `clap.mp3`, reusing `letterAudioRef` so it replaces any letter clip. */
  const playClap = () => {
    if (typeof window === "undefined") return;
    letterAudioRef.current?.pause();
    letterAudioRef.current = null;
    const audio = new Audio();
    letterAudioRef.current = audio;
    audio.preload = "auto";
    audio.src = clapUrl;
    audio.load();
    void audio.play().catch(() => {
      if (letterAudioRef.current === audio) letterAudioRef.current = null;
    });
    audio.addEventListener(
      "ended",
      () => {
        if (letterAudioRef.current === audio) letterAudioRef.current = null;
      },
      { once: true },
    );
  };

  /**
   * Static curriculum: `word` + `letters` for tiles, `emoji` for art, `options` (3 choices),
   * `correct` = index of right option in `options`, `color` = Tailwind gradient classes.
   */
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

  /** Quiz tap: wrong → “Oh no!” + retry; correct → clap + short lock + advance or end. */
  const handleAnswer = (idx: number) => {
    if (pendingAdvance) return;
    setSelectedAnswer(idx);
    if (idx === current.correct) {
      window.speechSynthesis.cancel();
      playClap();
      setPendingAdvance(true);
      setTimeout(() => {
        setCurrentWord((w) => (w < words.length - 1 ? w + 1 : w));
        setSelectedAnswer(null);
        setPendingAdvance(false);
      }, 1500);
    } else {
      speak("Oh no!");
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
              <button
                type="button"
                key={`${letter}-${idx}`}
                onClick={() => playLetterSound(letter)}
                className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-700 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                aria-label={`Play ${letter} sound`}
              >
                {letter}
              </button>
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
