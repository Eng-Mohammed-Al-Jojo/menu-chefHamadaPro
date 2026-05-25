import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--bg-main) overflow-hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >

          {/* Soft background glow behind logo */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-center">

            {/* Logo container */}
            <div className="relative w-48 h-48 mb-10 flex items-center justify-center">

              {/* Outer spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-primary/20 border-t-primary/70"
              />

              {/* Inner spinning ring (reverse) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-dashed border-primary/20"
              />

              {/* Logo itself - fade+scale in on mount */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-32 h-32 z-10"
              >
                {/* Subtle glow ring behind image */}
                <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
                <img
                  src="/logo.png"
                  className="relative w-full h-full object-contain drop-shadow-xl"
                  alt="Chef Hamada Logo"
                />
              </motion.div>
            </div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <h2 className="text-xl font-bold text-gray-800 tracking-widest">
                {isRtl ? "جاري التجهيز..." : "Loading..."}
              </h2>

              {/* Animated dots */}
              <div className="flex justify-center gap-2 mt-2">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-10 text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]"
          >
            Chef Hamada
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
