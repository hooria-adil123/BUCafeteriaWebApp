import { getCafeteriaStatus, ORDER_PLACEMENT_WINDOW } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getCafeteriaStatus(new Date());
  return Response.json({
    isOpen: status.isOpen,
    window: ORDER_PLACEMENT_WINDOW,
    message: status.message,
  });
}
