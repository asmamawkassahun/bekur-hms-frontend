import { useCallback } from 'react';
import { toast } from 'sonner';

export function useNotification() {
  const success = useCallback((message: string) => {
    console.log('🔐 Notification SUCCESS:', message);
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const error = useCallback((message: string) => {
    console.error('🔐 Notification ERROR:', message);
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
    });
  }, []);

  const warning = useCallback((message: string) => {
    console.warn('🔐 Notification WARNING:', message);
    toast.warning(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  const info = useCallback((message: string) => {
    console.info('🔐 Notification INFO:', message);
    toast.info(message, {
      duration: 4000,
      position: 'top-right',
    });
  }, []);

  return {
    success,
    error,
    warning,
    info,
  };
}
