module.exports = {
    sanitizeArray: function (arr) {
        if (arr) return [].concat(arr);
        return null;
    },

    sanitizeQuotes: function (str) {
        return str.replace(/\\/g, "\\\\")
            .replace(/\$/g, "\\$")
            .replace(/'/g, "\\'")
            .replace(/"/g, "\\\"");
    }
};