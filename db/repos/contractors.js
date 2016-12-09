'use strict';

var sql = require('../sql').contractors;

module.exports = (rep, pgp) => {

    return {

        // Tries to find a product from id;
        /*find: id =>
            rep.oneOrNone('SELECT * FROM Products WHERE id = $1', id),*/

        list: () =>
            rep.any(sql.list),

        find: id =>
            rep.oneOrNone('SELECT c.*, c_phone.value contact_phone, c_address.value contact_address FROM contractor c ' +
                'left join contractor_contact c_phone on c.id=c_phone.contractor_id and c_phone.contact_type=\'PHONE\' ' +
                'left join contractor_contact c_address on c.id=c_address.contractor_id and c_address.contact_type=\'ADDRESS\' ' +
                'WHERE c.id = $1', id),

        add: values =>
            rep.one(sql.add, values, user => user.id),

        edit: values =>
            rep.tx(function (t) {
                var contractorId = values.id;
                console.log("contractorId:" + contractorId);
                var contactPhone = values.contact_phone;
                console.log("contactPhone:" + contactPhone);
                var contactAddress = values.contact_address;
                console.log("contactAddress:" + contactAddress);
                let queries = [rep.none(sql.edit,
                    {contractor_name: values.contractor_name,
                    contractor_group_id: values.contractor_group_id,
                    id: contractorId
                    }
                ),
                    this.none('delete from contractor_contact where contractor_id=$1', contractorId)
                ];
                if (contactPhone) {
                    queries.push(this.none('insert into contractor_contact (contact_type, value, contractor_id) ' +
                        'values ($1, $2, $3)', ['PHONE', contactPhone, contractorId]));
                }
                if (contactAddress) {
                    queries.push(this.none('insert into contractor_contact (contact_type, value, contractor_id) ' +
                        'values ($1, $2, $3)', ['ADDRESS', contactAddress, contractorId]));
                }
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
