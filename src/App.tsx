import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Vendors from "./pages/Vendors";
import Credit from "./pages/Credit";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { initDB } from "./lib/db";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/credit" element={<Credit />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
