import { Heart, Coffee, ShieldAlert } from "lucide-react";

export default function WelcomeBanner() {
  return (
    <div className="bg-linear-to-r from-hospital-600 to-hospital-800 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-8">
      {/* Abstract circles for dynamic modern background */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-teal-100 mb-4 animate-pulse">
          <Heart size={12} className="fill-red-400 stroke-none" />
          <span>光田內部專屬 ‧ 同仁辛苦了！</span>
        </div>
        
        <h1 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2">
          光田綜合醫院 ‧ 醫護專屬點餐系統
        </h1>
        
        <p className="text-teal-50/95 text-sm md:text-base leading-relaxed font-light mb-4">
          守護病患健康的同時，也別忘了滋潤身心。線上快速點餐，無須註冊，填寫科室與姓名即可送出！我們將儘速為您製作與派送。
        </p>

        <div className="flex flex-wrap gap-4 text-xs text-teal-100/90 font-mono">
          <div className="flex items-center gap-1.5 bg-black/10 rounded-lg px-2.5 py-1.5">
            <Coffee size={14} />
            <span>自選冰度甜度與配料</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/10 rounded-lg px-2.5 py-1.5">
            <ShieldAlert size={14} className="text-teal-200" />
            <span>後台即時統整團購數量</span>
          </div>
        </div>
      </div>
    </div>
  );
}
