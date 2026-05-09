import React from 'react';
import { useOrders } from '../hooks/useOrders';

const OrderHistory = ({ user }) => {
  const { orders, loading, error } = useOrders(user?.id);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes commandes</h2>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes commandes</h2>
        <div className="text-center py-12">
          <p className="text-red-600">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes commandes</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-600">Aucune commande pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-serif tracking-tight">Historique des commandes</h2>
        
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
      </div>
    </div>
  );
};

export default OrderHistory;
