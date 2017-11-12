'use strict';

const sql = require('../sql').contractors;

const addPhoneAndAddressQueries = (rep, queries, phone, address, contractorId) => {
  if (phone) {
    queries.push(rep.none('insert into contractor_contact (contact_type, value, contractor_id) ' +
      'values ($1, $2, $3)', ['PHONE', phone, contractorId]));
  }
  if (address) {
    queries.push(rep.none('insert into contractor_contact (contact_type, value, contractor_id) ' +
      'values ($1, $2, $3)', ['ADDRESS', address, contractorId]));
  }
};

module.exports = (rep, pgp) => {

    return {
        list: values =>
            rep.any(sql.list, values),

        find: id =>
            rep.oneOrNone('SELECT c.*, c_phone.value contact_phone, c_address.value contact_address FROM contractor c ' +
                'left join contractor_contact c_phone on c.id=c_phone.contractor_id and c_phone.contact_type=\'PHONE\' ' +
                'left join contractor_contact c_address on c.id=c_address.contractor_id and c_address.contact_type=\'ADDRESS\' ' +
                'WHERE c.id = $1', id),

        //add: values =>
            //rep.one(sql.add, values, user => user.id),

        edit: values =>
            rep.tx(function (t) {
              let contractorId = values.id;
              const contactPhone = values.contact_phone;
              const contactAddress = values.contact_address;
              const queries = [];
              if (contractorId) {
                queries.push(
                  rep.none(sql.edit,
                  {
                    contractor_name: values.contractor_name,
                    contractor_group_id: values.contractor_group_id,
                    id: contractorId
                  }
                ));
                queries.push(
                  rep.none('delete from contractor_contact where contractor_id=$1', contractorId)
                );
                addPhoneAndAddressQueries(rep, queries, contactPhone, contactAddress, contractorId);
              } else {
                queries.push(
                  rep.one(sql.add, values)
                );
              }
              // todo process returning id and save phone and email on contractor insert
              return this.batch(queries);
            })
                .then(function (data) {
                    console.log(data);
                })
                .catch(function (error) {
                    console.log(error); // printing the error;
                }),

        contractor_group_list: () =>
            rep.any(sql.contractor_group_list)
    };
};
