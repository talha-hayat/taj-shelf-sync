import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Vendor } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export function VendorList({ vendors, onEdit, onDelete }: VendorListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No vendors found
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.contact}</TableCell>
                    <TableCell>{vendor.address}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(vendor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(vendor)}
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
      </CardContent>
    </Card>
  );
}
