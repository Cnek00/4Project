import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProductDetail, addToCartWithColor, addToCart, mediaUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, CheckCircle, ArrowLeft, Eye, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated, refreshCartCount } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [show3d, setShow3d] = useState(false);

  const loadProduct = () => {
    getProductDetail(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  useEffect(() => {
    const onLang = () => loadProduct();
    window.addEventListener('language-change', onLang);
    return () => window.removeEventListener('language-change', onLang);
  }, [id]);

  if (loading) return <div className="text-center py-20 font-bold">Yükleniyor...</div>;
  if (!product) return <div className="text-center py-20 font-bold">Ürün bulunamadı!</div>;

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => mediaUrl(img.image))
    : product.thumbnail
      ? [mediaUrl(product.thumbnail)]
      : [];
  const mainImage = images[galleryIndex] || images[0];
  const modelUrl = product.model_3d ? mediaUrl(product.model_3d) : null;
  const posterUrl = product.model_3d_poster ? mediaUrl(product.model_3d_poster) : mainImage;
  const displayName = product.display_name || product.name_tr || product.name_en;
  const displayDescription = product.display_description || product.description_tr || product.description_en;

  const handleAddToCart = () => {
    if (!selectedSizeId) {
      setMessage('Lütfen beden seçin.');
      return;
    }
    if (!isAuthenticated) {
      setMessage('Sepete eklemek için giriş yapmalısınız.');
      return;
    }
    setMessage(null);
    const request = selectedColorId
      ? addToCartWithColor(product.id, selectedSizeId, selectedColorId, quantity)
      : addToCart(product.id, selectedSizeId, quantity);
    request
      .then(() => {
        setMessage('Ürün sepete eklendi.');
        refreshCartCount?.();
      })
      .catch((err) => {
        setMessage(err.response?.data?.error || 'Sepete eklenirken hata oluştu.');
      });
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <Link to="/" className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Mağazaya Dön
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShow3d(false)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                !show3d ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200'
              }`}
            >
              <Eye className="w-4 h-4 inline-block mr-1" />
              Görseller
            </button>
            {modelUrl && (
              <button
                type="button"
                onClick={() => setShow3d(true)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  show3d ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200'
                }`}
              >
                <Box className="w-4 h-4 inline-block mr-1" />
                3D Görünüm
              </button>
            )}
          </div>

          <div className="bg-white aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center">
            {!show3d && mainImage ? (
              <img
                src={mainImage}
                alt={displayName}
                className="w-full h-full object-contain p-6"
              />
            ) : null}
            {!show3d && !mainImage ? (
              <div className="text-gray-300 italic">Görsel mevcut değil.</div>
            ) : null}
            {show3d && modelUrl ? (
              <model-viewer
                src={modelUrl}
                poster={posterUrl || undefined}
                camera-controls
                auto-rotate
                shadow-intensity="1"
                style={{ width: '100%', height: '100%' }}
              />
            ) : null}
            {show3d && !modelUrl ? (
              <div className="text-gray-300 italic">3D model mevcut değil.</div>
            ) : null}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGalleryIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${
                    galleryIndex === idx ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-black text-gray-900 mb-2 leading-tight">
            {displayName}
          </h1>
          <p className="text-xl text-gray-400 italic mb-6">{product.name_en}</p>

          <div className="text-3xl font-extrabold text-indigo-600 mb-8 bg-indigo-50 inline-block px-4 py-2 rounded-xl self-start">
            {product.price} <span className="text-lg font-medium">{product.currency}</span>
          </div>

          <p className="text-gray-600 leading-relaxed mb-8">
            {displayDescription}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold text-gray-700 mb-3">Renk Seçin</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColorId(c.id)}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                      selectedColorId === c.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200'
                    }`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                      style={{ background: c.hex_code }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10">
            <h3 className="font-bold text-gray-700 mb-4">Mevcut Stok / Beden Seçin</h3>
            <div className="flex flex-wrap gap-3">
              {product.sizes && product.sizes.length > 0 ? (
                product.sizes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSizeId(item.id)}
                    disabled={item.stock < 1}
                    className={`px-5 py-3 rounded-2xl border-2 transition cursor-pointer ${
                      selectedSizeId === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-100 hover:border-indigo-200'
                    } ${item.stock < 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="text-xs text-gray-400 uppercase font-bold">Beden</p>
                    <p className="text-lg font-black text-gray-800">{item.size_value}</p>
                    <p className="text-[10px] text-green-600 font-medium">
                      {item.stock} adet stokta
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm italic">Bu ürün için beden bilgisi girilmemiş.</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Miktar</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-24 px-3 py-2 rounded-xl border border-gray-200"
            />
          </div>

          {message && (
            <div className={`mb-4 px-4 py-2 rounded-xl text-sm ${
              message.includes('eklendi') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition shadow-xl shadow-gray-200 active:scale-[0.98]"
            >
              <ShoppingCart className="w-6 h-6" />
              Sepete Ekle
            </button>
            <div className="flex items-center justify-center gap-6 text-gray-400 text-xs font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Orijinal Ürün
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Hızlı Kargo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
