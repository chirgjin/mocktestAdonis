MAX_TIME = 60; //max time is 60 secs
module.exports = function (time) {
    time = Math.round( (new Date(time)).getTime()/ 1000 ) //in case it already isn't instance of date/ time in ms convert it to date then get time

    return Math.min(
        MAX_TIME,
        Math.max(
            0,
            Math.floor(Date.now()/1000) - time
        )
    )
}