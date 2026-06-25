import { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { getAllUtilisateurs, creerUtilisateur, toggleCompte, changerRole } from '../api/utilisateurApi';

const roleColors = {
  ROLE_ADMIN: '#dc3545',
  ROLE_AGENT: '#0d6efd',
  ROLE_RESPONSABLE: '#6f42c1',
};
const roleLabels = {
  ROLE_ADMIN: 'Administrateur',
  ROLE_AGENT: 'Agent de terrain',
  ROLE_RESPONSABLE: 'Responsable humanitaire',
};

const UtilisateursPage = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', motDePasse: '', role: 'ROLE_AGENT'
  });
  const [formLoading, setFormLoading] = useState(false);

  const charger = async () => {
    try {
      const res = await getAllUtilisateurs();
      setUtilisateurs(res.data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur(''); setSucces('');
    setFormLoading(true);
    try {
      await creerUtilisateur(form);
      setSucces('Compte créé avec succès.');
      setShowForm(false);
      setForm({ nom: '', prenom: '', email: '', motDePasse: '', role: 'ROLE_AGENT' });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création.');
    } finally { setFormLoading(false); }
  };

  const handleToggle = async (id, actif) => {
    if (!window.confirm(`${actif ? 'Désactiver' : 'Réactiver'} ce compte ?`)) return;
    await toggleCompte(id);
    charger();
  };

  const handleChangerRole = async (id, role) => {
    await changerRole(id, role);
    charger();
  };

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ color: '#1a3a5c' }}>
          Gestion des utilisateurs
          <span className="badge ms-2 text-white"
            style={{ backgroundColor: '#1a3a5c', fontSize: '0.8rem' }}>
            {utilisateurs.length} comptes
          </span>
        </h5>
        <button className="btn text-white fw-semibold"
          style={{ backgroundColor: '#1a3a5c', borderRadius: '8px' }}
          onClick={() => { setShowForm(true); setErreur(''); setSucces(''); }}>
          + Créer un compte
        </button>
      </div>

      {succes && <div className="alert alert-success">{succes}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {/* Formulaire création */}
      {showForm && (
        <div className="card shadow-sm mb-4" style={{ borderRadius: '12px', border: '2px solid #1a3a5c' }}>
          <div className="card-header fw-semibold"
            style={{ backgroundColor: '#1a3a5c', color: 'white', borderRadius: '10px 10px 0 0' }}>
            Nouveau compte utilisateur
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Nom *</label>
                  <input className="form-control" required
                    value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Prénom *</label>
                  <input className="form-control" required
                    value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Email *</label>
                  <input type="email" className="form-control" required
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold small">Mot de passe *</label>
                  <input type="password" className="form-control" required minLength={8}
                    value={form.motDePasse} onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold small">Rôle *</label>
                  <select className="form-select"
                    value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="ROLE_AGENT">Agent de terrain</option>
                    <option value="ROLE_RESPONSABLE">Responsable humanitaire</option>
                    <option value="ROLE_ADMIN">Administrateur</option>
                  </select>
                </div>
                <div className="col-md-8 d-flex align-items-end gap-2">
                  <button type="submit" className="btn text-white fw-semibold"
                    style={{ backgroundColor: '#1a3a5c' }} disabled={formLoading}>
                    {formLoading ? '...' : 'Créer le compte'}
                  </button>
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={() => setShowForm(false)}>Annuler</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table des utilisateurs */}
      <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="table table-hover mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr>
                  <th>ID</th>
                  <th>Nom & Prénom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map(u => (
                  <tr key={u.id}>
                    <td><span className="text-muted small">#{u.id}</span></td>
                    <td className="fw-semibold">{u.nom} {u.prenom}</td>
                    <td className="small text-muted">{u.email}</td>
                    <td>
                      <select className="form-select form-select-sm"
                        style={{ width: 'auto', borderColor: roleColors[u.role],
                          color: roleColors[u.role], fontWeight: '600' }}
                        value={u.role}
                        onChange={e => handleChangerRole(u.id, e.target.value)}>
                        <option value="ROLE_AGENT">Agent</option>
                        <option value="ROLE_RESPONSABLE">Responsable</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.compteActif ? 'bg-success' : 'bg-secondary'}`}>
                        {u.compteActif ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.compteActif ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggle(u.id, u.compteActif)}>
                        {u.compteActif ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UtilisateursPage;
