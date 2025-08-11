import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to handle automatic logout on user inactivity
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {boolean} enabled - Whether the timer is enabled (default: true)
 */
export const useInactivityTimer = (timeoutMinutes = 30, enabled = true) => {
  const { logout, isAuthenticated, refreshSession } = useAuth();
  const timeoutRef = useRef(null);
  const timeoutDuration = timeoutMinutes * 60 * 1000; // Convert to milliseconds

  const resetTimer = () => {
    if (!enabled || !isAuthenticated) return;

    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update session activity
    refreshSession?.();

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      console.log('User inactive, logging out...');
      logout();
    }, timeoutDuration);
  };

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, isAuthenticated, timeoutDuration]);

  // Manual timer reset function
  return { resetTimer };
};

export default useInactivityTimer;
