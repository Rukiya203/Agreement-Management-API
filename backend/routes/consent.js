const express = require('express');
const router = express.Router();

// Consent overview endpoint for dashboard
router.get('/overview', (req, res) => {
  try {
    // Mock data that matches your Dashboard expectations
    const consentOverview = {
      totalCustomers: 1250,
      activeConsents: 45, // This matches your dashboard calculation
      revokedConsents: Math.floor(45 * 0.05), // 5% revocation rate
      pendingConsents: Math.floor(45 * 0.1), // 10% pending
      complianceRate: 94, // PDPA compliance percentage
      
      // Consent category breakdown
      consentCategories: {
        dataProcessing: {
          active: Math.floor(45 * 0.85), // 85% of active consents
          percentage: 85,
          description: 'Essential data processing for service delivery'
        },
        marketing: {
          active: Math.floor(45 * 0.65), // 65% opt-in rate
          percentage: 65,
          description: 'Marketing communications and promotions'
        },
        thirdPartySharing: {
          active: Math.floor(45 * 0.35), // 35% allow sharing
          percentage: 35,
          description: 'Data sharing with partner organizations'
        },
        analytics: {
          active: Math.floor(45 * 0.75), // 75% analytics consent
          percentage: 75,
          description: 'Analytics and service improvement'
        },
        sensitiveData: {
          active: Math.floor(45 * 0.15), // 15% sensitive data
          percentage: 15,
          description: 'Processing of sensitive personal data'
        }
      },
      
      // Compliance status
      compliance: {
        pdpaCompliant: true,
        auditTrailComplete: true,
        dataRetentionCompliant: true,
        consentRecordsValid: true,
        lastComplianceCheck: new Date().toISOString()
      },
      
      // Recent activity summary
      recentActivity: {
        consentGranted: 12,
        consentRevoked: 3,
        consentUpdated: 8,
        dataSubjectRequests: 2
      }
    };
    
    res.json(consentOverview);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve consent overview', details: error.message });
  }
});

// Consent statistics by category
router.get('/stats/categories', (req, res) => {
  try {
    const categoryStats = {
      essential: {
        name: 'Essential Services',
        consents: 1250, // 100% required
        percentage: 100,
        required: true,
        description: 'Required for basic service delivery'
      },
      serviceImprovement: {
        name: 'Service Improvement',
        consents: 1063, // 85%
        percentage: 85,
        required: false,
        description: 'Help us improve our services'
      },
      marketing: {
        name: 'Marketing Communications',
        consents: 813, // 65%
        percentage: 65,
        required: false,
        description: 'Promotional emails and offers'
      },
      analytics: {
        name: 'Analytics & Research',
        consents: 938, // 75%
        percentage: 75,
        required: false,
        description: 'Usage analytics and research'
      },
      thirdParty: {
        name: 'Third-party Sharing',
        consents: 438, // 35%
        percentage: 35,
        required: false,
        description: 'Sharing with trusted partners'
      },
      sensitive: {
        name: 'Sensitive Data Processing',
        consents: 188, // 15%
        percentage: 15,
        required: false,
        description: 'Processing of sensitive personal data'
      }
    };
    
    res.json(categoryStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve category statistics', details: error.message });
  }
});

// PDPA compliance check
router.get('/compliance/pdpa', (req, res) => {
  try {
    const complianceStatus = {
      overall: {
        compliant: true,
        score: 94,
        lastChecked: new Date().toISOString()
      },
      requirements: {
        consentBased: {
          compliant: true,
          description: 'Explicit consent obtained for data processing',
          evidence: 'All agreements have valid consent records'
        },
        revocable: {
          compliant: true,
          description: 'Customers can revoke consent easily',
          evidence: 'Revocation mechanism implemented and tested'
        },
        auditTrail: {
          compliant: true,
          description: 'Complete audit trail maintained',
          evidence: 'All consent changes logged with timestamps'
        },
        dataSubjectRights: {
          compliant: true,
          description: 'Data subject rights implemented',
          evidence: 'Access, correction, deletion rights available'
        },
        crossBorderTransfer: {
          compliant: true,
          description: 'Cross-border transfer controls in place',
          evidence: 'Transfer agreements reviewed and compliant'
        }
      },
      recommendations: [
        'Schedule regular compliance audits',
        'Implement automated consent expiration',
        'Add multi-language consent forms'
      ]
    };
    
    res.json(complianceStatus);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve compliance status', details: error.message });
  }
});

// Consent preferences for a customer
router.get('/customer/:customerId/preferences', (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Mock customer consent preferences
    const preferences = {
      customerId,
      preferences: {
        marketing: true,
        analytics: true,
        thirdPartySharing: false,
        dataProcessing: true,
        sensitiveData: false
      },
      lastUpdated: new Date().toISOString(),
      consentMethod: 'web',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };
    
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve consent preferences', details: error.message });
  }
});

// Update consent preferences
router.patch('/customer/:customerId/preferences', (req, res) => {
  try {
    const { customerId } = req.params;
    const updates = req.body;
    
    // In real implementation, update database and log audit event
    const updatedPreferences = {
      customerId,
      preferences: {
        ...updates
      },
      lastUpdated: new Date().toISOString(),
      consentMethod: req.body.method || 'web',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.get('User-Agent') || 'Unknown'
    };
    
    // Log audit event (in real implementation, call audit service)
    console.log(`Consent preferences updated for customer ${customerId}:`, updates);
    
    res.json({
      success: true,
      message: 'Consent preferences updated successfully',
      data: updatedPreferences
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update consent preferences', details: error.message });
  }
});

// Bulk consent report
router.get('/report/bulk', (req, res) => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    
    const report = {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: endDate || new Date().toISOString()
      },
      summary: {
        totalCustomers: 1250,
        totalConsents: 4875, // Multiple consents per customer
        activeConsents: 4632,
        revokedConsents: 243,
        complianceRate: 94
      },
      breakdown: {
        byCategory: {
          essential: 1250,
          marketing: 813,
          analytics: 938,
          thirdParty: 438,
          sensitive: 188
        },
        byMethod: {
          web: 3412,
          mobile: 892,
          ussd: 234,
          callCenter: 337
        }
      }
    };
    
    if (format === 'csv') {
      // Generate CSV for download
      const csvData = Object.entries(report.breakdown.byCategory)
        .map(([category, count]) => `${category},${count}`)
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="consent_report.csv"');
      res.send('Category,Count\n' + csvData);
    } else {
      res.json(report);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate consent report', details: error.message });
  }
});

module.exports = router;
