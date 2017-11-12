INSERT INTO ${schema~}.product(name, service, price, product_group_id, show_to_public, user_id)
VALUES(${product_name}, ${service}, ${price}, ${product_group_id}, ${show_to_public}, ${user_id}) -- parameter names come directly from the HTTP handler;
RETURNING id