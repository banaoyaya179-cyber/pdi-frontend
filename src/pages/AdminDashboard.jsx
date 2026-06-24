import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllSites } from '../api/siteApi';
import { rechercherPdi } from '../api/pdiApi';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ titre, valeur, couleur, icone }) => (
  <div className="card shadow-sm h-100" style={{ borderLeft: `4px solid ${couleur}`, borderRadius: '12px' }}>
    <div className="card-body d-flex justify-content-between align-items-center">
      <div>
        <p className="text-muted small mb-1">{titre}</p>
        <h3 className="fw-bold mb-0" style={{ color: couleur }}>{valeur}</h3>
      </div>
      <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>{icone}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPdi: 0, totalSites: 0, sitesSatures: 0 });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllSites(), rechercherPdi({ taille: 1 })])
      .then(([sitesRes, pdiRes]) => {
        const listeSites = sitesRes.data;
        setSites(listeSites);
        setStats({
          totalPdi: pdiRes.data.totalElements,
          totalSites: listeSites.length,
          sitesSatures: listeSites.filter(s => s.statut === 'SATURE').length,
        });
      }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const couleurStatut = { NORMAL: '#28a745', CRITIQUE: '#fd7e14', SATURE: '#dc3545' };

  return (
    <MainLayout>
      <div className="p-4 mb-4 rounded-3 text-white"
        style={{ background: 'linear-gradient(135deg, #1a3a5c, #dc3545)' }}>
        <h4 className="fw-bold mb-1">Bonjour, {user?.prenom} 👋</h4>
        <p className="mb-0 opacity-75">Administrateur système — Accès complet</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <StatCard titre="Total PDI enregistrées" valeur={stats.totalPdi}
                couleur="#0d6efd" icone="👥" />
            </div>
            <div className="col-md-4">
              <StatCard titre="Sites d'accueil actifs" valeur={stats.totalSites}
                couleur="#28a745" icone="🏕️" />
            </div>
            <div className="col-md-4">
              <StatCard titre="Sites saturés" valeur={stats.sitesSatures}
                couleur="#dc3545" icone="⚠️" />
            </div>
          </div>

          <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header fw-semibold"
              style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
              État des sites d'accueil
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Site</th><th>Région</th><th>Occupation</th><th>Taux</th><th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map(site => (
                    <tr key={site.id}>
                      <td className="fw-semibold">{site.nomSite}</td>
                      <td>{site.region}</td>
                      <td>{site.occupationActuelle} / {site.capaciteMaximale}</td>
                      <td>
                        <div className="progress" style={{ height: '8px', width: '100px' }}>
                          <div className="progress-bar"
                            style={{ width: `${Math.min(site.tauxOccupation, 100)}%`,
                              backgroundColor: couleurStatut[site.statut] }} />
                        </div>
                        <small>{site.tauxOccupation}%</small>
                      </td>
                      <td>
                        <span className="badge text-white"
                          style={{ backgroundColor: couleurStatut[site.statut] }}>
                          {site.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default AdminDashboard;
