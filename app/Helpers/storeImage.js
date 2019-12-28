const uuidv4 = require('uuid/v4');
const Drive = use('Drive');
const Image = use('App/Models/Image');
const Config = use("Config");
const MissingValueException = use("App/Exceptions/MissingValueException");
module.exports = async function ({image, type, reference_id, name, transaction}) {
    
    if(Config.get('app.inlineImages', true)) {
        return {image, type, reference_id, name, transaction, url : ''};
    }

    if(!name) {
        name = uuidv4();
    }
    else if(!type) {
        throw new MissingValueException('type');
    }

    const finalname = name + ".png";

    if(await Drive.exists(finalname)) {
        throw new Error("File already exists");
    }

    await Drive.put(finalname, image);

    return await Image.create({
        type : type,
        file_path : finalname,
        reference_id: reference_id || null,
    }, transaction);
};