select
    p.id,
    p.name,
    p.service,
    p.price,
    pg.name product_group_name
 from product p,
 product_group pg
where
 pg.id = p.product_group_id