import { describe, it, expect } from "vitest";
import {
  SUPPORTED_CURRENCIES,
  getCurrencyInfo,
  convertFromUSD,
  formatCurrencyAmount,
  mapCountryToCurrency,
} from "./currency";

describe("Currency system utilities", () => {
  it("provides supported currencies with required metadata", () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(6);
    const inr = getCurrencyInfo("INR");
    expect(inr.code).toBe("INR");
    expect(inr.symbol).toBe("₹");
    expect(inr.rateFromUSD).toBeGreaterThan(1);

    const eur = getCurrencyInfo("EUR");
    expect(eur.code).toBe("EUR");
    expect(eur.symbol).toBe("€");
  });

  it("converts USD amounts using rates", () => {
    const usd100 = 100;
    expect(convertFromUSD(usd100, "USD")).toBe(100);
    expect(convertFromUSD(usd100, "INR")).toBe(8350);
    expect(convertFromUSD(usd100, "EUR")).toBe(92);
  });

  it("formats currency amounts accurately", () => {
    const formattedUsd = formatCurrencyAmount(12500, "USD", false);
    expect(formattedUsd).toContain("$12,500");

    const formattedInr = formatCurrencyAmount(100, "INR", true);
    expect(formattedInr).toContain("8,350");
  });

  it("maps country codes to correct default currencies", () => {
    expect(mapCountryToCurrency("IN")).toBe("INR");
    expect(mapCountryToCurrency("GB")).toBe("GBP");
    expect(mapCountryToCurrency("DE")).toBe("EUR");
    expect(mapCountryToCurrency("FR")).toBe("EUR");
    expect(mapCountryToCurrency("CA")).toBe("CAD");
    expect(mapCountryToCurrency("AU")).toBe("AUD");
    expect(mapCountryToCurrency("JP")).toBe("JPY");
    expect(mapCountryToCurrency("AE")).toBe("AED");
    expect(mapCountryToCurrency("US")).toBe("USD");
    expect(mapCountryToCurrency(null)).toBe("USD");
  });
});
