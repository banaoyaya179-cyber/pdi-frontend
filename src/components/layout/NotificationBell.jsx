import { useState, useEffect, useRef } from 'react';
import { getNonLues, marquerLue, marquerToutesLues } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [chargement, setChargement] = useState(false);
  const ref = useRef(null);

  const charger = async () => {
    if (user?.role !== 'ROLE_ADMIN' && user?.role !== 'ROLE_RESPONSABLE') return;
    try {
      const res = await getNonLues();
      setNotifications(res.data);
    } catch (err) {
      console.error('Erreur notifications:', err);
    }
  };

  useEffect(() => {
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLue = async (e, id) => {
    e.stopPropagation();
    setChargement(true);
    try {
      await marquerLue(id);
      // Mise à jour locale immédiate sans attendre le rechargement
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Erreur marquer lu:', err);
    } finally {
      setChargement(false);
    }
  };

  const handleToutesLues = async (e) => {
    e.stopPropagation();
    setChargement(true);
    try {
      await marquerToutesLues();
      setNotifications([]);
    } catch (err) {
      console.error('Erreur toutes lues:', err);
    } finally {
      setChargement(false);
    }
  };

  if (user?.role === 'ROLE_AGENT') return null;

  return (
    <div className="position-relative" ref={ref}>
      <button
        className="btn btn-outline-light btn-sm position-relative"
        onClick={() => { setOpen(o => !o); charger(); }}>
        🔔
        {notifications.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.6rem' }}>
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="position-absolute end-0 mt-2 shadow-lg"
          style={{
            width: '380px', zIndex: 9999,
            backgroundColor: 'white', borderRadius: '12px',
            border: '1px solid #dee2e6', top: '100%'
          }}>
          <div
            className="d-flex justify-content-between align-items-center p-3"
            style={{ borderBottom: '1px solid #f0f0f0' }}>
            <strong style={{ color: '#1a3a5c' }}>
              Alertes ({notifications.length})
            </strong>
            {notifications.length > 0 && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleToutesLues}
                disabled={chargement}>
                Tout marquer lu
              </button>
            )}
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center text-muted py-4">
                <div style={{ fontSize: '2rem' }}>✅</div>
                <small>Aucune alerte</small>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className="p-3"
                  style={{
                    borderBottom: '1px solid #f8f9fa',
                    backgroundColor: '#fff8f0'
                  }}>
                  <div className="small mb-2">{n.message}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {new Date(n.dateCreation).toLocaleString('fr-FR', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </small>
                    <button
                      className="btn btn-sm btn-success py-0 px-2"
                      style={{ fontSize: '0.7rem' }}
                      onClick={(e) => handleLue(e, n.id)}
                      disabled={chargement}>
                      ✓ Marquer lu
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
