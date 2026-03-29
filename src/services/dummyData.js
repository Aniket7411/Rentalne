// DUMMY DATA - Easy to replace with API calls
// All functions return promises to simulate API behavior

// Dummy AC listings
export const dummyACs = [
  {
    id: '1',
    vendorId: 'vendor1',
    vendorName: 'Cool Air Solutions',
    images: [
      'https://images.unsplash.com/photo-1631541957885-e8a0b77b0a2c?w=500',
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    ],
    brand: 'LG',
    model: 'LG 1.5 Ton 5 Star Split AC',
    capacity: '1.5 Ton',
    type: 'Split',
    description: 'Energy efficient 5-star rated split AC with inverter technology. Perfect for medium-sized rooms.',
    location: 'Mumbai, Maharashtra',
    price: {
      monthly: 2500,
      quarterly: 7000,
      yearly: 25000,
    },
    status: 'Available',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    vendorId: 'vendor1',
    vendorName: 'Cool Air Solutions',
    images: [
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    ],
    brand: 'Samsung',
    model: 'Samsung 1 Ton 3 Star Window AC',
    capacity: '1 Ton',
    type: 'Window',
    description: 'Compact window AC ideal for small rooms. 3-star energy rating with auto-clean feature.',
    location: 'Delhi, NCR',
    price: {
      monthly: 1800,
      quarterly: 5000,
      yearly: 18000,
    },
    status: 'Available',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    vendorId: 'vendor2',
    vendorName: 'Frosty Rentals',
    images: [
      'https://images.unsplash.com/photo-1631541957885-e8a0b77b0a2c?w=500',
    ],
    brand: 'Daikin',
    model: 'Daikin 2 Ton 5 Star Split AC',
    capacity: '2 Ton',
    type: 'Split',
    description: 'Premium 2-ton split AC with advanced air purification and Wi-Fi connectivity.',
    location: 'Bangalore, Karnataka',
    price: {
      monthly: 3500,
      quarterly: 10000,
      yearly: 35000,
    },
    status: 'Rented Out',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    vendorId: 'vendor2',
    vendorName: 'Frosty Rentals',
    images: [
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    ],
    brand: 'Voltas',
    model: 'Voltas 1.5 Ton 4 Star Split AC',
    capacity: '1.5 Ton',
    type: 'Split',
    description: 'Reliable 1.5-ton split AC with turbo cooling and sleep mode.',
    location: 'Pune, Maharashtra',
    price: {
      monthly: 2200,
      quarterly: 6200,
      yearly: 22000,
    },
    status: 'Available',
    createdAt: '2024-01-18',
  },
  {
    id: '5',
    vendorId: 'vendor3',
    vendorName: 'Arctic Services',
    images: [
      'https://images.unsplash.com/photo-1631541957885-e8a0b77b0a2c?w=500',
    ],
    brand: 'Hitachi',
    model: 'Hitachi 1 Ton 5 Star Window AC',
    capacity: '1 Ton',
    type: 'Window',
    description: 'Compact and efficient window AC with eco-friendly refrigerant.',
    location: 'Chennai, Tamil Nadu',
    price: {
      monthly: 2000,
      quarterly: 5600,
      yearly: 20000,
    },
    status: 'Available',
    createdAt: '2024-01-22',
  },
  {
    id: '6',
    vendorId: 'vendor3',
    vendorName: 'Arctic Services',
    images: [
      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    ],
    brand: 'Blue Star',
    model: 'Blue Star 2.5 Ton 5 Star Split AC',
    capacity: '2.5 Ton',
    type: 'Split',
    description: 'Powerful 2.5-ton AC for large spaces with advanced cooling technology.',
    location: 'Hyderabad, Telangana',
    price: {
      monthly: 4500,
      quarterly: 13000,
      yearly: 45000,
    },
    status: 'Under Maintenance',
    createdAt: '2024-01-12',
  },
];

// Dummy service leads
export const dummyServiceLeads = [
  {
    id: 'lead1',
    userId: 'user1',
    userName: 'Rajesh Kumar',
    acType: 'Split',
    brand: 'LG',
    model: 'LG 1.5 Ton',
    description: 'AC not cooling properly, making strange noise',
    address: '123 Main Street, Mumbai',
    contactNumber: '+91 9876543210',
    images: ['https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500'],
    status: 'New',
    createdAt: '2024-01-25',
  },
  {
    id: 'lead2',
    userId: 'user2',
    userName: 'Priya Sharma',
    acType: 'Window',
    brand: 'Samsung',
    model: 'Samsung 1 Ton',
    description: 'AC leaking water, needs immediate repair',
    address: '456 Park Avenue, Delhi',
    contactNumber: '+91 9876543211',
    images: [],
    status: 'Contacted',
    createdAt: '2024-01-24',
  },
];

