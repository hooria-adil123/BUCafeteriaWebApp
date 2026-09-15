import fs from "fs";
import path from "path";
import { hashPassword, newId } from "@/lib/utils";
import type { User, MenuItem, PickupSlot, Order, OrderItem } from "@/db/schema";

export const ALL_21_MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Biryani",
    description: "Fragrant basmati rice layered with spiced chicken, fried onions and raita on the side.",
    category: "Pakistani Food",
    pricePkr: 280,
    imageUrl: "https://images.pexels.com/photos/28674660/pexels-photo-28674660.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 42,
  },
  {
    id: 2,
    name: "Spaghetti",
    description: "Classic spaghetti tossed in a rich tomato basil sauce with savory herbs and parmesan.",
    category: "Fast Food",
    pricePkr: 250,
    imageUrl: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 30,
  },
  {
    id: 3,
    name: "Pasta",
    description: "Creamy fettuccine pasta with mushrooms, herbs and a light garlic sauce.",
    category: "Fast Food",
    pricePkr: 240,
    imageUrl: "https://images.pexels.com/photos/5379639/pexels-photo-5379639.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 30,
  },
  {
    id: 4,
    name: "Beef Burger",
    description: "Grilled beef patty, cheddar, lettuce, tomato and cafe sauce in a toasted bun.",
    category: "Fast Food",
    pricePkr: 350,
    imageUrl: "https://images.pexels.com/photos/2271101/pexels-photo-2271101.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 28,
  },
  {
    id: 5,
    name: "Zinger Burger",
    description: "Crispy spicy fried chicken fillet with mayo and iceberg lettuce.",
    category: "Fast Food",
    pricePkr: 320,
    imageUrl: "https://images.pexels.com/photos/11975890/pexels-photo-11975890.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 35,
  },
  {
    id: 6,
    name: "Chicken Burger",
    description: "Grilled chicken burger with cheese, fresh greens and BU cafe sauce.",
    category: "Fast Food",
    pricePkr: 280,
    imageUrl: "https://images.pexels.com/photos/6850423/pexels-photo-6850423.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 33,
  },
  {
    id: 7,
    name: "Shawarma",
    description: "Loaded chicken shawarma wrap with garlic sauce, fries and pickled veggies.",
    category: "Fast Food",
    pricePkr: 220,
    imageUrl: "https://images.pexels.com/photos/5779364/pexels-photo-5779364.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 40,
  },
  {
    id: 8,
    name: "Club Sandwich",
    description: "Triple-layer toasted club with chicken, egg, cheese, lettuce and fries.",
    category: "Fast Food",
    pricePkr: 260,
    imageUrl: "https://images.pexels.com/photos/34384842/pexels-photo-34384842.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 26,
  },
  {
    id: 9,
    name: "Pizza",
    description: "Personal oven-baked pizza with mozzarella, pepperoni and oregano.",
    category: "Fast Food",
    pricePkr: 450,
    imageUrl: "https://images.pexels.com/photos/7813574/pexels-photo-7813574.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 22,
  },
  {
    id: 10,
    name: "Loaded Fries",
    description: "Crispy fries smothered in cheese sauce, spices and savory toppings.",
    category: "Snacks",
    pricePkr: 200,
    imageUrl: "https://images.pexels.com/photos/21823086/pexels-photo-21823086.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 38,
  },
  {
    id: 11,
    name: "Nutella Paratha",
    description: "Flaky tawa paratha filled and drizzled with warm Nutella chocolate.",
    category: "Breakfast",
    pricePkr: 180,
    imageUrl: "https://images.pexels.com/photos/33017545/pexels-photo-33017545.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 24,
  },
  {
    id: 12,
    name: "Chicken Cheese Paratha",
    description: "Stuffed paratha with spiced chicken and molten cheese, served hot.",
    category: "Breakfast",
    pricePkr: 220,
    imageUrl: "https://images.pexels.com/photos/12737919/pexels-photo-12737919.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 27,
  },
  {
    id: 13,
    name: "Cream Filled Donuts",
    description: "Soft donuts piped with vanilla cream and a light sugar dusting.",
    category: "Desserts",
    pricePkr: 120,
    imageUrl: "https://images.pexels.com/photos/8625940/pexels-photo-8625940.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 36,
  },
  {
    id: 14,
    name: "Choc Frost Donuts",
    description: "Classic donuts with a thick chocolate frosting and sprinkles.",
    category: "Desserts",
    pricePkr: 130,
    imageUrl: "https://images.pexels.com/photos/3274104/pexels-photo-3274104.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 34,
  },
  {
    id: 15,
    name: "Brownies",
    description: "Fudgy chocolate brownies with a crackly top — a campus favourite.",
    category: "Desserts",
    pricePkr: 150,
    imageUrl: "https://images.pexels.com/photos/33312981/pexels-photo-33312981.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 20,
  },
  {
    id: 16,
    name: "Chai",
    description: "Strong doodh patti chai, freshly poured the authentic desi way.",
    category: "Breakfast",
    pricePkr: 80,
    imageUrl: "https://images.pexels.com/photos/10389156/pexels-photo-10389156.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 80,
  },
  {
    id: 22,
    name: "Cake Rusk",
    description: "Golden, twice-baked cake rusk served crisp with tea.",
    category: "Breakfast",
    pricePkr: 100,
    imageUrl: "https://images.pexels.com/photos/16942969/pexels-photo-16942969.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 45,
  },
  {
    id: 23,
    name: "Aloo Paratha",
    description: "Crisp potato-stuffed paratha served with yogurt and chutney.",
    category: "Breakfast",
    pricePkr: 160,
    imageUrl: "https://images.pexels.com/photos/36681872/pexels-photo-36681872.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 30,
  },
  {
    id: 24,
    name: "Daal Chawal",
    description: "Comforting lentils with steamed basmati rice and fresh herbs.",
    category: "Pakistani Food",
    pricePkr: 240,
    imageUrl: "https://images.pexels.com/photos/28674708/pexels-photo-28674708.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 28,
  },
  {
    id: 17,
    name: "Oreo Shake",
    description: "Thick Oreo cookie milkshake topped with whipped cream and cookie crumbs.",
    category: "Drinks",
    pricePkr: 250,
    imageUrl: "https://images.pexels.com/photos/16825488/pexels-photo-16825488.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: true,
    stockCount: 25,
  },
  {
    id: 18,
    name: "Iced Coffee",
    description: "Chilled espresso poured over ice with a splash of milk and light sweetness.",
    category: "Drinks",
    pricePkr: 220,
    imageUrl: "https://images.pexels.com/photos/33542190/pexels-photo-33542190.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: true,
    stockCount: 29,
  },
  {
    id: 19,
    name: "Caramel Coffee",
    description: "Smooth coffee with rich caramel drizzle and a creamy froth finish.",
    category: "Drinks",
    pricePkr: 240,
    imageUrl: "https://images.pexels.com/photos/6166478/pexels-photo-6166478.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 21,
  },
  {
    id: 20,
    name: "Spanish Latte",
    description: "Layered Spanish latte with condensed milk and rich dark espresso.",
    category: "Drinks",
    pricePkr: 260,
    imageUrl: "https://images.pexels.com/photos/18281882/pexels-photo-18281882.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: true,
    stockCount: 18,
  },
  {
    id: 21,
    name: "Water Bottle",
    description: "Chilled 500ml pure mineral drinking water bottle.",
    category: "Drinks",
    pricePkr: 50,
    imageUrl: "https://images.pexels.com/photos/8217434/pexels-photo-8217434.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 120,
  },
];

