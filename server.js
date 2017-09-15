const express = require('express');
const util = require('util');

const ExpressBrute = require('express-brute');
const brutStore = new ExpressBrute.MemoryStore(); // stores state locally, don't use this in production
const BrutForceUtils = require('./utils/brutForceUtils');


const failCallback = function (req, res, next, nextValidRequestDate) {
  const nextValidDateFormatted = moment(nextValidRequestDate).format('D.MM.YYYY HH:mm:ss');
  res.render('login', {message: "Превышено максимальное количество попыток входа. Следующий вход можно совершить не раньше: " + nextValidDateFormatted});
  BrutForceUtils.loginBrutForce(req, nextValidRequestDate);
};
const bruteforce = new ExpressBrute(brutStore, {
  freeRetries: 3,
  minWait: 5*60*1000, // 5 minutes
  maxWait: 60*60*1000, // 1 hour,
  failCallback: failCallback
});

const winston = require('winston');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db').db;
const store = new session.MemoryStore();

const passport = require('passport');
//const i18n = require('i18n');
const LocalStrategy = require('passport-local').Strategy;

const loginForm = require('./routes/loginForm')(passport);
const home = require('./routes/home');
const documents = require('./routes/documents');
const contractors = require('./routes/contractors');
const products = require('./routes/products');
const document_form = require('./routes/documents/document_form');
const contractor_form = require('./routes/contractors/contractor_form');
const product_form = require('./routes/products/product_form');
//const store_operations = require('./routes/store_operations');
const finance_operations = require('./routes/finance_operations');
const products_balance = require('./routes/reports/products_balance');
const Permissions = require('./utils/Permissions');

const app = express();

const cookieParserWithSecrets = cookieParser('novanova');
app.use(cookieParserWithSecrets);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.PORT || 5000;

const SESSION_ID_COOKIE_NAME = "session" + port;

app.use(session({store :store, name: SESSION_ID_COOKIE_NAME, secret: 'novanova', saveUninitialized: true, resave:true}));
app.use(passport.initialize());
app.use(passport.session());

//hbs.registerPartials(__dirname + '/views/partials');

app.set('port', port);

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', home.index);

app.get('/login', loginForm.load);
app.post('/login', bruteforce.prevent, loginForm.signin);
app.get('/logout', loginForm.logout);
app.get('/documents', isLoggedIn, documents.index);
app.get('/documents/edit', isLoggedIn, document_form.edit_index);
app.post('/documents/edit', isLoggedIn, document_form.edit_save);
GET('/documents/list', () => db.documents.list());

app.get('/contractors', isLoggedIn, contractors.index);
app.get('/contractors/add', isLoggedIn, contractor_form.add_index);
app.post('/contractors/add', isLoggedIn, contractor_form.add_save); // заменить на edit_save
app.get('/contractors/edit', isLoggedIn, contractor_form.edit_index);
app.post('/contractors/edit', isLoggedIn, contractor_form.edit_save);
GET('/contractors/list', () => db.contractors.list());

app.get('/products', isLoggedIn, products.index);
app.get('/products/add', isLoggedIn, product_form.add_index);
app.post('/products/add', isLoggedIn, product_form.add_save); // заменить на edit_save
app.get('/products/edit', isLoggedIn, product_form.edit_index);
app.post('/products/edit', isLoggedIn, product_form.edit_save);
GET('/products/list', () => db.products.list());

//app.get('/store_operations', isLoggedIn, store_operations.index);
app.get('/finance_operations', isLoggedIn, finance_operations.index);
app.get('/reports/products_balance', isLoggedIn, products_balance.index);

GET('/reports/products_balance_list', () => db.reports.products_balance_list());
GET('/finances/finance_operations_list', () => db.finances.finance_operations_list());
//GET('/store/store_operations_list', () => db.store.store_operations_list());

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

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/*hbs.registerHelper('menuItem', function(path, name) {
  if (checkPermissions(path + Permissions.METHOD_GET, this.user.userroles)) {
    return new hbs.SafeString(
        '<li class="nav-item"><a class="nav-link" href="' + path + '">' + name + '</a></li>');
  }
});

hbs.registerHelper('menuItemSubmenu', function (path, name) {
  if (checkPermissions(path + Permissions.METHOD_GET, this.user.userroles)) {
    return new hbs.SafeString(
      '<a class="dropdown-item" href="' + path + '">' + name + '</a>');
  }
});

hbs.registerHelper('menuItemWithSubmenu', function (name, options) {
  const innerHTML = options.fn(this); // если нет доступных пользователю подменю, то главный пункт меню тоже не отображаем
  if (innerHTML.trim().length > 0) {
    return new hbs.SafeString('<li class="nav-item dropdown">' +
      '<a href="#" class="nav-link dropdown-toggle" id="navbarDropdownMenuLink' + name + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' + name + '</a>' +
      '<div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink' + name + '">' +
      innerHTML +
      '</div>' +
      '</li>'
    );
  }
});

hbs.registerHelper('json', function(jsonObject) {
  return new hbs.SafeString(JSON.stringify(jsonObject));
});

hbs.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
});*/

passport.serializeUser(function(user, done) {
  done(null, user);
});


passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use('local-signin', new LocalStrategy(
    {passReqToCallback : true}, //allows us to pass back the request to the callback
    (req, username, password, done) => {
      db.users.getUserInfo(username, password).then(user => {
        if (!user) {
          return done(new Error("user not found"));
        }
        user.userroles = [1];
        return done(null, user);
      }).catch(error => {
        return done(error);
      });
    }
));

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    if (!isAuthorized(req)) {
      console.log('User is not authorized: ' + JSON.stringify(req.user) + ", resourse: " + req.path);
      return res.sendStatus(403);
    }
    return next();
  } else {
    res.redirect('/login');
  }
}

function isAuthorized(req) {
  return checkPermissions(req.path + "." + req.method, req.user.userroles);
}

function checkPermissions(resource, userRoles) {
  const roles = Permissions.RESOURCES[resource];
  if (!roles) {
    return false;
  }
  return userRoles.some(function(value) {
    return roles.indexOf(value) !== -1;
  });
}
