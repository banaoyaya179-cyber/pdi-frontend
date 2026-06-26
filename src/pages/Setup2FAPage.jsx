import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import MainLayout from '../components/layout/MainLayout';
import { setup2FA, activate2FA, disable2FA } from '../api/authApi';
import { getMe } from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const Setup2FAPage = () => {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');
  const [etape, setEtape] = useState(1); // 1=intro, 2=scan QR, 3=confirmer, 4=activé
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [is2FAActive, setIs2FAActive] = useState(false);

  useEffect(() => {
    getMe().then(res => {
      setIs2FAActive(res.data.doubleAuthActive);
      if (res.data.doubleAuthActive) setEtape(4);
    }).catch(console.error);
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    setErreur('');
    try {
      const res = await setup2FA();
      setQrData(res.data);
      setEtape(2);
    } catch {
      setErreur('Erreur lors de la génération du QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      await activate2FA(parseInt(code));
      setSucces('2FA activé avec succès ! Votre compte est maintenant sécurisé.');
      setIs2FAActive(true);
      setEtape(4);
    } catch {
      setErreur('Code invalide. Vérifiez votre application et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!window.confirm('Désactiver le 2FA réduit la sécurité de votre compte. Confirmer ?')) return;
    setLoading(true);
    try {
      await disable2FA();
      setIs2FAActive(false);
      setEtape(1);
      setSucces('2FA désactivé.');
      setQrData(null);
      setCode('');
    } catch {
      setErreur('Erreur lors de la désactivation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="row justify-content-center">
        <div className="col-md-7">
          <h5 className="fw-bold mb-4" style={{ color: '#1a3a5c' }}>
            🔐 Authentification à deux facteurs (2FA)
          </h5>

          {erreur && <div className="alert alert-danger">{erreur}</div>}
          {succes && <div className="alert alert-success">{succes}</div>}

          {/* Étape 1 — Introduction */}
          {etape === 1 && (
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <div style={{ fontSize: '4rem' }}>🛡️</div>
                  <h5 className="fw-bold">Sécurisez votre compte</h5>
                  <p className="text-muted">
                    L'authentification à deux facteurs ajoute une couche de sécurité
                    supplémentaire. En plus de votre mot de passe, un code temporaire
                    sera requis à chaque connexion.
                  </p>
                </div>

                <div className="alert alert-info small mb-4">
                  <strong>Prérequis :</strong> Installez <strong>Google Authenticator</strong> ou
                  <strong> Authy</strong> sur votre smartphone avant de continuer.
                </div>

                <div className="row g-3 mb-4">
                  {[
                    { icone: '📱', titre: 'Installez l\'app', desc: 'Google Authenticator ou Authy' },
                    { icone: '📷', titre: 'Scannez le QR', desc: 'Code généré par PDI-Burkina' },
                    { icone: '🔢', titre: 'Saisissez le code', desc: 'Code à 6 chiffres de l\'app' },
                  ].map(s => (
                    <div key={s.titre} className="col-md-4 text-center">
                      <div style={{ fontSize: '2rem' }}>{s.icone}</div>
                      <div className="fw-semibold small">{s.titre}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>

                <button className="btn w-100 fw-bold text-white"
                  style={{ backgroundColor: '#1a3a5c', borderRadius: '8px' }}
                  onClick={handleSetup} disabled={loading}>
                  {loading ? '...' : 'Configurer le 2FA →'}
                </button>
              </div>
            </div>
          )}

          {/* Étape 2 — Scanner le QR Code */}
          {etape === 2 && qrData && (
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">① Scannez ce QR code</h6>
                <p className="text-muted small mb-3">
                  Ouvrez <strong>Google Authenticator</strong>, appuyez sur + et
                  scannez le code ci-dessous.
                </p>

                <div className="text-center mb-4">
                  <div className="p-3 d-inline-block"
                    style={{ border: '2px solid #1a3a5c', borderRadius: '12px' }}>
                    <QRCodeSVG value={qrData.otpAuthUrl} size={200} />
                  </div>
                </div>

                <div className="alert alert-secondary small mb-4">
                  <strong>Secret manuel :</strong>
                  <code className="ms-2" style={{ letterSpacing: '2px' }}>
                    {qrData.secret}
                  </code>
                  <br />
                  <small className="text-muted">
                    Si vous ne pouvez pas scanner, entrez ce code manuellement dans l'app.
                  </small>
                </div>

                <button className="btn w-100 fw-bold text-white"
                  style={{ backgroundColor: '#28a745', borderRadius: '8px' }}
                  onClick={() => setEtape(3)}>
                  J'ai scanné le QR code →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Confirmer avec le code */}
          {etape === 3 && (
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">② Confirmez avec un code</h6>
                <p className="text-muted small mb-4">
                  Saisissez le code à 6 chiffres affiché dans votre application
                  pour confirmer la configuration.
                </p>

                <form onSubmit={handleActivate}>
                  <div className="mb-4">
                    <input
                      type="text"
                      className="form-control text-center fw-bold"
                      style={{ fontSize: '2rem', letterSpacing: '10px' }}
                      placeholder="000000"
                      maxLength={6}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      required autoFocus />
                  </div>

                  <div className="d-flex gap-2">
                    <button type="button" className="btn btn-outline-secondary flex-fill"
                      onClick={() => setEtape(2)}>
                      ← Retour
                    </button>
                    <button type="submit" className="btn flex-fill fw-bold text-white"
                      style={{ backgroundColor: '#1a3a5c' }}
                      disabled={loading || code.length !== 6}>
                      {loading ? '...' : 'Activer le 2FA ✓'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Étape 4 — 2FA activé */}
          {etape === 4 && (
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4 text-center">
                <div style={{ fontSize: '4rem' }}>✅</div>
                <h5 className="fw-bold mt-3" style={{ color: '#28a745' }}>
                  2FA activé sur votre compte
                </h5>
                <p className="text-muted mb-4">
                  À chaque connexion, un code à 6 chiffres vous sera demandé
                  en plus de votre mot de passe.
                </p>

                <div className="alert alert-warning small text-start">
                  <strong>⚠️ Important :</strong> Conservez votre application
                  d'authentification en lieu sûr. En cas de perte, contactez
                  l'administrateur système.
                </div>

                <button className="btn btn-outline-danger mt-3"
                  onClick={handleDisable} disabled={loading}>
                  Désactiver le 2FA
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Setup2FAPage;
