import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Database schema interfaces
export interface Product {
  id: string;
  name: string;
  carModel: string;
  purchasePrice: number;
  sellingPrice: number;
  shelfStock: number;
  storeStock: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  totalAmount: number;
  paymentType: 'cash' | 'credit';
  customerId?: string;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Vendor {
  id: string;
  name: string;
  contact: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: string;
  date: Date;
  vendorId: string;
  vendorName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  location: 'shelf' | 'store';
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  address: string;
  totalDebt: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: Date;
  saleId?: string;
  createdAt: Date;
}

interface TajAutosDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-date': Date; 'by-customer': string };
  };
  vendors: {
    key: string;
    value: Vendor;
    indexes: { 'by-name': string };
  };
  purchases: {
    key: string;
    value: Purchase;
    indexes: { 'by-date': Date; 'by-vendor': string; 'by-product': string };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-name': string };
  };
  payments: {
    key: string;
    value: Payment;
    indexes: { 'by-date': Date; 'by-customer': string };
  };
}

let dbInstance: IDBPDatabase<TajAutosDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<TajAutosDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<TajAutosDB>('taj-autos-db', 1, {
    upgrade(db) {
      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id' });
        productStore.createIndex('by-name', 'name');
      }

      // Sales store
      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
        salesStore.createIndex('by-date', 'date');
        salesStore.createIndex('by-customer', 'customerId');
      }

      // Vendors store
      if (!db.objectStoreNames.contains('vendors')) {
        const vendorStore = db.createObjectStore('vendors', { keyPath: 'id' });
        vendorStore.createIndex('by-name', 'name');
      }

      // Purchases store
      if (!db.objectStoreNames.contains('purchases')) {
        const purchaseStore = db.createObjectStore('purchases', { keyPath: 'id' });
        purchaseStore.createIndex('by-date', 'date');
        purchaseStore.createIndex('by-vendor', 'vendorId');
        purchaseStore.createIndex('by-product', 'productId');
      }

      // Customers store
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('by-name', 'name');
      }

      // Payments store
      if (!db.objectStoreNames.contains('payments')) {
        const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('by-date', 'date');
        paymentStore.createIndex('by-customer', 'customerId');
      }
    },
  });

  return dbInstance;
}

export async function getDB(): Promise<IDBPDatabase<TajAutosDB>> {
  if (!dbInstance) {
    return await initDB();
  }
  return dbInstance;
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
