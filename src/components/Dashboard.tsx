import React, { useEffect, useState } from 'react';
import { Plus, Package, BarChart3, Settings, FileText, Users, TrendingUp, Menu, X, User, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ProductOfferingForm from './ProductOfferingForm';
import ProductList from './ProductList';
import AgreementForm from './AgreementForm';
import AgreementList from './AgreementList';
import UserProfile from './UserProfile';
import type { ProductOffering } from '../types/ProductOffering';
import type { Agreement } from '../types/Agreement';
import { agreementService } from '../services/agreementService';

type View = 'dashboard' | 'add-product' | 'products' | 'add-agreement' | 'agreements';

interface Notification {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const Dashboard: React.FC = () => {
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

  const showNotification = (type: 'success' | 'error', message: string) => {
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

          setProducts(productData);
        }

        // Fetch agreements
        try {
          const agreementData = await agreementService.getAllAgreements();
          setAgreements(agreementData);
        } catch (agreementError) {
          console.warn('Agreement service not available:', agreementError);
          // Continue without agreements if service is not available
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
    
    // Since the API doesn't return status field, let's use different logic
    // Count agreements as "active" if they exist and have valid data
    const activeAgreements = agreements.filter(a => 
      a.id && a.name && !a.status // If no status field, consider them active
    ).length;
    
    // For "in process", we can use agreements that might have recent updates
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const inProcessAgreements = agreements.filter(a => {
      const createdDate = new Date(a.createdDate);
      const updatedDate = a.updatedDate ? new Date(a.updatedDate) : null;
      
      // Consider as "in process" if created recently or updated recently
      return (createdDate > thirtyDaysAgo) || (updatedDate && updatedDate > thirtyDaysAgo);
    }).length;
    
    return {
      totalProducts: products.length,
      activeProducts,
      sellableProducts,
      bundleProducts,
      totalAgreements: agreements.length,
      activeAgreements,
      inProcessAgreements
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
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-600 hidden" />
            </div>
            
            {/* Close button for mobile */}
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

  const renderDashboardContent = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">Monitor your product offerings, agreements, and key metrics</p>
          </div>
          <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setCurrentView('add-product')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
            <button
              onClick={() => setCurrentView('add-agreement')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Agreement
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
              <p className="text-sm font-medium text-gray-600 mb-1">Active Products</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.activeProducts}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Currently active</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">Active Agreements</p>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{stats.activeAgreements}</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-500">Valid agreements</span>
              </div>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Products</h2>
                  <p className="text-sm text-gray-600">Latest product offerings</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('products')}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{product.name}</h3>
                      <p className="text-xs text-gray-500">Version {product.version} • Created {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.lifecycleStatus === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.lifecycleStatus}
                    </span>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No products available</p>
                  <button
                    onClick={() => setCurrentView('add-product')}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Create your first product
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Agreements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Agreements</h2>
                  <p className="text-sm text-gray-600">Latest customer agreements</p>
                </div>
              </div>
              <button
                onClick={() => setCurrentView('agreements')}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {agreements.slice(0, 5).map((agreement, index) => (
                <div key={agreement.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-600">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-gray-900 truncate text-sm">{agreement.name}</h3>
                      <p className="text-xs text-gray-500">Type: {agreement.agreementType} • Created {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agreement.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : agreement.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {agreement.status}
                    </span>
                  </div>
                </div>
              ))}
              {agreements.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No agreements available</p>
                  <button
                    onClick={() => setCurrentView('add-agreement')}
                    className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Create your first agreement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCurrentView('add-product')}
            className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-500">Create new offering</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('add-agreement')}
            className="flex items-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Agreement</p>
              <p className="text-sm text-gray-500">Create new agreement</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('products')}
            className="flex items-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Products</p>
              <p className="text-sm text-gray-500">Manage offerings</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentView('agreements')}
            className="flex items-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View Agreements</p>
              <p className="text-sm text-gray-500">Manage contracts</p>
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
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">Consent Management System</h1>
              </div>
            </div>

            {/* Right side - User Profile Section */}
            <div className="relative user-dropdown flex-shrink-0">
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
                  : 'border-red-500'
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    notification.type === 'success' ? 'text-green-800' : 'text-red-800'
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
                        : 'text-red-400 hover:bg-red-50 focus:ring-red-600'
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