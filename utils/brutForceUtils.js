module.exports = {
    brutClients: [],

    loginBrutForce: function (req, nextValidRequestDate) {
        var client = {ip: req.ip, nextValReqDate: nextValidRequestDate};
        var count = 0;
        var nowDate = new Date().getTime();
        var included = false;

        while(this.brutClients.length > count){
            if(this.brutClients[count].nextValReqDate.getTime() == client.nextValReqDate.getTime()
                && this.brutClients[count].ip == client.ip ){
                included = true;
            }
            if(this.brutClients[count].nextValReqDate.getTime() < nowDate){
                this.brutClients.splice(count, 1);
            }else{
                count++;
            }
        }
        var nextValidDateFormatted = moment(nextValidRequestDate).format('D.MM.YYYY HH:mm:ss');
        if(!included){
            this.brutClients.push(client);
        }
    }

};