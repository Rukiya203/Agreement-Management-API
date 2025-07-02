const express = require('express');
const router = express.Router();

// Mock customer data for demonstration
let customers = [
  {
    id: 'cust_001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+94771234567',
    preferredLanguage: 'en',
    consentPreferences: {
      marketing: true,
      analytics: true,
      thirdPartySharing: false,
      dataProcessing: true
    },
    createdDate: new Date().toISOString(),
    status: 'Active'
  },
  {
    id: 'cust_002', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+94771234568',
    preferredLanguage: 'en',
    consentPreferences: {
      marketing: false,
      analytics: true,
      thirdPartySharing: false,
      dataProcessing: true
    },
    createdDate: new Date().toISOString(),
    status: 'Active'
  }
];

// TMF629 Customer Management API

// GET /tmf-api/customerManagement/v4/customer
router.get('/', (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const paginatedCustomers = customers.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      customers: paginatedCustomers,
      totalCount: customers.length,
      hasMore: parseInt(offset) + parseInt(limit) < customers.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customers', details: error.message });
  }
});

// GET /tmf-api/customerManagement/v4/customer/{id}
router.get('/:id', (req, res) => {
  try {
    const customer = customers.find(c => c.id === req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customer', details: error.message });
  }
});

// POST /tmf-api/customerManagement/v4/customer
router.post('/', (req, res) => {
  try {
    const newCustomer = {
      id: `cust_${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      preferredLanguage: req.body.preferredLanguage || 'en',
      consentPreferences: req.body.consentPreferences || {
        marketing: false,
        analytics: false,
        thirdPartySharing: false,
        dataProcessing: true
      },
      createdDate: new Date().toISOString(),
      status: 'Active'
    };
    
    customers.push(newCustomer);
    
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create customer', details: error.message });
  }
});

// PATCH /tmf-api/customerManagement/v4/customer/{id}
router.patch('/:id', (req, res) => {
  try {
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Update customer data
    customers[customerIndex] = {
      ...customers[customerIndex],
      ...req.body,
      updatedDate: new Date().toISOString()
    };
    
    res.json(customers[customerIndex]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update customer', details: error.message });
  }
});

// GET /tmf-api/customerManagement/v4/customer/{id}/consents
router.get('/:id/consents', (req, res) => {
  try {
    const customer = customers.find(c => c.id === req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      customerId: customer.id,
      consentPreferences: customer.consentPreferences,
      lastUpdated: customer.updatedDate || customer.createdDate
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve consent preferences', details: error.message });
  }
});

// PATCH /tmf-api/customerManagement/v4/customer/{id}/consents
router.patch('/:id/consents', (req, res) => {
  try {
    const customerIndex = customers.findIndex(c => c.id === req.params.id);
    
    if (customerIndex === -1) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Update consent preferences
    customers[customerIndex].consentPreferences = {
      ...customers[customerIndex].consentPreferences,
      ...req.body
    };
    customers[customerIndex].updatedDate = new Date().toISOString();
    
    // Log the consent change for audit trail
    console.log(`Consent updated for customer ${req.params.id}:`, req.body);
    
    res.json({
      customerId: customers[customerIndex].id,
      consentPreferences: customers[customerIndex].consentPreferences,
      lastUpdated: customers[customerIndex].updatedDate
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update consent preferences', details: error.message });
  }
});

// GET customer statistics for dashboard
router.get('/stats/overview', (req, res) => {
  try {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    
    // Calculate consent statistics
    const marketingOptIns = customers.filter(c => c.consentPreferences.marketing).length;
    const analyticsOptIns = customers.filter(c => c.consentPreferences.analytics).length;
    const thirdPartyOptIns = customers.filter(c => c.consentPreferences.thirdPartySharing).length;
    
    res.json({
      totalCustomers,
      activeCustomers,
      consentStats: {
        marketing: {
          optIns: marketingOptIns,
          percentage: Math.round((marketingOptIns / totalCustomers) * 100)
        },
        analytics: {
          optIns: analyticsOptIns,
          percentage: Math.round((analyticsOptIns / totalCustomers) * 100)
        },
        thirdPartySharing: {
          optIns: thirdPartyOptIns,
          percentage: Math.round((thirdPartyOptIns / totalCustomers) * 100)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve customer statistics', details: error.message });
  }
});

module.exports = router;
