import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  /** When true, screen is visible. When false, triggers fade-out. */
  visible: boolean;
  /** Called after fade-out animation completes */
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      return;
    }
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [visible]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white overflow-hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Subtle Dynamic Ambient Background */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.03, 0.06, 0.03]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px]"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Elegant Golden Ring & Logo */}
            <div className="relative flex items-center justify-center">
              
              {/* Outer Golden Trace */}
              <svg className="absolute w-[280px] h-[280px] -rotate-90 pointer-events-none" viewBox="0 0 200 200">
                <circle
                  cx="100" cy="100" r={radius}
                  stroke="rgba(245, 158, 11, 0.1)" strokeWidth="1" fill="none"
                />
                <motion.circle
                  cx="100" cy="100" r={radius}
                  stroke="#F59E0B"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                  className="drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              </svg>

              {/* Inner Pulsing Glass Container */}
              <div className="absolute inset-0 m-auto w-[180px] h-[180px] rounded-full border border-white/50 bg-white/20 shadow-2xl shadow-primary/20 backdrop-blur-xl" />

              {/* The Logo */}
              <motion.div
                animate={{ scale: [0.96, 1.04, 0.96] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-32 h-32 z-20"
              >
                <img
                  src="/logo.png"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  alt="Logo"
                />
              </motion.div>
            </div>

            {/* Typography */}
            <div className="mt-16 text-center space-y-5">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl md:text-2xl font-black text-gray-900 tracking-[0.3em] uppercase"
              >
                {isRtl ? "جاري التجهيز" : "Preparing"}
              </motion.h2>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-6"
              >
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-primary/50" />
                <span className="text-xs font-bold text-primary tracking-[0.5em] uppercase drop-shadow-sm">
                  {Math.round(progress)}%
                </span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-primary/50" />
              </motion.div>
            </div>
          </div>

          {/* Bottom Branding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-12 flex flex-col items-center gap-2"
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.5em]">
              Chef Hamada
            </div>
            <div className="w-1 h-1 rounded-full bg-primary/50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}