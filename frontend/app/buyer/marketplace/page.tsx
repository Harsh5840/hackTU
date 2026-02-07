'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { ShoppingCart, Search, Filter, Minus, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  basePrice: number;
  sellingPrice: number;
  mrp: number;
  unit: string;
  minOrderQuantity: number;
  finishType: string;
  shadeCode: string;
  hexColor: string;
  isActive: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function BuyerMarketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts();
        
        if (response.success) {
          // Only show active products
          setProducts(response.data.filter((p: Product) => p.isActive));
        } else {
          toast.error('Failed to load products');
        }
      } catch (error) {
        toast.error('Failed to load products');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      (product.name && product.name.toLowerCase().includes(query)) ||
      (product.sku && product.sku.toLowerCase().includes(query)) ||
      (product.shadeCode && product.shadeCode.toLowerCase().includes(query))
    );
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);
    const minQty = product.minOrderQuantity || 1;
    
    if (existingItem) {
      setCart(cart.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + minQty }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: minQty }]);
    }
    
    toast.success(`Added ${product.name || 'product'} to cart`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        const minQty = item.product.minOrderQuantity || 1;
        if (newQuantity < minQty) {
          toast.error(`Minimum order quantity is ${minQty}`);
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
    toast.success('Item removed from cart');
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + (item.product.mrp || item.product.basePrice || 0) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-mc-purple to-mc-red bg-clip-text text-transparent">
            Product Marketplace
          </h1>
          <p className="text-gray-600 mt-2">
            Browse and order from our extensive paint collection
          </p>
        </div>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-mc-purple" />
            <div>
              <p className="text-sm text-gray-600">Cart</p>
              <p className="text-lg font-bold">{cartItemCount} items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search by product name, SKU, or shade code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div
                className="w-full h-40 rounded-lg mb-4"
                style={{ backgroundColor: product.hexColor || '#cccccc' }}
              />
              <h3 className="font-semibold text-lg mb-1">{product.name || 'Unnamed Product'}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.sku || 'N/A'}</p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <span className="text-gray-600">Shade:</span>
                  <span className="ml-1 font-medium">{product.shadeCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Finish:</span>
                  <span className="ml-1 font-medium">{product.finishType || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-mc-purple">
                  {formatPrice(product.mrp || product.basePrice || 0)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice((product.mrp || 0) * 1.15)}
                </span>
                <span className="text-sm text-gray-600">/ {product.unit || 'unit'}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Min. order: {product.minOrderQuantity || 1} {product.unit || 'unit'}
              </p>
              <Button
                onClick={() => addToCart(product)}
                className="w-full bg-mc-purple hover:bg-mc-purple/90"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No products found matching your search.</p>
        </Card>
      )}

      {/* Cart Sidebar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 bg-white border-l shadow-2xl" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="p-4 border-b sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-lg">Shopping Cart ({cartItemCount} items)</h3>
          </div>
          <div className="p-4 space-y-3">
            {cart.map((item) => (
              <Card key={item.product.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded flex-shrink-0"
                    style={{ backgroundColor: item.product.hexColor || '#cccccc' }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.name || 'Unnamed Product'}</h4>
                    <p className="text-xs text-gray-600">{item.product.sku || 'N/A'}</p>
                    <p className="text-sm font-semibold text-mc-purple mt-1">
                      {formatPrice(item.product.mrp || item.product.basePrice || 0)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, -(item.product.minOrderQuantity || 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium px-2">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.product.id, (item.product.minOrderQuantity || 1))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full mt-2"
                  onClick={() => removeFromCart(item.product.id)}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
          <div className="p-4 border-t sticky bottom-0 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Total:</span>
              <span className="text-2xl font-bold text-mc-purple">
                {formatPrice(cartTotal)}
              </span>
            </div>
            <Button className="w-full bg-mc-purple hover:bg-mc-purple/90" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
