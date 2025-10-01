import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getDB, Product, generateId, Sale, SaleItem, Customer } from "@/lib/db";
import { Search, Plus, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleComplete: () => void;
}

export function SaleDialog({ open, onOpenChange, onSaleComplete }: SaleDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash');
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    if (open) {
      loadProducts();
      resetForm();
    }
  }, [open]);

  const loadProducts = async () => {
    const db = await getDB();
    const allProducts = await db.getAll('products');
    setProducts(allProducts);
  };

  const resetForm = () => {
    setSaleItems([]);
    setPaymentType('cash');
    setCustomerName("");
    setCustomerContact("");
    setCustomerAddress("");
    setSearchTerm("");
    setSelectedProduct(null);
    setQuantity(1);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = () => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const availableStock = selectedProduct.shelfStock + selectedProduct.storeStock;
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} units available`);
      return;
    }

    const item: SaleItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      price: selectedProduct.sellingPrice,
      total: quantity * selectedProduct.sellingPrice,
    };

    setSaleItems([...saleItems, item]);
    setSelectedProduct(null);
    setSearchTerm("");
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const completeSale = async () => {
    if (saleItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    if (paymentType === 'credit') {
      if (!customerName || !customerContact) {
        toast.error("Customer name and contact are required for credit sales");
        return;
      }
    }

    const db = await getDB();

    try {
      // Create sale record
      const sale: Sale = {
        id: generateId(),
        date: new Date(),
        items: saleItems,
        totalAmount: getTotalAmount(),
        paymentType,
        customerId: paymentType === 'credit' ? generateId() : undefined,
        customerName: paymentType === 'credit' ? customerName : undefined,
        customerContact: paymentType === 'credit' ? customerContact : undefined,
        customerAddress: paymentType === 'credit' ? customerAddress : undefined,
        createdAt: new Date(),
      };

      await db.add('sales', sale);

      // Update product stocks
      for (const item of saleItems) {
        const product = await db.get('products', item.productId);
        if (product) {
          let remainingQty = item.quantity;
          
          // Deduct from shelf first
          if (product.shelfStock >= remainingQty) {
            product.shelfStock -= remainingQty;
          } else {
            remainingQty -= product.shelfStock;
            product.shelfStock = 0;
            product.storeStock -= remainingQty;
          }

          product.updatedAt = new Date();
          await db.put('products', product);
        }
      }

      // Handle credit customer
      if (paymentType === 'credit' && sale.customerId) {
        const existingCustomer = await db.get('customers', sale.customerId);
        if (existingCustomer) {
          existingCustomer.totalDebt += sale.totalAmount;
          existingCustomer.updatedAt = new Date();
          await db.put('customers', existingCustomer);
        } else {
          const newCustomer: Customer = {
            id: sale.customerId,
            name: customerName,
            contact: customerContact,
            address: customerAddress,
            totalDebt: sale.totalAmount,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await db.add('customers', newCustomer);
        }
      }

      toast.success("Sale completed successfully");
      printInvoice(sale);
      onSaleComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Error completing sale:", error);
      toast.error("Failed to complete sale");
    }
  };

  const printInvoice = (sale: Sale) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${sale.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; margin-top: 20px; font-size: 18px; font-weight: bold; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Taj Autos</h1>
          <p>Meri Ruby Plaza, Sadar, Karachi</p>
        </div>
        
        <div class="details">
          <p><strong>Invoice #:</strong> ${sale.id}</p>
          <p><strong>Date:</strong> ${new Date(sale.date).toLocaleString()}</p>
          <p><strong>Payment Type:</strong> ${sale.paymentType.toUpperCase()}</p>
          ${sale.customerName ? `<p><strong>Customer:</strong> ${sale.customerName}</p>` : ''}
          ${sale.customerContact ? `<p><strong>Contact:</strong> ${sale.customerContact}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items.map(item => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>Rs. ${item.price}</td>
                <td>Rs. ${item.total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          Grand Total: Rs. ${sale.totalAmount.toLocaleString()}
        </div>

        <button onclick="window.print()">Print</button>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label>Select Product</Label>
                <Select
                  value={selectedProduct?.id || ""}
                  onValueChange={(value) => {
                    const product = products.find((p) => p.id === value);
                    setSelectedProduct(product || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select product..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - Stock: {product.shelfStock + product.storeStock}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {selectedProduct && (
              <div className="text-sm text-muted-foreground">
                Available: {selectedProduct.shelfStock + selectedProduct.storeStock} units | 
                Price: Rs. {selectedProduct.sellingPrice}
              </div>
            )}
          </div>

          {/* Sale Items */}
          {saleItems.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-4">Items</h3>
              <div className="space-y-2">
                {saleItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x Rs. {item.price} = Rs. {item.total}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total: Rs. {getTotalAmount().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Type */}
          <div className="space-y-4">
            <Label>Payment Type</Label>
            <RadioGroup value={paymentType} onValueChange={(value: 'cash' | 'credit') => setPaymentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash Sale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credit" id="credit" />
                <Label htmlFor="credit">Credit Sale (Udhaar)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Customer Details (for credit) */}
          {paymentType === 'credit' && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label>Contact *</Label>
                  <Input
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Customer address"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={completeSale} disabled={saleItems.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Complete Sale
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
