'use strict';

var sql = require('../sql').contractors;

module.exports = (rep, pgp) => {

    return {

        // Tries to find a product from id;
        /*find: id =>
            rep.oneOrNone('SELECT * FROM Products WHERE id = $1', id),*/

        list: () =>
            rep.any(sql.list),

        find: id =>
            rep.oneOrNone('SELECT * FROM contractor WHERE id = $1', id),

        add: values =>
            rep.one(sql.add, values, user => user.id),

        edit: values =>
            rep.none(sql.edit, values, user => user.id),

        contractor_group_list: () =>
            rep.any(sql.contractor_group_list)
    };
};
