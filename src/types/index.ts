/** Пользователь */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  avatar?: string;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Организация */
export interface Organization {
  id: string;
  name: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  currency: string;
  createdAt: string;
}

/** Токены авторизации */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Ответ авторизации */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/** Товар */
export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  categoryId?: string;
  category?: Category;
  unitId?: string;
  unit?: Unit;
  purchasePrice: number;
  sellingPrice: number;
  minStock: number;
  maxStock?: number;
  weight?: number;
  volume?: number;
  images: string[];
  isActive: boolean;
  totalStock: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

/** Вариант товара */
export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  purchasePrice: number;
  sellingPrice: number;
  attributes: Record<string, string>;
}

/** Категория */
export interface Category {
  id: string;
  name: string;
  parentId?: string;
  children?: Category[];
  productCount?: number;
  createdAt: string;
}

/** Единица измерения */
export interface Unit {
  id: string;
  name: string;
  shortName: string;
}

/** Склад */
export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  type: 'warehouse' | 'store' | 'transit';
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

/** Остатки товара на складе */
export interface StockItem {
  id: string;
  productId: string;
  product: Product;
  warehouseId: string;
  warehouse: Warehouse;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

/** Складская операция */
export interface StockOperation {
  id: string;
  type: 'receipt' | 'shipment' | 'transfer' | 'writeoff' | 'adjustment';
  number: string;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  warehouseFromId?: string;
  warehouseFrom?: Warehouse;
  warehouseToId?: string;
  warehouseTo?: Warehouse;
  items: StockOperationItem[];
  note?: string;
  userId: string;
  user?: User;
  createdAt: string;
  completedAt?: string;
}

export interface StockOperationItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price?: number;
}

/** Поставщик */
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  inn?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

/** Заказ на закупку */
export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  supplier?: Supplier;
  status: 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  paidAmount: number;
  warehouseId: string;
  warehouse?: Warehouse;
  expectedDate?: string;
  note?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  receivedQuantity: number;
  price: number;
  amount: number;
}

/** Заказ на продажу */
export interface SalesOrder {
  id: string;
  number: string;
  customerId?: string;
  customer?: Customer;
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: SalesOrderItem[];
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  warehouseId: string;
  warehouse?: Warehouse;
  shippingAddress?: string;
  note?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
}

/** Возврат */
export interface Return {
  id: string;
  number: string;
  salesOrderId: string;
  salesOrder?: SalesOrder;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  reason: string;
  items: ReturnItem[];
  totalAmount: number;
  createdAt: string;
}

export interface ReturnItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

/** Клиент (контакт CRM) */
export interface Customer {
  id: string;
  type: 'individual' | 'company';
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  inn?: string;
  tags: string[];
  source?: string;
  assignedUserId?: string;
  assignedUser?: User;
  totalOrders: number;
  totalRevenue: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Воронка продаж */
export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  probability: number;
}

/** Сделка */
export interface Deal {
  id: string;
  title: string;
  amount: number;
  pipelineId: string;
  pipeline?: Pipeline;
  stageId: string;
  stage?: PipelineStage;
  customerId: string;
  customer?: Customer;
  assignedUserId: string;
  assignedUser?: User;
  expectedCloseDate?: string;
  closedAt?: string;
  status: 'open' | 'won' | 'lost';
  lostReason?: string;
  tags: string[];
  notes?: string;
  activities?: Activity[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

/** Активность CRM */
export interface Activity {
  id: string;
  type: 'call' | 'meeting' | 'email' | 'note' | 'task';
  title: string;
  description?: string;
  dealId?: string;
  customerId?: string;
  userId: string;
  user?: User;
  scheduledAt?: string;
  completedAt?: string;
  isCompleted: boolean;
  createdAt: string;
}

/** Задача CRM */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  dueDate?: string;
  dealId?: string;
  deal?: Deal;
  customerId?: string;
  customer?: Customer;
  assignedUserId: string;
  assignedUser?: User;
  createdAt: string;
  updatedAt: string;
}

/** Комментарий */
export interface Comment {
  id: string;
  text: string;
  userId: string;
  user?: User;
  dealId?: string;
  createdAt: string;
}

/** Финансовый счёт */
export interface FinanceAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'card';
  currency: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

/** Финансовая транзакция */
export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  accountId: string;
  account?: FinanceAccount;
  toAccountId?: string;
  toAccount?: FinanceAccount;
  categoryId?: string;
  category?: TransactionCategory;
  amount: number;
  description?: string;
  relatedOrderId?: string;
  relatedOrderType?: 'purchase' | 'sale' | 'return';
  date: string;
  userId: string;
  user?: User;
  createdAt: string;
}

/** Категория транзакции */
export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  parentId?: string;
}

/** Документ */
export interface Document {
  id: string;
  type: 'invoice' | 'act' | 'waybill' | 'report';
  number: string;
  name: string;
  relatedId?: string;
  relatedType?: string;
  fileUrl?: string;
  createdAt: string;
}

/** Запись аудита */
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  user?: User;
  changes?: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

/** Прайс-лист */
export interface PriceList {
  id: string;
  name: string;
  type: 'retail' | 'wholesale' | 'vip';
  isActive: boolean;
  items: PriceListItem[];
  createdAt: string;
}

export interface PriceListItem {
  productId: string;
  price: number;
}

/** Уведомление */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

/** Пагинация */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Параметры запроса списка */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/** Данные аналитики */
export interface AnalyticsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

export interface DashboardStats {
  revenue: number;
  revenueTrend: number;
  orders: number;
  ordersTrend: number;
  averageCheck: number;
  averageCheckTrend: number;
  newCustomers: number;
  newCustomersTrend: number;
  lowStockProducts: Product[];
  todayTasks: Task[];
  topProducts: { product: Product; revenue: number; quantity: number }[];
  topCustomers: { customer: Customer; revenue: number; orders: number }[];
  dealsByStage: { stage: string; count: number; amount: number }[];
  revenueChart: { date: string; revenue: number; expenses: number }[];
}
