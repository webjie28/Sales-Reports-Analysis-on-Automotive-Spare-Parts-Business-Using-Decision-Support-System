import { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { SalesHeader } from "./components/SalesHeader";
import { AppSidebar } from "./components/AppSidebar";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { LowStockModal } from "./components/LowStockModal";
import { Toaster } from "./components/ui/sonner";
import { InventoryProvider, useInventory } from "./contexts/InventoryContext";
import { SuppliersProvider } from "./contexts/SuppliersContext";
import { SalesReportsProvider } from "./contexts/SalesReportsContext";

// Import all view components
import { DashboardView } from "./components/views/DashboardView";
import { SalesReportsView } from "./components/views/SalesReportsView";
import { PredictionsTrendsView } from "./components/views/PredictionsTrendsView";
import { RecommendationsView } from "./components/views/RecommendationsView";
import { InventoryView } from "./components/views/InventoryView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { SuppliersView } from "./components/views/SuppliersView";
import { SettingsView } from "./components/views/SettingsView";
import { NotificationsView } from "./components/views/NotificationsView";

export interface GlobalFilters {
  searchTerm: string;
  dateRange: string;
  customDateRange?: { from: Date; to: Date };
  analyticsView: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  categories: string[];
  status: string[];
  priceRange: { min: number; max: number };
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const { inventory } = useInventory();

  // Global filters state
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    searchTerm: "",
    dateRange: "october",
    customDateRange: undefined,
    analyticsView: "monthly",
    categories: [],
    status: [],
    priceRange: { min: 0, max: 1000 }
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Check for low stock items when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      const hasLowStockItems = inventory.some(item =>
        item.status === "Low Stock" || item.status === "Critical"
      );

      if (hasLowStockItems) {
        // Show modal after a brief delay to let the dashboard load
        const timer = setTimeout(() => {
          setShowLowStockModal(true);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, inventory]);

  // Listen for filter updates from components
  useEffect(() => {
    const handleFilterUpdate = (event: any) => {
      updateFilters(event.detail);
    };

    const handleViewChange = (event: any) => {
      setActiveView(event.detail);
    };

    window.addEventListener('updateFilters', handleFilterUpdate as EventListener);
    window.addEventListener('changeView', handleViewChange as EventListener);
    return () => {
      window.removeEventListener('updateFilters', handleFilterUpdate as EventListener);
      window.removeEventListener('changeView', handleViewChange as EventListener);
    };
  }, []);

  const handleViewInventory = () => {
    setActiveView("inventory");
  };

  const updateFilters = (updates: Partial<GlobalFilters>) => {
    setGlobalFilters(prev => ({ ...prev, ...updates }));
  };

  const clearFilters = () => {
    setGlobalFilters({
      searchTerm: "",
      dateRange: "october",
      customDateRange: undefined,
      analyticsView: "monthly",
      categories: [],
      status: [],
      priceRange: { min: 0, max: 1000 }
    });
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView globalFilters={globalFilters} />;
      case "sales-reports":
        return <SalesReportsView globalFilters={globalFilters} />;
      case "predictions-trends":
        return <PredictionsTrendsView globalFilters={globalFilters} />;
      case "analytics":
        return <AnalyticsView globalFilters={globalFilters} />;
      case "recommendations":
        return <RecommendationsView globalFilters={globalFilters} />;
      case "inventory":
        return <InventoryView globalFilters={globalFilters} />;
      case "suppliers":
        return <SuppliersView />;
      case "settings":
        return <SettingsView />;
      case "notifications":
        return <NotificationsView />;
      default:
        return <DashboardView globalFilters={globalFilters} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <SidebarInset className="flex-1">
            <SalesHeader
              onLogout={handleLogout}
              globalFilters={globalFilters}
              onUpdateFilters={updateFilters}
              onClearFilters={clearFilters}
              activeView={activeView}
            />
            <main className="flex-1 p-6 bg-background">
              {renderView()}
            </main>
          </SidebarInset>

          {/* Low Stock Alert Modal */}
          <LowStockModal
            isOpen={showLowStockModal}
            onClose={() => setShowLowStockModal(false)}
            onViewInventory={handleViewInventory}
          />
        </div>
      </SidebarProvider>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <SuppliersProvider>
        <SalesReportsProvider>
          <AppContent />
        </SalesReportsProvider>
      </SuppliersProvider>
    </InventoryProvider>
  );
}
