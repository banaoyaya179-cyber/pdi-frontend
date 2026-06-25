import { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAuditLogs } from '../api/auditApi';

const actionColors = {
  CONNEXION: '#28a745',
  ENROLEMENT_PDI: '#0d6efd',
  MODIFICATION_PDI: '#fd7e14',
  MODIFICATION_STATUT: '#6f42c1',
  SUPPRESSION: '#dc3545',
};

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filtres, setFiltres] = useState({ action: '', email: '' });

  const charger = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, taille: 20 };
      if (filtres.action) params.action = filtres.action;
      if (filtres.email) params.email = filtres.email;
      const res = await getAuditLogs(params);
      setLogs(res.data.contenu);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filtres]);

  useEffect(() => { charger(); }, [charger]);

  const formatDate = (dt) => {
    if (!dt) return '-';
    return new Date(dt).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Journal d'audit
          <span className="badge ms-2 text-white"
            style={{ backgroundColor: '#1a3a5c', fontSize: '0.8rem' }}>
            {totalElements} événements
          </span>
        </h5>
        <span className="badge bg-danger">🔒 Lecture seule — Immuable</span>
      </div>

      {/* Filtres */}
      <div className="card shadow-sm mb-4" style={{ borderRadius: '12px' }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-5">
              <input className="form-control" placeholder="Filtrer par action (ex: CONNEXION)"
                value={filtres.action}
                onChange={e => { setFiltres(f => ({ ...f, action: e.target.value })); setPage(0); }} />
            </div>
            <div className="col-md-5">
              <input className="form-control" placeholder="Filtrer par email utilisateur"
                value={filtres.email}
                onChange={e => { setFiltres(f => ({ ...f, email: e.target.value })); setPage(0); }} />
            </div>
            <div className="col-md-2">
              <button className="btn w-100" style={{ backgroundColor: '#1a3a5c', color: 'white' }}
                onClick={charger}>
                Filtrer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="table table-hover mb-0" style={{ fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>#</th>
                  <th>Horodatage</th>
                  <th>Action</th>
                  <th>Utilisateur</th>
                  <th>Entité impactée</th>
                  <th>IP Source</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      Aucun événement trouvé
                    </td>
                  </tr>
                ) : logs.map(log => (
                  <tr key={log.id}>
                    <td className="text-muted small">#{log.id}</td>
                    <td>
                      <small className="text-muted">{formatDate(log.horodatage)}</small>
                    </td>
                    <td>
                      <span className="badge text-white"
                        style={{ backgroundColor: actionColors[log.action] || '#6c757d' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold small">{log.nomUtilisateur}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{log.emailUtilisateur}</div>
                    </td>
                    <td><small>{log.entiteImpactee || '-'}</small></td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {log.ipSource}
                      </span>
                    </td>
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

export default AuditLogPage;
