select
    so.id,
    p.name product_name,
    so.quantity,
    d.creation,
    so.document_id,
    c.name contractor_name
 from store_operation so, product p, document d
 left join contractor c on d.contractor_id = c.id
where
 so.product_id = p.id and
 so.document_id = d.id
order by so.id desc;