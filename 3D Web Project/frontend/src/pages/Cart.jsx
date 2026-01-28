import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function Cart() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-black mb-8 text-gray-900">Sepetim</h1>

      {/* Sepet Boşsa Gösterilecek Kart */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
        <p className="text-gray-500 mb-6 font-medium">Sepetin şu an boş knk, bir şeyler ekle de şenlensin!</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
          <ArrowLeft className="w-4 h-4" /> Alışverişe Dön
        </Link>
      </div>
    </div>
  );
}