var winston = require('winston');
var util = require('util');
//var FinancesModel = require('../models/Finances');
var PAGE_NAME = "FINANCE_OPERATIONS: ";

module.exports = {

    index: function (req, res, next) {
        res.render('finance_operations', {
            user: req.user
        });

    },

    /*get_finance_operations: function(req, res, next) {
        FinancesModel.getFinanceOperations('null','null', function (err, operations) {
            winston.info(PAGE_NAME + "finance operations: " + util.inspect(operations));
            if (err) {
                winston.err(PAGE_NAME + "err: " + util.inspect(err));
                return next(err);
            }
            res.json(operations);
        });
    }*/
};
