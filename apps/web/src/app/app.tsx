import Dashboard from '@/components/dashboard/Dashboard';
import LoginForm from '@/components/forms/LoginForm';

import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </div>
  );
}

export default App;
