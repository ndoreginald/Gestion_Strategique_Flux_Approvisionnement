//import { BudgetItem, BudgetAlert, Supplier, Department } from '../types/budget';

import { BudgetAlert, BudgetItem, Department, Supplier } from "./budget";

// Mock budget items
export const mockBudgetItems: BudgetItem[] = [
  {
    id: 'budget-001',
    name: 'Raw Materials Procurement Q1',
    category: 'raw-materials',
    allocated: 1250000,
    spent: 875000,
    remaining: 375000,
    status: 'approved',
    supplier: 'GlobalMaterials Inc.',
    department: 'Procurement',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2025-01-05T14:45:00Z'
  },
  {
    id: 'budget-002',
    name: 'International Logistics',
    category: 'logistics',
    allocated: 750000,
    spent: 420000,
    remaining: 330000,
    status: 'approved',
    supplier: 'Global Shipping Partners',
    department: 'Logistics',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-11-20T09:15:00Z',
    updatedAt: '2025-01-10T11:30:00Z'
  },
  {
    id: 'budget-003',
    name: 'Warehouse Operations',
    category: 'warehousing',
    allocated: 425000,
    spent: 390000,
    remaining: 35000,
    status: 'approved',
    department: 'Operations',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-11-22T14:20:00Z',
    updatedAt: '2025-01-15T16:45:00Z'
  },
  {
    id: 'budget-004',
    name: 'Manufacturing Process Optimization',
    category: 'manufacturing',
    allocated: 850000,
    spent: 325000,
    remaining: 525000,
    status: 'approved',
    department: 'Production',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-11-25T11:10:00Z',
    updatedAt: '2025-01-08T09:20:00Z'
  },
  {
    id: 'budget-005',
    name: 'Inventory Management System',
    category: 'inventory',
    allocated: 375000,
    spent: 290000,
    remaining: 85000,
    status: 'approved',
    supplier: 'InventoryTech Solutions',
    department: 'IT',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-11-28T15:30:00Z',
    updatedAt: '2025-01-12T10:15:00Z'
  },
  {
    id: 'budget-006',
    name: 'Distribution Network Expansion',
    category: 'transportation',
    allocated: 950000,
    spent: 450000,
    remaining: 500000,
    status: 'approved',
    department: 'Logistics',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-12-02T08:45:00Z',
    updatedAt: '2025-01-18T14:30:00Z'
  },
  {
    id: 'budget-007',
    name: 'Supply Chain Staff Training',
    category: 'operational',
    allocated: 180000,
    spent: 75000,
    remaining: 105000,
    status: 'approved',
    department: 'HR',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-12-05T13:20:00Z',
    updatedAt: '2025-01-20T11:05:00Z'
  },
  {
    id: 'budget-008',
    name: 'Sustainability Initiatives',
    category: 'other',
    allocated: 225000,
    spent: 95000,
    remaining: 130000,
    status: 'approved',
    department: 'Corporate Affairs',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    createdAt: '2024-12-08T10:30:00Z',
    updatedAt: '2025-01-22T15:40:00Z'
  },
  {
    id: 'budget-009',
    name: 'Q2 Production Planning',
    category: 'manufacturing',
    allocated: 1100000,
    spent: 0,
    remaining: 1100000,
    status: 'pending',
    department: 'Production',
    period: 'quarterly',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    createdAt: '2025-01-25T09:15:00Z',
    updatedAt: '2025-01-25T09:15:00Z'
  },
  {
    id: 'budget-010',
    name: 'Emergency Supply Chain Contingency',
    category: 'other',
    allocated: 300000,
    spent: 0,
    remaining: 300000,
    status: 'draft',
    department: 'Risk Management',
    period: 'annual',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    createdAt: '2025-01-28T14:20:00Z',
    updatedAt: '2025-01-28T14:20:00Z'
  }
];

// Mock budget alerts
export const mockBudgetAlerts: BudgetAlert[] = [
  {
    id: 'alert-001',
    type: 'approaching-limit',
    message: 'Warehouse Operations budget has reached 92% utilization',
    severity: 'high',
    relatedItemId: 'budget-003',
    timestamp: '2025-01-28T09:15:00Z',
    read: false
  },
  {
    id: 'alert-002',
    type: 'approval-needed',
    message: 'Q2 Production Planning budget requires approval',
    severity: 'medium',
    relatedItemId: 'budget-009',
    timestamp: '2025-01-26T14:30:00Z',
    read: false
  },
  {
    id: 'alert-003',
    type: 'under-utilized',
    message: 'Manufacturing Process Optimization budget at 38% utilization',
    severity: 'low',
    relatedItemId: 'budget-004',
    timestamp: '2025-01-25T11:45:00Z',
    read: true
  },
  {
    id: 'alert-004',
    type: 'overspend',
    message: 'Risk of overspend for Raw Materials if current rate continues',
    severity: 'medium',
    relatedItemId: 'budget-001',
    timestamp: '2025-01-24T10:20:00Z',
    read: false
  }
];

