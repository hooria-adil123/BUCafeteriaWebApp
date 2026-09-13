import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  inventoryLogs,
  menuItems,
  orderItems,
  orders,
  pickupSlots,
  restockRequests,
  users,
} from "@/db/schema";
import { hashPassword } from "@/lib/utils";

const MENU = [
  {
    name: "Biryani",
    description: "Fragrant basmati rice layered with spiced chicken, fried onions and raita on the side.",
    category: "Pakistani Food",
    pricePkr: 280,
    imageUrl:
      "https://images.pexels.com/photos/28674660/pexels-photo-28674660.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 42,
  },
  {
    name: "Spaghetti",
    description: "Classic spaghetti tossed in a rich tomato basil sauce with parmesan.",
    category: "Fast Food",
    pricePkr: 250,
    imageUrl:
      "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 30,
  },
  {
    name: "Pasta",
    description: "Creamy fettuccine pasta with mushrooms, herbs and a light garlic sauce.",
    category: "Fast Food",
    pricePkr: 240,
    imageUrl:
      "https://images.pexels.com/photos/5379639/pexels-photo-5379639.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 30,
  },
  {
    name: "Beef Burger",
    description: "Grilled beef patty, cheddar, lettuce, tomato and cafe sauce in a toasted bun.",
    category: "Fast Food",
    pricePkr: 350,
    imageUrl:
      "https://images.pexels.com/photos/2271101/pexels-photo-2271101.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 28,
  },
  {
    name: "Zinger Burger",
    description: "Crispy spicy fried chicken fillet with mayo and iceberg lettuce.",
    category: "Fast Food",
    pricePkr: 320,
    imageUrl:
      "https://images.pexels.com/photos/11975890/pexels-photo-11975890.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 35,
  },
  {
    name: "Chicken Burger",
    description: "Grilled chicken burger with cheese, fresh greens and BU cafe sauce.",
    category: "Fast Food",
    pricePkr: 280,
    imageUrl:
      "https://images.pexels.com/photos/6850423/pexels-photo-6850423.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 33,
  },
  {
    name: "Shawarma",
    description: "Loaded chicken shawarma wrap with garlic sauce, fries and pickled veggies.",
    category: "Fast Food",
    pricePkr: 220,
    imageUrl:
      "https://images.pexels.com/photos/5779364/pexels-photo-5779364.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 40,
  },
  {
    name: "Club Sandwich",
    description: "Triple-layer toasted club with chicken, egg, cheese, lettuce and fries.",
    category: "Fast Food",
    pricePkr: 260,
    imageUrl:
      "https://images.pexels.com/photos/34384842/pexels-photo-34384842.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 26,
  },
  {
    name: "Pizza",
    description: "Personal oven-baked pizza with mozzarella, pepperoni and oregano.",
    category: "Fast Food",
    pricePkr: 450,
    imageUrl:
      "https://images.pexels.com/photos/7813574/pexels-photo-7813574.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 22,
  },
  {
    name: "Loaded Fries",
    description: "Crispy fries smothered in cheese sauce, spices and savory toppings.",
    category: "Snacks",
    pricePkr: 200,
    imageUrl:
      "https://images.pexels.com/photos/21823086/pexels-photo-21823086.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 38,
  },
  {
    name: "Nutella Paratha",
    description: "Flaky tawa paratha filled and drizzled with warm Nutella chocolate.",
    category: "Breakfast",
    pricePkr: 180,
    imageUrl:
      "https://images.pexels.com/photos/33017545/pexels-photo-33017545.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 24,
  },
  {
    name: "Chicken Cheese Paratha",
    description: "Stuffed paratha with spiced chicken and molten cheese, served hot.",
    category: "Breakfast",
    pricePkr: 220,
    imageUrl:
      "https://images.pexels.com/photos/12737919/pexels-photo-12737919.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 27,
  },
  {
    name: "Cream Filled Donuts",
    description: "Soft donuts piped with vanilla cream and a light sugar dusting.",
    category: "Desserts",
    pricePkr: 120,
    imageUrl:
      "https://images.pexels.com/photos/8625940/pexels-photo-8625940.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 36,
  },
  {
    name: "Choc Frost Donuts",
    description: "Classic donuts with a thick chocolate frosting and sprinkles.",
    category: "Desserts",
    pricePkr: 130,
    imageUrl:
      "https://images.pexels.com/photos/3274104/pexels-photo-3274104.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 34,
  },
  {
    name: "Brownies",
    description: "Fudgy chocolate brownies with a crackly top — a campus favourite.",
    category: "Desserts",
    pricePkr: 150,
    imageUrl:
      "https://images.pexels.com/photos/33312981/pexels-photo-33312981.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 20,
  },
  {
    name: "Chai",
    description: "Strong doodh patti chai, freshly poured the desi way.",
    category: "Breakfast",
    pricePkr: 80,
    imageUrl:
      "https://images.pexels.com/photos/10389156/pexels-photo-10389156.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 80,
  },
  {
    name: "Cake Rusk",
    description: "Golden, twice-baked cake rusk served crisp with tea.",
    category: "Breakfast",
    pricePkr: 100,
    imageUrl:
      "https://images.pexels.com/photos/16942969/pexels-photo-16942969.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 45,
  },
  {
    name: "Aloo Paratha",
    description: "Crisp potato-stuffed paratha served with yogurt and chutney.",
    category: "Breakfast",
    pricePkr: 160,
    imageUrl:
      "https://images.pexels.com/photos/36681872/pexels-photo-36681872.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: true,
    stockCount: 30,
  },
  {
    name: "Daal Chawal",
    description: "Comforting lentils with steamed basmati rice and fresh herbs.",
    category: "Pakistani Food",
    pricePkr: 240,
    imageUrl:
      "https://images.pexels.com/photos/28674708/pexels-photo-28674708.jpeg?auto=compress&cs=tinysrgb&w=1200",
    available: true,
    popular: false,
    stockCount: 28,
  },
  {
    name: "Oreo Shake",
    description: "Thick Oreo cookie milkshake topped with whipped cream.",
    category: "Drinks",
    pricePkr: 250,
    imageUrl:
      "https://images.pexels.com/photos/16825488/pexels-photo-16825488.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: true,
    stockCount: 25,
  },
  {
    name: "Iced Coffee",
    description: "Chilled espresso poured over ice with a splash of milk.",
    category: "Drinks",
    pricePkr: 220,
    imageUrl:
      "https://images.pexels.com/photos/33542190/pexels-photo-33542190.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 29,
  },
  {
    name: "Caramel Coffee",
    description: "Smooth coffee with caramel drizzle and a creamy finish.",
    category: "Drinks",
    pricePkr: 240,
    imageUrl:
      "https://images.pexels.com/photos/6166478/pexels-photo-6166478.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 21,
  },
  {
    name: "Spanish Latte",
    description: "Layered Spanish latte with condensed milk and espresso.",
    category: "Drinks",
    pricePkr: 260,
    imageUrl:
      "https://images.pexels.com/photos/18281882/pexels-photo-18281882.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 18,
  },
  {
    name: "Water Bottle",
    description: "Chilled 500ml drinking water bottle.",
    category: "Drinks",
    pricePkr: 50,
    imageUrl:
      "https://images.pexels.com/photos/8217434/pexels-photo-8217434.jpeg?auto=compress&cs=tinysrgb&w=900",
    available: true,
    popular: false,
    stockCount: 120,
  },
];

