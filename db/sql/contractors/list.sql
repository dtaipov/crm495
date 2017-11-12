select
    c.id,
    c.name,
    c.creation,
    c.description,
    cg.name contractor_group_name,
    cc_address.value contact_address,
    cc_phone.value contact_phone
from contractor_group cg, contractor c
 left join contractor_contact cc_address
 on c.id = cc_address.contractor_id and cc_address.contact_type = 'ADDRESS'
 left join contractor_contact cc_phone
 on c.id = cc_phone.contractor_id and cc_phone.contact_type = 'PHONE'
where c.contractor_group_id = cg.id and c.user_id = ${user_id}
order by c.name