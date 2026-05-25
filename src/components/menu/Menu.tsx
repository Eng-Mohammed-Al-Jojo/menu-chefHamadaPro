import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import CategorySection from "./CategorySection";
import ItemRow from "./ItemRow";
import MenuSkeleton from "./MenuSkeleton";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";
import { FaCommentDots } from "react-icons/fa";
import FeedbackModal from "./FeedbackModal";
import CategoryNavigation from "./CategoryNavigation";

import { MenuService } from "../../services/menuService";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 0.98 }
};

const categoryVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

/* ================= Types ================= */
export interface Category {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  available?: boolean;
  order?: number;
  image?: string;
  visible?: boolean;
}

export interface Subcategory {
  id: string;
  nameAr: string;
  nameEn?: string;
  categoryId: string;
  image?: string;
  visible?: boolean;
  order?: number;
}

export interface Item {
  featured: any;
  image: string | undefined;
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  price: number;
  ingredients?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  priceTw?: number;
  categoryId: string;
  subcategoryId?: string | null;
  visible?: boolean;
  star?: boolean;
  createdAt?: number;
  order?: number;
}

/* ================= Props ================= */
interface Props {
  onLoadingChange?: (loading: boolean) => void;
  onFeaturedCheck?: (hasFeatured: boolean) => void;
  onFeaturedItemsChange?: (items: Item[]) => void;
  orderSystem?: boolean;
  onItemClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

type LoadingPhase = "loading" | "skeleton" | "ready";



export default function Menu({ onLoadingChange, onFeaturedCheck, onFeaturedItemsChange, orderSystem: initialOrderSystem, onItemClick, onDetailsClick }: Props) {
  const { t } = useTranslation();


  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [phase, setPhase] = useState<LoadingPhase>("loading");
  const [orderSystem, setOrderSystem] = useState<boolean>(initialOrderSystem ?? true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>("all");
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(2);

  const isMounted = useRef(true);
  const startTime = useRef(Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= Data Fetching ================= */
  useEffect(() => {
    isMounted.current = true;
    onLoadingChange?.(true);

    let unsubscribe: (() => void) | null = null;

    const loadData = async () => {
      try {
        const { data } = await MenuService.getMenuWithFallback();
        if (!isMounted.current) return;

        setCategories(data.categories);
        setSubcategories(data.subcategories);
        setItems(data.items);
        setOrderSystem(data.orderSystem);

        const availableWithItems = data.categories.filter((cat: any) =>
          cat.available && data.items.some((i: any) => i.categoryId === cat.id)
        );

        if (availableWithItems.length > 0 && (!activeCategoryId || activeCategoryId === "all")) {
          // Default is "all", which we handle in the UI, but if we need a specific first category:
          // setActiveCategoryId("all"); // Or the first one if "all" is disabled
        }

        const wasLoaded = sessionStorage.getItem("menu_orca_initial_load");
        const elapsed = Date.now() - startTime.current;
        const MIN_LOADING_TIME = 1500;
        const remainingFetchTime = wasLoaded ? 0 : Math.max(0, MIN_LOADING_TIME - elapsed);

        setTimeout(() => {
          if (!isMounted.current) return;
          onLoadingChange?.(false);
          setPhase("ready"); // Skip skeleton for an instant, clean transition
          sessionStorage.setItem("menu_orca_initial_load", "true");
        }, remainingFetchTime);

        unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
          if (!isMounted.current) return;
          setCategories(freshData.categories);
          setSubcategories(freshData.subcategories);
          setItems(freshData.items);
          setOrderSystem(freshData.orderSystem);
        });
      } catch (err) {
        console.error("Menu load failed:", err);
        if (isMounted.current) {
          onLoadingChange?.(false);
          setPhase("ready");
        }
      }
    };

    loadData();
    return () => {
      isMounted.current = false;
      unsubscribe?.();
    };
  }, [onLoadingChange]);

  /* ================= Derived Data (Optimized) ================= */
  const featuredItems = useMemo(() =>
    items
      .filter(i => (i.star === true || (i as any).isFeatured === true))
      .sort((a, b) => {
        if (a.visible === false && b.visible !== false) return 1;
        if (a.visible !== false && b.visible === false) return -1;
        return (a.order ?? 0) - (b.order ?? 0);
      }),
    [items]
  );

  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => {
        // Show category if it has at least one item, even if unavailable
        return items.some(i => i.categoryId === cat.id);
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [categories, items]);

  const filteredItems = useMemo(() => {
    const search = searchTerm?.toLowerCase() ?? "";
    if (!search) return [];
    return items
      .filter((item) => {
        const name = (item.nameAr || item.name || "").toLowerCase();
        const ingredients = (item.ingredientsAr || item.ingredients || "").toLowerCase();
        return name.includes(search) || ingredients.includes(search);
      })
      .sort((a, b) => {
        if (a.visible === false && b.visible !== false) return 1;
        if (a.visible !== false && b.visible === false) return -1;
        return (a.order ?? 0) - (b.order ?? 0);
      });
  }, [items, searchTerm]);

  /* ================= Progressive Loading ================= */
  useEffect(() => {
    if (activeCategoryId !== "all" && activeCategoryId !== null) return;
    if (visibleCategoriesCount >= availableCategories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Small delay for smooth scroll feel
          setTimeout(() => {
            setVisibleCategoriesCount((prev) => Math.min(prev + 2, availableCategories.length));
          }, 150);
        }
      },
      { rootMargin: "300px" }
    );

    if (bottomRef.current) observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [visibleCategoriesCount, availableCategories?.length, activeCategoryId]);