export const FALLBACK_MENU = ALL_21_MENU_ITEMS;

export const FALLBACK_SLOTS: PickupSlot[] = [
  { id: 1, label: "11:30 AM", sortOrder: 1, capacity: 15, active: true },
  { id: 2, label: "12:00 PM", sortOrder: 2, capacity: 15, active: true },
  { id: 3, label: "12:30 PM", sortOrder: 3, capacity: 15, active: true },
  { id: 4, label: "1:00 PM", sortOrder: 4, capacity: 15, active: true },
  { id: 5, label: "1:30 PM", sortOrder: 5, capacity: 15, active: true },
  { id: 6, label: "2:00 PM", sortOrder: 6, capacity: 15, active: true },
];

export const INITIAL_USERS: User[] = [];
// Persistent file storage on disk
const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "cafeteria_store.json");

interface PersistedData {
  users: User[];
  sessions: [string, { userId: number; expiresAt: string }][];
  carts: [number, { id: number; quantity: number; menuItem: MenuItem }[]][];
  orders: (Order & { items: OrderItem[]; slot?: PickupSlot; student?: User })[];
}

function loadPersistedData(): PersistedData {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return { users: [], sessions: [], carts: [], orders: [] };
    }

    const stored = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8")) as Partial<PersistedData>;
    return {
      users: Array.isArray(stored.users) ? stored.users : [],
      sessions: Array.isArray(stored.sessions) ? stored.sessions : [],
      carts: Array.isArray(stored.carts) ? stored.carts : [],
      orders: Array.isArray(stored.orders) ? stored.orders : [],
    };
  } catch (err) {
    console.warn("Could not load cafeteria_store.json:", (err as Error).message);
    return { users: [], sessions: [], carts: [], orders: [] };
  }
}

