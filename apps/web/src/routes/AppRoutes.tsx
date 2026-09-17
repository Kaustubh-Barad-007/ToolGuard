import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../layouts/AppShell';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ToolsListPage } from '../pages/ToolsListPage';
import { ToolDetailPage } from '../pages/ToolDetailPage';
import { DriftEventsPage } from '../pages/DriftEventsPage';
import { BaselinesPage } from '../pages/BaselinesPage';
import { TimelinePage } from '../pages/TimelinePage';
import { SettingsPage } from '../pages/SettingsPage';
import { DocsPage } from '../pages/DocsPage';
import { IdeConnectPage } from '../pages/IdeConnectPage';
import { SimulatorPage } from '../pages/SimulatorPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tools" element={<ToolsListPage />} />
        <Route path="/tools/:toolId" element={<ToolDetailPage />} />
        <Route path="/drift" element={<DriftEventsPage />} />
        <Route path="/integrations" element={<IdeConnectPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/baselines" element={<BaselinesPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
