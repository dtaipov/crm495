INSERT INTO ${schema~}.contractor(name, contractor_group_id)
VALUES(${contractor_name}, ${contractor_group_id}) -- parameter names come directly from the HTTP handler;
RETURNING id