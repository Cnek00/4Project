import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Box, Zap, Globe, Layers, ShoppingBag } from 'lucide-react';

const T = {
  tr: {
    badge: '3D Shop Hakkında',
    title: 'Alışverişin\nüçüncü boyutu.',
    sub: 'Bir ürünü satın almadan önce gerçekten görmek istiyorsan doğru yerdesin. 3D Shop; fotoğraf, video ve 3D model deneyimini tek çatı altında birleştirir.',
    mBadge: 'Misyonumuz',
    mission: 'E-ticarette iade oranlarını düşürmek, müşteri memnuniyetini artırmak ve alışveriş kararını bilinçli kılmak için 3D teknolojisini herkes için erişilebilir hale getiriyoruz.',
    feats: [
      { icon: Eye, title: '360° Görünüm', desc: 'Ürünü her açıdan incele, hiçbir detayı kaçırma.' },
      { icon: Box, title: '3D Model', desc: 'Gerçek hayat ölçülerinde modeli döndür ve yaklaştır.' },
      { icon: Zap, title: 'Hızlı Karar', desc: 'Görüp beğenince tek tıkla sepete ekle.' },
      { icon: Globe, title: 'TR / EN', desc: 'İki dilde tam içerik ve arayüz desteği.' },
      { icon: Layers, title: 'Çoklu Beden', desc: 'Her ürün için beden ve renk seçimi ile stok takibi.' },
      { icon: ShoppingBag, title: 'Güvenli Ödeme', desc: 'Stok kilitleme ile güvenli checkout akışı.' },
    ],
    cta: 'Mağazaya Git',
  },
  en: {
    badge: 'About 3D Shop',
    title: 'The third dimension\nof shopping.',
    sub: 'If you want to truly see a product before buying, you\'re in the right place. 3D Shop combines photo, video, and 3D model experiences under one roof.',
    mBadge: 'Our Mission',
    mission: 'We make 3D technology accessible to everyone to reduce return rates in e-commerce, increase customer satisfaction, and enable informed purchasing decisions.',
    feats: [
      { icon: Eye, title: '360° View', desc: 'Inspect the product from every angle, miss no detail.' },
      { icon: Box, title: '3D Model', desc: 'Rotate and zoom at real-life scale.' },
      { icon: Zap, title: 'Quick Decision', desc: 'Like it, add to cart with one click.' },
      { icon: Globe, title: 'TR / EN', desc: 'Full content and UI in two languages.' },
      { icon: Layers, title: 'Multi-size', desc: 'Size & color selection with stock tracking.' },
      { icon: ShoppingBag, title: 'Safe Checkout', desc: 'Secure checkout with stock locking.' },
    ],
    cta: 'Go to Store',
  },
};

export default function About() {
  const [lang, setLang] = useState(() => localStorage.getItem('site_lang') || 'tr');

  useEffect(() => {
    const onLang = () => setLang(localStorage.getItem('site_lang') || 'tr');
    window.addEventListener('language-change', onLang);
    return () => window.removeEventListener('language-change', onLang);
  }, []);

  const t = T[lang] ?? T.tr;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-[0_32px_80px_rgba(8,20,40,0.06)]">
          <span className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
            {t.badge}
          </span>
          <h1 className="mt-8 text-4xl font-black tracking-tight text-slate-900 whitespace-pre-line">
            {t.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">{t.sub}</p>
          <div className="mt-10 rounded-3xl bg-slate-50 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">{t.mBadge}</p>
            <p className="mt-4 text-xl font-semibold text-slate-900">{t.mission}</p>
          </div>
          <Link
            to="/"
            className="mt-10 inline-flex items-center justify-center rounded-full bg-indigo-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            {t.cta}
          </Link>
        </div>

        <div className="grid gap-4">
          {t.feats.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-700">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-slate-900">{feat.title}</h2>
                <p className="mt-3 text-slate-600">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
