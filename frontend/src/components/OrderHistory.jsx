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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes commandes</h2>
        
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Transaction: {order.transaction_id}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {order.status === 'confirmed' ? 'Confirmée' : order.status}
                </span>
              </div>

              <div className="border-t pt-3 mb-3">
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-semibold">Livraison:</span> {order.shipping_details?.fullName}
                </p>
                <p className="text-xs text-gray-600">
                  {order.shipping_details?.address}, {order.shipping_details?.postalCode} {order.shipping_details?.city}
                </p>
              </div>

              <div className="border-t pt-3 flex justify-between items-center">
                <div>
                  {order.items && order.items.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">{order.items.length}</span> article(s)
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-900">
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
