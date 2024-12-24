import { KnownError } from './error.js';
import { execa } from 'execa';
import fs from 'fs';

export const swapMessage = async (suggestedAiMessages, commitMsgFile) => {
    try {
        // Check if the AI-suggested messages are provided
        if (!suggestedAiMessages) {
            throw new KnownError('No suggested AI commit message provided.');
        }

        // Check if the commit message file path is provided
        if (!commitMsgFile) {
            throw new KnownError('No commit message file path provided.');
        }

        // Log the original commit message (optional)
        const originalCommitMessage = fs.readFileSync(commitMsgFile, 'utf8');
        console.log(`Original Commit Message:\n${originalCommitMessage}`);

        // Write the updated message back to the commit message file
        fs.writeFileSync(commitMsgFile, suggestedAiMessages, 'utf8');
        console.log(`Updated Commit Message:\n${suggestedAiMessages}`);

        // Exit successfully
        process.exit(0);

    } catch (error) {
        // Log the error and exit with a non-zero status code
        console.error(`Error during Swapping: ${error.message}`);
        process.exit(1);
    }
};
