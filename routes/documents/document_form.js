const winston = require('winston');
const moment = require('moment');
const db = require('../../db').db;
const Sanitize = require('../../utils/Sanitize');

module.exports = {

    /*add_index: function (req, res, next) {
        db.task(t=> {
            return t.batch([
                t.documents.document_types_list(),
                t.documents.payment_methods_list(),
                //t.contractors.list(),
                t.products.list_only_products(),
                t.products.all(),
                t.documents.agents_list(),
            ]);
        })
            .then(function (data) {
                res.render('documents/document_add', {
                    user: req.user,
                    document_types_list: data[0],
                    payment_methods_list: data[1],
                    //contractors_list: data[2],
                    store_products_list: data[2],
                    finance_products_list: data[34],
                    agents_list: data[4],
                    creation: moment().format("YYYY-MM-DDTHH:mm")
                });
            })
            .catch(function (error) {
                winston.error(error);
                res.render('documents/document_add', {
                    user: req.user,
                    document_types_list: null
                });
            });
    },

    add_save: function (req, res, next) {
        var agentId = parseInt(req.body.agent_id);
        db.documents.add(
            {
                contractor_id: req.body.contractor_id,
                payment_method_id: req.body.payment_method_id,
                document_type_id: req.body.document_type_id,
                creation: req.body.creation,
                agent_id: isNaN(agentId) ? null : agentId
            }
        )
        .then(data => {
            console.log("success data: ");
            console.log(data);
            res.redirect("/documents/edit?id=" + data);
        })
        .catch(error => {
            res.json({
                success: false,
                error: error.message || error
            });
        });
    },*/

    edit_index: function(req, res, next) {
        db.task(t=> {
            return t.batch([
                t.documents.document_types_list(),
                t.documents.payment_methods_list(),
                //t.contractors.list(),
                t.products.all(),
                t.documents.agents_list(),
                req.query.id ? t.documents.find(req.query.id) : null,
                req.query.id ? t.finances.finance_operation_by_document_id(req.query.id) : null
            ]);
        })
        .then(function (data) {
            console.log(data[2]);
            res.render('documents/document_edit', {
                user: req.user,
                document_types_list: data[0],
                payment_methods_list: data[1],
                //contractors_list: data[2],
                finance_products_list: data[2],
                agents_list: data[3],
                document: data[4] ? data[4] : [],
                creation: data[4] ? moment(data[4].creation).format("YYYY-MM-DDTHH:mm") : null,
                document_finance_operations: data[5]
            });
        })
        .catch(function (error) {
            winston.error(error);
            res.render('documents/document_edit', {
                user: req.user
            });
        });
    },

    edit_save: function(req, res, next) {
        var agentId = parseInt(req.body.agent_id);
        db.documents.edit(
            {
                document_id: req.body.id,
                contractor_id: req.body.contractor_id,
                payment_method_id: req.body.payment_method_id,
                document_type_id: req.body.document_type_id,
                creation: req.body.creation,
                agent_id: isNaN(agentId) ? null : agentId,
                store_products_ids: Sanitize.sanitizeArray(req.body.store_products_ids),
                store_quantities: Sanitize.sanitizeArray(req.body.store_quantities),
                finance_products_ids: Sanitize.sanitizeArray(req.body.finance_products_ids),
                finance_products_quantities: Sanitize.sanitizeArray(req.body.finance_products_quantities),
                finance_money_amounts: Sanitize.sanitizeArray(req.body.finance_money_amounts),
            }
        )
        .then(function (data) {
            console.log("success data: ");
            console.log(data);
            res.redirect("/documents");
        })
        .catch(function (error) {
            res.json({
                success: false,
                error: error.message || error
            });
        });
    }

};
