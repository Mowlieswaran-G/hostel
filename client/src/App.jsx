import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load all pages for code splitting & performance
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const RegisterPage = lazy(() => import("./pages/Register/RegisterPage"));
const ResidentDashboard = lazy(
  () => import("./pages/Resident/ResidentDashboard"),
);
const RoomBooking = lazy(() => import("./pages/Resident/RoomBooking"));
const MyBookings = lazy(() => import("./pages/Resident/MyBookings"));
const MaintenanceRequest = lazy(
  () => import("./pages/Resident/MaintenanceRequest"),
);
const OutingRequest = lazy(() => import("./pages/Resident/OutingRequest"));
const WardenDashboard = lazy(() => import("./pages/Warden/WardenDashboard"));
const BookingApproval = lazy(() => import("./pages/Warden/BookingApproval"));
const MaintenanceMgmt = lazy(() => import("./pages/Warden/MaintenanceMgmt"));
const OutingApproval = lazy(() => import("./pages/Warden/OutingApproval"));
const TechnicianDashboard = lazy(
  () => import("./pages/Technician/TechnicianDashboard"),
);
const HeatmapPage = lazy(() => import("./pages/Technician/HeatmapPage"));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(17,14,31,0.95)",
                  color: "#e8e0ff",
                  border: "1px solid rgba(105,71,255,0.25)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                },
                success: {
                  iconTheme: { primary: "#4ade80", secondary: "#0a0812" },
                },
                error: {
                  iconTheme: { primary: "#f87171", secondary: "#0a0812" },
                },
              }}
            />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Root redirect */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* ── Resident ── */}
                <Route
                  path="/resident"
                  element={
                    <ProtectedRoute allowedRoles={["resident"]}>
                      <ResidentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resident/room-booking"
                  element={
                    <ProtectedRoute allowedRoles={["resident"]}>
                      <RoomBooking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resident/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={["resident"]}>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resident/maintenance"
                  element={
                    <ProtectedRoute allowedRoles={["resident"]}>
                      <MaintenanceRequest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resident/outing"
                  element={
                    <ProtectedRoute allowedRoles={["resident"]}>
                      <OutingRequest />
                    </ProtectedRoute>
                  }
                />

                {/* ── Warden ── */}
                <Route
                  path="/warden"
                  element={
                    <ProtectedRoute allowedRoles={["warden"]}>
                      <WardenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warden/bookings"
                  element={
                    <ProtectedRoute allowedRoles={["warden"]}>
                      <BookingApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warden/maintenance"
                  element={
                    <ProtectedRoute allowedRoles={["warden"]}>
                      <MaintenanceMgmt />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/warden/outings"
                  element={
                    <ProtectedRoute allowedRoles={["warden"]}>
                      <OutingApproval />
                    </ProtectedRoute>
                  }
                />

                {/* ── Technician ── */}
                <Route
                  path="/technician"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <TechnicianDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/technician/heatmap"
                  element={
                    <ProtectedRoute allowedRoles={["technician"]}>
                      <HeatmapPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
