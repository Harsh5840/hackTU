import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling only
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'WAREHOUSE_MANAGER' | 'DEALER' | 'BUYER' | 'ADMIN';
  }) {
    try {
      const response = await this.client.post('/api/auth/register', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/api/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const response = await this.client.post('/api/auth/reset-password', {
      email,
      code,
      newPassword,
    });
    return response.data;
  }

  // Inventory endpoints
  async getProducts() {
    const response = await this.client.get('/api/inventory/products');
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/api/inventory/products/${id}`);
    return response.data;
  }

  async createProduct(data: {
    sku: string;
    name: string;
    description?: string;
    categoryId: string;
    basePrice: number;
    discountPercentage?: number;
    unit: string;
    minOrderQuantity?: number;
    packSize?: number;
    finishType?: string;
    shadeCode?: string;
    hexColor?: string;
  }) {
    const response = await this.client.post('/api/inventory/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<{
    sku: string;
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
    discountPercentage: number;
    unit: string;
    minOrderQuantity: number;
    packSize: number;
    finishType: string;
    shadeCode: string;
    hexColor: string;
    isActive: boolean;
  }>) {
    const response = await this.client.put(`/api/inventory/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string) {
    const response = await this.client.delete(`/api/inventory/products/${id}`);
    return response.data;
  }

  async getWarehouses() {
    const response = await this.client.get('/api/inventory/warehouses');
    return response.data;
  }

  async getInventory() {
    const response = await this.client.get('/api/inventory');
    return response.data;
  }

  async getWarehouseInventory(warehouseId: string) {
    const response = await this.client.get(`/api/inventory/warehouses/${warehouseId}`);
    return response.data;
  }

  async adjustInventory(data: {
    productId: string;
    warehouseId: string;
    quantity: number;
    type: 'PURCHASE' | 'SALE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';
    notes?: string;
  }) {
    const response = await this.client.post('/api/inventory/adjust', data);
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/api/inventory/categories');
    return response.data;
  }

  // Order endpoints
  async getOrders(filters?: {
    dealerId?: string;
    status?: string;
    limit?: number;
  }) {
    const response = await this.client.get('/api/orders', { params: filters });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/api/orders/${id}`);
    return response.data;
  }

  async createOrder(data: {
    dealerId: string;
    items: { productId: string; quantity: number }[];
    deliveryAddress: {
      line1: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
    };
  }) {
    const response = await this.client.post('/api/orders/create', data);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string) {
    const response = await this.client.patch(`/api/orders/${id}`, { status });
    return response.data;
  }

  // Dealer endpoints
  async getDealers(filters?: {
    status?: string;
    tier?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/api/dealers', { params: filters });
    return response.data;
  }

  async getDealer(id: string) {
    const response = await this.client.get(`/api/dealers/${id}`);
    return response.data;
  }

  async registerDealer(data: {
    userId: string;
    dealerCode: string;
    businessName: string;
    businessType: 'PROPRIETORSHIP' | 'PARTNERSHIP' | 'PRIVATE_LIMITED' | 'LLP';
    gstNumber: string;
    panNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankIfscCode: string;
    bankName: string;
  }) {
    const response = await this.client.post('/api/dealers/register', data);
    return response.data;
  }

  async getDealerProfile() {
    const response = await this.client.get('/api/dealers/me');
    return response.data;
  }

  async updateDealerProfile(data: any) {
    const response = await this.client.put('/api/dealers/me/profile', data);
    return response.data;
  }

  async updateDealerStatus(id: string, status: string) {
    const response = await this.client.patch(`/api/dealers/${id}/status`, { status });
    return response.data;
  }

  async getDealerHierarchy() {
    const response = await this.client.get('/api/dealers/hierarchy');
    return response.data;
  }

  // Analytics endpoints
  async getDemandForecast(data: {
    productId: string;
    history: { date: string; quantity: number }[];
  }) {
    const response = await this.client.post('/api/analytics/forecast/demand', data);
    return response.data;
  }

  async getStockRecommendations(data: {
    inventory: {
      productId: string;
      warehouseId: string;
      currentStock: number;
    }[];
    salesVelocity: {
      productId: string;
      avgDailySales: number;
    }[];
  }) {
    const response = await this.client.post('/api/analytics/recommend/stock', data);
    return response.data;
  }

  // New analytics endpoints
  async getStockClassification() {
    const response = await this.client.get('/api/analytics/stock-classification');
    return response.data;
  }

  async getLowStockAlerts(threshold: number = 20) {
    const response = await this.client.get('/api/analytics/low-stock-alerts', { 
      params: { threshold } 
    });
    return response.data;
  }

  async getRegionalSales() {
    const response = await this.client.get('/api/analytics/regional-sales');
    return response.data;
  }

  async getDemandForecastSimple(days: number = 7) {
    const response = await this.client.get('/api/analytics/demand-forecast', { 
      params: { days } 
    });
    return response.data;
  }
}

export const api = new ApiClient();

export type { ApiError };
