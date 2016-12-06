select
    d.id,
    d.description,
    d.creation,
    dt.name document_type_name,
    c.name contractor_name,
    cc.value contractor_address,
    ds.sum_money_amount
 from document_type dt,
 document d
 left join
 document_sum ds
 on d.id = ds.document_id
 left join
 contractor c on d.contractor_id = c.id
 left join
  contractor_contact cc on c.id = cc.contractor_id and cc.contact_type='ADDRESS'
where
 d.active = TRUE and
 d.document_type_id = dt.id
order by d.id desc