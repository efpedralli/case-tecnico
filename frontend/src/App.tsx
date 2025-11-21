import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage } from './pages/StudentsPage';
import { CheckinPage } from './pages/CheckinPage';
import { StudentAreaPage } from './pages/StudentAreaPage';
import { StudentAreaHistory } from './pages/StudentAreaHistory';
import { useAuthContext } from './context/AuthContext';
import { StudentHistoryAdminPage } from './pages/StudentHistoryAdminPage';
import { EnvironmentManagementPage } from './pages/EnvironmentManagementPage';
import { StudentScanPage } from './pages/StudentScanPage';



function AdminRoute({ children }: { children: React.ReactElement }) {
  const { token, role } = useAuthContext();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/student-area" replace />;
  return children;
}

function StudentRoute({ children }: { children: React.ReactElement }) {
  const { token, role } = useAuthContext();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'student') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* ROTAS ADMIN */}
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        }
      />
      <Route
        path="/students"
        element={
          <AdminRoute>
            <StudentsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/students/:id/history"
        element={
          <AdminRoute>
            <StudentHistoryAdminPage />
          </AdminRoute>
        }
      />
      <Route
        path="/checkin"
        element={
          <AdminRoute>
            <CheckinPage />
          </AdminRoute>
        }
      />

      {/* ROTAS ESTUDANTE */}
      <Route
        path="/student-area"
        element={
          <StudentRoute>
            <StudentAreaPage />
          </StudentRoute>
        }
      />
      <Route
        path="/student-history"
        element={
          <StudentRoute>
            <StudentAreaHistory />
          </StudentRoute>
        }
      />
      <Route
        path="/environment/:id"
        element={
          <AdminRoute>
            <EnvironmentManagementPage />
          </AdminRoute>
        }
      />
      <Route
  path="/student-scan"
  element={
    <StudentRoute>
      <StudentScanPage />
    </StudentRoute>
  }
/>



      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
