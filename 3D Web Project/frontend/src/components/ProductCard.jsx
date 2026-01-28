import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="border p-4 rounded-xl bg-white hover:shadow-lg transition flex flex-col h-full">
      {/* Ürün Görseli (Thumbnail) */}
      <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name_tr}
            className="object-cover w-full h-full hover:scale-105 transition duration-300"
          />
        ) : (
          <span className="text-gray-400">Görsel Yok</span>
        )}
      </div>

      {/* Ürün Başlığı (Türkçe ismi kullanıyoruz) */}
      <h3 className="font-bold text-lg text-gray-800 mb-1">
        {product.name_tr}
      </h3>

      {/* İngilizce İsim (Alt başlık gibi durması için) */}
      <p className="text-xs text-gray-400 mb-3 italic">
        {product.name_en}
      </p>

      {/* Fiyat ve Birim */}
      <div className="mt-auto flex justify-between items-center">
        <span className="text-indigo-600 font-extrabold text-xl">
          {product.price} <span className="text-sm font-normal">{product.currency}</span>
        </span>
      </div>

      {/* Detay Butonu */}
      <Link
        to={`/product/${product.id}`}
        className="block text-center mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
      >
        İncele
      </Link>
    </div>
  );
}