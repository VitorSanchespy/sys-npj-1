import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/Register';
import DashboardPage from './pages/dashboard/Dashboard';
import ProcessList from './pages/dashboard/processes/ProcessList';
import ProcessDetail from './pages/dashboard/processes/ProcessDetail';
import FileUpload from './pages/dashboard/files/FileUpload';
import UserList from './pages/dashboard/users/UserList';
import { NotificationProvider } from './contexts/NotificationContext';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <NotificationProvider>
      <MantineProvider theme={theme}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registrar" element={<RegisterPage />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/processos" element={<ProcessList />} />
                  <Route path="/processos/:id" element={<ProcessDetail />} />
                  <Route path="/arquivos" element={<FileUpload />} />
                  <Route path="/usuarios" element={<UserList />} />
                  <Route path="/perfil" element={<ProfilePage />} />
                </Route>
              </Route>
            </Routes>
          </MantineProvider>
    </NotificationProvider>
  );
}

export default App;