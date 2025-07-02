import React, { useEffect, useState } from 'react';
import { Shield, User, Download, Eye, CheckCircle, XCircle, Clock, FileText, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface ConsentPreference {
  id: string;
  category: string;
  title: string;
  description: string;
  required: boolean;
  enabled: boolean;
  lastUpdated: string;
  expiryDate?: string;
}

interface DataUsageInfo {
  category: string;
  purpose: string;
  dataTypes: string[];
  retentionPeriod: string;
  thirdParties?: string[];
}

interface ConsentHistory {
  id: string;
  action: string;
  category: string;
  timestamp: string;
  details: string;
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'preferences' | 'history' | 'data-usage' | 'profile'>('overview');
  const [consentPreferences, setConsentPreferences] = useState<ConsentPreference[]>([]);
  const [consentHistory, setConsentHistory] = useState<ConsentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([]);

  // Mock data - in real implementation, this would come from TMF APIs
  useEffect(() => {
    const mockConsentPreferences: ConsentPreference[] = [
      {
        id: 'data-processing',
        category: 'Essential',
        title: 'Data Processing',
        description: 'Processing of your personal data for service delivery and billing',
        required: true,
        enabled: true,
        lastUpdated: '2024-12-15T10:30:00Z',
        expiryDate: '2025-12-15T10:30:00Z'
      },
      {
        id: 'marketing',
        category: 'Marketing',
        title: 'Marketing Communications',
        description: 'Receive promotional offers, new product announcements, and special deals',
        required: false,
        enabled: true,
        lastUpdated: '2024-12-10T14:20:00Z',
        expiryDate: '2025-12-10T14:20:00Z'
      },
      {
        id: 'analytics',
        category: 'Analytics',
        title: 'Usage Analytics',
        description: 'Analysis of your service usage patterns to improve our offerings',
        required: false,
        enabled: true,
        lastUpdated: '2024-12-08T09:15:00Z',
        expiryDate: '2025-12-08T09:15:00Z'
      },
      {
        id: 'third-party',
        category: 'Sharing',
        title: 'Third-party Data Sharing',
        description: 'Sharing your data with trusted partners for enhanced services',
        required: false,
        enabled: false,
        lastUpdated: '2024-12-01T16:45:00Z',
        expiryDate: '2025-12-01T16:45:00Z'
      },
      {
        id: 'location',
        category: 'Location',
        title: 'Location Services',
        description: 'Use of location data for location-based services and emergency assistance',
        required: false,
        enabled: true,
        lastUpdated: '2024-11-28T11:30:00Z',
        expiryDate: '2025-11-28T11:30:00Z'
      }
    ];

    const mockHistory: ConsentHistory[] = [
      {
        id: '1',
        action: 'Updated',
        category: 'Marketing Communications',
        timestamp: '2024-12-10T14:20:00Z',
        details: 'Enabled marketing communications consent'
      },
      {
        id: '2',
        action: 'Revoked',
        category: 'Third-party Data Sharing',
        timestamp: '2024-12-01T16:45:00Z',
        details: 'Disabled third-party data sharing consent'
      },
      {
        id: '3',
        action: 'Granted',
        category: 'Location Services',
        timestamp: '2024-11-28T11:30:00Z',
        details: 'Enabled location services consent'
      },
      {
        id: '4',
        action: 'Updated',
        category: 'Data Processing',
        timestamp: '2024-11-15T10:30:00Z',
        details: 'Renewed essential data processing consent'
      }
    ];

    setConsentPreferences(mockConsentPreferences);
    setConsentHistory(mockHistory);
    setLoading(false);
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleConsentToggle = async (preferenceId: string) => {
    try {
      const updatedPreferences = consentPreferences.map(pref => {
        if (pref.id === preferenceId && !pref.required) {
          return {
            ...pref,
            enabled: !pref.enabled,
            lastUpdated: new Date().toISOString()
          };
        }
        return pref;
      });

      setConsentPreferences(updatedPreferences);

      const preference = updatedPreferences.find(p => p.id === preferenceId);
      showNotification(
        'success',
        t('notifications.consentUpdated')
      );

      // Add to history
      const newHistoryEntry: ConsentHistory = {
        id: Date.now().toString(),
        action: preference?.enabled ? t('customerDashboard.history.actions.granted') : t('customerDashboard.history.actions.revoked'),
        category: preference?.title || '',
        timestamp: new Date().toISOString(),
        details: `${preference?.enabled ? t('common.enabled') : t('common.disabled')} ${preference?.title?.toLowerCase()} consent`
      };

      setConsentHistory(prev => [newHistoryEntry, ...prev]);

      // In real implementation, this would call TMF629 Customer API
      // await updateCustomerConsent(user.id, preferenceId, preference.enabled);

    } catch (error) {
      showNotification('error', t('errors.general'));
    }
  };

  const dataUsageInfo: DataUsageInfo[] = [
    {
      category: 'Service Delivery',
      purpose: 'Providing telecommunications services, billing, and customer support',
      dataTypes: ['Contact Information', 'Usage Data', 'Billing Information'],
      retentionPeriod: '7 years after service termination'
    },
    {
      category: 'Marketing',
      purpose: 'Sending promotional offers and product recommendations',
      dataTypes: ['Contact Information', 'Service Preferences', 'Usage Patterns'],
      retentionPeriod: '2 years from last interaction'
    },
    {
      category: 'Analytics',
      purpose: 'Improving service quality and developing new products',
      dataTypes: ['Usage Data', 'Device Information', 'Service Performance'],
      retentionPeriod: '3 years from collection'
    },
    {
      category: 'Third-party Services',
      purpose: 'Enhanced services through trusted partnerships',
      dataTypes: ['Contact Information', 'Service Usage'],
      retentionPeriod: '1 year from sharing',
      thirdParties: ['Payment Processors', 'Content Providers', 'Network Partners']
    }
  ];

  const getConsentStats = () => {
    const total = consentPreferences.length;
    const enabled = consentPreferences.filter(p => p.enabled).length;
    const required = consentPreferences.filter(p => p.required && p.enabled).length;
    const optional = consentPreferences.filter(p => !p.required && p.enabled).length;
    
    return { total, enabled, required, optional };
  };

  // Translation mapping for consent preferences
  const getConsentTranslation = (preference: ConsentPreference) => {
    const translationKey = `customerDashboard.preferences.consentTypes.${preference.id}`;
    return {
      title: t(`${translationKey}.title`),
      description: t(`${translationKey}.description`),
      category: t(`customerDashboard.preferences.categories.${preference.category.toLowerCase()}`)
    };
  };

  const stats = getConsentStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('customerDashboard.welcome', { name: user?.name })}</h1>
            <p className="text-blue-100 mt-1">{t('customerDashboard.overview.title')}</p>
          </div>
          <Shield className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      {/* Consent Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('customerDashboard.overview.totalConsents')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('customerDashboard.overview.activeConsents')}</p>
              <p className="text-2xl font-bold text-green-600">{stats.enabled}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('common.required')}</p>
              <p className="text-2xl font-bold text-orange-600">{stats.required}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('common.optional')}</p>
              <p className="text-2xl font-bold text-purple-600">{stats.optional}</p>
            </div>
            <Settings className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('customerDashboard.overview.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('preferences')}
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Settings className="w-6 h-6 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('customerDashboard.overview.updatePreferences')}</p>
              <p className="text-sm text-gray-500">Update your consent settings</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Clock className="w-6 h-6 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('customerDashboard.overview.viewHistory')}</p>
              <p className="text-sm text-gray-500">{t('customerDashboard.overview.viewHistory')}</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('data-usage')}
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Eye className="w-6 h-6 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900">{t('customerDashboard.tabs.dataUsage')}</p>
              <p className="text-sm text-gray-500">{t('customerDashboard.dataUsage.description')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('customerDashboard.overview.recentActivity')}</h2>
        <div className="space-y-3">
          {consentHistory.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.details}</p>
                <p className="text-xs text-gray-500">{formatDate(item.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
        {consentHistory.length === 0 && (
          <p className="text-gray-500 text-sm">{t('customerDashboard.overview.noRecentActivity')}</p>
        )}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('customerDashboard.preferences.title')}</h2>
          <div className="text-sm text-gray-500">
            {t('customerDashboard.preferences.lastUpdated', { date: formatDate(new Date().toISOString()) })}
          </div>
        </div>

        <p className="text-gray-600 mb-6">{t('customerDashboard.preferences.description')}</p>

        <div className="space-y-4">
          {consentPreferences.map((preference) => {
            const translatedContent = getConsentTranslation(preference);
            return (
            <div key={preference.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium text-gray-900">{translatedContent.title}</h3>
                    {preference.required && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {t('common.required')}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      preference.category === 'Essential' ? 'bg-red-100 text-red-800' :
                      preference.category === 'Marketing' ? 'bg-blue-100 text-blue-800' :
                      preference.category === 'Analytics' ? 'bg-green-100 text-green-800' :
                      preference.category === 'Sharing' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {translatedContent.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{translatedContent.description}</p>
                  <p className="text-xs text-gray-500">
                    {t('customerDashboard.preferences.lastUpdated', { date: formatDate(preference.lastUpdated) })}
                    {preference.expiryDate && (
                      <span className="ml-2">• {t('customerDashboard.preferences.expiryDate', { date: formatDate(preference.expiryDate) })}</span>
                    )}
                  </p>
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={() => handleConsentToggle(preference.id)}
                    disabled={preference.required}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preference.enabled
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    } ${preference.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preference.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Important Information</p>
              <p className="text-sm text-blue-700 mt-1">
                Required consents cannot be disabled as they are essential for providing our services. 
                You can update optional consents at any time. Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Consent History</h2>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </button>
        </div>

        <div className="space-y-3">
          {consentHistory.map((item) => (
            <div key={item.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-3 h-3 rounded-full mr-4 ${
                item.action === 'Granted' ? 'bg-green-500' :
                item.action === 'Revoked' ? 'bg-red-500' :
                item.action === 'Updated' ? 'bg-blue-500' :
                'bg-gray-500'
              }`}></div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    item.action === 'Granted' ? 'bg-green-100 text-green-800' :
                    item.action === 'Revoked' ? 'bg-red-100 text-red-800' :
                    item.action === 'Updated' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.action}
                  </span>
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <p className="text-sm text-gray-600">{item.details}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(item.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataUsage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How We Use Your Data</h2>
        
        <div className="space-y-6">
          {dataUsageInfo.map((info, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">{info.category}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Purpose</p>
                  <p className="text-sm text-gray-600">{info.purpose}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Data Types</p>
                  <div className="flex flex-wrap gap-1">
                    {info.dataTypes.map((type, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Retention Period</p>
                  <p className="text-sm text-gray-600">{info.retentionPeriod}</p>
                </div>
                
                {info.thirdParties && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Third Parties</p>
                    <div className="flex flex-wrap gap-1">
                      {info.thirdParties.map((party, idx) => (
                        <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {party}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Your Rights Under PDPA</p>
              <ul className="text-sm text-green-700 mt-1 list-disc list-inside space-y-1">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to withdraw consent</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={user?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
            <input
              type="text"
              value={user?.id || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              readOnly
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Profile Updates</p>
              <p className="text-sm text-yellow-700 mt-1">
                To update your profile information, please contact our customer service at +94 11 2345678 
                or visit your nearest SLT Mobitel service center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="/SLTMobitel_Logo.svg.png" 
                alt="SLT Mobitel" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h1 className="text-xl font-semibold text-gray-900">{t('customerDashboard.title')}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: t('customerDashboard.tabs.overview'), icon: Shield },
              { id: 'preferences', label: t('customerDashboard.tabs.preferences'), icon: Settings },
              { id: 'history', label: t('customerDashboard.tabs.history'), icon: Clock },
              { id: 'data-usage', label: t('customerDashboard.tabs.dataUsage'), icon: Eye },
              { id: 'profile', label: t('customerDashboard.tabs.profile'), icon: User }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'history' && renderHistory()}
        {activeTab === 'data-usage' && renderDataUsage()}
        {activeTab === 'profile' && renderProfile()}
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm w-full bg-white border-l-4 rounded-lg shadow-lg p-4 ${
              notification.type === 'success' 
                ? 'border-green-500' 
                : notification.type === 'error'
                ? 'border-red-500'
                : 'border-blue-500'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : notification.type === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 
                  notification.type === 'error' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
