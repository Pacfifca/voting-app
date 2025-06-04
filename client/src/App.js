import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './utils/RequireAuth';
import HomePage     from './pages/HomePage';
import ProfilePage  from './pages/ProfilePage';
import VotePage     from './pages/VotePage';
import CreatePage   from './pages/CreateVotingPage';
import AuthPage     from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*чтоб пользователь мог хотя бы войти*/}
        <Route path="/auth" element={<AuthPage />} />

        {/*только залогиненым*/}
        <Route element={<RequireAuth />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/voting/:id" element={<VotePage />} />
          <Route path="/create"    element={<CreatePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;