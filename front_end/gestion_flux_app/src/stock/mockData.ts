//import { Transaction, ChartData } from '../types/types';

import { ChartData, Transaction } from "./types";

// Mock transactions for finance table
export const mockTransactions: Transaction[] = [
  {
    id: 'TX-001',
    reference: 'ACH-20251025-001',
    date: '2025-10-25',
    type: 'Entrée',
    product: 'Smartphone XS Pro',
    category: 'Électronique',
    quantity: 50,
    unitPrice: 400,
    totalAmount: 20000,
    source: 'TechSupplier Inc.',
    status: 'Complété'
  },
  {
    id: 'TX-002',
    reference: 'VNT-20251026-001',
    date: '2025-10-26',
    type: 'Sortie',
    product: 'Smartphone XS Pro',
    category: 'Électronique',
    quantity: 15,
    unitPrice: 650,
    totalAmount: 9750,
    source: 'Client Retail',
    status: 'Complété'
  },
  {
    id: 'TX-003',
    reference: 'ACH-20251030-001',
    date: '2025-10-30',
    type: 'Entrée',
    product: 'Tshirt Classic',
    category: 'Vêtements',
    quantity: 200,
    unitPrice: 8,
    totalAmount: 1600,
    source: 'TextilePro SARL',
    status: 'Complété'
  },
  {
    id: 'TX-004',
    reference: 'VNT-20251102-001',
    date: '2025-11-02',
    type: 'Sortie',
    product: 'Tshirt Classic',
    category: 'Vêtements',
    quantity: 75,
    unitPrice: 18,
    totalAmount: 1350,
    source: 'Boutique Mode',
    status: 'Complété'
  },
  {
    id: 'TX-005',
    reference: 'ACH-20251105-001',
    date: '2025-11-05',
    type: 'Entrée',
    product: 'Coffee Premium',
    category: 'Alimentaire',
    quantity: 100,
    unitPrice: 12,
    totalAmount: 1200,
    source: 'BeanImport Co.',
    status: 'Complété'
  },
  {
    id: 'TX-006',
    reference: 'VNT-20251108-001',
    date: '2025-11-08',
    type: 'Sortie',
    product: 'Coffee Premium',
    category: 'Alimentaire',
    quantity: 40,
    unitPrice: 22,
    totalAmount: 880,
    source: 'CaféShop',
    status: 'Complété'
  },
  {
    id: 'TX-007',
    reference: 'ACH-20251112-001',
    date: '2025-11-12',
    type: 'Entrée',
    product: 'Bureau Standard',
    category: 'Mobilier',
    quantity: 25,
    unitPrice: 200,
    totalAmount: 5000,
    source: 'FurniturePro',
    status: 'Complété'
  },
  {
    id: 'TX-008',
    reference: 'VNT-20251115-001',
    date: '2025-11-15',
    type: 'Sortie',
    product: 'Bureau Standard',
    category: 'Mobilier',
    quantity: 10,
    unitPrice: 350,
    totalAmount: 3500,
    source: 'OfficeDirect',
    status: 'Complété'
  },
  {
    id: 'TX-009',
    reference: 'ACH-20251120-001',
    date: '2025-11-20',
    type: 'Entrée',
    product: 'Casque Moto GTX',
    category: 'Auto/Moto',
    quantity: 30,
    unitPrice: 120,
    totalAmount: 3600,
    source: 'MotoEquip SARL',
    status: 'Complété'
  },
  {
    id: 'TX-010',
    reference: 'VNT-20251125-001',
    date: '2025-11-25',
    type: 'Sortie',
    product: 'Casque Moto GTX',
    category: 'Auto/Moto',
    quantity: 12,
    unitPrice: 210,
    totalAmount: 2520,
    source: 'MotoShop Express',
    status: 'Complété'
  },
  {
    id: 'TX-011',
    reference: 'ACH-20251201-001',
    date: '2025-12-01',
    type: 'Entrée',
    product: 'Smartphone XS Pro',
    category: 'Électronique',
    quantity: 30,
    unitPrice: 390,
    totalAmount: 11700,
    source: 'TechSupplier Inc.',
    status: 'Complété'
  },
  {
    id: 'TX-012',
    reference: 'VNT-20251205-001',
    date: '2025-12-05',
    type: 'Sortie',
    product: 'Smartphone XS Pro',
    category: 'Électronique',
    quantity: 28,
    unitPrice: 650,
    totalAmount: 18200,
    source: 'ElectroMarket',
    status: 'Complété'
  }
];

// Mock data for inventory value chart
export const mockInventoryValue: ChartData[] = [
  { date: 'Jan', achat: 45000, vente: 65000, marge: 20000 },
  { date: 'Fév', achat: 48000, vente: 70000, marge: 22000 },
  { date: 'Mar', achat: 52000, vente: 75000, marge: 23000 },
  { date: 'Avr', achat: 50000, vente: 72000, marge: 22000 },
  { date: 'Mai', achat: 55000, vente: 80000, marge: 25000 },
  { date: 'Juin', achat: 60000, vente: 88000, marge: 28000 },
  { date: 'Juil', achat: 65000, vente: 95000, marge: 30000 },
  { date: 'Août', achat: 68000, vente: 99000, marge: 31000 },
  { date: 'Sep', achat: 64000, vente: 93000, marge: 29000 },
  { date: 'Oct', achat: 70000, vente: 102000, marge: 32000 },
  { date: 'Nov', achat: 75000, vente: 110000, marge: 35000 },
  { date: 'Déc', achat: 82000, vente: 120000, marge: 38000 }
];

// Mock data for profitability analysis
export const mockProfitability = {
  categories: [
    { name: 'Électronique', revenue: 120000, cost: 96000, profit: 24000, margin: 20 },
    { name: 'Vêtements', revenue: 85000, cost: 45000, profit: 40000, margin: 47.1 },
    { name: 'Alimentaire', revenue: 45000, cost: 32000, profit: 13000, margin: 28.9 },
    { name: 'Mobilier', revenue: 65000, cost: 42000, profit: 23000, margin: 35.4 },
    { name: 'Auto/Moto', revenue: 35000, cost: 25000, profit: 10000, margin: 28.6 }
  ],
  products: [
    { id: 1, product: 'Smartphone XS Pro', category: 'Électronique', revenue: 75000, cost: 60000, profit: 15000, margin: 20 },
    { id: 2, product: 'Tshirt Classic', category: 'Vêtements', revenue: 45000, cost: 25000, profit: 20000, margin: 44.4 },
    { id: 3, product: 'Coffee Premium', category: 'Alimentaire', revenue: 32000, cost: 18000, profit: 14000, margin: 43.8 },
    { id: 4, product: 'Bureau Standard', category: 'Mobilier', revenue: 28000, cost: 19000, profit: 9000, margin: 32.1 },
    { id: 5, product: 'Casque Moto GTX', category: 'Auto/Moto', revenue: 35000, cost: 22000, profit: 13000, margin: 37.1 }
  ]
};