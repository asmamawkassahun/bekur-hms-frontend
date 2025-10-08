import { useCallback } from 'react';

export function useNotification() {
  const success = useCallback((message: string) => {
    console.log('🔐 Notification SUCCESS:', message);
    // In a real app, this would show a toast notification
    alert(`✅ ${message}`);
  }, []);

  const error = useCallback((message: string) => {
    console.error('🔐 Notification ERROR:', message);
    // In a real app, this would show a toast notification
    alert(`❌ ${message}`);
  }, []);

  const warning = useCallback((message: string) => {
    console.warn('🔐 Notification WARNING:', message);
    // In a real app, this would show a toast notification
    alert(`⚠️ ${message}`);
  }, []);

  const info = useCallback((message: string) => {
    console.info('🔐 Notification INFO:', message);
    // In a real app, this would show a toast notification
    alert(`ℹ️ ${message}`);
  }, []);

  return {
    success,
    error,
    warning,
    info,
  };
}
