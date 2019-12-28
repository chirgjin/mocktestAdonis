const unzip = require('unzip');
const fs = require("fs");
const path = require("path");
const uuid = require("uuid/v4");
const mkdirp = require("mkdirp").sync;
const cheerio = require('cheerio');

const entities = new require('html-entities').AllHtmlEntities;
const _ = require("lodash");

const Helpers = use("Helpers");

const {Difficulty, Question} = use("App/Models");
const { FieldException, MissingValueException } = use("App/Exceptions");

const rimraf = require("rimraf");
const Config = use('Config');


class WordParser {

    /**
     * Create a new parser instance
     * @param {Object} [options]
     * @param {String} options.tempFolder location of temp folder
     * @param {Function|String} options.tempGenerator function which returns temp loc [Overrides options.tempFolder if provided]
     * @param {String|Stream} options.zip Zip location / opened readable stream
     * @param {Array} options.tags List of tags to convert into bbcode
     */
    constructor(options={}) {
        this.images = [];

        this.logs = [];

        this.setOptions(options);
    }

    log(fn, ...data) {
        this.logs.push({
            fn,
            data
        });
    }
    /**
     * 
     * @param {Object} options parser options
     * @param {String} options.tempFolder location of temp folder
     * @param {Function} options.tempGenerator function which returns temp loc
     * @param {String|Stream} options.zip Zip location / opened readable stream
     * @param {Array} options.tags List of tags to convert into bbcode
     * @returns {HtmlParser}
     */
    setOptions(options={}) {
        let keys = ['tempFolder','tempGenerator','zip', 'tags', 'inlineImages'];

        for(let i=0;i<keys.length;i++) {
            let key = keys[i];
            this[key] = options.hasOwnProperty(key) ? options[key] : (this.hasOwnProperty(key) ? this[key] : this.defaults[key]);
        }

        return this;
    }


    get defaults() {
        return {
            tempFolder : Helpers.tmpPath(),
            tempGenerator : parser => path.join(parser.tempFolder,uuid()),
            tags : [ 'img', 'sup', 'sub', 'b', 'i', 'strong', 'em', 'u', 'strike' ],
            inlineImages : Config.get('app.inlineImages', true),
        };
    }

    

    get tempLoc() { 
        if(this.hasOwnProperty('_temp')) {
            return this._temp;
        }
        
        return (this._temp = typeof this.tempGenerator == 'function' ? this.tempGenerator(this) : this.tempGenerator.toString());
    }
    
    /**
     * Fix the line breaks in html
     * @param {String} html Html to fix
     * 
     * @returns {String} Fixed HTML
     */
    fixLineBreaks(html) {
        var breakToken = '__break__';
        var lineBreakedHtml = html.replace(/<br\s?\/?>/gi, breakToken).replace(/<p\.?>(.?)<\/p>/gi, breakToken + '$1' + breakToken);
        return this.$('<div>').html(lineBreakedHtml).text().replace(new RegExp(breakToken, 'g'), '\n').replace(/([^\n])\n([^\n])/g,"$1 $2").replace(/\n\n/g,"\n");
    }

    /**
     * Store given image in list of images
     * @param {String} src Source/loc of image
     * @returns {String} Path to image
     */
    getImageIndex(src) {

        return this.images.push({
            src,
            type : null
        }) - 1;
    }

    updateImageType(val) {

        if(this.inlineImages) {
            return ;
        }

        this.images = this.images.map(img => {
            img.type = img.type || val;
            return img;
        });
    }

    getBase64(src) {

        return fs.readFileSync(
            path.join(this.tempLoc, src),
            { encoding: 'base64' }
        ).toString();
        
    }

    get lastProp() {
        return this._lastProp;
    }

    set lastProp(val) {
        
        this._lastProp = val;

        this.updateImageType(val);
    }

    /**
     * Generate text for a given element
     * 
     * @param {CheerioElement} el Element to get text of
     * 
     * @returns {String} Text of element
     */
    generateText(el) {
        const $ = this.$;

        el = $(el);
        let tag;

        if(el.get(0) && el.get(0).tagName && (tag = el.get(0).tagName.toLowerCase()) && this.tags.indexOf(tag) > -1) {
            return tag == 'img' ? `<img ${!this.inlineImages ? `data-index=${this.getImageIndex(el.attr('src'))}` : `src="data:image/png;base64,${this.getBase64(el.attr('src'))}"`} />` : `<${tag}>${el.text()}</${tag}>`;
        }
        else if(el.has( this.tags.join(",") ).length > 0) {
    
            let txt = '';
    
            el.contents().each((i,child) => {
                
                txt += this.generateText(child);
            });
    
            return txt;
        }
        else {
            const txt = el.html() ? this.fixLineBreaks(el.html()) : el.text();
            
            if(!txt || txt.trim() == '') {
                return '';
            }
            
            return entities.encode(txt);
        }
    }

    

