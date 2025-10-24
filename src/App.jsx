import { Routes, Route, Navigate } from "react-router-dom";
import { Pages } from "./constants/routes";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetPasswordConfirm from "./pages/auth/ResetPasswordConfirm";
import Home from "./pages/Home";

import HomePage from "./pages/home/HomePage";
import PeersPage from "./pages/home/PeersPage"; 
import AgentsPage from "./pages/home/AgentsPage";
import SecretsPage from "./pages/home/SecretsPage";
import Organizations from "./pages/organizations/Organizations";
import CreateOrganization from "./pages/organizations/CreateOrganization";

import { PeerDetailsPage, FabricCADetailsPage } from "./pages/details";

import {
  Onboarding,
  LicenseAgreement,
  SetEmailPassword,
  VerifyCode,
  OnboardingSuccess,
} from "./pages/onboarding";
import "./App.css";

function App() {
  return (
    <Routes>
      {/* Redirect root to organizations */}
      <Route
        path={Pages.Root}
        element={<Navigate to={Pages.Organizations} replace />}
      />

      {/* Public routes */}
      <Route
        path={Pages.Login}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={Pages.ResetPassword}
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route
        path={Pages.ResetPasswordConfirm}
        element={
          <PublicRoute>
            <ResetPasswordConfirm />
          </PublicRoute>
        }
      />

      {/* Onboarding routes */}
      <Route
        path={Pages.Onboarding}
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.LicenseAgreement}
        element={
          <ProtectedRoute>
            <LicenseAgreement />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.SetEmailPassword}
        element={
          <ProtectedRoute>
            <SetEmailPassword />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.VerifyCode}
        element={
          <ProtectedRoute>
            <VerifyCode />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.OnboardingSuccess}
        element={
          <ProtectedRoute>
            <OnboardingSuccess />
          </ProtectedRoute>
        }
      />

      {/* Organization routes */}
      <Route
        path={Pages.Organizations}
        element={
          <ProtectedRoute>
            <Organizations />
          </ProtectedRoute>
        }
      />
      <Route
        path={Pages.CreateOrganization}
        element={
          <ProtectedRoute>
            <CreateOrganization />
          </ProtectedRoute>
        }
      />

      {/* Home routes with organization ID */}
      <Route
        path={Pages.Home}
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      >
        <Route index element={<PeersPage />} />
        <Route path="agents" element={<AgentsPage />} />
        <Route path="secrets" element={<SecretsPage />} />

        <Route 
          path="agents/:agentId/peers/:peerId" 
          element={<PeerDetailsPage />} 
        />
        <Route 
          path="agents/:agentId/ca/:caId" 
          element={<FabricCADetailsPage />} 
        />
      </Route>

      {/* 404 - redirect to organizations */}
      <Route path="*" element={<Navigate to={Pages.Organizations} replace />} />
    </Routes>
  );
}

export default App;
