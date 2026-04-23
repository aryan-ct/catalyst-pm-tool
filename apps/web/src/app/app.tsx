import Dashboard from '@/components/dashboard/Dashboard';
import LoginForm from '@/components/forms/LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { Route, Routes } from 'react-router-dom';
import Projects from '@/components/projects/Projects';
import Resources from '@/components/resources/Resources';
import Leads from '@/components/leads/Leads';
import ProjectManagement from '@/components/project-management/ProjectManagement';
import AllocationTabs from '@/components/resource-allocation/allocation/AllocationTabs';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route path="projects" element={<Projects />} />
          <Route path="project-management" element={<ProjectManagement />} />
          <Route path="leads" element={<Leads />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resource-allocation" element={<AllocationTabs />} />
        </Route>
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
