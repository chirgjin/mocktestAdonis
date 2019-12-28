'use strict';

// eslint-disable-next-line no-undef
const { Command } = require('@adonisjs/ace');
// eslint-disable-next-line no-undef
const Database = use('Database');
const WordParser = use('App/Helpers/WordParser');
const fs = require("fs");

class ParseWordZip extends Command {
    static get signature () {
        return `
        parse:wordzip
        { file : Location to zip file }
        { out? : Output json file location, outputs to stdout if not provided }
        { --pretty : Prints pretty output json if provided }
        `;
    }
    
    static get description () {
        return 'Parses a Word Zipped file and stores the output json data to file';
    }
    
    /**
     * 
     * @param {Object} args Arguments from cmd line
     * @param {String} args.file Zip file location
     * @param {String} [args.out] Output location
     * @param {*} options 
     */
    async handle (args, options) {
        
        const parser = new WordParser();

        const exists = await this.pathExists(args.file);

        if(!exists) {
            this.error(`File ${args.file} does not exist`);
            
            return Database.close();
        }

        try {
            await parser.extractZip(args.file);

            const data = await parser.parse();
            
            await parser.cleanup();
            // data.logs = parser.logs
            if(args.out) {
                this.completed("parse", "Successfully parsed the document and stored in " + args.out);
                fs.writeFileSync(args.out, JSON.stringify(data, null, options.pretty ? 4 : 0));
            }
            else {
                this.info( JSON.stringify(data, null, options.pretty ? 4 : 0) );
            }
            
        }
        catch (e) {

            this.error(e.stack);
            this.failed('parse', 'Could not parse the document');
        }
        
        Database.close();
    }
}

module.exports = ParseWordZip;
