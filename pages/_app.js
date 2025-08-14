// /pages/_app.js
import { appWithTranslation } from 'next-i18next';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import '../styles/LoginModal.scss';
import '../styles/All.scss';
import { UserContext } from '@/context/UserContext';
// import i18n from '@/i18n';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // --- NEW state (zgodnie z nowym UserContext) ---
  const [user, setUser] = useState(null);       // { userId, username, email, image }
  const [isAuthed, setIsAuthed] = useState(false);

  // const [language, setLanguage] = useState(router.locale || 'pl') // <-- start z locale

  // useEffect(() => {
  //   setLanguage(router.locale || 'pl') // <-- aktualizuj, gdy zmienia się locale
  // }, [router.locale])

  // język jak wcześniej
  // const [language, setLanguage] = useState('pl');

  // helper: GET /me, jeśli 401 -> POST /refresh -> ponownie /me
  const refreshUser = useCallback(async () => {
    try {
      let res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.status === 401) {
        // spróbuj odświeżyć access token
        const r = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        if (!r.ok) {
          setUser(null);
          setIsAuthed(false);
          return false;
        }
        // po udanym refresh – ponownie /me
        res = await fetch('/api/auth/me', { credentials: 'include' });
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setIsAuthed(true);
        return true;
      }

      // /me nieudane mimo prób
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

  // inicjalne sprawdzenie sesji po załadowaniu aplikacji
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // język – bez zmian
  // const changeLanguage = useCallback((lng) => {
  //   setLanguage(lng);
  //   try {
  //     localStorage.setItem('language', lng);
  //   } catch {}
  //   i18n.changeLanguage(lng);
  // }, []);

  // useEffect(() => {
  //   const urlLanguage = router.locale || 'pl';
  //   try {
  //     const savedLanguage = localStorage.getItem('language');
  //     if (!savedLanguage || savedLanguage !== urlLanguage) {
  //       setLanguage(urlLanguage);
  //       i18n.changeLanguage(urlLanguage);
  //       localStorage.setItem('language', urlLanguage);
  //     }
  //   } catch {
  //     setLanguage(urlLanguage);
  //     i18n.changeLanguage(urlLanguage);
  //   }
  // }, [router.locale]);

  // przekierowanie / -> /pl (jak miałeś)
  // useEffect(() => {
  //   if (!router.asPath.startsWith('/pl') && !router.asPath.startsWith('/en')) {
  //     router.replace('/pl');
  //   }
  // }, [router]);

  // value kontekstu – stabilizowane useMemo
  const ctxValue = useMemo(
    () => ({
      user,
      setUser,
      isAuthed,
      setIsAuthed,
      // language,
      // setLanguage: changeLanguage,
      refreshUser, // używaj w modalach po loginie/rejestracji
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
