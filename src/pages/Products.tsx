import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { getDB, Product, generateId } from "@/lib/db";
import { ProductDialog } from "@/components/ProductDialog";
import { ProductTable } from "@/components/ProductTable";
import { toast } from "sonner";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.carModel.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const loadProducts = async () => {
    const db = await getDB();
    const allProducts = await db.getAll('products');
    setProducts(allProducts);
    setFilteredProducts(allProducts);
  };

  const handleSave = async (data: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    const db = await getDB();
    
    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        ...data,
        updatedAt: new Date(),
      };
      await db.put('products', updatedProduct);
      toast.success("Product updated successfully");
    } else {
      const newProduct: Product = {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.add('products', newProduct);
      toast.success("Product added successfully");
    }
    
    loadProducts();
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      const db = await getDB();
      await db.delete('products', product.id);
      toast.success("Product deleted successfully");
      loadProducts();
    }
  };

  const handleTransfer = async (product: Product, from: 'shelf' | 'store', quantity: number) => {
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    const sourceStock = from === 'shelf' ? product.shelfStock : product.storeStock;
    if (quantity > sourceStock) {
      toast.error(`Not enough stock in ${from}`);
      return;
    }

    const db = await getDB();
    const updatedProduct: Product = {
      ...product,
      shelfStock: from === 'shelf' ? product.shelfStock - quantity : product.shelfStock + quantity,
      storeStock: from === 'store' ? product.storeStock - quantity : product.storeStock + quantity,
      updatedAt: new Date(),
    };

    await db.put('products', updatedProduct);
    toast.success(`Transferred ${quantity} units from ${from} to ${from === 'shelf' ? 'store' : 'shelf'}`);
    loadProducts();
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your inventory</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by product name, ID, or car model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTransfer={handleTransfer}
      />

      <ProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        onSave={handleSave}
        product={editingProduct}
      />
    </div>
  );
}
