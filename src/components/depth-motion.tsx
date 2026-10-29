"use client";

import { useEffect } from "react";

const TILT = ".nova-card, .nova-browser-frame, .card-hover-glow, [data-tilt]";
const REVEAL = ".nova-card, .nova-browser-frame, .card, .nova-public-root h2, [data-reveal]";
const MAX_TILT_DEG = 7;
const TILT_REF_WIDTH = 420;
const CENTER = 0.5;
const PERCENT = 100;
const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 6;
const fmt = (n: number) => n.toFixed(2);

// Site-wide 3D layer: pointer tilt on interactive cards + perspective scroll-reveal for all cards (public site and workspaces).
export function DepthMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let active: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(TILT) ?? null;
      if (active && active !== el) reset(active);
      active = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      // Big panels tilt less so wide dashboards don't swing.
      const max = MAX_TILT_DEG * Math.min(1, TILT_REF_WIDTH / r.width);
      el.style.setProperty("--rx", `${fmt((CENTER - y) * max)}deg`);
      el.style.setProperty("--ry", `${fmt((x - CENTER) * max)}deg`);
      el.style.setProperty("--mx", `${fmt(x * PERCENT)}%`);
      el.style.setProperty("--my", `${fmt(y * PERCENT)}%`);
    };
    const onLeave = () => {
      if (active) reset(active);
      active = null;
    };

    const reported = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        // First report: hide only what starts off-screen, so above-the-fold content paints immediately (LCP).
        entries
          .filter((entry) => !reported.has(entry.target))
          .forEach((entry) => {
            reported.add(entry.target);
            if (entry.isIntersecting) io.unobserve(entry.target);
            else entry.target.classList.add("depth-pending");
          });
        entries
          .filter((entry) => entry.isIntersecting && entry.target.classList.contains("depth-pending"))
          .map((entry) => entry.target as HTMLElement)
          .forEach((el, i) => {
            io.unobserve(el);
            el.style.setProperty("animation-delay", `${Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
            el.classList.replace("depth-pending", "depth-in");
          });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      Array.from(document.querySelectorAll<HTMLElement>(REVEAL))
        .filter((el) => !seen.has(el))
        .forEach((el) => {
          seen.add(el);
          io.observe(el);
        });
    };
    scan();
    let raf = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
