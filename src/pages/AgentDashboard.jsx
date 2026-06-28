import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';
import { useAuth } from '../context/AuthContext';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalPdi: 0, sitesDisponibles: 0, sitesSatures: 0 });
  const [dernieresPdis, setDernieresPdis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rechercherPdi({ taille: 5, page: 0 }),
      getAllSites(),
    ]).then(([pdiRes, sitesRes]) => {
      const sites = sitesRes.data;
      setStats({
        totalPdi: pdiRes.data.totalElements,
        sitesDisponibles: sites.filter(s => s.statut !== 'SATURE').length,
        sitesSatures: sites.filter(s => s.statut === 'SATURE').length,
      });
      setDernieresPdis(pdiRes.data.contenu);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const actions = [
    { label: 'Enrôler une PDI', path: '/pdi', couleur: '#0d6efd', icone: '➕', desc: 'Enregistrer une nouvelle personne déplacée' },
    { label: 'Déclarer un besoin', path: '/besoins', couleur: '#fd7e14', icone: '📋', desc: 'Saisir un besoin pour une PDI ou un ménage' },
    { label: 'Enregistrer un déplacement', path: '/deplacements', couleur: '#6f42c1', icone: '🔄', desc: 'Tracer le mouvement d\'une PDI' },
    { label: 'Consulter les sites', path: '/sites', couleur: '#28a745', icone: '🏕️', desc: 'Vérifier la capacité des sites d\'accueil' },
  ];

  return (
    <MainLayout>
      {/* Accueil personnalisé */}
      <div className="p-5 mb-4 rounded-3 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #1a3a5c, #0d6efd)' }}>
        <p className="fw-bold fst-italic mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>"Derrière chaque dossier se cache une histoire. Derrière chaque intervention renaît un espoir. Merci de faire de votre engagement une source de dignité et d'avenir pour les personnes déplacées internes."</p>
        <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem', opacity: 0.85 }}>Agent de terrain</p>
      </div>
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          {/* Stats rapides */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card shadow-sm text-center p-3" style={{ borderRadius: '12px', borderTop: '4px solid #0d6efd' }}>
                <h2 className="fw-bold mb-0" style={{ color: '#0d6efd' }}>{stats.totalPdi}</h2>
                <p className="text-muted small mb-0">PDI enregistrées</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm text-center p-3" style={{ borderRadius: '12px', borderTop: '4px solid #28a745' }}>
                <h2 className="fw-bold mb-0" style={{ color: '#28a745' }}>{stats.sitesDisponibles}</h2>
                <p className="text-muted small mb-0">Sites disponibles</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card shadow-sm text-center p-3" style={{ borderRadius: '12px', borderTop: '4px solid #dc3545' }}>
                <h2 className="fw-bold mb-0" style={{ color: '#dc3545' }}>{stats.sitesSatures}</h2>
                <p className="text-muted small mb-0">Sites saturés</p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Actions rapides */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header fw-semibold"
                  style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
                  Actions rapides
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {actions.map(a => (
                      <div key={a.path} className="col-6">
                        <Link to={a.path} className="text-decoration-none">
                          <div className="card h-100 text-center p-3"
                            style={{ borderRadius: '10px', border: `2px solid ${a.couleur}`, cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#f8f9fa' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = a.couleur + '15'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                            <div style={{ fontSize: '2rem' }}>{a.icone}</div>
                            <div className="fw-semibold small mt-1" style={{ color: a.couleur }}>{a.label}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>{a.desc}</div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Dernières PDI enregistrées */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header fw-semibold"
                  style={{ backgroundColor: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
                  Dernières PDI enregistrées
                </div>
                <div className="card-body p-0">
                  {dernieresPdis.map(p => (
                    <div key={p.id} className="d-flex align-items-center p-3"
                      style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <div className="rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                        style={{ width: '38px', height: '38px', minWidth: '38px',
                          backgroundColor: p.sexe === 'F' ? '#e83e8c' : '#0d6efd', fontSize: '0.85rem' }}>
                        {p.sexe === 'F' ? '♀' : '♂'}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold small">{p.nom} {p.prenom}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {p.nomSiteCourant} — {p.dateEnrolement}
                        </div>
                      </div>
                      <span className="badge text-white small"
                        style={{ backgroundColor: '#1a3a5c', fontSize: '0.65rem' }}>
                        {p.age} ans
                      </span>
                    </div>
                  ))}
                </div>
                <div className="card-footer text-center">
                  <Link to="/pdi" className="small text-decoration-none" style={{ color: '#1a3a5c' }}>
                    Voir toutes les PDI →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default AgentDashboard;
