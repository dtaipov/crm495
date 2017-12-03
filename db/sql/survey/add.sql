INSERT INTO ${schema~}.survey(name, value)
VALUES(${name}, ${value}) -- parameter names come directly from the HTTP handler;
RETURNING id