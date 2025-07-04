
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import OnboardingGuard from "@/components/OnboardingGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AdminDashboard from "./pages/AdminDashboard";
import CreateCampaign from "./pages/CreateCampaign";
import ContentStudio from "./pages/ContentStudio";
import Campaigns from "./pages/Campaigns";
import CampaignDetails from "./pages/CampaignDetails";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Reputation from "./pages/Reputation";
import Settings from "./pages/Settings";
import AdminUsers from "./pages/AdminUsers";
import UserProfile from "./pages/UserProfile";
import Signup from "./pages/Signup";
import Website from "./pages/Website";
import SignupSuccess from "./pages/SignupSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Website />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-success" element={<SignupSuccess />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Index />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Campaigns />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/create" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <CreateCampaign />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/:id" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <CampaignDetails />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/content-studio" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <ContentStudio />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Calendar />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Analytics />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reputation" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Reputation />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <Settings />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <UserProfile />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <AdminDashboard />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute>
                  <OnboardingGuard>
                    <AdminUsers />
                  </OnboardingGuard>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
