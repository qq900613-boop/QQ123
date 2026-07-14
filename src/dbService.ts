import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  getDoc,
  setDoc,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { Drink, Order } from "./types";

// Helper for SHA-256 Hashing
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Collections
const DRINKS_COL = "drinks";
const ORDERS_COL = "orders";
const SETTINGS_COL = "adminSettings";

// Seed Drinks Data
const DEFAULT_DRINKS = [
  {
    name: "錫蘭紅茶 (Ceylon Black Tea)",
    price: 30,
    category: "原味茶飲 (Pure Tea)",
    available: true,
    description: "經典英式錫蘭紅茶，茶味甘醇溫潤，帶有淡淡花果香。",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "茉莉綠茶 (Jasmine Green Tea)",
    price: 30,
    category: "原味茶飲 (Pure Tea)",
    available: true,
    description: "新鮮茉莉花與翠綠茶葉多次薰製，清香怡人、回甘爽口。",
    image: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "四季春青茶 (Four Seasons Tea)",
    price: 35,
    category: "原味茶飲 (Pure Tea)",
    available: true,
    description: "台灣在地四季春，兼具烏龍茶的韻味與綠茶的清香。",
    image: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "珍珠奶茶 (Classic Boba Milk Tea)",
    price: 50,
    category: "香醇奶茶 (Milk Tea)",
    available: true,
    description: "Q彈手作慢火熬煮黑糖珍珠，搭配香濃奶茶，完美經典組合。",
    image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "黑糖珍珠鮮奶 (Brown Sugar Boba Milk)",
    price: 65,
    category: "鮮奶拿鐵 (Latte/Fresh Milk)",
    available: true,
    description: "濃醇手炒黑糖蜜漬珍珠劃杯，融入100%小農優質鮮乳。",
    image: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "紅茶拿鐵 (Ceylon Black Tea Latte)",
    price: 55,
    category: "鮮奶拿鐵 (Latte/Fresh Milk)",
    available: true,
    description: "錫蘭紅茶遇上鮮乳，交織出絲滑細緻、乳香與茶香並重的絕妙滋味。",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "招牌水果茶 (Signature Fruit Tea)",
    price: 60,
    category: "鮮果特調 (Fruit Tea)",
    available: true,
    description: "新鮮鳳梨、蘋果、百香果、柳橙現搾與綠茶調和，酸甜清爽。",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "經典美式咖啡 (Classic Americano)",
    price: 50,
    category: "經典咖啡 (Coffee)",
    available: true,
    description: "嚴選100%阿拉比卡豆中深烘焙，口感醇厚、果香芬芳。",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "經典原味拿鐵 (Cafe Latte)",
    price: 65,
    category: "經典咖啡 (Coffee)",
    available: true,
    description: "濃郁香醇義式濃縮咖啡，加上綿密細緻的鮮奶泡。",
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&w=300&q=80"
  }
];

// Seed Drinks if collection is empty
export async function seedDrinksIfEmpty(): Promise<Drink[]> {
  try {
    const q = query(collection(db, DRINKS_COL));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("Drinks collection is empty. Seeding initial drinks menu...");
      const promises = DEFAULT_DRINKS.map(async (drinkData) => {
        const docRef = await addDoc(collection(db, DRINKS_COL), drinkData);
        return { id: docRef.id, ...drinkData };
      });
      return await Promise.all(promises);
    } else {
      const drinks: Drink[] = [];
      querySnapshot.forEach((doc) => {
        drinks.push({ id: doc.id, ...doc.data() } as Drink);
      });
      return drinks;
    }
  } catch (error) {
    console.error("Error seeding or fetching drinks:", error);
    return [];
  }
}

// Fetch All Drinks
export async function getDrinks(): Promise<Drink[]> {
  try {
    const q = query(collection(db, DRINKS_COL));
    const querySnapshot = await getDocs(q);
    const drinks: Drink[] = [];
    querySnapshot.forEach((doc) => {
      drinks.push({ id: doc.id, ...doc.data() } as Drink);
    });
    return drinks;
  } catch (error) {
    console.error("Error fetching drinks:", error);
    return [];
  }
}

// Add Drink
export async function addDrink(drink: Omit<Drink, "id">): Promise<Drink> {
  const docRef = await addDoc(collection(db, DRINKS_COL), drink);
  return { id: docRef.id, ...drink };
}

// Update Drink
export async function updateDrink(id: string, drink: Partial<Drink>): Promise<void> {
  const docRef = doc(db, DRINKS_COL, id);
  await updateDoc(docRef, drink);
}

// Delete Drink
export async function deleteDrink(id: string): Promise<void> {
  const docRef = doc(db, DRINKS_COL, id);
  await deleteDoc(docRef);
}

// Create New Order
export async function placeOrder(orderData: Omit<Order, "id" | "orderNo" | "status" | "createdAt" | "updatedAt">): Promise<Order> {
  // Generate friendly orderNo (KT-MMDD-XXX)
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const randomNum = Math.floor(100 + Math.random() * 900);
  const orderNo = `KT-${month}${date}-${randomNum}`;

  const order: Order = {
    ...orderData,
    orderNo,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, ORDERS_COL), order);
  return { id: docRef.id, ...order };
}

// Real-time Orders Listener
export function subscribeToOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Safely convert Timestamp to JS Date/ISO String for frontend display
      let createdAtStr = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAtStr = new Date(data.createdAt).toISOString();
      }
      
      let updatedAtStr = new Date().toISOString();
      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        updatedAtStr = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt) {
        updatedAtStr = new Date(data.updatedAt).toISOString();
      }

      orders.push({ 
        ...data, 
        id: doc.id,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr
      } as Order);
    });
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to orders:", error);
  });
}

// Update Order Status
export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const docRef = doc(db, ORDERS_COL, id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp()
  });
}

// Get Admin Password Setup state
export async function checkAdminSetup(): Promise<{ isSetup: boolean; passwordHash?: string }> {
  try {
    const docRef = doc(db, SETTINGS_COL, "auth");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { isSetup: true, passwordHash: docSnap.data().passwordHash };
    }
    return { isSetup: false };
  } catch (error) {
    console.error("Error checking admin setup:", error);
    return { isSetup: false };
  }
}

// Setup Admin Password
export async function setupAdminPassword(password: string): Promise<void> {
  const docRef = doc(db, SETTINGS_COL, "auth");
  const hash = await hashPassword(password);
  await setDoc(docRef, {
    passwordHash: hash,
    isSetup: true,
    updatedAt: serverTimestamp()
  });
}

// Verify Password
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const { isSetup, passwordHash } = await checkAdminSetup();
  if (!isSetup || !passwordHash) return false;
  const hash = await hashPassword(password);
  return hash === passwordHash;
}
