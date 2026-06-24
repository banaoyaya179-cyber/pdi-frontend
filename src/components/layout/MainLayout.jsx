import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f0f4f8' }}>
      <Navbar />
      <div className="container-fluid py-4 px-4">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
