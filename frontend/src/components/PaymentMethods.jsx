import React from 'react';

const PaymentMethods = ({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Moyens de paiement</h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-gray-600">Aucun moyen de paiement enregistré</p>
          <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Ajouter une carte
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
