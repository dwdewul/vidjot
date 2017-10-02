if(process.env.NODE_ENV === 'production'){
    const prod = require('./prod');
    module.exports ={
        mongoURI: prod.mongoURI
    } 
} else {
    const dev = require('./dev');
    module.exports = {
        mongoURI: dev.mongoURI
    }
}
