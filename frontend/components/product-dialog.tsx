'use client';

import React from "react"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  discountPercentage: number;
  sellingPrice: number;
  mrp: number;
  unit: string;
  minOrderQuantity: number;
  packSize: number;
  finishType: string;
  shadeCode: string;
  hexColor: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
  initialData?: ProductFormData;
  isLoading?: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ProductDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      sku: '',
      name: '',
      description: '',
      categoryId: '',
      basePrice: 0,
      discountPercentage: 0,
      sellingPrice: 0,
      mrp: 0,
      unit: 'LITRE',
      minOrderQuantity: 1,
      packSize: 1,
      finishType: 'MATTE',
      shadeCode: '',
      hexColor: '#000000',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="P-100"
                  required
                />
              </div>

              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ultra White Satin"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product description..."
                className="h-24"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Interior Paints</SelectItem>
                    <SelectItem value="2">Exterior Paints</SelectItem>
                    <SelectItem value="3">Wood Finishes</SelectItem>
                    <SelectItem value="4">Primers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) =>
                    setFormData({ ...formData, unit: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LITRE">Litre</SelectItem>
                    <SelectItem value="KG">KG</SelectItem>
                    <SelectItem value="PIECE">Piece</SelectItem>
                    <SelectItem value="GALLON">Gallon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Pricing</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="discountPercentage">Discount %</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  step="0.01"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sellingPrice: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="mrp">MRP</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Product Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="finishType">Finish Type</Label>
                <Select
                  value={formData.finishType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, finishType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MATTE">Matte</SelectItem>
                    <SelectItem value="GLOSSY">Glossy</SelectItem>
                    <SelectItem value="SEMI_GLOSSY">Semi Glossy</SelectItem>
                    <SelectItem value="METALLIC">Metallic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shadeCode">Shade Code</Label>
                <Input
                  id="shadeCode"
                  value={formData.shadeCode}
                  onChange={(e) =>
                    setFormData({ ...formData, shadeCode: e.target.value })
                  }
                  placeholder="SC-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrderQuantity">Min Order Qty</Label>
                <Input
                  id="minOrderQuantity"
                  type="number"
                  value={formData.minOrderQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderQuantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="packSize">Pack Size</Label>
                <Input
                  id="packSize"
                  type="number"
                  value={formData.packSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packSize: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hexColor">Color Code</Label>
              <div className="flex gap-2">
                <Input
                  id="hexColor"
                  type="text"
                  value={formData.hexColor}
                  onChange={(e) =>
                    setFormData({ ...formData, hexColor: e.target.value })
                  }
                  placeholder="#000000"
                  className="flex-1"
                />
                <div
                  className="w-10 h-10 rounded border border-gray-300"
                  style={{ backgroundColor: formData.hexColor }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
