module.exports = {

    index: function (req, res, next) {
        res.render('products', {
            user: req.user
        });

    }
};
