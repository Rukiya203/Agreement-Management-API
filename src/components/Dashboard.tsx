import React, { useEffect, useState } from 'react';
import { Plus, Package, BarChart3, Settings, FileText, Users, Menu, X, User, ChevronDown, CheckCircle, AlertCircle, Shield, Eye, Clock, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import ProductOfferingForm from './ProductOfferingForm';
import ProductList from './ProductList';
import AgreementForm from './AgreementForm';
import AgreementList from './AgreementList';
import UserProfile from './UserProfile';
import type { ProductOffering } from '../types/ProductOffering';
import type { Agreement } from '../types/Agreement';
import { agreementService } from '../services/agreementService';

type View = 'dashboard' | 'add-product' | 'products' | 'add-agreement' | 'agreements' | 'consent-overview' | 'audit-trail';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [products, setProducts] = useState<ProductOffering[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const { user, logout } = useAuth();

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productResponse = await fetch('https://tm-forum-production.up.railway.app/tmf-api/productCatalogManagement/v5/productOffering');
        if (productResponse.ok) {
          
          const productData = await productResponse.json();
          console.log('Fetched products:', productData);
          console.log('Fetched products:', productData);

          setProducts(productData);
        }

        // Fetch agreements
        try {
          const agreementData = await agreementService.getAllAgreements();
          setAgreements(agreementData);
        } catch (agreementError) {
          console.warn('Agreement service not available:', agreementError);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isUserDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.user-dropdown')) {
          setIsUserDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  const handleAddProduct = (product: ProductOffering) => {
    try {
      const newProduct = {
        ...product,
        id: Math.random().toString(36).substr(2, 9),
        lastUpdate: new Date().toISOString()
      };
      setProducts(prev => [...prev, newProduct]);
      setCurrentView('products');
      showNotification('success', `Product "${product.name}" added successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to add product. Please try again.');
    }
  };

  const handleDeleteProduct = (id: string) => {
    try {
      const product = products.find(p => p.id === id);
      setProducts(prev => prev.filter(product => product.id !== id));
      showNotification('success', `Product "${product?.name || 'item'}" removed successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to remove product. Please try again.');
    }
  };

  const handleAddAgreement = (agreement: Agreement) => {
    try {
      setAgreements(prev => [...prev, agreement]);
      setCurrentView('agreements');
      showNotification('success', `Agreement "${agreement.name}" added successfully!`);
    } catch (error) {
      showNotification('error', 'Failed to add agreement. Please try again.');
    }
  };

  const handleDeleteAgreement = async (id: string) => {
    try {
      const agreement = agreements.find(a => a.id === id);
      await agreementService.deleteAgreement(id);
      setAgreements(prev => prev.filter(agreement => agreement.id !== id));
      showNotification('success', `Agreement "${agreement?.name || 'item'}" removed successfully!`);
    } catch (error) {
      console.error('Error deleting agreement:', error);
      showNotification('error', 'Failed to remove agreement. Please try again.');
    }
  };

  const getStats = () => {
    const activeProducts = products.filter(p => p.lifecycleStatus === 'Active').length;
    const sellableProducts = products.filter(p => p.isSellable).length;
    const bundleProducts = products.filter(p => p.isBundle).length;
    
    const activeAgreements = agreements.filter(a => 
      a.id && a.name && !a.status
    ).length;
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const inProcessAgreements = agreements.filter(a => {
      const createdDate = new Date(a.createdDate);
      const updatedDate = a.updatedDate ? new Date(a.updatedDate) : null;
      
      return (createdDate > thirtyDaysAgo) || (updatedDate && updatedDate > thirtyDaysAgo);
    }).length;

    // Consent Management specific metrics
    const consentAgreements = agreements.filter(a => 
      a.agreementType && (
        a.agreementType.includes('consent') || 
        a.agreementType.includes('privacy') ||
        a.agreementType.includes('data')
      )
    );
    
    const totalCustomers = 1250; // Mock data - would come from customer API
    const activeConsents = consentAgreements.length;
    const complianceRate = totalCustomers > 0 ? Math.round((activeConsents / totalCustomers) * 100) : 0;
    
    return {
      totalProducts: products.length,
      activeProducts,
      sellableProducts,
      bundleProducts,
      totalAgreements: agreements.length,
      activeAgreements,
      inProcessAgreements,
      // Consent Management metrics
      totalCustomers,
      activeConsents,
      revokedConsents: Math.floor(activeConsents * 0.05),
      pendingConsents: Math.floor(activeConsents * 0.1),
      complianceRate
    };
  };

  const stats = getStats();

  const renderSidebar = () => (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 bg-white shadow-lg lg:shadow-none border-r border-gray-200
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
        h-screen lg:min-h-screen lg:h-auto
      `}>
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center justify-center flex-1">
              <img 
                src="/SLTMobitel_Logo.svg.png" 
                alt="Logo" 
                className="w-20 h-20 lg:w-24 lg:h-24 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 hidden" />
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors flex-shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 mt-2 lg:mt-4 overflow-y-auto pb-4 lg:pb-6">
          {/* Main Navigation */}
          <div className="px-3 lg:px-4 mb-4">
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Main Menu</h2>
            </div>
            
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                currentView === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <BarChart3 className={`w-5 h-5 mr-3 ${currentView === 'dashboard' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
              <span className="font-medium">Dashboard</span>
            </button>
          </div>

          {/* Consent Management Section */}
          <div className="px-3 lg:px-4 mb-4">
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Consent Management</h2>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentView('consent-overview');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'consent-overview' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Shield className={`w-5 h-5 mr-3 ${currentView === 'consent-overview' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <span className="font-medium flex-1">Consent Overview</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentView === 'consent-overview' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                }`}>
                  {stats.complianceRate}%
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('audit-trail');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'audit-trail' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Eye className={`w-5 h-5 mr-3 ${currentView === 'audit-trail' ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`} />
                <span className="font-medium">Audit Trail</span>
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="px-3 lg:px-4 mb-4">
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Products</h2>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentView('products');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'products' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Package className={`w-5 h-5 mr-3 ${currentView === 'products' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <span className="font-medium flex-1">All Products</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentView === 'products' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('add-product');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'add-product' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Plus className={`w-5 h-5 mr-3 ${currentView === 'add-product' ? 'text-white' : 'text-gray-400 group-hover:text-green-500'}`} />
                <span className="font-medium">Add Product</span>
              </button>
            </div>
          </div>

          {/* Agreements Section */}
          <div className="px-3 lg:px-4 mb-4">
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Agreements</h2>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {
                  setCurrentView('agreements');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'agreements' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <FileText className={`w-5 h-5 mr-3 ${currentView === 'agreements' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <span className="font-medium flex-1">All Agreements</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentView === 'agreements' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-green-100 text-green-700 group-hover:bg-green-200'
                }`}>
                  {agreements.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('add-agreement');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200 group ${
                  currentView === 'add-agreement' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Plus className={`w-5 h-5 mr-3 ${currentView === 'add-agreement' ? 'text-white' : 'text-gray-400 group-hover:text-green-500'}`} />
                <span className="font-medium">Add Agreement</span>
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="px-3 lg:px-4 mb-4">
            <div className="mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Settings</h2>
            </div>
            
            <button className="w-full flex items-center px-3 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group">
              <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-purple-500" />
              <span className="font-medium">Configuration</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );

  const renderConsentOverview = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Consent Management Overview</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">Monitor customer consent preferences and ensure PDPA compliance</p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentView('add-agreement')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              New Consent Agreement
            </button>
            <button
              onClick={() => setCurrentView('audit-trail')}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Audit Trail
            </button>
          </div>
        </div>
      </div>

      {/* Consent Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">Data Processing</p>
              <p className="text-2xl font-bold text-green-900">{Math.floor(stats.activeConsents * 0.85)}</p>
              <p className="text-xs text-green-600 mt-1">Active consents</p>
            </div>
            <Shield className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">Marketing</p>
              <p className="text-2xl font-bold text-blue-900">{Math.floor(stats.activeConsents * 0.65)}</p>
              <p className="text-xs text-blue-600 mt-1">Opt-in customers</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">Third-party Sharing</p>
              <p className="text-2xl font-bold text-purple-900">{Math.floor(stats.activeConsents * 0.35)}</p>
              <p className="text-xs text-purple-600 mt-1">Sharing allowed</p>
            </div>
            <Database className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">Analytics</p>
              <p className="text-2xl font-bold text-orange-900">{Math.floor(stats.activeConsents * 0.75)}</p>
              <p className="text-xs text-orange-600 mt-1">Analytics consent</p>
            </div>
            <BarChart3 className="w-10 h-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* PDPA Compliance Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">PDPA Compliance Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Compliant</h3>
            <p className="text-3xl font-bold text-green-600">{stats.complianceRate}%</p>
            <p className="text-sm text-green-600 mt-1">Meeting PDPA requirements</p>
          </div>
          
          <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pending Review</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingConsents}</p>
            <p className="text-sm text-yellow-600 mt-1">Awaiting customer action</p>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Audit Ready</h3>
            <p className="text-3xl font-bold text-blue-600">100%</p>
            <p className="text-sm text-blue-600 mt-1">Complete audit trail</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditTrail = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Consent Audit Trail</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">Complete log of consent changes and data processing activities</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Database className="w-4 h-4 mr-2" />
              Export Audit Log
            </button>
          </div>
        </div>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Consent Activities</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { action: 'Consent Granted', user: 'customer@example.com', category: 'Marketing', timestamp: '2 hours ago', status: 'success' },
            { action: 'Consent Revoked', user: 'user@telecom.lk', category: 'Third-party Sharing', timestamp: '4 hours ago', status: 'warning' },
            { action: 'Data Processing', user: 'system', category: 'Analytics', timestamp: '6 hours ago', status: 'info' },
            { action: 'Consent Updated', user: 'customer2@example.com', category: 'Service Improvement', timestamp: '8 hours ago', status: 'success' },
            { action: 'Consent Expired', user: 'olduser@example.com', category: 'Marketing', timestamp: '12 hours ago', status: 'error' },
          ].map((event, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.status === 'success' ? 'bg-green-100' :
                    event.status === 'warning' ? 'bg-yellow-100' :
                    event.status === 'error' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    {event.status === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                     event.status === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-600" /> :
                     event.status === 'error' ? <X className="w-5 h-5 text-red-600" /> :
                     <Eye className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.action}</p>
                    <p className="text-sm text-gray-500">{event.user} • {event.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{event.timestamp}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.status === 'success' ? 'bg-green-100 text-green-800' :
                    event.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    event.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Consent Management Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">Monitor consent preferences, compliance status, and key metrics</p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentView('consent-overview')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Consent Overview
            </button>
            <button
              onClick={() => setCurrentView('add-agreement')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Agreement
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Registered users</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Consents</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.activeConsents}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Valid consents</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Compliance Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.complianceRate}%</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">PDPA compliant</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">All product offerings</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Consents</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingConsents}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Awaiting approval</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Total Agreements</p>
              <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.totalAgreements}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">All agreements</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentView('consent-overview')}
            className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Consent Overview</p>
              <p className="text-sm text-gray-500">View all consents</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('audit-trail')}
            className="flex items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-3">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Audit Trail</p>
              <p className="text-sm text-gray-500">Review activities</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('add-agreement')}
            className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">New Agreement</p>
              <p className="text-sm text-gray-500">Create consent</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('products')}
            className="flex items-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Products</p>
              <p className="text-sm text-gray-500">Manage offerings</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'add-product':
        return <ProductOfferingForm onSubmit={handleAddProduct} />;
      case 'products':
        return <ProductList products={products} onDelete={handleDeleteProduct} />;
      case 'add-agreement':
        return <AgreementForm onSubmit={handleAddAgreement} onCancel={() => setCurrentView('dashboard')} />;
      case 'agreements':
        return <AgreementList agreements={agreements} onDelete={handleDeleteAgreement} />;
      case 'consent-overview':
        return renderConsentOverview();
      case 'audit-trail':
        return renderAuditTrail();
      default:
        return renderDashboardContent();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <p className="text-gray-600">Loading Consent Management System...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {renderSidebar()}
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-0 flex flex-col">
        {/* Professional Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between h-10">
            {/* Left side - Mobile menu button and title */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3 min-w-0">
                <div className="lg:hidden w-8 h-8 bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/SLTMobitel_Logo.svg.png" 
                    alt="Logo" 
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">{t('adminDashboard.title')}</h1>
              </div>
            </div>

            {/* Right side - Language Selector and User Profile Section */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <LanguageSelector />
              <div className="relative user-dropdown">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors h-10"
                >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500 capitalize">{user?.role}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>

              {/* User Dropdown */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserProfileOpen(true);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsUserProfileOpen(true);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {renderContent()}
        </div>

        {/* User Profile Modal */}
        <UserProfile 
          isOpen={isUserProfileOpen} 
          onClose={() => setIsUserProfileOpen(false)} 
        />

        {/* Notification Toast Container */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm w-full bg-white border-l-4 rounded-lg shadow-lg p-4 transition-all duration-300 transform ${
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
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-blue-500" />
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
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success'
                        ? 'text-green-400 hover:bg-green-50 focus:ring-green-600'
                        : notification.type === 'error'
                        ? 'text-red-400 hover:bg-red-50 focus:ring-red-600'
                        : 'text-blue-400 hover:bg-blue-50 focus:ring-blue-600'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
