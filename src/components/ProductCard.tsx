import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../data/menu';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div
      onClick={() => onClick(product)}
      className="bg-zinc-900 rounded-3xl shadow-lg border border-white/5 overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:border-white/10 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden bg-zinc-800">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            Sem imagem
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <span className="text-white font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Plus className="w-5 h-5 text-red-500" /> Adicionar ao pedido
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1 relative">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-display font-bold text-xl text-white leading-tight group-hover:text-red-400 transition-colors">
            {product.name}
          </h3>
        </div>
        
        {product.description && (
          <p className="text-zinc-400 text-sm mb-6 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <span className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 text-xl">
            {product.price > 0 ? `R$ ${product.price.toFixed(2)}` : 'A partir de'}
          </span>
          <button className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-red-600 group-hover:to-orange-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300 border border-white/5 group-hover:border-red-500/50">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
