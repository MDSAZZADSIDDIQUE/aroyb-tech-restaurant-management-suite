// Core TypeScript types for Aroyb PrintServe

// ============== ENUMS ==============

export type PrinterType = 'kitchen' | 'front' | 'label';
export type PrinterStatus = 'online' | 'offline' | 'paper_low' | 'error';
export type PrintJobType = 'docket' | 'receipt' | 'label' | 'allergen';
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'failed';
export type Channel = 'web' | 'app' | 'qr' | 'pos';
export type FulfillmentType = 'dine-in' | 'collection' | 'delivery';
export type LabelSize = 'small' | 'medium' | 'large';
export type StationId = 'grill' | 'fry' | 'pizza' | 'bar' | 'prep';

// ============== BRANCH ==============

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  vatNumber?: string;
  logoUrl?: string;
}

// ============== PRINTER ==============

export interface Printer {
  id: string;
  branchId: string;
  name: string;
  model: string;
  type: PrinterType;
  status: PrinterStatus;
  lastSeen: string;
  ipAddress?: string;
}

// ============== TEMPLATE ==============

export interface ReceiptTemplate {
  headerLines: string[];
  footerText: string;
  showVat: boolean;
  fontScale: number;
  showLogo: boolean;
}

export interface DocketTemplate {
  groupByStation: boolean;
  showNotesTop: boolean;
  copyCount: number;
  showAllergenBanner: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface LabelTemplate {
  sizePreset: LabelSize;
  showChecklist: boolean;
  showIcons: boolean;
  showAllergenWarning: boolean;
}

export interface Template {
  branchId: string;
  receipt: ReceiptTemplate;
  docket: DocketTemplate;
  labels: LabelTemplate;
}

// ============== ORDER ==============

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes?: string;
  station: StationId;
  allergens?: string[];
  price: number;
}

export interface OrderTotals {
  subtotal: number;
  fees: number;
  tip: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  channel: Channel;
  fulfillmentType: FulfillmentType;
  customerName: string;
  customerPhone?: string;
  address?: string;
  tableNumber?: string;
  items: OrderItem[];
  customerNotes?: string;
  allergenNotes?: string;
  totals: OrderTotals;
  paymentMethod: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}

// ============== PRINT JOB ==============

export interface PrintJob {
  id: string;
  type: PrintJobType;
  branchId: string;
  printerId: string;
  orderId: string;
  payload: Record<string, unknown>;
  status: PrintJobStatus;
  error?: string;
  createdAt: string;
  attemptedAt?: string;
  completedAt?: string;
}

// ============== PACKING CHECKLIST ==============

export interface PackingCheckItem {
  id: string;
  text: string;
  category: 'item' | 'extra' | 'handling' | 'verification';
  isHighRisk?: boolean;
  checked?: boolean;
}

export interface PackingChecklist {
  orderId: string;
  items: PackingCheckItem[];
  generatedAt: string;
}

// ============== ISSUE LOG ==============

export interface IssueLog {
  id: string;
  printerId?: string;
  symptom: string;
  answers: Record<string, string>;
  result: DiagnosisResult;
  createdAt: string;
}

export interface DiagnosisResult {
  causes: { cause: string; likelihood: number }[];
  steps: string[];
  escalation?: string;
  confidence: number;
  reasoning: string;
}

// ============== LABEL FORMATTING ==============

export interface FormattedLabel {
  orderInfo: string;
  itemName: string;
  modifiers: string[];
  checklist: string[];
  handlingIcons: string[];
  allergenWarning?: string;
}

// ============== APP STATE ==============

export interface PrintServeState {
  branches: Branch[];
  printers: Printer[];
  templates: Template[];
  orders: Order[];
  printJobs: PrintJob[];
  issueLogs: IssueLog[];
  activeBranchId: string;
}
