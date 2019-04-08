const util = require('util')
const mysql = require('mysql'),
path = require('path')
const globalConfig = require(path.join(__dirname,'/../config/config.system'));
const pool = mysql.createPool({
    connectionLimit: 10,
    host: globalConfig.get(`/traccar/host`),
    user: globalConfig.get(`/traccar/user`),
    password: globalConfig.get(`/traccar/pass`),
    database: globalConfig.get(`/traccar/db`)
})


// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }

    if (connection) connection.release()

    return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool