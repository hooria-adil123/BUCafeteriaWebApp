import { and, asc, count, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartItems,
  menuItems,
  orderItems,
  orders,
  pickupSlots,
  restockRequests,
  users,
  type User,
  type Order,
  type OrderItem,
  type PickupSlot,
} from "@/db/schema";
import { startOfToday } from "@/lib/utils";
import {
  FALLBACK_MENU,
  FALLBACK_SLOTS,
  fallbackCarts,
  fallbackOrders,
  fallbackUsers,
} from "@/lib/store";

export async function getMenu() {
  try {
    const items = await db.select().from(menuItems).orderBy(asc(menuItems.id));
    return items.length > 0 ? items : FALLBACK_MENU;
  } catch {
    return FALLBACK_MENU;
  }
}

export async function getCart(userId: number) {
  try {
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        menuItem: menuItems,
      })
      .from(cartItems)
      .innerJoin(menuItems, eq(cartItems.menuItemId, menuItems.id))
      .where(eq(cartItems.userId, userId));
    return items.length > 0 ? items : fallbackCarts.get(userId) ?? [];
  } catch {
    return fallbackCarts.get(userId) ?? [];
  }
}

export async function todaySlotUsage() {
  try {
    const start = startOfToday();
    const rows = await db
      .select({
        pickupSlotId: orders.pickupSlotId,
        booked: count(orders.id),
      })
      .from(orders)
      .where(gte(orders.createdAt, start))
      .groupBy(orders.pickupSlotId);
    if (rows.length === 0 && fallbackOrders.length > 0) {
      const fallbackUsage = new Map<number, number>();
      for (const order of fallbackOrders) {
        if (order.createdAt >= start) {
          fallbackUsage.set(order.pickupSlotId, (fallbackUsage.get(order.pickupSlotId) ?? 0) + 1);
        }
      }
      return Object.fromEntries(fallbackUsage);
    }
    return Object.fromEntries(rows.map((r) => [r.pickupSlotId, Number(r.booked)]));
  } catch {
    return {};
  }
}

export async function getSlotsWithUsage() {
  let slots = FALLBACK_SLOTS;
  try {
    const dbSlots = await db.select().from(pickupSlots).orderBy(asc(pickupSlots.sortOrder));
    if (dbSlots.length > 0) slots = dbSlots;
  } catch {
    // DB offline, use fallback slots
  }
  const usage = await todaySlotUsage();
  return slots.map((slot) => {
    const booked = usage[slot.id] ?? 0;
    return {
      ...slot,
      booked,
      remaining: Math.max(0, slot.capacity - booked),
      full: booked >= slot.capacity,
    };
  });
}

export async function getOrderWithItems(
  orderId: number,
): Promise<(Order & { items: OrderItem[]; student?: User | null; slot?: PickupSlot | null }) | null> {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      const found = fallbackOrders.find((o) => o.id === orderId);
      if (!found) return null;
      const student = fallbackUsers.find((u) => u.id === found.studentId) ?? found.student ?? null;
      return { ...found, student, slot: found.slot ?? null };
    }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    const [student] = await db.select().from(users).where(eq(users.id, order.studentId)).limit(1);
    const [slot] = await db
      .select()
      .from(pickupSlots)
      .where(eq(pickupSlots.id, order.pickupSlotId))
      .limit(1);
    return { ...order, items, student: student ?? null, slot: slot ?? null };
  } catch {
    const found = fallbackOrders.find((o) => o.id === orderId);
    if (!found) return null;
    const student = fallbackUsers.find((u) => u.id === found.studentId) ?? found.student ?? null;
    return { ...found, student, slot: found.slot ?? null };
  }
}

export async function listOrders(filters?: { studentId?: number; status?: string }) {
  try {
    const conditions = [];
    if (filters?.studentId) conditions.push(eq(orders.studentId, filters.studentId));
    if (filters?.status) conditions.push(eq(orders.status, filters.status));

    const rows = await db
      .select({
        order: orders,
        studentName: users.name,
        enrollmentId: users.enrollmentId,
        slotLabel: pickupSlots.label,
      })
      .from(orders)
      .innerJoin(users, eq(orders.studentId, users.id))
      .innerJoin(pickupSlots, eq(orders.pickupSlotId, pickupSlots.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt));

    if (rows.length === 0 && fallbackOrders.length > 0) {
      let filtered = [...fallbackOrders];
      if (filters?.studentId) filtered = filtered.filter((o) => o.studentId === filters.studentId);
      if (filters?.status) filtered = filtered.filter((o) => o.status === filters.status);
      return filtered.map((o) => {
        const student = fallbackUsers.find((u) => u.id === o.studentId) ?? o.student;
        return {
          ...o,
          studentName: student?.name ?? "Student",
          enrollmentId: student?.enrollmentId ?? "",
          slotLabel: o.slot?.label ?? "Pickup Slot",
          items: o.items ?? [],
        };
      });
    }

    const ids = rows.map((r) => r.order.id);
    const items =
      ids.length === 0
        ? []
        : await db.select().from(orderItems).where(inArray(orderItems.orderId, ids));
    const byOrder = new Map<number, typeof items>();
    for (const item of items) {
      const list = byOrder.get(item.orderId) ?? [];
      list.push(item);
      byOrder.set(item.orderId, list);
    }

    return rows.map((r) => ({
      ...r.order,
      studentName: r.studentName,
      enrollmentId: r.enrollmentId,
      slotLabel: r.slotLabel,
      items: byOrder.get(r.order.id) ?? [],
    }));
  } catch {
    let filtered = [...fallbackOrders];
    if (filters?.studentId) filtered = filtered.filter((o) => o.studentId === filters.studentId);
    if (filters?.status) filtered = filtered.filter((o) => o.status === filters.status);
    return filtered.map((o) => {
      const student = fallbackUsers.find((u) => u.id === o.studentId) ?? o.student;
      return {
        ...o,
        studentName: student?.name ?? "Student",
        enrollmentId: student?.enrollmentId ?? "",
        slotLabel: o.slot?.label ?? "Pickup Slot",
        items: o.items ?? [],
      };
    });
  }
}

