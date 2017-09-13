module.exports = {
    index: function (req, res, next) {
        res.render('contractors', {
            user: req.user
        });
    }
};
