import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Por favor completá todos los campos.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string }; status?: number } };
      if (axiosError?.response?.status === 401) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Por favor, intentá de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-gradient flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3" role="img" aria-hidden="true">
            🫚
          </span>
          <h1 className="font-serif text-3xl font-semibold text-bark-800 mb-1">
            Jengibre
          </h1>
          <p className="font-sans text-sm text-stone-500">
            Acceso administrador
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8">
          <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jengibre.com"
                  required
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-clay-300 focus:border-clay-300 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block font-sans text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-stone-200 rounded-xl font-sans text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-clay-300 focus:border-clay-300 transition-colors"
                />
              </div>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="font-sans text-sm">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-clay-500 hover:bg-clay-600 disabled:bg-stone-300 text-white font-sans font-semibold text-sm py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Ingresando...
                  </span>
                ) : (
                  'Ingresar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