export async function getDashboardStats() {
  try {
    const start = startOfToday();
    const todayOrders = await db.select().from(orders).where(gte(orders.createdAt, start));
    const allOrders = await db.select().from(orders);
    const useFallbackOrders = allOrders.length === 0 && fallbackOrders.length > 0;
    const statsOrders = useFallbackOrders ? fallbackOrders : allOrders;
    const statsTodayOrders = useFallbackOrders
      ? fallbackOrders.filter((order) => order.createdAt >= start)
      : todayOrders;
    const students = await db.select().from(users).where(eq(users.role, "student"));
    const menu = await db.select().from(menuItems);
    const slots = await getSlotsWithUsage();

    const salesToday = statsTodayOrders.reduce((s, o) => s + o.totalPkr, 0);
    const pending = statsTodayOrders.filter((o) => o.status === "placed" || o.status === "accepted").length;
    const completed = statsTodayOrders.filter((o) => o.status === "picked_up");

    const durations = completed
      .map((o) => {
        if (!o.pickedUpAt) return null;
        return (o.pickedUpAt.getTime() - o.createdAt.getTime()) / 60000;
      })
      .filter((n): n is number => n !== null);
    const avgMinutes =
      durations.length === 0
        ? 0
        : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    const itemCounts = new Map<string, number>();
    const todayIds = statsTodayOrders.map((o) => o.id);
    const items = useFallbackOrders
      ? statsTodayOrders.flatMap((order) => (order as (typeof fallbackOrders)[number]).items ?? [])
      : todayIds.length === 0
        ? []
        : await db.select().from(orderItems).where(inArray(orderItems.orderId, todayIds));
    for (const item of items) {
      itemCounts.set(item.name, (itemCounts.get(item.name) ?? 0) + item.quantity);
    }
    const popular = [...itemCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    const peak = [...slots].sort((a, b) => b.booked - a.booked)[0];
    const outOfStock = menu.filter((m) => !m.available || m.stockCount <= 0);

    const statusCounts = {
      placed: statsTodayOrders.filter((o) => o.status === "placed").length,
      accepted: statsTodayOrders.filter((o) => o.status === "accepted").length,
      preparing: statsTodayOrders.filter((o) => o.status === "preparing").length,
      ready: statsTodayOrders.filter((o) => o.status === "ready").length,
      picked_up: statsTodayOrders.filter((o) => o.status === "picked_up").length,
    };

    const restockPending = await db
      .select({ value: count() })
      .from(restockRequests)
      .where(eq(restockRequests.status, "pending"));

    return {
      totalOrdersToday: statsTodayOrders.length,
      salesToday,
      pending,
      avgMinutes,
      popular,
      peakSlot: peak ? { label: peak.label, booked: peak.booked, capacity: peak.capacity } : null,
      outOfStock,
      activeStudents: students.length,
      totalOrdersAll: statsOrders.length,
      totalSalesAll: statsOrders.reduce((s, o) => s + o.totalPkr, 0),
      statusCounts,
      slots,
      menuCount: menu.length,
      restockPending: Number(restockPending[0]?.value ?? 0),
    };
  } catch {
    const slots = await getSlotsWithUsage();
    const students = fallbackUsers.filter((u) => u.role === "student");
    const menu = FALLBACK_MENU;
    const ordersList = fallbackOrders;
    const salesToday = ordersList.reduce((s, o) => s + o.totalPkr, 0);
    const pending = ordersList.filter((o) => o.status === "placed" || o.status === "accepted").length;
    const outOfStock = menu.filter((m) => !m.available || m.stockCount <= 0);
    const peak = [...slots].sort((a, b) => b.booked - a.booked)[0];

    return {
      totalOrdersToday: ordersList.length,
      salesToday,
      pending,
      avgMinutes: 12,
      popular: menu.slice(0, 5).map((m) => ({ name: m.name, qty: 15 })),
      peakSlot: peak ? { label: peak.label, booked: peak.booked, capacity: peak.capacity } : null,
      outOfStock,
      activeStudents: students.length,
      totalOrdersAll: ordersList.length,
      totalSalesAll: salesToday,
      statusCounts: {
        placed: ordersList.filter((o) => o.status === "placed").length,
        accepted: ordersList.filter((o) => o.status === "accepted").length,
        preparing: ordersList.filter((o) => o.status === "preparing").length,
        ready: ordersList.filter((o) => o.status === "ready").length,
        picked_up: ordersList.filter((o) => o.status === "picked_up").length,
      },
      slots,
      menuCount: menu.length,
      restockPending: 0,
    };
  }
}

export async function nextOrderNumber() {
  const [row] = await db
    .select({ maxNum: sql<number>`coalesce(max(cast(split_part(${orders.orderNumber}, '-', 2) as int)), 1041)` })
    .from(orders);
  return `BU-${Number(row?.maxNum ?? 1041) + 1}`;
}
