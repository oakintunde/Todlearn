import { ArrowLeft, Volume2 } from "lucide-react"; // Back + volume UI
import { useRef, useState } from "react"; // Audio ref + quiz state
import { useNavigate } from "react-router"; // Home navigation

import clapUrl from "../sounds/clap.mp3?url"; // Bundled applause clip URL

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
  eager: true, // Resolve URLs at build
  query: "?url", // Vite asset URL import
  import: "default", // Default export = URL string
});

/** Resolve bundled URL for a single uppercase letter file, e.g. `T` → `…/T.mp3`. Ignores non-letter assets like `clap.mp3`. */
const letterSoundUrl = (letter: string): string | undefined => {
  const suffix = `${letter.toUpperCase()}.mp3`; // Normalize to uppercase filename
  for (const [path, url] of Object.entries(letterSoundUrls)) {
    if (path.endsWith(suffix)) return url; // Match bundled path suffix
  }
  return undefined; // No clip (e.g. missing file)
};

export default function Words() {
  const navigate = useNavigate(); // Router
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
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return; // Guard
    letterAudioRef.current?.pause(); // Stop MP3/clap
    letterAudioRef.current = null; // Drop ref
    window.speechSynthesis.cancel(); // Clear speech queue
    const utterance = new SpeechSynthesisUtterance(text); // New utterance
    utterance.lang = "en-US"; // Locale
    utterance.rate = 0.9; // Slightly slow for clarity
    window.speechSynthesis.speak(utterance); // Speak
  };

  /** Play `{Letter}.mp3`; on missing file or `play()` error, fall back to TTS letter name. */
  const playLetterSound = (letter: string) => {
    if (typeof window === "undefined") return; // SSR guard
    const L = letter.toUpperCase(); // File names are uppercase
    if (!/[A-Z]/.test(L)) return; // Ignore non-letters
    window.speechSynthesis.cancel(); // No TTS overlap
    letterAudioRef.current?.pause(); // One audio at a time
    const url = letterSoundUrl(L); // Lookup bundled mp3
    if (!url) {
      speak(L); // Letter name via TTS
      return;
    }
    const audio = new Audio(); // Element for this play
    letterAudioRef.current = audio; // Track active clip
    audio.preload = "auto"; // Fetch hint
    let settled = false; // Coalesce fallback
    const fallback = () => {
      if (settled) return; // Already handled
      settled = true; // Lock
      if (letterAudioRef.current === audio) letterAudioRef.current = null; // Clear ref
      speak(L); // Audible fallback
    };
    audio.addEventListener("error", fallback, { once: true }); // Decode errors
    audio.src = url; // Bind URL
    audio.load(); // Start load
    void audio
      .play() // Async play
      .then(() => {
        settled = true; // Success path
      })
      .catch(fallback); // Autoplay / IO failure
    audio.addEventListener(
      "ended",
      () => {
        if (letterAudioRef.current === audio) letterAudioRef.current = null; // Natural end cleanup
      },
      { once: true },
    );
  };

  /** Correct-answer feedback: `clap.mp3`, reusing `letterAudioRef` so it replaces any letter clip. */
  const playClap = () => {
    if (typeof window === "undefined") return; // SSR guard
    letterAudioRef.current?.pause(); // Stop letter clip
    letterAudioRef.current = null; // Clear slot
    const audio = new Audio(); // SFX element
    letterAudioRef.current = audio; // Reuse same ref channel
    audio.preload = "auto"; // Prefetch clap
    audio.src = clapUrl; // Static import URL
    audio.load(); // Prepare buffer
    void audio.play().catch(() => {
      if (letterAudioRef.current === audio) letterAudioRef.current = null; // Play failure cleanup
    });
    audio.addEventListener(
      "ended",
      () => {
        if (letterAudioRef.current === audio) letterAudioRef.current = null; // After clap ends
      },
      { once: true },
    );
  };

  /**
   * Static curriculum: `word` + `letters` for tiles, `emoji` for art, `options` (3 choices),
   * `correct` = index of right option in `options`, `color` = Tailwind gradient classes.
   */
  const words = [
    // --- Word slide: CAT ---
    {
      word: "CAT",
      letters: ["C", "A", "T"],
      emoji: "🐱",
      options: ["DOG", "CAT", "BAT"],
      correct: 1,
      color: "from-orange-400 to-red-500",
    },
    // --- Word slide: SUN ---
    {
      word: "SUN",
      letters: ["S", "U", "N"],
      emoji: "☀️",
      options: ["SUN", "RUN", "BUN"],
      correct: 0,
      color: "from-yellow-400 to-orange-500",
    },
    // --- Word slide: BEE ---
    {
      word: "BEE",
      letters: ["B", "E", "E"],
      emoji: "🐝",
      options: ["SEE", "BEE", "TEE"],
      correct: 1,
      color: "from-amber-400 to-yellow-500",
    },
    // --- Word slide: DOG ---
    {
      word: "DOG",
      letters: ["D", "O", "G"],
      emoji: "🐶",
      options: ["DOG", "LOG", "FOG"],
      correct: 0,
      color: "from-blue-400 to-indigo-500",
    },
    // --- Word slide: HAT ---
    {
      word: "HAT",
      letters: ["H", "A", "T"],
      emoji: "🎩",
      options: ["HAT", "BAT", "MAT"],
      correct: 0,
      color: "from-purple-400 to-pink-500",
    },
    // --- Word slide: FISH ---
    {
      word: "FISH",
      letters: ["F", "I", "S", "H"],
      emoji: "🐟",
      options: ["DISH", "FISH", "WISH"],
      correct: 1,
      color: "from-cyan-400 to-blue-500",
    },
    // --- Word slide: BALL ---
    {
      word: "BALL",
      letters: ["B", "A", "L", "L"],
      emoji: "⚽",
      options: ["BALL", "CALL", "TALL"],
      correct: 0,
      color: "from-green-400 to-emerald-500",
    },
    // --- Word slide: CAR ---
    {
      word: "CAR",
      letters: ["C", "A", "R"],
      emoji: "🚗",
      options: ["CAR", "BAR", "FAR"],
      correct: 0,
      color: "from-red-400 to-pink-500",
    },
    // --- Word slide: TREE ---
    {
      word: "TREE",
      letters: ["T", "R", "E", "E"],
      emoji: "🌳",
      options: ["TREE", "FREE", "BEE"],
      correct: 0,
      color: "from-lime-400 to-green-500",
    },
    // --- Word slide: BOOK ---
    {
      word: "BOOK",
      letters: ["B", "O", "O", "K"],
      emoji: "📚",
      options: ["LOOK", "BOOK", "COOK"],
      correct: 1,
      color: "from-indigo-400 to-purple-500",
    },
    // --- Word slide: MOON ---
    {
      word: "MOON",
      letters: ["M", "O", "O", "N"],
      emoji: "🌙",
      options: ["MOON", "SOON", "NOON"],
      correct: 0,
      color: "from-gray-400 to-slate-500",
    },
    // --- Word slide: STAR ---
    {
      word: "STAR",
      letters: ["S", "T", "A", "R"],
      emoji: "⭐",
      options: ["STAR", "CAR", "FAR"],
      correct: 0,
      color: "from-yellow-300 to-yellow-500",
    }
  ];

  const current = words[currentWord]; // Active curriculum object

  /** Quiz tap: wrong → “Oh no!” + retry; correct → clap + short lock + advance or end. */
  const handleAnswer = (idx: number) => {
    if (pendingAdvance) return; // Ignore taps during post-correct lock
    setSelectedAnswer(idx); // Show selection styling
    if (idx === current.correct) {
      window.speechSynthesis.cancel(); // No overlapping speech with clap moment
      playClap(); // Positive SFX
      setPendingAdvance(true); // Lock quiz grid
      setTimeout(() => {
        setCurrentWord((w) => (w < words.length - 1 ? w + 1 : w)); // Next word or stay on last
        setSelectedAnswer(null); // Clear selection for fresh slide
        setPendingAdvance(false); // Re-enable quiz
      }, 1500); // Pause before advancing
    } else {
      speak("Oh no!"); // Gentle wrong feedback; child can retry
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Words activity outer shell */}
      <div className="w-full max-w-sm bg-gradient-to-b from-green-50 to-emerald-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        {/* Card stack */}
        <div className="flex items-center gap-4">
          {/* Header */}
          <button
            type="button"
            onClick={() => navigate("/")} // Home
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-green-600" />
            {/* Back icon */}
          </button>
          <h2 className="text-2xl font-bold text-green-800">Simple Words</h2>
          {/* Title */}
        </div>

        <div className="bg-white rounded-3xl p-8 flex items-center justify-center shadow-md">
          <div className="text-9xl">{current.emoji}</div>
          {/* Illustration for target word */}
        </div>

        <div
          className={`bg-gradient-to-br ${current.color} rounded-3xl p-6 text-center shadow-xl`}
        >
          {/* Word panel: uses per-slide gradient */}
          <div className="text-5xl text-white font-bold mb-4">
            {current.word}
            {/* Uppercase answer word */}
          </div>
          <div className="flex justify-center gap-2 mb-4">
            {current.letters.map((letter, idx) => (
              <button
                type="button"
                key={`${letter}-${idx}`} // Stable across duplicate letters
                onClick={() => playLetterSound(letter)} // Letter mp3
                className="w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-700 shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                aria-label={`Play ${letter} sound`}
              >
                {letter}
                {/* One tile per spelling position */}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => speak(current.word.toLowerCase())} // Whole word TTS
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800">
              Say "{current.word}"
              {/* Label shows uppercase word */}
            </span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-md">
          {/* Multiple choice */}
          <h3 className="text-sm font-bold text-green-700 mb-3 text-center">
            Which word matches?
            {/* Prompt */}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {current.options.map((option, idx) => {
              const isCorrect = idx === current.correct; // Compare to curriculum index
              const isSelected = selectedAnswer === idx; // Child’s last tap

              return (
                <button
                  type="button"
                  key={idx} // Option index key
                  onClick={() => handleAnswer(idx)} // Grade + feedback
                  disabled={pendingAdvance} // Locked after correct until timeout
                  className={`h-14 rounded-xl font-bold text-sm transition-all ${
                    isSelected && isCorrect
                      ? "bg-green-500 text-white scale-105"
                      : isSelected && !isCorrect
                        ? "bg-red-400 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {option}
                  {/* Choice label */}
                  {isSelected && isCorrect && <div className="text-xl">✓</div>}
                  {/* Checkmark on correct pick */}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-2">
          {/* Linear lesson progress (decorative segments) */}
          {words.map((_, idx) => (
            <div
              key={idx} // Word index
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
