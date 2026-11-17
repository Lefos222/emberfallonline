import { useEffect, useState } from "react";

export const WINTER_CASTLE_START = Date.UTC(2026, 10, 17);
export const WINTER_CASTLE_END = Date.UTC(2027, 0, 1);

export function winterCastleActive(now: number): boolean {
  return now >= WINTER_CASTLE_START && now < WINTER_CASTLE_END;
}

/** Presentation only: refresh across midnight without altering any hero save. */
export function useWinterCastle() {
  const [winter, setWinter] = useState(false);
  useEffect(() => {
    const refresh = () => setWinter(winterCastleActive(Date.now()));
    refresh();
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return winter;
}