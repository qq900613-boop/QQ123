export interface Drink {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  description: string;
  image?: string;
}

export interface CartItem {
  drinkId: string;
  drinkName: string;
  price: number;
  sugar: string;
  ice: string;
  toppings: string[];
  toppingPrice: number;
  quantity: number;
  notes: string;
}

export interface Order {
  id?: string;
  orderNo: string;
  department: string;
  userName: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: any; // Firestore Timestamp or string
  updatedAt: any;
}

export interface AdminSettings {
  passwordHash: string;
  isSetup: boolean;
}

export const DEPARTMENTS = [
  "門診部 (Outpatient)",
  "急診部 (Emergency)",
  "加護病房 (ICU)",
  "手術室 (OR)",
  "護理部 (Nursing)",
  "檢驗科 (Laboratory)",
  "藥劑部 (Pharmacy)",
  "放射科 (Radiology)",
  "行政處 (Administration)",
  "其他科室 (Others)"
];

export const ICE_OPTIONS = [
  "去冰 (No Ice)",
  "微冰 (30% Ice)",
  "少冰 (70% Ice)",
  "正常冰 (100% Ice)",
  "常溫 (Room Temp)",
  "熱 (Hot)"
];

export const SUGAR_OPTIONS = [
  "無糖 (0% Sugar)",
  "微糖 (30% Sugar)",
  "半糖 (50% Sugar)",
  "少糖 (70% Sugar)",
  "正常糖 (100% Sugar)"
];

export const TOPPING_OPTIONS = [
  { name: "珍珠 (Boba)", price: 10 },
  { name: "椰果 (Coconut Jelly)", price: 10 },
  { name: "仙草凍 (Grass Jelly)", price: 10 },
  { name: "布丁 (Pudding)", price: 15 },
  { name: "蘆薈 (Aloe Vera)", price: 10 }
];

export const CATEGORIES = [
  "全部 (All)",
  "原味茶飲 (Pure Tea)",
  "香醇奶茶 (Milk Tea)",
  "鮮奶拿鐵 (Latte/Fresh Milk)",
  "鮮果特調 (Fruit Tea)",
  "經典咖啡 (Coffee)"
];
