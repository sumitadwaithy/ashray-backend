const errors: any[] = [];

export const initErrorTracking = () => {
  window.onerror = function (message, source, lineno, colno, error) {
    errors.push({ message, source, lineno, colno, error });
    console.error("🚨 Runtime Error:", message);
  };

  window.addEventListener("unhandledrejection", function (event) {
    errors.push({ message: event.reason });
    console.error("🚨 Promise Error:", event.reason);
  });
};

export const getErrors = () => errors;