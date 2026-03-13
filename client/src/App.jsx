import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import InstallPrompt from './components/InstallPrompt';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewHabit from './pages/NewHabit';
import Streaks from './pages/Streaks';
import Settings from './pages/Settings';
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import Onboarding from './pages/Onboarding';
import './App.css';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="main-content">{children}</div>
      <MobileNav />
      <InstallPrompt />
    </>
  );
}

export default function App() {
  useEffect(() => {
    useAuthStore.getState().initialize();
    useThemeStore.getState().initialize();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/habits/new"
          element={
            <ProtectedRoute>
              <AppLayout>
                <NewHabit />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/streaks"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Streaks />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
