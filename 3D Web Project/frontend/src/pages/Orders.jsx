import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowLeft } from 'lucide-react';

const statusLabels = {
  pending: 'Beklemede',
  paid: 'Ödendi',
  shipped: 'Kargoda',
  delivered: 'Teslim Edildi',
  cancelled: 'İptal',
};

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    getMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-black mb-8 text-gray-900">Siparişlerim</h1>
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <p className="text-gray-500 mb-6 font-medium">Siparişlerinizi görmek için giriş yapın.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center font-bold text-indigo-600">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8 text-gray-900">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6 font-medium">Henüz siparişiniz yok.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Alışverişe Dön
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 rounded-2xl shadow-sm overflow-hidden bg-white"
            >
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-gray-900">Sipariş #{order.id}</span>
                <span className="text-sm text-gray-500">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : ''}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {statusLabels[order.status] ?? order.status}
                </span>
              </div>
              <ul className="p-4 divide-y divide-gray-50">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="py-3 flex justify-between text-sm">
                    <span>
                      {item.product_name} (Beden: {item.size_value}) x {item.quantity}
                    </span>
                    <span className="font-semibold text-indigo-600">{item.line_total} EUR</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-indigo-50 border-t border-indigo-100 flex justify-end">
                <span className="font-black text-indigo-700">Toplam: {order.total} EUR</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Mağazaya dön
        </Link>
      </div>
    </div>
  );
}
