'use strict'
const validator = require('validator')

module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define('Payment', {
		TransactionID: {
			type: DataTypes.STRING(32),
			primaryKey: true
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
        },
		Amount: {
			type: DataTypes.INTEGER, 
			allowNull: false,
        },
	},
	{
		hooks: {
		}

    })
    
    Payment.associate = function (models) {
	    Payment.belongsTo(models.Rider, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });
	    Payment.belongsTo(models.Owner, {
	    	onDelete: "CASCADE",
	    	onUpdate: "CASCADE",
			foreignKey: {
				allowNull: false
			}
	    });

	}



	return Payment;
}
