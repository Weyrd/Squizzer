const DEBUG = true;

// Define a logging utility
const Logger = {
  log(...args) {
    if (DEBUG) {
      const time = new Date().toLocaleTimeString().split(' ')[0];
      console.log(`[${time} - DEBUG]`, ...args);
    }
  },

  info(...args) {
    console.info(...args);
  },

  warn(...args) {
    console.warn(...args);
  },

  error(...args) {
    console.error(...args);
  },
};

export default Logger;
