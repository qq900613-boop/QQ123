import { useState, useEffect } from "react";
import { getDrinks, placeOrder, seedDrinksIfEmpty } from "./dbService";
import { Drink, CartItem, CATEGORIES } from "./types";
import WelcomeBanner from "./components/WelcomeBanner";
import DrinkCard from "./components/DrinkCard";
import DrinkModal from "./components/DrinkModal";
import CartDrawer from "./components/CartDrawer";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import { Coffee, ShieldCheck, ShoppingCart, Activity, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [view, setView] = useState<"front" | "admin">("front");
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("全部 (All)");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected Drink for custom options modal
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  // Admin authentication state (stored in session memory so page refresh requires login, which matches security rules)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Load Drinks menu on Mount
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);
        // Seed drinks if collection is empty, then return all items
        const menu = await seedDrinksIfEmpty();
        setDrinks(menu);
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
  }, [view]); // Reload/sync menu when switching back from admin settings to front

  // Sync menu list
  const handleReloadMenu = async () => {
    setLoading(true);
    const menu = await getDrinks();
    setDrinks(menu);
    setLoading(false);
  };

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCart(prevCart => {
      // Check if an item with exact same configurations (sugar, ice, toppings) already exists
      const existingIndex = prevCart.findIndex(item => 
        item.drinkId === newItem.drinkId &&
        item.sugar === newItem.sugar &&
        item.ice === newItem.ice &&
        JSON.stringify(item.toppings.sort()) === JSON.stringify(newItem.toppings.sort())
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      } else {
        return [...prevCart, newItem];
      }
    });
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(index);
      return;
    }
    setCart(prev => prev.map((item, idx) => idx === index ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Submit Order directly to Firestore
  const handleSubmitOrder = async (department: string, userName: string) => {
    const totalItemsPrice = cart.reduce((total, item) => {
      const itemUnitPrice = item.price + item.toppingPrice;
      return total + itemUnitPrice * item.quantity;
    }, 0);

    const orderData = {
      department,
      userName,
      items: cart,
      totalPrice: totalItemsPrice
    };

    return await placeOrder(orderData);
  };

  const filteredDrinks = drinks.filter(drink => {
    if (selectedCategory === "全部 (All)") return true;
    return drink.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-hospital-100 selection:text-hospital-800">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100/80 shadow-xs px-4 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView("front")}>
            <div className="bg-hospital-600 text-white p-2.5 rounded-2xl shadow-xs">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-slate-800 tracking-tight text-base md:text-lg">
                  光田綜合醫院
                </span>
                <span className="bg-hospital-50 text-hospital-700 text-5xs font-bold px-2 py-0.5 rounded-md border border-hospital-100 uppercase tracking-widest font-mono">
                  PROTOTYPE
                </span>
              </div>
              <p className="text-4xs text-slate-400 font-mono tracking-wider -mt-0.5">
                KUANG TIEN GENERAL HOSPITAL ‧ ONLINE DRINKS
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-2">
            {view === "front" ? (
              <button
                onClick={() => setView("admin")}
                className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-hospital-600 hover:bg-hospital-50 text-xs py-2 px-3.5 rounded-xl font-medium transition-all"
              >
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">進入後台管理</span>
                <span className="sm:hidden">後台</span>
              </button>
            ) : (
              <button
                onClick={() => setView("front")}
                className="inline-flex items-center gap-1.5 bg-hospital-600 text-white hover:bg-hospital-700 text-xs py-2 px-3.5 rounded-xl font-medium transition-all shadow-sm shadow-hospital-600/10"
              >
                <Coffee size={14} />
                <span>回前台點餐</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {view === "front" ? (
            /* FRONT-END CLIENT ORDERING VIEW */
            <motion.div
              key="front-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
            >
              {/* Left & Middle Column (Banner, Category filter, Drinks menu) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Welcome Hero Card */}
                <WelcomeBanner />

                {/* Categories Tab Selector */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                      <Layers size={16} className="text-hospital-500" />
                      <span>飲品分類選單</span>
                    </h2>

                    <button 
                      onClick={handleReloadMenu}
                      className="text-slate-400 hover:text-hospital-600 text-4xs flex items-center gap-1 bg-slate-100 py-1 px-2.5 rounded-md border border-slate-200/50 transition-all font-medium"
                      title="重整飲品菜單"
                    >
                      <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                      <span>同步菜單</span>
                    </button>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map((category) => {
                      const isActive = selectedCategory === category;
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`text-2xs py-2 px-3.5 rounded-xl font-medium whitespace-nowrap border shrink-0 transition-all ${
                            isActive
                              ? "bg-hospital-600 text-white border-hospital-600 shadow-xs shadow-hospital-600/10"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {category.split(" (")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drinks menu list */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center min-h-[250px] text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-hospital-500 mb-2" />
                    <span className="text-xs">同步光田專屬特調飲品中...</span>
                  </div>
                ) : filteredDrinks.length === 0 ? (
                  <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
                    <Coffee size={36} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-xs font-semibold">該類別目前無供應飲品</p>
                    <p className="text-3xs">可以嘗試點選其他分類看看喔！</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDrinks.map((drink) => (
                      <DrinkCard
                        key={drink.id}
                        drink={drink}
                        onSelect={setSelectedDrink}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column (Live Cart Drawer) */}
              <div className="lg:col-span-1 lg:sticky lg:top-24">
                <CartDrawer
                  cart={cart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onSubmitOrder={handleSubmitOrder}
                  onClearCart={handleClearCart}
                />
              </div>

            </motion.div>
          ) : (
            /* BACK-END ADMINISTRATOR VIEW */
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {isAdminAuthenticated ? (
                /* Authenticated Dashboard */
                <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
              ) : (
                /* Password Entry Gate */
                <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Drink Customization Modal Popup */}
      <AnimatePresence>
        {selectedDrink && (
          <DrinkModal
            drink={selectedDrink}
            onClose={() => setSelectedDrink(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* Aesthetic Footer */}
      <footer className="mt-12 bg-white border-t border-slate-100 py-6 text-center text-4xs text-slate-400 font-mono tracking-widest shrink-0">
        <p>🏥 光田綜合醫院 ‧ 智慧醫療與資訊部 監製 ‧ 飲料點訂雛形 🏥</p>
        <p className="mt-1 text-slate-300">© {new Date().getFullYear()} Kuang Tien General Hospital. All rights reserved.</p>
      </footer>

    </div>
  );
}
