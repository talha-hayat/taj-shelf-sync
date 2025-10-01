import { DollarSign, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerListProps {
  customers: Customer[];
  onRecordPayment: (customer: Customer) => void;
  onViewLedger: (customer: Customer) => void;
}

export function CustomerList({ customers, onRecordPayment, onViewLedger }: CustomerListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Customers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No credit customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.contact}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-destructive">
                        Rs. {customer.totalDebt.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onRecordPayment(customer)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Pay
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewLedger(customer)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ledger
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
