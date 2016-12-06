select
    fo.id,
    fo.document_id,
    d.creation,
    fo.money_amount*fo.quantity money_amount_sum,
    p.name product_name,
    c.name contractor_name
 from contractor c, document d, finance_operation fo
 left join product p
 on fo.product_id = p.id
where
 fo.document_id = d.id and
 d.contractor_id = c.id
 --and fo.product_id = p.id
order by fo.id;