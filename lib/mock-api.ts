// Mock API for Development/Testing
// Returns realistic success responses without actual API calls
// Enable by setting NEXT_PUBLIC_USE_MOCK_API=true

export interface MockApiOptions {
  enabled: boolean
  delay?: number // Simulate network delay in ms
}

const MOCK_API_ENABLED = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'
const MOCK_API_DELAY = parseInt(process.env.NEXT_PUBLIC_MOCK_API_DELAY || '300', 10)

// Mock data generators
export const mockData = {
  // Generate mock visitor data
  generateVisitor: (id: number) => ({
    id,
    name: `Visitor ${id}`,
    phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    vehicle: `ABC-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
    purpose: ['Meeting', 'Delivery', 'Visit', 'Inspection'][Math.floor(Math.random() * 4)],
    member_id: Math.floor(Math.random() * 10) + 1,
    check_in_time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    check_out_time: null,
    selfie_url: `https://ui-avatars.com/api/?name=Visitor+${id}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  // Generate mock member data
  generateMember: (id: number) => ({
    id,
    name: `Member ${id}`,
    email: `member${id}@society.com`,
    phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    unit: `${Math.floor(Math.random() * 500) + 1}`,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),

  // Generate mock security staff data
  generateSecurityStaff: (id: number) => ({
    id,
    name: `Security Staff ${id}`,
    email: `staff${id}@security.com`,
    phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
    shift: ['Morning', 'Evening', 'Night'][Math.floor(Math.random() * 3)],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
}

// Simulate network delay
const simulateDelay = () =>
  new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY))

// Mock API responses
export const mockApiResponses = {
  // Authentication
  login: async (email: string, password: string) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        token: `mock_token_${Math.random().toString(36).substr(2, 9)}`,
        user: {
          id: 1,
          name: 'Test User',
          email,
          role: 'admin' as const,
        },
      },
      message: 'Login successful',
    }
  },

  // Visitors
  getVisitors: async () => {
    await simulateDelay()
    return {
      success: true,
      data: Array.from({ length: 15 }, (_, i) => mockData.generateVisitor(i + 1)),
      message: 'Visitors retrieved',
    }
  },

  getTodayVisitors: async () => {
    await simulateDelay()
    return {
      success: true,
      data: Array.from({ length: 8 }, (_, i) => mockData.generateVisitor(i + 1)),
      message: "Today's visitors retrieved",
    }
  },

  createVisitor: async (data: any) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 10000),
        ...data,
        created_at: new Date().toISOString(),
      },
      message: 'Visitor created successfully',
    }
  },

  checkoutVisitor: async (visitorId: number) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id: visitorId,
        check_out_time: new Date().toISOString(),
      },
      message: 'Visitor checked out successfully',
    }
  },

  // Members
  getMembers: async () => {
    await simulateDelay()
    return {
      success: true,
      data: Array.from({ length: 20 }, (_, i) => mockData.generateMember(i + 1)),
      message: 'Members retrieved',
    }
  },

  addMember: async (data: any) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 10000),
        ...data,
        created_at: new Date().toISOString(),
      },
      message: 'Member added successfully',
    }
  },

  updateMember: async (id: number, data: any) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id,
        ...data,
        updated_at: new Date().toISOString(),
      },
      message: 'Member updated successfully',
    }
  },

  deleteMember: async (id: number) => {
    await simulateDelay()
    return {
      success: true,
      data: { id },
      message: 'Member deleted successfully',
    }
  },

  // Security Staff
  getSecurityStaff: async () => {
    await simulateDelay()
    return {
      success: true,
      data: Array.from({ length: 12 }, (_, i) => mockData.generateSecurityStaff(i + 1)),
      message: 'Security staff retrieved',
    }
  },

  addSecurityStaff: async (data: any) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id: Math.floor(Math.random() * 10000),
        ...data,
        created_at: new Date().toISOString(),
      },
      message: 'Security staff added successfully',
    }
  },

  updateSecurityStaff: async (id: number, data: any) => {
    await simulateDelay()
    return {
      success: true,
      data: {
        id,
        ...data,
        updated_at: new Date().toISOString(),
      },
      message: 'Security staff updated successfully',
    }
  },

  deleteSecurityStaff: async (id: number) => {
    await simulateDelay()
    return {
      success: true,
      data: { id },
      message: 'Security staff deleted successfully',
    }
  },
}

// Route API requests to appropriate mock responses
export async function getMockResponse<T>(endpoint: string): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    if (endpoint.includes('/members')) {
      return mockApiResponses.getMembers() as any
    }
    if (endpoint.includes('/visitors')) {
      if (endpoint.includes('/today')) {
        return mockApiResponses.getTodayVisitors() as any
      }
      return mockApiResponses.getVisitors() as any
    }
    if (endpoint.includes('/security-staff')) {
      return mockApiResponses.getSecurityStaff() as any
    }
    if (endpoint.includes('/login')) {
      return mockApiResponses.login('mock@example.com', 'mock') as any
    }

    // Default success response
    return {
      success: true,
      data: [] as any,
      message: 'Mock response',
    }
  } catch (error) {
    console.error('[v0] Mock API error:', error)
    return {
      success: false,
      message: 'Mock API error',
    }
  }
}

export { MOCK_API_ENABLED }