const SLOTS = [
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
  "12:15 PM",
  "12:30 PM",
  "12:45 PM",
  "1:00 PM",
  "1:15 PM",
  "1:30 PM",
  "1:45 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "4:00 PM",
];

let seeding: Promise<void> | null = null;

export async function ensureSeeded() {
  if (!process.env.DATABASE_URL) return;
  try {
    if (!seeding) {
      seeding = seedIfNeeded().finally(() => {
        seeding = null;
      });
    }
    await seeding;
  } catch (err) {
    console.warn("Database not available for seeding:", (err as Error).message);
  }
}

async function seedIfNeeded() {
  const [{ value }] = await db.select({ value: count() }).from(users);
  if (value > 0) {
    await ensurePortalAccounts();
    await ensureRequestedMenuItems();
    return;
  }

  const passwordHash = hashPassword("1234");
  const staffHash = hashPassword("12345");
  const managerHash = hashPassword("123456");
  const adminHash = hashPassword("1234567");
  const supplierHash = hashPassword("12345678");

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Hooria Adil",
        email: "hooriaa619@gmail.com",
        enrollmentId: "02-134251-019",
        passwordHash,
        role: "student",
        walletBalance: 5000,
      },
      {
        name: "Nimra",
        email: "nimrashaikh123@gmail.com",
        enrollmentId: "02-134251-089",
        passwordHash: hashPassword("abcd"),
        role: "student",
        walletBalance: 3000,
      },
      {
        name: "Amal Faraz",
        email: "amalfaraz890@gmail.com",
        enrollmentId: "02-134251-007",
        passwordHash: hashPassword("xyz"),
        role: "student",
        walletBalance: 3500,
      },
      {
        name: "Ali Khan",
        email: "student@university.com",
        enrollmentId: "01-134221-001",
        passwordHash,
        role: "student",
        walletBalance: 5000,
      },
      {
        name: "Sara Ahmed",
        email: "sara@university.com",
        enrollmentId: "01-134221-042",
        passwordHash,
        role: "student",
        walletBalance: 1800,
      },
      {
        name: "Hassan Malik",
        email: "hassan@university.com",
        enrollmentId: "01-134221-078",
        passwordHash,
        role: "student",
        walletBalance: 3200,
      },
      {
        name: "Ayesha Noor",
        email: "ayesha@university.com",
        enrollmentId: "01-134221-119",
        passwordHash,
        role: "student",
        walletBalance: 900,
      },
      {
        name: "Bilal Raza",
        email: "staff@cafeteria.com",
        enrollmentId: "STAFF-01",
        passwordHash: staffHash,
        role: "staff",
        walletBalance: 0,
      },
      {
        name: "Nayel",
        email: "staff1@cafeteria.com",
        enrollmentId: "STAFF-02",
        passwordHash: hashPassword("12345"),
        role: "staff",
        walletBalance: 0,
      },
      {
        name: "Wahaj",
        email: "staff2@cafeteria.com",
        enrollmentId: "STAFF-03",
        passwordHash: hashPassword("123456"),
        role: "staff",
        walletBalance: 0,
      },
      {
        name: "Rehan",
        email: "staff3@cafeteria.com",
        enrollmentId: "STAFF-04",
        passwordHash: hashPassword("1234567"),
        role: "staff",
        walletBalance: 0,
      },
      {
        name: "Ali",
        email: "staff4@cafeteria.com",
        enrollmentId: "STAFF-05",
        passwordHash: hashPassword("12345678"),
        role: "staff",
        walletBalance: 0,
      },
      {
        name: "Nadia Sheikh",
        email: "manager@cafeteria.com",
        enrollmentId: "MGR-01",
        passwordHash: managerHash,
        role: "manager",
        walletBalance: 0,
      },
      {
        name: "Dr. Imran Qureshi",
        email: "administration@cafeteria.com",
        enrollmentId: "ADM-01",
        passwordHash: adminHash,
        role: "admin",
        walletBalance: 0,
      },
      {
        name: "University Administration",
        email: "admin@university.com",
        enrollmentId: "ADM-02",
        passwordHash: adminHash,
        role: "admin",
        walletBalance: 0,
      },
      {
        name: "Karachi Fresh Supplies",
        email: "foodsupplier@cafeteria.com",
        enrollmentId: "SUP-01",
        passwordHash: supplierHash,
        role: "supplier",
        walletBalance: 0,
      },
      {
        name: "Nehal",
        email: "foodsupplier1@cafeteria.com",
        enrollmentId: "SUP-03",
        passwordHash: hashPassword("lom"),
        role: "supplier",
        walletBalance: 0,
      },
      {
        name: "Mudassir",
        email: "foodsupplier2@cafeteria.com",
        enrollmentId: "SUP-04",
        passwordHash: hashPassword("whenus"),
        role: "supplier",
        walletBalance: 0,
      },
      {
        name: "Arhum",
        email: "foodsupplier3@cafeteria.com",
        enrollmentId: "SUP-05",
        passwordHash: hashPassword("pxy"),
        role: "supplier",
        walletBalance: 0,
      },
      {
        name: "Karachi Fresh Supplies (Legacy)",
        email: "supplier@foods.com",
        enrollmentId: "SUP-02",
        passwordHash: supplierHash,
        role: "supplier",
        walletBalance: 0,
      },
    ])
    .returning();

  const student = insertedUsers[0];
  const sara = insertedUsers[1];
  const hassan = insertedUsers[2];
  const manager = insertedUsers[5];
  const supplier = insertedUsers[7];

  const insertedMenu = await db.insert(menuItems).values(MENU).returning();
  const byName = Object.fromEntries(insertedMenu.map((item) => [item.name, item]));

  const insertedSlots = await db
    .insert(pickupSlots)
    .values(SLOTS.map((label, i) => ({ label, sortOrder: i + 1, capacity: 10, active: true })))
    .returning();

  const slotAt = (label: string) => insertedSlots.find((s) => s.label === label)!;

  const sampleOrders = [
    {
      studentId: student.id,
      slot: slotAt("12:30 PM"),
      status: "preparing",
      payment: "wallet",
      items: [
        { item: byName["Biryani"], qty: 1 },
        { item: byName["Chai"], qty: 1 },
      ],
      minutesAgo: 25,
    },
    {
      studentId: sara.id,
      slot: slotAt("12:45 PM"),
      status: "placed",
      payment: "cash",
      items: [
        { item: byName["Zinger Burger"], qty: 1 },
        { item: byName["Loaded Fries"], qty: 1 },
      ],
      minutesAgo: 8,
    },
    {
      studentId: hassan.id,
      slot: slotAt("1:00 PM"),
      status: "accepted",
      payment: "wallet",
      items: [
        { item: byName["Pizza"], qty: 1 },
        { item: byName["Oreo Shake"], qty: 1 },
      ],
      minutesAgo: 18,
    },
    {
      studentId: sara.id,
      slot: slotAt("12:15 PM"),
      status: "ready",
      payment: "cash",
      items: [{ item: byName["Shawarma"], qty: 2 }],
      minutesAgo: 40,
    },
    {
      studentId: hassan.id,
      slot: slotAt("11:45 AM"),
      status: "picked_up",
      payment: "wallet",
      items: [
        { item: byName["Club Sandwich"], qty: 1 },
        { item: byName["Iced Coffee"], qty: 1 },
      ],
      minutesAgo: 90,
    },
  ];

  let orderSeq = 1042;
  for (const sample of sampleOrders) {
    const total = sample.items.reduce((sum, row) => sum + row.item.pricePkr * row.qty, 0);
    const createdAt = new Date(Date.now() - sample.minutesAgo * 60_000);
    const acceptedAt =
      sample.status === "placed" ? null : new Date(createdAt.getTime() + 3 * 60_000);
    const preparingAt = ["preparing", "ready", "picked_up"].includes(sample.status)
      ? new Date(createdAt.getTime() + 8 * 60_000)
      : null;
    const readyAt = ["ready", "picked_up"].includes(sample.status)
      ? new Date(createdAt.getTime() + 16 * 60_000)
      : null;
    const pickedUpAt =
      sample.status === "picked_up" ? new Date(createdAt.getTime() + 22 * 60_000) : null;

    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: `BU-${orderSeq++}`,
        studentId: sample.studentId,
        pickupSlotId: sample.slot.id,
        paymentMethod: sample.payment,
        status: sample.status,
        totalPkr: total,
        createdAt,
        acceptedAt,
        preparingAt,
        readyAt,
        pickedUpAt,
      })
      .returning();

    await db.insert(orderItems).values(
      sample.items.map((row) => ({
        orderId: order.id,
        menuItemId: row.item.id,
        name: row.item.name,
        unitPrice: row.item.pricePkr,
        quantity: row.qty,
      })),
    );
  }

  // Fill the 1:00 PM slot to demonstrate rush-hour capacity (10/10).
  const fullSlot = slotAt("1:00 PM");
  const fillerStudents = [student.id, sara.id, hassan.id, insertedUsers[3].id];
  for (let i = 0; i < 9; i++) {
    const item = byName["Beef Burger"];
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber: `BU-${orderSeq++}`,
        studentId: fillerStudents[i % fillerStudents.length],
        pickupSlotId: fullSlot.id,
        paymentMethod: i % 2 === 0 ? "cash" : "wallet",
        status: i < 3 ? "picked_up" : "accepted",
        totalPkr: item.pricePkr,
        createdAt: new Date(Date.now() - (50 - i) * 60_000),
      })
      .returning();
    await db.insert(orderItems).values({
      orderId: order.id,
      menuItemId: item.id,
      name: item.name,
      unitPrice: item.pricePkr,
      quantity: 1,
    });
  }

  await db.insert(restockRequests).values([
    {
      menuItemId: byName["Spaghetti"].id,
      quantity: 40,
      status: "pending",
      requestedBy: manager.id,
      notes: "Spaghetti sold out during lunch rush. Please deliver before 11 AM tomorrow.",
    },
    {
      menuItemId: byName["Brownies"].id,
      quantity: 24,
      status: "shipped",
      requestedBy: manager.id,
      notes: "Dessert restock for Friday.",
    },
  ]);

  await db.insert(inventoryLogs).values({
    menuItemId: byName["Chai"].id,
    supplierId: supplier.id,
    quantity: 50,
    note: "Weekly tea supplies delivered.",
  });
}

