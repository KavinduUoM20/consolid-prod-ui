import { PropsWithChildren, useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';
import { AuthModel, UserModel } from '@/auth/lib/models';
import { AuthApiService } from '@/auth/services/auth-api';

// Define the Auth Provider with real API integration
export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const existingAuth = authHelper.getAuth();
      if (existingAuth) {
        setAuth(existingAuth);
        // TODO: Verify token is still valid and get user info
        // For now, we'll assume the token is valid
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const verify = async () => {
    if (auth) {
      try {
        // TODO: Implement token verification with the API
        // For now, we'll assume the token is valid
        console.log('Token verification not implemented yet');
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const result = await AuthApiService.login(username, password);
      saveAuth(result.auth);
      setCurrentUser(result.user);
    } catch (error) {
      saveAuth(undefined);
      setCurrentUser(undefined);
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ) => {
    // TODO: Implement registration with the API when available
    throw new Error('Registration is not yet implemented');
  };

  const requestPasswordReset = async (email: string) => {
    // TODO: Implement password reset with the API when available
    throw new Error('Password reset is not yet implemented');
  };

  const resetPassword = async (
    password: string,
    password_confirmation: string,
  ) => {
    // TODO: Implement password reset with the API when available
    throw new Error('Password reset is not yet implemented');
  };

  const resendVerificationEmail = async (email: string) => {
    // TODO: Implement email verification with the API when available
    throw new Error('Email verification is not yet implemented');
  };

  const getUser = async () => {
    // TODO: Implement get user with the API when available
    return currentUser || null;
  };

  const updateProfile = async (userData: Partial<UserModel>) => {
    // TODO: Implement profile update with the API when available
    throw new Error('Profile update is not yet implemented');
  };

  const logout = async () => {
    try {
      // Call API logout if we have an auth token
      if (auth?.access_token) {
        await AuthApiService.logout(auth.access_token);
      }
    } catch (error) {
      console.warn('Error during API logout:', error);
    } finally {
      // Always clear local auth state
      saveAuth(undefined);
      setCurrentUser(undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
