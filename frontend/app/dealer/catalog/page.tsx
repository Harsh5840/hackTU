'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { ShoppingCart, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId: string | number;
  basePrice: number | string;
  discountPercentage?: number;
  sellingPrice?: number;
  mrp: number | string;
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
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    loadProducts();
    // Load cart from localStorage
    const savedCart = localStorage.getItem('dealerCart');
    if (savedCart) {
      try {
        setCart(new Map(Object.entries(JSON.parse(savedCart))));
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.getProducts();
      if (response.success) {
        // Map backend fields to expected format
        const mappedProducts = response.data.map((p: any) => ({
          ...p,
          sellingPrice: parseFloat(p.basePrice || '0'),
          mrp: parseFloat(p.mrp || p.basePrice || '0'),
          unit: p.unitOfMeasure || p.unit || 'L',
          minOrderQuantity: p.containerSize || p.minOrderQuantity || 4,
          hexColor: p.hexColor || p.colorCode || '#E5E7EB',
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

  const handleAddToCart = (productId: string) => {
    const newCart = new Map(cart);
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const minQty = product.minOrderQuantity || 4;
    const currentQty = newCart.get(productId) || 0;
    const newQty = currentQty + minQty;
    newCart.set(productId, newQty);
    setCart(newCart);

    // Save to localStorage
    const cartObj = Object.fromEntries(newCart);
    localStorage.setItem('dealerCart', JSON.stringify(cartObj));

    toast.success(`${product.name} added to cart`);
  };

  const handleRemoveFromCart = (productId: string) => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    setCart(newCart);

    const cartObj = Object.fromEntries(newCart);
    localStorage.setItem('dealerCart', JSON.stringify(cartObj));

    toast.success('Item removed from cart');
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || String(p.categoryId) === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Product Catalog</h1>
        <Link href="/dealer/cart">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            <ShoppingCart size={18} />
            Cart ({cart.size})
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border md:col-span-2">
            <Search size={20} className="text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent outline-none"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="1">Interior Paints</SelectItem>
              <SelectItem value="2">Exterior Paints</SelectItem>
              <SelectItem value="3">Wood Finishes</SelectItem>
              <SelectItem value="4">Primers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">No products found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const inCart = cart.has(product.id);
            const cartQty = cart.get(product.id) || 0;
            const mrpValue = typeof product.mrp === 'string' ? parseFloat(product.mrp) : product.mrp;
            const sellingPrice = product.sellingPrice || (typeof product.basePrice === 'string' ? parseFloat(product.basePrice) : product.basePrice);
            const discount = mrpValue && sellingPrice && mrpValue > sellingPrice
              ? Math.round(((mrpValue - sellingPrice) / mrpValue) * 100)
              : 0;
            const minQty = product.minOrderQuantity || 4;
            const unit = product.unit || 'L';

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Color */}
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: product.hexColor || '#E5E7EB' }}
                />

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">{product.sku}</p>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{product.finishType || 'Paint'}</p>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{formatPrice(sellingPrice, 0)}
                      </span>
                      {discount > 0 && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{formatPrice(mrpValue, 0)}
                          </span>
                          <span className="text-xs font-semibold text-green-600">
                            {discount}% off
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      per {unit} | Min Qty: {minQty}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {!inCart ? (
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </Button>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 bg-indigo-50 rounded-lg p-2">
                          <Button
                            onClick={() => {
                              const newQty = cartQty - minQty;
                              const newCart = new Map(cart);
                              if (newQty <= 0) {
                                newCart.delete(product.id);
                              } else {
                                newCart.set(product.id, newQty);
                              }
                              setCart(newCart);
                              const cartObj = Object.fromEntries(newCart);
                              localStorage.setItem(
                                'dealerCart',
                                JSON.stringify(cartObj)
                              );
                            }}
                            className="flex-1 bg-white text-indigo-600 hover:bg-gray-100 text-sm"
                            variant="outline"
                          >
                            −
                          </Button>
                          <span className="flex-1 text-center font-semibold text-gray-900">
                            {cartQty}
                          </span>
                          <Button
                            onClick={() => handleAddToCart(product.id)}
                            className="flex-1 bg-white text-indigo-600 hover:bg-gray-100 text-sm"
                            variant="outline"
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="w-full bg-red-50 text-red-600 hover:bg-red-100"
                          variant="outline"
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
