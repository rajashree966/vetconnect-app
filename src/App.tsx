import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import VetLogin from "./pages/vet/VetLogin";
import VetRegister from "./pages/vet/VetRegister";
import VetForgotPassword from "./pages/vet/ForgotPassword";
import VetResetPassword from "./pages/vet/ResetPassword";
import VetDashboard from "./pages/vet/VetDashboard";
import VetProfile from "./pages/vet/VetProfile";
import ConsultationVideosVet from "./pages/vet/ConsultationVideos";
import OwnerLogin from "./pages/owner/OwnerLogin";
import OwnerRegister from "./pages/owner/OwnerRegister";
import OwnerForgotPassword from "./pages/owner/ForgotPassword";
import OwnerResetPassword from "./pages/owner/ResetPassword";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerProfile from "./pages/owner/OwnerProfile";
import PetProfile from "./pages/owner/PetProfile";
import HealthRecords from "./pages/owner/HealthRecords";
import HealthStatistics from "./pages/owner/HealthStatistics";
import VaccinationSchedule from "./pages/owner/VaccinationSchedule";
import ConsultationVideosOwner from "./pages/owner/ConsultationVideos";
import Resources from "./pages/owner/Resources";
import PrescriptionsOwner from "./pages/owner/Prescriptions";
import PrescriptionsVet from "./pages/vet/Prescriptions";
import NotificationPreferences from "./pages/owner/NotificationPreferences";
import Contact from "./pages/Contact";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/vet/login" element={<VetLogin />} />
            <Route path="/vet/register" element={<VetRegister />} />
            <Route path="/vet/forgot-password" element={<VetForgotPassword />} />
            <Route path="/vet/reset-password" element={<VetResetPassword />} />
            <Route path="/vet/dashboard" element={<VetDashboard />} />
            <Route path="/vet/profile" element={<VetProfile />} />
            <Route path="/vet/consultation-videos" element={<ConsultationVideosVet />} />
            <Route path="/vet/prescriptions" element={<PrescriptionsVet />} />
            <Route path="/owner/login" element={<OwnerLogin />} />
            <Route path="/owner/register" element={<OwnerRegister />} />
            <Route path="/owner/forgot-password" element={<OwnerForgotPassword />} />
            <Route path="/owner/reset-password" element={<OwnerResetPassword />} />
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />
            <Route path="/owner/pet-profile" element={<PetProfile />} />
            <Route path="/owner/health-records" element={<HealthRecords />} />
            <Route path="/owner/health-statistics" element={<HealthStatistics />} />
            <Route path="/owner/vaccination-schedule" element={<VaccinationSchedule />} />
            <Route path="/owner/consultation-videos" element={<ConsultationVideosOwner />} />
            <Route path="/owner/resources" element={<Resources />} />
            <Route path="/owner/prescriptions" element={<PrescriptionsOwner />} />
            <Route path="/owner/notification-preferences" element={<NotificationPreferences />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
