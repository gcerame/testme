const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class Runner {
    constructor() {
        this.testFiles = [];
    }

    async runTests() {
        for (let file of this.testFiles) {
            console.log(chalk.gray(`--- ${file.shortName}`));
            const beforEaches = [];
            global.beforeEach = (fn) => {
                beforEaches.push(fn);
            };
            global.it = (desc, fn) => {
                beforEaches.forEach(func => func());
                try {
                    fn();
                    console.log(chalk.green(`\tOK - ${desc}`));
                } catch (err) {
                    const message = err.message.replace(/\n/g,'\n\t\t');
                    console.log(chalk.red(`\tX - ${desc}`));
                    console.log(chalk.red('\t' ,message));
                }
            };
            try {
                require(file.name);
            } catch (err) {
                console.log(chalk.red(err));
            }
        }
    }

    async collectFiles(targetPath) {
        const files = await fs.promises.readdir(targetPath);

        for (let file of files) {
            const filePath = path.join(targetPath, file);
            const stats = await fs.promises.lstat(filePath);

            if (stats.isFile() && file.includes('.test.js')) {
                this.testFiles.push({name: filePath, shortName: file});
            } else if (stats.isDirectory()) {
                const childFiles = await fs.promises.readdir(filePath);
                files.push(...childFiles.map(f => path.join(file, f)));
            }
        }
    }
}

module.exports = Runner;