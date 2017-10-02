const prod = require('./prod');
const dev = require('./dev');

if(process.env.NODE_ENV === 'production'){
    module.exports ={
        mongoURI: prod.mongoURI
    } 
} else {
    module.exports = {
        mongoURI: dev.mongoURI
    }
}
