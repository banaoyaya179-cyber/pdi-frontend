import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getBesoinsByPdi, declarerBesoin, cloturerBesoin, enregistrerAide } from '../api/besoinApi';
import { rechercherPdi } from '../api/pdiApi';
import { useAuth } from '../context/AuthContext';

const prioriteColors = {
  FAIBLE: '#6c757d', MOYEN: '#0d6efd',
  URGENT: '#fd7e14', CRITIQUE: '#dc3545',
};
const statutColors = {
  DECLARE: '#fd7e14', EN_COURS: '#0d6efd', SATISFAIT: '#28a745',
};
const categorieIcons = {
  VIVRES: '🌾', ABRIS: '🏠', SANTE: '🏥',
  EAU_HYGIENE: '💧', EDUCATION: '📚', PROTECTION: '🛡️',
};

const BesoinsPage = () => {
  const { user } = useAuth();
  const isAgent = user?.role === 'ROLE_AGENT';
  const peutModifier = user?.role === 'ROLE_AGENT' || user?.role === 'ROLE_ADMIN';

  const [pdis, setPdis] = useState([]);
  const [pdiSelectionnee, setPdiSelectionnee] = useState(null);
  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFormBesoin, setShowFormBesoin] = useState(false);
  const [showFormAide, setShowFormAide] = useState(false);
  const [besoinSelectionne, setBesoinSelectionne] = useState(null);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    rechercherPdi({ taille: 2000, ...(isAgent && user?.idSiteAffecte ? { idSite: user.idSiteAffecte } : {}) })
      .then(r => setPdis(r.data.contenu))
      .catch(console.error);
  }, []);

  const chargerBesoins = useCallback(async (idPdi) => {
    setLoading(true);
    try {
      const res = await getBesoinsByPdi(idPdi);
      setBesoins(res.data);
    } catch { setBesoins([]); }
    finally { setLoading(false); }
  }, []);

  const handleSelectPdi = (pdi) => {
    setPdiSelectionnee(pdi);
    chargerBesoins(pdi.id);
    setShowFormBesoin(false);
  };

  const pdisFiltrees = pdis.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <MainLayout>
      <h5 className="fw-bold mb-4" style={{ color: '#1a3a5c' }}>
        Gestion des Besoins & Aides humanitaires
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
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {pdisFiltrees.map(p => (
                  <div key={p.id}
                    className={`p-2 mb-1 rounded small ${pdiSelectionnee?.id === p.id ? 'text-white' : ''}`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: pdiSelectionnee?.id === p.id ? '#1a3a5c' : '#f8f9fa'
                    }}
                    onClick={() => handleSelectPdi(p)}>
                    <div className="fw-semibold">{p.nom} {p.prenom}</div>
                    <div className="opacity-75">#{p.id} — {p.nomSiteCourant}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {!pdiSelectionnee ? (
            <div className="card shadow-sm text-center py-5" style={{ borderRadius: '12px' }}>
              <p className="text-muted">Sélectionnez une PDI pour voir ses besoins</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  {pdiSelectionnee.nom} {pdiSelectionnee.prenom}
                  <span className="text-muted fw-normal ms-2 small">
                    — {besoins.length} besoin(s)
                  </span>
                </h6>
                {peutModifier && (
                  <button className="btn btn-sm text-white fw-semibold"
                    style={{ backgroundColor: '#1a3a5c', borderRadius: '8px' }}
                    onClick={() => setShowFormBesoin(true)}>
                    + Déclarer un besoin
                  </button>
                )}
              </div>

              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
              ) : besoins.length === 0 ? (
                <div className="card shadow-sm text-center py-4" style={{ borderRadius: '12px' }}>
                  <p className="text-muted mb-0">Aucun besoin déclaré</p>
                </div>
              ) : (
                besoins.map(b => (
                  <div key={b.id} className="card shadow-sm mb-3"
                    style={{ borderRadius: '12px', borderLeft: `4px solid ${prioriteColors[b.priorite]}` }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <span style={{ fontSize: '1.4rem' }}>{categorieIcons[b.categorie]}</span>
                          <span className="fw-semibold ms-2">{b.categorie.replace('_', ' ')}</span>
                          <span className="badge ms-2 text-white"
                            style={{ backgroundColor: prioriteColors[b.priorite] }}>
                            {b.priorite}
                          </span>
                          <span className="badge ms-1 text-white"
                            style={{ backgroundColor: statutColors[b.statut] }}>
                            {b.statut.replace('_', ' ')}
                          </span>
                        </div>
                        {peutModifier && b.statut !== 'SATISFAIT' && (
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-success"
                              onClick={() => { setBesoinSelectionne(b); setShowFormAide(true); }}>
                              + Aide
                            </button>
                            <button className="btn btn-sm btn-outline-secondary"
                              onClick={async () => {
                                await cloturerBesoin(b.id);
                                chargerBesoins(pdiSelectionnee.id);
                              }}>
                              Clôturer
                            </button>
                          </div>
                        )}
                      </div>
                      <small className="text-muted">Déclaré le {b.dateDeclaration}</small>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {showFormBesoin && peutModifier && (
        <FormBesoin
          idPdi={pdiSelectionnee.id}
          onSuccess={() => { setShowFormBesoin(false); chargerBesoins(pdiSelectionnee.id); }}
          onCancel={() => setShowFormBesoin(false)}
        />
      )}

      {showFormAide && besoinSelectionne && peutModifier && (
        <FormAide
          besoin={besoinSelectionne}
          onSuccess={() => { setShowFormAide(false); chargerBesoins(pdiSelectionnee.id); }}
          onCancel={() => setShowFormAide(false)}
        />
      )}
    </MainLayout>
  );
};

const FormBesoin = ({ idPdi, onSuccess, onCancel }) => {
  const [form, setForm] = useState({ categorie: '', priorite: '', idPdi });
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await declarerBesoin(form);
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '16px' }}>
          <div className="modal-header"
            style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '16px 16px 0 0' }}>
            <h6 className="modal-title">Déclarer un besoin</h6>
            <button className="btn-close btn-close-white" onClick={onCancel} />
          </div>
          <div className="modal-body p-4">
            {erreur && <div className="alert alert-danger small">{erreur}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Catégorie *</label>
                <select className="form-select" required
                  value={form.categorie}
                  onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {['VIVRES','ABRIS','SANTE','EAU_HYGIENE','EDUCATION','PROTECTION'].map(c => (
                    <option key={c} value={c}>{categorieIcons[c]} {c.replace('_',' ')}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Priorité *</label>
                <select className="form-select" required
                  value={form.priorite}
                  onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {['FAIBLE','MOYEN','URGENT','CRITIQUE'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary"
                  onClick={onCancel}>Annuler</button>
                <button type="submit" className="btn text-white fw-semibold"
                  style={{ backgroundColor: '#1a3a5c' }} disabled={loading}>
                  {loading ? '...' : 'Déclarer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormAide = ({ besoin, onSuccess, onCancel }) => {
  const [form, setForm] = useState({ idBesoin: besoin.id, typeAide: '', quantite: '', donateur: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await enregistrerAide({ ...form, quantite: parseFloat(form.quantite) });
      onSuccess();
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '16px' }}>
          <div className="modal-header"
            style={{ backgroundColor: '#28a745', color: 'white', borderRadius: '16px 16px 0 0' }}>
            <h6 className="modal-title">Enregistrer une aide — {besoin.categorie}</h6>
            <button className="btn-close btn-close-white" onClick={onCancel} />
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Type d'aide *</label>
                <input className="form-control" required placeholder="Ex: Kit alimentaire"
                  value={form.typeAide}
                  onChange={e => setForm(f => ({ ...f, typeAide: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Quantité *</label>
                <input type="number" className="form-control" required min="0.01" step="0.01"
                  value={form.quantite}
                  onChange={e => setForm(f => ({ ...f, quantite: e.target.value }))} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Donateur</label>
                <input className="form-control" placeholder="Ex: Croix-Rouge Burkina"
                  value={form.donateur}
                  onChange={e => setForm(f => ({ ...f, donateur: e.target.value }))} />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary"
                  onClick={onCancel}>Annuler</button>
                <button type="submit" className="btn btn-success fw-semibold" disabled={loading}>
                  {loading ? '...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BesoinsPage;
