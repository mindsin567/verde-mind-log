import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import MoodLog from "./pages/MoodLog";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mood" element={<MoodLog />} />
            <Route path="diary" element={<div className="p-8 text-center text-muted-foreground">Diary page coming soon! 📝</div>} />
            <Route path="chat" element={<div className="p-8 text-center text-muted-foreground">AI Chat coming soon! 🤖</div>} />
            <Route path="summary" element={<div className="p-8 text-center text-muted-foreground">Summary page coming soon! 📊</div>} />
            <Route path="profile" element={<div className="p-8 text-center text-muted-foreground">Profile page coming soon! 👤</div>} />
            <Route path="settings" element={<div className="p-8 text-center text-muted-foreground">Settings page coming soon! ⚙️</div>} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
