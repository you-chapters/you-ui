import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import LandingPage from './pages/LandingPage';
import NewEntryPage from './pages/NewEntryPage';
import EntriesViewPage from './pages/EntriesViewPage';

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/new" element={<NewEntryPage />} />
        <Route path="/entries" element={<EntriesViewPage />} />
        <Route path="/entries/:id" element={<EntriesViewPage />} />
      </Routes>
    </>
  );
}