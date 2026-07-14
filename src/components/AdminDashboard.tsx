import React, { useState, useEffect } from "react";
import { 
  getDrinks, 
  addDrink, 
  updateDrink, 
  deleteDrink, 
  subscribeToOrders, 
  updateOrderStatus, 
  seedDrinksIfEmpty 
} from "../dbService";
import { Drink, Order, DEPARTMENTS, CATEGORIES } from "../types";
import { 
  ClipboardList, 
  UtensilsCrossed, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Eye, 
  LogOut, 
  Grid, 
  LayoutList,
  FlameKindling
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  onLogout: () => void;
}

type TabType = "orders" | "menu" | "consolidate";

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filter state for Orders
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDeptFilter, setOrderDeptFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");

  // Search & Filter state for Menu
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("全部 (All)");

  // Drink Modal State (Add / Edit)
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [drinkForm, setDrinkForm] = useState({
    name: "",
    price: 40,
    category: "原味茶飲 (Pure Tea)",
    available: true,
    description: "",
    image: ""
  });

  // Success/Copied feedback state
  const [copied, setCopied] = useState(false);

  // Load Real-time Orders & Drinks
  useEffect(() => {
    // 1. Subscribe to orders
    const unsubscribe = subscribeToOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    // 2. Fetch/seed drinks
    async function loadMenu() {
      const seeded = await seedDrinksIfEmpty();
      setDrinks(seeded);
    }
    loadMenu();

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRefreshDrinks = async () => {
    const list = await getDrinks();
    setDrinks(list);
  };

  // Status updates
  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error(err);
      alert("更新狀態失敗，請重試！");
    } finally {
      setActionLoading(null);
    }
  };

  // Drink Form Handlers
  const handleOpenAddDrink = () => {
    setEditingDrink(null);
    setDrinkForm({
      name: "",
      price: 40,
      category: "原味茶飲 (Pure Tea)",
      available: true,
      description: "",
      image: ""
    });
    setShowDrinkModal(true);
  };

  const handleOpenEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setDrinkForm({
      name: drink.name,
      price: drink.price,
      category: drink.category,
      available: drink.available,
      description: drink.description,
      image: drink.image || ""
    });
    setShowDrinkModal(true);
  };

  const handleDrinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drinkForm.name.trim()) {
      alert("請輸入飲品名稱！");
      return;
    }

    try {
      if (editingDrink) {
        await updateDrink(editingDrink.id, drinkForm);
      } else {
        await addDrink(drinkForm);
      }
      setShowDrinkModal(false);
      handleRefreshDrinks();
    } catch (err) {
      console.error(err);
      alert("儲存飲品時發生錯誤，請重試！");
    }
  };

  const handleDeleteDrinkItem = async (drinkId: string) => {
    if (!confirm("確定要刪除此飲品品項嗎？")) return;
    try {
      await deleteDrink(drinkId);
      handleRefreshDrinks();
    } catch (err) {
      console.error(err);
      alert("刪除飲品失敗！");
    }
  };

  const handleToggleAvailable = async (drink: Drink) => {
    try {
      await updateDrink(drink.id, { available: !drink.available });
      // Update local state smoothly
      setDrinks(prev => prev.map(d => d.id === drink.id ? { ...d, available: !d.available } : d));
    } catch (err) {
      console.error(err);
      alert("更新狀態失敗！");
    }
  };

  // Filter Orders logic
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNo.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.userName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesDept = orderDeptFilter === "" || o.department === orderDeptFilter;
    const matchesStatus = orderStatusFilter === "" || o.status === orderStatusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filter Drinks logic
  const filteredDrinks = drinks.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          d.description.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCategory = menuCategoryFilter === "全部 (All)" || d.category === menuCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Consolidate active orders (Pending & Preparing)
  const activeOrders = orders.filter(o => o.status === "pending" || o.status === "preparing");
  
  const consolidatedMap: { [key: string]: { quantity: number; drinksDetail: string; basePrice: number; toppingsPrice: number } } = {};
  
  activeOrders.forEach(order => {
    order.items.forEach(item => {
      const toppingStr = item.toppings.length > 0 ? ` + ${item.toppings.map(t => t.split(" (")[0]).join(",")}` : "";
      const configKey = `${item.drinkName.split(" (")[0]} (${item.sugar.split(" (")[0]} / ${item.ice.split(" (")[0]}${toppingStr})`;
      
      if (!consolidatedMap[configKey]) {
        consolidatedMap[configKey] = {
          quantity: 0,
          drinksDetail: `${item.sugar.split(" (")[0]} / ${item.ice.split(" (")[0]}${toppingStr}`,
          basePrice: item.price,
          toppingsPrice: item.toppingPrice
        };
      }
      consolidatedMap[configKey].quantity += item.quantity;
    });
  });

  const consolidatedItems = Object.entries(consolidatedMap).map(([key, data]) => ({
    fullKey: key,
    name: key.substring(0, key.indexOf(" (")),
    detail: data.drinksDetail,
    quantity: data.quantity,
    unitPrice: data.basePrice + data.toppingsPrice
  })).sort((a, b) => b.quantity - a.quantity);

  const totalCups = consolidatedItems.reduce((acc, item) => acc + item.quantity, 0);

  // Copy consolidated summary to clipboard
  const handleCopyConsolidatedText = () => {
    if (consolidatedItems.length === 0) return;
    
    let text = `【光田綜合醫院 ‧ 醫護團購飲品統整清單】\n`;
    text += `統整時間：${new Date().toLocaleString("zh-TW")}\n`;
    text += `即時待製作杯數總計：${totalCups} 杯\n`;
    text += `------------------------------------\n`;
    consolidatedItems.forEach((item, index) => {
      text += `${index + 1}. ${item.name} | ${item.detail} ── 共 ${item.quantity} 杯 (單杯 $${item.unitPrice})\n`;
    });
    text += `------------------------------------\n`;
    text += `* 請外送人員抵達後至對應醫護站/護理站與同仁核對編號。感謝！`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats Counters
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const preparingCount = orders.filter(o => o.status === "preparing").length;
  const completedCount = orders.filter(o => o.status === "completed").length;
  
  const totalRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="space-y-8">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-3xs text-slate-400 font-mono uppercase font-bold block">已完成總額 Revenue</span>
            <span className="text-lg md:text-xl font-extrabold text-slate-800 font-mono">${totalRevenue}</span>
          </div>
          <div className="bg-emerald-50 text-emerald-500 p-3 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-3xs text-slate-400 font-mono uppercase font-bold block">新進待接單 Pending</span>
            <span className="text-lg md:text-xl font-extrabold text-amber-500 font-mono">{pendingCount} 筆</span>
          </div>
          <div className="bg-amber-50 text-amber-500 p-3 rounded-xl relative">
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            )}
            <Clock size={20} />
          </div>
        </div>

        {/* Preparing */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-3xs text-slate-400 font-mono uppercase font-bold block">製作中訂單 Preparing</span>
            <span className="text-lg md:text-xl font-extrabold text-cyan-500 font-mono">{preparingCount} 筆</span>
          </div>
          <div className="bg-cyan-50 text-cyan-500 p-3 rounded-xl">
            <UtensilsCrossed size={20} />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-3xs text-slate-400 font-mono uppercase font-bold block">已交付點單 Completed</span>
            <span className="text-lg md:text-xl font-extrabold text-hospital-600 font-mono">{completedCount} 筆</span>
          </div>
          <div className="bg-teal-50 text-hospital-500 p-3 rounded-xl">
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Main Admin Navigation Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 text-xs py-2 px-4 rounded-xl font-medium transition-all ${
              activeTab === "orders"
                ? "bg-hospital-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ClipboardList size={14} />
            <span>即時點單管理</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white font-mono text-4xs font-bold px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("consolidate")}
            className={`flex items-center gap-2 text-xs py-2 px-4 rounded-xl font-medium transition-all ${
              activeTab === "consolidate"
                ? "bg-hospital-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutList size={14} />
            <span>待做杯數統整</span>
            {totalCups > 0 && (
              <span className="bg-amber-500 text-white font-mono text-4xs font-bold px-1.5 py-0.2 rounded-full">
                {totalCups}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-2 text-xs py-2 px-4 rounded-xl font-medium transition-all ${
              activeTab === "menu"
                ? "bg-hospital-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Grid size={14} />
            <span>飲品菜單品項</span>
          </button>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-slate-500 hover:text-rose-500 text-xs py-2 px-4 rounded-xl hover:bg-rose-50 transition-all shrink-0 ml-auto sm:ml-0"
        >
          <LogOut size={13} />
          <span>管理登出</span>
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
            <RefreshCw size={24} className="animate-spin text-hospital-500 mb-2" />
            <span className="text-xs">即時連線 Firebase 資料庫中...</span>
          </div>
        ) : activeTab === "orders" ? (
          /* ORDERS TAB */
          <motion.div
            key="orders-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            {/* Filter bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
              {/* Search */}
              <div className="relative col-span-1 sm:col-span-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="搜尋訂單編號或同仁姓名..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-slate-50/50"
                />
              </div>

              {/* Department Filter */}
              <select
                value={orderDeptFilter}
                onChange={(e) => setOrderDeptFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-white"
              >
                <option value="">所有科室 (All)</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept.split(" (")[0]}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-white"
              >
                <option value="">所有狀態 (All)</option>
                <option value="pending">新進待接單 (Pending)</option>
                <option value="preparing">製作準備中 (Preparing)</option>
                <option value="completed">製作完成 (Completed)</option>
                <option value="cancelled">已取消 (Cancelled)</option>
              </select>
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
                <ClipboardList size={36} className="mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="text-xs font-semibold">找不到符合篩選條件的點單</p>
                <p className="text-3xs text-slate-400">目前沒有新進點單或搜尋無匹配項目。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredOrders.map((order) => {
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  
                  // Status Styles
                  let statusBadgeClass = "";
                  let statusText = "";
                  if (order.status === "pending") {
                    statusBadgeClass = "bg-amber-50 text-amber-600 border-amber-200";
                    statusText = "新進點單";
                  } else if (order.status === "preparing") {
                    statusBadgeClass = "bg-cyan-50 text-cyan-600 border-cyan-200";
                    statusText = "製作中";
                  } else if (order.status === "completed") {
                    statusBadgeClass = "bg-emerald-50 text-emerald-600 border-emerald-200";
                    statusText = "已完成";
                  } else if (order.status === "cancelled") {
                    statusBadgeClass = "bg-rose-50 text-rose-600 border-rose-200";
                    statusText = "已取消";
                  }

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-100 p-5 shadow-3xs flex flex-col justify-between"
                    >
                      {/* Order Info Bar */}
                      <div>
                        <div className="flex justify-between items-start gap-2 pb-3.5 border-b border-slate-100 mb-3.5">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-xs text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {order.orderNo}
                            </span>
                            <div className="flex items-center gap-1.5 text-2xs text-slate-400 mt-1">
                              <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString("zh-TW", { hour: '2-digit', minute: '2-digit' }) : "剛才"}</span>
                              <span>‧</span>
                              <span>{order.department.split(" (")[0]}</span>
                            </div>
                          </div>

                          <div className="text-right space-y-1">
                            <span className={`text-3xs px-2.5 py-0.5 rounded-full font-bold border inline-block ${statusBadgeClass}`}>
                              {statusText}
                            </span>
                            <p className="text-2xs font-semibold text-slate-600">{order.userName}</p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2.5 my-3.5">
                          {order.items.map((item, index) => {
                            const toppingStr = item.toppings.length > 0 ? ` + ${item.toppings.map(t => t.split(" (")[0]).join(",")}` : "";
                            return (
                              <div key={index} className="flex justify-between text-xs">
                                <div className="space-y-0.5">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="font-semibold text-slate-800">{item.drinkName.split(" (")[0]}</span>
                                    <span className="text-3xs text-hospital-600 font-medium">
                                      ({item.sugar.split(" (")[0]} / {item.ice.split(" (")[0]}{toppingStr})
                                    </span>
                                  </div>
                                  {item.notes && (
                                    <p className="text-4xs text-slate-400 italic">備註: {item.notes}</p>
                                  )}
                                </div>
                                <span className="font-mono text-slate-500 shrink-0 text-right">
                                  x{item.quantity} (${(item.price + item.toppingPrice) * item.quantity})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Summary and Quick Actions */}
                      <div className="pt-3.5 border-t border-slate-50 mt-auto flex justify-between items-center gap-4 flex-wrap">
                        <div className="space-y-0.5">
                          <span className="text-4xs text-slate-400 font-mono">總杯數：{itemsCount} 杯</span>
                          <p className="text-xs font-bold text-hospital-600 font-mono">應收：${order.totalPrice} NTD</p>
                        </div>

                        {/* Action buttons based on status */}
                        <div className="flex gap-1.5 ml-auto">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id!, "preparing")}
                                disabled={actionLoading === order.id}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium text-4xs py-1.5 px-3 rounded-lg transition-all shadow-xs flex items-center gap-1"
                              >
                                {actionLoading === order.id ? <RefreshCw size={10} className="animate-spin" /> : <UtensilsCrossed size={10} />}
                                <span>接單製作</span>
                              </button>
                              
                              <button
                                onClick={() => handleUpdateStatus(order.id!, "cancelled")}
                                disabled={actionLoading === order.id}
                                className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium text-4xs py-1.5 px-3 rounded-lg transition-all"
                              >
                                取消
                              </button>
                            </>
                          )}

                          {order.status === "preparing" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id!, "completed")}
                                disabled={actionLoading === order.id}
                                className="bg-hospital-600 hover:bg-hospital-700 text-white font-medium text-4xs py-1.5 px-3 rounded-lg transition-all shadow-xs flex items-center gap-1"
                              >
                                {actionLoading === order.id ? <RefreshCw size={10} className="animate-spin" /> : <Check size={11} />}
                                <span>製作完成</span>
                              </button>
                              
                              <button
                                onClick={() => handleUpdateStatus(order.id!, "cancelled")}
                                disabled={actionLoading === order.id}
                                className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-medium text-4xs py-1.5 px-3 rounded-lg transition-all"
                              >
                                取消
                              </button>
                            </>
                          )}

                          {(order.status === "completed" || order.status === "cancelled") && (
                            <button
                              onClick={() => handleUpdateStatus(order.id!, "pending")}
                              disabled={actionLoading === order.id}
                              className="text-slate-400 hover:text-slate-600 font-medium text-4xs py-1 px-2 hover:bg-slate-50 rounded-lg transition-all"
                            >
                              重設為待處理
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : activeTab === "consolidate" ? (
          /* CONSOLIDATE ACTIVE ACTIVE DRINKS TAB */
          <motion.div
            key="consolidate-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-5 flex-wrap gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-800 flex items-center gap-1.5">
                    <FlameKindling className="text-amber-500" size={18} />
                    <span>即時待製作杯數統整</span>
                  </h3>
                  <p className="text-3xs text-slate-400 mt-1">
                    此面板自動合併所有【未接單】與【製作中】訂單之相同飲品與客製規格，方便向店家或內部派單。
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyConsolidatedText}
                    disabled={consolidatedItems.length === 0}
                    className="bg-hospital-50 hover:bg-hospital-100 text-hospital-700 font-semibold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? "已複製清單" : "複製統整文字"}</span>
                  </button>
                </div>
              </div>

              {consolidatedItems.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ClipboardList size={36} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-xs font-semibold">目前無任何待製作之點單杯數</p>
                  <p className="text-3xs">當前有新進訂單後，此處將自動產生統整報表。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stats line */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">待做杯數累計</span>
                    <span className="font-extrabold text-base text-hospital-600">{totalCups} 杯</span>
                  </div>

                  {/* Table lists */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                          <th className="p-4 w-10 text-center">#</th>
                          <th className="p-4">飲品名稱</th>
                          <th className="p-4">配方客製細節</th>
                          <th className="p-4 text-center">單杯價格</th>
                          <th className="p-4 text-center w-24">待做數量</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consolidatedItems.map((item, index) => (
                          <tr key={index} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-center font-mono font-medium text-slate-400">{index + 1}</td>
                            <td className="p-4 font-bold text-slate-800">{item.name}</td>
                            <td className="p-4 font-mono text-hospital-700">{item.detail}</td>
                            <td className="p-4 text-center font-mono text-slate-500">${item.unitPrice}</td>
                            <td className="p-4 text-center">
                              <span className="bg-amber-100 text-amber-800 font-bold font-mono px-3 py-1 rounded-full text-xs">
                                {item.quantity} 杯
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* MENU MANAGEMENT TAB */
          <motion.div
            key="menu-panel"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-4"
          >
            {/* Header filters */}
            <div className="flex flex-col md:flex-row justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="搜尋飲品名稱或簡介..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-slate-50/50"
                />
              </div>

              <select
                value={menuCategoryFilter}
                onChange={(e) => setMenuCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.split(" (")[0]}
                  </option>
                ))}
              </select>

              <button
                onClick={handleOpenAddDrink}
                className="bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>新增飲品品項</span>
              </button>
            </div>

            {/* Menu table list */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-3xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                    <th className="p-4">飲品圖示</th>
                    <th className="p-4">飲品名稱</th>
                    <th className="p-4">分類</th>
                    <th className="p-4 font-mono">定價 (NTD)</th>
                    <th className="p-4">簡介說明</th>
                    <th className="p-4 text-center">狀態</th>
                    <th className="p-4 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrinks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        目前無任何符合篩選的飲品品項。
                      </td>
                    </tr>
                  ) : (
                    filteredDrinks.map((drink) => (
                      <tr key={drink.id} className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/20 transition-colors">
                        <td className="p-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                            {drink.image ? (
                              <img src={drink.image} alt={drink.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-hospital-100 text-hospital-600 flex items-center justify-center font-bold text-xs">
                                茶
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800 text-xs block">{drink.name.split(" (")[0]}</span>
                          {drink.name.includes("(") && (
                            <span className="text-4xs text-slate-400 font-mono block">
                              {drink.name.substring(drink.name.indexOf("(") + 1, drink.name.length - 1)}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500">{drink.category.split(" (")[0]}</td>
                        <td className="p-4 font-mono font-bold text-slate-700">${drink.price}</td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{drink.description || "—"}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleAvailable(drink)}
                            className={`px-2 py-1 rounded-md text-4xs font-bold border cursor-pointer select-none transition-all ${
                              drink.available
                                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                : "bg-rose-50 border-rose-200 text-rose-600"
                            }`}
                          >
                            {drink.available ? "熱賣中" : "已售完"}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditDrink(drink)}
                              className="p-1.5 text-slate-400 hover:text-hospital-600 hover:bg-slate-100 rounded-md transition-all"
                              title="編輯"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteDrinkItem(drink.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all"
                              title="刪除"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drink Add / Edit Modal */}
      {showDrinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowDrinkModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" />
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 flex flex-col p-6 space-y-4">
            <h3 className="font-display font-extrabold text-base text-slate-800">
              {editingDrink ? "編輯飲品品項" : "新增飲品品項"}
            </h3>

            <form onSubmit={handleDrinkSubmit} className="space-y-4 text-xs text-left">
              {/* Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">飲品名稱 *</label>
                <input
                  type="text"
                  required
                  value={drinkForm.name}
                  onChange={(e) => setDrinkForm({ ...drinkForm, name: e.target.value })}
                  placeholder="例如：茉莉綠茶 (Jasmine Green Tea)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">售價 (NTD) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={drinkForm.price}
                    onChange={(e) => setDrinkForm({ ...drinkForm, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-600 block">類別分類 *</label>
                  <select
                    value={drinkForm.category}
                    onChange={(e) => setDrinkForm({ ...drinkForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 bg-white"
                  >
                    {CATEGORIES.filter(c => c !== "全部 (All)").map(cat => (
                      <option key={cat} value={cat}>
                        {cat.split(" (")[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">飲品示意圖 URL (選填)</label>
                <input
                  type="text"
                  value={drinkForm.image}
                  onChange={(e) => setDrinkForm({ ...drinkForm, image: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-600 block">品項簡介說明</label>
                <textarea
                  value={drinkForm.description}
                  onChange={(e) => setDrinkForm({ ...drinkForm, description: e.target.value })}
                  placeholder="簡單描述此茶款風味或特色..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-hospital-500/10 focus:border-hospital-500 resize-none"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="form-available"
                  checked={drinkForm.available}
                  onChange={(e) => setDrinkForm({ ...drinkForm, available: e.target.checked })}
                  className="rounded border-slate-300 text-hospital-600 focus:ring-hospital-500 h-4 w-4"
                />
                <label htmlFor="form-available" className="font-semibold text-slate-700">設為今日熱賣供應中 (Available)</label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDrinkModal(false)}
                  className="w-1/2 text-center text-slate-500 hover:bg-slate-50 py-2.5 rounded-xl border border-slate-200 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-hospital-600 hover:bg-hospital-700 text-white font-semibold py-2.5 rounded-xl shadow-md transition-all"
                >
                  儲存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
