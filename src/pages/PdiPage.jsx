import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites, getSiteById } from '../api/siteApi';
import EnrolementForm from '../components/pdi/EnrolementForm';

const SITES_CACHE_KEY = 'pdi_burkina_sites_cache';

const statutColors = {
  DEPLACE_INITIAL: '#0d6efd',
  DEPLACE_MULTIPLE: '#fd7e14',
  RETOURNE: '#28a745',
  REINSTALLE: '#6f42c1',
};

const statutLabels = {
  DEPLACE_INITIAL: 'Déplacé initial',
  DEPLACE_MULTIPLE: 'Déplacé multiple',
  RETOURNE: 'Retourné',
  REINSTALLE: 'Réinstallé',
};

const PdiPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAgent = user?.role === 'ROLE_AGENT';
  const peutEnroler = user?.role === 'ROLE_AGENT' || user?.role === 'ROLE_ADMIN';
  const [pdis, setPdis] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filtres, setFiltres] = useState({ nom: '', prenom: '', statut: '' });
  const [sites, setSites] = useState([]);

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, taille: 10 };
      if (isAgent && user?.idSiteAffecte) params.idSite = user.idSiteAffecte;
      if (filtres.nom) params.nom = filtres.nom;
      if (filtres.prenom) params.prenom = filtres.prenom;
      if (filtres.statut) params.statut = filtres.statut;

      const res = await rechercherPdi(params);
      setPdis(res.data.contenu);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filtres]);

  useEffect(() => { charger(); }, [charger]);

  // CORRECTION : charger les sites avec cache localStorage
  useEffect(() => {
    const chargerSites = async () => {
      if (navigator.onLine) {
        try {
          const res = isAgent && user?.idSiteAffecte
            ? await getSiteById(user.idSiteAffecte)
            : await getAllSites();
          const sitesData = isAgent && user?.idSiteAffecte ? [res.data] : res.data;
          setSites(sitesData);
          localStorage.setItem(SITES_CACHE_KEY, JSON.stringify(sitesData));
        } catch (err) {
          console.error('Erreur chargement sites:', err);
          // Fallback sur le cache si l'API échoue
          const cache = localStorage.getItem(SITES_CACHE_KEY);
          if (cache) setSites(JSON.parse(cache));
        }
      } else {
        // Mode offline : lire depuis le cache
        const cache = localStorage.getItem(SITES_CACHE_KEY);
        if (cache) {
          setSites(JSON.parse(cache));
        }
      }
    };

    chargerSites();

    // Recharger les sites quand le réseau est rétabli
    const handleOnline = () => chargerSites();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const handleFiltreChange = (e) => {
    setFiltres(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(0);
  };

  const handleEnrolementSuccess = (mode) => {
    setShowForm(false);
    if (mode === 'online') charger();
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Gestion des PDI
          <span className="badge ms-2 text-white" style={{ backgroundColor: '#1a3a5c', fontSize: '0.8rem' }}>
            {totalElements} enregistrées
          </span>
        </h5>
        <button className="btn text-white fw-semibold"
          style={{ backgroundColor: '#1a3a5c', borderRadius: '8px', display: peutEnroler ? 'inline-block' : 'none' }}
          onClick={() => setShowForm(true)}>
          + Enrôler une PDI
        </button>
      </div>

      {/* Filtres */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Rechercher par nom..."
                name="nom" value={filtres.nom} onChange={handleFiltreChange} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Rechercher par prénom..."
                name="prenom" value={filtres.prenom} onChange={handleFiltreChange} />
            </div>
            <div className="col-md-4">
              <select className="form-select" name="statut" value={filtres.statut}
                onChange={handleFiltreChange}>
                <option value="">Tous les statuts</option>
                {Object.entries(statutLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>ID</th>
                  <th>Nom & Prénom</th>
                  <th>Sexe</th>
                  <th>Âge</th>
                  <th>Statut</th>
                  <th>Site actuel</th>
                  <th>Région</th>
                  <th>Enrôlement</th>
                </tr>
              </thead>
              <tbody>
                {pdis.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-4">
                      Aucune PDI trouvée
                    </td>
                  </tr>
                ) : pdis.map(p => (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { console.log("Click PDI id:", p.id); navigate(`/pdi/${p.id}`); }}>
                    <td><span className="text-muted small">#{p.id}</span></td>
                    <td className="fw-semibold">{p.nom} {p.prenom}</td>
                    <td>{p.sexe === 'F' ? '♀ F' : '♂ M'}</td>
                    <td>{p.age} ans</td>
                    <td>
                      <span className="badge text-white"
                        style={{ backgroundColor: statutColors[p.statutCourant] }}>
                        {statutLabels[p.statutCourant]}
                      </span>
                    </td>
                    <td>{p.nomSiteCourant}</td>
                    <td>{p.region}</td>
                    <td><small className="text-muted">{p.dateEnrolement}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
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

      {/* Modal formulaire enrôlement */}
      {showForm && (
        <EnrolementForm
          sites={sites}
          onSuccess={handleEnrolementSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </MainLayout>
  );
};

export default PdiPage;
