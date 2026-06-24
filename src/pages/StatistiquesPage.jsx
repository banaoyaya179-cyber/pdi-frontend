import { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { rechercherPdi } from '../api/pdiApi';
import { getAllSites } from '../api/siteApi';

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

  // Calculs statistiques
  const totalPdi = pdis.length;
  const parSexe = {
    M: pdis.filter(p => p.sexe === 'M').length,
    F: pdis.filter(p => p.sexe === 'F').length,
  };
  const parStatut = Object.keys(STATUT_LABELS).map(s => ({
    label: STATUT_LABELS[s],
    valeur: pdis.filter(p => p.statutCourant === s).length,
    key: s,
  }));
  const parRegion = [...new Set(pdis.map(p => p.region))].map(r => ({
    label: r,
    valeur: pdis.filter(p => p.region === r).length,
  })).sort((a, b) => b.valeur - a.valeur);

  const tranchesAge = [
    { label: '0-17 ans', valeur: pdis.filter(p => p.age < 18).length },
    { label: '18-35 ans', valeur: pdis.filter(p => p.age >= 18 && p.age <= 35).length },
    { label: '36-59 ans', valeur: pdis.filter(p => p.age >= 36 && p.age <= 59).length },
    { label: '60+ ans', valeur: pdis.filter(p => p.age >= 60).length },
  ];

  const parSite = sites.map(s => ({
    label: s.nomSite,
    valeur: s.occupationActuelle,
  })).sort((a, b) => b.valeur - a.valeur);

  const exportCSV = () => {
    const lignes = [
      ['ID', 'Nom', 'Prenom', 'Sexe', 'Age', 'Statut', 'Site', 'Region', 'Date enrolement'],
      ...pdis.map(p => [
        p.id, p.nom, p.prenom, p.sexe, p.age,
        p.statutCourant, p.nomSiteCourant, p.region, p.dateEnrolement
      ])
    ];
    const csv = lignes.map(l => l.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdi-burkina-export-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <MainLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Statistiques & Rapports
        </h5>
        <button className="btn text-white fw-semibold"
          style={{ backgroundColor: '#28a745', borderRadius: '8px' }}
          onClick={exportCSV}>
          ⬇ Exporter CSV
        </button>
      </div>

      {/* Cartes résumé */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total PDI', valeur: totalPdi, couleur: '#0d6efd', icone: '👥' },
          { label: 'Femmes', valeur: parSexe.F, couleur: '#e83e8c', icone: '♀' },
          { label: 'Hommes', valeur: parSexe.M, couleur: '#0d6efd', icone: '♂' },
          { label: 'Sites actifs', valeur: sites.length, couleur: '#28a745', icone: '🏕️' },
        ].map(c => (
          <div key={c.label} className="col-md-3">
            <div className="card shadow-sm"
              style={{ borderLeft: `4px solid ${c.couleur}`, borderRadius: '12px' }}>
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">{c.label}</p>
                  <h3 className="fw-bold mb-0" style={{ color: c.couleur }}>{c.valeur}</h3>
                </div>
                <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>{c.icone}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm p-4" style={{ borderRadius: '12px' }}>
            <BarChart
              title="Répartition par statut"
              data={parStatut}
              colorFn={(label) => {
                const entry = parStatut.find(p => p.label === label);
                return STATUT_COLORS[entry?.key] || '#1a3a5c';
              }}
            />
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

            {/* Pyramide sexe */}
            <div className="mt-4">
              <h6 className="fw-semibold mb-3" style={{ color: '#1a3a5c' }}>
                Répartition par sexe
              </h6>
              <div className="d-flex align-items-center gap-2">
                <div style={{ flex: parSexe.F, backgroundColor: '#e83e8c',
                  height: '24px', borderRadius: '4px 0 0 4px', minWidth: '4px' }} />
                <div style={{ flex: parSexe.M, backgroundColor: '#0d6efd',
                  height: '24px', borderRadius: '0 4px 4px 0', minWidth: '4px' }} />
              </div>
              <div className="d-flex justify-content-between small mt-1">
                <span style={{ color: '#e83e8c' }}>
                  ♀ Femmes : {parSexe.F} ({totalPdi > 0 ? Math.round(parSexe.F / totalPdi * 100) : 0}%)
                </span>
                <span style={{ color: '#0d6efd' }}>
                  ♂ Hommes : {parSexe.M} ({totalPdi > 0 ? Math.round(parSexe.M / totalPdi * 100) : 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StatistiquesPage;
