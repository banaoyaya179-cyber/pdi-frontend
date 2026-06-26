import { useState, useEffect, useCallback } from 'react';
import { getFicheEnAttente, supprimerFiche } from '../../utils/offlineStorage';
import { enrolerPdi } from '../../api/pdiApi';

const SyncBanner = () => {
  const [enLigne, setEnLigne] = useState(navigator.onLine);
  const [fichesEnAttente, setFichesEnAttente] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');

  const chargerFiches = useCallback(async () => {
    const fiches = await getFicheEnAttente();
    setFichesEnAttente(fiches);
  }, []);

  useEffect(() => {
    chargerFiches();

    const handleOnline = () => {
      setEnLigne(true);
      chargerFiches();
    };
    const handleOffline = () => setEnLigne(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [chargerFiches]);

  const synchroniser = async () => {
    setSyncing(true);
    setMessage('');
    let succes = 0;
    let echecs = 0;

    for (const fiche of fichesEnAttente) {
      try {
        const { id, dateSauvegarde, ...donnees } = fiche;
        await enrolerPdi(donnees);
        await supprimerFiche(id);
        succes++;
      } catch {
        echecs++;
      }
    }

    await chargerFiches();
    setSyncing(false);
    setMessage(`Synchronisation : ${succes} fiche(s) envoyée(s)${echecs > 0 ? `, ${echecs} échec(s)` : ''}.`);
    setTimeout(() => setMessage(''), 5000);
  };

  // Pas en ligne et pas de fiches en attente = rien à afficher
  if (enLigne && fichesEnAttente.length === 0) return null;

  return (
    <>
      {/* Bannière hors ligne */}
      {!enLigne && (
        <div className="text-center py-2 text-white fw-semibold"
          style={{ backgroundColor: '#dc3545', fontSize: '0.85rem' }}>
          📡 Mode hors ligne — Les fiches PDI seront sauvegardées localement
        </div>
      )}

      {/* Bannière synchro disponible */}
      {enLigne && fichesEnAttente.length > 0 && (
        <div className="d-flex justify-content-between align-items-center px-4 py-2 text-white"
          style={{ backgroundColor: '#fd7e14', fontSize: '0.85rem' }}>
          <span>
            📋 <strong>{fichesEnAttente.length}</strong> fiche(s) PDI en attente de synchronisation
          </span>
          <div className="d-flex align-items-center gap-3">
            {message && <span className="small">{message}</span>}
            <button className="btn btn-sm btn-light fw-semibold"
              onClick={synchroniser} disabled={syncing}>
              {syncing ? (
                <span><span className="spinner-border spinner-border-sm me-1" />Sync...</span>
              ) : '⬆️ Synchroniser maintenant'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SyncBanner;
