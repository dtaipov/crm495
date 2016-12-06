var DataHelper = require('../models/DataHelper.js');

module.exports = {
    getUserInfo: function (username, password, callback) {
        DataHelper.selectFunction("get_user_info", [username, password], callback);
    },

    /*getUserById: function (id, callback) {
        DataHelper.selectFunction("get_user_by_id", [id], callback);
    },

    getUsers: function (page, skip, callback) {
        DataHelper.selectFunction("get_users", [page, skip], callback);
    },*/

    /*getRoles: function (callback) {
        DataHelper.selectFunction("get_roles", [], callback);
    },

    getGroups: function (callback) {
        DataHelper.selectFunction("get_groups", [], callback);
    },

    getUserGroups: function (userId, callback) {
        DataHelper.selectFunction("get_user_groups", [userId], callback);
    },

    createUser: function(pUsername,
                         pPassword,
                         pDescription,
                         pEmail,
                         pRoles,
                         pGroups,
                         pNotifications,
                         callback) {
        DataHelper.executeFunction("create_user",
            [pUsername,
                pPassword,
                pDescription,
                pEmail,
                pRoles,
                pGroups,
                pNotifications
            ],
            callback);
    },

    editUser: function(pId,
                       pLogin,
                       pPassword,
                       pDescription,
                       pEmail,
                       pStatus,
                       pRoles,
                       pGroups,
                       pNotifications,
                       callback) {
        DataHelper.executeFunction("edit_user",
            [pId,
                pLogin,
                pPassword,
                pDescription,
                pEmail,
                pStatus,
                pRoles,
                pGroups,
                pNotifications],
            callback);
    },

    deleteUsers: function(pUIds, callback) {
        DataHelper.executeFunction("delete_users", [pUIds], callback);
    },

     getUsersCount: function (callback) {
     DataHelper.selectFunction("get_users_count", [], callback);
     }*/
};
