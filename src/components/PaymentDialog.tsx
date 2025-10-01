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
import { getDB, Customer, Payment, generateId } from "@/lib/db";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onPaymentComplete: () => void;
}

export function PaymentDialog({ open, onOpenChange, customer, onPaymentComplete }: PaymentDialogProps) {
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (!open) {
      setAmount(0);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!customer) return;

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (amount > customer.totalDebt) {
      toast.error("Amount cannot be greater than outstanding balance");
      return;
    }

    const db = await getDB();

    // Record payment
    const payment: Payment = {
      id: generateId(),
      customerId: customer.id,
      customerName: customer.name,
      amount,
      date: new Date(),
      createdAt: new Date(),
    };

    await db.add('payments', payment);

    // Update customer debt
    const updatedCustomer: Customer = {
      ...customer,
      totalDebt: customer.totalDebt - amount,
      updatedAt: new Date(),
    };

    await db.put('customers', updatedCustomer);

    toast.success(`Payment of Rs. ${amount} recorded successfully`);
    onPaymentComplete();
    onOpenChange(false);
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Customer</p>
            <p className="text-lg font-semibold">{customer.name}</p>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold text-destructive">
              Rs. {customer.totalDebt.toLocaleString()}
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Payment Amount (Rs.)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              max={customer.totalDebt}
            />
          </div>

          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground">Remaining Balance After Payment</p>
            <p className="text-xl font-bold">
              Rs. {Math.max(0, customer.totalDebt - amount).toLocaleString()}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Record Payment</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
