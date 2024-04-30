import * as path from 'path';
import Mocha from 'mocha';
import { promisify } from 'util';
import glob from 'glob';
import { runTests } from 'vscode-test';

const globPromise = promisify(glob);

async function main() {
    try {
        // Create the Mocha test instance with TDD UI and colored output
        const mocha = new Mocha({
            ui: 'tdd',
            color: true
        });

        const testsRoot = path.resolve(__dirname, '.');

        // Find all test files (*.test.js)
        try {
            const files = await globPromise('**/*.test.js', { cwd: testsRoot });

            // Add files to the Mocha instance
            files.forEach(file => mocha.addFile(path.resolve(testsRoot, file)));

            // Run the Mocha tests
            const failures = await new Promise((resolve, reject) => {
                mocha.run(failures => {
                    if (failures > 0) {
                        reject(new Error(`${failures} tests failed.`));
                    } else {
                        resolve(failures);
                    }
                });
            });

            // Successful test execution
            console.log('All tests passed!');
        } catch (err) {
            // Handle errors during Mocha execution
            console.error('Error running tests:', err);
            process.exit(1);
        }
    } catch (err) {
        // Handle errors during setup
        console.error('Error during test setup:', err);
        process.exit(1);
    }
}

main();