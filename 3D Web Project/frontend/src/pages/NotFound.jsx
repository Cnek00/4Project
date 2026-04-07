import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <p
        className="text-9xl font-black mb-2 select-none"
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 60%, var(--accent-light) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        404
      </p>
      <h1 className="text-2xl font-bold mb-2 text-slate-900">Sayfa bulunamadı</h1>
      <p className="mb-8 text-slate-500">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-primary px-8 py-3">
          <Home className="w-4 h-4" /> Ana Sayfa
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn btn-outline px-8 py-3"
        >
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </button>
      </div>
    </div>
  );
}
