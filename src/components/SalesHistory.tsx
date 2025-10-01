import { Sale } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SalesHistoryProps {
  sales: Sale[];
  onRefresh: () => void;
}

export function SalesHistory({ sales }: SalesHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sales.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No sales recorded yet</p>
          ) : (
            sales.slice(0, 10).map((sale) => (
              <div key={sale.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium">
                      {new Date(sale.date).toLocaleString()}
                    </p>
                    <Badge variant={sale.paymentType === 'cash' ? 'default' : 'secondary'}>
                      {sale.paymentType.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sale.items.map((item, i) => (
                      <p key={i}>
                        {item.productName} x {item.quantity}
                      </p>
                    ))}
                  </div>
                  {sale.customerName && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Customer: {sale.customerName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">Rs. {sale.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{sale.items.length} items</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
