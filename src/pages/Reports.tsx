import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDB, Sale, Purchase, Payment } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesReport, setSalesReport] = useState<Sale[]>([]);
  const [purchaseReport, setPurchaseReport] = useState<Purchase[]>([]);
  const [paymentsReport, setPaymentsReport] = useState<Payment[]>([]);
  const [profitLoss, setProfitLoss] = useState({ revenue: 0, cost: 0, profit: 0 });

  useEffect(() => {
    // Set default dates (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const generateReports = async () => {
    if (!startDate || !endDate) return;

    const db = await getDB();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Sales Report
    const allSales = await db.getAll('sales');
    const filteredSales = allSales.filter((s) => {
      const saleDate = new Date(s.date);
      return saleDate >= start && saleDate <= end;
    });
    setSalesReport(filteredSales);

    // Purchase Report
    const allPurchases = await db.getAll('purchases');
    const filteredPurchases = allPurchases.filter((p) => {
      const purchaseDate = new Date(p.date);
      return purchaseDate >= start && purchaseDate <= end;
    });
    setPurchaseReport(filteredPurchases);

    // Payments Report
    const allPayments = await db.getAll('payments');
    const filteredPayments = allPayments.filter((p) => {
      const paymentDate = new Date(p.date);
      return paymentDate >= start && paymentDate <= end;
    });
    setPaymentsReport(filteredPayments);

    // Profit & Loss
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCost = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const profit = totalRevenue - totalCost;
    setProfitLoss({ revenue: totalRevenue, cost: totalCost, profit });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground">View business insights and reports</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={generateReports}>Generate Reports</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Report</TabsTrigger>
          <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-2xl font-bold">
                  Total Sales: Rs. {salesReport.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesReport.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.paymentType.toUpperCase()}</TableCell>
                        <TableCell>{sale.customerName || '-'}</TableCell>
                        <TableCell>{sale.items.length}</TableCell>
                        <TableCell>Rs. {sale.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-2xl font-bold">
                  Total Purchases: Rs. {purchaseReport.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseReport.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                        <TableCell>{purchase.vendorName}</TableCell>
                        <TableCell>{purchase.productName}</TableCell>
                        <TableCell>{purchase.quantity}</TableCell>
                        <TableCell>Rs. {purchase.totalAmount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-accent">
                        Rs. {profitLoss.revenue.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Total Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-destructive">
                        Rs. {profitLoss.cost.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Gross Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className={`text-2xl font-bold ${profitLoss.profit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        Rs. {profitLoss.profit.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections">
          <Card>
            <CardHeader>
              <CardTitle>Collections Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-2xl font-bold">
                  Total Collections: Rs. {paymentsReport.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentsReport.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                        <TableCell>{payment.customerName}</TableCell>
                        <TableCell>Rs. {payment.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
