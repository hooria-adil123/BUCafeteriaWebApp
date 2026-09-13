import fs from "fs";
import path from "path";
import { hashPassword, newId } from "@/lib/utils";
import type { User, MenuItem, PickupSlot, Order, OrderItem } from "@/db/schema";

const passwordHash = hashPassword("1234");
const nimraPasswordHash = hashPassword("abcd");
const amalPasswordHash = hashPassword("xyz");
const staffPasswordHash = hashPassword("12345");
const managerPasswordHash = hashPassword("123456");
const adminPasswordHash = hashPassword("1234567");
const supplierPasswordHash = hashPassword("12345678");

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

export const INITIAL_USERS: User[] = [
  {
    id: 100,
    name: "Hooria Adil",
    email: "hooriaa619@gmail.com",
    enrollmentId: "02-134251-019",
    passwordHash,
    role: "student",
    walletBalance: 5000,
    createdAt: new Date(),
  },
  {
    id: 101,
    name: "Nimra",
    email: "nimrashaikh123@gmail.com",
    enrollmentId: "02-134251-089",
    passwordHash: nimraPasswordHash,
    role: "student",
    walletBalance: 3000,
    createdAt: new Date(),
  },
  {
    id: 102,
    name: "Amal Faraz",
    email: "amalfaraz890@gmail.com",
    enrollmentId: "02-134251-007",
    passwordHash: amalPasswordHash,
    role: "student",
    walletBalance: 3500,
    createdAt: new Date(),
  },
  {
    id: 1,
    name: "Ali Khan",
    email: "student@university.com",
    enrollmentId: "01-134221-001",
    passwordHash,
    role: "student",
    walletBalance: 5000,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Sara Ahmed",
    email: "sara@university.com",
    enrollmentId: "01-134221-042",
    passwordHash,
    role: "student",
    walletBalance: 1800,
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Hassan Malik",
    email: "hassan@university.com",
    enrollmentId: "01-134221-078",
    passwordHash,
    role: "student",
    walletBalance: 3200,
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "Ayesha Noor",
    email: "ayesha@university.com",
    enrollmentId: "01-134221-119",
    passwordHash,
    role: "student",
    walletBalance: 900,
    createdAt: new Date(),
  },
  {
    id: 5,
    name: "Bilal Raza",
    email: "staff@cafeteria.com",
    enrollmentId: "STAFF-01",
    passwordHash: staffPasswordHash,
    role: "staff",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 51,
    name: "Nayel",
    email: "staff1@cafeteria.com",
    enrollmentId: "STAFF-02",
    passwordHash: hashPassword("12345"),
    role: "staff",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 52,
    name: "Wahaj",
    email: "staff2@cafeteria.com",
    enrollmentId: "STAFF-03",
    passwordHash: hashPassword("123456"),
    role: "staff",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 53,
    name: "Rehan",
    email: "staff3@cafeteria.com",
    enrollmentId: "STAFF-04",
    passwordHash: hashPassword("1234567"),
    role: "staff",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 54,
    name: "Ali",
    email: "staff4@cafeteria.com",
    enrollmentId: "STAFF-05",
    passwordHash: hashPassword("12345678"),
    role: "staff",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 6,
    name: "Nadia Sheikh",
    email: "manager@cafeteria.com",
    enrollmentId: "MGR-01",
    passwordHash: managerPasswordHash,
    role: "manager",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 7,
    name: "Dr. Imran Qureshi",
    email: "administration@cafeteria.com",
    enrollmentId: "ADM-01",
    passwordHash: adminPasswordHash,
    role: "admin",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 70,
    name: "University Administration",
    email: "admin@university.com",
    enrollmentId: "ADM-02",
    passwordHash: adminPasswordHash,
    role: "admin",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 8,
    name: "Karachi Fresh Supplies",
    email: "foodsupplier@cafeteria.com",
    enrollmentId: "SUP-01",
    passwordHash: supplierPasswordHash,
    role: "supplier",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 81,
    name: "Nehal",
    email: "foodsupplier1@cafeteria.com",
    enrollmentId: "SUP-03",
    passwordHash: hashPassword("lom"),
    role: "supplier",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 82,
    name: "Mudassir",
    email: "foodsupplier2@cafeteria.com",
    enrollmentId: "SUP-04",
    passwordHash: hashPassword("whenus"),
    role: "supplier",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 83,
    name: "Arhum",
    email: "foodsupplier3@cafeteria.com",
    enrollmentId: "SUP-05",
    passwordHash: hashPassword("pxy"),
    role: "supplier",
    walletBalance: 0,
    createdAt: new Date(),
  },
  {
    id: 80,
    name: "Karachi Fresh Supplies (Legacy)",
    email: "supplier@foods.com",
    enrollmentId: "SUP-02",
    passwordHash: supplierPasswordHash,
    role: "supplier",
    walletBalance: 0,
    createdAt: new Date(),
  },
];

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
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        let changed = false;
        // Ensure Hooria Adil is in the users list
        const hasHooria = parsed.users.some(
          (u: User) =>
            u.enrollmentId === "02-134251-019" ||
            u.email.toLowerCase() === "hooriaa619@gmail.com",
        );
        if (!hasHooria) {
          parsed.users.unshift(INITIAL_USERS[0]);
          changed = true;
        }

        const nimra = parsed.users.find(
          (u: User) => u.email.toLowerCase() === "nimrashaikh123@gmail.com",
        );
        if (nimra) {
          if (
            nimra.name !== "Nimra" ||
            nimra.enrollmentId !== "02-134251-089" ||
            nimra.passwordHash !== nimraPasswordHash ||
            nimra.role !== "student" ||
            nimra.walletBalance !== 3000
          ) {
            nimra.name = "Nimra";
            nimra.enrollmentId = "02-134251-089";
            nimra.passwordHash = nimraPasswordHash;
            nimra.role = "student";
            nimra.walletBalance = 3000;
            changed = true;
          }
        } else {
          parsed.users.splice(1, 0, INITIAL_USERS[1]);
          changed = true;
        }

        const amal = parsed.users.find(
          (u: User) => u.email.toLowerCase() === "amalfaraz890@gmail.com",
        );
        if (amal) {
          if (
            amal.name !== "Amal Faraz" ||
            amal.enrollmentId !== "02-134251-007" ||
            amal.passwordHash !== amalPasswordHash ||
            amal.role !== "student" ||
            amal.walletBalance !== 3500
          ) {
            amal.name = "Amal Faraz";
            amal.enrollmentId = "02-134251-007";
            amal.passwordHash = amalPasswordHash;
            amal.role = "student";
            amal.walletBalance = 3500;
            changed = true;
          }
        } else {
          parsed.users.splice(2, 0, INITIAL_USERS[2]);
          changed = true;
        }

        // Ensure official staff, manager, administration and food supplier accounts exist with correct passwords
        const requiredAccounts = [
          { email: "staff@cafeteria.com", role: "staff", hash: staffPasswordHash, name: "Bilal Raza", enrollmentId: "STAFF-01" },
          { email: "staff1@cafeteria.com", role: "staff", hash: hashPassword("12345"), name: "Nayel", enrollmentId: "STAFF-02" },
          { email: "staff2@cafeteria.com", role: "staff", hash: hashPassword("123456"), name: "Wahaj", enrollmentId: "STAFF-03" },
          { email: "staff3@cafeteria.com", role: "staff", hash: hashPassword("1234567"), name: "Rehan", enrollmentId: "STAFF-04" },
          { email: "staff4@cafeteria.com", role: "staff", hash: hashPassword("12345678"), name: "Ali", enrollmentId: "STAFF-05" },
          { email: "manager@cafeteria.com", role: "manager", hash: managerPasswordHash, name: "Nadia Sheikh", enrollmentId: "MGR-01" },
          { email: "administration@cafeteria.com", role: "admin", hash: adminPasswordHash, name: "Dr. Imran Qureshi", enrollmentId: "ADM-01" },
          { email: "admin@university.com", role: "admin", hash: adminPasswordHash, name: "University Administration", enrollmentId: "ADM-02" },
          { email: "foodsupplier@cafeteria.com", role: "supplier", hash: supplierPasswordHash, name: "Karachi Fresh Supplies", enrollmentId: "SUP-01" },
          { email: "foodsupplier1@cafeteria.com", role: "supplier", hash: hashPassword("lom"), name: "Nehal", enrollmentId: "SUP-03" },
          { email: "foodsupplier2@cafeteria.com", role: "supplier", hash: hashPassword("whenus"), name: "Mudassir", enrollmentId: "SUP-04" },
          { email: "foodsupplier3@cafeteria.com", role: "supplier", hash: hashPassword("pxy"), name: "Arhum", enrollmentId: "SUP-05" },
          { email: "supplier@foods.com", role: "supplier", hash: supplierPasswordHash, name: "Karachi Fresh Supplies (Legacy)", enrollmentId: "SUP-02" },
        ];

        for (const req of requiredAccounts) {
          const found = parsed.users.find((u: User) => u.email.toLowerCase() === req.email.toLowerCase());
          if (found) {
            if (found.passwordHash !== req.hash || found.role !== req.role) {
              found.passwordHash = req.hash;
              found.role = req.role;
              changed = true;
            }
          } else {
            const nextId = Math.max(...parsed.users.map((u: User) => u.id), 100) + 1;
            parsed.users.push({
              id: nextId,
              name: req.name,
              email: req.email,
              enrollmentId: req.enrollmentId,
              passwordHash: req.hash,
              role: req.role,
              walletBalance: 0,
              createdAt: new Date(),
            });
            changed = true;
          }
        }
        if (changed) {
          savePersistedData(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read cafeteria_store.json:", (err as Error).message);
  }

  const initial: PersistedData = {
    users: INITIAL_USERS,
    sessions: [],
    carts: [],
    orders: [],
  };
  savePersistedData(initial);
  return initial;
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
