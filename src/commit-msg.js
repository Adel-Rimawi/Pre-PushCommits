import { getStaged } from './utils/git.js';
import { generatePrompt } from './utils/prompt.js';
import { generateCommitMessage } from './utils/openai.js';
import { swapMessage } from './utils/operations.js';
import * as fs from 'fs';

import 'dotenv/config';

const main = async () => {
    try {
        console.log('\n\nWelcome to the AI-powered commit message generator!');

        const { files, diff } = await getStaged();

        if (!diff) {
            console.log('No changes or commit messages to process.');
            return;
        }

        const commitMsgFile = process.argv[2];

        let commitMessage;
        try {
            commitMessage = fs.readFileSync(commitMsgFile, 'utf8');
            console.log("\nCommit Message:\n", commitMessage);
        } catch (error) {
            console.error("Error reading commit message file:", error.message);
            process.exit(1);
        }

        const maxLength = parseInt(process.env.MAX_LENGTH, 10) || 50;
        const type = 'conventional';
        const prompt = generatePrompt(type, files, diff, commitMsgFile);

        console.log('Prompt generated. Fetching AI-generated squash commit message...');
        const model = process.env.MODEL || 'gpt-4o-mini';
        const suggestions = await generateCommitMessage(model, prompt, maxLength);

        if (!suggestions || suggestions.length === 0) {
            console.log('No valid commit message suggestions generated.');
            return;
        }

        const suggestedMessage = suggestions[0]; // Take the first suggestion as the squash message
        console.log('Generated squash commit message:', suggestedMessage);

        console.log('Applying AI-generated squash commit message...');
        await swapMessage(suggestedMessage, commitMsgFile);

        console.log('Commit message updated successfully.');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

main();
