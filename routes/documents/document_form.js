var winston = require('winston');
var util = require('util');
var moment = require('moment');
var PAGE_NAME = "DOCUMENT: ";
var db = require('../../db').db;
var Sanitize = require('../../utils/Sanitize');

module.exports = {

    add_index: function (req, res, next) {
        db.task(t=> {
            return t.batch([
                t.documents.document_types_list(),
                t.documents.payment_methods_list(),
                t.contractors.list(),
                t.products.list_only_products(),
                t.products.all(),
            ]);
        })
            .then(function (data) {
                res.render('documents/document_add', {
                    user: req.user,
                    document_types_list: data[0],
                    payment_methods_list: data[1],
                    contractors_list: data[2],
                    store_products_list: data[3],
                    finance_products_list: data[4],
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
    },

    edit_index: function(req, res, next) {
        db.task(t=> {
            return t.batch([
                t.documents.document_types_list(),
                t.documents.payment_methods_list(),
                t.contractors.list(),
                t.products.list_only_products(),
                t.products.all(),
                t.documents.find(req.query.id),
            ]);
        })
        .then(function (data) {
            console.log(data[2]);
            res.render('documents/document_edit', {
                user: req.user,
                document_types_list: data[0],
                payment_methods_list: data[1],
                contractors_list: data[2],
                store_products_list: data[3],
                finance_products_list: data[4],
                document: data[5],
                creation: moment(data[5].creation).format("YYYY-MM-DDTHH:mm"),
                agent_id: data[5].agent_id
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
                finance_payment_method_ids: Sanitize.sanitizeArray(req.body.finance_payment_method_ids),
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
