import { Agreement } from '../types/Agreement';

const API_BASE_URL = 'https://agreement-management-backend-production.up.railway.app/agreements';

export const agreementService = {
  async getAllAgreements(params?: {
    status?: string;
    engagedPartyId?: string;
    agreementType?: string;
    offset?: number;
    limit?: number;
  }): Promise<Agreement[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.engagedPartyId) searchParams.append('engagedPartyId', params.engagedPartyId);
    if (params?.agreementType) searchParams.append('agreementType', params.agreementType);
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await fetch(`${API_BASE_URL}?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agreements');
    }
    return response.json();
  },

  async getAgreementById(id: string): Promise<Agreement> {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch agreement');
    }
    return response.json();
  },

  // async createAgreement(agreement: Omit<Agreement, 'id' | 'createdDate' | 'href' | 'status' | 'audit'>): Promise<Agreement> {
  //   const response = await fetch(API_BASE_URL, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify(agreement),
  //   });
  //   if (!response.ok) {
  //     throw new Error('Failed to create agreement');
  //   }
  //   return response.json();
  // },
   async createAgreement(agreement: Omit<Agreement, 'id' | 'createdDate' | 'href' | 'status' | 'audit'>): Promise<Agreement> {
  // First, send the agreement
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(agreement),
    
  });

  alert('Creating agreement with data: ' + JSON.stringify(agreement));

  
  for (const item of agreement.agreementItem) {
    for (const po of item.productOffering) {
      console.log('Product Offering ID:', po.href);
      console.log('Product Offering Name:', po.id);

      

      const fullUrl = `${po.href}/${po.id}`;



      // Optional: fetch data from each po.href
      try {
        const poResponse = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!poResponse.ok) {
          console.warn(`Failed to fetch product offering at ${po.href}`);
        } else {
          const poData = await poResponse.json();
          
          console.log('Product Offering Response:', poData);
        }
      } catch (error) {
        console.error('Error fetching product offering:', error);
      }
    }
  }

  if (!response.ok) {
    throw new Error('Failed to create agreement');
  }

  return response.json();
},

  async updateAgreement(id: string, agreement: Partial<Agreement>): Promise<Agreement> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agreement),
    });
    if (!response.ok) {
      throw new Error('Failed to update agreement');
    }
    return response.json();
  },

  async deleteAgreement(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete agreement');
    }
  },
};