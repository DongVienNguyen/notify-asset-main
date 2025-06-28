
import { useState, useEffect } from 'react';

export const useTimeRestriction = () => {
  const [isRestrictedTime, setIsRestrictedTime] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeInMinutes = hours * 60 + minutes;
      
      const isRestricted = (timeInMinutes >= 465 && timeInMinutes <= 485) || 
                          (timeInMinutes >= 765 && timeInMinutes <= 785);
      setIsRestrictedTime(isRestricted);
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isRestrictedTime };
};
