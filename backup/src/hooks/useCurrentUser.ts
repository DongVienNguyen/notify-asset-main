
import { useState, useEffect } from 'react';

interface CurrentUser {
  role: string;
  username: string;
}

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const loadCurrentUser = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        console.log('Current user loaded:', user);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return {
    currentUser,
    loadCurrentUser
  };
};
