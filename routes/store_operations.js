var winston = require('winston');
var util = require('util');
//var StoreModel = require('../models/Store');
var PAGE_NAME = "STORE_OPERATIONS: ";

module.exports = {

    index: function (req, res, next) {
        res.render('store_operations', {
            user: req.user
        });

    },

    /*get_store_operations: function(req, res, next) {
        StoreModel.getStoreOperations('null','null', function (err, operations) {
            winston.info(PAGE_NAME + "store operations: " + util.inspect(operations));
            if (err) {
                winston.err(PAGE_NAME + "err: " + util.inspect(err));
                return next(err);
            }
            res.json(operations);
        });
    }*/
};
