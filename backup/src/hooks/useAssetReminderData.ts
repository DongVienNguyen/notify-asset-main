import { useState, useEffect } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { useStaffData } from './useStaffData';
import { useReminderData } from './useReminderData';
import { toast } from 'sonner'; // Import toast from sonner

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

      // Removed the toast.success message here
      // toast.success("Đã tải dữ liệu nhắc nhở tài sản");

    } catch (error) {
      console.error('Error loading asset reminder data:', error);
      toast.error("Không thể tải dữ liệu nhắc nhở tài sản.");
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