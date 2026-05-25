import React, { useCallback } from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

interface Props {
  item: Item;
  orderSystem: boolean;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

/**
 * ItemRow — Performance-optimised version
 *
 * Key changes vs previous version:
 *  • Removed framer-motion `motion.div` + `layout` prop → was the #1 cause of
 *    layout thrashing when many items rendered simultaneously.
 *  • Replaced with a plain <div> + CSS keyframe fade-in (GPU-only, no JS).
 *  • `will-change: transform` only added via hover class, not permanently.
 *  • `animate-bounce` replaced with `animate-pulse` (opacity only, no layout).
 *  • React.memo kept — prevents re-render when parent re-renders for unrelated state.
 */
const ItemRow = React.memo(
  ({ item, orderSystem, onClick }: Props) => {
    const prices = String(item.price).split(",").map((p) => p.trim()).filter(Boolean);
    const unavailable = item.visible === false;
    const itemName = item.nameAr || item.name || "";
    const description = item.ingredientsAr || item.ingredients || "";
    const canOrder = !unavailable && orderSystem;

    const handleOrderClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (canOrder) onClick?.(item);
      },
      [canOrder, item, onClick]
    );

    return (
      <div
        className={`
          item-row-animate
          relative flex items-center justify-between w-full rounded-3xl border
          h-[110px] pr-25 md:pr-28 pl-2 bg-white mr-2
          transition-all duration-300 group
          ${
            unavailable
              ? "opacity-40 grayscale cursor-not-allowed border-gray-100 bg-gray-50/30 pointer-events-none"
              : "border-gray-100 border border-primary/40 hover:border-primary hover:shadow-md shadow-sm cursor-pointer hover:[will-change:transform]"
          }
        `}
        onClick={handleOrderClick}
      >
        {/* IMAGE (RIGHT SIDE, ABSOLUTE, OVERFLOW) */}
        <div className="absolute right-10 translate-x-1/2 w-30 h-30 z-31">
          <img
            src={item.image ? `/images/${item.image}` : "/logo.png"}
            alt={itemName}
            loading="lazy"
            decoding="async"
            className="w-full h-full rounded-full object-cover bg-white shadow-md border-[3px] border-primary ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />

          {/* SOLD OUT OVERLAY */}
          {unavailable && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center" />
          )}

          {/* FEATURED BADGE — pulse instead of bounce to avoid layout repaint */}
          {(item.star || (item as any).isFeatured) && !unavailable && (
            <div className="absolute -top-1 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-pulse">
              <FaFire size={10} />
            </div>
          )}
        </div>

        {/* CONTENT (CENTER-RIGHT) */}
        <div className="flex-1 text-right mr-2 overflow-hidden">
          <h3 className="text-sm md:text-md lg:text-lg font-bold text-gray-900 mb-1 leading-tight truncate">
            {itemName}
          </h3>
          <p className="text-[10px] md:text-xs lg:text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* LEFT SECTION (PRICE + BUTTON) */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 min-w-[90px] pl-4">
          <div
            className={`flex flex-wrap items-center justify-end gap-2 ${
              unavailable ? "text-gray-400 line-through" : "text-primary"
            }`}
          >
            {prices.map((price, idx) => (
              <div
                key={idx}
                className={`font-black flex items-center gap-0.5 ${
                  prices.length > 1 ? "text-md" : "text-lg"
                }`}
              >
                <span className="text-sm font-bold opacity-60">₪</span>
                {price}
              </div>
            ))}
          </div>

          {canOrder && (
            <button
              onClick={handleOrderClick}
              className="bg-primary hover:bg-primary/80 text-white px-4 py-2.5 rounded-full text-xs font-black shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-wider whitespace-nowrap"
            >
              <FiShoppingCart size={14} />
            </button>
          )}

          {unavailable && (
            <span className="bg-red-50 text-red-400 border border-red-200 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
              لقد نفذت الكمية
            </span>
          )}
        </div>
      </div>
    );
  }
);

ItemRow.displayName = "ItemRow";
export default ItemRow;
