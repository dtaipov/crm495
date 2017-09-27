module.exports = {
  sanitizeArray: (arr) => {
    if (arr) return [].concat(arr);
    return null;
  },

  sanitizeQuotes: (str) => {
    if (!str) return null;
    return str.replace(/\\/g, "\\\\")
      .replace(/\$/g, "\\$")
      .replace(/'/g, "\\'")
      .replace(/"/g, "\\\"");
  }
};