INSERT INTO ${schema~}.contractor(name, contractor_group_id, user_id)
VALUES(${contractor_name}, ${contractor_group_id}, ${user_id}) -- parameter names come directly from the HTTP handler;
RETURNING id