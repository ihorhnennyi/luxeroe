// src/app/api/order/route.ts
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderPayload;

    // прості валідації
    const c = body?.customer;
    if (
      !c?.firstName?.trim() ||
      !c?.lastName?.trim() ||
      !/^\+?\d[\d\s-]{8,}$/.test((c?.phone ?? "").trim()) ||
      !c?.city?.trim() ||
      !c?.branch?.trim() ||
      !Array.isArray(body?.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { ok: false, error: "Bad input" },
        { status: 400 }
      );
    }

    await sendOrderToTelegram({
      ...body,
      customer: {
        firstName: c.firstName.trim(),
        lastName: c.lastName.trim(),
        phone: c.phone.trim(),
        city: c.city.trim(),
        branch: c.branch.trim(),
      },
      // підстрахуємо source
      source:
        body.source || process.env.SITE_URL
          ? `${process.env.SITE_URL}/cart`
          : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Order error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
