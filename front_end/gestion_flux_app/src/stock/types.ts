// Stock Finance Types

export interface Transaction {
    id: string;
    reference: string;
    date: string;
    type: string;
    product: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    source: string;
    status: string;
  }
  
  export interface ChartData {
    date: string;
    achat: number;
    vente: number;
    marge: number;
  }
  
  export interface StockSummary {
    totalInventoryValue: number;
    totalPurchaseValue: number;
    totalSalesValue: number;
    grossProfit: number;
  }
  
  export interface CategorySummary {
    category: string;
    inventoryValue: number;
    percentage: number;
  }
  
  export interface ProductProfitability {
    id: string;
    product: string;
    category: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }