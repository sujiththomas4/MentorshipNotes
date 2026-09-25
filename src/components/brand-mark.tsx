import { Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, type Brand } from "@/branding/brands";

/** The brand's square mark, or a placeholder tile (leaf + initials) until a logo is supplied. */
export function BrandMark({
  brand,
  className,
}: {
  brand: Brand;
  className?: string;
}) {
  if (brand.mark)
    return (
      <span
        className={cn(
          "flex items-center justify-center rounded-lg ring-1 ring-white/15",
          className,
        )}
        style={{ background: brand.ui.to }}
      >
        <img
          src={brand.mark}
          alt=""
          className="h-[75%] w-[75%] object-contain"
        />
      </span>
    );
  return (
    <span
      className={cn(
        "relative flex items-center justify-center rounded-lg font-display text-[10px] font-bold ring-1 ring-white/15",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${brand.ui.from}, ${brand.ui.to})`,
        color: brand.ui.ink,
      }}
      title={`${brand.name} (logo not added yet)`}
    >
      <Sprout className="absolute h-[60%] w-[60%] opacity-25" />
      <span className="relative">{initials(brand.name)}</span>
    </span>
  );
}
