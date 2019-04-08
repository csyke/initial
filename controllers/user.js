
const {
  promisify
} = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const _ = require('lodash');
const User = require('../models/User');
const prettyjson = require('prettyjson');


const util = require('util')
, mqtt = require('mqtt')
, axios = require('axios')
,btoa = require('btoa-lite')
const dotenv = require('dotenv');

dotenv.config();

client = mqtt.connect(process.env.BROKER, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
})


const randomBytesAsync = promisify(crypto.randomBytes),
  path = require('path'),
  {
    sequelize
  } = require(path.join(__dirname, "../apps/csystem")).models,
  mysql = require('mysql'),
  phone = require('phone'),
  to = require('await-to-js').to
  , globalConfig = require(path.join(__dirname,'/../config/config.system'));

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};


exports.postMpesaRequest = async (req, res) => {
  let fromNumber = req.body.fromNumber
  
  let basicAuth = 'Basic ' + btoa(process.env.MPESAUSER + ':' + process.env.MPESAPASS);
  // let [err, care] = await to(axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',  {}, {
  //   headers: { 'Authorization': + basicAuth }
  // }))
  let [err, care] = await to(axios({
    method:'get',
    url:'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    auth: {
        username: process.env.MPESAUSER,
        password: process.env.MPESAPASS
    }
}))
  console.log(error)
  // assumes no error
  let token = care.data.access_token
  console.log(care.data)
  console.log(token)
  ;[err, care] = await to(axios({
    method:'post',
    url:'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    headers: {Authorization: `Bearer ${token}`},
    data: {
      "BusinessShortCode":"174379",
      "Password":"MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMTkwMzI3MjAyOTMw",
      "Timestamp": "20190327202930",
      "TransactionType":"CustomerPayBillOnline",
      "Amount":"1",
      "PartyA":"254706662011",
      "PartyB": "174379",
      "PhoneNumber": "254706662011",
      "TransactionDesc": "test",
      "AccountReference":"test",
      "Remarks":"Some Remark",
      "CallBackURL":"https://forward-mpesa.cseco.co.ke/mpesa/transactions",
      "ResultURL":"https://forward-mpesa.cseco.co.ke/mpesa/transactions/",
      "QueueTimeOutURL":"https://forward-mpesa.cseco.co.ke/mpesa/transactions/"
    } 
}))
  res.redirect('/devices');
};

