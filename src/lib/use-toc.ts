import { useEffect, useState, type RefObject } from "react";

/** Reads the page's h2[data-toc] headings and tracks which one is on screen. */
export function useToc(ref: RefObject<HTMLDivElement | null>, key: string) {
  const [items, setItems] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const root = ref.current?.closest("article") ?? ref.current;
    if (!root) return;
    const hs = Array.from(root.querySelectorAll<HTMLElement>("h2[data-toc]"));
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "" })));

    const onScroll = () => {
      let current = hs[0]?.id ?? "";
      for (const h of hs) if (h.getBoundingClientRect().top < 120) current = h.id;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref, key]);

  return items.map((i) => ({ ...i, active: i.id === active }));
}
