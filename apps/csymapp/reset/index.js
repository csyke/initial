'use strict'
const to = require('await-to-js').to,
    passport = require('passport'),
    url = require('url'),
    moment = require('moment'),
    path = require('path'),
    csystem = require(__dirname + "/../../csystem").csystem,
    csymapp = require(path.join(__dirname, "/../../../src/csymapp/csymapp")),
    {
        sequelize
    } = require(__dirname + "/../../csystem").models,
    config = require(__dirname + '/../../../config/config.system'),
    Person = require(path.join(__dirname, '/../../../src/csymapp/Person'))(sequelize),
    EmailProfile = require(path.join(__dirname, '/../../../src/csymapp/Profiles/Email'))(sequelize),
    TelephoneProfile = require(path.join(__dirname, '/../../../src/csymapp/Profiles/Telephone'))(sequelize)

class Reset extends csystem {

    constructor() {
        super()
        let self = this
        self.csymapp = new csymapp(sequelize)
        // self.csymapp.__contructor()
    }

    async postReset(req, res) {
        let self = this;
        let profile = req.params.v1
        let code = req.params.v2
        let [err, care] = []
        let [err1, care1] = [];
        let body = req.body

        let appName = req.query.app || 'some unknown application'
        switch (profile) {
            case "emailprofile":

                break;
            case "telephoneprofile":
            console.log(body)
            console.log(code)
            // console.log(body)
                let phone = req.params.v3 || false;
                if (!phone) throw ({
                    Phone: `Missing phone number`,
                    code: 422,
                    status: 422
                });
                [err1, care1] = await to(TelephoneProfile.sendCode(phone, type, appName, self.csymapp.worldAdminUid, 1, "csystem", "root"));
                if (err1) throw err1;
                break;
            default:
                throw {
                    Profile: `unknown profile: ${profile}`,
                    code: 422,
                    status: 422
                }
        }
        return true;
    }

    async main(req, res) {
        let self = this;
        let method = req.method;
        let [err, care] = [];

        ;
        [err, care] = await to(self.csymapp.__contructor());

        switch (method) {
            case 'POST':
                ;
                [err, care] = await to(self.postReset(req, res));
                if (err) throw err
                res.json(care)
                break;
            default:
                res.status(422).json({
                    error: {
                        method: `${method} not supported`
                    }
                });
        }
    }




}

module.exports = new Reset();