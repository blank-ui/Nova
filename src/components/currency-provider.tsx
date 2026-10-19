"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  CurrencyCode,
  CurrencyOption,
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrencyInfo,
  convertFromUSD,
  formatCurrencyAmount,
  detectBrowserCurrency,
} from "@/lib/currency";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatMoney: (amountInUSD: number, convert?: boolean) => string;
  convert: (amountInUSD: number) => number;
  currencies: CurrencyOption[];
  currentCurrency: CurrencyOption;
  detectedCurrency: CurrencyCode | null;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  formatMoney: (amountInUSD) => formatCurrencyAmount(amountInUSD, DEFAULT_CURRENCY, true),
  convert: (amountInUSD) => convertFromUSD(amountInUSD, DEFAULT_CURRENCY),
  currencies: SUPPORTED_CURRENCIES,
  currentCurrency: SUPPORTED_CURRENCIES[0],
  detectedCurrency: null,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = (sessionStorage.getItem("nova-currency") ||
          localStorage.getItem("nova-currency")) as CurrencyCode | null;
        if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
          return stored;
        }
        return detectBrowserCurrency();
      } catch {}
    }
    return DEFAULT_CURRENCY;
  });

  const [detectedCurrency, setDetectedCurrency] = useState<CurrencyCode | null>(null);

  // Auto-detect currency via IP header API if user hasn't explicitly saved a choice
  useEffect(() => {
    let mounted = true;

    async function detect() {
      try {
        const stored =
          typeof window !== "undefined"
            ? sessionStorage.getItem("nova-currency") || localStorage.getItem("nova-currency")
            : null;

        // Fetch IP-based detection from our server API
        const res = await fetch("/api/geo/currency");
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.currency && SUPPORTED_CURRENCIES.some((c) => c.code === data.currency)) {
            setDetectedCurrency(data.currency as CurrencyCode);
            // If the user hasn't manually overridden currency, apply the IP-detected currency
            if (!stored) {
              setCurrencyState(data.currency as CurrencyCode);
            }
          }
        }
      } catch (err) {
        console.warn("[CurrencyProvider] IP detection fallback:", err);
      }
    }

    detect();
    return () => {
      mounted = false;
    };
  }, []);

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    try {
      sessionStorage.setItem("nova-currency", newCurrency);
      localStorage.setItem("nova-currency", newCurrency);
      document.cookie = `nova-currency=${newCurrency}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, []);

  const formatMoney = useCallback(
    (amountInUSD: number, convert: boolean = true) => {
      return formatCurrencyAmount(amountInUSD, currency, convert);
    },
    [currency]
  );

  const convert = useCallback(
    (amountInUSD: number) => {
      return convertFromUSD(amountInUSD, currency);
    },
    [currency]
  );

  const currentCurrency = getCurrencyInfo(currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatMoney,
        convert,
        currencies: SUPPORTED_CURRENCIES,
        currentCurrency,
        detectedCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function Money({
  value,
  convert = true,
  className,
  style,
}: {
  value: number;
  convert?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { formatMoney } = useCurrency();
  return (
    <span className={className} style={style}>
      {formatMoney(value, convert)}
    </span>
  );
}
