const storeImage = require("./storeImage");

module.exports = async function (images, transaction) {

    const results = [];

    for(let i=0;i<images.length;i++) {
        const img = images[i];

        if(transaction) {
            img.transaction = transaction;
        }

        results.push(await storeImage(img));
    }

    return results;

};