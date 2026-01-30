import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Store, LogIn, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, cartCount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-black tracking-tighter text-gray-900">3D-SHOP</span>
        </Link>

        <div className="flex items-center gap-6 sm:gap-8 text-sm font-semibold text-gray-600">
          <Link to="/" className="hover:text-indigo-600 flex items-center gap-1">
            <Store className="w-4 h-4" /> Mağaza
          </Link>
          <Link to="/cart" className="hover:text-indigo-600 flex items-center gap-1 relative">
            <ShoppingCart className="w-4 h-4" /> Sepetim
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/orders" className="hover:text-indigo-600 flex items-center gap-1">
                <Package className="w-4 h-4" /> Siparişlerim
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
              >
                <LogOut className="w-4 h-4" /> Çıkış
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-indigo-600 transition flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" /> Giriş Yap
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
