const redis = require("redis");
const client = redis.createClient(process.env.REDIS_URL);
//redis://localhost:6379

client.on("error", function(error) {
    console.log(error);
});

const setJWT = (key, value)=> {    
    try {
        return new Promise((resolve, reject)=> {
            client.set(key, value, (err, res) => {
                if(err) reject(err);
                resolve(res);
            });
        });
    } catch (error) {
        reject(error);
    }
};

const getJWT = (key) => {
    try {
        return new Promise((resolve, reject) => {
            client.get(key, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    } catch (error) {
        reject(error);
    }
};

module.exports = {
    setJWT,
    getJWT,
};