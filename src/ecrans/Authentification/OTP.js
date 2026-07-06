import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch, ApiError } from '../../api/client';

const OTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, username } = location.state || {};
  const [codeParts, setCodeParts] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email || !username) {
      navigate('/inscription');
    }
  }, [email, username, navigate]);

  const handleChange = (text, index) => {
    const newCodeParts = [...codeParts];
    newCodeParts[index] = text.replace(/[^0-9]/g, '').slice(0, 1);
    setCodeParts(newCodeParts);

    if (text && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !codeParts[index] && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const code = codeParts.join('');
    
    if (code.length < 6) {
      setError('Veuillez entrer le code complet à 6 chiffres');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/utilisateur/verifier-otp', {
        method: 'POST',
        auth: false,
        body: { email, code }
      });

      const { token, userId, role } = response;
      localStorage.setItem('userToken', token);
      localStorage.setItem('userId', userId.toString());
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);

      setSuccess('Vérification réussie ! Redirection...');
      setTimeout(() => {
        navigate('/accueil', { state: { username } });
      }, 2000);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'CODE_INVALIDE') setError('Code invalide');
        else if (err.code === 'CODE_EXPIRE') setError('Le code a expiré. Veuillez renvoyer un nouveau code.');
        else setError('Erreur lors de la vérification');
      } else {
        setError('Erreur de connexion au serveur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    try {
      await apiFetch('/utilisateur/renvoyer-otp', {
        method: 'POST',
        auth: false,
        body: { email }
      });

      setSuccess('Un nouveau code a été envoyé à votre email');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors du renvoi du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérification du code de confirmation</h1>
            <p className="text-white/60">
              Nous avons envoyé un code à <br />
              <span className="text-purple-300 font-medium">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
              {success}
            </div>
          )}

          <div className="mb-8">
            <label className="block text-white/80 text-sm font-medium mb-4 text-center">
              Entrez le code à 6 chiffres
            </label>
            <div className="flex justify-between gap-2">
              {codeParts.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Vérification...
              </div>
            ) : (
              'Vérifier le code'
            )}
          </button>

          <button
            onClick={handleResendCode}
            disabled={loading}
            className="w-full py-2 text-purple-400 hover:text-purple-300 font-medium transition"
          >
            Renvoyer le code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTP;