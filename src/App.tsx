import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import LookupManagement from "./pages/admin/LookupManagement";
import RoleBasedAccess from "./pages/admin/RoleBasedAccess";
import CloningChecklist from "./pages/batch/CloningChecklist";
import TransplantLog from "./pages/batch/TransplantLog";
import MortalityRecord from "./pages/batch/MortalityRecord";
import MasterRecord from "./pages/batch/MasterRecord";
import SOFManagement from "./pages/admin/SOFManagement";
import NotFound from "./pages/NotFound";

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
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/roles" element={<RoleBasedAccess />} />
            <Route path="/admin/lookups" element={<LookupManagement />} />
            <Route path="/admin/sofs" element={<SOFManagement />} />
            <Route path="/batch/cloning-checklist" element={<CloningChecklist />} />
            <Route path="/batch/transplant-log" element={<TransplantLog />} />
            <Route path="/batch/mortality" element={<MortalityRecord />} />
            <Route path="/batch/master-record" element={<MasterRecord />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
