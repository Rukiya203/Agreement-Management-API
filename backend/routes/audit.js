const express = require('express');
const router = express.Router();

// Mock audit events for demonstration
let auditEvents = [
  {
    id: 'evt_001',
    eventType: 'ConsentGranted',
    customerId: 'cust_001',
    agreementId: 'agr_001',
    userId: 'user_admin',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    details: {
      consentType: 'Marketing',
      action: 'Consent granted for email marketing',
      method: 'web'
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'evt_002',
    eventType: 'ConsentRevoked',
    customerId: 'cust_002',
    agreementId: 'agr_002',
    userId: 'user_system',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    details: {
      consentType: 'ThirdPartySharing',
      action: 'Customer revoked third-party data sharing consent',
      method: 'mobile'
    },
    ipAddress: '192.168.1.2',
    userAgent: 'Mobile App v1.2.0'
  },
  {
    id: 'evt_003',
    eventType: 'DataProcessing',
    customerId: 'cust_001',
    agreementId: null,
    userId: 'system',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    details: {
      consentType: 'Analytics',
      action: 'Customer data processed for analytics',
      purpose: 'Service improvement'
    },
    ipAddress: '10.0.0.1',
    userAgent: 'System/1.0'
  },
  {
    id: 'evt_004',
    eventType: 'ConsentUpdated',
    customerId: 'cust_001',
    agreementId: 'agr_003',
    userId: 'cust_001',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    details: {
      consentType: 'ServiceImprovement',
      action: 'Customer updated service improvement preferences',
      method: 'web'
    },
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 'evt_005',
    eventType: 'ConsentExpired',
    customerId: 'cust_003',
    agreementId: 'agr_004',
    userId: 'system',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    details: {
      consentType: 'Marketing',
      action: 'Marketing consent expired after 12 months',
      reason: 'Automatic expiration'
    },
    ipAddress: '10.0.0.1',
    userAgent: 'System/1.0'
  }
];

// TMF688 Event Management API

// GET /tmf-api/eventManagement/v4/event
router.get('/', (req, res) => {
  try {
    const { 
      limit = 10, 
      offset = 0, 
      customerId, 
      eventType, 
      fromDate, 
      toDate 
    } = req.query;
    
    let filteredEvents = [...auditEvents];
    
    // Apply filters
    if (customerId) {
      filteredEvents = filteredEvents.filter(e => e.customerId === customerId);
    }
    
    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === eventType);
    }
    
    if (fromDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) >= new Date(fromDate));
    }
    
    if (toDate) {
      filteredEvents = filteredEvents.filter(e => new Date(e.timestamp) <= new Date(toDate));
    }
    
    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const paginatedEvents = filteredEvents.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      events: paginatedEvents,
      totalCount: filteredEvents.length,
      hasMore: parseInt(offset) + parseInt(limit) < filteredEvents.length,
      filters: { customerId, eventType, fromDate, toDate }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit events', details: error.message });
  }
});

// GET /tmf-api/eventManagement/v4/event/{id}
router.get('/:id', (req, res) => {
  try {
    const event = auditEvents.find(e => e.id === req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Audit event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit event', details: error.message });
  }
});

// POST /tmf-api/eventManagement/v4/event
router.post('/', (req, res) => {
  try {
    const newEvent = {
      id: `evt_${Date.now()}`,
      eventType: req.body.eventType,
      customerId: req.body.customerId,
      agreementId: req.body.agreementId || null,
      userId: req.body.userId || 'system',
      timestamp: new Date().toISOString(),
      details: req.body.details || {},
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    auditEvents.unshift(newEvent); // Add to beginning for chronological order
    
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create audit event', details: error.message });
  }
});

// GET audit statistics for dashboard
router.get('/stats/overview', (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentEvents = auditEvents.filter(e => new Date(e.timestamp) >= last24Hours);
    const weeklyEvents = auditEvents.filter(e => new Date(e.timestamp) >= last7Days);
    
    // Event type statistics
    const eventTypeStats = {};
    auditEvents.forEach(event => {
      eventTypeStats[event.eventType] = (eventTypeStats[event.eventType] || 0) + 1;
    });
    
    res.json({
      totalEvents: auditEvents.length,
      recentEvents: recentEvents.length,
      weeklyEvents: weeklyEvents.length,
      eventTypeBreakdown: eventTypeStats,
      complianceStatus: {
        auditTrailComplete: true,
        dataRetentionCompliant: true,
        lastAuditDate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve audit statistics', details: error.message });
  }
});

// GET export audit trail (for compliance reporting)
router.get('/export/csv', (req, res) => {
  try {
    const { customerId, fromDate, toDate } = req.query;
    
    let exportEvents = [...auditEvents];
    
    // Apply filters
    if (customerId) {
      exportEvents = exportEvents.filter(e => e.customerId === customerId);
    }
    
    if (fromDate) {
      exportEvents = exportEvents.filter(e => new Date(e.timestamp) >= new Date(fromDate));
    }
    
    if (toDate) {
      exportEvents = exportEvents.filter(e => new Date(e.timestamp) <= new Date(toDate));
    }
    
    // Generate CSV content
    const csvHeader = 'ID,Event Type,Customer ID,Agreement ID,User ID,Timestamp,Action,IP Address\n';
    const csvContent = exportEvents.map(event => 
      `${event.id},${event.eventType},${event.customerId || ''},${event.agreementId || ''},${event.userId},${event.timestamp},"${event.details.action || ''}",${event.ipAddress}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_trail_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvHeader + csvContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export audit trail', details: error.message });
  }
});

// Helper function to log consent events
const logConsentEvent = (eventType, customerId, agreementId, userId, details) => {
  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventType,
    customerId,
    agreementId,
    userId,
    timestamp: new Date().toISOString(),
    details,
    ipAddress: '127.0.0.1', // In real implementation, get from request
    userAgent: 'System/1.0'
  };
  
  auditEvents.unshift(event);
  return event;
};

// Export helper function for use in other modules
router.logConsentEvent = logConsentEvent;

module.exports = router;
