import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/sonner"

import { ProtectedRoute } from './components/ProtectedRoute';
import { useSecureAuth } from './hooks/useSecureAuth';
import { isAdmin, isNqOrAdmin } from './utils/permissions';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import AssetEntry from './pages/AssetEntry';
import DailyReport from './pages/DailyReport';
import BorrowReport from './pages/BorrowReport';
import AssetReminders from './pages/AssetReminders';
import CRCReminders from './pages/CRCReminders';
import OtherAssets from './pages/OtherAssets';
import DataManagement from './pages/DataManagement';
import ErrorReport from './pages/ErrorReport';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function App() {
  const { loading } = useSecureAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/asset-entry" element={<ProtectedRoute><AssetEntry /></ProtectedRoute>} />
          <Route path="/daily-report" element={<ProtectedRoute><DailyReport /></ProtectedRoute>} />
          <Route path="/borrow-report" element={<ProtectedRoute isAuthorized={isNqOrAdmin}><BorrowReport /></ProtectedRoute>} />
          <Route path="/asset-reminders" element={<ProtectedRoute isAuthorized={isNqOrAdmin}><AssetReminders /></ProtectedRoute>} />
          <Route path="/crc-reminders" element={<ProtectedRoute isAuthorized={isNqOrAdmin}><CRCReminders /></ProtectedRoute>} />
          <Route path="/other-assets" element={<ProtectedRoute isAuthorized={isNqOrAdmin}><OtherAssets /></ProtectedRoute>} />
          <Route path="/data-management" element={<ProtectedRoute isAuthorized={isAdmin}><DataManagement /></ProtectedRoute>} />
          <Route path="/error-report" element={<ProtectedRoute><ErrorReport /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster richColors />
    </QueryClientProvider>
  );
}

export default App;