var express = require('express');
var hbs = require('hbs');
var util = require('util');

var ExpressBrute = require('express-brute');
var brutStore = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
var BrutForceUtils = require('./utils/brutForceUtils');


var failCallback = function (req, res, next, nextValidRequestDate) {
  var nextValidDateFormatted = moment(nextValidRequestDate).format('D.MM.YYYY HH:mm:ss');
  res.render('login', {message: "Превышено максимальное количество попыток входа. Следующий вход можно совершить не раньше: " + nextValidDateFormatted});
  BrutForceUtils.loginBrutForce(req, nextValidRequestDate);
};
var bruteforce = new ExpressBrute(brutStore, {
  freeRetries: 3,
  minWait: 5*60*1000, // 5 minutes
  maxWait: 60*60*1000, // 1 hour,
  failCallback: failCallback
});

var winston = require('winston');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./db').db;
var store = new session.MemoryStore();

var passport = require('passport');
//var i18n = require('i18n');
var LocalStrategy = require('passport-local').Strategy;

var loginForm = require('./routes/loginForm')(passport);
var home = require('./routes/home');
var documents = require('./routes/documents');
var contractors = require('./routes/contractors');
var products = require('./routes/products');
var document_form = require('./routes/documents/document_form');
var contractor_form = require('./routes/contractors/contractor_form');
var product_form = require('./routes/products/product_form');
var store_operations = require('./routes/store_operations');
var finance_operations = require('./routes/finance_operations');
var products_balance = require('./routes/reports/products_balance');
var Permissions = require('./utils/Permissions');

var Users = require('./models/Users');

var app = express();

var cookieParserWithSecrets = cookieParser('novanova');
app.use(cookieParserWithSecrets);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var config = require('./config/config');

var port = config.user_interface.port;
const SESSION_ID_COOKIE_NAME = "session" + port;

app.use(session({store :store, name: SESSION_ID_COOKIE_NAME, secret: 'novanova', saveUninitialized: true, resave:true}));
app.use(passport.initialize());
app.use(passport.session());

hbs.registerPartials(__dirname + '/views/partials');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');

if (app.get('env') === 'development') {
  var hbsutils = require('hbs-utils')(hbs);
  hbsutils.registerWatchedPartials(__dirname + '/views/partials');

  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });

}

app.get('/', home.index);

app.get('/login', loginForm.load);
app.post('/login', bruteforce.prevent, loginForm.signin);
app.get('/logout', loginForm.logout);
app.get('/documents', isLoggedIn, documents.index);
app.get('/documents/add', isLoggedIn, document_form.add_index);
app.post('/documents/add', isLoggedIn, document_form.add_save);
app.get('/documents/edit', isLoggedIn, document_form.edit_index);
app.post('/documents/edit', isLoggedIn, document_form.edit_save);
GET('/documents/list', () => db.documents.list());

app.get('/contractors', isLoggedIn, contractors.index);
app.get('/contractors/add', isLoggedIn, contractor_form.add_index);
app.post('/contractors/add', isLoggedIn, contractor_form.add_save);
app.get('/contractors/edit', isLoggedIn, contractor_form.edit_index);
app.post('/contractors/edit', isLoggedIn, contractor_form.edit_save);
GET('/contractors/list', () => db.contractors.list());

app.get('/products', isLoggedIn, products.index);
app.get('/products/add', isLoggedIn, product_form.add_index);
app.post('/products/add', isLoggedIn, product_form.add_save);
app.get('/products/edit', isLoggedIn, product_form.edit_index);
app.post('/products/edit', isLoggedIn, product_form.edit_save);
GET('/products/list', () => db.products.list());

/*POST('/documents/add', req => db.documents.add(
    {
        contractor_id: req.body.contractor_id,
        payment_method_id: req.body.payment_method_id,
        document_type_id: req.body.document_type_id,
    }
));*/
//POST('/documents/edit', );
//app.post('/document_product_remainder_enter', isLoggedIn, document_product_remainder_enter.save);
app.get('/store_operations', isLoggedIn, store_operations.index);
//app.get('/get_store_operations', isLoggedIn, store_operations.get_store_operations);
app.get('/finance_operations', isLoggedIn, finance_operations.index);
app.get('/reports/products_balance', isLoggedIn, products_balance.index);
//app.get('/get_finance_operations', isLoggedIn, finance_operations.get_finance_operations);

