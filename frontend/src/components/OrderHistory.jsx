import React from 'react';
import { useOrders } from '../hooks/useOrders';
import { RefreshCw, Package } from 'lucide-react';

const OrderHistory = ({ user }) => {
  const { orders, loading, error, refreshOrders } = useOrders(user?.id);

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-500 font-medium tracking-wide uppercase text-xs">Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-serif tracking-tight">Historique des commandes</h2>
          <button 
            onClick={() => refreshOrders()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm italic">
            Une erreur est survenue : {error}
          </div>
        )}

        {!loading && orders.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-sm mb-6">
              <Package size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Aucune commande pour le moment</p>
            <button 
              onClick={() => refreshOrders()}
              className="mt-6 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Réessayer de charger
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition-all duration-300 bg-slate-50/10 group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                        #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    {/* Liste succincte des produits */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {order.items?.map((item, idx) => (
                        <span key={item.id} className="text-sm font-medium text-slate-600">
                          {item.product_name || 'Produit'} (x{item.quantity})
                          {idx < order.items.length - 1 && ","}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">
                        {order.total_price ? `${order.total_price.toFixed(2)}€` : 'N/A'}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Total TTC</p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      order.status === 'confirmed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {order.status === 'confirmed' ? 'Confirmée' : order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
