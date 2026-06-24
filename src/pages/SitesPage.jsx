import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllSites } from '../api/siteApi';

const couleurStatut = { NORMAL: '#28a745', CRITIQUE: '#fd7e14', SATURE: '#dc3545' };

const SitesPage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSites()
      .then(r => setSites(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <h5 className="fw-bold mb-4" style={{ color: '#1a3a5c' }}>
        Sites d'accueil
        <span className="badge ms-2 text-white"
          style={{ backgroundColor: '#1a3a5c', fontSize: '0.8rem' }}>
          {sites.length} sites
        </span>
      </h5>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="row g-3">
          {sites.map(s => (
            <div key={s.id} className="col-md-6 col-lg-4">
              <div className="card shadow-sm h-100"
                style={{ borderRadius: '12px', borderTop: `4px solid ${couleurStatut[s.statut]}` }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{s.nomSite}</h6>
                    <span className="badge text-white"
                      style={{ backgroundColor: couleurStatut[s.statut] }}>
                      {s.statut}
                    </span>
                  </div>
                  <p className="text-muted small mb-3">
                    📍 {s.commune}, {s.province}<br />
                    🌍 {s.region}
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
                  {s.latitude && (
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
    </MainLayout>
  );
};

export default SitesPage;
