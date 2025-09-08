const LOG_ENDPOINT = 'http://20.244.56.144/evaluation-service/logs';

interface LogData {
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
  timestamp: string;
}

export const logEvent = async (
  level: 'info' | 'warn' | 'error' | 'success',
  message: string,
  additionalData?: any
): Promise<void> => {
  const logData: LogData = {
    level,
    message,
    data: additionalData,
    timestamp: new Date().toISOString()
  };

  try {
    // Make POST request to logging service
    const response = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData)
    });

    // If logging service is unavailable, store locally as fallback
    if (!response.ok) {
      console.warn('Logging service unavailable, storing log locally:', logData);
      storeLogLocally(logData);
    }
  } catch (error) {
    // Fallback to local storage if logging service fails
    console.warn('Failed to send log to service, storing locally:', error);
    storeLogLocally(logData);
  }
};

const storeLogLocally = (logData: LogData): void => {
  try {
    const existingLogs = localStorage.getItem('appLogs');
    const logs = existingLogs ? JSON.parse(existingLogs) : [];
    logs.push(logData);
    
    // Keep only the last 1000 logs to prevent storage overflow
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('appLogs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to store log locally:', error);
  }
};

// Utility function to get locally stored logs (for debugging)
export const getLocalLogs = (): LogData[] => {
  try {
    const logs = localStorage.getItem('appLogs');
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Failed to retrieve local logs:', error);
    return [];
  }
};

// Utility function to clear local logs
export const clearLocalLogs = (): void => {
  try {
    localStorage.removeItem('appLogs');
  } catch (error) {
    console.error('Failed to clear local logs:', error);
  }
};