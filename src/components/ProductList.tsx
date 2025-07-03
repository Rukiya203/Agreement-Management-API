import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Package, Calendar, MapPin, Tag } from 'lucide-react';
import { ProductOffering } from '../types/ProductOffering';

interface ProductListProps {
  products: ProductOffering[];
  onDelete: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<ProductOffering | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.lifecycleStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const ProductDetailModal = ({ product, onClose }: { product: ProductOffering; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">ID:</span>
                  <p className="text-gray-900">{product.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Version:</span>
                  <p className="text-gray-900">{product.version}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    product.lifecycleStatus === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.lifecycleStatus}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Description:</span>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Bundle:</span>
                  <p className="text-gray-900">{product.isBundle ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Sellable:</span>
                  <p className="text-gray-900">{product.isSellable ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Status Reason:</span>
                  <p className="text-gray-900">{product.statusReason}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Last Update:</span>
                  <p className="text-gray-900">{formatDate(product.lastUpdate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Validity Period</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Start Date:</span>
                <p className="text-gray-900">{formatDate(product.validFor.startDateTime)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">End Date:</span>
                <p className="text-gray-900">{formatDate(product.validFor.endDateTime)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Specification</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Name:</span>
                  <p className="text-gray-900">{product.productSpecification.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">ID:</span>
                  <p className="text-gray-900">{product.productSpecification.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Version:</span>
                  <p className="text-gray-900">{product.productSpecification.version}</p>
                </div>
              </div>
            </div>
          </div>

          {product.place.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Places</h3>
              <div className="space-y-3">
                {product.place.map((place, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{place.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">ID: {place.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.category.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {product.category.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleBuy = (product: ProductOffering) => {
    // Replace this with your actual buy logic (e.g., redirect to checkout, open modal, etc.)
    alert(`You have bought ${product.id}!`);
  };

  const ProductOrderForm = ({ product, onClose }: { product: ProductOffering; onClose: () => void }) => {
    const [form, setForm] = useState({
      category: 'B2B product order',
      description: `New order for ${product.name}`,
      externalId: [{ id: 'PO123456', owner: 'TMF', externalIdentifierType: 'POnumber' }],
      priority: 2,
      requestedCompletionDate: '',
      requestedStartDate: '',
      productOrderItem: [
        {
          id: product.id,
          quantity: 1,
          action: 'add',
          product: {
            isBundle: product.isBundle,
            '@type': product.productSpecification.name,
            productSpecification: {
              id: product.productSpecification.id,
              href: product.productSpecification.href,
              version: product.productSpecification.version,
              name: product.productSpecification.name,
              '@type': 'ProductSpecificationRef'
            }
          },
          '@type': 'ProductOrderItem'
        }
      ],
      relatedParty: [
        {
          role: 'Seller',
          partyOrPartyRole: {
            id: 'seller-001',
            href: 'https://host:port/partyManagement/v5/individual/seller-001',
            name: 'Alice Telecom',
            '@type': 'PartyRef',
            '@referredType': 'Individual'
          },
          '@type': 'RelatedPartyRefOrPartyRoleRef'
        },
        {
          role: 'Customer',
          partyOrPartyRole: {
            id: 'customer-001',
            href: 'https://host:port/partyRoleManagement/v5/customer/customer-001',
            name: 'Jean Pontus',
            '@type': 'PartyRoleRef',
            '@referredType': 'Customer'
          },
          '@type': 'RelatedPartyRefOrPartyRoleRef'
        }
      ],
      state: 'inProgress'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await fetch('https://valiant-expression-production.up.railway.app/tmf-api/productOrderingManagement/v5/productOrder/productOrder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ '@type': 'ProductOrder', ...form }),
        });
        if (response.ok) {
          alert('Order submitted!');
          onClose();
        } else {
          alert('Order failed!');
        }
      } catch (err) {
        alert('Order failed!');
      }
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
          <h2 className="text-xl font-bold mb-2">Product Order for {product.name}</h2>
          <label>
            Category:
            <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </label>
          <label>
            Description:
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </label>
          <label>
            Priority:
            <input name="priority" type="number" value={form.priority} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </label>
          <label>
            Requested Start Date:
            <input name="requestedStartDate" type="datetime-local" value={form.requestedStartDate} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </label>
          <label>
            Requested Completion Date:
            <input name="requestedCompletionDate" type="datetime-local" value={form.requestedCompletionDate} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </label>
          <label>
            Quantity:
            <input
              name="quantity"
              type="number"
              value={form.productOrderItem[0].quantity}
              onChange={e => setForm({
                ...form,
                productOrderItem: [
                  { ...form.productOrderItem[0], quantity: Number(e.target.value) }
                ]
              })}
              className="w-full border rounded px-2 py-1"
              required
            />
          </label>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product Offerings</h1>
        <p className="text-gray-600 mt-2">Manage and view all your product offerings</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Planned">Planned</option>
              <option value="Obsolete">Obsolete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
                    <p className="text-sm text-gray-500">v{product.version}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  product.lifecycleStatus === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.lifecycleStatus}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  Valid until {formatDate(product.validFor.endDateTime)}
                </div>
                {product.place.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    {product.place[0].name}
                    {product.place.length > 1 && ` +${product.place.length - 1} more`}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  {product.isBundle && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Bundle</span>
                  )}
                  {product.isSellable && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Sellable</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
  onClick={async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    

   try {
  const response = await fetch(
    `https://tm-forum-production.up.railway.app/tmf-api/productCatalogManagement/v5/productOffering/${product.id}`,
                                                 
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete product: ${errorText}`);
  }

  // Call parent delete function to update UI
  onDelete(product.id);
  alert('🗑️ Product deleted successfully!');
} catch (error) {
  console.error('Delete failed:', error);
  alert('❌ Failed to delete product from server.');
}
  }}
  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
  title="Delete Product"
>
  <Trash2 className="w-4 h-4" />
</button>

                
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsOrderFormOpen(true);
                    }}
                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Buy Product"
                  >
                    Buy
                  </button>
                  <button
  onClick={async () => {
    console.log('product id eka yKO', product.id);
    const fullUrl = `https://agreement-management-backend-production.up.railway.app/agreements`;
    
    try {
      const response = await fetch(
        `${fullUrl}`, 
        {
          method: 'GET',
          
        }
      );
      console.log('Response status:', response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to view product: ${errorText}`);
      }

      const agreementData = await response.json(); // 📥 Parse JSON response
      // console.log('Fetched Agreement:', agreementData);
      for (const agreement of agreementData) {
        // console.log('Agreement ID:', agreement);
        for(const item of agreement.agreementItem) {
          console.log('Agreement Item ID:', item);
          // if (item.productOffering.id === product.id) {
          //   console.log('Matching Product Offering ID:', product.id);
          //   console.log('Matching Agreement Item Product Offering ID:', item.productOffering.id);
          //   console.log('Agreement Item:', item);
          // } else {
          //   console.log('No matching Product Offering ID found for:', product.id);
          // }
        }

        // console.log('Agreement ID hhhhhhhhh:', agreement.id);
        // console.log('Agreement Name:', agreement.name);
        for(const item of agreement.agreementItem) {
          // console.log('Agreement Item ID issssssssssssssssssssssssss:', item.id);
          if ('7609' === '7609') {
            // console.log('Matching Product Offering ID peenpn:', product.id);

            // console.log('Matching Product Offering ID bnnnnn:', item.productOffering.id);
            // console.log('Agreement Item:', item);
          }else{
            // console.log('No matching Product Offering ID found for:', product.id);
          }

        }
//         console.log('Agreement ID ekd hfhfhfhfn:', agreement.
// agreementItem

        // console.log('Agreement Name:', agreement.name);
        // console.log('Agreement Description:', agreement.description);
      }

      // Optional: Update UI or open modal with fetched data
      // setSelectedProduct(agreementData);
      // setIsOrderFormOpen(true);

    } catch (error) {
      console.error('View failed:', error);
      alert(' Failed to load agreement from server.');
    }
  }}
  className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
  title="View Agreement"
  type="button" // 👈 Prevents accidental form submission
>
  View Agreement
</button>
                  {/* <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setIsOrderFormOpen(true);
                    }}
                    className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Buy Product"
                  >
                    Buy
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {isOrderFormOpen && selectedProduct && (
        <ProductOrderForm
          product={selectedProduct}
          onClose={() => setIsOrderFormOpen(false)}
        />
      )}
    </div>
  );
};

export default ProductList;