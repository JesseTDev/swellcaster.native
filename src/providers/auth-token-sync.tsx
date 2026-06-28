import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { registerAuthTokenGetter } from '@/services/auth/auth-token';

/** Keeps the axios client in sync with the active Clerk session token. */
export function AuthTokenSync() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    registerAuthTokenGetter(() => getToken());
  }, [getToken, isLoaded]);

  return null;
}
