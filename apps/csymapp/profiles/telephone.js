'use strict'
const to = require('await-to-js').to,
	passport = require('passport'),
	path = require("path"),
	csystem = require(__dirname + "/../../csystem").csystem,
	csymapp = require(path.join(__dirname, "/../../../src/csymapp/csymapp")),
	{
		sequelize
	} = require(__dirname + "/../../csystem").models
	// ,Familyfe = require(__dirname+'/../../../modules/node-familyfe')(sequelize)
	,
	config = require(__dirname + '/../../../config/config.system')
	// , { Entropy, charset8 } = require('entropy-string')
	// , entropy = new Entropy({ total: 1e6, risk: 1e9 })
	,
	Person = require(path.join(__dirname, '/../../../src/csymapp/Person'))(sequelize),
	TelephoneProfile = require(path.join(__dirname, '/../../../src/csymapp/Profiles/Telephone'))(sequelize)

	,
	moment = require('moment'),
	{
		Entropy,
		charset8
	} = require('entropy-string'),
	entropy = new Entropy({
		total: 1e6,
		risk: 1e9
	}),
	isphone = require('phone')

class Profile extends csystem {

	constructor() {
		super()
		let self = this
		self.csymapp = new csymapp(sequelize)
	}

	async PostTelephoneProfile(req, res) {
		let self = this;
		let uid = req.params.v1
		let [err, care] = []
		let isAuthorization = (req.headers.authorization) ? true : false

		let isLogged;
		let body = JSON.parse(JSON.stringify(req.body))

		body.phone = body.phone || ''
		body.pin = body.pin || ''
		// body.phone = isphone(body.phone)[0]
		;
		[err, care] = await to(self.isAuthenticated(res, req));
		[err, care] = await to(Person.beget({
			Name: "Brian Onang'o Admin",
			Gender: "Male",
			TelephoneProfiles: {
				Telephone: body.phone,
				Pin: body.pin,
				Cpin: body.cpin,
				IsActive: false,
			},
			IsActive: true,
			// Families: [3, 2, 1] // Test, World, Csystem
		}, false, "csystem", "nobody", 1));

		if (err) throw err
		let appName = req.query.app || 'some unknown application'
		let [err1, care1] = await to(TelephoneProfile.sendCode(body.phone, "Activate", appName, care[0].uid, care[0].FamilyFamilyId, "csystem", "root"));
		if (err1) throw err1;
		care = JSON.parse(JSON.stringify(care, (k,v) => (k === 'Pin')? !undefined : v))
		care = JSON.parse(JSON.stringify(care, (k,v) => (k === 'Cpin')? !undefined : v))
		return care
	}


	async PatchTelephoneProfile(req, res) {
		let self = this;
		let uid = req.params.v1
		let [err, care] = []

		await to(sequelize.models.TelephoneProfileCode.destroy({
			where: {
				createdAt: {
					lte: moment().subtract(config.get('/CodeTTL/Telephone'), 'minutes').toDate()
				}
			}
		}))

		let body = JSON.parse(JSON.stringify(req.body))

		body.phone = body.phone || ''
		body.code = body.code || ''
		body.pin = body.pin || ''

		// check if code exits in db

		;
		[err, care] = await to(sequelize.models.TelephoneProfileCode.findOne({
			where: {
				Code: body.code,
				Type: "Reset"
			},
			include: [{
				model: sequelize.models.TelephoneProfile,
				where: {
					Telephone: body.phone
				}
			}]
		}))
		if (err) throw err
		if (care === null) care = {}
		if (!(Object.keys(care).length))
			throw ({
				status: 422,
				message: {
					Phone: "You have provided an invalid phone number of reset code",
					Code: "You have provided an invalid phone number of reset code"
				}
			})

		// update pin
		;
		[err, care] = await to(sequelize.models.TelephoneProfile.update({
			IsActive: true,
			Pin: body.pin,
			Cpin: body.cpin
		}, {
			where: {
				Telephone: body.phone
			},
			individualHooks: true
		}))
		if (err) throw err;
		let [err1, care1] = await to(sequelize.models.TelephoneProfileCode.destroy({
			where: {
				Code: body.code,
			}
		}));
		if (err1) throw err1;
		care = JSON.parse(JSON.stringify(care, (k,v) => (k === 'Pin')? !undefined : v))
		care = JSON.parse(JSON.stringify(care, (k,v) => (k === 'Cpin')? !undefined : v))
		return care;

		// let appName = req.query.app || 'some unknown application'
		// ;[err, care] =  await to(TelephoneProfile.whichTelephoneProfile({Telephone: body.phone}, self.csymapp.worldAdminUid, 1, "csystem", "root"))
		// if(err) throw err
		// let puid = care.puid
		// console.log(care)

		// // body.phone = isphone(body.phone)[0]
		// ;
		// [err, care] = await to(self.isAuthenticated(res, req))
		// ;
		// [err, care] = await to(Person.beget({
		// 	Name: "Brian Onang'o Admin",
		// 	Gender: "Male",
		// 	TelephoneProfiles:{
		// 		Telephone:body.phone, 
		// 		Pin:body.pin, 
		// 		Cpin:body.cpin,
		// 		IsActive:false,
		// 		},
		// 	IsActive: true,
		// 	// Families: [3, 2, 1] // Test, World, Csystem
		// }, false, "csystem", "nobody", 1));

		// if (err) throw err
		// // let appName = req.query.app || 'some unknown application'
		// let [err1, care1] = await to(TelephoneProfile.sendCode(body.phone, "Activate", appName, care[0].uid, care[0].FamilyFamilyId, "csystem", "root"));
		// if(err1) throw err1;
		// return care
	}



	async main(req, res) {
		let self = this;
		let method = req.method;
		let [err, care] = [];;
		[err, care] = await to(self.csymapp.__contructor());

		switch (method) {
			// case 'GET':
			// 	;
			// 	[err, care] = await to(self.getTelephoneProfile(req, res));
			// 	if (err) throw err
			// 	res.json(care)
			// 	break;
			// 	break;
			// case 'PATCH':
			// 	;
			// 	[err, care] = await to(self.patchTelephoneProfile(req, res));
			// 	if (err) throw err
			// 	res.json(care)
			// 	break;

			case 'POST':
				;
				[err, care] = await to(self.PostTelephoneProfile(req, res));
				if (err) throw err
				res.json(care)
				break;

			case 'PATCH':
				;
				[err, care] = await to(self.PatchTelephoneProfile(req, res));
				if (err) throw err
				res.json(care)
				break;

				// case 'DELETE':
				// 	;
				// 	[err, care] = await to(self.deleteTelephoneProfile(req, res));
				// 	if (err) throw err
				// 	res.json(care)
				// 	break;

			default:
				res.status(422).json({
					error: {
						method: `${method} not supported`
					}
				});
		}
	}




}

module.exports = new Profile();