async function ensurePortalAccounts() {
  const accounts = [
    {
      name: "Nimra",
      email: "nimrashaikh123@gmail.com",
      enrollmentId: "02-134251-089",
      passwordHash: hashPassword("abcd"),
      role: "student",
      walletBalance: 3000,
    },
    {
      name: "Amal Faraz",
      email: "amalfaraz890@gmail.com",
      enrollmentId: "02-134251-007",
      passwordHash: hashPassword("xyz"),
      role: "student",
      walletBalance: 3500,
    },
    {
      name: "Bilal Raza",
      email: "staff@cafeteria.com",
      enrollmentId: "STAFF-01",
      passwordHash: hashPassword("12345"),
      role: "staff",
      walletBalance: 0,
    },
    {
      name: "Nayel",
      email: "staff1@cafeteria.com",
      enrollmentId: "STAFF-02",
      passwordHash: hashPassword("12345"),
      role: "staff",
      walletBalance: 0,
    },
    {
      name: "Wahaj",
      email: "staff2@cafeteria.com",
      enrollmentId: "STAFF-03",
      passwordHash: hashPassword("123456"),
      role: "staff",
      walletBalance: 0,
    },
    {
      name: "Rehan",
      email: "staff3@cafeteria.com",
      enrollmentId: "STAFF-04",
      passwordHash: hashPassword("1234567"),
      role: "staff",
      walletBalance: 0,
    },
    {
      name: "Ali",
      email: "staff4@cafeteria.com",
      enrollmentId: "STAFF-05",
      passwordHash: hashPassword("12345678"),
      role: "staff",
      walletBalance: 0,
    },
    {
      name: "Nadia Sheikh",
      email: "manager@cafeteria.com",
      enrollmentId: "MGR-01",
      passwordHash: hashPassword("123456"),
      role: "manager",
      walletBalance: 0,
    },
    {
      name: "Dr. Imran Qureshi",
      email: "administration@cafeteria.com",
      enrollmentId: "ADM-01",
      passwordHash: hashPassword("1234567"),
      role: "admin",
      walletBalance: 0,
    },
    {
      name: "Karachi Fresh Supplies",
      email: "foodsupplier@cafeteria.com",
      enrollmentId: "SUP-01",
      passwordHash: hashPassword("12345678"),
      role: "supplier",
      walletBalance: 0,
    },
    {
      name: "Nehal",
      email: "foodsupplier1@cafeteria.com",
      enrollmentId: "SUP-03",
      passwordHash: hashPassword("lom"),
      role: "supplier",
      walletBalance: 0,
    },
    {
      name: "Mudassir",
      email: "foodsupplier2@cafeteria.com",
      enrollmentId: "SUP-04",
      passwordHash: hashPassword("whenus"),
      role: "supplier",
      walletBalance: 0,
    },
    {
      name: "Arhum",
      email: "foodsupplier3@cafeteria.com",
      enrollmentId: "SUP-05",
      passwordHash: hashPassword("pxy"),
      role: "supplier",
      walletBalance: 0,
    },
  ] as const;

  for (const account of accounts) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, account.email))
      .limit(1);

    if (existing[0]) {
      await db
        .update(users)
        .set({
          enrollmentId: account.enrollmentId,
          passwordHash: account.passwordHash,
          role: account.role,
          ...(account.walletBalance === undefined ? {} : { walletBalance: account.walletBalance }),
        })
        .where(eq(users.id, existing[0].id));
    } else {
      await db.insert(users).values({
        ...account,
        walletBalance: account.walletBalance ?? 0,
      });
    }
  }
}

async function ensureRequestedMenuItems() {
  const requestedNames = [
    "Chicken Cheese Paratha",
    "Nutella Paratha",
    "Chai",
    "Cake Rusk",
    "Aloo Paratha",
    "Daal Chawal",
  ];
  const requestedItems = MENU.filter((item) => requestedNames.includes(item.name));

  for (const item of requestedItems) {
    const existing = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.name, item.name))
      .limit(1);

    if (existing[0]) {
      await db
        .update(menuItems)
        .set({
          description: item.description,
          category: item.category,
          imageUrl: item.imageUrl,
          popular: item.popular,
        })
        .where(eq(menuItems.id, existing[0].id));
    } else {
      await db.insert(menuItems).values(item);
    }
  }
}
