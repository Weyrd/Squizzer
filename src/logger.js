const DEBUG = true;

// Define a logging utility
const Logger = {
  log(...args) {
    if (DEBUG) {
      console.log(`[DEBUG] ${args.join(' ')}`);
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
