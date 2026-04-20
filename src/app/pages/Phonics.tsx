import { ArrowLeft, Volume2 } from "lucide-react"; // Navigation + speaker UI
import { useRef, useState } from "react"; // Letter clip ref + carousel index
import { useNavigate } from "react-router"; // Back to home

/**
 * Learn Phonics — letter carousel: big glyph, letter sound, and example words.
 *
 * **Audio**
 * - Hero “Say sound”: `src/app/sounds/{Letter}.mp3` (Vite glob below); TTS fallback `${letter}. ${phonemeHint}`.
 * - Example row speakers: TTS for the vocabulary word only (`exampleWord` strips the leading emoji token).
 * - `letterAudioRef` is paused whenever `speak` runs so MP3 and speech do not overlap.
 *
 * **Data** — `letters[]`: `letter` (A–Z), `sound` UI label / fallback hint, `examples` like `🍎 Apple`, Tailwind `color`.
 */
const letterSoundUrls = import.meta.glob<string>("../sounds/*.mp3", {
  eager: true, // Resolve all mp3 URLs at bundle time
  query: "?url", // Vite: import as string URL
  import: "default", // Default export is the URL string
});

/** Bundled URL for `Letter.mp3` (paths are build-resolved; add files under `src/app/sounds/` as needed). */
const letterSoundUrl = (letter: string): string | undefined => {
  const suffix = `${letter}.mp3`; // Filename for this letter’s clip
  for (const [path, url] of Object.entries(letterSoundUrls)) {
    if (path.endsWith(suffix)) return url; // First matching bundle path wins
  }
  return undefined; // No clip on disk for this letter
};

/** Text after the emoji, e.g. "🍎 Apple" → "Apple", "🍦 Ice cream" → "Ice cream". */
const exampleWord = (example: string) =>
  example.split(/\s+/).slice(1).join(" ").trim(); // Drop leading emoji token; join rest as phrase

