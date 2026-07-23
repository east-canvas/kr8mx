import { ThemeZone } from "@/components/ui/ThemeZone";

/**
 * The entire Drinks line renders inside the performance theme, obsidian
 * surfaces, platinum type, acid-lime reserved for CTAs / active states. The
 * light global header/footer frame it like a vitrine.
 */
export default function DrinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeZone theme="performance" className="min-h-[80vh]">
      {children}
    </ThemeZone>
  );
}
