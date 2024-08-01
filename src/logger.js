const DEBUG = true;

// Define a logging utility
const Logger = {
  log(message) {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`);
    }
  },

  info(message) {
    console.info(message);
  },

  warn(message) {
    console.warn(message);
  },

  error(message) {
    console.error(message);
  },
};

export default Logger;
