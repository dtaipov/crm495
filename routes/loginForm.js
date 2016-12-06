var winston = require('winston');

function getRedirectPage(user) {
    if (user.userroles.indexOf(1) != -1) {
        return "/documents";
    }
    /*if (user.userroles.indexOf(3) != -1 || user.userroles.indexOf(2) != -1) {
        return "/devices";
    }
    if (user.userroles.indexOf(4) != -1 || user.userroles.indexOf(5) != -1) {
        return "/cards_management";
    }*/
    return null;
}

module.exports = function (passport) {
    var module = {};

    module.load = function (req, res, next) {
        /*if(!req.user) {
         winston.info(PAGE_NAME + "user not found");
         res.render('home');
         return;
         }*/
        //winston.info(PAGE_NAME + "createUserForm  req.user.role: " + req.user.role);
        // нужна защита от просмотра пользователей не администратором

        res.render('login', {
            //user: req.user
        });
    };

    module.signin = function(req, res, next) {
        var actionStatus = "SUCCESS";
        passport.authenticate('local-signin', function(err, user, info) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render('login', {message: "Пользователь с указанным именем и паролем не найден"});
            }
            req.logIn(user, function(err) {
                if (err) {
                    actionStatus = "FAIL";
                    return next(err);
                }
                req.brute.reset(function () {
                    var redirectPage = getRedirectPage(user);
                    return res.redirect(redirectPage);
                });
            });
        })(req, res, next);
    };

    module.logout = function(req, res) {
        winston.log("LOGGIN OUT");
        req.logout();
        res.redirect('/login');
    };

    return module;
};
