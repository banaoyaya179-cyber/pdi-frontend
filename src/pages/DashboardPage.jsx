import { useAuth } from '../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AgentDashboard from './AgentDashboard';
import ResponsableDashboard from './ResponsableDashboard';

const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'ROLE_AGENT') return <AgentDashboard />;
  if (user?.role === 'ROLE_RESPONSABLE') return <ResponsableDashboard />;
  return <AdminDashboard />;
};

export default DashboardPage;