GET('/reports/products_balance_list', () => db.reports.products_balance_list());
GET('/finances/finance_operations_list', () => db.finances.finance_operations_list());
GET('/store/store_operations_list', () => db.store.store_operations_list());

function GET(url, handler) {
  app.get(url, (req, res) => {
    handler(req)
        .then(data => {
          res.json({
            success: true,
            data
          });
        })
        .catch(error => {
          res.json({
            success: false,
            error: error.message || error
          });
        });
  });
}

/*function POST(url, handler) {
  app.post(url, (req, res) => {
    handler(req)
        .then(data => {
          res.json({
            success: true,
            data
          });
        })
        .catch(error => {
          res.json({
            success: false,
            error: error.message || error
          });
        });
  });
}*/

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

hbs.registerHelper('menuItemWithSubmenu', function(name, options) {
  var innerHTML = options.fn(this); // если нет доступных пользователю подменю, то главный пункт меню тоже не отображаем
  if (innerHTML.indexOf("li") != -1) {
    return new hbs.SafeString('<li class="dropdown">' +
        '<a href="#" class="dropdown-toggle">' + name + ' <b class="caret"></b></a>' +
        '<ul class="dropdown-menu topNavMenu">' +
        innerHTML +
        '</ul>' +
        '</li>');
  }
});

hbs.registerHelper('menuItem', function(path, name, userRoles) {
  if (checkPermissions(path + Permissions.METHOD_GET, userRoles)) {
    return new hbs.SafeString(
        '<li><a href="' + path + '">' + name + '</a></li>');
  }
});

hbs.registerHelper('json', function(jsonObject) {
  return new hbs.SafeString(JSON.stringify(jsonObject));
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
});

passport.serializeUser(function(user, done) {
  console.log("SERIALIZE USER");
  done(null, user);
});


passport.deserializeUser(function(user, done) {
  console.log("DESERIALIZE USER");
  done(null, user);
  /*UsersModel.getUserById(id, function(err, users) {

   if(err){
   done(err);
   }else{
   if (users.length == 1) {
   var user = users[0];
   //console.log("user found by id! " + JSON.stringify(user));
   done(null, user);
   } else {
   done(-1, null);
   }

   }

   });*/
});

passport.use('local-signin', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    function(req, username, password, done) {
      console.log("PASSPORT local-signin");

      var user = null;
      Users.getUserInfo(username, password, function(err, users) {
        console.log("GET USER INFO: "+users[0].id);
        //var err = null;
        if (users[0].id == null) {
          console.log('local-signing err: ' + err);
          //return done(null, false, req.flash('loginMessage', 'Error while getting user')); // req.flash is the way to set flashdata using connect-flash
          //return done(err, req, null, 1);
          return done(err);
        }
        if (users.length == 1) {
          user = users[0];
          console.log("user found! " + user.login);
        } else {
          return done(null, false); // req.flash is the way to set flashdata using connect-flash
        }
        console.log("USER: " + JSON.stringify(user));
        return done(null, user);
      });
    }
));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    console.log('User is authenticated!' + JSON.stringify(req.user));
    if (!isAuthorized(req)) {
      console.log('User is not authorized: ' + JSON.stringify(req.user) + ", resourse: " + req.path);
      return res.sendStatus(403);
    }
    return next();
  } else {
    console.log('User is not authenticated, redirecting to login page');
    res.redirect('/login');
  }
}

function isAuthorized(req) {
  return checkPermissions(req.path + "." + req.method, req.user.userroles);
}

function checkPermissions(resource, userRoles) {
  var roles = Permissions.RESOURCES[resource];
  if (!roles) {
    return false;
  }
  return userRoles.some(function(value) {
    return roles.indexOf(value) != -1;
  });
}
