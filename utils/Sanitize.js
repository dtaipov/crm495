module.exports = {
    sanitizeArray: function (arr) {
        if (arr) return [].concat(arr);
        return null;
    }
};