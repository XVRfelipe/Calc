"use client";

import { useEffect, useRef } from "react";

export default function SmoothCursor() {
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canUsePointer =
      cursor &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!cursor || !canUsePointer) {
      return;
    }

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let currentX = pointerX;
    let currentY = pointerY;
    let frame = 0;

    document.documentElement.classList.add("has-smooth-cursor");

    const move = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursor.classList.add("is-visible");
    };

    const down = () => cursor.classList.add("is-pressed");
    const up = () => cursor.classList.remove("is-pressed");
    const leave = () => cursor.classList.remove("is-visible");

    const tick = () => {
      currentX += (pointerX - currentX) * 0.18;
      currentY += (pointerY - currentY) * 0.18;
      cursor.style.setProperty("--cursor-x", `${currentX}px`);
      cursor.style.setProperty("--cursor-y", `${currentY}px`);
      frame = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    frame = window.requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-smooth-cursor");
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  return <span ref={cursorRef} className="smooth-cursor" aria-hidden="true" />;
}