// Mock suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-001',
    name: 'GlobalMaterials Inc.',
    contactPerson: 'John Anderson',
    email: 'j.anderson@globalmat.com',
    phone: '+1-555-123-4567',
    totalBudgetAllocated: 1250000,
    totalBudgetSpent: 875000,
    performance: 87
  },
  {
    id: 'supplier-002',
    name: 'Global Shipping Partners',
    contactPerson: 'Maria Rodriguez',
    email: 'm.rodriguez@gspartners.com',
    phone: '+1-555-234-5678',
    totalBudgetAllocated: 750000,
    totalBudgetSpent: 420000,
    performance: 92
  },
  {
    id: 'supplier-003',
    name: 'InventoryTech Solutions',
    contactPerson: 'David Chen',
    email: 'd.chen@inventorytechsol.com',
    phone: '+1-555-345-6789',
    totalBudgetAllocated: 375000,
    totalBudgetSpent: 290000,
    performance: 78
  }
];

// Mock departments
export const mockDepartments: Department[] = [
  {
    id: 'dept-001',
    name: 'Procurement',
    manager: 'Sarah Johnson',
    totalBudgetAllocated: 1250000,
    totalBudgetSpent: 875000
  },
  {
    id: 'dept-002',
    name: 'Logistics',
    manager: 'Robert Kim',
    totalBudgetAllocated: 1700000,
    totalBudgetSpent: 870000
  },
  {
    id: 'dept-003',
    name: 'Operations',
    manager: 'Emily Davis',
    totalBudgetAllocated: 425000,
    totalBudgetSpent: 390000
  },
  {
    id: 'dept-004',
    name: 'Production',
    manager: 'Michael Wilson',
    totalBudgetAllocated: 1950000,
    totalBudgetSpent: 325000
  },
  {
    id: 'dept-005',
    name: 'IT',
    manager: 'Jessica Lee',
    totalBudgetAllocated: 375000,
    totalBudgetSpent: 290000
  },
  {
    id: 'dept-006',
    name: 'HR',
    manager: 'Thomas Brown',
    totalBudgetAllocated: 180000,
    totalBudgetSpent: 75000
  },
  {
    id: 'dept-007',
    name: 'Corporate Affairs',
    manager: 'Lisa Martinez',
    totalBudgetAllocated: 225000,
    totalBudgetSpent: 95000
  },
  {
    id: 'dept-008',
    name: 'Risk Management',
    manager: 'James Taylor',
    totalBudgetAllocated: 300000,
    totalBudgetSpent: 0
  }
];

// Mock chart data
export const mockMonthlySpendingData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Budget',
      data: [1250000, 1250000, 1250000, 1100000, 1100000, 1100000, 980000, 980000, 980000, 1050000, 1050000, 1050000],
      borderColor: 'rgba(25, 118, 210, 0.4)',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderWidth: 2,
      fill: true,
      pointRadius: 3
    },
    {
      label: 'Actual',
      data: [1100000, 1180000, 875000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      borderColor: 'rgba(0, 150, 136, 1)',
      backgroundColor: 'rgba(0, 150, 136, 0)',
      borderWidth: 3,
      pointRadius: 4
    }
  ]
};

export const mockCategoryBreakdownData = {
  labels: ['Raw Materials', 'Logistics', 'Warehousing', 'Manufacturing', 'Inventory', 'Transportation', 'Operational', 'Other'],
  datasets: [
    {
      label: 'Allocated',
      data: [1250000, 750000, 425000, 850000, 375000, 950000, 180000, 525000],
      backgroundColor: [
        'rgba(25, 118, 210, 0.7)',
        'rgba(0, 150, 136, 0.7)',
        'rgba(233, 30, 99, 0.7)',
        'rgba(156, 39, 176, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(33, 150, 243, 0.7)',
        'rgba(76, 175, 80, 0.7)',
        'rgba(96, 125, 139, 0.7)'
      ],
      borderWidth: 1
    }
  ]
};

export const mockBudgetStatusData = {
  labels: ['Approved', 'Pending', 'Draft', 'Rejected'],
  datasets: [
    {
      data: [8, 1, 1, 0],
      backgroundColor: [
        'rgba(76, 175, 80, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(33, 150, 243, 0.7)',
        'rgba(233, 30, 99, 0.7)'
      ],
      borderWidth: 1
    }
  ]
};