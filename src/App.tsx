import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Alis from './pages/Alis';
import Satis from './pages/Satis';
import Stok from './pages/Stok';
import Servis from './pages/Servis';
import Finans from './pages/Finans';
import Raporlar from './pages/Raporlar';
import ImeiSorgulama from './pages/ImeiSorgulama';
import Profil from './pages/Profil';
import PersonelAyarlari from './pages/PersonelAyarlari';
import SatisGecmisi from './pages/SatisGecmisi';
import AlisGecmisi from './pages/AlisGecmisi';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alis"
            element={
              <ProtectedRoute>
                <Alis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/satis"
            element={
              <ProtectedRoute>
                <Satis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stok"
            element={
              <ProtectedRoute>
                <Stok />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servis"
            element={
              <ProtectedRoute>
                <Servis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finans"
            element={
              <ProtectedRoute>
                <Finans />
              </ProtectedRoute>
            }
          />
          <Route
            path="/raporlar"
            element={
              <ProtectedRoute>
                <Raporlar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/imei-sorgulama"
            element={
              <ProtectedRoute>
                <ImeiSorgulama />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personel-ayarlari"
            element={
              <ProtectedRoute>
                <PersonelAyarlari />
              </ProtectedRoute>
            }
          />
          <Route
            path="/satis-gecmisi"
            element={
              <ProtectedRoute>
                <SatisGecmisi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alis-gecmisi"
            element={
              <ProtectedRoute>
                <AlisGecmisi />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

