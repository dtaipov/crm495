module.exports = {
    index: function (req, res, next) {
        res.render('finance_operations', {
            user: req.user
        });
    }
};
