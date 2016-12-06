'use strict';

var sql = require('../sql').finances;

module.exports = (rep, pgp) => {

    return {
        finance_operations_list: () =>
            rep.any(sql.finance_operations_list),
    };
};
