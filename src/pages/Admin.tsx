import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Layout } from '../components/Layout';
import { Clock, CheckCircle2, Truck, Check, RefreshCw, Plus, Package, Trash2, Edit2, LogOut, Lock, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, menu as hardcodedMenu } from '../data/menu';
import { useAuthStore } from '../store/authStore';

interface Order {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  observacao: string;
  itens: string[];
  total: number;
  status: 'Novo' | 'Produção' | 'Entrega' | 'Concluído';
  data: any;
}

const statusColors = {
  Novo: 'bg-red-500/20 text-red-400 border-red-500/30',
  Produção: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Entrega: 'bg-green-500/20 text-green-400 border-green-500/30',
  Concluído: 'bg-zinc-800 text-zinc-400 border-zinc-700',
};

export function Admin() {
  const { isAuthenticated, login, logout } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'produtos' | 'configuracoes'>('pedidos');
  
  // Settings state
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Product form state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Sobremesas'
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const qOrders = query(collection(db, 'orders'), orderBy('data', 'desc'));
    
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      
      setOrders(newOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar pedidos. Verifique a configuração do Firebase.");
      setLoading(false);
    });

    const qProducts = query(collection(db, 'products'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(fetchedProducts);
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

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'store'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWhatsappNumber(data.whatsappNumber || '');
        setDeliveryFee(data.deliveryFee?.toString() || '0');
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeDeleted();
      unsubscribeSettings();
    };
  }, [isAuthenticated]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), {
        whatsappNumber,
        deliveryFee: parseFloat(deliveryFee) || 0
      }, { merge: true });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const updateStatus = async (order: Order, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: newStatus
      });
      
      toast.success(`Status atualizado para ${newStatus}`);

      // Send WhatsApp update
      let message = '';
      if (newStatus === 'Produção') {
        message = `Olá ${order.cliente}! 🍕 Seu pedido foi aceito e já está em produção.`;
      } else if (newStatus === 'Entrega') {
        message = `Olá ${order.cliente}! 🚚 Seu pedido saiu para entrega. Fique atento!`;
      }

      if (message) {
        const waUrl = `https://wa.me/55${order.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }

    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const fullMenu = [...hardcodedMenu, ...products]
    .filter(p => !deletedProducts.includes(p.id) && !deletedProducts.includes((p as any).originalId))
    .reduce((acc, current) => {
      // If there's a dynamic product with the same ID or originalId as a hardcoded one, it overrides it
      const existingIndex = acc.findIndex(item => item.id === current.id || item.id === (current as any).originalId);
      if (existingIndex > -1) {
        acc[existingIndex] = { ...current, id: acc[existingIndex].id };
      } else {
        acc.push(current);
      }
      return acc;
    }, [] as Product[]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      if (editingProductId) {
        // Find existing product to preserve properties like addons or isPizza
        const existingProduct = fullMenu.find(p => p.id === editingProductId);
        const productData = {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
          ...(existingProduct?.addons ? { addons: existingProduct.addons } : {}),
          ...(existingProduct?.isPizza ? { isPizza: existingProduct.isPizza } : {})
        };

        // If it's a hardcoded product being edited, we save it to Firebase with its ID
        // so it overrides the hardcoded one.
        await updateDoc(doc(db, 'products', editingProductId), productData).catch(async (err) => {
          // If document doesn't exist (it was hardcoded), create it with the same ID
          if (err.code === 'not-found') {
             // Use setDoc to create a document with a specific ID
             const { setDoc } = await import('firebase/firestore');
             await setDoc(doc(db, 'products', editingProductId), {
               ...productData,
               originalId: editingProductId // Keep track of original ID to override
             });
          } else {
             throw err;
          }
        });
        toast.success('Produto atualizado com sucesso!');
        setEditingProductId(null);
      } else {
        await addDoc(collection(db, 'products'), {
          name: newProduct.name,
          description: newProduct.description,
          price: parseFloat(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
        });
        toast.success('Produto adicionado com sucesso!');
      }
      setNewProduct({ name: '', description: '', price: '', image: '', category: 'Sobremesas' });
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error('Erro ao salvar produto');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image,
      category: product.category,
    });
    setEditingProductId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        // Mark as deleted in Firebase to override hardcoded products
        await addDoc(collection(db, 'deleted_products'), { productId: id });
        try {
          await deleteDoc(doc(db, 'products', id));
        } catch (e) {
          // Ignore if it doesn't exist in products collection
        }
        toast.success('Produto excluído com sucesso!');
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
        toast.success('Pedido excluído com sucesso!');
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error('Erro ao excluir pedido');
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Usuário ou senha incorretos.');
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-zinc-900/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/10 w-full max-w-md">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-center text-white mb-2">Acesso Restrito</h2>
            <p className="text-center text-zinc-400 mb-8">Faça login para gerenciar a loja.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Usuário</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-zinc-600"
                  placeholder="Digite seu usuário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all placeholder:text-zinc-600"
                  placeholder="Digite sua senha"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-display font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-red-600/20 mt-2 border border-red-500/50"
              >
                Entrar no Painel
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
          <p className="text-zinc-400">Carregando painel...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">Painel de Administração</h2>
          <p className="text-zinc-400">Gerencie pedidos e cardápio.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setActiveTab('pedidos')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'pedidos' ? 'bg-zinc-800 shadow-sm text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Pedidos
            </button>
            <button 
              onClick={() => setActiveTab('produtos')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'produtos' ? 'bg-zinc-800 shadow-sm text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Produtos
            </button>
            <button 
              onClick={() => setActiveTab('configuracoes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'configuracoes' ? 'bg-zinc-800 shadow-sm text-white border border-white/10' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Configurações
            </button>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors font-medium border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>

      {activeTab === 'configuracoes' ? (
        <div className="space-y-8">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/10 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center border border-white/10">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  Configurações da Loja
                </h3>
                <p className="text-sm text-zinc-400">
                  Ajuste a taxa de entrega e o número do WhatsApp para receber pedidos.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Número do WhatsApp (com DDD)</label>
                <input
                  required
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                  placeholder="Ex: 11999999999"
                />
                <p className="text-xs text-zinc-500 mt-1">Apenas números. Ex: 11987654321</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Taxa de Entrega (R$)</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                  placeholder="Ex: 5.00"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-display font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 border border-red-500/50 disabled:border-white/5 mt-4"
              >
                {isSavingSettings ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : activeTab === 'pedidos' ? (
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <div className="bg-zinc-900/50 p-12 rounded-3xl border border-white/10 text-center backdrop-blur-sm">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-2">Nenhum pedido ainda</h3>
              <p className="text-zinc-400">Os pedidos aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-zinc-900/50 rounded-3xl border border-white/10 shadow-sm overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-display font-bold text-white">{order.cliente}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>
                        {order.status.toUpperCase()}
                      </span>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="ml-auto text-zinc-500 hover:text-red-500 transition-colors"
                        title="Excluir pedido"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{order.telefone}</span>
                      <span>•</span>
                      <span>{order.data?.toDate ? format(order.data.toDate(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'Agora'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-zinc-500 mb-1">Total do Pedido</p>
                    <p className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">R$ {order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="p-6 bg-zinc-800/30 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-display font-bold text-white mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-zinc-500" />
                      Itens do Pedido
                    </h4>
                    <ul className="space-y-2">
                      {order.itens.map((item, idx) => (
                        <li key={idx} className="text-zinc-300 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-display font-bold text-white mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-zinc-500" />
                        Endereço
                      </h4>
                      <p className="text-zinc-300 bg-zinc-900/50 px-4 py-3 rounded-xl border border-white/5 whitespace-pre-wrap">
                        {order.endereco}
                      </p>
                    </div>
                    
                    {order.observacao && (
                      <div>
                        <h4 className="font-display font-bold text-white mb-2">Observações</h4>
                        <p className="text-orange-200 bg-orange-500/10 px-4 py-3 rounded-xl border border-orange-500/20 whitespace-pre-wrap">
                          {order.observacao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-zinc-900/80 flex flex-wrap gap-3">
                  {order.status === 'Novo' && (
                    <button
                      onClick={() => updateStatus(order, 'Produção')}
                      className="flex-1 min-w-[200px] bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Aceitar Pedido (Em Produção)
                    </button>
                  )}
                  
                  {order.status === 'Produção' && (
                    <button
                      onClick={() => updateStatus(order, 'Entrega')}
                      className="flex-1 min-w-[200px] bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck className="w-5 h-5" />
                      Saiu para Entrega
                    </button>
                  )}

                  {order.status === 'Entrega' && (
                    <button
                      onClick={() => updateStatus(order, 'Concluído')}
                      className="flex-1 min-w-[200px] bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Marcar como Concluído
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/10 shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center border border-red-500/30">
                {editingProductId ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-white">
                  {editingProductId ? 'Editar Produto' : 'Adicionar Produto'}
                </h3>
                <p className="text-sm text-zinc-400">
                  {editingProductId ? 'Atualize as informações do produto.' : 'Adicione novos itens ao cardápio dinamicamente.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome do Produto</label>
                <input
                  required
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                  placeholder="Ex: Torta de Limão"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição (Opcional)</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none resize-none placeholder:text-zinc-600"
                  placeholder="Deliciosa torta com raspas de limão..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                    placeholder="15.90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                  >
                    <option value="Sobremesas" className="bg-zinc-900">Sobremesas</option>
                    <option value="Lanches" className="bg-zinc-900">Lanches</option>
                    <option value="Hot Dog" className="bg-zinc-900">Hot Dog</option>
                    <option value="Batatas" className="bg-zinc-900">Batatas</option>
                    <option value="Bistrô" className="bg-zinc-900">Bistrô</option>
                    <option value="Sopas" className="bg-zinc-900">Sopas</option>
                    <option value="Pizzas" className="bg-zinc-900">Pizzas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">URL da Imagem</label>
                <input
                  required
                  type="url"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-white/10 text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-zinc-600"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="flex gap-3 mt-4">
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setNewProduct({ name: '', description: '', price: '', image: '', category: 'Sobremesas' });
                    }}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-6 rounded-xl transition-colors border border-white/10"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="flex-[2] bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 text-white font-display font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 border border-red-500/50 disabled:border-white/5"
                >
                  {isAddingProduct ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {editingProductId ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      {editingProductId ? 'Atualizar Produto' : 'Salvar Produto'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm rounded-3xl border border-white/10 shadow-sm p-6 md:p-8 max-w-4xl mx-auto">
            <h3 className="text-xl font-display font-bold text-white mb-6">Cardápio Completo</h3>
            
            {fullMenu.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                Nenhum produto no cardápio.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fullMenu.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-zinc-800/30 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-white/5">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">Sem img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display font-bold text-white truncate group-hover:text-red-400 transition-colors">{product.name}</h4>
                      <p className="text-sm text-zinc-400 truncate">{product.category} • R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                         onClick={() => handleEditProduct(product)}
                         className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                         title="Editar"
                       >
                         <Edit2 className="w-5 h-5" />
                       </button>
                       <button
                         onClick={() => handleDeleteProduct(product.id)}
                         className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                         title="Excluir"
                       >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
