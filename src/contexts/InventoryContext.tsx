import { createContext, useContext, useState, ReactNode } from "react";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  unitCost: number;
  supplier: string;
  location: string;
  status: string;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  addProduct: (product: Omit<InventoryItem, "id" | "status">) => void;
  updateProduct: (id: string, product: Partial<InventoryItem>) => void;
  deleteProduct: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const initialInventory: InventoryItem[] = [
  {
    id: "INV001",
    name: "Ceramic Brake Pads",
    category: "Brake System",
    sku: "BP-CER-001",
    currentStock: 25,
    minimumStock: 50,
    reorderPoint: 40,
    unitCost: 45.99,
    supplier: "BrakeTech Pro",
    location: "A1-B3",
    status: "Low Stock"
  },
  {
    id: "INV002", 
    name: "Oil Filter Premium",
    category: "Filters",
    sku: "OF-PREM-002",
    currentStock: 8,
    minimumStock: 30,
    reorderPoint: 25,
    unitCost: 12.50,
    supplier: "FilterMax Inc",
    location: "B2-A4",
    status: "Critical"
  },
  {
    id: "INV003",
    name: "Spark Plugs Platinum",
    category: "Engine Parts",
    sku: "SP-PLAT-003", 
    currentStock: 150,
    minimumStock: 100,
    reorderPoint: 120,
    unitCost: 8.75,
    supplier: "IgniteCore",
    location: "C1-B2",
    status: "In Stock"
  },
  {
    id: "INV004",
    name: "LED Headlight Bulbs",
    category: "Lighting",
    sku: "HL-LED-004",
    currentStock: 12,
    minimumStock: 25,
    reorderPoint: 20,
    unitCost: 28.99,
    supplier: "LightTech Solutions", 
    location: "D3-A1",
    status: "Low Stock"
  },
  {
    id: "INV005",
    name: "Air Filter Standard",
    category: "Filters",
    sku: "AF-STD-005",
    currentStock: 85,
    minimumStock: 60,
    reorderPoint: 70,
    unitCost: 15.25,
    supplier: "AirFlow Pro",
    location: "B1-C3",
    status: "In Stock"
  }
];

const getStatus = (currentStock: number, minimumStock: number, reorderPoint: number): string => {
  if (currentStock <= minimumStock * 0.3) return "Critical";
  if (currentStock <= reorderPoint) return "Low Stock";
  return "In Stock";
};

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);

  const addProduct = (product: Omit<InventoryItem, "id" | "status">) => {
    const newId = `INV${String(inventory.length + 1).padStart(3, '0')}`;
    const status = getStatus(product.currentStock, product.minimumStock, product.reorderPoint);
    
    setInventory([...inventory, { ...product, id: newId, status }]);
  };

  const updateProduct = (id: string, updates: Partial<InventoryItem>) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        // Recalculate status if stock levels changed
        if (updates.currentStock !== undefined || updates.minimumStock !== undefined || updates.reorderPoint !== undefined) {
          updated.status = getStatus(
            updated.currentStock, 
            updated.minimumStock, 
            updated.reorderPoint
          );
        }
        return updated;
      }
      return item;
    }));
  };

  const deleteProduct = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  return (
    <InventoryContext.Provider value={{ inventory, addProduct, updateProduct, deleteProduct }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
