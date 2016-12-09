select
    d.id,
    d.description,
    d.creation,
    dt.name document_type_name,
    c.name contractor_name,
    cc_address.value contractor_address,
    cc_phone.value contractor_phone,
    ds.sum_money_amount
 from document_type dt,
 document d
 left join
 document_sum ds
 on d.id = ds.document_id
 left join
 contractor c on d.contractor_id = c.id
 left join
  contractor_contact cc_address on c.id = cc_address.contractor_id and cc_address.contact_type='ADDRESS'
 left join
  contractor_contact cc_phone on c.id = cc_phone.contractor_id and cc_phone.contact_type='PHONE'
where
 d.active = TRUE and
 d.document_type_id = dt.id
order by d.id desc