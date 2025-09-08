import { useCallback } from 'react';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
}

export const useLogger = () => {
  const log = useCallback((level: LogLevel, message: string, data?: any) => {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };

    // Log to console
    console[level === 'debug' ? 'log' : level](
      `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`,
      data ? data : ''
    );

    // Store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app-logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store log entry:', error);
    }
  }, []);

  const info = useCallback((message: string, data?: any) => log('info', message, data), [log]);
  const warn = useCallback((message: string, data?: any) => log('warn', message, data), [log]);
  const error = useCallback((message: string, data?: any) => log('error', message, data), [log]);
  const debug = useCallback((message: string, data?: any) => log('debug', message, data), [log]);

  const getLogs = useCallback((): LogEntry[] => {
    try {
      return JSON.parse(localStorage.getItem('app-logs') || '[]');
    } catch {
      return [];
    }
  }, []);

  const clearLogs = useCallback(() => {
    localStorage.removeItem('app-logs');
  }, []);

  return { info, warn, error, debug, getLogs, clearLogs };
};