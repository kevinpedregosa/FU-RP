"use client";

import { useEffect, useState } from "react";

export default function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frame = 0;

    function update() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => setScrollY(window.scrollY));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return scrollY;
}
