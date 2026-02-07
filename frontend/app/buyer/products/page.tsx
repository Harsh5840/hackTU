'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Package, MessageCircle } from 'lucide-react';

export default function BuyerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchProducts}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
            Product Catalog
          </h1>
          <p className="text-gray-600 mt-2">Browse our premium paint collection</p>
        </div>
        <Button
          className="bg-mc-purple hover:bg-mc-purple/90"
          onClick={() => window.open('https://t.me/ModernColoursBot', '_blank')}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Order via Telegram
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gradient-to-br from-mc-purple/20 to-mc-yellow/20 flex items-center justify-center">
              <Package className="h-16 w-16 text-mc-purple" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SKU:</span>
                  <span className="font-mono">{product.sku}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span>{product.containerSize}L {product.containerType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Finish:</span>
                  <span className="capitalize">{product.finishType?.toLowerCase()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 line-through">₹{product.mrp}</p>
                  <p className="text-2xl font-bold text-mc-purple">₹{product.basePrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
              </div>

              <Button className="w-full bg-mc-purple hover:bg-mc-purple/90">
                Order Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No products available</p>
        </div>
      )}
    </div>
  );
}
