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
import BatchDashboard from "./pages/batch/BatchDashboard";
import MasterRecord from "./pages/batch/MasterRecord";
import BatchDetail from "./pages/batch/BatchDetail";
import NomenclatureManagement from "./pages/admin/NomenclatureManagement";
import InventoryManagement from "./pages/InventoryManagement";
import ChecklistManagement from "./pages/admin/ChecklistManagement";
import TaskManagement from "./pages/TaskManagement";
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
            <Route path="/admin/nomenclature" element={<NomenclatureManagement />} />
            <Route path="/admin/checklists" element={<ChecklistManagement />} />
            <Route path="/batch/dashboard" element={<BatchDashboard />} />
            <Route path="/batch/master-record" element={<MasterRecord />} />
            <Route path="/batch/detail/:id" element={<BatchDetail />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/inventory" element={<InventoryManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
