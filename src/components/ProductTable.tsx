import { useState } from "react";
import { Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onTransfer: (product: Product, from: 'shelf' | 'store', quantity: number) => void;
}

export function ProductTable({ products, onEdit, onDelete, onTransfer }: ProductTableProps) {
  const [transferDialog, setTransferDialog] = useState<{ open: boolean; product: Product | null; from: 'shelf' | 'store' }>({
    open: false,
    product: null,
    from: 'shelf',
  });
  const [transferQty, setTransferQty] = useState(0);

  const handleTransferSubmit = () => {
    if (transferDialog.product) {
      onTransfer(transferDialog.product, transferDialog.from, transferQty);
      setTransferDialog({ open: false, product: null, from: 'shelf' });
      setTransferQty(0);
    }
  };

  const getTotalStock = (product: Product) => product.shelfStock + product.storeStock;
  const isLowStock = (product: Product) => getTotalStock(product) < product.minStockLevel;

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Car Model</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Shelf Stock</TableHead>
              <TableHead>Store Stock</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Min Level</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.carModel}</TableCell>
                  <TableCell>Rs. {product.purchasePrice}</TableCell>
                  <TableCell>Rs. {product.sellingPrice}</TableCell>
                  <TableCell>{product.shelfStock}</TableCell>
                  <TableCell>{product.storeStock}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTotalStock(product)}
                      {isLowStock(product) && (
                        <Badge variant="destructive" className="text-xs">Low</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.minStockLevel}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTransferDialog({ open: true, product, from: 'shelf' })}
                      >
                        <ArrowRightLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={transferDialog.open} onOpenChange={(open) => setTransferDialog({ ...transferDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Stock</DialogTitle>
          </DialogHeader>
          {transferDialog.product && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Product: <span className="font-medium text-foreground">{transferDialog.product.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Shelf Stock: {transferDialog.product.shelfStock} | Store Stock: {transferDialog.product.storeStock}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Transfer From</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={transferDialog.from === 'shelf' ? 'default' : 'outline'}
                    onClick={() => setTransferDialog({ ...transferDialog, from: 'shelf' })}
                  >
                    Shelf → Store
                  </Button>
                  <Button
                    type="button"
                    variant={transferDialog.from === 'store' ? 'default' : 'outline'}
                    onClick={() => setTransferDialog({ ...transferDialog, from: 'store' })}
                  >
                    Store → Shelf
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTransferDialog({ open: false, product: null, from: 'shelf' })}>
                  Cancel
                </Button>
                <Button onClick={handleTransferSubmit}>Transfer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
