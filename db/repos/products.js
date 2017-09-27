'use strict';
const sql = require('../sql').products;

module.exports = (rep, pgp) => {

  return {
    list: () =>
      rep.any(sql.list),

    find: id =>
      rep.oneOrNone('SELECT * FROM product WHERE id = $1', id),

    //add: values =>
      //rep.one(sql.add, values, user => user.id),

    edit: values =>
      rep.tx(function (t) {
        if (values.id) {
          const productImage = values.product_image;
          let queries = [this.none('UPDATE product\n' +
            'SET name=$1,service=$2,price=$3,product_group_id=$4,show_to_public=$6\n' +
            'WHERE id=$5;',
            [values.product_name,
              values.service,
              values.price,
              values.product_group_id,
              values.id,
              values.show_to_public
            ]
          )
          ];
          if (productImage) {
            queries.push(this.none('insert into image_to_product (product_id, image_url, active) VALUES($1, $2, $3)',
              [values.id, productImage, true]));
          }
          return this.batch(queries);
        } else {
          return rep.one(sql.add, values, user => user.id);
        }
      }).then(data => {
          console.log(data);
        })
        .catch(error => {
          console.log(error); // printing the error;
        }),

        product_group_list: () =>
            rep.any(sql.product_group_list),

        list_only_products: () =>
            rep.any('SELECT * FROM product where service = FALSE order by name'),

        all: () =>
            rep.any('SELECT * FROM product order by name'),

    };
};
