'use strict';

const sql = require('../sql').survey;

module.exports = (rep, pgp) => {

  return {

    add: values => {
      rep.none(sql.add, values)}
  }
};