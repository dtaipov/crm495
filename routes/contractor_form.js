const winston = require('winston');
const db = require('../db/index').db;
const Sanitize = require('../utils/Sanitize');

module.exports = {

    /*add_index: (req, res, next) => {
      const contractor = {};
      db.task(t=> {
        return t.batch([
                t.contractors.contractor_group_list()
          ]);
      })
      .then((data) => {
        console.log(data[0]);
        res.render('contractor_form', {
          user: req.user,
          contractor_group_list: data[0],
          contractor
        });
      })
      .catch(function (error) {
        winston.error(error);
        res.render('contractor_form', {
          user: req.user,
          contractor
        });
      });
    },

    add_save: (req, res, next) => {
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
    },*/

    edit_index: (req, res, next) => {
      db.task(t=> {
        return t.batch([
          t.contractors.contractor_group_list(),
          req.query.id? t.contractors.find(req.query.id) : {}
        ]);
      })
        .then((data) => {
          console.log(data[0]);
          res.render('contractor_form', {
            user: req.user,
            contractor_group_list: data[0],
            contractor: data[1]
          });
        })
        .catch(function (error) {
          winston.error(error);
          res.render('contractor_form', {
            user: req.user
          });
        });
    },

    edit_save: (req, res, next) => {
      db.contractors.edit(
        {
          id: req.body.id,
          contractor_name: req.body.contractor_name,
          contractor_group_id: req.body.contractor_group_id,
          contact_phone: Sanitize.sanitizeQuotes(req.body.contact_phone),
          contact_address: Sanitize.sanitizeQuotes(req.body.contact_address),
          user_id: req.user.id
        }
      )
        .then((data) => {
          console.log("success data: ");
          console.log(data);
          res.redirect("/contractors");
        })
        .catch((error) => {
          res.json({
            success: false,
            error: error.message || error
          });
        });
    }
};
