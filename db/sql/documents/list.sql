select
    d.id,
    d.description,
    d.creation,
    dt.name document_type_name,
    c.name contractor_name,
    cc_address.value contractor_address,
    cc_phone.value contractor_phone,
    ds.sum_money_amount,
    c_agent.name agent_name,
    pm.name payment_method_name
 from document_type dt,
 payment_method pm,
 document d
 left join
 document_sum ds
 on d.id = ds.document_id
 left join
 contractor c_agent on d.agent_id = c_agent.id
 left join
 contractor c on d.contractor_id = c.id
 left join
  contractor_contact cc_address on c.id = cc_address.contractor_id and cc_address.contact_type='ADDRESS'
 left join
  contractor_contact cc_phone on c.id = cc_phone.contractor_id and cc_phone.contact_type='PHONE'
where
 d.active = TRUE and
 d.document_type_id = dt.id and
 d.payment_method_id = pm.id and
 (${user_id} is null or ${user_id} = d.user_id)
order by d.id desc