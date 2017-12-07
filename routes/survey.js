const db = require('../db/index').db;
const Sanitize = require('../utils/Sanitize');
const request = require('request');

module.exports = {

  index: function (req, res, next) {
    res.render('survey', {
      user: req.user,
      req: {}
    });
  },

  edit_save: (req, res, next) => {
    const recaptchaResponse = req.body["g-recaptcha-response"];
    request.post(
      'https://www.google.com/recaptcha/api/siteverify?secret=6LfN_jsUAAAAAFbPTZUhXRZbPRjyXJQlogZtwfF2&response=' + recaptchaResponse,
      function (error, response, body) {
        if (body && JSON.parse(body)["success"]) {
          db.task(t => {
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
              t.survey.add({name: "20", value: req.body["20"]}),
              t.survey.add({name: "21", value: req.body["21"]}),
              t.survey.add({name: "22", value: req.body["22"]}),
              t.survey.add({name: "23", value: req.body["23"]}),
              t.survey.add({name: "24", value: req.body["24"]}),
              t.survey.add({name: "25", value: req.body["25"]}),
              t.survey.add({name: "26", value: req.body["26"]}),
              t.survey.add({name: "27", value: req.body["27"]}),
              t.survey.add({name: "28", value: req.body["28"]}),
              t.survey.add({name: "29", value: req.body["29"]}),
              t.survey.add({name: "30", value: req.body["30"]},
              t.survey.add({name: "ip", value: req.connection.remoteAddress}),
              t.survey.add({name: "user_agent", value: req.header('user-agent')}),
              t.survey.add({name: "comment1", value: req.body["comment1"]}),
              t.survey.add({name: "comment2", value: req.body["comment2"]}),
              t.survey.add({name: "email", value: req.body["email"]})
              )
            ]);
          })
            .then((data) => {
              res.render('survey', {
                message: "true",
                req: {}
              });
            })
            .catch(function (error) {
              res.json({
                success: false,
                error: error.message || error,
                req: {}
              });
            });
        }
        else {
          res.render('survey', {
            error: "recaptcha",
            req: req.body
          });
        }
      }
    );
  }
};