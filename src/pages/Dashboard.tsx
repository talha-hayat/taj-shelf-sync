import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { getDB, Product } from "@/lib/db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todaySales: 0,
    totalOutstanding: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const db = await getDB();

    // Get all products
    const products = await db.getAll('products');
    const lowStock = products.filter(
      (p) => p.shelfStock + p.storeStock < p.minStockLevel
    );

    // Get today's sales
    const sales = await db.getAll('sales');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter((s) => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Get outstanding credit
    const customers = await db.getAll('customers');
    const totalOutstanding = customers.reduce((sum, c) => sum + c.totalDebt, 0);

    setStats({
      totalProducts: products.length,
      lowStockProducts: lowStock.length,
      todaySales: todayTotal,
      totalOutstanding,
    });

    setLowStockItems(lowStock.slice(0, 5));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to Taj Autos Management System</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Products in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Products need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Sales made today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Credit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {stats.totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total receivables</p>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Low Stock Alert</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {lowStockItems.map((item) => (
                <div key={item.id} className="text-sm">
                  <span className="font-medium">{item.name}</span> - Total Stock:{" "}
                  {item.shelfStock + item.storeStock} (Min: {item.minStockLevel})
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
