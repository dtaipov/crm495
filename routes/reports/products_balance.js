module.exports = {

    index: function (req, res, next) {
        res.render('reports/products_balance', {
            user: req.user
        });

    }
};
