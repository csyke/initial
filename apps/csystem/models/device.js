'use strict'
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Device = sequelize.define('Device', {
		IMEI: {
			type: DataTypes.STRING(32),
			primaryKey: true
		},
		Plate: {
			type: DataTypes.STRING(8),
			primaryKey: true
		},
		Status: {
			type:   DataTypes.ENUM,
    	values: ['on', 'off'],
			allowNull: false,
			defaultValue: 'on'
		},
		PhoneNumber: {
			type: DataTypes.STRING(32), 
			allowNull: false,
            validate: {
            	 len: {
                    args: [3, 32],
                    msg: 'Please give us a correct name'
                }
            }
        }
	},
	{
		hooks: {
		}

    })
    
    Device.associate = function (models) {
	    Device.belongsTo(models.Rider, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    Device.belongsTo(models.Owner, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

	}



	return Device;
}
