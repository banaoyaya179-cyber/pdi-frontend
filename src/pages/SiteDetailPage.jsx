import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { getSiteById } from '../api/siteApi';
import { rechercherPdi } from '../api/pdiApi';
import { useAuth } from '../context/AuthContext';

const statutColors = { NORMAL: '#28a745', CRITIQUE: '#fd7e14', SATURE: '#dc3545' };
const statutLabels = {
  DEPLACE_INITIAL: 'Déplacé initial',
  DEPLACE_MULTIPLE: 'Déplacé multiple',
  RETOURNE: 'Retourné',
  REINSTALLE: 'Réinstallé',
};
const statutBadgeColors = {
  DEPLACE_INITIAL: '#0d6efd',
  DEPLACE_MULTIPLE: '#fd7e14',
  RETOURNE: '#28a745',
  REINSTALLE: '#6f42c1',
};

const SiteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [site, setSite] = useState(null);
  const [pdis, setPdis] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPdis, setLoadingPdis] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    getSiteById(parseInt(id))
      .then(r => setSite(r.data))
      .catch(() => setErreur('Site introuvable.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingPdis(true);
    const params = { page, taille: 10, idSite: parseInt(id) };
    if (recherche) params.nom = recherche;
    rechercherPdi(params)
      .then(r => {
        setPdis(r.data.contenu);
        setTotalElements(r.data.totalElements);
        setTotalPages(r.data.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingPdis(false));
  }, [id, page, recherche]);

  if (loading) return (
    <MainLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </MainLayout>
  );

  if (erreur) return (
    <MainLayout>
      <div className="alert alert-danger">{erreur}</div>
    </MainLayout>
  );

  return (
    <MainLayout>
      {/* En-tête */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate('/sites')}>
            ← Retour
          </button>
          <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
            {site.nomSite}
          </h5>
          <span className="badge text-white"
            style={{ backgroundColor: statutColors[site.statut] }}>
            {site.statut}
          </span>
        </div>
      </div>

      {/* Carte info site */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100"
            style={{ borderRadius: '12px', borderTop: `4px solid ${statutColors[site.statut]}` }}>
            <div className="card-header fw-semibold"
              style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
              📍 Informations du site
            </div>
            <div className="card-body">
              <table className="table table-sm mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Région</td>
                    <td><strong>{site.region}</strong></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Province</td>
                    <td>{site.province}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Commune</td>
                    <td>{site.commune}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Capacité</td>
                    <td><strong>{site.capaciteMaximale}</strong> places</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Occupation</td>
                    <td><strong>{site.occupationActuelle}</strong> PDI</td>
                  </tr>
                  {user?.role !== 'ROLE_AGENT' && site.latitude && (
                    <tr>
                      <td className="text-muted">GPS</td>
                      <td><small>{site.latitude?.toFixed(4)}, {site.longitude?.toFixed(4)}</small></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm h-100"
            style={{ borderRadius: '12px', borderTop: `4px solid ${statutColors[site.statut]}` }}>
            <div className="card-header fw-semibold"
              style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
              📊 Taux d'occupation
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <div className="text-center mb-3">
                <h1 className="fw-bold" style={{ color: statutColors[site.statut], fontSize: '3rem' }}>
                  {site.tauxOccupation}%
                </h1>
                <p className="text-muted mb-0">{site.occupationActuelle} / {site.capaciteMaximale} personnes</p>
              </div>
              <div className="progress" style={{ height: '20px', borderRadius: '10px' }}>
                <div className="progress-bar"
                  style={{
                    width: `${Math.min(site.tauxOccupation, 100)}%`,
                    backgroundColor: statutColors[site.statut],
                    borderRadius: '10px',
                    fontSize: '0.8rem'
                  }}>
                  {site.tauxOccupation}%
                </div>
              </div>
              <div className="d-flex justify-content-between mt-2 small text-muted">
                <span>0%</span>
                <span style={{ color: '#28a745' }}>70% — Critique</span>
                <span style={{ color: '#dc3545' }}>100% — Saturé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste PDI */}
      <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-header fw-semibold d-flex justify-content-between align-items-center"
          style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
          <span>👥 Liste des PDI ({totalElements} enregistrées)</span>
          <input
            type="text"
            className="form-control form-control-sm w-auto"
            placeholder="Rechercher par nom..."
            value={recherche}
            onChange={e => { setRecherche(e.target.value); setPage(0); }}
            style={{ maxWidth: '200px' }}
          />
        </div>
        <div className="card-body p-0">
          {loadingPdis ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
          ) : pdis.length === 0 ? (
            <div className="text-center text-muted py-4">Aucune PDI trouvée</div>
          ) : (
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>ID</th>
                  <th>Nom & Prénom</th>
                  <th>Sexe</th>
                  <th>Âge</th>
                  <th>Statut</th>
                  <th>Enrôlement</th>
                </tr>
              </thead>
              <tbody>
                {pdis.map(p => (
                  <tr key={p.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/pdi/${p.id}`)}>
                    <td><span className="text-muted small">#{p.id}</span></td>
                    <td className="fw-semibold">{p.nom} {p.prenom}</td>
                    <td>{p.sexe === 'F' ? '♀ F' : '♂ M'}</td>
                    <td>{p.age} ans</td>
                    <td>
                      <span className="badge text-white"
                        style={{ backgroundColor: statutBadgeColors[p.statutCourant] }}>
                        {statutLabels[p.statutCourant]}
                      </span>
                    </td>
                    <td><small className="text-muted">{p.dateEnrolement}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="card-footer d-flex justify-content-between align-items-center">
            <small className="text-muted">Page {page + 1} sur {totalPages}</small>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary"
                disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ← Précédent
              </button>
              <button className="btn btn-outline-secondary"
                disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Suivant →
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SiteDetailPage;
