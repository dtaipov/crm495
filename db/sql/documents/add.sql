/*
    Adds a new product for a specified user.

    NOTE: We only add schema here to demonstrate the ability of class QueryFile
    to pre-format SQL with static formatting parameters when needs to be.
*/
INSERT INTO ${schema~}.document(contractor_id, payment_method_id, document_type_id)
VALUES(${contractor_id}, ${payment_method_id}, ${document_type_id}) -- parameter names come directly from the HTTP handler;
RETURNING id
