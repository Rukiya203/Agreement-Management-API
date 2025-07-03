import React, { useState } from 'react';
import {
  Save,
  AlertCircle,
  Trash2,
  Plus,
  Calendar,
  Loader
} from 'lucide-react';
import { ProductOffering } from '../types/ProductOffering';

// Types
interface ProductCategory {
  '@type': string;
  '@referredType': string;
  id: string;
  href: string;
  name: string;
  version: string;
}

interface Place {
  '@type': string;
  '@referredType': string;
  id: string;
  href: string;
  name: string;
}

interface ProductSpecificationRef {
  '@type': string;
  '@referredType': string;
  id: string;
  href: string;
  name: string;
  version: string;
}

interface ValidFor {
  startDateTime: string;
  endDateTime: string;
}

interface ProductFormData {
  '@type': string;
  id: string;
  href?: string;
  name: string;
  description: string;
  version: string;
  validFor: ValidFor;
  lastUpdate: string;
  lifecycleStatus: string;
  isBundle: boolean;
  isSellable: boolean;
  statusReason: string;
  productSpecification: ProductSpecificationRef;
  category: ProductCategory[];
  place: Place[];
}

interface Errors {
  name?: string;
  description?: string;
  specName?: string;
  specId?: string;
  specHref?: string;
  startDateTime?: string;
  endDateTime?: string;
  id?: string;
}

interface ProductOfferingFormProps {
  onSubmit: (product: ProductOffering) => void;
  // Add other props here if needed
}

