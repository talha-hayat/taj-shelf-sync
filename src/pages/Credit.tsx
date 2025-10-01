import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getDB, Customer, Payment } from "@/lib/db";
import { CustomerList } from "@/components/CustomerList";
import { PaymentDialog } from "@/components/PaymentDialog";
import { CustomerLedger } from "@/components/CustomerLedger";

export default function Credit() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    const db = await getDB();
    const allCustomers = await db.getAll('customers');
    setCustomers(allCustomers.sort((a, b) => b.totalDebt - a.totalDebt));
    setFilteredCustomers(allCustomers);
  };

  const handleRecordPayment = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentDialogOpen(true);
  };

  const handleViewLedger = (customer: Customer) => {
    setSelectedCustomer(customer);
    setLedgerDialogOpen(true);
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + c.totalDebt, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Credit Management</h1>
        <p className="text-muted-foreground">Manage customer credit and installments</p>
      </div>

      <div className="mb-6 p-6 bg-primary text-primary-foreground rounded-lg">
        <p className="text-sm mb-2">Total Outstanding</p>
        <p className="text-3xl font-bold">Rs. {totalOutstanding.toLocaleString()}</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <CustomerList
        customers={filteredCustomers}
        onRecordPayment={handleRecordPayment}
        onViewLedger={handleViewLedger}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onPaymentComplete={loadCustomers}
      />

      <CustomerLedger
        open={ledgerDialogOpen}
        onOpenChange={(open) => {
          setLedgerDialogOpen(open);
          if (!open) setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
      />
    </div>
  );
}
