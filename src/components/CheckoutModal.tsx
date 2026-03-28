import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export function CheckoutModal({ isOpen, onClose, total }: CheckoutModalProps) {
  const { items, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    observacao: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format items for WhatsApp and DB
      const formattedItems = items.map(item => {
        let name = item.product.name;
        if (item.pizzaDetails) {
          name = `Pizza ${item.pizzaDetails.size} (${item.pizzaDetails.flavors.join(' & ')})`;
        }
        
        const addonsStr = item.addons.length > 0 
          ? ` (+ ${item.addons.map(a => a.name).join(', ')})` 
          : '';
          
        return `${item.quantity}x ${name}${addonsStr}`;
      });

      // Save to Firebase
      await addDoc(collection(db, 'orders'), {
        cliente: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco,
        observacao: formData.observacao,
        itens: formattedItems,
        total: total,
        status: 'Novo',
        data: serverTimestamp(),
      });

      // Format WhatsApp Message
      const waMessage = `
*NOVO PEDIDO* 🍔
------------------------
*Cliente:* ${formData.nome}
*Telefone:* ${formData.telefone}
*Endereço:* ${formData.endereco}

*ITENS:*
${formattedItems.join('\n')}

*Observação:* ${formData.observacao || 'Nenhuma'}
------------------------
*TOTAL: R$ ${total.toFixed(2)}*
      `.trim();

      const waUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(waMessage)}`;
      
      clearCart();
      onClose();
      toast.success('Pedido enviado com sucesso!');
      
      // Open WhatsApp in new tab
      window.open(waUrl, '_blank');
      
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Erro ao enviar pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[500px] bg-zinc-900 md:rounded-3xl shadow-2xl z-50 flex flex-col max-h-screen overflow-hidden border border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/80 backdrop-blur-md">
              <h2 className="text-2xl font-display font-bold text-white">Finalizar Pedido</h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                    placeholder="João da Silva"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Endereço de Entrega</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none placeholder:text-zinc-600"
                    placeholder="Rua Exemplo, 123 - Bairro&#10;Apto 45, Bloco B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Observações (Opcional)</label>
                  <textarea
                    rows={2}
                    value={formData.observacao}
                    onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none placeholder:text-zinc-600"
                    placeholder="Tirar cebola, troco para R$ 50..."
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 bg-zinc-900 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <span className="text-zinc-400">Total a pagar</span>
                <span className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">R$ {total.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-display font-bold text-lg py-4 px-6 rounded-2xl transition-all shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 border border-red-500/50 disabled:border-white/5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Enviar Pedido via WhatsApp</span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
