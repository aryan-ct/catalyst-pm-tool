import Dashboard from '@/components/dashboard/Dashboard';
import LoginForm from '@/components/forms/LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { Route, Routes } from 'react-router-dom';
import Projects from '@/components/projects/Projects';
import Resources from '@/components/resources/Resources';
import Leads from '@/components/leads/Leads';
import ProjectManagement from '@/components/project-management/ProjectManagement';
import AllocationTabs from '@/components/resource-allocation/allocation/AllocationTabs';
import ChangePassword from '@/components/settings/ChangePassword';
import AssetTracking from '@/components/asset-tracking/AssetTracking';
import MyAsset from '@/components/asset-tracking/MyAsset';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="projects" element={<Projects />} />
          <Route path="task-management" element={<ProjectManagement />} />
          <Route path="leads" element={<Leads />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resource-allocation" element={<AllocationTabs />} />
          <Route path="asset-tracking" element={<AssetTracking />} />
          <Route path="my-asset" element={<MyAsset />} />
          <Route path="settings" element={<ChangePassword />} />
        </Route>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
