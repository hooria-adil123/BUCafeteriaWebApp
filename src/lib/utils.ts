import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function newId() {
  return randomBytes(24).toString("hex");
}

export function formatPkr(amount: number) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });
}

export const ORDER_PLACEMENT_WINDOW = "8:30 AM – 5:20 PM";
export const CAFE_OPEN_MINUTES = 8 * 60 + 30; // 510 minutes -> 8:30 AM
export const CAFE_CLOSE_MINUTES = 17 * 60 + 20; // 1040 minutes -> 5:20 PM
export const CAFE_TIME_ZONE =
  process.env.CAFE_TIME_ZONE ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

export type CafeHoursMode = "auto" | "open" | "closed";

export function getCafeTimeMinutes(value = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAFE_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function isWithinOrderPlacementHours(
  value = new Date(),
  overrideMode?: CafeHoursMode | null,
) {
  if (overrideMode === "open") return true;
  if (overrideMode === "closed") return false;

  const currentMinutes = getCafeTimeMinutes(value);
  return currentMinutes >= CAFE_OPEN_MINUTES && currentMinutes < CAFE_CLOSE_MINUTES;
}

export function getCafeteriaStatus(
  value = new Date(),
  overrideMode?: CafeHoursMode | null,
) {
  const isOpen = isWithinOrderPlacementHours(value, overrideMode);
  return {
    isOpen,
    window: ORDER_PLACEMENT_WINDOW,
    message: isOpen
      ? `The cafeteria is currently open for orders (${ORDER_PLACEMENT_WINDOW}).`
      : `The cafeteria has been closed. Orders can only be placed and accepted between ${ORDER_PLACEMENT_WINDOW}.`,
  };
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_FLOW = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
] as const;

export type OrderStatus = (typeof ORDER_FLOW)[number];

export const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked Up",
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  placed: "Your order is in the cafeteria queue.",
  accepted: "The cafeteria has accepted your order.",
  preparing: "Your meal is being prepared fresh.",
  ready: "Your order is ready for pickup.",
  picked_up: "Your order has been picked up. Enjoy your meal!",
};

export const ROLE_LABELS: Record<string, string> = {
  student: "Student",
  staff: "Cafeteria Staff",
  manager: "Cafeteria Manager",
  admin: "University Administrator",
  supplier: "Food Supplier",
};

export const CATEGORIES = [
  "Breakfast",
  "Fast Food",
  "Pakistani Food",
  "Snacks",
  "Drinks",
  "Desserts",
] as const;

export function nextStatus(status: string) {
  const i = ORDER_FLOW.indexOf(status as OrderStatus);
  if (i < 0 || i >= ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1];
}

export function statusIndex(status: string) {
  const index = ORDER_FLOW.indexOf(status as OrderStatus);
  return index < 0 ? 0 : index;
}

export function minutesBetween(a: Date | null, b: Date | null) {
  if (!a || !b) return null;
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 60000));
}
