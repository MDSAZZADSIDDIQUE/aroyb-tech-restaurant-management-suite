// Core TypeScript types for Aroyb KitchenScreen KDS

// ============== ENUMS ==============

export type TicketStatus = 'new' | 'in_progress' | 'ready' | 'completed' | 'recalled';
export type Channel = 'web' | 'app' | 'qr' | 'pos';
export type FulfillmentType = 'dine-in' | 'collection' | 'delivery';
export type StationId = 'grill' | 'fry' | 'pizza' | 'bar' | 'prep';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type RemakeReason = 'wrong_modifier' | 'missing_item' | 'allergy_missed' | 'overcooked' | 'undercooked' | 'wrong_item' | 'other';
export type HandoffMethod = 'served' | 'pickup' | 'delivery';

// ============== STATION ==============

export interface Station {
  id: StationId;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
  bumpDestination: 'ready' | 'completed';
  active: boolean;
}

// ============== MENU ITEM ==============

export interface MenuItem {
  id: string;
  name: string;
  station: StationId;
  baseCookMinutes: number;
  complexityBase: number; // 1-5
  category: string;
}

// ============== TICKET ITEM ==============

export interface Modifier {
  id: string;
  name: string;
  type: 'choice' | 'addon' | 'hold';
  kitchenFormat?: string; // AI rewritten format
}

export interface AddOn {
  id: string;
  name: string;
  kitchenFormat?: string;
}

export interface TicketItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  station: StationId;
  modifiers: Modifier[];
  addOns: AddOn[];
  notes?: string;
  kitchenNotes?: string; // AI rewritten
  allergens?: string[];
  isRemake?: boolean;
  remakeReason?: RemakeReason;
  bumpedAt?: string;
}

// ============== PRIORITY ==============

export interface PriorityScore {
  level: PriorityLevel;
  score: number; // 0-100
  explanation: string;
  factors: {
    timeToPromise: number;
    complexity: number;
    coordination: number;
  };
}

// ============== TIMELINE ==============

export interface TimelineEvent {
  id: string;
  action: 'created' | 'started' | 'bumped' | 'recalled' | 'handoff' | 'remake';
  timestamp: string;
  station?: StationId;
  performedBy?: string;
  note?: string;
}

// ============== TICKET ==============

export interface Ticket {
  id: string;
  orderNumber: string;
  channel: Channel;
  fulfillmentType: FulfillmentType;
  tableNumber?: string;
  createdAt: string;
  promisedAt: string;
  startedAt?: string;
  readyAt?: string;
  completedAt?: string;
  status: TicketStatus;
  items: TicketItem[];
  customerNotes?: string;
  allergenNotes?: string;
  stationAssignments: StationId[];
  timeline: TimelineEvent[];
  priority?: PriorityScore;
  recallReason?: string;
  recalledFrom?: TicketStatus;
  handoffBy?: string;
  handoffMethod?: HandoffMethod;
}

// ============== LOGS ==============

export interface RemakeLog {
  id: string;
  ticketId: string;
  itemId: string;
  itemName: string;
  reason: RemakeReason;
  station: StationId;
  timestamp: string;
  notes?: string;
}

export interface HandoffLog {
  id: string;
  ticketId: string;
  orderNumber: string;
  byUser: string;
  timestamp: string;
  method: HandoffMethod;
  tableNumber?: string;
}

// ============== STATS ==============

export interface StationStats {
  station: StationId;
  ticketCount: number;
  avgTimeMinutes: number;
  lateCount: number;
  backlog: number;
}

export interface PerformanceStats {
  avgTicketTimeMinutes: number;
  totalTicketsToday: number;
  lateTicketsToday: number;
  stationStats: StationStats[];
  topSlowItems: { itemName: string; avgMinutes: number; count: number }[];
  recentCompleted: CompletedTicketSummary[];
}

export interface CompletedTicketSummary {
  id: string;
  orderNumber: string;
  completedAt: string;
  durationMinutes: number;
  itemCount: number;
}

// ============== BOTTLENECK ==============

export interface BottleneckAlert {
  id: string;
  station: StationId;
  severity: 'warning' | 'critical';
  message: string;
  suggestion: string;
  detectedAt: string;
  metrics: {
    backlog: number;
    avgTime: number;
    lateRate: number;
  };
}

// ============== MISTAKE INSIGHT ==============

export interface MistakeInsight {
  id: string;
  itemName: string;
  remakeCount: number;
  primaryReason: RemakeReason;
  reasonBreakdown: { reason: RemakeReason; count: number }[];
  suggestion: string;
  affectedStation: StationId;
}

// ============== SETTINGS ==============

export interface KDSSettings {
  lateThresholdMinutes: number;
  soundEnabled: boolean;
  autoRefreshSeconds: number;
  stationConfigs: Record<StationId, { bumpDestination: 'ready' | 'completed'; active: boolean }>;
  rushSimulatorEnabled: boolean;
  kitchenLoad: number; // 0-100
}

// ============== KITCHEN STATE ==============

export interface KitchenState {
  tickets: Ticket[];
  remakeLogs: RemakeLog[];
  handoffLogs: HandoffLog[];
  settings: KDSSettings;
  bottleneckAlerts: BottleneckAlert[];
  mistakeInsights: MistakeInsight[];
}
