import Navbar from './Navbar';
import SyncBanner from './SyncBanner';

const MainLayout = ({ children }) => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />
      <SyncBanner />
      <div className="container-fluid py-4 px-4">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
