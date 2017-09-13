const ADMIN = 1;
const OPERATOR = 2;

const allRoles = [ADMIN, OPERATOR];
const adminRoles = [ADMIN];

module.exports = {

    METHOD_GET: ".GET",

    RESOURCES: {
        "/documents.GET": allRoles,
        "/store_operations.GET": adminRoles,
        "/finance_operations.GET": allRoles,
        "/documents/edit.GET": allRoles,
        "/documents/edit.POST": adminRoles,
        "/contractors.GET": allRoles,
        "/contractors/add.GET": adminRoles,
        "/contractors/add.POST": adminRoles,
        "/contractors/edit.GET": allRoles,
        "/contractors/edit.POST": adminRoles,
        "/products.GET": allRoles,
        "/products/add.GET": adminRoles,
        "/products/add.POST": adminRoles,
        "/products/edit.GET": allRoles,
        "/products/edit.POST": adminRoles,
        "/reports/products_balance.GET": adminRoles,
    }
};