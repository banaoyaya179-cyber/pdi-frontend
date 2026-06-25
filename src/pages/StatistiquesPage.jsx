import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';
import { exporterRapportPDF } from '../utils/exportPdf';

const STATUT_LABELS = {
  DEPLACE_INITIAL: 'Déplacé initial',
  DEPLACE_MULTIPLE: 'Déplacé multiple',
  RETOURNE: 'Retourné',
  REINSTALLE: 'Réinstallé',
};
const STATUT_COLORS = {
  DEPLACE_INITIAL: '#0d6efd',
  DEPLACE_MULTIPLE: '#fd7e14',
  RETOURNE: '#28a745',
  REINSTALLE: '#6f42c1',
};

const BarChart = ({ data, title, colorFn }) => {
  const max = Math.max(...data.map(d => d.valeur), 1);
  return (
    <div>
      <h6 className="fw-semibold mb-3" style={{ color: '#1a3a5c' }}>{title}</h6>
      {data.map(d => (
        <div key={d.label} className="mb-2">
          <div className="d-flex justify-content-between small mb-1">
            <span>{d.label}</span>
            <strong>{d.valeur}</strong>
          </div>
          <div className="progress" style={{ height: '10px' }}>
            <div className="progress-bar"
              style={{
                width: `${(d.valeur / max) * 100}%`,
                backgroundColor: colorFn ? colorFn(d.label) : '#1a3a5c',
                borderRadius: '4px'
              }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const StatistiquesPage = () => {
  const [pdis, setPdis] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateExport] = useState(new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  }));

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

  const parStatut = Object.keys(STATUT_LABELS).map(s => ({
    label: STATUT_LABELS[s], valeur: pdis.filter(p => p.statutCourant === s).length, key: s,
  }));
  const parRegion = [...new Set(pdis.map(p => p.region))].map(r => ({
    label: r, valeur: pdis.filter(p => p.region === r).length,
  })).sort((a, b) => b.valeur - a.valeur);
  const tranchesAge = [
    { label: '0-17 ans', valeur: pdis.filter(p => p.age < 18).length },
    { label: '18-35 ans', valeur: pdis.filter(p => p.age >= 18 && p.age <= 35).length },
    { label: '36-59 ans', valeur: pdis.filter(p => p.age >= 36 && p.age <= 59).length },
    { label: '60+ ans', valeur: pdis.filter(p => p.age >= 60).length },
  ];
  const parSite = sites.map(s => ({
    label: s.nomSite, valeur: s.occupationActuelle,
  })).sort((a, b) => b.valeur - a.valeur);

  // Export CSV
  const exportCSV = () => {
    const lignes = [
      ['ID', 'Nom', 'Prenom', 'Sexe', 'Age', 'Statut', 'Site', 'Region', 'Province', 'Commune', 'Date enrolement'],
      ...pdis.map(p => [
        p.id, p.nom, p.prenom, p.sexe, p.age,
        p.statutCourant, p.nomSiteCourant, p.region, p.province, p.commune, p.dateEnrolement
      ])
    ];
    const csv = '\uFEFF' + lignes.map(l => l.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdi-burkina-liste-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = () => {
    exporterRapportPDF('Rapport PDI-Burkina - ' + dateExport, 'rapport-contenu');
  };

  if (loading) return (
    <MainLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 no-print">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Statistiques & Rapports
        </h5>
        <div className="d-flex gap-2">
          <button className="btn fw-semibold text-white"
            style={{ backgroundColor: '#dc3545', borderRadius: '8px' }}
            onClick={exportPDF}>
            📄 Exporter PDF
          </button>
          <button className="btn fw-semibold text-white"
            style={{ backgroundColor: '#28a745', borderRadius: '8px' }}
            onClick={exportCSV}>
            📊 Exporter CSV/Excel
          </button>
        </div>
      </div>

      {/* Contenu exportable */}
      <div id="rapport-contenu">

        {/* En-tête rapport */}
        <div className="card shadow-sm mb-4 p-4"
          style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #1a3a5c, #0d6efd)', color: 'white' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="fw-bold mb-1">🇧🇫 PDI-Burkina</h4>
              <h6 className="mb-0 opacity-75">Rapport de situation humanitaire</h6>
              <small className="opacity-75">SP/CONASUR — Ministère de l'Action Humanitaire</small>
            </div>
            <div className="text-end">
              <div className="fw-semibold">Date d'édition</div>
              <div>{dateExport}</div>
            </div>
          </div>
        </div>

        {/* Indicateurs clés */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total PDI/Retournés', valeur: total, couleur: '#1a3a5c', icone: '👥' },
            { label: 'Femmes', valeur: `${femmes} (${total > 0 ? Math.round(femmes/total*100) : 0}%)`, couleur: '#e83e8c', icone: '♀' },
            { label: 'Hommes', valeur: `${hommes} (${total > 0 ? Math.round(hommes/total*100) : 0}%)`, couleur: '#0d6efd', icone: '♂' },
            { label: 'Mineurs (-18 ans)', valeur: `${mineurs} (${total > 0 ? Math.round(mineurs/total*100) : 0}%)`, couleur: '#fd7e14', icone: '👶' },
            { label: 'En processus retour', valeur: retournes, couleur: '#28a745', icone: '🏠' },
            { label: 'Sites actifs', valeur: sites.length, couleur: '#6f42c1', icone: '🏕️' },
          ].map(c => (
            <div key={c.label} className="col-md-2">
              <div className="card shadow-sm text-center p-3"
                style={{ borderRadius: '12px', borderTop: `4px solid ${c.couleur}` }}>
                <div style={{ fontSize: '1.5rem' }}>{c.icone}</div>
                <h5 className="fw-bold mb-0 mt-1" style={{ color: c.couleur }}>{c.valeur}</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Graphiques */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <BarChart title="Répartition par statut" data={parStatut}
                colorFn={(label) => {
                  const e = parStatut.find(p => p.label === label);
                  return STATUT_COLORS[e?.key] || '#1a3a5c';
                }} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <BarChart title="Tranches d'âge" data={tranchesAge} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <BarChart title="PDI par région" data={parRegion} />
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>
              <BarChart title="Occupation par site" data={parSite} />
              <div className="mt-4">
                <h6 className="fw-semibold mb-3" style={{ color: '#1a3a5c' }}>Répartition par sexe</h6>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ flex: femmes, backgroundColor: '#e83e8c',
                    height: '24px', borderRadius: '4px 0 0 4px', minWidth: '4px' }} />
                  <div style={{ flex: hommes, backgroundColor: '#0d6efd',
                    height: '24px', borderRadius: '0 4px 4px 0', minWidth: '4px' }} />
                </div>
                <div className="d-flex justify-content-between small mt-1">
                  <span style={{ color: '#e83e8c' }}>♀ {femmes} ({total > 0 ? Math.round(femmes/total*100) : 0}%)</span>
                  <span style={{ color: '#0d6efd' }}>♂ {hommes} ({total > 0 ? Math.round(hommes/total*100) : 0}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table état des sites */}
        <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
          <div className="card-header fw-semibold"
            style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '12px 12px 0 0' }}>
            État détaillé des sites d'accueil
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Site</th><th>Région</th><th>Province</th>
                  <th>Capacité</th><th>Occupation</th><th>Taux</th><th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {sites.map(s => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.nomSite}</td>
                    <td>{s.region}</td>
                    <td>{s.province}</td>
                    <td>{s.capaciteMaximale}</td>
                    <td>{s.occupationActuelle}</td>
                    <td>{s.tauxOccupation}%</td>
                    <td>
                      <span className="badge text-white"
                        style={{ backgroundColor: s.statut === 'NORMAL' ? '#28a745' : s.statut === 'CRITIQUE' ? '#fd7e14' : '#dc3545' }}>
                        {s.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pied de page rapport */}
        <div className="text-center text-muted small mt-4 py-3"
          style={{ borderTop: '1px solid #dee2e6' }}>
          Document généré automatiquement par PDI-Burkina — SP/CONASUR — {dateExport}
        </div>
      </div>
    </MainLayout>
  );
};

export default StatistiquesPage;
