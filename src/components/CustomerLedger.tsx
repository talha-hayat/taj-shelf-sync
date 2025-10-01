import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDB, Customer, Sale, Payment } from "@/lib/db";
import { Card } from "@/components/ui/card";

interface CustomerLedgerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

interface LedgerEntry {
  date: Date;
  type: 'sale' | 'payment';
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export function CustomerLedger({ open, onOpenChange, customer }: CustomerLedgerProps) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    if (open && customer) {
      loadLedger();
    }
  }, [open, customer]);

  const loadLedger = async () => {
    if (!customer) return;

    const db = await getDB();

    // Get all sales for this customer
    const allSales = await db.getAll('sales');
    const customerSales = allSales.filter((s) => s.customerId === customer.id);

    // Get all payments for this customer
    const allPayments = await db.getAll('payments');
    const customerPayments = allPayments.filter((p) => p.customerId === customer.id);

    // Combine and sort by date
    const entries: LedgerEntry[] = [];
    let runningBalance = 0;

    // Add sales (debit)
    customerSales.forEach((sale) => {
      runningBalance += sale.totalAmount;
      entries.push({
        date: new Date(sale.date),
        type: 'sale',
        description: `Sale - ${sale.items.length} items`,
        debit: sale.totalAmount,
        credit: 0,
        balance: runningBalance,
      });
    });

    // Add payments (credit)
    customerPayments.forEach((payment) => {
      runningBalance -= payment.amount;
      entries.push({
        date: new Date(payment.date),
        type: 'payment',
        description: 'Payment Received',
        debit: 0,
        credit: payment.amount,
        balance: runningBalance,
      });
    });

    // Sort by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    setLedger(entries);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Ledger - {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer Name</p>
                <p className="font-semibold">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-semibold">{customer.contact}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="font-semibold text-destructive">
                  Rs. {customer.totalDebt.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Date</th>
                  <th className="p-3 text-left text-sm font-semibold">Description</th>
                  <th className="p-3 text-right text-sm font-semibold">Debit</th>
                  <th className="p-3 text-right text-sm font-semibold">Credit</th>
                  <th className="p-3 text-right text-sm font-semibold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  ledger.map((entry, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm">
                        {entry.date.toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">{entry.description}</td>
                      <td className="p-3 text-sm text-right">
                        {entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-sm text-right text-accent">
                        {entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">
                        Rs. {entry.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
