// Budget-related type definitions

export type BudgetStatus = 'approved' | 'pending' | 'rejected' | 'draft';

export type BudgetCategory = 
  | 'raw-materials' 
  | 'logistics' 
  | 'warehousing' 
  | 'manufacturing' 
  | 'inventory' 
  | 'transportation' 
  | 'operational' 
  | 'other';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'annual';

export interface BudgetItem {
  id: string;
  name: string;
  category: BudgetCategory;
  allocated: number;
  spent: number;
  remaining: number;
  status: BudgetStatus;
  supplier?: string;
  department?: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number;
  categoryBreakdown: {
    category: BudgetCategory;
    allocated: number;
    spent: number;
  }[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
  performance: number; // 0-100 score
}

export interface Department {
  id: string;
  name: string;
  manager: string;
  totalBudgetAllocated: number;
  totalBudgetSpent: number;
}

export interface BudgetAlert {
  id: string;
  type: 'overspend' | 'approaching-limit' | 'under-utilized' | 'approval-needed';
  message: string;
  severity: 'low' | 'medium' | 'high';
  relatedItemId: string;
  timestamp: string;
  read: boolean;
}