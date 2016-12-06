'use strict';

var sql = require('../sql').products;

module.exports = (rep, pgp) => {

    return {

        list: () =>
            rep.any(sql.list),

        find: id =>
            rep.oneOrNone('SELECT * FROM product WHERE id = $1', id),

        add: values =>
            rep.one(sql.add, values, user => user.id),

        edit: values =>
            rep.none(sql.edit, values, user => user.id),

        product_group_list: () =>
            rep.any(sql.product_group_list),

        list_only_products: () =>
            rep.any('SELECT * FROM product where service = FALSE order by name'),

        all: () =>
            rep.any('SELECT * FROM product order by name'),

    };
};
