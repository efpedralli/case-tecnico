import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuthContext } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CheckinPage } from './pages/CheckinPage';
import { StudentAreaPage } from './pages/StudentAreaPage';
import { StudentAreaHistory } from './pages/StudentAreaHistory';


function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuthContext();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/students"
        element={
          <PrivateRoute>
            <StudentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/checkin"
        element={
          <PrivateRoute>
            <CheckinPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route path="/student-area" element={<StudentAreaPage />} />
      <Route path="/student-history" element={<StudentAreaHistory />} />
    </Routes>
  );
}
