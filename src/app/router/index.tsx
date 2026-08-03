import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { AppLayout } from "@/app/layouts/AppLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { AvailabilityPage } from "@/features/availability/AvailabilityPage";
import { ReservationsPage } from "@/features/reservations/ReservationsPage";
import { ReservationNewPage } from "@/features/reservations/ReservationNewPage";
import { ReservationDetailPage } from "@/features/reservations/ReservationDetailPage";
import { ApprovalsPage } from "@/features/approvals/ApprovalsPage";
import { FrontDeskPage } from "@/features/front-desk/FrontDeskPage";
import { AccessPage } from "@/features/access/AccessPage";
import { HousekeepingPage } from "@/features/housekeeping/HousekeepingPage";
import { MaintenancePage } from "@/features/maintenance/MaintenancePage";
import { AuditPage } from "@/features/audit/AuditPage";
import { SettingsPage } from "@/features/settings/SettingsPage";

function RequireAuth({ children }: { children: React.ReactElement }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/reservations/new" element={<ReservationNewPage />} />
          <Route path="/reservations/:id" element={<ReservationDetailPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/front-desk" element={<FrontDeskPage />} />
          <Route path="/access" element={<AccessPage />} />
          <Route path="/housekeeping" element={<HousekeepingPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
