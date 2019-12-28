const cheerio = require("cheerio");
const Config = use("Config")
module.exports = function parseImages(html, images) {
    if(Config.get('app.inlineImages', true)) {
        return html
    }

    const $ = cheerio.load(html);

    $("img").each((i, el) => {
        const img = $(el);

        const index = img.data("index");
        if(images[index]) {
            img.removeAttr("data-index");

            img.prop("src", images[index]);
        }
    });

    return $("body").html()
}