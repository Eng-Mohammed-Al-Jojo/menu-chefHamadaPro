import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu, { type Item } from "../components/menu/Menu";
import ItemModal from "../components/menu/ItemModal";
import ItemDetailsDrawer from "../components/menu/ItemDetailsDrawer";
import { HiSparkles } from "react-icons/hi";
import FeaturedModal from "../components/menu/FeaturedModal";
import LoadingScreen from "../components/common/LoadingScreen";
import { motion } from "framer-motion";
import { FirebaseService } from "../services/firebaseService";
import OrderStatusButton from "../components/cart/OrderStatusButton";
import GlassButton from "../components/common/GlassButton";

export default function MenuPage() {
  const { t } = useTranslation();

  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<Item | null>(null);
  const [orderSystem, setOrderSystem] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.listen("settings/orderSystem", (value) => {
      setOrderSystem(value ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) setIsDataReady(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-(--bg-main) text-(--text-primary) menu-wrapper overflow-x-hidden">

      {/* Loading */}
      <LoadingScreen visible={isLoading} />

      {/* ✅ Top Bar */}
      {/* ✅ Featured Button — Floating Left */}
      <div className="absolute top-4 left-4 z-50">
        {isDataReady && hasFeatured && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <GlassButton
              variant="theme"
              icon={<HiSparkles size={18} />}
              onClick={() => setShowFeaturedModal(true)}
              title={t("menu.featured_items")}
            />
          </motion.div>
        )}
      </div>

      <main className="flex flex-col flex-1">

        {/* Premium Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-20 px-6 overflow-hidden">

          {/* Subtle Dynamic Background Mesh */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.08 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[80px] will-change-transform transform-gpu"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.05 }}
              transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 2 }}
              className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-secondary rounded-full blur-[100px] will-change-transform transform-gpu"
            />
          </div>

          {/* Logo Container with Glassmorphism ring */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center transform-gpu "
          >
            <div className="absolute inset-0 rounded-full border border-white/40 shadow-2xl shadow-primary bg-white/10 backdrop-blur-xl scale-125" />



            {/* logo */}
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "backOut" }}
              src="/logo.png"
              className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl z-10"
              alt="Logo"
            />
          </motion.div>

          {/* Title & Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 z-10 space-y-4"
          >
            <h1 className="text-xl md:text-2xl text-gray-900 font-black tracking-tight leading-tight">
              {t("menu.title") || "Chef Hamada"}
            </h1>

          </motion.div>

        </section>
        {/* ✅ Menu */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-0 md:px-6 pb-24">
          <Menu
            onLoadingChange={handleLoadingChange}
            onFeaturedCheck={setHasFeatured}
            onFeaturedItemsChange={setFeaturedItems}
            onItemClick={setSelectedItem}
            onDetailsClick={setSelectedDetailsItem}
          />
        </div>

      </main>

      {/* Cart */}
      {isDataReady && (
        <div className="fixed bottom-6 right-6 z-50">
          <CartButton />
        </div>
      )}

      {/* Modals */}
      <FeaturedModal
        isOpen={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        orderSystem={orderSystem}
        items={featuredItems}
        onItemClick={setSelectedItem}
        onDetailsClick={setSelectedDetailsItem}
      />

      <ItemModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <ItemDetailsDrawer
        isOpen={!!selectedDetailsItem}
        onClose={() => setSelectedDetailsItem(null)}
        item={selectedDetailsItem}
      />

      <OrderStatusButton />
      <Footer />
    </div>
  );
}