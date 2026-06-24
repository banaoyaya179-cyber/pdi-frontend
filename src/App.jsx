import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PdiPage from './pages/PdiPage';
import CartePage from './pages/CartePage';
import SitesPage from './pages/SitesPage';
import BesoinsPage from './pages/BesoinsPage';
import DeplacementsPage from './pages/DeplacementsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/pdi" element={<ProtectedRoute><PdiPage /></ProtectedRoute>} />
          <Route path="/sites" element={<ProtectedRoute><SitesPage /></ProtectedRoute>} />
          <Route path="/carte" element={<ProtectedRoute><CartePage /></ProtectedRoute>} />
          <Route path="/besoins" element={<ProtectedRoute><BesoinsPage /></ProtectedRoute>} />
          <Route path="/deplacements" element={<ProtectedRoute><DeplacementsPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
