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
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="p-12 lg:p-20">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 font-serif tracking-tight">Historique des commandes</h2>
        
        <div className="space-y-16">
          {orders.map((order) => (
            <div key={order.id} className="border border-slate-100 rounded-[3rem] p-12 md:p-16 hover:shadow-2xl transition-all duration-500 bg-slate-50/20 group">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                <div>
                  <p className="text-base font-black text-blue-600 uppercase tracking-[0.3em] mb-4">
                    Commande #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">
                    Référence: <span className="font-mono text-xl font-medium text-slate-500">{order.transaction_id}</span>
                  </p>
                  <div className="flex items-center gap-3 text-base font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">
                    <span className="text-xl">📅</span>
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <span className="px-8 py-3 rounded-2xl text-base font-black uppercase tracking-[0.2em] bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                  {order.status === 'confirmed' ? 'Confirmée' : order.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-12 border-t border-slate-100 pt-12 mb-12">
                <div className="space-y-6">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Destination</p>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50">
                    <p className="text-xl font-bold text-gray-900 mb-3">
                      {order.shipping_details?.fullName}
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed font-light italic">
                      {order.shipping_details?.address}<br/>
                      {order.shipping_details?.postalCode} {order.shipping_details?.city}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Paiement</p>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-600">Mode de règlement</span>
                    <span className="text-xl font-black text-slate-900 uppercase tracking-widest italic">Visa •••• 4242</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-12 mb-12">
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10 text-center md:text-left">Détail des Acquisitions</p>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-white border border-slate-100 p-8 rounded-[2rem] group-hover:border-blue-200 transition-all duration-300">
                        <div className="flex items-center gap-8">
                          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">📦</div>
                          <div>
                            <p className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide">{item.product_name || 'Produit'}</p>
                            <p className="text-base font-bold text-slate-400 mt-1 uppercase tracking-widest">Quantité: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{Number(item.total_price || item.unit_price * item.quantity || 0).toFixed(2)}€</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-lg text-slate-400 italic text-center py-10">Détails non disponibles.</p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
                <p className="text-xl text-slate-500 font-bold uppercase tracking-[0.3em]">
                  Total de la commande
                </p>
                <div className="flex flex-col items-center md:items-end">
                  <p className="text-5xl md:text-6xl font-black text-blue-600 tracking-tighter">
                    {order.total_price ? `${order.total_price.toFixed(2)}€` : 'N/A'}
                  </p>
                  <p className="text-xs text-slate-300 uppercase tracking-[0.4em] font-black mt-2">Paiement sécurisé</p>
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
