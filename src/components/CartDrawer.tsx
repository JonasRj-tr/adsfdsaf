import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function CartDrawer() {
  const { isCartOpen, toggleCart, items, updateQuantity, removeItem, getTotal } = useCartStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const total = getTotal();
  const deliveryFee = 5; // Fixed delivery fee for now

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 bg-black z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-zinc-900 shadow-2xl z-50 flex flex-col border-l border-white/10"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3 text-white">
                  <ShoppingBag className="w-6 h-6 text-red-500" />
                  Seu Carrinho
                </h2>
                <button
                  onClick={toggleCart}
                  className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                    <ShoppingBag className="w-16 h-16 text-zinc-700" />
                    <p className="text-lg font-medium">Seu carrinho está vazio</p>
                    <button
                      onClick={toggleCart}
                      className="text-red-500 font-medium hover:text-red-400 transition-colors"
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-zinc-800/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">Sem img</div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-display font-bold text-white leading-tight group-hover:text-red-400 transition-colors">
                              {item.product.isPizza && item.pizzaDetails
                                ? `Pizza ${item.pizzaDetails.size}`
                                : item.product.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-zinc-500 hover:text-red-500 p-1 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {item.pizzaDetails && (
                            <p className="text-sm text-zinc-400 mt-1">
                              {item.pizzaDetails.flavors.join(' & ')}
                            </p>
                          )}
                          
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-sm text-zinc-400 mt-1">
                              + {item.addons.map(a => a.name).join(', ')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-full px-2 py-1">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-display font-bold text-sm w-4 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-full transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                            R$ {((item.pizzaDetails ? item.pizzaDetails.price : item.product.price + item.addons.reduce((sum, a) => sum + a.price, 0)) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="p-6 bg-zinc-900 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-zinc-400">
                      <span>Subtotal</span>
                      <span className="text-white">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Taxa de entrega</span>
                      <span className="text-white">R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-display font-bold text-white pt-4 border-t border-white/10 mt-4">
                      <span>Total</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">R$ {(total + deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      toggleCart();
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-display font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-between group border border-red-500/50"
                  >
                    <span>Finalizar Pedido</span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        total={total + deliveryFee}
      />
    </>
  );
}
