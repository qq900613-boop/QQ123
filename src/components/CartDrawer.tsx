import React, { useState } from "react";
import { CartItem, DEPARTMENTS } from "../types";
import { Trash2, ShoppingCart, User, Building2, ChevronRight, CheckCircle2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: (department: string, userName: string) => Promise<{ orderNo: string }>;
  onClearCart: () => void;
}

export default function CartDrawer({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearCart
}: CartDrawerProps) {
  const [department, setDepartment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderNo, setSuccessOrderNo] = useState<string | null>(null);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const itemUnitPrice = item.price + item.toppingPrice;
    return total + itemUnitPrice * item.quantity;
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!department) {
      alert("請選擇您的科室單位！");
      return;
    }
    if (!userName.trim()) {
      alert("請輸入訂購人姓名！");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onSubmitOrder(department, userName);
      setSuccessOrderNo(res.orderNo);
      onClearCart();
    } catch (err) {
      console.error(err);
      alert("送出訂單時發生錯誤，請稍後再試！");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOrderNo(null);
    setDepartment("");
    setUserName("");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 shrink-0">
        <div className="bg-hospital-50 text-hospital-600 p-2 rounded-xl">
          <ShoppingCart size={18} />
        </div>
        <h2 className="font-display font-extrabold text-base text-slate-800">
          我的訂購單
        </h2>
        {cart.length > 0 && (
          <span className="bg-hospital-600 text-white font-mono font-bold text-2xs px-2 py-0.5 rounded-full ml-auto animate-bounce">
            {totalItems}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {successOrderNo ? (
          /* Success Panel */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle2 size={36} className="animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <span className="text-3xs uppercase tracking-widest font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md">
                點單送出成功
              </span>
              <h3 className="text-lg font-bold text-slate-800 font-display">光田同仁，飲品準備中！</h3>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full space-y-2 font-mono text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">訂單編號:</span>
                <span className="font-bold text-slate-700 text-sm">{successOrderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">指定科室:</span>
                <span className="font-medium text-slate-700">{department.split(" (")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">訂購姓名:</span>
                <span className="font-medium text-slate-700">{userName}</span>
              </div>
            </div>

            <p className="text-2xs text-slate-400 leading-relaxed max-w-xs">
              請記下您的【訂單編號】，方便在醫護站或護理站與外送人員核對點單內容。
            </p>

            <button
              onClick={handleCloseSuccess}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium text-xs py-2.5 rounded-xl transition-all"
            >
              繼續點餐
            </button>
          </motion.div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3"
          >
            <ShoppingCart size={36} className="stroke-1 text-slate-300" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500">點單尚無飲品</p>
              <p className="text-3xs max-w-[200px] leading-relaxed">
                點擊左側飲品卡片，自由調製您的专属甜度冰度與配料。
              </p>
            </div>
          </motion.div>
        ) : (
          /* Cart List & Form */
          <motion.div
            key="cart-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-6">
              {cart.map((item, index) => {
                const itemUnitPrice = item.price + item.toppingPrice;
                return (
                  <div
                    key={`${item.drinkId}-${index}`}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex flex-col gap-2 relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-slate-800 font-display">
                          {item.drinkName.split(" (")[0]}
                        </h4>
                        <div className="flex flex-wrap gap-1 text-4xs font-medium text-slate-500">
                          <span className="bg-white border border-slate-100 px-1 py-0.2 rounded-sm text-hospital-600">
                            {item.sugar.split(" (")[0]}
                          </span>
                          <span className="bg-white border border-slate-100 px-1 py-0.2 rounded-sm text-hospital-600">
                            {item.ice.split(" (")[0]}
                          </span>
                          {item.toppings.map(t => (
                            <span key={t} className="bg-amber-50 text-amber-700 px-1 py-0.2 rounded-sm">
                              +{t.split(" (")[0]}
                            </span>
                          ))}
                        </div>
                        {item.notes && (
                          <p className="text-4xs text-slate-400 font-light italic mt-1 bg-white p-1 rounded-md border border-dashed border-slate-100">
                            備註: {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Quantity Control & Price */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100/50 mt-1">
                      <div className="flex items-center gap-2 bg-white border border-slate-150 rounded-lg p-0.5 scale-90 origin-left">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-bold text-slate-700 text-xs">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold font-mono text-slate-700">
                        ${itemUnitPrice * item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-5 space-y-4 shrink-0">
              
              {/* Department */}
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Building2 size={12} className="text-slate-400" />
                  <span>指定送達科室 / 護理站 *</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500 bg-white"
                >
                  <option value="">-- 請選擇科室單位 --</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-600 flex items-center gap-1.5">
                  <User size={12} className="text-slate-400" />
                  <span>點購同仁姓名 *</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="例如：王曉明 護理師"
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/20 focus:border-hospital-500"
                />
              </div>

              {/* Summary and submit */}
              <div className="bg-slate-50 rounded-2xl p-4 mt-2 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">飲品總計</span>
                  <span className="font-semibold text-slate-700">{totalItems} 杯</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">應付總額</span>
                  <span className="font-extrabold text-sm text-hospital-600 font-mono">${totalPrice} NTD</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-hospital-600 hover:bg-hospital-700 disabled:bg-slate-300 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-hospital-600/10 flex items-center justify-center gap-2 mt-1"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>正在送出點單...</span>
                    </>
                  ) : (
                    <>
                      <span>確認送出醫護點單</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
