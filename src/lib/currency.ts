/**
 * Currency System for Nova Platform
 * Supports dynamic currency conversion, multi-currency display,
 * automatic IP/locale/timezone detection, and persistent switching.
 */

export type CurrencyCode = "USD" | "INR" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY" | "AED";

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
  shortLabel: string;
  flag: string;
  rateFromUSD: number; // Conversion rate relative to 1.0 USD
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  {
    code: "USD",
    symbol: "$",
    label: "USD ($) — US Dollar",
    shortLabel: "USD $",
    flag: "🇺🇸",
    rateFromUSD: 1.0,
    decimals: 2,
  },
  {
    code: "INR",
    symbol: "₹",
    label: "INR (₹) — Indian Rupee",
    shortLabel: "INR ₹",
    flag: "🇮🇳",
    rateFromUSD: 83.5,
    decimals: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    label: "EUR (€) — Euro",
    shortLabel: "EUR €",
    flag: "🇪🇺",
    rateFromUSD: 0.92,
    decimals: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    label: "GBP (£) — British Pound",
    shortLabel: "GBP £",
    flag: "🇬🇧",
    rateFromUSD: 0.79,
    decimals: 2,
  },
  {
    code: "CAD",
    symbol: "CA$",
    label: "CAD ($) — Canadian Dollar",
    shortLabel: "CAD $",
    flag: "🇨🇦",
    rateFromUSD: 1.36,
    decimals: 2,
  },
  {
    code: "AUD",
    symbol: "A$",
    label: "AUD ($) — Australian Dollar",
    shortLabel: "AUD $",
    flag: "🇦🇺",
    rateFromUSD: 1.52,
    decimals: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    label: "JPY (¥) — Japanese Yen",
    shortLabel: "JPY ¥",
    flag: "🇯🇵",
    rateFromUSD: 152.0,
    decimals: 0,
  },
  {
    code: "AED",
    symbol: "AED",
    label: "AED — UAE Dirham",
    shortLabel: "AED",
    flag: "🇦🇪",
    rateFromUSD: 3.67,
    decimals: 2,
  },
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function getCurrencyInfo(code: CurrencyCode | string): CurrencyOption {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code?.toUpperCase());
  return match || SUPPORTED_CURRENCIES[0];
}

/**
 * Converts a base USD amount to the target currency amount.
 */
export function convertFromUSD(amountUSD: number, targetCurrency: CurrencyCode): number {
  const info = getCurrencyInfo(targetCurrency);
  return amountUSD * info.rateFromUSD;
}

/**
 * Formats an amount with the designated currency symbol and proper localization.
 */
export function formatCurrencyAmount(
  amountInUSD: number,
  currency: CurrencyCode = "USD",
  convert: boolean = true
): string {
  const info = getCurrencyInfo(currency);
  const finalAmount = convert ? convertFromUSD(amountInUSD, currency) : amountInUSD;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: info.code,
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals,
    }).format(finalAmount);
  } catch {
    return `${info.symbol}${finalAmount.toLocaleString("en-US", {
      minimumFractionDigits: info.decimals,
      maximumFractionDigits: info.decimals,
    })}`;
  }
}

/**
 * Maps standard ISO 3166-1 alpha-2 country codes to appropriate default currencies.
 */
export function mapCountryToCurrency(countryCode?: string | null): CurrencyCode {
  if (!countryCode) return DEFAULT_CURRENCY;
  const c = countryCode.toUpperCase().trim();

  if (c === "IN") return "INR";
  if (c === "GB") return "GBP";
  if (c === "CA") return "CAD";
  if (c === "AU" || c === "NZ") return "AUD";
  if (c === "JP") return "JPY";
  if (c === "AE") return "AED";
  if (
    [
      "DE",
      "FR",
      "IT",
      "ES",
      "NL",
      "BE",
      "AT",
      "IE",
      "FI",
      "PT",
      "GR",
      "LU",
      "SK",
      "SI",
      "EE",
      "LV",
      "LT",
      "CY",
      "MT",
    ].includes(c)
  ) {
    return "EUR";
  }

  return "USD";
}

/**
 * Fallback browser client heuristic using timezone or navigator.language
 */
export function detectBrowserCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;

  try {
    // 1. Timezone detection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("India")) return "INR";
    if (tz.includes("London") || tz.includes("Belfast")) return "GBP";
    if (tz.includes("Tokyo")) return "JPY";
    if (tz.includes("Dubai")) return "AED";
    if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane") || tz.includes("Perth")) return "AUD";
    if (tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Montreal") || tz.includes("Edmonton")) return "CAD";
    if (
      tz.includes("Berlin") ||
      tz.includes("Paris") ||
      tz.includes("Rome") ||
      tz.includes("Madrid") ||
      tz.includes("Amsterdam") ||
      tz.includes("Brussels") ||
      tz.includes("Vienna") ||
      tz.includes("Dublin")
    ) {
      return "EUR";
    }

    // 2. Language/Locale detection
    const lang = (navigator.language || "").toLowerCase();
    if (lang.includes("-in") || lang === "hi") return "INR";
    if (lang.includes("-gb")) return "GBP";
    if (lang.includes("-ca")) return "CAD";
    if (lang.includes("-au")) return "AUD";
    if (lang.includes("-jp") || lang.startsWith("ja")) return "JPY";
    if (lang.includes("-ae") || lang.startsWith("ar")) return "AED";
    if (
      lang.includes("-de") ||
      lang.includes("-fr") ||
      lang.includes("-it") ||
      lang.includes("-es") ||
      lang.includes("-nl")
    ) {
      return "EUR";
    }
  } catch {}

  return DEFAULT_CURRENCY;
}
