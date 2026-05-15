import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewEntryPage from './pages/NewEntryPage';
import EntriesViewPage from './pages/EntriesViewPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/new" element={<ProtectedRoute><NewEntryPage /></ProtectedRoute>} />
        <Route path="/entries" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
        <Route path="/entries/:id" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}