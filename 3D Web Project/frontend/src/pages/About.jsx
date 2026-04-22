import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layers, Zap, Globe, ShoppingBag, Shield, Star } from 'lucide-react';

import heroImg from '../assets/about_hero.png';
import panel1Img from '../assets/about_panel1.png';
import panel2Img from '../assets/about_panel2.png';
import ctaImg from '../assets/about_cta.png';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const stats = [
  { number: '500+', label: '3D Ürün' },
  { number: '12K+', label: 'Mutlu Müşteri' },
  { number: '98%', label: 'Memnuniyet' },
  { number: '3', label: 'Dil Desteği' },
];

const features = [
  { icon: Layers, text: 'Gerçek zamanlı 3D önizleme' },
  { icon: Zap, text: 'Hızlı teslimat ağı' },
  { icon: Globe, text: 'Çok dilli platform' },
  { icon: ShoppingBag, text: 'Kolay satın alma akışı' },
  { icon: Shield, text: 'Güvenli ödeme altyapısı' },
  { icon: Star, text: 'Kalite garantisi' },
];

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden">

      {/* ─── 1. HERO SECTION ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left – text */}
        <motion.div {...fadeUp(0)}>
          <span className="inline-block rounded-full bg-cyan-50 dark:bg-cyan-900/30 px-4 py-2 text-sm font-bold text-cyan-700 dark:text-cyan-400 mb-6">
            {t('about.badge')}
          </span>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
            {t('about.title')}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-10 max-w-lg">
            {t('about.description')}
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 dark:bg-cyan-500 px-8 py-4 text-sm font-semibold text-white dark:text-slate-950 transition hover:bg-indigo-500 dark:hover:bg-cyan-400 shadow-lg shadow-indigo-500/20 dark:shadow-cyan-500/20"
            >
              {t('about.cta')}
            </Link>
          </motion.div>
        </motion.div>

        {/* Right – circular image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center lg:justify-end"
        >
          <div className="relative w-72 h-72 sm:w-96 sm:h-96">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-indigo-500/20 to-transparent blur-2xl scale-110" />
            {/* Ring border */}
            <div className="absolute inset-0 rounded-full ring-4 ring-cyan-400/40 dark:ring-cyan-500/50 shadow-2xl shadow-cyan-500/20" />
            <img
              src={heroImg}
              alt="3D Studio"
              className="w-full h-full rounded-full object-cover relative z-10"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── 2. ASYMMETRIC FEATURE SECTION ───────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Dark card – right-aligned */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="ml-auto mr-0 w-full lg:w-[65%] bg-slate-900 dark:bg-slate-950 rounded-l-[48px] px-10 sm:px-16 py-16 relative z-10"
        >
          {/* Content inside dark card */}
          <div className="max-w-xl ml-auto">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400 mb-4 block">
              {t('about.mBadge')}
            </span>
            <h2 className="text-4xl font-black text-white mb-6">
              Biz Kimiz?
            </h2>
            <p className="text-slate-300 leading-relaxed mb-10">
              {t('about.mission')}
            </p>

            {/* Icon grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span className="text-sm text-slate-300">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Two images overflowing left of the card */}
        <div className="absolute left-0 top-0 h-full w-[42%] hidden lg:flex items-center gap-4 pl-6 z-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-44 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 flex-shrink-0 mt-12"
          >
            <img src={panel1Img} alt="Studio" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="w-44 h-64 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 flex-shrink-0 -mt-12"
          >
            <img src={panel2Img} alt="Products" className="w-full h-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* ─── 3. STATS COUNTER GRID ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
            >
              <span className="text-5xl font-black text-indigo-600 dark:text-cyan-400 mb-3">
                {s.number}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center">
                {s.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── 4. CTA BANNER ───────────────────────────────────── */}
      <section className="relative w-full overflow-hidden min-h-[340px] flex items-center justify-center">
        {/* Background image with overlay */}
        <img
          src={ctaImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/75 dark:bg-slate-950/85 mix-blend-normal" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-center px-6 py-20"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            3D Dünyaya Katıl
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
            Binlerce üründen oluşan koleksiyonumuzu keşfet, gerçek zamanlı 3D görünümüyle seçimini yap.
          </p>
          <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.03 }} className="inline-block">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-10 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition shadow-2xl shadow-cyan-500/30"
            >
              Alışverişe Başla →
            </Link>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
