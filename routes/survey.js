const db = require('../db/index').db;
const Sanitize = require('../utils/Sanitize');

module.exports = {

  index: function (req, res, next) {
    res.render('survey', {
      user: req.user
    });
  },

  edit_save: (req, res, next) => {
    db.task(t=> {
      return t.batch([
        t.survey.add({name: "1", value: req.body["1"]}),
        t.survey.add({name: "2", value: req.body["2"]}),
        t.survey.add({name: "3", value: req.body["3"]}),
        t.survey.add({name: "4", value: req.body["4"]}),
        t.survey.add({name: "5", value: req.body["5"]}),
        t.survey.add({name: "6", value: req.body["6"]}),
        t.survey.add({name: "7", value: req.body["7"]}),
        t.survey.add({name: "8", value: req.body["8"]}),
        t.survey.add({name: "9", value: req.body["9"]}),
        t.survey.add({name: "10", value: req.body["10"]}),
        t.survey.add({name: "11", value: req.body["11"]}),
        t.survey.add({name: "12", value: req.body["12"]}),
        t.survey.add({name: "13", value: req.body["13"]}),
        t.survey.add({name: "14", value: req.body["14"]}),
        t.survey.add({name: "15", value: req.body["15"]}),
        t.survey.add({name: "16", value: req.body["16"]}),
        t.survey.add({name: "17", value: req.body["17"]}),
        t.survey.add({name: "18", value: req.body["18"]}),
        t.survey.add({name: "19", value: req.body["19"]}),
        t.survey.add({name: "20", value: req.body["20"]})
      ]);
    })
      .then((data) => {
        console.log("success data: ");
        console.log(data);
        res.render('survey', {
          message: "true"
        });
      })
      .catch(function (error) {
        res.json({
          success: false,
          error: error.message || error
        });
      });
  }
};