import { Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Dashboard from './components/Dashboard';
import WithdrawalFlow from './components/WithdrawalFlow';

export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/withdraw" element={<WithdrawalFlow />} />
        </Routes>
      </div>
    </UserProvider>
  );
}
