'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

interface ProfileData {
  businessName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  panNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfscCode: string;
  bankName: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    businessName: 'ABC Paints Pvt Ltd',
    email: 'contact@abcpaints.com',
    phone: '9876543210',
    addressLine1: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstNumber: '18AABCA1234G1Z0',
    panNumber: 'AAAPA1234A',
    bankAccountName: 'ABC Paints Account',
    bankAccountNumber: '****4321',
    bankIfscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

      {/* Business Information */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={profile.businessName}
                onChange={(e) =>
                  handleProfileChange('businessName', e.target.value)
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>GST Number</Label>
              <Input
                value={profile.gstNumber}
                onChange={(e) =>
                  handleProfileChange('gstNumber', e.target.value)
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label>PAN Number</Label>
              <Input
                value={profile.panNumber}
                onChange={(e) => handleProfileChange('panNumber', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Address</h3>
            <div className="space-y-4">
              <div>
                <Label>Address Line 1</Label>
                <Input
                  value={profile.addressLine1}
                  onChange={(e) =>
                    handleProfileChange('addressLine1', e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={profile.city}
                    onChange={(e) => handleProfileChange('city', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>State</Label>
                  <Input
                    value={profile.state}
                    onChange={(e) => handleProfileChange('state', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={profile.pincode}
                    onChange={(e) =>
                      handleProfileChange('pincode', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bank Information Section */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Bank Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Bank Name</Label>
                  <Input
                    value={profile.bankName}
                    onChange={(e) =>
                      handleProfileChange('bankName', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Account Holder Name</Label>
                  <Input
                    value={profile.bankAccountName}
                    onChange={(e) =>
                      handleProfileChange('bankAccountName', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>Account Number</Label>
                  <Input
                    value={profile.bankAccountNumber}
                    onChange={(e) =>
                      handleProfileChange('bankAccountNumber', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label>IFSC Code</Label>
                  <Input
                    value={profile.bankIfscCode}
                    onChange={(e) =>
                      handleProfileChange('bankIfscCode', e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={24} />
          Change Password
        </h2>

        <div className="space-y-4 max-w-md">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Enter current password"
            />
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              placeholder="Enter new password"
            />
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
