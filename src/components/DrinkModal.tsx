import React, { useState } from "react";
import { Drink, CartItem, ICE_OPTIONS, SUGAR_OPTIONS, TOPPING_OPTIONS } from "../types";
import { X, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DrinkModalProps {
  drink: Drink;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function DrinkModal({ drink, onClose, onAddToCart }: DrinkModalProps) {
  const [selectedSugar, setSelectedSugar] = useState(SUGAR_OPTIONS[2]); // Half Sugar (50%) default
  const [selectedIce, setSelectedIce] = useState(ICE_OPTIONS[1]);     // Easy Ice (30%) default
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const handleToppingToggle = (toppingName: string) => {
    setSelectedToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName) 
        : [...prev, toppingName]
    );
  };

  // Calculate topping price
  const toppingPrice = selectedToppings.reduce((total, toppingName) => {
    const topping = TOPPING_OPTIONS.find(t => t.name === toppingName);
    return total + (topping ? topping.price : 0);
  }, 0);

  const unitPrice = drink.price + toppingPrice;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart({
      drinkId: drink.id,
      drinkName: drink.name,
      price: drink.price,
      sugar: selectedSugar,
      ice: selectedIce,
      toppings: selectedToppings,
      toppingPrice,
      quantity,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" 
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
      >
        {/* Sticky Header with image */}
        <div className="relative h-48 md:h-56 bg-slate-100 shrink-0">
          {drink.image ? (
            <img 
              src={drink.image} 
              alt={drink.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-teal-500 to-hospital-700 flex items-center justify-center">
              <span className="font-display font-extrabold text-3xl text-white">光田精選</span>
            </div>
          )}
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-xs transition-colors"
          >
            <X size={18} />
          </button>

          {/* Drink Name overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-slate-950/80 via-slate-950/40 to-transparent p-5 text-white">
            <span className="text-4xs font-mono tracking-wider uppercase bg-hospital-500 text-white px-2 py-0.5 rounded-md font-bold mb-1 inline-block">
              {drink.category.split(" (")[0]}
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-display">{drink.name.split(" (")[0]}</h2>
            <p className="text-xs text-slate-300 font-mono mt-0.5">${drink.price} NTD 起</p>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Sugar Options */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <span>甜度選擇</span>
              <span className="text-2xs font-normal text-slate-400">Sugar Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SUGAR_OPTIONS.map((sugar) => {
                const isActive = selectedSugar === sugar;
                return (
                  <button
                    key={sugar}
                    type="button"
                    onClick={() => setSelectedSugar(sugar)}
                    className={`text-xs py-2 px-1 rounded-xl font-medium border text-center transition-all ${
                      isActive 
                        ? "bg-hospital-500 text-white border-hospital-500 shadow-sm shadow-hospital-500/20" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {sugar.split(" (")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ice Options */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <span>冰度選擇</span>
              <span className="text-2xs font-normal text-slate-400">Ice Level</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {ICE_OPTIONS.map((ice) => {
                const isActive = selectedIce === ice;
                return (
                  <button
                    key={ice}
                    type="button"
                    onClick={() => setSelectedIce(ice)}
                    className={`text-2xs sm:text-xs py-2 px-1 rounded-xl font-medium border text-center transition-all ${
                      isActive 
                        ? "bg-hospital-500 text-white border-hospital-500 shadow-sm shadow-hospital-500/20" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {ice.split(" (")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toppings (Optional) */}
          <div className="space-y-2.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <span>加料選項 (可複選)</span>
              <span className="text-2xs font-normal text-slate-400">Add-on Toppings</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOPPING_OPTIONS.map((topping) => {
                const isSelected = selectedToppings.includes(topping.name);
                return (
                  <button
                    key={topping.name}
                    type="button"
                    onClick={() => handleToppingToggle(topping.name)}
                    className={`text-xs py-2.5 px-3 rounded-xl font-medium border flex justify-between items-center transition-all ${
                      isSelected 
                        ? "bg-teal-50/80 text-hospital-700 border-hospital-500 shadow-xs" 
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{topping.name.split(" (")[0]}</span>
                    <span className={`text-3xs font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                      isSelected ? "bg-hospital-500 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      +${topping.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <span>備註 / 特殊需求</span>
              <span className="text-2xs font-normal text-slate-400">Special Notes</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：珍珠多一點、常溫微熱、去冰要微碎冰..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500"
            />
          </div>

          {/* Quantity Counter */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-700 block">購買數量</span>
              <span className="text-3xs text-slate-400 block font-mono">Select Quantity</span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Minus size={14} />
              </button>
              
              <span className="w-8 text-center font-display font-extrabold text-sm text-slate-800">
                {quantity}
              </span>
              
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </form>

        {/* Footer with Total and Add Button */}
        <div className="bg-slate-50 border-t border-slate-100 p-5 shrink-0 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-3xs text-slate-400 font-mono uppercase tracking-wider block">總金額 Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-800 font-mono">${totalPrice}</span>
              <span className="text-3xs text-slate-500 font-sans">NTD</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="flex-1 bg-hospital-600 hover:bg-hospital-700 text-white font-medium text-xs py-3 px-5 rounded-xl shadow-md shadow-hospital-600/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={15} />
            <span>加入點單</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
