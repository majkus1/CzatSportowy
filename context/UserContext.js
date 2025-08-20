import React from 'react';

export const UserContext = React.createContext({
  user: null,              
  setUser: () => {},

  isAuthed: false,         
  setIsAuthed: () => {},

  
  setLanguage: () => {},

  refreshUser: async () => false, 
});
