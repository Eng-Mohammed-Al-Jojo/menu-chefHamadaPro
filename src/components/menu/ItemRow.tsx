import React, {
  useCallback,
} from "react";
import { type Item } from "./Menu";
import { FaFire } from "react-icons/fa";
import { motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";

interface Props {
  item: Item;
  orderSystem: boolean;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

const ItemRow = React.memo(
  ({ item, orderSystem, onClick }: Props) => {

    const prices = String(item.price).split(",").map(p => p.trim()).filter(Boolean);
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
      <motion.div
        className={`
          relative flex items-center justify-between w-full rounded-3xl border
          h-[110px] pr-28 pl-2 bg-white mr-2
          transition-all duration-300 group
          ${unavailable
            ? "opacity-40 grayscale cursor-not-allowed border-gray-100 bg-gray-50/30 pointer-events-none"
            : "border-gray-100 border border-primary/40 hover:border-primary hover:shadow-md shadow-sm cursor-pointer"
          }
        `}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleOrderClick}
      >
        {/* IMAGE (RIGHT SIDE, ABSOLUTE, OVERFLOW) */}
        <div className="absolute right-10 translate-x-1/2 w-30 h-30 z-31">
          <img
            src={item.image ? `/images/${item.image}` : "/logo.png"}
            alt={itemName}
            loading="lazy"
            className="w-full h-full rounded-full object-cover bg-white shadow-md border-[3px] border-white ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
          />

          {/* SOLD OUT OVERLAY */}
          {unavailable && (
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">

            </div>
          )}

          {/* FEATURED BADGE */}
          {(item.star || (item as any).isFeatured) && !unavailable && (
            <div className="absolute -top-1  bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
              <FaFire size={10} />
            </div>
          )}
        </div>

        {/* CONTENT (CENTER-RIGHT) */}
        <div className="flex-1 text-right mr-2 overflow-hidden">
          <h3 className="text-md md:text-lg lg:text-xl font-bold text-gray-900 mb-1 leading-tight truncate">
            {itemName}
          </h3>
          <p className="text-[11px] md:text-xs lg:text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* LEFT SECTION (PRICE + BUTTON) */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 min-w-[90px] pl-4">
          <div className={`flex flex-wrap items-center justify-end gap-2 ${unavailable ? "text-gray-400 line-through" : "text-primary"}`}>
            {prices.map((price, idx) => (
              <div key={idx} className={`font-black flex items-center gap-0.5 ${prices.length > 1 ? "text-lg" : "text-xl"}`}>
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
      </motion.div>
    );
  }
);

export default ItemRow;
