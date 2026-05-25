import { useMemo } from "react";
import ItemRow from "./ItemRow";
import type { Category, Item, Subcategory } from "./Menu";

/**
 * CategorySection — Performance-optimised version
 *
 * Key changes:
 *  • Removed framer-motion completely from this component.
 *    `whileInView` on every row was creating hundreds of IntersectionObserver
 *    instances simultaneously, which is the primary cause of scroll freeze.
 *  • Removed `staggerChildren` animation — nice visually but extremely expensive
 *    with large lists (each child re-renders on the stagger tick).
 *  • The component itself is NOT wrapped in React.memo intentionally — it receives
 *    a new `items` array every render from the parent's `.filter().sort()` call.
 *    The parent (Menu.tsx) now memoises the per-category item arrays to prevent
 *    this component from re-rendering unnecessarily.
 */
interface Props {
  category: Category;
  subcategories: Subcategory[];
  items: Item[];
  orderSystem: boolean;
  onItemClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

export default function CategorySection({
  category,
  subcategories,
  items,
  orderSystem,
  onItemClick,
  onDetailsClick,
}: Props) {
  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    items.forEach((item) => {
      const sub = subcategories.find((s) => s.id === item.subcategoryId);
      if (item.subcategoryId && sub && sub.visible !== false) {
        if (!groups[item.subcategoryId]) groups[item.subcategoryId] = [];
        groups[item.subcategoryId].push(item);
      } else {
        noSubItems.push(item);
      }
    });

    return { groups, noSubItems };
  }, [items, subcategories]);

  const activeSubcategories = useMemo(() => {
    return subcategories
      .filter(
        (sub) =>
          sub.categoryId === category.id &&
          sub.visible !== false &&
          groupedItems.groups[sub.id]
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category.id, subcategories, groupedItems.groups]);

  const catName = category.nameAr || category.name || "";

  return (
    <div className="w-full space-y-10">
      {/* Category Header */}
      <div className="flex items-center gap-4">
        <div className="w-2 h-10 bg-primary rounded-full shadow-lg shadow-primary/40" />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          {catName}
        </h2>
      </div>

      <div className="space-y-8">
        {/* Main Items */}
        {groupedItems.noSubItems.length > 0 && (
          <div className="flex flex-col w-full gap-4">
            {groupedItems.noSubItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                orderSystem={orderSystem}
                onClick={onItemClick}
                onDetailsClick={onDetailsClick}
              />
            ))}
          </div>
        )}

        {/* Subcategories */}
        {activeSubcategories.map((sub) => (
          <div key={sub.id} className="space-y-6">
            <div className="flex items-center gap-3 w-full">
              {/* left line */}
              <div className="h-px flex-1 bg-primary/30" />

              {/* center title */}
              <span className="px-4 py-1.5 rounded-2xl bg-secondary/10 text-secondary text-sm md:text-base font-bold uppercase tracking-widest border border-secondary/20 whitespace-nowrap">
                {sub.nameAr}
              </span>

              {/* right line */}
              <div className="h-px flex-1 bg-primary/30" />
            </div>

            <div className="flex flex-col w-full gap-4">
              {groupedItems.groups[sub.id].map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  orderSystem={orderSystem}
                  onClick={onItemClick}
                  onDetailsClick={onDetailsClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
