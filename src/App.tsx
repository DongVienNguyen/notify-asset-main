import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { Toaster as ShadcnToaster } from "@/components/ui/toaster" // Removed
import { Toaster } from "@/components/ui/sonner"

import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute'; // Changed from import ProtectedRoute from './components/ProtectedRoute';
import { useSecureAuth } from './hooks/useSecureAuth';

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
  const { user, isLoading, error } = useSecureAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // This could be a dedicated error page
    return <div>Authentication Error: {error}</div>;
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
          <Route path="/borrow-report" element={<ProtectedRoute><BorrowReport /></ProtectedRoute>} />
          <Route path="/asset-reminders" element={<ProtectedRoute><AssetReminders /></ProtectedRoute>} />
          <Route path="/crc-reminders" element={<ProtectedRoute><CRCReminders /></ProtectedRoute>} />
          <Route path="/other-assets" element={<ProtectedRoute><OtherAssets /></ProtectedRoute>} />
          <Route path="/data-management" element={<ProtectedRoute><DataManagement /></ProtectedRoute>} />
          <Route path="/error-report" element={<ProtectedRoute><ErrorReport /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      {/* <ShadcnToaster /> */} {/* Removed */}
      <Toaster richColors />
    </QueryClientProvider>
  );
}

export default App;