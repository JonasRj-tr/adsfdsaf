import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product, Addon, pizzaSizes, pizzaFlavors } from '../data/menu';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  
  // Pizza specific state
  const [selectedSize, setSelectedSize] = useState(pizzaSizes[0]);
  const [isHalfAndHalf, setIsHalfAndHalf] = useState(false);
  const [selectedFlavor1, setSelectedFlavor1] = useState(pizzaFlavors[0]);
  const [selectedFlavor2, setSelectedFlavor2] = useState(pizzaFlavors[1]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedAddons([]);
      setSelectedSize(pizzaSizes[0]);
      setIsHalfAndHalf(false);
      setSelectedFlavor1(pizzaFlavors[0]);
      setSelectedFlavor2(pizzaFlavors[1]);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.some(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const calculatePizzaPrice = () => {
    let basePrice = selectedFlavor1.basePrice;
    if (isHalfAndHalf) {
      basePrice = Math.max(selectedFlavor1.basePrice, selectedFlavor2.basePrice);
    }
    return basePrice * selectedSize.priceMultiplier;
  };

  const calculateTotal = () => {
    let base = product.price;
    if (product.isPizza) {
      base = calculatePizzaPrice();
    }
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return (base + addonsTotal) * quantity;
  };

  const handleAddToCart = () => {
    const item = {
      product,
      quantity,
      addons: selectedAddons,
      ...(product.isPizza && {
        pizzaDetails: {
          size: selectedSize.name,
          flavors: isHalfAndHalf ? [selectedFlavor1.name, selectedFlavor2.name] : [selectedFlavor1.name],
          price: calculatePizzaPrice(),
        }
      })
    };
    
    addItem(item);
    toast.success('Adicionado ao carrinho!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[600px] h-[90vh] md:h-auto md:max-h-[90vh] bg-zinc-900 md:rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden rounded-t-3xl border border-white/10"
          >
            <div className="relative h-48 md:h-64 bg-zinc-800 shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">Sem imagem</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-zinc-900/50 backdrop-blur-md text-white rounded-full hover:bg-zinc-800 transition-colors shadow-sm border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <h2 className="text-3xl font-display font-bold text-white mb-2">{product.name}</h2>
              {product.description && (
                <p className="text-zinc-400 mb-6 leading-relaxed">{product.description}</p>
              )}

              {product.isPizza ? (
                <div className="space-y-8">
                  {/* Tamanho */}
                  <section>
                    <h3 className="font-display font-bold text-xl mb-4 flex items-center justify-between text-white">
                      <span>1. Escolha o tamanho</span>
                      <span className="text-xs font-sans font-normal bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-white/5">Obrigatório</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {pizzaSizes.map(size => (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(size)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            selectedSize.id === size.id
                              ? 'border-red-500 bg-red-500/10 text-red-400 font-bold shadow-lg shadow-red-500/10'
                              : 'border-white/5 hover:border-white/20 text-zinc-400 bg-zinc-800/50'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Meio a meio toggle */}
                  <section className="bg-zinc-800/50 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-bold text-white">Meio a meio?</h3>
                      <p className="text-sm text-zinc-400">Escolha até 2 sabores</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isHalfAndHalf}
                        onChange={(e) => setIsHalfAndHalf(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </section>

                  {/* Sabores */}
                  <section>
                    <h3 className="font-display font-bold text-xl mb-4 flex items-center justify-between text-white">
                      <span>{isHalfAndHalf ? '2. Escolha os sabores' : '2. Escolha o sabor'}</span>
                      <span className="text-xs font-sans font-normal bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-white/5">Obrigatório</span>
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        {isHalfAndHalf && <p className="text-sm font-medium text-red-400 mb-3">Sabor 1</p>}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {pizzaFlavors.map(flavor => (
                            <button
                              key={flavor.id}
                              onClick={() => setSelectedFlavor1(flavor)}
                              className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                                selectedFlavor1.id === flavor.id
                                  ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                                  : 'border-white/5 hover:border-white/20 bg-zinc-800/50'
                              }`}
                            >
                              <div>
                                <p className={`font-medium ${selectedFlavor1.id === flavor.id ? 'text-red-400' : 'text-zinc-300'}`}>
                                  {flavor.name}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1">{flavor.type}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {isHalfAndHalf && (
                        <div>
                          <p className="text-sm font-medium text-red-400 mb-3">Sabor 2</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {pizzaFlavors.map(flavor => (
                              <button
                                key={flavor.id}
                                onClick={() => setSelectedFlavor2(flavor)}
                                className={`p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${
                                  selectedFlavor2.id === flavor.id
                                    ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10'
                                    : 'border-white/5 hover:border-white/20 bg-zinc-800/50'
                                }`}
                              >
                                <div>
                                  <p className={`font-medium ${selectedFlavor2.id === flavor.id ? 'text-red-400' : 'text-zinc-300'}`}>
                                    {flavor.name}
                                  </p>
                                  <p className="text-xs text-zinc-500 mt-1">{flavor.type}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                product.addons && product.addons.length > 0 && (
                  <section>
                    <div className="bg-zinc-800/50 p-5 rounded-2xl mb-6 border border-white/5">
                      <h3 className="font-display font-bold text-xl text-white">Adicionais</h3>
                      <p className="text-sm text-zinc-400">Turbine seu pedido (opcional)</p>
                    </div>
                    <div className="space-y-3">
                      {product.addons.map((addon) => {
                        const isSelected = selectedAddons.some(a => a.id === addon.id);
                        return (
                          <label
                            key={addon.id}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/10' : 'border-white/5 hover:border-white/20 bg-zinc-800/50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-red-500 border-red-500' : 'border-zinc-600 bg-zinc-900'
                              }`}>
                                {isSelected && <X className="w-4 h-4 text-white" />}
                              </div>
                              <span className={`font-medium ${isSelected ? 'text-red-400' : 'text-zinc-300'}`}>
                                {addon.name}
                              </span>
                            </div>
                            <span className="text-zinc-400 font-medium">+ R$ {addon.price.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                )
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-zinc-800 rounded-2xl p-2 border border-white/5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-xl transition-all disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="font-display font-bold text-xl w-6 text-center text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-xl transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-display font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-between group border border-red-500/50"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar
                  </span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
