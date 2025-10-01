import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getDB, Vendor, generateId, Purchase, Product } from "@/lib/db";
import { VendorDialog } from "@/components/VendorDialog";
import { VendorList } from "@/components/VendorList";
import { PurchaseDialog } from "@/components/PurchaseDialog";
import { toast } from "sonner";

export default function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const db = await getDB();
    const allVendors = await db.getAll('vendors');
    setVendors(allVendors);
  };

  const handleSaveVendor = async (data: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => {
    const db = await getDB();
    
    if (editingVendor) {
      const updatedVendor: Vendor = {
        ...editingVendor,
        ...data,
        updatedAt: new Date(),
      };
      await db.put('vendors', updatedVendor);
      toast.success("Vendor updated successfully");
    } else {
      const newVendor: Vendor = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.add('vendors', newVendor);
      toast.success("Vendor added successfully");
    }
    
    loadVendors();
    setVendorDialogOpen(false);
    setEditingVendor(null);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorDialogOpen(true);
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
      const db = await getDB();
      await db.delete('vendors', vendor.id);
      toast.success("Vendor deleted successfully");
      loadVendors();
    }
  };

  const handleSavePurchase = async (data: {
    vendorId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    location: 'shelf' | 'store';
  }) => {
    const db = await getDB();
    
    const vendor = await db.get('vendors', data.vendorId);
    const product = await db.get('products', data.productId);
    
    if (!vendor || !product) {
      toast.error("Invalid vendor or product");
      return;
    }

    // Create purchase record
    const purchase: Purchase = {
      id: generateId(),
      date: new Date(),
      vendorId: vendor.id,
      vendorName: vendor.name,
      productId: product.id,
      productName: product.name,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.quantity * data.unitPrice,
      location: data.location,
      createdAt: new Date(),
    };

    await db.add('purchases', purchase);

    // Update product stock
    const updatedProduct: Product = {
      ...product,
      shelfStock: data.location === 'shelf' ? product.shelfStock + data.quantity : product.shelfStock,
      storeStock: data.location === 'store' ? product.storeStock + data.quantity : product.storeStock,
      updatedAt: new Date(),
    };

    await db.put('products', updatedProduct);
    toast.success("Purchase recorded successfully");
    setPurchaseDialogOpen(false);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendors & Purchases</h1>
          <p className="text-muted-foreground">Manage vendors and record purchases</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPurchaseDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Record Purchase
          </Button>
          <Button onClick={() => setVendorDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      <VendorList
        vendors={vendors}
        onEdit={handleEditVendor}
        onDelete={handleDeleteVendor}
      />

      <VendorDialog
        open={vendorDialogOpen}
        onOpenChange={(open) => {
          setVendorDialogOpen(open);
          if (!open) setEditingVendor(null);
        }}
        onSave={handleSaveVendor}
        vendor={editingVendor}
      />

      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        onSave={handleSavePurchase}
      />
    </div>
  );
}
