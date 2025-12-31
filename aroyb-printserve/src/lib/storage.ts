// Storage utilities for PrintServe - localStorage persistence

import type { Branch, Printer, Template, Order, PrintJob, IssueLog } from '@/types';
import branchesData from '@/data/branches.json';
import printersData from '@/data/printers.json';
import templatesData from '@/data/templates.json';
import ordersData from '@/data/orders.json';
import printJobsData from '@/data/print-jobs.json';

const STORAGE_KEYS = {
  branches: 'ps_branches',
  printers: 'ps_printers',
  templates: 'ps_templates',
  orders: 'ps_orders',
  printJobs: 'ps_print_jobs',
  issueLogs: 'ps_issue_logs',
  activeBranch: 'ps_active_branch',
  initialized: 'ps_initialized',
};

// ============== INITIALIZATION ==============

export function initializeStorage(): void {
  if (typeof window === 'undefined') return;
  
  const isInitialized = localStorage.getItem(STORAGE_KEYS.initialized);
  if (isInitialized) return;
  
  localStorage.setItem(STORAGE_KEYS.branches, JSON.stringify(branchesData));
  localStorage.setItem(STORAGE_KEYS.printers, JSON.stringify(printersData));
  localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templatesData));
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(ordersData));
  localStorage.setItem(STORAGE_KEYS.printJobs, JSON.stringify(printJobsData));
  localStorage.setItem(STORAGE_KEYS.issueLogs, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.activeBranch, 'branch-camden');
  localStorage.setItem(STORAGE_KEYS.initialized, 'true');
}

export function resetStorage(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
}

// ============== BRANCHES ==============

export function getBranches(): Branch[] {
  if (typeof window === 'undefined') return branchesData as unknown as Branch[];
  const stored = localStorage.getItem(STORAGE_KEYS.branches);
  return stored ? JSON.parse(stored) : branchesData as unknown as Branch[];
}

export function getActiveBranchId(): string {
  if (typeof window === 'undefined') return 'branch-camden';
  return localStorage.getItem(STORAGE_KEYS.activeBranch) || 'branch-camden';
}

export function setActiveBranchId(branchId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.activeBranch, branchId);
}

export function getActiveBranch(): Branch | undefined {
  const branches = getBranches();
  return branches.find(b => b.id === getActiveBranchId());
}

// ============== PRINTERS ==============

export function getPrinters(): Printer[] {
  if (typeof window === 'undefined') return printersData as unknown as Printer[];
  const stored = localStorage.getItem(STORAGE_KEYS.printers);
  return stored ? JSON.parse(stored) : printersData as unknown as Printer[];
}

export function getPrintersByBranch(branchId: string): Printer[] {
  return getPrinters().filter(p => p.branchId === branchId);
}

export function updatePrinter(printerId: string, updates: Partial<Printer>): void {
  const printers = getPrinters();
  const index = printers.findIndex(p => p.id === printerId);
  if (index === -1) return;
  printers[index] = { ...printers[index], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.printers, JSON.stringify(printers));
  }
}

// ============== TEMPLATES ==============

export function getTemplates(): Template[] {
  if (typeof window === 'undefined') return templatesData as unknown as Template[];
  const stored = localStorage.getItem(STORAGE_KEYS.templates);
  return stored ? JSON.parse(stored) : templatesData as unknown as Template[];
}

export function getTemplateByBranch(branchId: string): Template | undefined {
  return getTemplates().find(t => t.branchId === branchId);
}

export function updateTemplate(branchId: string, updates: Partial<Template>): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.branchId === branchId);
  if (index === -1) return;
  templates[index] = { ...templates[index], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
  }
}

// ============== ORDERS ==============

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return ordersData as unknown as Order[];
  const stored = localStorage.getItem(STORAGE_KEYS.orders);
  return stored ? JSON.parse(stored) : ordersData as unknown as Order[];
}

export function getOrderById(orderId: string): Order | undefined {
  return getOrders().find(o => o.id === orderId);
}

// ============== PRINT JOBS ==============

export function getPrintJobs(): PrintJob[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.printJobs);
  return stored ? JSON.parse(stored) : [];
}

export function addPrintJob(job: PrintJob): void {
  const jobs = getPrintJobs();
  jobs.push(job);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.printJobs, JSON.stringify(jobs));
  }
}

export function updatePrintJob(jobId: string, updates: Partial<PrintJob>): void {
  const jobs = getPrintJobs();
  const index = jobs.findIndex(j => j.id === jobId);
  if (index === -1) return;
  jobs[index] = { ...jobs[index], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.printJobs, JSON.stringify(jobs));
  }
}

export function getPendingJobs(): PrintJob[] {
  return getPrintJobs().filter(j => j.status === 'pending');
}

// ============== ISSUE LOGS ==============

export function getIssueLogs(): IssueLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEYS.issueLogs);
  return stored ? JSON.parse(stored) : [];
}

export function addIssueLog(log: IssueLog): void {
  const logs = getIssueLogs();
  logs.push(log);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.issueLogs, JSON.stringify(logs));
  }
}
