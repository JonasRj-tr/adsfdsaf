import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { menu as hardcodedMenu, Category, Product } from '../data/menu';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Layout } from '../components/Layout';

const categories: Category[] = ['Lanches', 'Hot Dog', 'Batatas', 'Bistrô', 'Sopas', 'Pizzas', 'Sobremesas'];

export function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('Lanches');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<string[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setDynamicProducts(products);
    }, (error) => {
      console.error("Error fetching products:", error);
    });

    const qDeleted = query(collection(db, 'deleted_products'));
    const unsubscribeDeleted = onSnapshot(qDeleted, (snapshot) => {
      const deletedIds = snapshot.docs.map(doc => doc.data().productId);
      setDeletedProducts(deletedIds);
    }, (error) => {
      console.error("Error fetching deleted products:", error);
    });

    return () => {
      unsubscribe();
      unsubscribeDeleted();
    };
  }, []);

  const fullMenu = [...hardcodedMenu, ...dynamicProducts]
    .filter(p => !deletedProducts.includes(p.id) && !deletedProducts.includes((p as any).originalId))
    .reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.id === current.id || item.id === (current as any).originalId);
      if (existingIndex > -1) {
        // Dynamic product overrides hardcoded one
        acc[existingIndex] = { ...current, id: acc[existingIndex].id };
      } else {
        acc.push(current);
      }
      return acc;
    }, [] as Product[]);
  const filteredMenu = fullMenu.filter((item) => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-zinc-900 border border-white/5 shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent" />
        </div>
        <div className="relative px-8 py-16 md:py-24 max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 font-medium text-sm mb-6 border border-red-500/20">
            Sabor Inesquecível
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            A melhor experiência <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              gastronômica
            </span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl mb-8 max-w-lg">
            Ingredientes selecionados, preparo artesanal e entrega rápida. Escolha seu favorito e deixe o resto com a gente.
          </p>
        </div>
      </div>

      <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-3 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/20 border border-red-500/50'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5 hover:border-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">{activeCategory}</h2>
          <p className="text-zinc-500">Escolha os melhores itens do nosso cardápio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMenu.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={setSelectedProduct}
          />
        ))}
        {filteredMenu.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            Nenhum produto encontrado nesta categoria.
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </Layout>
  );
}
