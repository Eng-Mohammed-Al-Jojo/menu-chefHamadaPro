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

    const prices = String(item.price).split(",");
    const basePrice = Number(prices[0]);
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
          relative flex items-center justify-between w-full rounded-[2.5rem] border
          h-[120px] pr-26 sm:pr-28 md:pr-32 pl-4 mr-2
          transition-all duration-500 group
          ${unavailable
            ? "opacity-40 grayscale cursor-not-allowed border-gray-100 bg-gray-50/30 pointer-events-none"
            : "border-white bg-white/70 backdrop-blur-xl shadow-lg shadow-gray-100/50 hover:shadow-2xl hover:shadow-primary/10 hover:bg-white hover:-translate-y-1 cursor-pointer"
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
            className="w-full h-full rounded-full object-cover bg-white shadow-xl border-4 border-white transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-primary/30"
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
            <div className="absolute -top-1  bg-secondary text-primary p-1.5 rounded-full shadow-lg border-2 border-white animate-bounce">
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
          <div className={`font-black text-xl flex items-center gap-0.5 ${unavailable ? "text-gray-400 line-through" : "text-primary-600"}`}>
            <span className="text-sm font-bold opacity-60">₪</span>
            {basePrice}
          </div>

          {canOrder && (
            <button
              onClick={handleOrderClick}
              className="bg-primary hover:bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-110 active:scale-95"
            >
              <FiShoppingCart size={16} />
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
