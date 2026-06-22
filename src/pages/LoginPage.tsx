import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const company = store.getCompany();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: `linear-gradient(135deg, ${company.primary_color}15 0%, ${company.secondary_color}15 100%)` }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.company_name} className="h-16" />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: company.primary_color }}>
                  IT
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
            <p className="text-gray-500 mt-2">IT Destek Sistemine Hoş Geldiniz</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none"
                style={{ focusRing: company.primary_color }}
                placeholder="ornek@sirket.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
              </label>
              <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: company.primary_color }}>
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              style={{ backgroundColor: company.primary_color }}
            >
              {loading ? (
                <span>Giriş yapılıyor...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          IT Destek Sistemi v1.0.0
        </p>
      </div>
    </div>
  );
}
