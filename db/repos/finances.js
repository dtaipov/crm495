'use strict';

var sql = require('../sql').finances;

module.exports = (rep, pgp) => {

    return {
        finance_operations_list: () =>
            rep.any(sql.finance_operations_list),

        finance_operation_by_document_id: (id) =>
          rep.any('SELECT * FROM finance_operation WHERE document_id = $1', id),
    };
};
