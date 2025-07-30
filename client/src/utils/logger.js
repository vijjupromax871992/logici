// Frontend logger utility - only logs critical errors to backend
class Logger {
  static async logError(error, context = {}) {
    // Only log in production to avoid development noise
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/logs/error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message || error.toString(),
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
          })
        });
      } catch (logError) {
        // Fail silently - don't want logging errors to affect user experience
      }
    }
  }

  static async logCritical(message, data = {}) {
    if (process.env.NODE_ENV === 'production') {
      try {
        await fetch('/api/logs/critical', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            data,
            timestamp: new Date().toISOString(),
            url: window.location.href
          })
        });
      } catch (logError) {
        // Fail silently
      }
    }
  }
}

export default Logger;