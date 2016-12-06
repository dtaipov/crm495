select p.id, p.name, sum_quantity from product p,
(select product_id, sum(quantity) sum_quantity from store_operation so
group by product_id) x
where x.product_id = p.id