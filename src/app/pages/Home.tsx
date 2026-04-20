import { useNavigate } from "react-router";
import { BookOpen, Hash, Type, Pen } from "lucide-react";

const menuItems = [
  {
    path: "/phonics",
    icon: BookOpen,
    label: "Phonics",
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    iconBg: "bg-purple-200",
  },
  {
    path: "/numbers",
    icon: Hash,
    label: "Numbers",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    iconBg: "bg-blue-200",
  },
  {
    path: "/words",
    icon: Type,
    label: "Words",
    color: "bg-gradient-to-br from-green-400 to-green-600",
    iconBg: "bg-green-200",
  },
  {
    path: "/tracing",
    icon: Pen,
    label: "Tracing",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    iconBg: "bg-orange-200",
  },
] as const;

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-yellow-100 to-pink-100 rounded-3xl p-6 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="text-5xl">🎓</div>
          <h1 className="text-2xl font-bold text-purple-800">Let's Learn!</h1>
          <p className="text-sm text-purple-600">Choose an activity</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`${item.color} rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform active:scale-95`}
              >
                <div
                  className={`w-16 h-16 ${item.iconBg} rounded-full flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon className="w-8 h-8 text-gray-700" />
                </div>
                <div className="text-white font-bold text-lg">{item.label}</div>
              </button>
            );
          })}
        </div>

        <div className="bg-white/80 rounded-2xl p-4 text-center">
          <div className="text-xs text-purple-600 mb-2">Today's Progress</div>
          <div className="flex gap-2 justify-center">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
