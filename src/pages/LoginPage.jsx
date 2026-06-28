import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verify2FA } from '../api/authApi';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [code2FA, setCode2FA] = useState('');
  const [etape, setEtape] = useState(1); // 1=login, 2=code 2FA
  const [emailTemp, setEmailTemp] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const result = await login(email, motDePasse);
      if (result.requires2FA) {
        setEmailTemp(email);
        setEtape(2);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setErreur('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      const res = await verify2FA(emailTemp, parseInt(code2FA));
      const { token, email: userEmail, role, nom, prenom } = res.data;
      localStorage.setItem('pdi_token', token);
      localStorage.setItem('pdi_user', JSON.stringify({ email: userEmail, role, nom, prenom }));
      window.location.href = '/dashboard';
    } catch {
      setErreur('Code 2FA invalide ou expiré. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d6efd 100%)' }}>
      <div className="card shadow-lg" style={{ width: '420px', borderRadius: '16px' }}>
        <div className="card-body p-5">

          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>🇧🇫</div>
            <h4 className="fw-bold mt-2" style={{ color: '#1a3a5c' }}>PDI-Burkina</h4>
            <p className="text-muted small">
              Système de gestion des personnes déplacées internes
            </p>
          </div>

          {erreur && (
            <div className="alert alert-danger py-2 small">{erreur}</div>
          )}

          {/* Étape 1 — Identifiants */}
          {etape === 1 && (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Adresse email</label>
                <input type="email" className="form-control"
                  placeholder="votre@email.bf"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Mot de passe</label>
                <input type="password" className="form-control"
                  placeholder="••••••••"
                  value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
                  required />
              </div>
              <button type="submit" className="btn w-100 fw-bold text-white"
                style={{ backgroundColor: '#1a3a5c', borderRadius: '8px', padding: '10px' }}
                disabled={loading}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" />Connexion...</span>
                ) : 'Se connecter'}
              </button>
            </form>
          )}

          {/* Étape 2 — Code 2FA */}
          {etape === 2 && (
            <form onSubmit={handleVerify2FA}>
              <div className="text-center mb-4">
                <div style={{ fontSize: '2.5rem' }}>🔐</div>
                <h6 className="fw-bold" style={{ color: '#1a3a5c' }}>
                  Vérification en deux étapes
                </h6>
                <p className="text-muted small">
                  Saisissez le code à 6 chiffres de votre application
                  <strong> Google Authenticator</strong>
                </p>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  className="form-control text-center fw-bold"
                  style={{ fontSize: '1.8rem', letterSpacing: '8px' }}
                  placeholder="000000"
                  maxLength={6}
                  value={code2FA}
                  onChange={e => setCode2FA(e.target.value.replace(/\D/g, ''))}
                  required autoFocus />
              </div>

              <button type="submit" className="btn w-100 fw-bold text-white mb-3"
                style={{ backgroundColor: '#1a3a5c', borderRadius: '8px', padding: '10px' }}
                disabled={loading || code2FA.length !== 6}>
                {loading ? (
                  <span><span className="spinner-border spinner-border-sm me-2" />Vérification...</span>
                ) : 'Vérifier le code'}
              </button>

              <button type="button" className="btn btn-outline-secondary w-100 btn-sm"
                onClick={() => { setEtape(1); setCode2FA(''); setErreur(''); }}>
                ← Retour à la connexion
              </button>
            </form>
          )}

          <p className="text-center text-muted mt-4 small">
            UNZ-Koudougou — Projet Académique L3 Informatique
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