    /**
     * Extract zip file
     */
    extractZip(zip=this.zip) {
        
        return new Promise( (resolve,reject) => {
            let filename;
            
            this.zip = zip;

            (typeof this.zip == 'string' ? fs.createReadStream(this.zip) : this.zip)
                .pipe(unzip.Parse())
                .on("entry", (entry) => {
                    let name = entry.path;
    
                    if(entry.type == 'File' && name.match(/\.html?$/)) {
                        filename = path.join(this.tempLoc, name);
                    }
    
                    if(entry.type == 'Directory') {
                        mkdirp(path.join(this.tempLoc, name));
                    }
                    else if(entry.type == 'File' && !fs.existsSync(path.join(this.tempLoc, path.dirname(name)))) {
                        mkdirp(path.join(this.tempLoc, path.dirname(name)));
                    }
    
                    if(entry.type == 'File') {
                        entry.pipe(
                            fs.createWriteStream( path.join(this.tempLoc, name) )
                        );
                    }
                })
                .on("close", () => {
                    this.htmlfile = filename;
                    resolve(filename);
                })
                .on("error", err => {
                    reject(err);
                });
        });
    }

    /**
     * Create new directory
     * @param {String} dir directory to create
     */
    mkdir(dir) {
        mkdirp(dir);
    }


    /**
     * Creates a data node
     * @param {String} type
     * @param {String} prop
     * @param {String} text 
     * 
     * @returns {Object}
     */
    createDataNode(type, prop, text) {
        const data = {
            [prop] : text
        };

        if(type == 'question') {
            data.options = [];

            if(this.lastDirection) {
                data.direction = this.lastDirection - 1;
            }
            
        }
        else if(type == 'direction') {
            this.lastDirection = (parseInt(this.lastDirection) || 0) + 1;
            data.index = this.lastDirection - 1;
        }

        return {
            type : type,
            data : data
        };
    }

    /**
     * Create new Regexp Node
     * @param {RegExp} regexp 
     * @param {String} type 
     * @param {String} prop 
     * 
     * @returns {Object} Regexp node
     */
    regex(regexp, type, prop, marksStarting=0) {
        return {
            regexp : regexp,
            type : type,
            prop : prop,
            marksStarting :  marksStarting
        };
    }

