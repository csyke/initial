'use strict'
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Rider = sequelize.define('Rider', {
		uid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV1,
			primaryKey: true
		},
		PhoneNumber: {
			type: DataTypes.STRING, 
			allowNull: false,
            validate: {
            	 len: {
                    args: [3, 32],
                    msg: 'Please give us a correct name'
                }
            }
        },
		latitude:{
			type: DataTypes.DOUBLE, 
			allowNull: false,
		},
		longitude:{
			type: DataTypes.DOUBLE, 
			allowNull: false,
		}

	},
	{
		hooks: {
		}

	})


	// Rider.associate = function (models) {
	//     Rider.hasMany(models.GithubProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	//     });
	    
	//     Rider.hasMany(models.FacebookProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	//     });

	//     Rider.hasMany(models.GoogleProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	// 	});
		
	//     Rider.hasMany(models.TwitterProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	// 	});
		
	// 	Rider.hasMany(models.LinkedinProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	//     });

	// 	Rider.hasMany(models.EmailProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	// 	});
		
		
	// 	Rider.hasMany(models.TelephoneProfile, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	// 	});

	//     Rider.hasMany(models.FamilyMember, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: false
	// 		}
	// 	});
		
	// 	Rider.hasMany(models.LoginAttempt, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: true
	// 		}
    //     });
        
    //     Rider.belongsTo(models.Family, {
	//     	onDelete: "CASCADE",
	//     	onUpdate: "CASCADE",
	// 		foreignKey: {
	// 			allowNull: true
	// 		}
	//     });

    // }
    
    Rider.associate = function (models) {
	    Rider.hasMany(models.Device, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

    }


	return Rider;
}
