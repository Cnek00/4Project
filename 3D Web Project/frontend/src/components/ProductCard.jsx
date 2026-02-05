import { Link } from 'react-router-dom';
import { mediaUrl } from '../services/api';

export default function ProductCard({ product }) {
  const imageSrc = product.thumbnail || product.images?.[0]?.image;
  const src = imageSrc ? mediaUrl(imageSrc) : null;
  const displayName = product.display_name || product.name_tr || product.name_en;

  return (
    <div className="border p-4 rounded-2xl bg-white hover:shadow-lg transition flex flex-col h-full">
      <div className="h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
        {src ? (
          <img
            src={src}
            alt={displayName}
            className="object-cover w-full h-full hover:scale-105 transition duration-300"
          />
        ) : (
          <span className="text-gray-400">Görsel Yok</span>
        )}
      </div>

      <h3 className="font-bold text-lg text-gray-800 mb-1">
        {displayName}
      </h3>

      <p className="text-xs text-gray-400 mb-3 italic">
        {product.name_en}
      </p>

      <div className="mt-auto flex justify-between items-center">
        <span className="text-indigo-600 font-extrabold text-xl">
          {product.price} <span className="text-sm font-normal">{product.currency}</span>
        </span>
      </div>

      <Link
        to={`/product/${product.id}`}
        className="block text-center mt-4 bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600 transition"
      >
        İncele
      </Link>
    </div>
  );
}
