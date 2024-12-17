import { KnownError } from './error.js';
import { execa } from 'execa';

export const squashUnpushedCommits = async (squashMessage) => {
    try {
        if (!squashMessage) {
            throw new KnownError('No squash commit message provided.');
        }

        console.log('Squashing all unpushed commits...');
        // Reset to the last pushed commit
        await execa('git', ['reset', '--soft', '@{u}']);

        // Stage all changes
        await execa('git', ['add', '.']);

        // Create a single commit with the provided message
        await execa('git', ['commit', '-m', squashMessage]);

        console.log('All unpushed commits have been squashed into one.');
        process.exit(0);

    } catch (error) {
        console.error(`Error during squashing: ${error.message}`);
        process.exit(1);
    }
};

export const amendLastCommit = async (squashMessage) => {
    console.log(`Updating commit message to: "${squashMessage}"`);
    await execa("git", ["commit", "--amend", "-m", squashMessage]);
};
