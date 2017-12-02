module.exports = {

    /*delete: function (req, res, next) {
        DevicesModel.deleteDevices(req.query.ids,
            function (err, resp) {
                var ids = req.query.ids.replace("{", "").replace("}", "").replace("null", "").trim().split(',');
                if (err) {
                    winston.error(PAGE_NAME + "Remove device err: " + util.inspect(err));
                    return next(err);
                }
            }
        );
    },*/

    index: function (req, res, next) {
      res.render('documents', {
        user: req.user,
        debug: req.query.debug
      });
    },

    /*get_documents: function(req, res, next) {
        DocumentsModel.getDocuments('null','null', function (err, documents) {
            winston.info(PAGE_NAME + "documents: " + util.inspect(documents));
            if (err) {
                winston.error(PAGE_NAME + "err: " + util.inspect(err));
                return next(err);
            }
            res.json(documents);
        });
    }*/
};
