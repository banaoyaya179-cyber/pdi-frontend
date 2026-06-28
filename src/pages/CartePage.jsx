import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MainLayout from '../components/layout/MainLayout';
import { getAllSites, getSiteById } from '../api/siteApi';
import { useAuth } from '../context/AuthContext';

// Fix icône Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const couleurParStatut = {
  NORMAL: '#28a745',
  CRITIQUE: '#fd7e14',
  SATURE: '#dc3545',
};

const CartePage = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAgent = user?.role === 'ROLE_AGENT';
  const [siteSelectionne, setSiteSelectionne] = useState(null);

  useEffect(() => {
    if (isAgent && user?.idSiteAffecte) {
      getSiteById(user.idSiteAffecte)
        .then(r => setSites([r.data]))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      getAllSites()
        .then(r => setSites(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isAgent, user]);

  // Centre sur le Burkina Faso
  const centre = [12.3714277, -1.5196603];

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Carte interactive des sites d'accueil
        </h5>
        <div className="d-flex gap-3 align-items-center">
          <span><span style={{ color: '#28a745' }}>●</span> Normal (&lt;70%)</span>
          <span><span style={{ color: '#fd7e14' }}>●</span> Critique (70-99%)</span>
          <span><span style={{ color: '#dc3545' }}>●</span> Saturé (≥100%)</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Carte */}
        <div className="col-md-8">
          <div className="card shadow-sm" style={{ borderRadius: '12px', overflow: 'hidden' }}>
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ height: "calc(100vh - 200px)" }}>
                <div className="spinner-border text-primary" />
              </div>
            ) : (
              <MapContainer center={isAgent && sites.length === 1 ? [sites[0].latitude, sites[0].longitude] : centre} zoom={isAgent && sites.length === 1 ? 12 : 7}
                style={{ height: "calc(100vh - 200px)", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {sites.map(site => (
                  site.latitude && site.longitude ? (
                    <CircleMarker
                      key={site.id}
                      center={[site.latitude, site.longitude]}
                      radius={Math.max(10, Math.min(30, site.occupationActuelle / 5))}
                      fillColor={couleurParStatut[site.statut]}
                      color={couleurParStatut[site.statut]}
                      fillOpacity={0.7}
                      eventHandlers={{ click: () => setSiteSelectionne(site) }}>
                      <Popup>
                        <div style={{ minWidth: '200px' }}>
                          <strong>{site.nomSite}</strong><br />
                          <small className="text-muted">{site.commune}, {site.region}</small>
                          <hr className="my-2" />
                          <div>Occupation : <strong>{site.occupationActuelle} / {site.capaciteMaximale}</strong></div>
                          <div>Taux : <strong>{site.tauxOccupation}%</strong></div>
                          <div>
                            Statut : <span style={{ color: couleurParStatut[site.statut] }}>
                              <strong>{site.statut}</strong>
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ) : null
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="col-md-4">
          {siteSelectionne ? (
            <div className="card shadow-sm h-100" style={{ borderRadius: '12px' }}>
              <div className="card-header fw-semibold"
                style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
                {siteSelectionne.nomSite}
              </div>
              <div className="card-body">
                <table className="table table-sm">
                  <tbody>
                    <tr>
                      <td className="text-muted">Région</td>
                      <td><strong>{siteSelectionne.region}</strong></td>
                    </tr>
                    <tr>
                      <td className="text-muted">Province</td>
                      <td>{siteSelectionne.province}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Commune</td>
                      <td>{siteSelectionne.commune}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Capacité</td>
                      <td>{siteSelectionne.capaciteMaximale} places</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Occupation</td>
                      <td><strong>{siteSelectionne.occupationActuelle}</strong> PDI</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Taux</td>
                      <td>
                        <div className="progress mt-1" style={{ height: '10px' }}>
                          <div className="progress-bar"
                            style={{
                              width: `${Math.min(siteSelectionne.tauxOccupation, 100)}%`,
                              backgroundColor: couleurParStatut[siteSelectionne.statut]
                            }} />
                        </div>
                        <small>{siteSelectionne.tauxOccupation}%</small>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Statut</td>
                      <td>
                        <span className="badge text-white"
                          style={{ backgroundColor: couleurParStatut[siteSelectionne.statut] }}>
                          {siteSelectionne.statut}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">GPS</td>
                      <td>
                        <small>{siteSelectionne.latitude?.toFixed(4)}, {siteSelectionne.longitude?.toFixed(4)}</small>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
              <div className="card-body">
                <h6 className="fw-semibold mb-3" style={{ color: '#1a3a5c' }}>
                  Sites d'accueil ({sites.length})
                </h6>
                {sites.map(s => (
                  <div key={s.id}
                    className="d-flex justify-content-between align-items-center p-2 mb-2 rounded"
                    style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                    onClick={() => setSiteSelectionne(s)}>
                    <div>
                      <div className="fw-semibold small">{s.nomSite}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{s.region}</div>
                    </div>
                    <span className="badge text-white"
                      style={{ backgroundColor: couleurParStatut[s.statut] }}>
                      {s.tauxOccupation}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartePage;
