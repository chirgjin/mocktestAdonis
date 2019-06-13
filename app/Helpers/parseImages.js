const cheerio = require("cheerio");

module.exports = function parseImages(html, images) {
    const $ = cheerio.load(html);

    $("img").each((i, el) => {
        const img = $(el);

        const index = img.data("index");
        if(images[index]) {
            img.removeAttr("data-index");

            img.prop("src", images[index]);
        }
    });

    return $.html();
}