  useEffect(() => {
    // Reset to initial count when returning to 'all'
    if (activeCategoryId === "all" || activeCategoryId === null) {
      setVisibleCategoriesCount(2);
    }
  }, [activeCategoryId]);

  useEffect(() => {
    onFeaturedCheck?.(featuredItems.length > 0);
    onFeaturedItemsChange?.(featuredItems);
  }, [featuredItems, onFeaturedCheck, onFeaturedItemsChange]);

  const handleItemClick = useCallback((item: Item) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const activeCategory = useMemo(() =>
    availableCategories.find(c => c.id === activeCategoryId),
    [availableCategories, activeCategoryId]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchTerm("");
  }, []);

  /* ================= Phase: Loading ================= */
  if (phase === "loading") return null;

  /* ================= Phase: Skeleton ================= */
  if (phase === "skeleton") {
    return (
      <div className="menu-wrapper">
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-7xl mx-auto px-4 pb-32">
          <MenuSkeleton />
        </motion.div>
      </div>
    );
  }

  /* ================= Phase: Ready ================= */
  return (
    <div className="menu-wrapper bg-transparent min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 pb-24 pt-6"
      >
        <div className="flex flex-col">
          {/* Header Area */}
          <div className="flex flex-col mb-8 gap-6">
            {/* Logo or Title Placeholder if needed */}

            {/* Search Bar */}
            <div className="w-full max-w-lg mx-auto relative group px-4">
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-300 z-10">
                <FiSearch size={20} />
              </div>
              <input
                type="text"
                placeholder={t('common.search') || "عن ماذا تبحث؟"}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full bg-white border border-gray-200/60 rounded-full py-3.5 pr-14 pl-6 text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium outline-none transition-all duration-300 shadow-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/10 focus:shadow-lg hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"              />
              {searchTerm && (
                <button
                  onClick={handleSearchClear}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100/80 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors duration-200 z-10"
                >
                  <FiX size={14} />
                </button>
              )}
            </div>

            {/* Premium Category Navigation */}
            {!searchTerm && (
              <CategoryNavigation
                categories={availableCategories}
                activeId={activeCategoryId}
                onSelect={setActiveCategoryId}
              />
            )}
          </div>

          <div className="flex-1 w-full min-w-0">
            <AnimatePresence mode="wait">
              {searchTerm ? (
                <motion.div
                  key="search"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  layout
                  className="flex flex-col w-full gap-4"
                >
                  {filteredItems.map((item) => (
                    <ItemRow key={item.id} item={item} orderSystem={orderSystem} onClick={handleItemClick} onDetailsClick={onDetailsClick} />
                  ))}
                </motion.div>
              ) : availableCategories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-24 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-5xl mb-6">
                    🍽️
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900">{t('menu.empty_menu') || "القائمة قادمة قريباً"}</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                      {t('menu.empty_menu_desc') || "نحن نقوم بتجهيز تشكيلتنا اللذيذة. يرجى التحقق مرة أخرى قريباً."}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={activeCategoryId}
                  variants={categoryVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-16"
                >
                  {(activeCategoryId === "all" || !activeCategoryId) ? (
                    <>
                      {availableCategories.slice(0, visibleCategoriesCount).map((cat) => (
                        <CategorySection
                          key={cat.id}
                          category={cat}
                          subcategories={subcategories}
                          items={
                            [...items.filter(i => i.categoryId === cat.id)]
                              .sort((a, b) => {
                                if (a.visible === false && b.visible !== false) return 1;
                                if (a.visible !== false && b.visible === false) return -1;
                                return (a.order ?? 0) - (b.order ?? 0);
                              })
                          }
                          orderSystem={orderSystem}
                          onItemClick={handleItemClick}
                          onDetailsClick={onDetailsClick}
                        />
                      ))}
                      {visibleCategoriesCount < availableCategories.length && (
                        <div ref={bottomRef} className="py-12 flex justify-center items-center opacity-60">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin drop-shadow-md" />
                        </div>
                      )}
                    </>
                  ) : (
                    activeCategory && (
                      <CategorySection
                        category={activeCategory}
                        subcategories={subcategories}
                        items={
                          [...items.filter(i => i.categoryId === activeCategoryId)]
                            .sort((a, b) => {
                              if (a.visible === false && b.visible !== false) return 1;
                              if (a.visible !== false && b.visible === false) return -1;
                              return (a.order ?? 0) - (b.order ?? 0);
                            })
                        }
                        orderSystem={orderSystem}
                        onItemClick={handleItemClick}
                        onDetailsClick={onDetailsClick}
                      />
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Floating Components */}
        <button
          onClick={() => setShowFeedbackModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center z-40 hover:scale-110 active:scale-95 transition-transform"
        >
          <FaCommentDots size={24} />
        </button>

        <FeedbackModal show={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} orderSystem={orderSystem} />
      </motion.div>
    </div>
  );
}
