import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleGuard } from './components/auth/RoleGuard'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { AdminPage } from './pages/Admin'
import { AlarmManagementPage } from './pages/AlarmManagement'
import { AnalyticsPage } from './pages/Analytics'
import { DashboardPage } from './pages/Dashboard'
import { DiagnosticsPage, DiagnosticsResponsePage } from './pages/Diagnostics'
import { LiveMonitoringPage } from './pages/LiveMonitoring'
import { LoginPage } from './pages/Login'
import { StationDetailPage } from './pages/StationDetail'
import { HistoryEventPage, HistoryPage } from './pages/History'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<RoleGuard />}>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="live/motors"
                element={<LiveMonitoringPage kind="motor" />}
              />
              <Route
                path="live/people"
                element={<LiveMonitoringPage kind="people" />}
              />
              <Route path="history" element={<HistoryPage />} />
              <Route path="history/event/:eventId" element={<HistoryEventPage />} />
              <Route path="alarms" element={<AlarmManagementPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="diagnostics" element={<DiagnosticsPage />} />
              <Route
                path="diagnostics/response/:cameraId"
                element={<DiagnosticsResponsePage />}
              />
              <Route path="station/:stationId" element={<StationDetailPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
