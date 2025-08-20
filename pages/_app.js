import { appWithTranslation } from 'next-i18next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import '../styles/LoginModal.scss';
import '../styles/All.scss';
import { UserContext } from '@/context/UserContext';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  const [user, setUser] = useState(null);     
  const [isAuthed, setIsAuthed] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      let res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.status === 401) {
        const r = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!r.ok) {
          setUser(null);
          setIsAuthed(false);
          return false;
        }
        
        res = await fetch('/api/auth/me', { credentials: 'include' });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthed(true);
        return true;
      }

     
      setUser(null);
      setIsAuthed(false);
      return false;
    } catch (e) {
      console.error('refreshUser error:', e);
      setUser(null);
      setIsAuthed(false);
      return false;
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  
  const ctxValue = useMemo(
    () => ({
      user,
      setUser,
      isAuthed,
      setIsAuthed,
      refreshUser, 
    }),
    [user, isAuthed, refreshUser]
  );

  return (
    <UserContext.Provider value={ctxValue}>
      <Component {...pageProps} />
    </UserContext.Provider>
  );
}

export default appWithTranslation(MyApp);
