import { useState, useEffect } from 'react';
import { Staff } from '@/types/auth'; // Import Staff type

export const useCurrentUser = () => {
  const [currentUser, setCurrentUser] = useState<Staff | null>(null); // Use Staff type here

  const loadCurrentUser = async () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user: Staff = JSON.parse(userStr); // Cast to Staff type
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