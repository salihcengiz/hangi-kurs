import { Route, Routes } from 'react-router';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { InstitutionDetailPage } from '@/pages/InstitutionDetailPage';
import { InstitutionsListPage } from '@/pages/InstitutionsListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/kurumlar" element={<InstitutionsListPage />} />
        <Route path="/kurum/:slug" element={<InstitutionDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
