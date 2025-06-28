import { useEffect, useCallback } from 'react';
import { CalculationHistoryService } from '../services/calculationHistoryService';
import { useAuth } from '../context/useAuth';

/**
 * Hook for managing automatic cleanup of old calculation history entries
 * @param {number} daysToKeep - Number of days to keep history (default: 90)
 * @param {boolean} autoCleanup - Whether to automatically clean up on mount (default: true)
 * @returns {Object} - Cleanup functions and status
 */
export const useCalculationHistoryCleanup = (daysToKeep = 90, autoCleanup = true) => {
  const { user } = useAuth();

  /**
   * Manual cleanup function
   * @returns {Promise<number>} - Number of deleted entries
   */
  const cleanupHistory = useCallback(async () => {
    if (!user) {
      console.warn('User not authenticated, skipping history cleanup');
      return 0;
    }

    try {
      const deletedCount = await CalculationHistoryService.cleanOldHistory(daysToKeep);
      console.log(`Cleaned up ${deletedCount} old calculation history entries`);
      return deletedCount;
    } catch (error) {
      console.error('Error during history cleanup:', error);
      throw error;
    }
  }, [user, daysToKeep]);

  /**
   * Check if cleanup is needed based on last cleanup timestamp
   * @returns {boolean} - Whether cleanup is needed
   */
  const shouldCleanup = useCallback(() => {
    const lastCleanup = localStorage.getItem('lastHistoryCleanup');
    if (!lastCleanup) return true;

    const lastCleanupDate = new Date(lastCleanup);
    const now = new Date();
    const daysSinceLastCleanup = (now - lastCleanupDate) / (1000 * 60 * 60 * 24);

    // Run cleanup weekly (every 7 days)
    return daysSinceLastCleanup >= 7;
  }, []);

  /**
   * Automatic cleanup on component mount
   */
  useEffect(() => {
    if (!autoCleanup || !user) return;

    const performAutoCleanup = async () => {
      if (shouldCleanup()) {
        try {
          await cleanupHistory();
          localStorage.setItem('lastHistoryCleanup', new Date().toISOString());
        } catch (error) {
          console.error('Auto cleanup failed:', error);
        }
      }
    };

    // Delay auto cleanup to avoid blocking initial render
    const timeoutId = setTimeout(performAutoCleanup, 5000);

    return () => clearTimeout(timeoutId);
  }, [user, autoCleanup, cleanupHistory, shouldCleanup]);

  return {
    cleanupHistory,
    shouldCleanup
  };
};

export default useCalculationHistoryCleanup;