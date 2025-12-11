import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "@/hooks/useAuth";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";

import Landing from "@/pages/Landing";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";

// Initialize React Query client
const queryClient = new QueryClient();

/**
 * ProtectedRoute component ensures only authenticated users can access the route.
 */
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading placeholder while auth status is determined
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {/* Global notification systems */}
          <Toaster />
          <Sonner />

          {/* Routing */}
          <BrowserRouter>
            <AuthRedirectHandler />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
			  <Route path="/login" element={<Login />} />
			  <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-success"
                element={
                  <ProtectedRoute>
                    <PaymentSuccess />
                  </ProtectedRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
