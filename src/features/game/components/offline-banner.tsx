'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function OfflineBanner() {
  const tg = useTranslations('game');
  const [online, setOnline] = useState(true);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    const handleOnline = () => {
      setOnline(true);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 2500);
    };
    const handleOffline = () => {
      setOnline(false);
      setShowBack(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const visible = !online || showBack;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={online ? 'back' : 'offline'}
          initial={{ y: -48 }}
          animate={{ y: 0 }}
          exit={{ y: -48 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-2 py-2.5 text-xs font-medium ${
            online
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500 text-amber-950'
          }`}
        >
          <WifiOff className="h-3.5 w-3.5" />
          <span>{online ? tg('backOnline') : tg('offline')}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
