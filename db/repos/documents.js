'use strict';

var sql = require('../sql').documents;
var storeQql = require('../sql').store;
var financeQql = require('../sql').finances;

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

        add: values =>
            rep.one(sql.add_product_remainder, values, user => user.id),

        edit: values =>
            rep.tx(function (t) {
                var documentId = values.document_id;
                console.log("documentId:" + documentId);
                var storeProductIds = values.store_products_ids;
                var storeQuantities = values.store_quantities;
                var financeProductIds = values.finance_products_ids;
                var financeProductQuantities = values.finance_products_quantities;
                var financeMoneyAmounts = values.finance_money_amounts;
                var financePaymentMethodIds = values.finance_payment_method_ids;
                console.log("storeProductIds");
                console.log(storeProductIds);
                console.log("storeQuantities");
                console.log(storeQuantities);
                console.log("financeProductIds");
                console.log(financeProductIds);
                console.log("financeProductQuantities");
                console.log(financeProductQuantities);
                console.log("financeMoneyAmounts");
                console.log(financeMoneyAmounts);
                console.log("financePaymentMethodIds");
                console.log(financePaymentMethodIds);
                let queries = [this.none('update document set contractor_id=$1, payment_method_id=$2, document_type_id=$3, creation=$4, agent_id=$5 where id=$6',
                    [values.contractor_id,
                        values.payment_method_id,
                        values.document_type_id,
                        values.creation,
                        values.agent_id,
                        documentId]
                ),
                    this.none('delete from store_operation where document_id=$1', documentId),
                    this.none('delete from finance_operation where document_id=$1', documentId)
                ];
                if (storeProductIds && storeQuantities && storeProductIds.length == storeQuantities.length) {
                    for (let i = 0; i < storeProductIds.length; i++) {
                        if (storeProductIds[i]) {
                            queries.push(this.none(storeQql.add,
                                {
                                    product_id: storeProductIds[i],
                                    quantity: storeQuantities[i],
                                    document_id: documentId
                                }));
                        }
                    }
                }
                if (financeProductIds && financeProductQuantities && financeProductIds.length == financeProductQuantities.length) {
                    for (let i = 0; i < financeProductIds.length; i++) {
                        if (financeProductIds[i]) {
                            queries.push(this.none(financeQql.add,
                                {
                                    product_id: financeProductIds[i],
                                    quantity: financeProductQuantities[i],
                                    document_id: documentId,
                                    money_amount: financeMoneyAmounts[i],
                                    payment_method_id: financePaymentMethodIds[i],
                                }));
                        }
                    }
                }
                return this.batch(queries);
            })
            .then(function (data) {
                console.log(data);
            })
            .catch(function (error) {
                console.log(error); // printing the error;
            }),

        // Adds a new record and returns the new id;
        // It is also an example of mapping HTTP requests directly into query parameters;
        add_product_remainder: values =>
            rep.one(sql.add_product_remainder, values, user => user.id),

        // Returns all product records;
        list: () =>
            rep.any(sql.list),

        document_types_list: () =>
            rep.any(sql.document_types_list),

        payment_methods_list: () =>
            rep.any(sql.payment_methods_list),

        // Returns the total number of products;
        total: () =>
            rep.one('SELECT count(*) FROM Products', [], a => +a.count)
    };
};