export default function Phonics() {
  const navigate = useNavigate(); // Programmatic routing
  /** Index into `letters`. */
  const [currentLetter, setCurrentLetter] = useState(0);
  /** Active letter MP3, if any; cleared when TTS runs. */
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);

  /** TTS after stopping any letter clip. */
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return; // Guard
    letterAudioRef.current?.pause(); // Stop MP3 before TTS
    letterAudioRef.current = null; // Drop ref so ended handler does not clash
    window.speechSynthesis.cancel(); // Clear queued speech
    const utterance = new SpeechSynthesisUtterance(text); // New utterance instance
    utterance.lang = "en-US"; // Locale
    utterance.rate = 0.9; // Kid-friendly pacing
    window.speechSynthesis.speak(utterance); // Speak now
  };

  /** Play `{Letter}.mp3` or TTS letter + `phonemeHint` on error/missing file. */
  const playLetterSound = (letter: string, phonemeHint: string) => {
    if (typeof window === "undefined") return; // SSR guard
    window.speechSynthesis.cancel(); // No TTS while starting clip
    letterAudioRef.current?.pause(); // Only one clip at a time
    const url = letterSoundUrl(letter); // Bundled mp3 URL or undefined
    if (!url) {
      speak(`${letter}. ${phonemeHint}`); // TTS fallback path
      return;
    }
    const audio = new Audio(); // New HTMLAudioElement
    letterAudioRef.current = audio; // Track for pause coordination
    audio.preload = "auto"; // Hint to fetch early
    let settled = false; // Avoid double fallback
    const fallback = () => {
      if (settled) return; // Already handled
      settled = true; // Mark done
      if (letterAudioRef.current === audio) letterAudioRef.current = null; // Clear ref
      speak(`${letter}. ${phonemeHint}`); // Audible fallback
    };
    audio.addEventListener("error", fallback, { once: true }); // Decode/network errors
    audio.src = url; // Point at bundled file
    audio.load(); // Begin loading
    void audio
      .play() // May reject (autoplay policies)
      .then(() => {
        settled = true; // Play started OK
      })
      .catch(fallback); // Permission / autoplay failure → TTS
    audio.addEventListener(
      "ended",
      () => {
        if (letterAudioRef.current === audio) letterAudioRef.current = null; // Cleanup after natural end
      },
      { once: true },
    );
  };

  /** Speak the example vocabulary (not the letter clip). */
  const speakExampleWord = (example: string) => {
    const word = exampleWord(example); // Strip emoji label
    if (word) speak(word); // Only speak non-empty remainder
  };

  /** Curriculum: one entry per letter A–Z order in the UI. */
  const letters = [
    // --- Letter A curriculum ---
    {
      letter: "A",
      sound: "Ah",
      examples: ["🍎 Apple", "🐜 Ant"],
      color: "from-red-400 to-pink-500",
    },
    // --- Letter B curriculum ---
    {
      letter: "B",
      sound: "Buh",
      examples: ["🎈 Balloon", "🐝 Bee"],
      color: "from-blue-400 to-indigo-500",
    },
    // --- Letter C curriculum ---
    {
      letter: "C",
      sound: "Kuh",
      examples: ["🐱 Cat", "🚗 Car"],
      color: "from-green-400 to-teal-500",
    },
    // --- Letter D curriculum ---
    {
      letter: "D",
      sound: "Duh",
      examples: ["🐕 Dog", "🦆 Duck"],
      color: "from-yellow-400 to-orange-500",
    },
    // --- Letter E curriculum ---
    {
      letter: "E",
      sound: "Ah",
      examples: ["🥚 Egg", "🐘 Elephant"],
      color: "from-purple-400 to-pink-500",
    },
    // --- Letter F curriculum ---
    {
      letter: "F",
      sound: "Fuh",
      examples: ["🐟 Fish", "🔥 Fire"],
      color: "from-cyan-400 to-blue-500",
    },
    // --- Letter G curriculum ---
    {
      letter: "G",
      sound: "Guh",
      examples: ["🦒 Giraffe", "🍇 Grapes"],
      color: "from-green-500 to-lime-500",
    },
    // --- Letter H curriculum ---
    {
      letter: "H",
      sound: "Huh",
      examples: ["🏠 House", "🐎 Horse"],
      color: "from-orange-400 to-red-500",
    },
    // --- Letter I curriculum ---
    {
      letter: "I",
      sound: "Ih",
      examples: ["🍦 Ice cream", "🐛 Insect"],
      color: "from-indigo-400 to-purple-500",
    },
    // --- Letter J curriculum ---
    {
      letter: "J",
      sound: "Juh",
      examples: ["🧃 Juice", "🐆 Jaguar"],
      color: "from-pink-400 to-rose-500",
    },
    // --- Letter K curriculum ---
    {
      letter: "K",
      sound: "Kuh",
      examples: ["🔑 Key", "🪁 Kite"],
      color: "from-teal-400 to-green-500",
    },
    // --- Letter L curriculum ---
    {
      letter: "L",
      sound: "Luh",
      examples: ["🦁 Lion", "🍋 Lemon"],
      color: "from-yellow-300 to-yellow-500",
    },
    // --- Letter M curriculum ---
    {
      letter: "M",
      sound: "Mmm",
      examples: ["🐒 Monkey", "🥛 Milk"],
      color: "from-blue-300 to-blue-500",
    },
    // --- Letter N curriculum ---
    {
      letter: "N",
      sound: "Nnn",
      examples: ["👃 Nose", "🪺 Nest"],
      color: "from-gray-400 to-gray-600",
    },
    // --- Letter O curriculum ---
    {
      letter: "O",
      sound: "Ah",
      examples: ["🍊 Orange", "🐙 Octopus"],
      color: "from-orange-400 to-amber-500",
    },
    // --- Letter P curriculum ---
    {
      letter: "P",
      sound: "Puh",
      examples: ["🐧 Penguin", "🍍 Pineapple"],
      color: "from-emerald-400 to-green-600",
    },
    // --- Letter Q curriculum ---
    {
      letter: "Q",
      sound: "Kwuh",
      examples: ["👑 Queen", "❓ Question"],
      color: "from-violet-400 to-purple-600",
    },
    // --- Letter R curriculum ---
    {
      letter: "R",
      sound: "Rrr",
      examples: ["🐇 Rabbit", "🌈 Rainbow"],
      color: "from-red-400 to-orange-500",
    },
    // --- Letter S curriculum ---
    {
      letter: "S",
      sound: "Sss",
      examples: ["🐍 Snake", "☀️ Sun"],
      color: "from-yellow-400 to-amber-500",
    },
    // --- Letter T curriculum ---
    {
      letter: "T",
      sound: "Tuh",
      examples: ["🐯 Tiger", "🌳 Tree"],
      color: "from-green-400 to-emerald-600",
    },
    // --- Letter U curriculum ---
    {
      letter: "U",
      sound: "Uh",
      examples: ["☂️ Umbrella", "🦄 Unicorn"],
      color: "from-blue-400 to-cyan-500",
    },
    // --- Letter V curriculum ---
    {
      letter: "V",
      sound: "Vuh",
      examples: ["🎻 Violin", "🌋 Volcano"],
      color: "from-purple-400 to-indigo-600",
    },
    // --- Letter W curriculum ---
    {
      letter: "W",
      sound: "Wuh",
      examples: ["🍉 Watermelon", "🐋 Whale"],
      color: "from-sky-400 to-blue-600",
    },
    // --- Letter X curriculum ---
    {
      letter: "X",
      sound: "Ks",
      examples: ["❌ X-ray", "🦊 Fox"],
      color: "from-gray-400 to-slate-600",
    },
    // --- Letter Y curriculum ---
    {
      letter: "Y",
      sound: "Yuh",
      examples: ["🧶 Yarn", "🛳️ Yacht"],
      color: "from-pink-300 to-pink-500",
    },
    // --- Letter Z curriculum ---
    {
      letter: "Z",
      sound: "Zzz",
      examples: ["🦓 Zebra", "⚡ Zigzag"],
      color: "from-indigo-400 to-purple-500",
    },
  ];

  const current = letters[currentLetter]; // Slide derived from index

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Centered phonics shell */}
      <div className="w-full max-w-sm bg-gradient-to-b from-blue-50 to-purple-50 rounded-3xl p-6 space-y-6 shadow-2xl">
        {/* Main card */}
        <div className="flex items-center gap-4">
          {/* Top row */}
          <button
            type="button" // Semantic control
            onClick={() => navigate("/")} // Home (hash root)
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-purple-600" />
            {/* Back chevron */}
          </button>
          <h2 className="text-2xl font-bold text-purple-800">Learn Phonics</h2>
          {/* Title */}
        </div>

        <div
          className={`bg-gradient-to-br ${current.color} rounded-3xl p-8 text-center shadow-xl`}
        >
          {/* Hero uses per-letter Tailwind gradient */}
          <div className="text-8xl text-white font-bold mb-4">
            {current.letter}
            {/* Huge target letter */}
          </div>
          <button
            type="button"
            onClick={() => playLetterSound(current.letter, current.sound)} // MP3 or TTS fallback
            className="bg-white/90 px-6 py-3 rounded-full flex items-center gap-2 mx-auto hover:scale-105 transition-transform shadow-lg"
          >
            <Volume2 className="w-5 h-5 text-purple-600" />
            {/* Volume glyph */}
            <span className="font-bold text-purple-800">
              Say "{current.sound}"
              {/* UI echoes phoneme label */}
            </span>
          </button>
        </div>

        <div className="space-y-3">
          {/* Example word list */}
          <h3 className="text-sm font-bold text-purple-700">
            Words with {current.letter}:
            {/* Dynamic heading with active letter */}
          </h3>
          {current.examples.map((example) => (
            <div
              key={example} // String key (unique per row string)
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl">{example.split(" ")[0]}</div>
              {/* First token = emoji */}
              <div className="text-xl font-bold text-gray-700">
                {exampleWord(example)}
                {/* Remaining tokens = word text */}
              </div>
              <button
                type="button"
                onClick={() => speakExampleWord(example)} // TTS full word only
                className="ml-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"
              >
                <Volume2 className="w-5 h-5 text-purple-600" />
                {/* Row speaker */}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {/* Pagination: one dot per letter */}
          {letters.map((_, idx) => (
            <button
              type="button"
              key={idx} // Stable order index
              onClick={() => setCurrentLetter(idx)} // Jump to letter slide
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
