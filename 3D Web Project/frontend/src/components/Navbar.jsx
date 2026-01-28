import { Link } from 'react-router-dom';
import { ShoppingCart, Store, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo - Her zaman Ana Sayfa'ya atar */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform"></div>
          <span className="text-xl font-black tracking-tighter text-gray-900">3D-SHOP</span>
        </Link>

        {/* Linkler */}
        <div className="flex items-center gap-8 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-indigo-600 flex items-center gap-1">
            <Store className="w-4 h-4" /> Mağaza
          </Link>
          <Link to="/cart" className="hover:text-indigo-600 flex items-center gap-1 relative">
            <ShoppingCart className="w-4 h-4" /> Sepetim
            {/* Sepet Sayısı Balonu (Statik şimdilik) */}
            <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </Link>
          <button className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition">
            Giriş Yap
          </button>
        </div>
      </div>
    </nav>
  );
}