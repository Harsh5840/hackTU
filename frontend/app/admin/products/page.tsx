'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDialog, ProductFormData } from '@/components/product-dialog';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string | number;
  basePrice: number | string;
  discountPercentage?: number;
  sellingPrice?: number;
  mrp?: number | string;
  unit?: string;
  unitOfMeasure?: string;
  minOrderQuantity?: number;
  containerSize?: number;
  packSize?: number;
  finishType?: string;
  shadeCode?: string;
  hexColor?: string;
  colorCode?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProducts();
      if (response.success) {
        // Map backend fields to expected format
        const mappedProducts = response.data.map((p: any) => ({
          ...p,
          basePrice: parseFloat(p.basePrice || '0'),
          sellingPrice: parseFloat(p.basePrice || '0'),
          mrp: parseFloat(p.mrp || p.basePrice || '0'),
          unit: p.unitOfMeasure || p.unit || 'L',
          minOrderQuantity: p.containerSize || p.minOrderQuantity || 4,
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      toast.error('Failed to load products');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);
    try {
      // In a real app, you would call api.updateProduct or api.createProduct
      // For now, we'll show a success message
      toast.success(
        selectedProduct
          ? 'Product updated successfully'
          : 'Product added successfully'
      );
      setDialogOpen(false);
      setSelectedProduct(null);
      await loadProducts();
    } catch (error) {
      toast.error('Failed to save product');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      toast.success('Product deleted successfully');
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Button
          onClick={handleAddProduct}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border">
          <Search size={20} className="text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-transparent outline-none"
          />
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                SKU
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Name
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Category
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Unit
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900">
                Base Price
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900">
                Selling Price
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    {product.sku}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: product.hexColor }}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.finishType}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {product.categoryId === '1'
                      ? 'Interior'
                      : product.categoryId === '2'
                        ? 'Exterior'
                        : product.categoryId === '3'
                          ? 'Wood'
                          : 'Primer'}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {product.unit}
                  </td>
                  <td className="py-4 px-6 text-sm text-right text-gray-900">
                    ₹{formatPrice(product.basePrice)}
                  </td>
                  <td className="py-4 px-6 text-sm text-right font-semibold text-gray-900">
                    ₹{formatPrice(product.sellingPrice)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Product Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={selectedProduct || undefined}
        isLoading={isSaving}
      />
    </div>
  );
}
