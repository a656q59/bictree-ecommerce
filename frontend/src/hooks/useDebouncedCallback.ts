import { useEffect, useRef } from "react";

export function useDebouncedCallback(delay: number) {
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return (run: () => void) => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }

    timer.current = window.setTimeout(run, delay);
  };
}