exports.postMpesaTransactions = async (req, res) => {
  
  console.log('-----------Received M-Pesa webhook-----------');

  // format and dump the request payload recieved from safaricom in the terminal
  const options = {
    // noColor: true
  };
  console.log(req.body)
  console.log(prettyjson.render(req.body, options));
  console.log('-----------------------');

  let message = {
          "ResponseCode": "00000000",
          "ResponseDesc": "success"
        };

  // respond to safaricom servers with a success message
  res.json(message);

};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({
    gmail_remove_dots: false
  });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', {
        msg: 'Success! You are logged in.'
      });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /signup
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
exports.postSignup = async (req, res, next) => {
  let rephone = /\+2547[01249]{1}/
  let matchphone = rephone.exec(req.body.tel);
  if (!req.body.type || req.body.type === 0 || req.body.type === '0') {
    req.flash('errors', [{
        location: 'body',
        param: 'type',
        msg: 'Please choose account type.',
        value: '0'
      }]

    );
    return res.redirect('/signup');
  }
  console.log(req.body)
  if (!req.body.location || req.body.location === '') {
    req.flash('errors', [{
        location: 'body',
        param: 'location',
        msg: 'Please select your location.',
        value: '0'
      }]

    );
    return res.redirect('/signup');
  }

  if (!(phone(req.body.tel).length)) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'Please enter a valid phone number.',
        value: '0'
      }]

    );
    return res.redirect('/signup');
  }

  if (!matchphone || !(matchphone.length)) {
    req.flash('errors', [{
      location: 'body',
      param: 'plate',
      msg: 'Phone number must be a safaricom number.',
      value: '0'
    }]);
    return res.redirect('/signup');
  }


  //req.flash('errors', errors);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({
    gmail_remove_dots: false
  });

  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password,
  });

  let [err, care] = [];

  switch (req.body.type) {
    case 'Owner':
      [err, care] = await to(sequelize.models.Owner.findOne({
        where: {
          PhoneNumber: req.body.tel
        }
      }))
      if (care) {
        req.flash('errors', {
          msg: 'Owner with that phone number already exists.'
        });
        return res.redirect('/signup');
      }
      break;
    case 'Rider':
      [err, care] = await to(sequelize.models.Rider.findOne({
        where: {
          PhoneNumber: req.body.tel
        }
      }))
      if (care) {
        req.flash('errors', {
          msg: 'Rider with that phone number already exists.'
        });
        return res.redirect('/signup');
      }
      break;
  }

  User.findOne({
    email: req.body.email
  }, (err, existingUser) => {
    if (err) {
      return next(err);
    }
    if (existingUser) {
      req.flash('errors', {
        msg: 'Account with that email address already exists.'
      });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        let userid = user._id.toString()
        let phoneNumber = user.phone
        console.log(req.body)
        let [lat,long] = req.body.location.split(',')
        switch (req.body.type) {
          case 'Owner':
            sequelize.models.Owner.create({
              'uid': userid,
              'PhoneNumber': req.body.tel,
              'latitude':lat,
              'longitude':long
            })
            break;
          case 'Rider':
            sequelize.models.Rider.create({
              'uid': userid,
              'PhoneNumber': req.body.tel,
              'latitude':lat,
              'longitude':long
            })
            break;
        }


        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getDevices = async (req, res) => {
  let userid = req.user._id.toString();
  let [err, care] = await to(sequelize.models.Owner.findOne({
    where: {
      uid: userid
    }
  }))
  if (err || care === null) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'You are not allowed to access that page because you may not be registered as an owner.',
        value: '0'
      }]

    );
    return res.redirect('/');
  }

  ;
  [err, care] = await to(sequelize.models.Device.findAll({
    where: {
      OwnerUid: userid
    },
    include: [{
      model: sequelize.models.Rider,
    }]
  }))
  let devices = [];
  for (let i in care) devices.push(care[i].dataValues)
  res.render('account/devices', {
    title: 'Devices',
    devices: devices
  });
};

exports.postDeleteDevice = async (req, res) => {
  let userid = req.user._id.toString();
  let [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.params.IMEI
    },
    include: [{
      model: sequelize.models.Owner,
      where: {
        uid: userid
      }
    }]
  }))
  if (err || care === null) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'It seems that that device does not belong to you.',
        value: '0'
      }]

    );
    return res.redirect('/devices');
  }

  ;
  [err, care] = await to(sequelize.models.Device.destroy({
    where: {
      IMEI: req.params.IMEI
    },
  }))
  res.redirect('/devices');
};
exports.postStart = async (req, res) => {
  let userid = req.user._id.toString();
  let [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.params.IMEI
    },
    include: [{
      model: sequelize.models.Owner,
      where: {
        uid: userid
      }
    }]
  }))
  if (err || care === null) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'It seems that that device does not belong to you.',
        value: '0'
      }]

    );
    return res.redirect('/devices');
  }

  ;
  [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.params.IMEI
    },
  }))
  let tel = care.dataValues.PhoneNumber
  tel = tel.replace('+', '');
  let topic = `csymapp-sms/${tel}`
  console.log(topic)
  client.publish(topic, `resume123456`)
  ;
  [err, care] = await to(sequelize.models.Device.update({Status:'on'},{
    where: {
      IMEI: req.params.IMEI
    },
  }))
  res.redirect('/devices');
};
exports.postStop = async (req, res) => {
  let userid = req.user._id.toString();
  let [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.params.IMEI
    },
    include: [{
      model: sequelize.models.Owner,
      where: {
        uid: userid
      }
    }]
  }))
  if (err || care === null) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'It seems that that device does not belong to you.',
        value: '0'
      }]

    );
    return res.redirect('/devices');
  }

  ;
  [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.params.IMEI
    },
  }))
  let tel = care.dataValues.PhoneNumber
  tel = tel.replace('+', '');
  let topic = `csymapp-sms/${tel}`
  console.log(topic)
  client.publish(topic, `noquickstop123456`)
  ;
  [err, care] = await to(sequelize.models.Device.update({Status:'off'},{
    where: {
      IMEI: req.params.IMEI
    },
  }))
  res.redirect('/devices');
};




exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({
    gmail_remove_dots: false
  });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.email = req.body.email || '';
    user.profile.name = req.body.name || '';
    user.profile.gender = req.body.gender || '';
    user.profile.location = req.body.location || '';
    user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', {
            msg: 'The email address you have entered is already associated with an account.'
          });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', {
        msg: 'Profile information has been updated.'
      });
      res.redirect('/account');
    });
  });
};





// new device
exports.postNewDevice = async (req, res, next) => {
  let rephone = /\+2547[01249]{1}/
  let matchphone = rephone.exec(req.body.ridertel);

  if (!(phone(req.body.tel).length)) {
    req.flash('errors', [{
        location: 'body',
        param: 'tel',
        msg: 'Please enter a valid phone number for the device.',
        value: '0'
      }]

    );
    return res.redirect('/devices');
  }
  if (!(phone(req.body.ridertel).length)) {
    req.flash('errors', [{
      location: 'body',
      param: 'ridertel',
      msg: 'Please enter a valid phone number for the rider.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }
  // Number plate
  let re = /KM[A-Za-z]{2}[0-9]{3}[A-Za-z]{1}/
  let match = re.exec(req.body.plate);
  if (!match || !(match.length)) {
    req.flash('errors', [{
      location: 'body',
      param: 'plate',
      msg: 'Please enter a valid number plate for your motorcycle.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }

  // we will have to check this from a different place....
  if (!(phone(req.body.ridertel).length)) {
    req.flash('errors', [{
      location: 'body',
      param: 'ridertel',
      msg: 'Please enter a valid phone number for the rider.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }

  if (!matchphone || !(matchphone.length)) {
    req.flash('errors', [{
      location: 'body',
      param: 'plate',
      msg: 'Rider number has to be a safaricom number.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }

  let [err, care] = await to(sequelize.models.Rider.findOne({
    where: {
      PhoneNumber: req.body.ridertel
    }
  }))
  if (err || care === null) {
    req.flash('errors', [{
      location: 'body',
      param: 'ridertel',
      msg: 'Rider is not registered. Please register rider first.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }

  let riderid = care.dataValues.uid

  ;
  [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      PhoneNumber: req.body.tel
    }
  }))
  if (care) {
    req.flash('errors', [{
      location: 'body',
      param: 'tel',
      msg: 'A device is already registered with that phone number.',
      value: '0'
    }]);
    return res.redirect('/devices');
  };
  [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      IMEI: req.body.IMEI
    }
  }))
  if (care) {
    req.flash('errors', [{
      location: 'body',
      param: 'IMEI',
      msg: 'A device is already registered with that IMEI.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }
   
let pool = require('./database')
; [err, care] = await to(pool.query(`SELECT 1 IMEI from tc_devices where uniqueid=${req.body.IMEI}`)) 
if(err)throw err
if(!(care.length)) {
  req.flash('errors', [{
    location: 'body',
    param: 'IMEI',
    msg: 'Please register device in traccar first.',
    value: '0'
  }]);
  return res.redirect('/devices');
}

  // connection.connect();

  // connection.query(`SELECT 1 IMEI from tc_devices where uniqueid=${req.body.IMEI}`, function (error, results, fields) {
  //   if (error) {
  //     console.log(error)
  //     throw error;
  //   }
  //   // `results` is an array with one element for every statement in the query:
  //   console.log(results[0]); // [{1: 1}]
  //   console.log(results[1]); // [{2: 2}]
  // });

  ;
  [err, care] = await to(sequelize.models.Device.findOne({
    where: {
      Plate: req.body.plate
    }
  }))
  if (care) {
    req.flash('errors', [{
      location: 'body',
      param: 'IMEI',
      msg: 'A device is already registered with that number plate.',
      value: '0'
    }]);
    return res.redirect('/devices');
  };
  [err, care] = await to(sequelize.models.Device.findOne({

    // where: 'cow',
    include: [{
      model: sequelize.models.Rider,
      where: {
        PhoneNumber: req.body.ridertel
      }
    }]

  }))

  if (care) {
    req.flash('errors', [{
      location: 'body',
      param: 'ridertel',
      msg: 'That rider is already working for someone else.',
      value: '0'
    }]);
    return res.redirect('/devices');
  }

  let userid = req.user._id.toString();;
  [err, care] = await to(sequelize.models.Device.create({
    IMEI: req.body.IMEI,
    PhoneNumber: req.body.tel,
    RiderUid: riderid,
    OwnerUid: userid,
    Plate: req.body.plate
  }))
  // return
  //+254706662011
  // check if the rider is registered...

  req.flash('success', {
    msg: 'Device registered.'
  });
  res.redirect('/devices');
  // User.findById(req.user.id, (err, user) => {
  //   if (err) { return next(err); }
  //   user.email = req.body.email || '';
  //   user.profile.name = req.body.name || '';
  //   user.profile.gender = req.body.gender || '';
  //   user.profile.location = req.body.location || '';
  //   user.profile.website = req.body.website || '';
  //   user.save((err) => {
  //     if (err) {
  //       if (err.code === 11000) {
  //         req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
  //         return res.redirect('/account');
  //       }
  //       return next(err);
  //     }
  //     req.flash('success', { msg: 'Profile information has been updated.' });
  //     res.redirect('/account');
  //   });
  // });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', {
        msg: 'Password has been changed.'
      });
      res.redirect('/account');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  let userid = req.user._id.toString();
  User.deleteOne({
    _id: req.user.id
  }, (err) => {
    if (err) {
      return next(err);
    }
    
     sequelize.models.Owner.destroy({
      where: {uid: userid}
    })
     sequelize.models.Rider.destroy({
      where: {uid: userid}
    })
    req.logout();
    req.flash('info', {
      msg: 'Your account has been deleted.'
    });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const {
    provider
  } = req.params;
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user[provider.toLowerCase()] = undefined;
    const tokensWithoutProviderToUnlink = user.tokens.filter(token =>
      token.kind !== provider.toLowerCase());
    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
      !(user.email && user.password) &&
      tokensWithoutProviderToUnlink.length === 0
    ) {
      req.flash('errors', {
        msg: `The ${_.startCase(_.toLower(provider))} account cannot be unlinked without another form of login enabled.` +
          ' Please link another account or add an email address and password.'
      });
      return res.redirect('/account');
    }
    user.tokens = tokensWithoutProviderToUnlink;
    user.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash('info', {
        msg: `${_.startCase(_.toLower(provider))} account has been unlinked.`
      });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({
      passwordResetToken: req.params.token
    })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', {
          msg: 'Password reset token is invalid or has expired.'
        });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User
    .findOne({
      passwordResetToken: req.params.token
    })
    .where('passwordResetExpires').gt(Date.now())
    .then((user) => {
      if (!user) {
        req.flash('errors', {
          msg: 'Password reset token is invalid or has expired.'
        });
        return res.redirect('back');
      }
      user.password = req.body.password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      return user.save().then(() => new Promise((resolve, reject) => {
        req.logIn(user, (err) => {
          if (err) {
            return reject(err);
          }
          resolve(user);
        });
      }));
    });

  const sendResetPasswordEmail = (user) => {
    if (!user) {
      return;
    }
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Your Hackathon Starter password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', {
          msg: 'Success! Your password has been changed.'
        });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('success', {
                msg: 'Success! Your password has been changed.'
              });
            });
        }
        console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
        req.flash('warning', {
          msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.'
        });
        return err;
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => {
      if (!res.finished) res.redirect('/');
    })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({
    gmail_remove_dots: false
  });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
    .findOne({
      email: req.body.email
    })
    .then((user) => {
      if (!user) {
        req.flash('errors', {
          msg: 'Account with that email address does not exist.'
        });
      } else {
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user = user.save();
      }
      return user;
    });

  const sendForgotPasswordEmail = (user) => {
    if (!user) {
      return;
    }
    const token = user.passwordResetToken;
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Reset your password on Hackathon Starter',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', {
          msg: `An e-mail has been sent to ${user.email} with further instructions.`
        });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('info', {
                msg: `An e-mail has been sent to ${user.email} with further instructions.`
              });
            });
        }
        console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
        req.flash('errors', {
          msg: 'Error sending the password reset message. Please try again shortly.'
        });
        return err;
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};