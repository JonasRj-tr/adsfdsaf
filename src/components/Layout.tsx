import { ReactNode, useEffect } from 'react';
import { ShoppingBag, Settings } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useSettingsStore } from '../store/settingsStore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartDrawer } from './CartDrawer';
import { Link } from 'react-router-dom';

export function Layout({ children }: { children: ReactNode }) {
  const { items, toggleCart } = useCartStore();
  const setSettings = useSettingsStore(state => state.setSettings);
  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'store'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          whatsappNumber: data.whatsappNumber || '5511999999999',
          deliveryFee: data.deliveryFee !== undefined ? data.deliveryFee : 5,
        });
      }
    });
    return () => unsub();
  }, [setSettings]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-50 font-sans selection:bg-red-500/30">
      <header className="sticky top-0 z-40 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 border border-red-500/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-xl">M</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Manuara <span className="text-red-500">Delivery</span></h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={toggleCart}
              className="relative p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-all group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1 shadow-lg shadow-red-500/40 border border-[#09090b]">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24">
        {children}
      </main>

      {/* Floating Cart Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          onClick={toggleCart}
          className="bg-gradient-to-br from-red-600 to-orange-600 text-white p-4 rounded-full shadow-xl shadow-red-600/30 flex items-center justify-center relative hover:scale-105 transition-all border border-red-500/50"
        >
          <ShoppingBag className="w-6 h-6" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-zinc-950 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center transform translate-x-1 -translate-y-1 border-2 border-red-600 shadow-sm">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <CartDrawer />
    </div>
  );
}
