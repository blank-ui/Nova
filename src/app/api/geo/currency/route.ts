import { NextRequest, NextResponse } from "next/server";
import { mapCountryToCurrency, getCurrencyInfo, DEFAULT_CURRENCY } from "@/lib/currency";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // 1. Check Cloudflare / Vercel / Standard geo IP country headers
    const countryHeader =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("x-client-ip-country") ||
      req.headers.get("x-geo-country");

    if (countryHeader) {
      const code = mapCountryToCurrency(countryHeader);
      const info = getCurrencyInfo(code);
      return NextResponse.json({
        currency: code,
        country: countryHeader.toUpperCase(),
        symbol: info.symbol,
        rateFromUSD: info.rateFromUSD,
        detectedBy: "header",
      });
    }

    // 2. Check Accept-Language header for regional hint
    const acceptLang = req.headers.get("accept-language") || "";
    let detectedCountry: string | null = null;
    if (acceptLang.includes("en-IN") || acceptLang.includes("hi-IN") || acceptLang.includes("hi")) {
      detectedCountry = "IN";
    } else if (acceptLang.includes("en-GB")) {
      detectedCountry = "GB";
    } else if (acceptLang.includes("en-CA") || acceptLang.includes("fr-CA")) {
      detectedCountry = "CA";
    } else if (acceptLang.includes("en-AU")) {
      detectedCountry = "AU";
    } else if (acceptLang.includes("ja-JP") || acceptLang.includes("ja")) {
      detectedCountry = "JP";
    } else if (acceptLang.includes("ar-AE")) {
      detectedCountry = "AE";
    } else if (
      acceptLang.includes("de-") ||
      acceptLang.includes("fr-") ||
      acceptLang.includes("es-ES") ||
      acceptLang.includes("it-")
    ) {
      detectedCountry = "DE";
    }

    const code = mapCountryToCurrency(detectedCountry);
    const info = getCurrencyInfo(code);

    return NextResponse.json({
      currency: code,
      country: detectedCountry || "US",
      symbol: info.symbol,
      rateFromUSD: info.rateFromUSD,
      detectedBy: detectedCountry ? "locale" : "default",
    });
  } catch (err: any) {
    return NextResponse.json({
      currency: DEFAULT_CURRENCY,
      country: "US",
      symbol: "$",
      rateFromUSD: 1.0,
      detectedBy: "fallback",
    });
  }
}
