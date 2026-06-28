import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const DeplacementsPage = () => {
  const { user } = useAuth();
  const isAgent = user?.role === 'ROLE_AGENT';
  const peutModifier = user?.role === 'ROLE_AGENT' || user?.role === 'ROLE_ADMIN';

  const [pdis, setPdis] = useState([]);
  const [sites, setSites] = useState([]);
  const [pdiSelectionnee, setPdiSelectionnee] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [form, setForm] = useState({ idSiteDestination: '', motif: '', toutLeMenage: false });
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  useEffect(() => {
    rechercherPdi({ taille: 2000, ...(isAgent && user?.idSiteAffecte ? { idSite: user.idSiteAffecte } : {}) }).then(r => setPdis(r.data.contenu)).catch(console.error);
    getAllSites().then(r => setSites(r.data)).catch(console.error);
  }, []);

  const chargerHistorique = useCallback(async (idPdi) => {
    setLoading(true);
    try {
      const res = await api.get(`/agent/deplacements/pdi/${idPdi}`);
      setHistorique(res.data);
    } catch { setHistorique([]); }
    finally { setLoading(false); }
  }, []);

  const handleSelectPdi = (pdi) => {
    setPdiSelectionnee(pdi);
    chargerHistorique(pdi.id);
    setShowForm(false);
    setSucces('');
    setErreur('');
  };

  const handleDeplacement = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      await api.post('/agent/deplacements', {
        idPdi: pdiSelectionnee.id,
        idSiteDestination: parseInt(form.idSiteDestination),
        motif: form.motif,
        toutLeMenage: form.toutLeMenage,
      });
      setSucces('Déplacement enregistré avec succès.');
      setShowForm(false);
      setForm({ idSiteDestination: '', motif: '', toutLeMenage: false });
      chargerHistorique(pdiSelectionnee.id);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du déplacement.');
    } finally { setLoading(false); }
  };

  const pdisFiltrees = pdis.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <MainLayout>
      <h5 className="fw-bold mb-4" style={{ color: '#1a3a5c' }}>
        Suivi des Déplacements
      </h5>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header fw-semibold"
              style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
              Sélectionner une PDI
            </div>
            <div className="card-body p-2">
              <input className="form-control form-control-sm mb-2"
                placeholder="Rechercher..." value={recherche}
                onChange={e => setRecherche(e.target.value)} />
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {pdisFiltrees.map(p => (
                  <div key={p.id} className="p-2 mb-1 rounded small"
                    style={{
                      cursor: 'pointer',
                      backgroundColor: pdiSelectionnee?.id === p.id ? '#1a3a5c' : '#f8f9fa',
                      color: pdiSelectionnee?.id === p.id ? 'white' : 'inherit'
                    }}
                    onClick={() => handleSelectPdi(p)}>
                    <div className="fw-semibold">{p.nom} {p.prenom}</div>
                    <div className="opacity-75">📍 {p.nomSiteCourant}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {!pdiSelectionnee ? (
            <div className="card shadow-sm text-center py-5" style={{ borderRadius: '12px' }}>
              <p className="text-muted">Sélectionnez une PDI pour voir son historique</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="fw-bold mb-0">{pdiSelectionnee.nom} {pdiSelectionnee.prenom}</h6>
                  <small className="text-muted">
                    Site actuel : <strong>{pdiSelectionnee.nomSiteCourant}</strong>
                  </small>
                </div>
                {peutModifier && (
                  <button className="btn btn-sm text-white fw-semibold"
                    style={{ backgroundColor: '#1a3a5c', borderRadius: '8px' }}
                    onClick={() => { setShowForm(true); setSucces(''); setErreur(''); }}>
                    Enregistrer un déplacement
                  </button>
                )}
              </div>

              {succes && <div className="alert alert-success small">{succes}</div>}
              {erreur && <div className="alert alert-danger small">{erreur}</div>}

              {showForm && peutModifier && (
                <div className="card shadow-sm mb-3" style={{ borderRadius: '12px', border: '2px solid #1a3a5c' }}>
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Nouveau déplacement</h6>
                    <form onSubmit={handleDeplacement}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Site de destination *</label>
                        <select className="form-select" required
                          value={form.idSiteDestination}
                          onChange={e => setForm(f => ({ ...f, idSiteDestination: e.target.value }))}>
                          <option value="">Sélectionner un site...</option>
                          {sites.filter(s => s.id !== pdiSelectionnee.idSiteCourant).map(s => (
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
                          value={form.motif}
                          onChange={e => setForm(f => ({ ...f, motif: e.target.value }))} />
                      </div>
                      <div className="form-check mb-3">
                        <input type="checkbox" className="form-check-input"
                          id="toutMenage" checked={form.toutLeMenage}
                          onChange={e => setForm(f => ({ ...f, toutLeMenage: e.target.checked }))} />
                        <label className="form-check-label" htmlFor="toutMenage">
                          Déplacer tout le ménage
                        </label>
                      </div>
                      <div className="d-flex gap-2">
                        <button type="submit" className="btn text-white fw-semibold"
                          style={{ backgroundColor: '#1a3a5c' }} disabled={loading}>
                          {loading ? '...' : 'Confirmer le déplacement'}
                        </button>
                        <button type="button" className="btn btn-outline-secondary"
                          onClick={() => setShowForm(false)}>Annuler</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
              ) : historique.length === 0 ? (
                <div className="card shadow-sm text-center py-4" style={{ borderRadius: '12px' }}>
                  <p className="text-muted mb-0">Aucun déplacement enregistré</p>
                </div>
              ) : (
                <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
                  <div className="card-header fw-semibold" style={{ backgroundColor: '#f8f9fa' }}>
                    Historique ({historique.length} déplacement(s))
                  </div>
                  <div className="card-body p-0">
                    {historique.map((d, i) => (
                      <div key={d.id} className="d-flex align-items-start p-3"
                        style={{ borderBottom: i < historique.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <div className="me-3 text-center">
                          <div className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '32px', height: '32px', backgroundColor: '#1a3a5c', fontSize: '0.75rem' }}>
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold small">
                            {d.nomSiteOrigine} → {d.nomSiteDestination}
                          </div>
                          {d.motif && <div className="text-muted small">{d.motif}</div>}
                          <small className="text-muted">{d.dateMouvement}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DeplacementsPage;
