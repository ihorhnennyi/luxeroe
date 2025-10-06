// src/app/api/order/route.ts
import { sendOrderToLpCrm } from "@/lib/lpcrm";
import { sendOrderToTelegram, type OrderPayload } from "@/lib/telegram";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OrderPayload;

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

    const safeCustomer = {
      firstName: c.firstName.trim(),
      lastName: c.lastName.trim(),
      phone: c.phone.trim(),
      city: c.city.trim(),
      branch: c.branch.trim(),
    };

    const source =
      body.source ||
      (process.env.SITE_URL ? `${process.env.SITE_URL}/cart` : undefined);

    console.log("[ORDER] incoming", {
      items: body.items.map((i) => ({
        id: i.id,
        qty: i.qty,
        lineTotal: i.lineTotal,
        type: (i as any).type,
      })),
      customer: {
        firstName: safeCustomer.firstName[0] + "***",
        lastName: safeCustomer.lastName[0] + "***",
        phone: safeCustomer.phone
          .replace(/\D+/g, "")
          .replace(/^(\d{3})\d+(..)$/, "$1***$2"),
        city: safeCustomer.city,
        branch: safeCustomer.branch,
      },
    });

    const [tgRes, lpcrmRes] = await Promise.allSettled([
      sendOrderToTelegram({ ...body, customer: safeCustomer, source }),
      sendOrderToLpCrm({
        customer: { ...safeCustomer, email: undefined },
        items: body.items.map((it: any) => ({
          id: it.id,
          qty: Math.max(1, it.qty),
          lineTotal:
            typeof it.lineTotal === "number" ? it.lineTotal : undefined,
          price: typeof it.price === "number" ? it.price : undefined,
          type: it.type, // пробросим, чтобы bundles ушли как subs
        })),
        comment: body.note,
        utm: source ? { utm_source: new URL(source).hostname } : undefined,
      }),
    ]);

    const lpOk = lpcrmRes.status === "fulfilled";
    const tgOk = tgRes.status === "fulfilled";

    if (!lpOk) {
      console.error(
        "[ORDER] LPCRM FAIL:",
        (lpcrmRes as PromiseRejectedResult).reason
      );
    }
    if (!tgOk) {
      console.error(
        "[ORDER] TG FAIL:",
        (tgRes as PromiseRejectedResult).reason
      );
    }

    return NextResponse.json({
      ok: tgOk && lpOk,
      telegramOk: tgOk,
      lpcrmOk: lpOk,
    });
  } catch (e: any) {
    console.error("Order error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
