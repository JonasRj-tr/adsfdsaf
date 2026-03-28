export type Category = 'Lanches' | 'Hot Dog' | 'Batatas' | 'Bistrô' | 'Sopas' | 'Pizzas' | 'Sobremesas';

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: Category;
  image: string;
  addons?: Addon[];
  isPizza?: boolean;
}

const lancheAddons: Addon[] = [
  { id: 'a1', name: 'Bacon', price: 3 },
  { id: 'a2', name: 'Ovo', price: 2 },
  { id: 'a3', name: 'Cheddar', price: 3 },
  { id: 'a4', name: 'Catupiry', price: 3 },
];

export const menu: Product[] = [
  // Lanches
  { id: 'l1', name: 'X-Calabresa', price: 20, category: 'Lanches', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'l2', name: 'X-Bacon', price: 20, category: 'Lanches', image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'l3', name: 'X-Salada', price: 10, category: 'Lanches', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'l4', name: 'X-Tudo', price: 25, category: 'Lanches', image: 'https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'l5', name: 'Misto', price: 6, category: 'Lanches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'l6', name: 'Misto Duplo', price: 8, category: 'Lanches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },

  // Hot Dog
  { id: 'h1', name: 'Simples', price: 8, category: 'Hot Dog', image: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'h2', name: 'Queijo', price: 10, category: 'Hot Dog', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'h3', name: 'Bacon', price: 12, category: 'Hot Dog', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },
  { id: 'h4', name: 'Calabresa', price: 12, category: 'Hot Dog', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=500', addons: lancheAddons },

  // Batatas
  { id: 'b1', name: 'Pequena', price: 15, category: 'Batatas', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=500' },
  { id: 'b2', name: 'Grande', price: 20, category: 'Batatas', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=500' },
  { id: 'b3', name: 'Bacon', price: 25, category: 'Batatas', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=500' },
  { id: 'b4', name: 'Calabresa', price: 25, category: 'Batatas', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=500' },
  { id: 'b5', name: 'Cheddar', price: 25, category: 'Batatas', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=500' },
  { id: 'b6', name: 'Monster', price: 35, category: 'Batatas', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=500' },

  // Bistrô
  { id: 'bi1', name: 'Carne na Chapa', price: 25, category: 'Bistrô', image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&q=80&w=500' },
  { id: 'bi2', name: 'Lasanha Bolonhesa', price: 25, category: 'Bistrô', image: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&q=80&w=500' },
  { id: 'bi3', name: 'Filé de Frango', price: 20, category: 'Bistrô', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=500' },

  // Sopas
  { id: 's1', name: 'Carne', price: 17, category: 'Sopas', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=500' },
  { id: 's2', name: 'Mocotó', price: 17, category: 'Sopas', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=500' },

  // Sobremesas
  { id: 'so1', name: 'Pudim', price: 12, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1508737804141-4c3b688e2546?auto=format&fit=crop&q=80&w=500' },
  { id: 'so2', name: 'Bolo de Pote', price: 15, category: 'Sobremesas', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=500' },

  // Pizzas (Special handling)
  { id: 'p1', name: 'Pizza', price: 0, category: 'Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=500', isPizza: true },
];

export const pizzaSizes = [
  { id: 'sz1', name: 'Média', priceMultiplier: 1 },
  { id: 'sz2', name: 'Grande', priceMultiplier: 1.3 },
  { id: 'sz3', name: 'Família', priceMultiplier: 1.6 },
];

export const pizzaFlavors = [
  { id: 'f1', name: 'Calabresa', type: 'Tradicional', basePrice: 40 },
  { id: 'f2', name: 'Margarita', type: 'Tradicional', basePrice: 40 },
  { id: 'f3', name: 'Milho', type: 'Tradicional', basePrice: 40 },
  { id: 'f4', name: 'Portuguesa', type: 'Tradicional', basePrice: 40 },
  { id: 'f5', name: 'Mussarela', type: 'Tradicional', basePrice: 40 },
  { id: 'f6', name: 'Calabresa c/ Catupiry', type: 'Especial', basePrice: 50 },
  { id: 'f7', name: 'Carne Seca', type: 'Especial', basePrice: 50 },
  { id: 'f8', name: 'Frango c/ Catupiry', type: 'Especial', basePrice: 50 },
  { id: 'f9', name: 'Moda da Casa', type: 'Especial', basePrice: 50 },
  { id: 'f10', name: '4 Queijos', type: 'Especial', basePrice: 50 },
  { id: 'f11', name: 'Banana c/ Chocolate', type: 'Doce', basePrice: 45 },
  { id: 'f12', name: 'Banana c/ Leite Condensado', type: 'Doce', basePrice: 45 },
  { id: 'f13', name: 'Chocolate com M&M', type: 'Doce', basePrice: 45 },
];
