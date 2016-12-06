'use strict';

var sql = require('../sql').reports;

module.exports = (rep, pgp) => {

    return {

        products_balance_list: () =>
            rep.any(sql.products_balance_list)
    };
};
