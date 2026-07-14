import { Drink } from "../types";
import { Coffee, Flame, Plus, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface DrinkCardProps {
  drink: Drink;
  onSelect: (drink: Drink) => void;
  key?: string | number;
}

export default function DrinkCard({ drink, onSelect }: DrinkCardProps) {
  const isCoffee = drink.category.includes("咖啡") || drink.name.toLowerCase().includes("latte") || drink.name.toLowerCase().includes("americano");
  
  return (
    <motion.div
      whileHover={drink.available ? { y: -4, scale: 1.01 } : {}}
      whileTap={drink.available ? { scale: 0.98 } : {}}
      onClick={() => drink.available && onSelect(drink)}
      id={`drink-card-${drink.id}`}
      className={`relative bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full ${
        drink.available ? "cursor-pointer" : "opacity-60 cursor-not-allowed select-none"
      }`}
    >
      {/* Visual Header / Thumbnail */}
      <div className="relative h-44 w-full bg-slate-50 overflow-hidden">
        {drink.image ? (
          <img
            src={drink.image}
            alt={drink.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Failback if Unsplash or external link doesn't load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Dynamic Category Badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-2xs font-semibold text-hospital-700 shadow-xs">
          {drink.category.split(" (")[0]}
        </span>

        {/* Hot badge indicator */}
        {drink.name.includes("熱") || drink.description.includes("熱") ? (
          <span className="absolute top-3 right-3 bg-orange-500 text-white p-1 rounded-full shadow-xs">
            <Flame size={12} className="fill-orange-100 stroke-none" />
          </span>
        ) : null}

        {/* Unavailable overlay */}
        {!drink.available && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
            <AlertCircle size={24} className="text-amber-400 mb-1" />
            <span className="font-display font-bold tracking-wider text-sm">今日已售完</span>
            <span className="text-3xs text-slate-300 mt-0.5">Sold Out</span>
          </div>
        )}
      </div>

      {/* Drink Details */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="font-display font-semibold text-base text-slate-800 group-hover:text-hospital-600 transition-colors line-clamp-1">
            {drink.name.split(" (")[0]}
          </h3>
          <span className="font-mono text-base font-bold text-hospital-600 shrink-0">
            ${drink.price}
          </span>
        </div>

        {drink.name.includes("(") && (
          <p className="text-4xs font-mono text-slate-400 -mt-1 mb-2">
            {drink.name.substring(drink.name.indexOf("(") + 1, drink.name.length - 1)}
          </p>
        )}

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 mb-4">
          {drink.description || "美味現調飲品，冷熱皆宜。"}
        </p>

        {/* Footer Interaction */}
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
          <span className="text-4xs font-mono text-slate-400 flex items-center gap-1">
            {isCoffee ? <Coffee size={12} className="text-amber-700" /> : <Sparkles size={11} className="text-yellow-500" />}
            {isCoffee ? "咖啡豆調配" : "新鮮茶底"}
          </span>

          {drink.available ? (
            <button
              type="button"
              className="bg-hospital-50 hover:bg-hospital-600 hover:text-white text-hospital-600 p-2 rounded-xl transition-all duration-300 flex items-center justify-center"
            >
              <Plus size={16} />
            </button>
          ) : (
            <span className="text-3xs font-medium text-slate-400 py-1 px-2.5 bg-slate-100 rounded-lg">
              補貨中
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
