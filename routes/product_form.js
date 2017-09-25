const winston = require('winston');
const util = require('util');
const db = require('../db/index').db;
const Sanitize = require('../utils/Sanitize');

module.exports = {

  add_index: function (req, res, next) {
    db.task(t=> {
      return t.batch([
        t.products.product_group_list()
      ]);
    })
      .then(function (data) {
        console.log(data[0]);
        res.render('products/product_add', {
          user: req.user,
          product_group_list: data[0]
        });
      })
      .catch(function (error) {
        winston.error(error);
        res.render('products/product_add', {
          user: req.user
        });
      });
  },

  add_save: function (req, res, next) {
    db.products.add(
      {
        product_name: req.body.product_name,
        service: req.body.service,
        price: req.body.price,
        show_to_public: req.body.show_to_public ? "TRUE" : "FALSE",
        product_group_id: req.body.product_group_id
      }
    )
      .then(data => {
        console.log("success data: ");
        console.log(data);
        res.redirect("/products/edit?id=" + data);
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
        t.products.product_group_list(),
        t.products.find(req.query.id)
      ]);
    })
      .then(function (data) {
        console.log(data[1]);
        res.render('products/product_edit', {
          user: req.user,
          product_group_list: data[0],
          product: data[1]
        });
      })
      .catch(function (error) {
        winston.error(error);
        res.render('products/product_edit', {
          user: req.user
        });
      });
  },

  edit_save: function(req, res, next) {
    db.products.edit(
      {
        id: req.body.id,
        product_name: req.body.product_name,
        product_image: req.body.product_image,
        service: req.body.service,
        price: req.body.price,
        show_to_public: req.body.show_to_public ? "TRUE" : "FALSE",
        product_group_id: req.body.product_group_id
      }
    )
      .then(function (data) {
        console.log("success data: ");
        console.log(data);
        res.redirect("/products");
      })
      .catch(function (error) {
        res.json({
          success: false,
          error: error.message || error
        });
      });
  }
};
