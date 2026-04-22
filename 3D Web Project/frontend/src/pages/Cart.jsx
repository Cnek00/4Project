import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getMyCart,
  updateCartItemQuantity,
  removeCartItem,
  applyCoupon,
  checkout,
  mediaUrl,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { t } = useTranslation();
  const { isAuthenticated, refreshCartCount } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderDone, setOrderDone] = useState(null);

  const loadCart = () => {
    if (!isAuthenticated) {
      setCart({ items: [] });
      setLoading(false);
      return;
    }
    getMyCart()
      .then((data) => setCart(data))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty < 1) return;
    updateCartItemQuantity(itemId, newQty)
      .then((data) => {
        setCart(data);
        refreshCartCount?.();
      })
      .catch(() => {});
  };

  const handleRemove = (itemId) => {
    removeCartItem(itemId)
      .then((data) => {
        setCart(data);
        refreshCartCount?.();
      })
      .catch(() => {});
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage('');
    applyCoupon(couponCode.trim())
      .then((data) => {
        setCart(data);
        setCouponMessage(t('cart.couponApplied'));
      })
      .catch((err) => {
        setCouponMessage(err.response?.data?.error || t('cart.couponInvalid'));
      });
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);
    setOrderDone(null);
    checkout()
      .then((data) => {
        setOrderDone(data);
        setCart({ items: [] });
        refreshCartCount?.();
      })
      .catch((err) => {
        setCouponMessage(err.response?.data?.error || 'Sipariş oluşturulamadı.');
      })
      .finally(() => setCheckoutLoading(false));
  };

  const items = cart?.items ?? [];
  const isEmpty = !loading && items.length === 0;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center font-bold text-indigo-600">
        {t('common.loading')}
      </div>
    );
  }

  if (orderDone) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-3xl p-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Siparişiniz alındı</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sipariş numarası: <strong>#{orderDone.id}</strong>
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition"
          >
            {t('common.orders')}
          </Link>
          <Link
            to="/"
            className="ml-4 inline-flex items-center gap-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Alışverişe Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">{t('cart.title')}</h1>
        <div className="bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Sepeti görmek için giriş yapın.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition"
          >
            {t('common.login')}
          </Link>
          <Link to="/" className="ml-4 inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold hover:text-white">
            <ArrowLeft className="w-4 h-4" /> {t('common.shop')}
          </Link>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">{t('cart.title')}</h1>
        <div className="bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">{t('cart.empty')}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> {t('cart.continue')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white">{t('cart.title')}</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-cyan-900/5"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 flex-shrink-0">
              {item.product_thumbnail ? (
                <img
                  src={mediaUrl(item.product_thumbnail)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">Ürün</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white">{item.product_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('product.size')}: {item.size_value}</p>
              <p className="text-indigo-600 dark:text-cyan-400 font-semibold">
                {item.current_price} x {item.quantity} = {item.total_item_price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                −
              </button>
              <span className="w-10 text-center font-semibold dark:text-white">{item.quantity}</span>
              <button
                type="button"
                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-slate-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              title={t('cart.remove')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Kupon */}
      <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-transparent dark:border-slate-800">
        <form onSubmit={handleApplyCoupon} className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t('cart.coupon')}
            className="flex-1 min-w-[120px] px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gray-800 dark:bg-slate-700 text-white font-bold hover:bg-gray-900 dark:hover:bg-slate-600 transition"
          >
            {t('cart.applyCoupon')}
          </button>
        </form>
        {couponMessage && (
          <p className={`mt-2 text-sm ${couponMessage.includes('uygulandı') ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {couponMessage}
          </p>
        )}
      </div>

      {/* Toplam & Siparişi tamamla */}
      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="text-2xl font-black text-gray-900 dark:text-white">
          {t('cart.total')}: <span className="text-indigo-600 dark:text-cyan-400">{cart?.total_price ?? 0}</span> EUR
        </p>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="inline-flex items-center gap-2 bg-indigo-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-cyan-400 transition disabled:opacity-50"
        >
          <ShoppingBag className="w-5 h-5" />
          {checkoutLoading ? 'İşleniyor...' : t('cart.checkout')}
        </button>
      </div>

      <div className="mt-8">
        <Link to="/" className="text-indigo-600 dark:text-cyan-400 font-semibold hover:underline">
          ← {t('cart.continue')}
        </Link>
      </div>
    </div>
  );
}
