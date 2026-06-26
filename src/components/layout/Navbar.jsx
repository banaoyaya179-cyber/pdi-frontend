import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = {
    ROLE_ADMIN: 'Administrateur',
    ROLE_AGENT: 'Agent de terrain',
    ROLE_RESPONSABLE: 'Responsable humanitaire',
  };

  const liensCommuns = [
    { path: '/dashboard', label: 'Tableau de bord' },
    { path: '/pdi', label: 'Gestion PDI' },
    { path: '/besoins', label: 'Besoins & Aides' },
    { path: '/deplacements', label: 'Déplacements' },
    { path: '/sites', label: "Sites d'accueil" },
    { path: '/carte', label: 'Carte' },
    { path: '/statistiques', label: 'Statistiques' },
  ];

  const liensAdmin = [
    { path: '/utilisateurs', label: '⚙️ Utilisateurs' },
    { path: '/audit', label: '🔒 Audit' },
  ];

  const liens = user?.role === 'ROLE_ADMIN'
    ? [...liensCommuns, ...liensAdmin]
    : liensCommuns;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#1a3a5c' }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/dashboard">
          <span style={{ color: '#f5a623' }}>🇧🇫</span> PDI-Burkina
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {liens.map(l => (
              <li className="nav-item" key={l.path}>
                <Link className={`nav-link ${location.pathname === l.path ? 'active fw-semibold' : ''}`}
                  to={l.path}>{l.label}</Link>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3">
            <NotificationBell />
            <Link to="/securite" className="btn btn-outline-warning btn-sm fw-semibold">
              🔐 2FA
            </Link>
            <span className="text-light small">
              <strong>{user?.prenom} {user?.nom}</strong><br />
              <span className="text-warning" style={{ fontSize: '0.75rem' }}>
                {roleLabel[user?.role]}
              </span>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
