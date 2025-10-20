import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import ApprovalWorkflows from "./pages/admin/ApprovalWorkflows";
import TaskFieldMappings from "./pages/admin/TaskFieldMappings";
import TaskManagement from "./pages/TaskManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

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
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute requiredPermission="manage_users">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/roles" element={
              <ProtectedRoute requiredPermission="manage_permissions">
                <RoleBasedAccess />
              </ProtectedRoute>
            } />
            <Route path="/admin/lookups" element={
              <ProtectedRoute requiredPermission="manage_lookups">
                <LookupManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/nomenclature" element={
              <ProtectedRoute requiredPermission="manage_nomenclature">
                <NomenclatureManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/checklists" element={
              <ProtectedRoute requiredPermission="manage_checklists">
                <ChecklistManagement />
              </ProtectedRoute>
            } />
            {/* Approval Workflows - Hidden for now (using manual approval selection) */}
            {/* <Route path="/admin/approval-workflows" element={
              <ProtectedRoute requiredPermission="manage_approval_workflows">
                <ApprovalWorkflows />
              </ProtectedRoute>
            } /> */}
            <Route path="/admin/task-mappings" element={
              <ProtectedRoute requiredPermission="manage_task_field_mappings">
                <TaskFieldMappings />
              </ProtectedRoute>
            } />
            
            {/* Batch Routes */}
            <Route path="/batch/dashboard" element={
              <ProtectedRoute requiredPermission="view_all_batches">
                <BatchDashboard />
              </ProtectedRoute>
            } />
            <Route path="/batch/master-record" element={
              <ProtectedRoute requiredPermission="create_batches">
                <MasterRecord />
              </ProtectedRoute>
            } />
            <Route path="/batch/detail/:id" element={
              <ProtectedRoute requiredPermission="view_all_batches">
                <BatchDetail />
              </ProtectedRoute>
            } />
            
            {/* Task Management */}
            <Route path="/tasks" element={
              <ProtectedRoute requiredPermission="view_all_tasks">
                <TaskManagement />
              </ProtectedRoute>
            } />
            
            {/* Inventory Management */}
            <Route path="/inventory" element={
              <ProtectedRoute requiredPermission="manage_inventory">
                <InventoryManagement />
              </ProtectedRoute>
            } />
            
            {/* Reports */}
            <Route path="/reports" element={
              <ProtectedRoute requiredPermission="view_reports">
                <Reports />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
