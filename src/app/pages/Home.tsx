import { useNavigate } from "react-router"; // Programmatic navigation (hash routes: /#/…)
import { BookOpen, Hash, Type, Pen } from "lucide-react"; // Icons for each activity tile

/**
 * Home — activity hub. Each `path` must match a route in `src/app/routes.ts` (e.g. `/numbers` → Numbers).
 * The app uses hash routing (`/#/numbers`, etc.) so the same routes work in the Capacitor Android WebView.
 * The progress row is decorative UI only (not wired to persistence yet).
 */
const menuItems = [
  {
    path: "/phonics", // Hash URL becomes /#/phonics
    icon: BookOpen, // Lucide book icon
    label: "Phonics", // Visible title on tile
    color: "bg-gradient-to-br from-purple-400 to-purple-600", // Tile background gradient
    iconBg: "bg-purple-200", // Circular badge behind icon
  },
  {
    path: "/numbers", // Opens Numbers activity
    icon: Hash, // Hash / number symbol
    label: "Numbers",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    iconBg: "bg-blue-200",
  },
  {
    path: "/words", // Simple Words quiz
    icon: Type, // Typography icon
    label: "Words",
    color: "bg-gradient-to-br from-green-400 to-green-600",
    iconBg: "bg-green-200",
  },
  {
    path: "/tracing", // Letter/number tracing canvas
    icon: Pen, // Pen / draw icon
    label: "Tracing",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    iconBg: "bg-orange-200",
  },
] as const; // Freeze tuple: literal paths + icon component types

/** Renders the 2×2 launcher and navigates with `react-router`. */
export default function Home() {
  const navigate = useNavigate(); // Hook: push path onto hash history

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* Full-viewport centered column with padding */}
      <div className="w-full max-w-sm bg-gradient-to-b from-yellow-100 to-pink-100 rounded-3xl p-6 space-y-6 shadow-2xl">
        {/* Card: max width, soft gradient, vertical rhythm, drop shadow */}
        <div className="text-center space-y-2">
          {/* Header stack */}
          <div className="text-5xl">🎓</div>
          {/* App mascot emoji */}
          <h1 className="text-2xl font-bold text-purple-800">Let's Learn!</h1>
          {/* Main title */}
          <p className="text-sm text-purple-600">Choose an activity</p>
          {/* Subtitle */}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Two-column grid of activity buttons */}
          {menuItems.map((item) => {
            const Icon = item.icon; // Lucide icon as component (capitalized for JSX)
            return (
              <button
                type="button" // Not a form submit button
                key={item.path} // Stable list key
                onClick={() => navigate(item.path)} // Go to this activity
                className={`${item.color} rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform active:scale-95`}
              >
                {/* Per-item gradient + hover/active micro-interactions */}
                <div
                  className={`w-16 h-16 ${item.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}
                >
                  {/* Icon badge circle */}
                  <Icon className="w-8 h-8 text-gray-700" />
                  {/* Rendered Lucide glyph */}
                </div>
                <div className="text-white font-bold text-lg">{item.label}</div>
                {/* Human-readable activity name */}
              </button>
            );
          })}
        </div>

        <div className="bg-white/80 rounded-2xl p-4 text-center">
          {/* Decorative progress (not connected to real state) */}
          <div className="text-xs text-purple-600 mb-2">Today's Progress</div>
          {/* Section label */}
          <div className="flex gap-2 justify-center">
            {/* Horizontal row of faux progress dots */}
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            {/* Completed placeholder 1 */}
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            {/* Completed placeholder 2 */}
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            {/* Incomplete placeholder 3 */}
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            {/* Incomplete placeholder 4 */}
          </div>
        </div>
      </div>
    </div>
  );
}
