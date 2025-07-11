import { PropsWithChildren, useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';
import { AuthModel, UserModel } from '@/auth/lib/models';

// Mock data for bypassing authentication
const mockAuth: AuthModel = {
  access_token: "mock-access-token-bypass-auth",
  refresh_token: "mock-refresh-token-bypass-auth"
};

const mockUser: UserModel = {
  username: "demo",
  email: "demo@kt.com",
  first_name: "Demo",
  last_name: "User",
  fullname: "Demo User",
  email_verified: true,
  occupation: "Developer",
  company_name: "Demo Company",
  phone: "+1234567890",
  roles: [1, 2],
  pic: "",
  language: "en",
  is_admin: true,
};

// Define the Supabase Auth Provider
export function AuthProvider({ children }: PropsWithChildren) {
  // const [loading, setLoading] = useState(true);
  // const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  // const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  // const [isAdmin, setIsAdmin] = useState(false);

  // Bypass authentication - always provide authenticated state
  const [loading, setLoading] = useState(false); // Set to false to skip loading
  const [auth, setAuth] = useState<AuthModel | undefined>(mockAuth); // Always provide mock auth
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>(mockUser); // Always provide mock user
  const [isAdmin, setIsAdmin] = useState(true); // Always admin

  // Check if user is admin
  useEffect(() => {
    // setIsAdmin(currentUser?.is_admin === true);
    setIsAdmin(true); // Always admin
  }, [currentUser]);

  const verify = async () => {
    // if (auth) {
    //   try {
    //     const user = await getUser();
    //     setCurrentUser(user || undefined);
    //   } catch {
    //     saveAuth(undefined);
    //     setCurrentUser(undefined);
    //   }
    // }
    
    // Bypass verification - always succeed
    console.log('Auth verification bypassed - always authenticated');
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    // setAuth(auth);
    // if (auth) {
    //   authHelper.setAuth(auth);
    // } else {
    //   authHelper.removeAuth();
    // }
    
    // Bypass auth saving - keep mock auth
    console.log('Auth saving bypassed - keeping mock auth');
  };

  const login = async (email: string, password: string) => {
    // try {
    //   const auth = await SupabaseAdapter.login(email, password);
    //   saveAuth(auth);
    //   const user = await getUser();
    //   setCurrentUser(user || undefined);
    // } catch (error) {
    //   saveAuth(undefined);
    //   throw error;
    // }
    
    // Bypass login - always succeed
    console.log('Login bypassed - always authenticated');
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ) => {
    // try {
    //   const auth = await SupabaseAdapter.register(
    //     email,
    //     password,
    //     password_confirmation,
    //     firstName,
    //     lastName,
    //   );
    //   saveAuth(auth);
    //   const user = await getUser();
    //   setCurrentUser(user || undefined);
    // } catch (error) {
    //   saveAuth(undefined);
    //   throw error;
    // }
    
    // Bypass register - always succeed
    console.log('Register bypassed - always authenticated');
  };

  const requestPasswordReset = async (email: string) => {
    // await SupabaseAdapter.requestPasswordReset(email);
    console.log('Password reset bypassed');
  };

  const resetPassword = async (
    password: string,
    password_confirmation: string,
  ) => {
    // await SupabaseAdapter.resetPassword(password, password_confirmation);
    console.log('Password reset bypassed');
  };

  const resendVerificationEmail = async (email: string) => {
    // await SupabaseAdapter.resendVerificationEmail(email);
    console.log('Verification email bypassed');
  };

  const getUser = async () => {
    // return await SupabaseAdapter.getCurrentUser();
    return mockUser; // Always return mock user
  };

  const updateProfile = async (userData: Partial<UserModel>) => {
    // return await SupabaseAdapter.updateUserProfile(userData);
    console.log('Profile update bypassed');
    return mockUser; // Always return mock user
  };

  const logout = () => {
    // SupabaseAdapter.logout();
    // saveAuth(undefined);
    // setCurrentUser(undefined);
    console.log('Logout bypassed - staying authenticated');
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
