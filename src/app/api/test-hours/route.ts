import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getCafeteriaStatus,
  isWithinOrderPlacementHours,
  type CafeHoursMode,
  ORDER_PLACEMENT_WINDOW,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export const HOURS_MODE_COOKIE = "bu_cafe_hours_mode";

export async function GET() {
  const cookieStore = await cookies();
  const rawMode = cookieStore.get(HOURS_MODE_COOKIE)?.value;
  const mode: CafeHoursMode =
    rawMode === "open" || rawMode === "closed" ? rawMode : "auto";

  const status = getCafeteriaStatus(new Date(), mode);

  return NextResponse.json({
    mode,
    isOpen: status.isOpen,
    window: ORDER_PLACEMENT_WINDOW,
    message: status.message,
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { mode?: CafeHoursMode };
  const mode: CafeHoursMode =
    body.mode === "open" || body.mode === "closed" ? body.mode : "auto";

  const status = getCafeteriaStatus(new Date(), mode);
  const response = NextResponse.json({
    mode,
    isOpen: status.isOpen,
    window: ORDER_PLACEMENT_WINDOW,
    message: status.message,
  });

  if (mode === "auto") {
    response.cookies.delete(HOURS_MODE_COOKIE);
  } else {
    response.cookies.set(HOURS_MODE_COOKIE, mode, {
      httpOnly: false, // accessible to client for instant UI reactivity
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}
