select
    c.id,
    c.name,
    c.creation,
    c.description,
    cg.name contractor_group_name
from contractor c, contractor_group cg
where c.contractor_group_id = cg.id
order by c.name