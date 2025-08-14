// /context/UserContext.js
import React from 'react';

export const UserContext = React.createContext({
  user: null,              // { userId, username, email, image }
  setUser: () => {},

  isAuthed: false,         // true, jeśli zalogowany
  setIsAuthed: () => {},

  // language: 'pl',
  setLanguage: () => {},

  refreshUser: async () => false, // pobiera /api/auth/me i ustawia user
});
