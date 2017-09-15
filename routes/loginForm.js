const logger = require('winston');

function getRedirectPage(user) {
    //if (user.userroles.indexOf(1) != -1) {
        //return "/documents";
    //}
    //if (user.userroles.indexOf(2) != -1) {
        return "/documents";
    //}
    //return null;
}

module.exports = (passport) => {
    const module = {};

    module.load = (req, res, next) => {
        res.render('login', {
        });
    };

    module.signin = (req, res, next) => {
        let actionStatus = "SUCCESS";
        passport.authenticate('local-signin', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('login', {message: "Пользователь с указанным именем и паролем не найден"});
            }
            req.logIn(user, (err) => {
                if (err) {
                    actionStatus = "FAIL";
                    return next(err);
                }
                req.brute.reset( () => {
                    const redirectPage = getRedirectPage(user);
                    return res.redirect(redirectPage);
                });
            });
        })(req, res, next);
    };

    module.logout = (req, res) => {
        logger.log("LOGGIN OUT");
        req.logout();
        res.redirect('/login');
    };

    return module;
};
