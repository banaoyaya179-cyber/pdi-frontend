import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';
import { useAuth } from '../context/AuthContext';

const couleurStatut = { NORMAL: '#28a745', CRITIQUE: '#fd7e14', SATURE: '#dc3545' };

const ResponsableDashboard = () => {
  const { user } = useAuth();
  const [pdis, setPdis] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      rechercherPdi({ taille: 1000 }),
      getAllSites(),
    ]).then(([pdiRes, sitesRes]) => {
      setPdis(pdiRes.data.contenu);
      setSites(sitesRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = pdis.length;
  const femmes = pdis.filter(p => p.sexe === 'F').length;
  const hommes = pdis.filter(p => p.sexe === 'M').length;
  const mineurs = pdis.filter(p => p.age < 18).length;
  const retournes = pdis.filter(p => p.statutCourant === 'RETOURNE' || p.statutCourant === 'REINSTALLE').length;
  const sitesSatures = sites.filter(s => s.statut === 'SATURE');
  const sitesCritiques = sites.filter(s => s.statut === 'CRITIQUE');

  const indicateurs = [
    { label: 'Total PDI/Retournés', valeur: total, couleur: '#1a3a5c', icone: '👥', sub: 'personnes enregistrées' },
    { label: 'Hommes', valeur: hommes, couleur: '#0d6efd', icone: '♂', sub: `${total > 0 ? Math.round(hommes/total*100) : 0}% du total` },
    { label: 'Femmes', valeur: femmes, couleur: '#e83e8c', icone: '♀', sub: `${total > 0 ? Math.round(femmes/total*100) : 0}% du total` },
    { label: 'Mineurs (-18 ans)', valeur: mineurs, couleur: '#fd7e14', icone: '👶', sub: `${total > 0 ? Math.round(mineurs/total*100) : 0}% du total` },
    { label: 'Retournés/Réinstallés', valeur: retournes, couleur: '#28a745', icone: '🏠', sub: 'processus de retour' },
    { label: 'Sites saturés', valeur: sitesSatures.length, couleur: '#dc3545', icone: '⚠️', sub: 'nécessitent action urgente' },
    { label: 'Sites critiques', valeur: sitesCritiques.length, couleur: '#fd7e14', icone: '🔶', sub: 'surveillance renforcée' },
  ];

  const outils = [
    { label: 'Carte interactive', path: '/carte', icone: '🗺️', couleur: '#0d6efd', desc: 'Visualiser la répartition géographique' },
    { label: 'Statistiques', path: '/statistiques', icone: '📊', couleur: '#6f42c1', desc: 'Tableaux de bord analytiques' },
    { label: 'Liste PDI', path: '/pdi', icone: '👥', couleur: '#1a3a5c', desc: 'Consulter les dossiers individuels' },
    { label: 'Sites d\'accueil', path: '/sites', icone: '🏕️', couleur: '#28a745', desc: 'État des capacités d\'accueil' },
  ];

  return (
    <MainLayout>
      {/* Accueil personnalisé */}
      <div className="p-5 mb-4 rounded-3 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #6f42c1, #0d6efd)' }}>
        <p className="fw-bold fst-italic mb-2" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>"Derrière chaque dossier se cache une histoire. Derrière chaque intervention renaît un espoir. Merci de faire de votre engagement une source de dignité et d'avenir pour les personnes déplacées internes."</p>
        <p className="mb-0 fw-semibold" style={{ fontSize: '0.9rem', opacity: 0.85 }}>Responsable humanitaire</p>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <>
          {/* Alertes urgentes */}
          {(sitesSatures.length > 0 || sitesCritiques.length > 0) && (
            <div className="alert alert-danger d-flex align-items-center mb-4" style={{ borderRadius: '12px' }}>
              <span className="me-2" style={{ fontSize: '1.5rem' }}>🚨</span>
              <div>
                <strong>Situation critique :</strong>{' '}
                {sitesSatures.length > 0 && (
                  <span>{sitesSatures.length} site(s) saturé(s) : {sitesSatures.map(s => s.nomSite).join(', ')}. </span>
                )}
                {sitesCritiques.length > 0 && (
                  <span>{sitesCritiques.length} site(s) en zone critique.</span>
                )}
              </div>
            </div>
          )}

          {/* Indicateurs clés */}
          <h6 className="fw-semibold mb-3" style={{ color: '#1a3a5c' }}>Indicateurs humanitaires clés</h6>
          <div className="row g-3 mb-4">
            {indicateurs.map(ind => (
              <div key={ind.label} className="col">
                <div className="card shadow-sm text-center p-3 h-100"
                  style={{ borderRadius: '12px', borderTop: `4px solid ${ind.couleur}` }}>
                  <div style={{ fontSize: "1.3rem" }}>{ind.icone}</div>
                  <h5 className="fw-bold mb-0 mt-1" style={{ color: ind.couleur }}>{ind.valeur}</h5>
                  <p className="fw-semibold small mb-0">{ind.label}</p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>{ind.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Outils d'analyse */}
            <div className="col-md-5">
              <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header fw-semibold"
                  style={{ backgroundColor: '#6f42c1', color: 'white', borderRadius: '12px 12px 0 0' }}>
                  Outils d'analyse et de pilotage
                </div>
                <div className="card-body">
                  {outils.map(o => (
                    <Link key={o.path} to={o.path} className="text-decoration-none">
                      <div className="d-flex align-items-center p-3 mb-2 rounded"
                        style={{ backgroundColor: '#f8f9fa', border: `1px solid ${o.couleur}20`, cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = o.couleur + '15'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f8f9fa'}>
                        <span style={{ fontSize: '1.8rem', minWidth: '45px' }}>{o.icone}</span>
                        <div>
                          <div className="fw-semibold small" style={{ color: o.couleur }}>{o.label}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{o.desc}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* État des sites */}
            <div className="col-md-7">
              <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
                <div className="card-header fw-semibold"
                  style={{ backgroundColor: '#f8f9fa', borderRadius: '12px 12px 0 0' }}>
                  État des sites d'accueil
                </div>
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Site</th>
                        <th>Région</th>
                        <th>Taux</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sites.sort((a, b) => b.tauxOccupation - a.tauxOccupation).map(s => (
                        <tr key={s.id}>
                          <td className="fw-semibold small">{s.nomSite}</td>
                          <td className="small text-muted">{s.region}</td>
                          <td>
                            <div className="progress mb-1" style={{ height: '6px', width: '80px' }}>
                              <div className="progress-bar"
                                style={{ width: `${Math.min(s.tauxOccupation, 100)}%`,
                                  backgroundColor: couleurStatut[s.statut] }} />
                            </div>
                            <small>{s.tauxOccupation}%</small>
                          </td>
                          <td>
                            <span className="badge text-white"
                              style={{ backgroundColor: couleurStatut[s.statut], fontSize: '0.7rem' }}>
                              {s.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer text-center">
                  <Link to="/carte" className="small text-decoration-none" style={{ color: '#6f42c1' }}>
                    Voir sur la carte →
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

export default ResponsableDashboard;
