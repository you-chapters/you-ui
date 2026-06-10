import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NewEntryPage from './pages/NewEntryPage';
import EntriesViewPage from './pages/EntriesViewPage';
import PhasesPage from './pages/PhasesPage';
import AskPage from './pages/AskPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/new" element={<ProtectedRoute><NewEntryPage /></ProtectedRoute>} />
        <Route path="/entries" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
        <Route path="/entries/:id" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
        <Route path="/entry/:id" element={<ProtectedRoute><EntriesViewPage /></ProtectedRoute>} />
        <Route path="/phases" element={<ProtectedRoute><PhasesPage /></ProtectedRoute>} />
        <Route path="/ask" element={<ProtectedRoute><AskPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}
