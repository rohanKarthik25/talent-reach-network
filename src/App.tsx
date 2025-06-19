
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import PostedJobs from "./pages/PostedJobs";
import CreateJob from "./pages/CreateJob";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import AllApplications from "./pages/AllApplications";
import Settings from "./pages/Settings";
import ApplicationsMonitor from "./pages/ApplicationsMonitor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { user, loading } = useAuth();

  // Show loading spinner during initial authentication check
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs" 
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute allowedRoles={['candidate', 'recruiter']}>
            <Applications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs/posted" 
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <PostedJobs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs/create" 
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <CreateJob />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/all-applications" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AllApplications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications-monitor" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ApplicationsMonitor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
