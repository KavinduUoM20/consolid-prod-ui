'use client';

import { ReactNode, useState } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            // Don't show toasts for network errors that might be from background API calls
            if (error instanceof Error && error.message.includes('Network error')) {
              console.warn('Network error suppressed from toast:', error.message);
              return;
            }
            
            // Don't show toasts for fetch errors that might be from background calls
            if (error instanceof TypeError && error.message.includes('fetch')) {
              console.warn('Fetch error suppressed from toast:', error.message);
              return;
            }

            // Don't show toasts for CORS-related errors
            if (error instanceof Error && error.message.includes('CORS')) {
              console.warn('CORS error suppressed from toast:', error.message);
              return;
            }

            // Don't show toasts for connectivity issues
            if (error instanceof Error && error.message.includes('connect to the server')) {
              console.warn('Connectivity error suppressed from toast:', error.message);
              return;
            }

            const message =
              error.message || 'Something went wrong. Please try again.';

            toast.custom(
              () => (
                <Alert variant="mono" icon="destructive" close={false}>
                  <AlertIcon>
                    <RiErrorWarningFill />
                  </AlertIcon>
                  <AlertTitle>{message}</AlertTitle>
                </Alert>
              ),
              {
                position: 'top-center',
              },
            );
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export { QueryProvider };
