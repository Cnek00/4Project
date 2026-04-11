import { Link } from 'react-router-dom';
import { mediaUrl } from '../services/api';
import { ArrowRight } from 'lucide-react';
import { getLang } from '../utils/locale';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm animate-pulse">
      <div className="h-56 w-full bg-slate-200" />
      <div className="p-5 space-y-4">
        <div className="h-5 w-3/4 rounded-full bg-slate-200" />
        <div className="h-4 w-1/2 rounded-full bg-slate-200" />
        <div className="h-8 w-full rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProductCard({ product }) {
  const imageSrc = product.thumbnail || product.images?.[0]?.image;
  const src = imageSrc ? mediaUrl(imageSrc) : null;
  const lang = getLang();
  const displayName = product.display_name || (lang === 'tr' ? product.name_tr : product.name_en) || product.name_tr || product.name_en;
  const subtitle = lang === 'tr' ? product.name_tr || product.name_en : product.name_en || product.name_tr;
  const has3d = !!product.model_3d;

  return (
    <div className="group rounded-[28px] overflow-hidden border border-slate-200 bg-white shadow-sm transition will-change-transform hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden bg-slate-100">
        {src ? (
          <img
            src={src}
            alt={displayName}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-400">Görsel yok</div>
        )}
        {has3d && (
          <span className="absolute left-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-xl">
            ◈ 3D
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 leading-tight">{displayName}</h2>
          <p className="text-sm text-slate-500 line-clamp-2">{subtitle}</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Fiyat</p>
            <p className="text-2xl font-black text-indigo-600">{product.price} {product.currency}</p>
          </div>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            İncele <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
