// src/lib/lpcrm.ts

/* ===================== types ===================== */
type LpCrmProduct = {
  product_id: string | number;
  price: number; // per unit / per bundle
  count: number | string;
  subs?: Array<{ sub_id: string | number; count: number | string }>;
};

export type LpCrmOrderPayload = {
  key: string;
  order_id: string; // 11 digits
  country: string;
  office?: string;
  products: LpCrmProduct[]; // will be php-serialized + urlencode
  bayer_name: string;
  phone: string; // digits only
  email?: string;
  comment?: string;
  notification?: string;
  delivery?: string;
  delivery_adress?: string;
  payment?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  utm_campaign?: string;
  additional_1?: string;
  additional_2?: string;
  additional_3?: string;
  additional_4?: string;
};

type CartItemForCrm = {
  id: string;
  qty: number;
  lineTotal?: number;
  price?: number;
  type?: "single" | "bundle";
};

/* ===================== helpers ===================== */
const LOG = (process.env.LOG_LPCRM ?? "1") !== "0";

function maskPhone(p: string) {
  const d = (p || "").replace(/\D+/g, "");
  if (d.length <= 4) return "***";
  return d.slice(0, 3) + "***" + d.slice(-2);
}
function maskName(n: string) {
  if (!n) return "";
  return n[0] + "***";
}

// minimal PHP serialize
function phpSerialize(val: any): string {
  if (val === null) return "N;";
  const t = typeof val;
  if (t === "number") return Number.isInteger(val) ? `i:${val};` : `d:${val};`;
  if (t === "boolean") return `b:${val ? 1 : 0};`;
  if (t === "string") {
    const len = new TextEncoder().encode(val).length;
    return `s:${len}:"${val}";`;
  }
  if (Array.isArray(val)) {
    let out = "";
    for (let i = 0; i < val.length; i++)
      out += `i:${i};${phpSerialize(val[i])}`;
    return `a:${val.length}:{${out}}`;
  }
  if (t === "object") {
    const keys = Object.keys(val);
    let out = "";
    for (const k of keys) out += `${phpSerialize(k)}${phpSerialize(val[k])}`;
    return `a:${keys.length}:{${out}}`;
  }
  return phpSerialize(String(val));
}

const urlencode = (s: string) => encodeURIComponent(s);

function generateOrderId(): string {
  const secs = Math.floor(Date.now() / 1000); // 10 digits
  const last = Math.floor(Math.random() * 10); // 1 digit
  return `${secs}${last}`;
}

function cleanPhoneToDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function toForm(body: Record<string, any>) {
  const fd = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined || v === null || v === "") continue;
    fd.append(k, String(v));
  }
  return fd;
}

function unitPrice(it: CartItemForCrm): number {
  if (typeof it.price === "number") return it.price;
  const qty = Math.max(1, it.qty);
  if (typeof it.lineTotal === "number" && qty > 0) {
    return Math.round(it.lineTotal / qty);
  }
  return 0;
}

/* ----- bundle → subs rules (под себя) ----- */
const BUNDLE_RULES: Record<
  string,
  { subs: Array<{ sub_id: string; count: number }> }
> = {
  "bundle-gorbush-279": { subs: [{ sub_id: "1", count: 1 }] },
  "bundle-2plus1": { subs: [{ sub_id: "1", count: 3 }] },
  "bundle-5": { subs: [{ sub_id: "1", count: 5 }] },
};

/* ===================== main ===================== */
export async function sendOrderToLpCrm(opts: {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    city?: string;
    branch?: string;
    email?: string;
  };
  items: CartItemForCrm[];
  comment?: string;
  utm?: Partial<
    Pick<
      LpCrmOrderPayload,
      "utm_source" | "utm_medium" | "utm_term" | "utm_content" | "utm_campaign"
    >
  >;
}) {
  const API = process.env.LPCRM_API_URL || "";
  const KEY = process.env.LPCRM_KEY || "";
  const COUNTRY = process.env.LPCRM_COUNTRY || "UA";
  const OFFICE = process.env.LPCRM_OFFICE_ID;

  if (!API) throw new Error("Missing LPCRM_API_URL");
  if (!KEY) throw new Error("Missing LPCRM_KEY");

  const products: LpCrmProduct[] = [];
  for (const it of opts.items) {
    const qty = Math.max(1, it.qty);
    if (it.type === "bundle") {
      products.push({
        product_id: it.id,
        price: unitPrice(it),
        count: qty,
        subs: BUNDLE_RULES[it.id]?.subs,
      });
    } else {
      products.push({
        product_id: it.id,
        price: unitPrice(it),
        count: qty,
      });
    }
  }

  const productsSerialized = phpSerialize(products);
  const productsEncoded = urlencode(productsSerialized);

  const bayer_name =
    `${opts.customer.lastName.trim()} ${opts.customer.firstName.trim()}`.trim();
  const delivery_adress = [
    opts.customer.city?.trim(),
    opts.customer.branch?.trim(),
  ]
    .filter(Boolean)
    .join(" / ");

  const order_id = generateOrderId();
  const phone = cleanPhoneToDigits(opts.customer.phone);

  // form-urlencoded payload
  const form = toForm({
    key: KEY,
    order_id,
    country: COUNTRY,
    site: process.env.SITE_URL || "https://luxeroe.store",
    office: OFFICE,
    products: productsEncoded,
    bayer_name,
    phone,
    email: opts.customer.email,
    comment: opts.comment,
    delivery_adress: delivery_adress || undefined,
    ...opts.utm,
  });

  if (LOG) {
    console.log("[LPCRM] → sending", {
      url: API,
      order_id,
      country: COUNTRY,
      office: OFFICE ?? null,
      bayer_name: `${maskName(opts.customer.lastName)} ${maskName(
        opts.customer.firstName
      )}`,
      phone: maskPhone(phone),
      items: products.map((p) => ({
        product_id: p.product_id,
        price: p.price,
        count: p.count,
        subs: p.subs,
      })),
    });
  }

  console.time(`[LPCRM] POST ${order_id}`);
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  console.timeEnd(`[LPCRM] POST ${order_id}`);

  const ctype = res.headers.get("content-type") || "";
  let bodyRaw: any;
  let bodyText = "";

  if (ctype.includes("application/json")) {
    bodyRaw = await res.json().catch(() => null);
    bodyText = JSON.stringify(bodyRaw);
  } else {
    bodyText = await res.text();
    try {
      bodyRaw = JSON.parse(bodyText);
    } catch {
      /* not JSON */
    }
  }

  const okSignals = [
    res.ok,
    bodyRaw?.ok === true,
    bodyRaw?.status === "ok" || bodyRaw?.status === "success",
    /"ok"\s*:\s*true/i.test(bodyText),
    /status"\s*:\s*"(ok|success)"/i.test(bodyText),
    /success/i.test(bodyText) && !/error/i.test(bodyText),
  ].some(Boolean);

  if (LOG) {
    console.log("[LPCRM] ← response", {
      httpStatus: res.status,
      contentType: ctype || null,
      okSignals,
      raw: bodyRaw ?? bodyText.slice(0, 400),
    });
  }

  if (!okSignals) {
    throw new Error(
      `LP-CRM error HTTP ${res.status}: ${bodyText.slice(0, 400)}`
    );
  }

  return { ok: true, order_id, response: bodyRaw ?? bodyText };
}
