import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getPdiById, mettreAJourPdi, supprimerPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';
import { declarerBesoin } from '../api/besoinApi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const statutLabels = {
  DEPLACE_INITIAL: 'Déplacé initial',
  DEPLACE_MULTIPLE: 'Déplacé multiple',
  RETOURNE: 'Retourné',
  REINSTALLE: 'Réinstallé',
};
const statutColors = {
  DEPLACE_INITIAL: '#0d6efd',
  DEPLACE_MULTIPLE: '#fd7e14',
  RETOURNE: '#28a745',
  REINSTALLE: '#6f42c1',
};
const categorieIcons = {
  VIVRES: '🌾', ABRIS: '🏠', SANTE: '🏥',
  EAU_HYGIENE: '💧', EDUCATION: '📚', PROTECTION: '🛡️',
};

const PdiDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const peutModifier = user?.role === 'ROLE_AGENT' || user?.role === 'ROLE_ADMIN';

  const [pdi, setPdi] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  // Modals
  const [showModifier, setShowModifier] = useState(false);
  const [showDeplacement, setShowDeplacement] = useState(false);
  const [showBesoin, setShowBesoin] = useState(false);
  const [showSupprimer, setShowSupprimer] = useState(false);

  // Formulaires
  const [formModifier, setFormModifier] = useState({ statutCourant: '', idSiteCourant: '' });
  const [formDeplacement, setFormDeplacement] = useState({ idSiteDestination: '', motif: '', toutLeMenage: false });
  const [formBesoin, setFormBesoin] = useState({ categorie: '', priorite: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getPdiById(parseInt(id)),
      getAllSites(),
    ]).then(([pdiRes, sitesRes]) => {
      setPdi(pdiRes.data);
      setSites(sitesRes.data);
      setFormModifier({
        statutCourant: pdiRes.data.statutCourant,
        idSiteCourant: pdiRes.data.idSiteCourant,
      });
    }).catch(() => setErreur('PDI introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleModifier = async (e) => {
    e.preventDefault();
    setSaving(true); setErreur(''); setSucces('');
    try {
      const res = await mettreAJourPdi(parseInt(id), {
        statutCourant: formModifier.statutCourant,
        idSiteCourant: parseInt(formModifier.idSiteCourant),
      });
      setPdi(res.data);
      setShowModifier(false);
      setSucces('PDI mise à jour avec succès.');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la modification.');
    } finally { setSaving(false); }
  };

  const handleDeplacement = async (e) => {
    e.preventDefault();
    setSaving(true); setErreur(''); setSucces('');
    try {
      await api.post('/agent/deplacements', {
        idPdi: parseInt(id),
        idSiteDestination: parseInt(formDeplacement.idSiteDestination),
        motif: formDeplacement.motif,
        toutLeMenage: formDeplacement.toutLeMenage,
      });
      setShowDeplacement(false);
      setSucces('Déplacement enregistré avec succès.');
      // Recharger la PDI pour mettre à jour le site
      const res = await getPdiById(parseInt(id));
      setPdi(res.data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du déplacement.');
    } finally { setSaving(false); }
  };

  const handleBesoin = async (e) => {
    e.preventDefault();
    setSaving(true); setErreur(''); setSucces('');
    try {
      await declarerBesoin({ ...formBesoin, idPdi: parseInt(id) });
      setShowBesoin(false);
      setSucces('Besoin déclaré avec succès.');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la déclaration.');
    } finally { setSaving(false); }
  };

  const handleSupprimer = async () => {
    setSaving(true);
    try {
      await supprimerPdi(parseInt(id));
      navigate('/pdi');
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la suppression.');
      setShowSupprimer(false);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <MainLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </MainLayout>
  );

  if (!pdi) return (
    <MainLayout>
      <div className="alert alert-danger">PDI introuvable.</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/pdi')}>
            ← Retour
          </button>
          <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
            Fiche PDI #{pdi.id}
          </h5>
        </div>
        {/* Boutons d'action */}
        {peutModifier && (
          <div className="d-flex gap-2">
            <button className="btn btn-sm text-white fw-semibold"
              style={{ backgroundColor: '#1a3a5c' }}
              onClick={() => { setShowModifier(true); setErreur(''); setSucces(''); }}>
              ✏️ Modifier
            </button>
            <button className="btn btn-sm text-white fw-semibold"
              style={{ backgroundColor: '#6f42c1' }}
              onClick={() => { setShowDeplacement(true); setErreur(''); setSucces(''); }}>
              🔄 Déplacer
            </button>
            <button className="btn btn-sm text-white fw-semibold"
              style={{ backgroundColor: '#fd7e14' }}
              onClick={() => { setShowBesoin(true); setErreur(''); setSucces(''); }}>
              📋 Déclarer besoin
            </button>
            {isAdmin && (
              <button className="btn btn-sm btn-danger fw-semibold"
                onClick={() => setShowSupprimer(true)}>
                🗑️ Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {succes && <div className="alert alert-success">{succes}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {/* Carte identité */}
      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-body text-center p-4">
              <div className="rounded-circle d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                style={{ width: '80px', height: '80px',
                  backgroundColor: pdi.sexe === 'F' ? '#e83e8c' : '#0d6efd',
                  fontSize: '2rem' }}>
                {pdi.sexe === 'F' ? '♀' : '♂'}
              </div>
              <h4 className="fw-bold mb-1">{pdi.nom} {pdi.prenom}</h4>
              <span className="badge text-white mb-3"
                style={{ backgroundColor: statutColors[pdi.statutCourant] }}>
                {statutLabels[pdi.statutCourant]}
              </span>
              <div className="text-muted small">
                <div>🎂 {pdi.age} ans — né(e) le {pdi.dateNaissance}</div>
                <div>📅 Enrôlé(e) le {pdi.dateEnrolement}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
            <div className="card-header fw-semibold"
              style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
              Informations détaillées
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-muted small">Identifiant</label>
                  <div className="fw-semibold">#{pdi.id}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Sexe</label>
                  <div className="fw-semibold">{pdi.sexe === 'F' ? '♀ Féminin' : '♂ Masculin'}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Ménage</label>
                  <div className="fw-semibold">#{pdi.idMenage} — {pdi.codeUniqueMenage}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small">Statut</label>
                  <div>
                    <span className="badge text-white"
                      style={{ backgroundColor: statutColors[pdi.statutCourant] }}>
                      {statutLabels[pdi.statutCourant]}
                    </span>
                  </div>
                </div>
                <div className="col-12">
                  <hr className="my-2" />
                  <label className="text-muted small">📍 Localisation actuelle</label>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small">Site d'accueil</label>
                  <div className="fw-semibold">{pdi.nomSiteCourant}</div>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small">Province</label>
                  <div className="fw-semibold">{pdi.province}</div>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small">Région</label>
                  <div className="fw-semibold">{pdi.region}</div>
                </div>
                <div className="col-md-4">
                  <label className="text-muted small">Commune</label>
                  <div className="fw-semibold">{pdi.commune}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Modifier */}
      {showModifier && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header text-white"
                style={{ backgroundColor: '#1a3a5c', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">✏️ Modifier la PDI</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowModifier(false)} />
              </div>
              <div className="modal-body p-4">
                {erreur && <div className="alert alert-danger small">{erreur}</div>}
                <form onSubmit={handleModifier}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Statut *</label>
                    <select className="form-select" required
                      value={formModifier.statutCourant}
                      onChange={e => setFormModifier(f => ({ ...f, statutCourant: e.target.value }))}>
                      {Object.entries(statutLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Site d'accueil *</label>
                    <select className="form-select" required
                      value={formModifier.idSiteCourant}
                      onChange={e => setFormModifier(f => ({ ...f, idSiteCourant: e.target.value }))}>
                      {sites.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nomSite} — {s.region}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary"
                      onClick={() => setShowModifier(false)}>Annuler</button>
                    <button type="submit" className="btn text-white fw-semibold"
                      style={{ backgroundColor: '#1a3a5c' }} disabled={saving}>
                      {saving ? '...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Déplacement */}
      {showDeplacement && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header text-white"
                style={{ backgroundColor: '#6f42c1', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">🔄 Enregistrer un déplacement</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowDeplacement(false)} />
              </div>
              <div className="modal-body p-4">
                {erreur && <div className="alert alert-danger small">{erreur}</div>}
                <form onSubmit={handleDeplacement}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Site de destination *</label>
                    <select className="form-select" required
                      value={formDeplacement.idSiteDestination}
                      onChange={e => setFormDeplacement(f => ({ ...f, idSiteDestination: e.target.value }))}>
                      <option value="">Sélectionner un site...</option>
                      {sites.filter(s => s.id !== pdi.idSiteCourant).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nomSite} — {s.region} ({s.occupationActuelle}/{s.capaciteMaximale})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Motif</label>
                    <textarea className="form-control" rows="2"
                      placeholder="Raison du déplacement..."
                      value={formDeplacement.motif}
                      onChange={e => setFormDeplacement(f => ({ ...f, motif: e.target.value }))} />
                  </div>
                  <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="toutMenage"
                      checked={formDeplacement.toutLeMenage}
                      onChange={e => setFormDeplacement(f => ({ ...f, toutLeMenage: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="toutMenage">
                      Déplacer tout le ménage
                    </label>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary"
                      onClick={() => setShowDeplacement(false)}>Annuler</button>
                    <button type="submit" className="btn text-white fw-semibold"
                      style={{ backgroundColor: '#6f42c1' }} disabled={saving}>
                      {saving ? '...' : 'Confirmer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Besoin */}
      {showBesoin && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header text-white"
                style={{ backgroundColor: '#fd7e14', borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">📋 Déclarer un besoin</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowBesoin(false)} />
              </div>
              <div className="modal-body p-4">
                {erreur && <div className="alert alert-danger small">{erreur}</div>}
                <form onSubmit={handleBesoin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Catégorie *</label>
                    <select className="form-select" required
                      value={formBesoin.categorie}
                      onChange={e => setFormBesoin(f => ({ ...f, categorie: e.target.value }))}>
                      <option value="">Sélectionner...</option>
                      {Object.entries(categorieIcons).map(([k, v]) => (
                        <option key={k} value={k}>{v} {k.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Priorité *</label>
                    <select className="form-select" required
                      value={formBesoin.priorite}
                      onChange={e => setFormBesoin(f => ({ ...f, priorite: e.target.value }))}>
                      <option value="">Sélectionner...</option>
                      {['FAIBLE', 'MOYEN', 'URGENT', 'CRITIQUE'].map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary"
                      onClick={() => setShowBesoin(false)}>Annuler</button>
                    <button type="submit" className="btn text-white fw-semibold"
                      style={{ backgroundColor: '#fd7e14' }} disabled={saving}>
                      {saving ? '...' : 'Déclarer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showSupprimer && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header bg-danger text-white"
                style={{ borderRadius: '16px 16px 0 0' }}>
                <h6 className="modal-title">🗑️ Confirmer la suppression</h6>
                <button className="btn-close btn-close-white" onClick={() => setShowSupprimer(false)} />
              </div>
              <div className="modal-body p-4 text-center">
                <p className="mb-1">Vous allez supprimer définitivement :</p>
                <h5 className="fw-bold text-danger">{pdi.nom} {pdi.prenom}</h5>
                <p className="text-muted small">Cette action est irréversible.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline-secondary"
                  onClick={() => setShowSupprimer(false)}>Annuler</button>
                <button className="btn btn-danger fw-semibold"
                  onClick={handleSupprimer} disabled={saving}>
                  {saving ? '...' : 'Supprimer définitivement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default PdiDetailPage;
