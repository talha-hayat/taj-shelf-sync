import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Products", url: "/products", icon: Package },
  { title: "Sales", url: "/sales", icon: ShoppingCart },
  { title: "Vendors", url: "/vendors", icon: Truck },
  { title: "Credit", url: "/credit", icon: CreditCard },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <div className="p-6 border-b border-sidebar-border">
              <h1 className="text-xl font-bold text-sidebar-foreground">Taj Autos</h1>
              <p className="text-sm text-sidebar-foreground/60">Inventory Management</p>
            </div>
            
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
