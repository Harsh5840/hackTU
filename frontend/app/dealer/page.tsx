'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Mail, Phone, MapPin, CreditCard, TrendingUp, User } from 'lucide-react';

interface DealerProfile {
  id: string;
  dealerCode: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  creditLimit: number;
  availableCredit: number;
  dealerTier: number;
  verificationStatus: string;
  accountStatus: string;
}

export default function DealerProfile() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileRes = await api.getDealerProfile();

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Failed to load profile');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-600 mb-4">Failed to load dealer profile</p>
        <Button onClick={loadProfile}>Retry</Button>
      </div>
    );
  }

  const usedCredit = profile.creditLimit - profile.availableCredit;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your dealer information</p>
      </div>

      {/* Business Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="text-mc-purple" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Business Name</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.businessName}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Dealer Code</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">{profile.dealerCode}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Contact Person</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {profile.firstName} {profile.lastName}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Dealer Tier</label>
            <p className="text-lg font-semibold text-gray-900 mt-1">Tier {profile.dealerTier}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{profile.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="text-gray-400" size={20} />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900">{profile.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Address Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-mc-purple" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Address</h2>
        </div>
        
        <div className="text-gray-900">
          <p>{profile.addressLine1}</p>
          {profile.addressLine2 && <p>{profile.addressLine2}</p>}
          <p>{profile.city}, {profile.state} - {profile.pincode}</p>
        </div>
      </Card>

      {/* Credit Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <CreditCard className="text-mc-purple" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Credit Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Credit Limit</p>
            <p className="text-2xl font-bold text-gray-900">₹{profile.creditLimit.toLocaleString()}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Available Credit</p>
            <p className="text-2xl font-bold text-green-600">₹{profile.availableCredit.toLocaleString()}</p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Used Credit</p>
            <p className="text-2xl font-bold text-orange-600">₹{usedCredit.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Account Status */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="text-mc-purple" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Account Status</h2>
        </div>
        
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Verification Status</p>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              profile.verificationStatus === 'APPROVED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.verificationStatus}
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Account Status</p>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              profile.accountStatus === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.accountStatus}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
