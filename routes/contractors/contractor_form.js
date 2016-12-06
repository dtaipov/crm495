var winston = require('winston');
var util = require('util');
var PAGE_NAME = "CONTRACTOR: ";
var db = require('../../db').db;
var Sanitize = require('../../utils/Sanitize');

module.exports = {

    add_index: function (req, res, next) {
        db.task(t=> {
            return t.batch([
                t.contractors.contractor_group_list()
            ]);
        })
            .then(function (data) {
                console.log(data[0]);
                res.render('contractors/contractor_add', {
                    user: req.user,
                    contractor_group_list: data[0]
                });
            })
            .catch(function (error) {
                winston.error(error);
                res.render('contractors/contractor_add', {
                    user: req.user
                });
            });
    },

    add_save: function (req, res, next) {
        db.contractors.add(
            {
                contractor_name: req.body.contractor_name,
                contractor_group_id: req.body.contractor_group_id
            }
        )
        .then(data => {
            console.log("success data: ");
            console.log(data);
            res.redirect("/contractors/edit?id=" + data);
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
                t.contractors.contractor_group_list(),
                t.contractors.find(req.query.id)
            ]);
        })
        .then(function (data) {
            console.log(data[0]);
            res.render('contractors/contractor_edit', {
                user: req.user,
                contractor_group_list: data[0],
                contractor: data[1]
            });
        })
        .catch(function (error) {
            winston.error(error);
            res.render('contractors/contractor_edit', {
                user: req.user
            });
        });
    },

    edit_save: function(req, res, next) {
        db.contractors.edit(
            {
                id: req.body.id,
                contractor_name: req.body.contractor_name,
                contractor_group_id: req.body.contractor_group_id
            }
        )
        .then(function (data) {
            console.log("success data: ");
            console.log(data);
            res.redirect("/contractors");
        })
        .catch(function (error) {
            res.json({
                success: false,
                error: error.message || error
            });
        });
    }

};