export function savePersistedData(data?: PersistedData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const toSave: PersistedData = data ?? {
      users: fallbackUsers,
      sessions: Array.from(fallbackSessions.entries()).map(([k, v]) => [
        k,
        { userId: v.userId, expiresAt: v.expiresAt.toISOString() },
      ]),
      carts: Array.from(fallbackCarts.entries()),
      orders: fallbackOrders,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(toSave, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save cafeteria_store.json:", (err as Error).message);
  }
}

// In-memory singletons backed by disk file
const globalStore = globalThis as typeof globalThis & {
  __buFallbackUsers?: User[];
  __buFallbackSessions?: Map<string, { userId: number; expiresAt: Date }>;
  __buFallbackCarts?: Map<number, { id: number; quantity: number; menuItem: MenuItem }[]>;
  __buFallbackOrders?: (Order & { items: OrderItem[]; slot?: PickupSlot; student?: User })[];
};

if (!globalStore.__buFallbackUsers) {
  const loaded = loadPersistedData();
  globalStore.__buFallbackUsers = loaded.users.map((u) => ({
    ...u,
    createdAt: new Date(u.createdAt),
  }));
  globalStore.__buFallbackSessions = new Map(
    loaded.sessions.map(([k, v]) => [
      k,
      { userId: v.userId, expiresAt: new Date(v.expiresAt) },
    ]),
  );
  globalStore.__buFallbackCarts = new Map(loaded.carts);
  globalStore.__buFallbackOrders = loaded.orders.map((o) => ({
    ...o,
    createdAt: new Date(o.createdAt),
  }));
}

export const fallbackUsers = globalStore.__buFallbackUsers!;
export const fallbackSessions = globalStore.__buFallbackSessions!;
export const fallbackCarts = globalStore.__buFallbackCarts!;
export const fallbackOrders = globalStore.__buFallbackOrders!;

export function addFallbackUser(user: Omit<User, "id" | "createdAt">): User {
  const nextId = Math.max(...fallbackUsers.map((u) => u.id), 100) + 1;
  const full: User = { ...user, id: nextId, createdAt: new Date() };
  fallbackUsers.push(full);
  savePersistedData();
  return full;
}

export function createFallbackSession(userId: number, expiresAt: Date): string {
  const id = newId();
  fallbackSessions.set(id, { userId, expiresAt });
  savePersistedData();
  return id;
}

export function getFallbackUserBySession(token: string): User | null {
  const session = fallbackSessions.get(token);
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    fallbackSessions.delete(token);
    savePersistedData();
    return null;
  }
  return fallbackUsers.find((u) => u.id === session.userId) ?? null;
}

export function clearOrdersForUser(studentId: number) {
  // Remove from in-memory fallbackOrders
  for (let i = fallbackOrders.length - 1; i >= 0; i--) {
    if (fallbackOrders[i].studentId === studentId) {
      fallbackOrders.splice(i, 1);
    }
  }
  // Clear user cart
  fallbackCarts.delete(studentId);

  // Restore the standard student wallet balance
  const student = fallbackUsers.find((u) => u.id === studentId);
  if (student?.role === "student") {
    student.walletBalance = 5000;
  }
  savePersistedData();
}

export function clearAllOrders() {
  fallbackOrders.length = 0;
  fallbackCarts.clear();
  savePersistedData();
}

