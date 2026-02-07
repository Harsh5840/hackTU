'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  sellingPrice?: number;
  basePrice?: number | string;
  unit?: string;
  unitOfMeasure?: string;
  hexColor?: string;
  colorCode?: string;
  minOrderQuantity?: number;
  containerSize?: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    line1: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCart();
  }, []);

  const loadProducts = async () => {
    try {
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
      console.error('Failed to load products', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('dealerCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        const items: CartItem[] = [];

        Object.entries(cartData).forEach(([productId, quantity]) => {
          const product = products.find((p) => p.id === productId);
          if (product) {
            items.push({
              product,
              quantity: quantity as number,
            });
          }
        });

        setCartItems(items);
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      loadCart();
    }
  }, [products]);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    const updated = cartItems.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: Math.max(item.product.minOrderQuantity, newQuantity) };
      }
      return item;
    });
    setCartItems(updated);

    const cartData: Record<string, number> = {};
    updated.forEach((item) => {
      cartData[item.product.id] = item.quantity;
    });
    localStorage.setItem('dealerCart', JSON.stringify(cartData));
  };

  const handleRemoveItem = (productId: string) => {
    const updated = cartItems.filter((item) => item.product.id !== productId);
    setCartItems(updated);

    const cartData: Record<string, number> = {};
    updated.forEach((item) => {
      cartData[item.product.id] = item.quantity;
    });
    localStorage.setItem('dealerCart', JSON.stringify(cartData));

    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.state) {
      toast.error('Please fill in all delivery address fields');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        dealerId: 'D-001', // Would come from auth context in real app
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        deliveryAddress,
      };

      const response = await api.createOrder(orderData);
      if (response.success) {
        toast.success('Order placed successfully!');
        localStorage.removeItem('dealerCart');
        setCartItems([]);
        // Redirect to orders page
        window.location.href = '/dealer/orders';
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
      console.error(error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/dealer/catalog" className="text-indigo-600 hover:underline flex items-center gap-1">
            <ArrowLeft size={18} />
            Back to Catalog
          </Link>
        </div>

        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link href="/dealer/catalog">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dealer/catalog" className="text-indigo-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={18} />
          Back to Catalog
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.product.id} className="p-4">
              <div className="flex gap-4">
                {/* Product Color */}
                <div
                  className="w-24 h-24 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: item.product.hexColor }}
                />

                {/* Product Details */}
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">{item.product.sku}</p>
                    <h3 className="font-semibold text-gray-900">
                      {item.product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{formatPrice(item.product.sellingPrice, 0)}/{item.product.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                      <Button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.quantity - item.product.minOrderQuantity
                          )
                        }
                        className="p-1 bg-white text-gray-600 hover:bg-gray-100"
                        variant="outline"
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <Button
                        onClick={() =>
                          handleUpdateQuantity(
                            item.product.id,
                            item.quantity + item.product.minOrderQuantity
                          )
                        }
                        className="p-1 bg-white text-gray-600 hover:bg-gray-100"
                        variant="outline"
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Total: ₹{formatPrice(item.product.sellingPrice * item.quantity, 0)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary & Delivery */}
        <div className="space-y-4">
          {/* Delivery Address */}
          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Delivery Address</h3>

            <div>
              <Label htmlFor="line1">Address Line 1</Label>
              <Input
                id="line1"
                value={deliveryAddress.line1}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })
                }
                placeholder="Street address"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={deliveryAddress.city}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                }
                placeholder="City"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={deliveryAddress.state}
                  onChange={(e) =>
                    setDeliveryAddress({ ...deliveryAddress, state: e.target.value })
                  }
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={deliveryAddress.pincode}
                  onChange={(e) =>
                    setDeliveryAddress({
                      ...deliveryAddress,
                      pincode: e.target.value,
                    })
                  }
                  placeholder="Pincode"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={deliveryAddress.phone}
                onChange={(e) =>
                  setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-4 space-y-3 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Order Summary</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ₹{formatPrice(subtotal, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-semibold text-gray-900">
                  ₹{formatPrice(tax, 0)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-indigo-600">
                  ₹{formatPrice(total, 0)}
                </span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
