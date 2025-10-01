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
import { Product } from "@/lib/db";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  carModel: z.string().min(1, "Car model is required"),
  purchasePrice: z.number().min(0, "Must be 0 or greater"),
  sellingPrice: z.number().min(0, "Must be 0 or greater"),
  shelfStock: z.number().min(0, "Must be 0 or greater"),
  storeStock: z.number().min(0, "Must be 0 or greater"),
  minStockLevel: z.number().min(0, "Must be 0 or greater"),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ProductFormValues) => void;
  product: Product | null;
}

export function ProductDialog({ open, onOpenChange, onSave, product }: ProductDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      carModel: "",
      purchasePrice: 0,
      sellingPrice: 0,
      shelfStock: 0,
      storeStock: 0,
      minStockLevel: 10,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        carModel: product.carModel,
        purchasePrice: product.purchasePrice,
        sellingPrice: product.sellingPrice,
        shelfStock: product.shelfStock,
        storeStock: product.storeStock,
        minStockLevel: product.minStockLevel,
      });
    } else {
      form.reset({
        name: "",
        carModel: "",
        purchasePrice: 0,
        sellingPrice: 0,
        shelfStock: 0,
        storeStock: 0,
        minStockLevel: 10,
      });
    }
  }, [product, form]);

  const onSubmit = (data: ProductFormValues) => {
    onSave(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brake Pad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Model</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Toyota Corolla" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (Rs.)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (Rs.)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="shelfStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="storeStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