    parse() {
        if(!this.htmlfile) {
            throw new Error(".html file not found");
        }

        const regexps = [
            this.regex(/^direction\s*:/i, 'direction', 'description', true),
            this.regex(/^passage\s*:/i, 'direction', 'description', true),

            this.regex(/^question\s*(\d{1,4})?:/i, 'question', 'description', true),
            // this.regex(/^questiondirection\s*:/i, 'question', 'direction'),
            // this.regex(/^passagenumber\s*:/i, 'question', 'direction'),
            this.regex(/^type\s*:/i, 'question', 'type'),
            this.regex(/^option(#|\s)?\d+\s*:/i, 'question', 'options'),
            this.regex(/^option\s*:/i, 'question', 'options'),
            this.regex(/^difficulty\s*:/i, 'question', 'difficulty'),
            this.regex(/^(average\s*time|avg(_|\s)time)\s*:/i, 'question', 'avg_time'),
            this.regex(/^answer\s*:/i, 'question', 'answer'),
            this.regex(/^solution\s*:/i, 'question', 'solution.text'),
        ];

        const html = fs.readFileSync(this.htmlfile,{ encoding: "utf8"});
        
        const $ = this.$ = cheerio.load(html);

        const data = [];
        let p = $("body p");
        let lastStr = '';
        let lastProp = null;
        let lastData = null;

        p.each((i,el) => {

            let text = this.generateText(el);

            let pLast = lastProp;
            let assigned = 0;

            if(!text || text.trim() == '') {
                return ;
            }

            regexps.forEach(node => {

                if(!node.marksStarting && (!pLast || node.type != pLast.type)) {
                    return ;
                }

                if(text.match(node.regexp)) {

                    lastProp = node;
                    assigned = 1;
                    text = text.replace(node.regexp, '');
                }
            });

            if(!assigned && lastData) {
                lastStr += "\n" + text;
                this.updateImageType(this.lastProp);
            }
            else {

                if(!lastData) {
                    lastData = this.createDataNode(lastProp.type, lastProp.prop, '');
                    data.push(lastData);
                    
                    this.lastProp = lastProp.type;
                }
                else {
                    const a = _.at(lastData.data, pLast.prop)[0];
                    
                    const prop = a && a.push ? `${pLast.prop}[${a.length}]` : pLast.prop;
                    _.set(lastData.data, prop, lastStr.trim().replace(/\n/g, "<br>"));
                    if(lastProp.prop.match(/option|solution/)) {
                        
                        this.lastProp = lastProp.prop.match(/option|solution/)[0];
                    }

                    if(lastProp.marksStarting) {
                        lastData = this.createDataNode(lastProp.type, lastProp.prop, '');
                        data.push(lastData);
                        
                        this.lastProp = lastProp.type;
                    }
                }
                
                lastStr = text;
                
            }

        });

        if(lastStr.length > 0 && lastData) {
            const a = _.at(lastData.data, lastProp.prop)[0];
            const prop = a && a.push ? `${lastProp.prop}[${a.length}]` : lastProp.prop;
            _.set(lastData.data, prop, lastStr.trim().replace(/\n/g, "<br>"));
        }

        return this.parseGeneratedData(data);
    }

    parseQuestion(node, proms) {
        
        const q = Object.assign({}, node.data);

        if(Question.QUESTION_TYPES[ _.toUpper(node.data.type).trim() ]) {
            q.type = Question.QUESTION_TYPES[ _.toUpper(node.data.type).trim() ];
        }

        q.answer = parseInt( _.toString( q.answer ).trim() );
        if(!node.data.difficulty) {
            throw new MissingValueException("difficulty");
        }
        else if(!q.type) {
            throw new MissingValueException("type");
        }
        else if(isNaN(q.answer)) {
            throw new FieldException('answer', `Question[${q.description}] must have an integer answer`);
        }
        
        q.avg_time = parseFloat(q.avg_time);

        if(isNaN(q.avg_time)) {
            delete q.avg_time;
        }


        proms.push(
            Difficulty
                .find( _.toString(node.data.difficulty).trim() )
                .then(diff => {

                    if(!diff) {
                        throw new Error(`Difficulty provided for Question[${q.description}] doesn't exist`);
                    }

                // q.difficulty = diff.name;
                })
        );

        q.options = [];
        node.data.options.forEach( (option,i) => {
            q.options.push({
                description : option,
                number : i
            });
        });

        if(q.type == 1 && !q.options[q.answer-1]) {
            throw new Error(`Option#${q.answer} not found for Question:${q.description}`);
        }
        
        if(q.type == 1) {
            q.answer = q.answer - 1;
        }
        
        if(q.type == 1 && q.options.length < 1) {
            throw new FieldException("options", "Question must have at least 1 option");
        }
        else if(q.type != 1 && q.type != 2) {
            throw new FieldException("type", "Question Type must be either MCQ or ORDER");
        }
        
        if(node.data.solution && node.data.solution.text) {
            q.solution = node.data.solution.text;
        }

        // if(node.data.direction) {
        //     //handle question direction

        //     new Promise(resolve => {

        //         q.direction = this.directions[ node.data.direction ];

        //         resolve();
        //     });

        // }

        return q;
    }

    parseDirection(node) {
        // const direction = new QuestionDirection(node.data);
        const direction = node.data.description;

        return direction;
    }
    
    parseGeneratedData(data) {

        return new Promise( (resolve,reject) => {

            const proms = [];

            this.questions = [];
            this.directions = [];

            data.forEach(node => {
                if(node.type == 'question') {
                    const q = this.parseQuestion(node, proms);

                    this.questions.push(q);
                }
                else if(node.type == 'direction') {
                    this.directions[ node.data.index ] = this.parseDirection(node, proms);
                }
            });

            return Promise.all(proms).then(() => {

                resolve({
                    questions : this.questions,
                    directions : this.directions,
                    images : this.inlineImages ? [] : this.images.map(({src,type}) => {
                        return {
                            base64 : this.getBase64(src),
                            type
                        };
                    })
                });

            }).catch(err => {
                reject(err);
            });

        });
    }


    cleanup() {

        return new Promise((resolve, reject) => {
            
            if(!this._temp) {
                resolve();
            }
            else {
                rimraf(this.tempLoc, err => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
        });
    }
}

module.exports = WordParser;