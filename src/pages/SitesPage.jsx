import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllSites, creerSite } from '../api/siteApi';
import { getAllCommunes } from '../api/communeApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const couleurStatut = { NORMAL: '#28a745', CRITIQUE: '#fd7e14', SATURE: '#dc3545' };
const formVide = { nomSite: '', capaciteMaximale: '', idCommune: '', latitude: '', longitude: '' };

const SitesPage = () => {
  const { user } = useAuth();
  const isAgent = user?.role === 'ROLE_AGENT';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const navigate = useNavigate();
  const peutCliquer = (siteId) => {
    if (user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_RESPONSABLE') return true;
    if (user?.role === 'ROLE_AGENT') return user?.idSiteAffecte === siteId;
    return false;
  };

  const [sites, setSites] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(formVide);
  const [erreur, setErreur] = useState('');
  const [saving, setSaving] = useState(false);
  const [succes, setSucces] = useState('');

  const chargerSites = () => {
    getAllSites()
      .then(r => setSites(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { chargerSites(); }, []);

  useEffect(() => {
    if (isAdmin) {
      getAllCommunes()
        .then(r => setCommunes(r.data))
        .catch(console.error);
    }
  }, [isAdmin]);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErreur(''); setSucces('');
    try {
      await creerSite({
        nomSite:          form.nomSite,
        capaciteMaximale: parseInt(form.capaciteMaximale),
        idCommune:        parseInt(form.idCommune),
        latitude:         parseFloat(form.latitude),
        longitude:        parseFloat(form.longitude),
      });
      setSucces('Site créé avec succès !');
      setForm(formVide);
      setShowForm(false);
      chargerSites();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création du site.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Sites d'accueil
          <span className="badge ms-2 text-white"
            style={{ backgroundColor: '#1a3a5c', fontSize: '0.8rem' }}>
            {sites.length} sites
          </span>
        </h5>
        {isAdmin && (
          <button className="btn text-white fw-semibold"
            style={{ backgroundColor: '#1a3a5c', borderRadius: '8px' }}
            onClick={() => { setShowForm(true); setErreur(''); setSucces(''); }}>
            + Ajouter un site
          </button>
        )}
      </div>

      {succes && (
        <div className="alert alert-success alert-dismissible mb-4">
          ✅ {succes}
          <button type="button" className="btn-close" onClick={() => setSucces('')} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-3">
          {sites.map(s => (
            <div key={s.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100"
                style={{ borderRadius: "12px", borderTop: `4px solid ${couleurStatut[s.statut]}`, cursor: peutCliquer(s.id) ? "pointer" : "default" }}
                onClick={() => peutCliquer(s.id) && navigate(`/sites/${s.id}`)}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{s.nomSite}</h6>
                    <span className="badge text-white"
                      style={{ backgroundColor: couleurStatut[s.statut] }}>
                      {s.statut}
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    📍 {s.commune}, {s.province}<br />🌍 {s.region}
                  </p>
                  <div className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>Occupation</span>
                      <strong>{s.occupationActuelle} / {s.capaciteMaximale}</strong>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div className="progress-bar"
                        style={{
                          width: `${Math.min(s.tauxOccupation, 100)}%`,
                          backgroundColor: couleurStatut[s.statut]
                        }} />
                    </div>
                    <small className="text-muted">{s.tauxOccupation}% de capacité utilisée</small>
                  </div>
                  {!isAgent && s.latitude && (
                    <p className="text-muted small mb-0 mt-2">
                      🗺️ {s.latitude?.toFixed(4)}, {s.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '16px' }}>
              <div className="modal-header text-white"
                style={{ backgroundColor: '#1a3a5c', borderRadius: '16px 16px 0 0' }}>
                <h5 className="modal-title">➕ Nouveau site d'accueil</h5>
                <button type="button" className="btn-close btn-close-white"
                  onClick={() => setShowForm(false)} />
              </div>
              <div className="modal-body p-4">
                {erreur && <div className="alert alert-danger small">{erreur}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Nom du site *</label>
                      <input type="text" className="form-control"
                        name="nomSite" value={form.nomSite}
                        onChange={handleChange} required
                        placeholder="Ex: Site de Kaya Sud" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Commune *</label>
                      <select className="form-select" name="idCommune"
                        value={form.idCommune} onChange={handleChange} required>
                        <option value="">Sélectionner une commune...</option>
                        {communes.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.nomCommune} — {c.province} ({c.region})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Capacité maximale *</label>
                      <input type="number" className="form-control"
                        name="capaciteMaximale" value={form.capaciteMaximale}
                        onChange={handleChange} required min="1"
                        placeholder="Ex: 1500" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Latitude *</label>
                      <input type="number" className="form-control"
                        name="latitude" value={form.latitude}
                        onChange={handleChange} required
                        step="0.0001" min="-90" max="90"
                        placeholder="Ex: 13.0917" />
                      <div className="form-text">Entre -90 et 90</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Longitude *</label>
                      <input type="number" className="form-control"
                        name="longitude" value={form.longitude}
                        onChange={handleChange} required
                        step="0.0001" min="-180" max="180"
                        placeholder="Ex: -1.0800" />
                      <div className="form-text">Entre -180 et 180</div>
                    </div>
                    <div className="col-12"><div className="alert alert-info small mb-0">Pour les coordonnees GPS, rendez-vous sur OpenStreetMap (openstreetmap.org) puis clic droit sur le lieu.</div></div>
                  </div>
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary"
                      onClick={() => setShowForm(false)}>Annuler</button>
                    <button type="submit" className="btn text-white fw-semibold"
                      style={{ backgroundColor: '#1a3a5c' }} disabled={saving}>
                      {saving
                        ? <span><span className="spinner-border spinner-border-sm me-1" />Création...</span>
                        : '✅ Créer le site'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default SitesPage;
