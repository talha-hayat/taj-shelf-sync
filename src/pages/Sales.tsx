import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SaleDialog } from "@/components/SaleDialog";
import { SalesHistory } from "@/components/SalesHistory";
import { Sale, getDB } from "@/lib/db";

export default function Sales() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const db = await getDB();
    const allSales = await db.getAll('sales');
    setSales(allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Calculate today's total
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = allSales.filter((s) => {
      const saleDate = new Date(s.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    const total = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    setTodayTotal(total);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">Record and manage sales</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {todayTotal.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.filter((s) => s.paymentType === 'credit').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <SalesHistory sales={sales} onRefresh={loadSales} />

      <SaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaleComplete={loadSales}
      />
    </div>
  );
}
