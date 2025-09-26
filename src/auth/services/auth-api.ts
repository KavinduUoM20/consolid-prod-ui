import { AuthModel, UserModel } from '@/auth/lib/models';

// API URL configuration following existing pattern
const getApiUrl = (endpoint: string) => {
  const baseUrl = import.meta.env.DEV
    ? '/api' // Use proxy in development to avoid CORS
    : 'https://api.consolidator-ai.site/api/v1'; // Use direct API in production
  
  return `${baseUrl}${endpoint}`;
};

// Login request interface
interface LoginRequest {
  username: string;
  password: string;
}

// Login response interface matching the API specification
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    role: string;
    tenant_slug: string;
  };
}

// Authentication API service
export class AuthApiService {
  /**
   * Login user with username and password
   */
  static async login(username: string, password: string): Promise<{ auth: AuthModel; user: UserModel }> {
    try {
      const apiUrl = getApiUrl('/auth/login');
      console.log('Logging in to:', apiUrl);
      console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');

      const loginData: LoginRequest = {
        username,
        password,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login API Error Response:', errorText);
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Invalid username or password. Please check your credentials and try again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Your account may be disabled or you may not have permission to access this application.');
        } else if (response.status === 404) {
          throw new Error('Authentication service not found. Please contact support.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later or contact support if the problem persists.');
        } else {
          throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }
      }

      const data: LoginResponse = await response.json();
      console.log('Login successful:', { username: data.user.username, role: data.user.role });

      // Transform API response to our internal models
      const auth: AuthModel = {
        access_token: data.access_token,
        // Note: The API doesn't return a refresh token in this response
        // If needed, we can add it later when the API supports it
      };

      const user: UserModel = {
        username: data.user.username,
        email: '', // Not provided in the login response, may need to fetch separately
        first_name: '', // Not provided in the login response
        last_name: '', // Not provided in the login response
        is_admin: data.user.role === 'super_admin' || data.user.role === 'admin',
        // Add other fields as needed
      };

      return { auth, user };
    } catch (error) {
      console.error('Error during login:', error);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      // Re-throw our custom errors
      if (error instanceof Error) {
        throw error;
      }
      
      // Fallback for unknown errors
      throw new Error('An unexpected error occurred during login. Please try again.');
    }
  }

  /**
   * Logout user (if the API supports logout endpoint)
   */
  static async logout(accessToken: string): Promise<void> {
    try {
      const apiUrl = getApiUrl('/auth/logout');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.warn('Logout request failed, but continuing with local logout');
      }
    } catch (error) {
      console.warn('Error during logout API call:', error);
      // Don't throw error for logout - we'll continue with local cleanup
    }
  }
}
