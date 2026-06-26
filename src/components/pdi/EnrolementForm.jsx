import { useState } from 'react';
import { enrolerPdi } from '../../api/pdiApi';
import { creerMenage } from '../../api/menageApi';
import { sauvegarderLocalement } from '../../utils/offlineStorage';

const EnrolementForm = ({ sites, onSuccess, onCancel }) => {
  const [etape, setEtape] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState('');
  const [idMenage, setIdMenage] = useState('');
  const [form, setForm] = useState({
    nom: '', prenom: '', sexe: '', dateNaissance: '',
    statutCourant: 'DEPLACE_INITIAL', idSiteCourant: '',
  });

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreerMenage = async () => {
    if (!form.idSiteCourant) { setErreur("Veuillez sélectionner un site."); return; }
    setLoading(true); setErreur('');
    try {
      const res = await creerMenage({ idSite: parseInt(form.idSiteCourant) });
      setIdMenage(res.data.id);
      setEtape(2);
    } catch { setErreur('Erreur lors de la création du ménage.'); }
    finally { setLoading(false); }
  };

  const handleMenageExistant = () => {
    const id = prompt('Entrez le numéro du ménage existant :');
    if (id && !isNaN(id)) { setIdMenage(parseInt(id)); setEtape(2); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErreur('');

    const donnees = {
      ...form,
      idMenage: parseInt(idMenage),
      idSiteCourant: parseInt(form.idSiteCourant),
    };

    // Mode offline — sauvegarder localement
    if (!navigator.onLine) {
      try {
        await sauvegarderLocalement(donnees);
        onSuccess('offline');
      } catch {
        setErreur('Erreur lors de la sauvegarde locale.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Mode online — envoyer à l'API
    try {
      await enrolerPdi(donnees);
      onSuccess('online');
    } catch (err) {
      const msg = err.response?.data?.erreur || "Erreur lors de l'enrôlement.";
      setErreur(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content" style={{ borderRadius: '16px' }}>
          <div className="modal-header"
            style={{ backgroundColor: navigator.onLine ? '#1a3a5c' : '#dc3545',
              color: 'white', borderRadius: '16px 16px 0 0' }}>
            <h5 className="modal-title">
              {!navigator.onLine && '📡 Mode hors ligne — '}
              {etape === 1 ? '① Ménage' : '② Fiche PDI'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel} />
          </div>

          <div className="modal-body p-4">
            {!navigator.onLine && (
              <div className="alert alert-warning small mb-3">
                ⚠️ Vous êtes hors ligne. La fiche sera sauvegardée localement
                et synchronisée au retour de la connexion.
              </div>
            )}

            {erreur && <div className="alert alert-danger small">{erreur}</div>}

            {etape === 1 && (
              <div>
                <p className="text-muted mb-4">
                  Chaque PDI appartient à un ménage. Créez un nouveau ménage
                  ou rattachez à un ménage existant.
                </p>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Site d'accueil *</label>
                  <select className="form-select" name="idSiteCourant"
                    value={form.idSiteCourant} onChange={handleChange} required>
                    <option value="">Sélectionner un site...</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nomSite} — {s.region} ({s.occupationActuelle}/{s.capaciteMaximale})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-3 mt-4">
                  <button className="btn flex-fill text-white fw-semibold"
                    style={{ backgroundColor: '#1a3a5c' }}
                    onClick={handleCreerMenage} disabled={loading || !navigator.onLine}>
                    {loading ? '...' : '+ Créer un nouveau ménage'}
                  </button>
                  <button className="btn btn-outline-secondary flex-fill"
                    onClick={handleMenageExistant}>
                    Ménage existant (par ID)
                  </button>
                </div>
                {!navigator.onLine && (
                  <p className="text-muted small mt-2">
                    * En mode hors ligne, utilisez un ménage existant (par ID).
                  </p>
                )}
              </div>
            )}

            {etape === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="alert alert-info small mb-4">
                  Ménage #{idMenage} sélectionné
                </div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nom *</label>
                    <input type="text" className="form-control text-uppercase"
                      name="nom" value={form.nom} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Prénom *</label>
                    <input type="text" className="form-control"
                      name="prenom" value={form.prenom} onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Sexe *</label>
                    <select className="form-select" name="sexe"
                      value={form.sexe} onChange={handleChange} required>
                      <option value="">--</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Date de naissance *</label>
                    <input type="date" className="form-control"
                      name="dateNaissance" value={form.dateNaissance}
                      onChange={handleChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Statut *</label>
                    <select className="form-select" name="statutCourant"
                      value={form.statutCourant} onChange={handleChange} required>
                      <option value="DEPLACE_INITIAL">Déplacé initial</option>
                      <option value="DEPLACE_MULTIPLE">Déplacé multiple</option>
                      <option value="RETOURNE">Retourné</option>
                      <option value="REINSTALLE">Réinstallé</option>
                    </select>
                  </div>
                </div>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline-secondary"
                    onClick={() => setEtape(1)}>← Retour</button>
                  <button type="submit" className="btn text-white fw-semibold"
                    style={{ backgroundColor: navigator.onLine ? '#1a3a5c' : '#dc3545' }}
                    disabled={loading}>
                    {loading ? 'En cours...' : navigator.onLine
                      ? 'Enrôler la PDI' : '💾 Sauvegarder hors ligne'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrolementForm;
