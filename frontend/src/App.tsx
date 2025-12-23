import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DrawPage } from './pages/DrawPage';
import { TreePage } from './pages/TreePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/draw" replace />} />
        <Route path="/draw" element={<DrawPage />} />
        <Route path="/tree" element={<TreePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
