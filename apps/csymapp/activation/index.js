'use strict'
const to = require('await-to-js').to,
    passport = require('passport'),
    url = require('url'),
    moment = require('moment'),
    csystem = require(__dirname + "/../../csystem").csystem,
    {
        sequelize
    } = require(__dirname + "/../../csystem").models
    // ,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)
    ,
    config = require(__dirname + '/../../../config/config.system')
    // , { Entropy, charset8 } = require('entropy-string')
    // , entropy = new Entropy({ total: 1e6, risk: 1e9 })
    ,
    path = require("path"),
    Person = require(path.join(__dirname, '/../../../src/csymapp/Person'))(sequelize),
    EmailProfile = require(path.join(__dirname, '/../../../src/csymapp/Profiles/Email'))(sequelize)


class Activation extends csystem {

    constructor() {
        super()
    }

    async getActivation(req, res) {
        let self = this;
        let profile = req.params.v1
        let code = req.params.v2
        let [err, care] = []
        let [err1, care1] = [];

        await to(sequelize.models.TelephoneProfileCode.destroy({
            where: {
                createdAt: {lte:moment().subtract(config.get('/CodeTTL/Telephone'), 'minutes').toDate()}
            }
        }))
        await to(sequelize.models.EmailProfileCode.destroy({
            where: {
                createdAt: {lte:moment().subtract(config.get('/CodeTTL/Email'), 'hours').toDate()}
            }
        }))

        switch (profile) {
            case "emailprofile":
                ;
                [err, care] = await to(sequelize.models.EmailProfileCode.findOne({
                    where: {
                        Code: code,
                        Type: "Activate"
                    },
                    include: [{
                        model: sequelize.models.EmailProfile,
                        attributes: ['Email']
                    }]
                }))
                if (care === null) throw {
                    Code: `code is invalid or expired`,
                    code: 422,
                    status: 422
                }
                await to(sequelize.models.EmailProfile.update({
                    IsActive: true
                }, {
                    where: {
                        Email: care.EmailProfile.Email
                    }
                }))
                await to(sequelize.models.EmailProfileCode.destroy({
                    where: {
                        Code: code,
                        Type: "Activate"
                    }
                }))
                return {activation:'success'}
                // break;
            case "telephoneprofile":
                ;
                [err, care] = await to(sequelize.models.TelephoneProfileCode.findOne({
                    where: {
                        Code: code,
                        Type: "Activate"
                    },
                    include: [{
                        model: sequelize.models.TelephoneProfile,
                        attributes: ['Telephone']
                    }]
                }))
                // if (care === null || care === undefined) throw {
                if (!care) throw {
                    Code: `code is invalid or expired`,
                    code: 422,
                    status: 422
                }
                await to(sequelize.models.TelephoneProfile.update({
                    IsActive: true
                }, {
                    where: {
                        Telephone: care.TelephoneProfile.Telephone
                    }
                }))
                await to(sequelize.models.TelephoneProfileCode.destroy({
                    where: {
                        Code: code,
                        Type: "Activate"
                    }
                }))
                // await to(sequelize.models.TelephoneProfileCode.destroy({
                //     where: {
                //         DataTime: {gte:moment().subtract(24, 'hours').toDate()}
                //     }
                // }))
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

        switch (method) {
            case 'GET':
                ;
                [err, care] = await to(self.getActivation(req, res));
                // if (err) throw err
                // res.json(care)
                break;
            default:
                res.status(422).json({
                    error: {
                        method: `${method} not supported`
                    }
                });
        }
        let ret;

        //http://localhost:3000/csymapp/activation/emailprofile/DDjbj9Lh4tnF?csymappredirect=http://localhost
        if(err){
            ret = encodeURI(JSON.stringify(err))
        }else ret = encodeURI(JSON.stringify(care))
        if(req.query.csymappredirect){
            let  url_parts = url.parse(req.query.csymappredirect, true);
            let query = url_parts.query;
            let redirectpath=req.query.csymappredirect
            if(!(Object.keys(query).length))redirectpath += '?'
            else redirectpath += '&'
            redirectpath += `status=${ret}`
            res.redirect(`${redirectpath}`)
        }else{
            if(err)throw err
            res.json(care)
        }
       
    }




}

module.exports = new Activation();