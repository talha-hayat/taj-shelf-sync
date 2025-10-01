import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getDB, Vendor, Product } from "@/lib/db";
import { toast } from "sonner";

interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    vendorId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    location: 'shelf' | 'store';
  }) => void;
}

export function PurchaseDialog({ open, onOpenChange, onSave }: PurchaseDialogProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [location, setLocation] = useState<'shelf' | 'store'>('store');

  useEffect(() => {
    if (open) {
      loadData();
      resetForm();
    }
  }, [open]);

  const loadData = async () => {
    const db = await getDB();
    const allVendors = await db.getAll('vendors');
    const allProducts = await db.getAll('products');
    setVendors(allVendors);
    setProducts(allProducts);
  };

  const resetForm = () => {
    setVendorId("");
    setProductId("");
    setQuantity(0);
    setUnitPrice(0);
    setLocation('store');
  };

  const handleSubmit = () => {
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (unitPrice <= 0) {
      toast.error("Unit price must be greater than 0");
      return;
    }

    onSave({
      vendorId,
      productId,
      quantity,
      unitPrice,
      location,
    });

    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Unit Price (Rs.)</Label>
              <Input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label>Add to Location</Label>
            <RadioGroup value={location} onValueChange={(value: 'shelf' | 'store') => setLocation(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shelf" id="shelf" />
                <Label htmlFor="shelf">Shelf Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="store" id="store" />
                <Label htmlFor="store">Store Stock</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium">Total Amount</p>
            <p className="text-2xl font-bold">Rs. {(quantity * unitPrice).toLocaleString()}</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Record Purchase</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
