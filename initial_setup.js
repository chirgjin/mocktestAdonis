// const args = ["node", "ace"];
const { execFileSync } = require("child_process");


process.env.ENV_SILENT = 'true';
process.env.APP_KEY = '123456'; //dummy app secret
// process.env.DB_USER = "root";
// process.env.DB_NAME = "mocktest";

let argv = (['ace', 'env:generate', process.env.DB_USER, process.env.DB_NAME, process.env.DB_PASS||"",  process.env.HOST||"", "--store"]);
    
// execSync(argv.join(" "));
execFileSync("node", argv);

delete process.env.ENV_SILENT;
delete process.env.APP_KEY;

argv = ['ace', 'migration:run', '-f', '--seed'];

execFileSync("node", argv, {
    env : process.env,
    stdio : "inherit"
});

console.info("Migrations run & Seeded the db");