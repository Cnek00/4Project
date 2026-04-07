import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-black text-slate-900">3D Shop</p>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">
              3D model, fotoğraf ve video ile alışverişi daha emin adımlarla tamamlayın.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900 transition">Mağaza</Link>
            <Link to="/about" className="hover:text-slate-900 transition">Hakkında</Link>
            <Link to="/login" className="hover:text-slate-900 transition">Giriş</Link>
            <Link to="/orders" className="hover:text-slate-900 transition">Siparişlerim</Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} 3D Shop. Tüm hakları saklıdır.</span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Heart className="w-4 h-4 text-pink-500" /> Tasarım ve geliştirme
          </span>
        </div>
      </div>
    </footer>
  );
}
