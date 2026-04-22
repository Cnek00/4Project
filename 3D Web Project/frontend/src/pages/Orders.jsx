import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Package, ArrowLeft } from 'lucide-react';

export default function Orders() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status) => {
    const labels = {
      pending: t('orders.pending'),
      processing: t('orders.processing'),
      paid: t('orders.paid'),
      shipped: t('orders.shipped'),
      delivered: t('orders.delivered'),
      return_request: t('orders.returnRequest'),
      return_accepted: t('orders.returnAccepted'),
      returned: t('orders.returned'),
      refunded: t('orders.refunded'),
      cancelled: t('orders.cancelled'),
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'returned':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'cancelled':
      case 'return_request':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'refunded':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
  };

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
        <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">{t('common.orders')}</h1>
        <div className="bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Siparişlerinizi görmek için giriş yapın.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition"
          >
            {t('common.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center font-bold text-indigo-600">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">{t('common.orders')}</h1>

      {orders.length === 0 ? (
        <div className="bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">{t('orders.empty')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> {t('cart.continue')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-cyan-900/5 overflow-hidden bg-white dark:bg-slate-900"
            >
              <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-gray-900 dark:text-white">{t('orders.orderId')} #{order.id}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {order.created_at ? new Date(order.created_at).toLocaleDateString('tr-TR') : ''}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <ul className="p-4 divide-y divide-gray-50 dark:divide-slate-800">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="py-3 flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.product_name} ({t('product.size')}: {item.size_value}) x {item.quantity}
                    </span>
                    <span className="font-semibold text-indigo-600 dark:text-cyan-400">{item.line_total} EUR</span>
                  </li>
                ))}
              </ul>
              <div className="p-4 bg-indigo-50 dark:bg-slate-800/80 border-t border-indigo-100 dark:border-slate-800 flex justify-end">
                <span className="font-black text-indigo-700 dark:text-cyan-400">{t('cart.total')}: {order.total} EUR</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/" className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> {t('common.shop')}
        </Link>
      </div>
    </div>
  );
}
