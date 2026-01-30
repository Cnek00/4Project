import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Google Allauth girişinden sonra backend bu sayfaya hash ile yönlendirir:
 * /auth/callback#access=...&refresh=...
 * Token'ları kaydedip ana sayfaya yönlendirir.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();

  useEffect(() => {
    const hash = window.location.hash?.slice(1) || '';
    const params = new URLSearchParams(hash);
    const access = params.get('access');
    const refresh = params.get('refresh');

    if (access) {
      loginWithTokens(access, refresh);
      // Hash'i temizleyerek URL'den token'ları kaldır
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    navigate('/', { replace: true });
  }, [loginWithTokens, navigate]);

  return (
    <div className="max-w-md mx-auto p-8 pt-20 text-center">
      <p className="text-indigo-600 font-bold">Giriş yapılıyor, yönlendiriliyorsunuz...</p>
    </div>
  );
}
