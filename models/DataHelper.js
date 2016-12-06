var pg = require('pg');
var config = require('../config/config');
var winston = require('winston');
var util = require('util');

pg.on('error', function(err) {
    console.log("PG ERROR OCCURED: " + util.inspect(err));
    winston.error("PG ERROR OCCURED: " + util.inspect(err));
    pg.end();
});

function selectFromDB(pFieldsToSelect, pAsFieldsToSelect, pFuncName, pParams, callback) {
    if (pFuncName != "insert_event_log" && pFuncName != "insert_event_log1") {
        winston.info("DATA_HELPER: DataHelper selectFunction pParams: " + util.inspect(pParams));
    }
    var paramString = "("; // параметры в формате "($1, $2)"
    for(var i = 1; i <= pParams.length; i++) {
        if (i>1) {
            paramString += ",";
        }
        paramString += "$" + i;
    }
    paramString += ")";

    var url = "postgres://lwaliurowjjlfc:wUcxQ5b3h7z3khHqGcDOikMGx1@ec2-54-243-249-165.compute-1.amazonaws.com:5432/db9b6uacnamm2e?ssl=true";
    console.log(url);
    pg.connect(url,
        //"postgres://"+config.database.login+":"+config.database.password+"@"+config.database.ip+":"+config.database.port+"/"+config.database.database,
        function(err, client, done) {
        if(err) {
            winston.error('DATA_HELPER: error fetching client from pool', err);
            return callback(err, [-1]);
        } else {
            var queryString = "SELECT " +
                (pFieldsToSelect == null ? "*" : pFieldsToSelect) +
                " from " + pFuncName +
                paramString +
                (pAsFieldsToSelect == null ? "" : pAsFieldsToSelect);
            if (pFuncName != "insert_event_log" && pFuncName != "insert_event_log1") {
                winston.info("DATA_HELPER: DataHelper select string: " + queryString);
            }

            var results = [];
            var query = client.query(queryString, pParams);

            query.on('row', function(row) {
                results.push(row);
            });

            // After all data is returned, close connection and return results
            query.on('end', function() {
                done();
                return callback(null, results);
            });

            query.on('error', function(err) {
                done();
                winston.error('DATA_HELPER: error running query', err);
                return callback(err, [-2]);
            });
        }
    });
}

module.exports = {

    executeFunction: function(pFuncName, pParams, callback) {
        selectFromDB("ret_code, message", " as (ret_code int, message text)", pFuncName, pParams, function(err, results) {
            callback(err, [results[0].ret_code, results[0].message]);
        });
    },

    selectFunction: function(pFuncName, pParams, callback) {
        selectFromDB(null, null, pFuncName, pParams, callback);
    }

    // выполеннеие select запросов кода возвращается SETOF record
    /*
     selectFunction: function(pFuncName, pParams, pColumnNames, callback) {
     var paramString = "("; // параметры в формате "($1, $2)"
     for(var i = 1; i <= pParams.length; i++) {
     if (i>1) {
     paramString += ",";
     }
     paramString += "$" + i;
     }
     paramString += ")";

     var columNamesWithTypes = "("; // возвращаемые поля в формате "(id character varying, name character varying, description character varying)"
     for(var j = 0; j < pColumnNames.length; j++) {
     if (j>0) {
     columNamesWithTypes += ",";
     }
     columNamesWithTypes += pColumnNames[j] + " character varying";
     }
     columNamesWithTypes += ")";

     var columnNames = pColumnNames.join(); // парметры в формате "id, name, description"

     pg.connect(conString, function(err, client, done) {
     if(err) {
     console.error('error fetching client from pool', err);
     }
     var queryString = "SELECT " + columnNames + " from " + pFuncName + paramString + " as " + columNamesWithTypes;
     console.log("DataHelper select string: " + queryString);
     var query = client.query(queryString, pParams, function (err, result) {
     done();

     if(err) {
     console.error('error running query', err);
     callback([-1]);
     }
     callback(result.rows);
     });
     });
     },*/

};
