var winston = require('winston');
var util = require('util');
var PAGE_NAME = "CONTRACTORS: ";

module.exports = {

    index: function (req, res, next) {
        res.render('contractors', {
            user: req.user
        });

    }
};
