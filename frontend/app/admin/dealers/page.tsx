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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Dealer {
  id: string;
  dealerCode: string;
  businessName: string;
  businessType: string;
  gstNumber: string;
  panNumber: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  creditLimit: number;
  availableCredit: number;
  verificationStatus: string;
  accountStatus: string;
  isActive?: boolean;
  createdAt: string;
}

const VERIFICATION_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED'];
const ACCOUNT_STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800',
};

export default function DealersPage() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDealers({ limit: 1000 });
      if (response.success) {
        setDealers(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dealers');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationStatusUpdate = async (
    dealerId: string,
    newStatus: string
  ) => {
    setUpdatingId(dealerId);
    try {
      const response = await api.updateDealerStatus(dealerId, newStatus);
      if (response.success) {
        setDealers(
          dealers.map((d) =>
            d.id === dealerId
              ? { ...d, verificationStatus: newStatus }
              : d
          )
        );
        toast.success('Verification status updated');
        if (selectedDealer?.id === dealerId) {
          setSelectedDealer({
            ...selectedDealer,
            verificationStatus: newStatus,
          });
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAccountStatusUpdate = async (
    dealerId: string,
    newStatus: string
  ) => {
    setUpdatingId(dealerId);
    try {
      const response = await api.updateDealerStatus(dealerId, newStatus);
      if (response.success) {
        setDealers(
          dealers.map((d) =>
            d.id === dealerId ? { ...d, accountStatus: newStatus } : d
          )
        );
        toast.success('Account status updated');
        if (selectedDealer?.id === dealerId) {
          setSelectedDealer({
            ...selectedDealer,
            accountStatus: newStatus,
          });
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredDealers = dealers.filter((dealer) => {
    const matchesSearch =
      dealer.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.dealerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      verificationFilter === 'ALL' ||
      dealer.verificationStatus === verificationFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dealers</h1>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dealers</h1>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border md:col-span-2">
            <Search size={20} className="text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent outline-none"
            />
          </div>

          <Select
            value={verificationFilter}
            onValueChange={setVerificationFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by verification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {VERIFICATION_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Dealers Table */}
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Code
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Business Name
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                Email
              </th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900">
                City
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900">
                Verification
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900">
                Account
              </th>
              <th className="text-right py-4 px-6 font-semibold text-gray-900">
                Available Credit
              </th>
              <th className="text-center py-4 px-6 font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDealers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  No dealers found
                </td>
              </tr>
            ) : (
              filteredDealers.map((dealer) => (
                <tr key={dealer.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {dealer.dealerCode}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {dealer.businessName}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dealer.email}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {dealer.city}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <Select
                        value={dealer.verificationStatus}
                        onValueChange={(value) =>
                          handleVerificationStatusUpdate(dealer.id, value)
                        }
                        disabled={updatingId === dealer.id}
                      >
                        <SelectTrigger
                          className={`w-28 text-xs ${
                            STATUS_COLORS[dealer.verificationStatus] || ''
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIFICATION_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      <Select
                        value={dealer.accountStatus}
                        onValueChange={(value) =>
                          handleAccountStatusUpdate(dealer.id, value)
                        }
                        disabled={updatingId === dealer.id}
                      >
                        <SelectTrigger
                          className={`w-24 text-xs ${
                            STATUS_COLORS[dealer.accountStatus] || ''
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNT_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    ₹{dealer.availableCredit.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => {
                          setSelectedDealer(dealer);
                          setDetailsOpen(true);
                        }}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Dealer Details Dialog */}
      {selectedDealer && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Dealer Profile - {selectedDealer.dealerCode}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Business Name</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.businessName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Business Type</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.businessType}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">GST Number</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.gstNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">PAN Number</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.panNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {selectedDealer.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{selectedDealer.addressLine1}</p>
                  <p>
                    {selectedDealer.city}, {selectedDealer.state}{' '}
                    {selectedDealer.pincode}
                  </p>
                </div>
              </div>

              {/* Credit Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Credit Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Credit Limit</p>
                    <p className="font-semibold text-gray-900">
                      ₹{selectedDealer.creditLimit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Available Credit</p>
                    <p className="font-semibold text-green-600">
                      ₹{selectedDealer.availableCredit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Status
                    </label>
                    <Select
                      value={selectedDealer.verificationStatus}
                      onValueChange={(value) =>
                        handleVerificationStatusUpdate(selectedDealer.id, value)
                      }
                      disabled={updatingId === selectedDealer.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VERIFICATION_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <Select
                      value={selectedDealer.accountStatus}
                      onValueChange={(value) =>
                        handleAccountStatusUpdate(selectedDealer.id, value)
                      }
                      disabled={updatingId === selectedDealer.id}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOUNT_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
