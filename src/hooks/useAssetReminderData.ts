
import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useStaffData } from './useStaffData';
import { useReminderData } from './useReminderData';

export const useAssetReminderData = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { currentUser } = useCurrentUser();
  const { staff, loadStaffData } = useStaffData();
  const { reminders, setReminders, sentReminders, setSentReminders, loadReminderData } = useReminderData();

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Starting to load asset reminder data...');
      
      // Load both staff data and reminder data concurrently
      await Promise.all([
        loadStaffData(),
        loadReminderData()
      ]);

    } catch (error) {
      console.error('Error loading asset reminder data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    reminders,
    setReminders,
    sentReminders,
    setSentReminders,
    staff,
    currentUser,
    isLoading,
    loadData
  };
};
