var winston = require('winston');
var util = require('util');
var PAGE_NAME = "PRODUCTS: ";

module.exports = {

    index: function (req, res, next) {
        res.render('products', {
            user: req.user
        });

    }
};
