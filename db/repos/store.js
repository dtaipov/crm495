'use strict';

var sql = require('../sql').store;

module.exports = (rep, pgp) => {

    return {
        store_operations_list: () =>
            rep.any(sql.store_operations_list),

        add: values =>
            rep.one(sql.add, values),
    };
};