// Dummy user rentals and service requests
export const dummyUserRentals = [
  {
    id: 'rental1',
    acId: '1',
    acDetails: dummyACs[0],
    status: 'Active',
    startDate: '2024-01-15',
    duration: 'Monthly',
    vendorName: 'Cool Air Solutions',
  },
];

export const dummyUserServiceRequests = [
  {
    id: 'service1',
    acType: 'Split',
    brand: 'LG',
    model: 'LG 1.5 Ton',
    description: 'AC not cooling properly',
    address: '123 Main Street, Mumbai',
    contactNumber: '+91 9876543210',
    status: 'Pending',
    createdAt: '2024-01-20',
  },
];

// API-like functions (replace these with actual API calls)
export const apiService = {
  // Authentication
  login: async (email, password, role) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Dummy validation
    if (email === 'user@example.com' && password === 'password' && role === 'user') {
      return {
        success: true,
        token: 'dummy_user_token',
        user: {
          id: 'user1',
          name: 'John Doe',
          email: 'user@example.com',
          role: 'user',
        },
      };
    }
    if (email === 'vendor@example.com' && password === 'password' && role === 'vendor') {
      return {
        success: true,
        token: 'dummy_vendor_token',
        user: {
          id: 'vendor1',
          name: 'Cool Air Solutions',
          email: 'vendor@example.com',
          role: 'vendor',
        },
      };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  signup: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      token: 'dummy_token',
      user: {
        id: 'new_user',
        ...userData,
      },
    };
  },

  forgotPassword: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  },

  // ACs
  getACs: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = [...dummyACs];
    
    if (filters.brand) {
      filtered = filtered.filter(ac => ac.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    }
    if (filters.capacity) {
      filtered = filtered.filter(ac => ac.capacity === filters.capacity);
    }
    if (filters.type) {
      filtered = filtered.filter(ac => ac.type === filters.type);
    }
    if (filters.location) {
      filtered = filtered.filter(ac => ac.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.minPrice) {
      filtered = filtered.filter(ac => {
        const price = ac.price[filters.duration?.toLowerCase() || 'monthly'] || ac.price.monthly;
        return price >= filters.minPrice;
      });
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(ac => {
        const price = ac.price[filters.duration?.toLowerCase() || 'monthly'] || ac.price.monthly;
        return price <= filters.maxPrice;
      });
    }
    
    return { success: true, data: filtered };
  },

  getACById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const ac = dummyACs.find(a => a.id === id);
    return { success: !!ac, data: ac };
  },

  // Vendor AC management
  getVendorACs: async (vendorId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const acs = dummyACs.filter(ac => ac.vendorId === vendorId);
    return { success: true, data: acs };
  },

  addAC: async (acData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAC = {
      id: String(dummyACs.length + 1),
      ...acData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    dummyACs.push(newAC);
    return { success: true, data: newAC };
  },

  updateAC: async (id, acData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = dummyACs.findIndex(ac => ac.id === id);
    if (index !== -1) {
      dummyACs[index] = { ...dummyACs[index], ...acData };
      return { success: true, data: dummyACs[index] };
    }
    return { success: false, message: 'AC not found' };
  },

  // Service leads
  getServiceLeads: async (vendorId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: dummyServiceLeads };
  },

  createServiceRequest: async (requestData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRequest = {
      id: `service${dummyUserServiceRequests.length + 1}`,
      ...requestData,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    dummyUserServiceRequests.push(newRequest);
    dummyServiceLeads.push({
      id: `lead${dummyServiceLeads.length + 1}`,
      userId: 'user1',
      userName: 'Current User',
      ...requestData,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
    });
    return { success: true, data: newRequest };
  },

  updateLeadStatus: async (leadId, status) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const lead = dummyServiceLeads.find(l => l.id === leadId);
    if (lead) {
      lead.status = status;
      return { success: true, data: lead };
    }
    return { success: false, message: 'Lead not found' };
  },

  // User rentals
  getUserRentals: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: dummyUserRentals };
  },

  getUserServiceRequests: async (userId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: dummyUserServiceRequests };
  },

  createRentalInquiry: async (acId, inquiryData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Rental inquiry submitted successfully',
      data: {
        id: `inquiry${Date.now()}`,
        acId,
        ...inquiryData,
        status: 'Pending',
      },
    };
  },
};

