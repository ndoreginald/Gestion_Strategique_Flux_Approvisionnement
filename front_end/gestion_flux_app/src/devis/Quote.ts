export interface Quote {
  id: string;
  quoteNumber: string;
  clientName: string;
  clientEmail: string;
  supplierName: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface QuoteStats {
  totalQuotes: number;
  totalAmount: number;
  averageAmount: number;
  statusDistribution: {
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    expired: number;
  };
  monthlyTrend: {
    month: string;
    count: number;
    amount: number;
  }[];
}