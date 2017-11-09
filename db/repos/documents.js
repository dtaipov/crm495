'use strict';

var sql = require('../sql').documents;
var storeQql = require('../sql').store;
var financeQql = require('../sql').finances;

function getAfterQueries(documentId, values, c) {
    let afterQueries = [
        c.none('delete from store_operation where document_id=$1', documentId),
        c.none('delete from finance_operation where document_id=$1', documentId)
    ];

    let financeProductIds = values.finance_products_ids;
    let financeProductQuantities = values.finance_products_quantities;
    let financeMoneyAmounts = values.finance_money_amounts;

    if (financeProductIds && financeProductQuantities && financeProductIds.length == financeProductQuantities.length) {
        for (let i = 0; i < financeProductIds.length; i++) {
            if (financeProductIds[i]) {
                afterQueries.push(c.none(financeQql.add,
                    {
                        product_id: financeProductIds[i],
                        quantity: financeProductQuantities[i],
                        document_id: documentId,
                        money_amount: financeMoneyAmounts[i],
                    }));
            }
        }
    }
    return c;
}
module.exports = (rep, pgp) => {

    /*
     This repository mixes hard-coded and dynamic SQL,
     primarily to show a diverse example of using both.
     */

    return {

        // Creates the table;
        create: () =>
            rep.none(sql.create),

        // Drops the table;
        drop: () =>
            rep.none(sql.drop),

        // Removes all records from the table;
        empty: () =>
            rep.none(sql.empty),

        // Tries to delete a product by id, and returns the number of records deleted;
        remove: id =>
            rep.result('DELETE FROM Products WHERE id = $1', id, r => r.rowCount),

        find: id =>
            rep.oneOrNone('SELECT * FROM document WHERE id = $1', id),

        edit: values =>
            rep.tx(function (t) {
                var documentId = values.document_id;
                console.log("documentId:" + documentId);
                let queries = [];
                if (!documentId) {
                    t.one('INSERT INTO document(contractor_id, payment_method_id, document_type_id, creation, agent_id, user_id)' +
                        ' VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
                    [values.contractor_id,
                        values.payment_method_id,
                        values.document_type_id,
                        values.creation,
                        values.agent_id,
                        values.user_id])
                        .then(document => {
                            return t.batch(
                                getAfterQueries(document.id, values, this)
                            );
                        });
                } else {
                    let queries = [this.none('update document set contractor_id=$1, payment_method_id=$2, document_type_id=$3, creation=$4, agent_id=$5 where id=$6',
                        [values.contractor_id,
                            values.payment_method_id,
                            values.document_type_id,
                            values.creation,
                        values.agent_id,
                        documentId]
                    )
                ];
                    return this.batch(queries.concat(getAfterQueries(documentId, values, this)));
    }
                //return this.batch(queries);
            })
            .then(data => {
                console.log(data);
            })
            .catch(error => {
                console.log(error); // printing the error;
            }),

        // Adds a new record and returns the new id;
        // It is also an example of mapping HTTP requests directly into query parameters;
        add_product_remainder: values =>
            rep.one(sql.add_product_remainder, values, user => user.id),

        // Returns all product records;
        list: values =>
            rep.any(sql.list, values),

        document_types_list: () =>
            rep.any(sql.document_types_list),

        payment_methods_list: () =>
            rep.any(sql.payment_methods_list),

        agents_list: () =>
            rep.any('select id, name from contractor where is_agent = TRUE order by name'),

        // Returns the total number of products;
        total: () =>
            rep.one('SELECT count(*) FROM Products', [], a => +a.count)
    };
};
