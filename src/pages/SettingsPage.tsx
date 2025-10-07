import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Bell, Shield, Globe, Truck, DollarSign, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Form, FormField, FormLabel, FormInput, FormTextarea, FormSelect } from '../shared/components/ui';
import { useUpdateProfile, useBusinessSettings, useNotificationSettings } from '../shared/hooks/useSettings';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Hooks
  const updateProfileMutation = useUpdateProfile();
  const { getBusinessSettings, saveBusinessSettings } = useBusinessSettings();
  const { getNotificationSettings, saveNotificationSettings } = useNotificationSettings();

  const [profileData, setProfileData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  const [businessSettings, setBusinessSettings] = useState(getBusinessSettings());
  const [notificationSettings, setNotificationSettings] = useState(getNotificationSettings());

  // Update profile data when profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleSaveBusinessSettings = () => {
    saveBusinessSettings(businessSettings);
  };

  const handleSaveNotifications = () => {
    saveNotificationSettings(notificationSettings);
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and business preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField>
                        <FormLabel required>First Name</FormLabel>
                        <FormInput
                          type="text"
                          value={profileData.first_name}
                          onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        />
                      </FormField>
                      
                      <FormField>
                        <FormLabel required>Last Name</FormLabel>
                        <FormInput
                          type="text"
                          value={profileData.last_name}
                          onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        />
                      </FormField>
                      
                      <FormField>
                        <FormLabel>Phone</FormLabel>
                        <FormInput
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        />
                      </FormField>
                      
                      <FormField className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormTextarea
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          rows={3}
                        />
                      </FormField>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        type="submit"
                        leftIcon={<Save className="w-4 h-4" />}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'business' && (
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form onSubmit={(e) => { e.preventDefault(); handleSaveBusinessSettings(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField>
                        <FormLabel required>Business Name</FormLabel>
                        <FormInput
                          type="text"
                          value={businessSettings.business_name}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, business_name: e.target.value })}
                        />
                      </FormField>
                      
                      <FormField>
                        <FormLabel required>Business Email</FormLabel>
                        <FormInput
                          type="email"
                          value={businessSettings.business_email}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, business_email: e.target.value })}
                        />
                      </FormField>
                      
                      <FormField>
                        <FormLabel>Business Phone</FormLabel>
                        <FormInput
                          type="tel"
                          value={businessSettings.business_phone}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, business_phone: e.target.value })}
                        />
                      </FormField>
                      

                      <FormField className="md:col-span-2">
                        <FormLabel>Business Address</FormLabel>
                        <FormTextarea
                          value={businessSettings.business_address}
                          onChange={(e) => setBusinessSettings({ ...businessSettings, business_address: e.target.value })}
                          rows={3}
                        />
                      </FormField>
                    </div>
                    
                    <div className="mt-6">
                      <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                        Save Changes
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'email_new_orders', label: 'New Orders', description: 'Get notified when new orders are placed' },
                          { key: 'email_order_updates', label: 'Order Updates', description: 'Get notified when order status changes' },
                          { key: 'email_customer_messages', label: 'Customer Messages', description: 'Get notified when customers send messages' },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                            <input
                              id={`notification-${setting.key}`}
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onChange={(e) => setNotificationSettings({ 
                                ...notificationSettings, 
                                [setting.key]: e.target.checked 
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Push Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'push_new_orders', label: 'New Orders', description: 'Real-time notifications for new orders' },
                          { key: 'push_delivery_updates', label: 'Delivery Updates', description: 'Notifications for delivery status changes' },
                        ].map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                              <p className="text-sm text-gray-500">{setting.description}</p>
                            </div>
                            <input
                              id={`notification-${setting.key}`}
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                              onChange={(e) => setNotificationSettings({ 
                                ...notificationSettings, 
                                [setting.key]: e.target.checked 
                              })}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button onClick={handleSaveNotifications} leftIcon={<Save className="w-4 h-4" />}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}



            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-3">Change Password</h3>
                      <Form onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-4 max-w-md">
                          <FormField>
                            <FormLabel required>Current Password</FormLabel>
                            <FormInput type="password" />
                          </FormField>
                          
                          <FormField>
                            <FormLabel required>New Password</FormLabel>
                            <FormInput type="password" />
                          </FormField>
                          
                          <FormField>
                            <FormLabel required>Confirm New Password</FormLabel>
                            <FormInput type="password" />
                          </FormField>
                          
                          <Button type="submit">Update Password</Button>
                        </div>
                      </Form>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="secondary">Enable 2FA</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}