const ProductOfferingForm: React.FC<ProductOfferingFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    '@type': 'ProductOffering',
    id: '', // Will be validated before submit
    href: '',
    name: '',
    description: '',
    version: '1.0',
    validFor: {
      startDateTime: new Date().toISOString(),
      endDateTime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    lastUpdate: new Date().toISOString(),
    lifecycleStatus: 'Active',
    isBundle: false,
    isSellable: true,
    statusReason: 'Released for sale',
    productSpecification: {
      '@type': 'ProductSpecificationRef',
      '@referredType': 'ProductSpecification',
      id: '',
      href: '',
      name: '',
      version: ''
    },
    category: [],
    place: []
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validate Form
  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    if (!formData.id?.trim()) newErrors.id = 'ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.productSpecification.name.trim())
      newErrors.specName = 'Product specification name is required';
    if (!formData.productSpecification.id.trim())
      newErrors.specId = 'Product specification ID is required';
    if (!formData.productSpecification.href?.trim())
      newErrors.specHref = 'Product specification href is required';
    if (!formData.validFor.startDateTime)
      newErrors.startDateTime = 'Start date is required';
    if (!formData.validFor.endDateTime)
      newErrors.endDateTime = 'End date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      ...formData,
      lastUpdate: new Date().toISOString(), // Always use current timestamp
    };
     

    try {
      const response = await fetch(
       
        'https://tm-forum-production.up.railway.app/tmf-api/productCatalogManagement/v5/productOffering',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save product offering: ${errorText}`);
      }

      const result = await response.json();
      console.log('Product Offering saved:', result);
      showMessage('Product successfully created!', 'success');
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting product:', error);
      showMessage('Failed to submit product offering.', 'error');
      setIsSubmitting(false);
    }
  };

  // Date Change Handler
  const handleDateChange = (
    field: 'startDateTime' | 'endDateTime',
    value: string
  ) => {
    if (!value) return;

    const date = new Date(value);
    const isoValue = date.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"

    setFormData(prev => ({
      ...prev,
      validFor: {
        ...prev.validFor,
        [field]: isoValue
      }
    }));
  };

  // Dynamic Fields: Places
  const addPlace = () => {
    setFormData(prev => ({
      ...prev,
      place: [
        ...prev.place,
        {
          '@type': 'PlaceRef',
          '@referredType': 'GeographicAddress',
          id: '',
          href: '',
          name: ''
        }
      ]
    }));
  };

  const updatePlace = (index: number, field: keyof Place, value: string) => {
    setFormData(prev => ({
      ...prev,
      place: prev.place.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    }));
  };

  const removePlace = (index: number) => {
    setFormData(prev => ({
      ...prev,
      place: prev.place.filter((_, i) => i !== index)
    }));
  };

  // Dynamic Fields: Categories
  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      category: [
        ...prev.category,
        {
          '@type': 'CategoryRef',
          '@referredType': 'Category',
          id: '',
          href: '',
          name: '',
          version: ''
        }
      ]
    }));
  };

  const updateCategory = (index: number, field: keyof ProductCategory, value: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.map((c, i) =>
        i === index ? { ...c, [field]: value } : c
      )
    }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter((_, i) => i !== index)
    }));
  };

  // Helper: Show message
  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    alert(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold">Add New Product Offering</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Basic Info */}
          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  placeholder="Enter unique ID"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.id}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) =>
                    setFormData({ ...formData, version: e.target.value })
                  }
                  placeholder="e.g., 1.0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Basic Firewall for Business"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.name}
                  </p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the product..."
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-vertical ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                ></textarea>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lifecycle Status</label>
                <select
                  value={formData.lifecycleStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lifecycleStatus: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Planned">Planned</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status Reason</label>
                <input
                  type="text"
                  value={formData.statusReason}
                  onChange={(e) =>
                    setFormData({ ...formData, statusReason: e.target.value })
                  }
                  placeholder="e.g., Released for sale"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Valid Period */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Valid Period</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.validFor.startDateTime.slice(0, 16)}
                  onChange={(e) => handleDateChange('startDateTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDateTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.startDateTime && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.startDateTime}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  value={formData.validFor.endDateTime.slice(0, 16)}
                  onChange={(e) => handleDateChange('endDateTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDateTime ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.endDateTime && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.endDateTime}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Product Specification */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Product Specification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID *</label>
                <input
                  type="text"
                  value={formData.productSpecification.id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productSpecification: {
                        ...formData.productSpecification,
                        id: e.target.value
                      }
                    })
                  }
                  placeholder="e.g., SPEC-001"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.specId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.specId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.specId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.productSpecification.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productSpecification: {
                        ...formData.productSpecification,
                        name: e.target.value
                      }
                    })
                  }
                  placeholder="e.g., Robotics999"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.specName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.specName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.specName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HREF *</label>
                <input
                  type="url"
                  value={formData.productSpecification.href}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productSpecification: {
                        ...formData.productSpecification,
                        href: e.target.value
                      }
                    })
                  }
                  placeholder="https://api.example.com/spec/123" 
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.specHref ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.specHref && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> {errors.specHref}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                <input
                  type="text"
                  value={formData.productSpecification.version}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productSpecification: {
                        ...formData.productSpecification,
                        version: e.target.value
                      }
                    })
                  }
                  placeholder="e.g., 1.1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Places */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Places</h2>
              <button
                type="button"
                onClick={addPlace}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Place
              </button>
            </div>

            {formData.place.map((place, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place ID</label>
                    <input
                      type="text"
                      value={place.id}
                      onChange={(e) => updatePlace(index, 'id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place Name</label>
                    <input
                      type="text"
                      value={place.name}
                      onChange={(e) => updatePlace(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HREF</label>
                    <input
                      type="url"
                      value={place.href}
                      onChange={(e) => updatePlace(index, 'href', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removePlace(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove Place
                </button>
              </div>
            ))}
          </section>

          {/* Categories */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Categories</h2>
              <button
                type="button"
                onClick={addCategory}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {formData.category.map((category, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
                    <input
                      type="text"
                      value={category.id}
                      onChange={(e) => updateCategory(index, 'id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
                    <input
                      type="text"
                      value={category.version}
                      onChange={(e) => updateCategory(index, 'version', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HREF</label>
                    <input
                      type="url"
                      value={category.href}
                      onChange={(e) => updateCategory(index, 'href', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" /> Remove Category
                </button>
              </div>
            ))}
          </section>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin w-5 h-5" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Save Product
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {submitSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              ✅ Product successfully created!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductOfferingForm;