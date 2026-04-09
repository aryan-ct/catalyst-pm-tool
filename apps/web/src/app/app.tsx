import Dashboard from '@/components/dashboard/Dashboard';
import LoginForm from '@/components/forms/LoginForm';
import { AuthProvider } from '../context/AuthContext';
import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
