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
    <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-10 lg:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 font-serif tracking-tight">Historique des commandes</h2>
        
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-100 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 bg-slate-50/30 group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                <div>
                  <p className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                    Commande #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    ID Transaction: <span className="font-mono text-base font-medium text-slate-500">{order.transaction_id}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    <span>📅</span>
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span className="px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {order.status === 'confirmed' ? 'Confirmée' : order.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mb-8">
                <div className="space-y-4">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Informations de livraison</p>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50">
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {order.shipping_details?.fullName}
                    </p>
                    <p className="text-base text-slate-600 leading-relaxed">
                      {order.shipping_details?.address}<br/>
                      {order.shipping_details?.postalCode} {order.shipping_details?.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Détails du paiement</p>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-600">Mode de paiement</span>
                    <span className="text-lg font-black text-slate-900 uppercase">Visa •••• 4242</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8 mb-8">
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Articles commandés</p>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white border border-slate-50 p-5 rounded-2xl group-hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">📦</div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{item.product_name || 'Produit'}</p>
                            <p className="text-sm font-bold text-slate-400">Quantité: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-xl font-black text-slate-900">{Number(item.total_price || item.unit_price * item.quantity || 0).toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-base text-slate-400 italic">Détails des articles non disponibles.</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-lg text-slate-500 font-bold uppercase tracking-widest">
                  Total de la commande
                </p>
                <p className="text-4xl font-black text-blue-600 tracking-tight">
                  {order.total_price ? `${order.total_price.toFixed(2)}€` : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
