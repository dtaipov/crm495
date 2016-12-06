var winston = require('winston');
var util = require('util');
var PAGE_NAME = "PRODUCTS_BALANCE: ";

module.exports = {

    index: function (req, res, next) {
        res.render('reports/products_balance', {
            user: req.user
        });

    }
};
