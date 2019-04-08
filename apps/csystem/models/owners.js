'use strict'
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Owner = sequelize.define('Owner', {
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
    

    Owner.associate = function (models) {
	    Owner.hasOne(models.Device, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

    }




	return Owner;
}
