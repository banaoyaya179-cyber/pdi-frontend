import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      await login(email, motDePasse);
      navigate('/dashboard');
    } catch (err) {
      setErreur('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #0d6efd 100%)' }}>
      <div className="card shadow-lg" style={{ width: '420px', borderRadius: '16px' }}>
        <div className="card-body p-5">

          {/* En-tête */}
          <div className="text-center mb-4">
            <div style={{ fontSize: '3rem' }}>🇧🇫</div>
            <h4 className="fw-bold mt-2" style={{ color: '#1a3a5c' }}>PDI-Burkina</h4>
            <p className="text-muted small">
              Système de gestion des personnes déplacées internes
            </p>
          </div>

          {/* Alerte erreur */}
          {erreur && (
            <div className="alert alert-danger py-2 small" role="alert">
              {erreur}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Adresse email</label>
              <input
                type="email"
                className="form-control"
                placeholder="votre@email.bf"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100 fw-bold text-white"
              style={{ backgroundColor: '#1a3a5c', borderRadius: '8px', padding: '10px' }}
              disabled={loading}>
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-muted mt-4 small">
            SP/CONASUR — Ministère de l'Action Humanitaire
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
