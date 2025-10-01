import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Vendor } from "@/lib/db";

const vendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  contact: z.string().min(1, "Contact is required"),
  address: z.string().min(1, "Address is required"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: VendorFormValues) => void;
  vendor: Vendor | null;
}

export function VendorDialog({ open, onOpenChange, onSave, vendor }: VendorDialogProps) {
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      contact: "",
      address: "",
    },
  });

  useEffect(() => {
    if (vendor) {
      form.reset({
        name: vendor.name,
        contact: vendor.contact,
        address: vendor.address,
      });
    } else {
      form.reset({
        name: "",
        contact: "",
        address: "",
      });
    }
  }, [vendor, form]);

  const onSubmit = (data: VendorFormValues) => {
    onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter vendor name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vendor address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
