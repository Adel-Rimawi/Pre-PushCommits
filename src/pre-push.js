import { getDiffBetweenBranches, getCommitMessagesAndCount } from './utils/git.js';
import { generatePrompt } from './utils/prompt.js';
import { generateCommitMessage } from './utils/openai.js';
import { KnownError } from './utils/error.js';
import { squashUnpushedCommits, amendLastCommit } from './utils/operations.js';
import { getRemoteBranch } from './utils/git.js';

import readline from "readline";

import 'dotenv/config';


// Helper function to get user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askUser = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim().toLowerCase());
        });
    });
};

const main = async () => {
    try {
        console.log('Fetching changes...');
        const diffData = await getDiffBetweenBranches();
        const {commitMessages,messagesCount } = await getCommitMessagesAndCount();
        if (messagesCount=== 0){
        throw new KnownError(`There's Nothing To  Commit`);
        }

        if (!diffData || !commitMessages || messagesCount === 0) {
            console.log('No changes or commit messages to process.');
            return;
        }

        const { files, diff } = diffData;
        const maxLength = parseInt(process.env.MAX_LENGTH, 10) || 50;
        const type = 'conventional';
        const prompt = generatePrompt(maxLength, type, files, diff, commitMessages);

        console.log('Prompt generated. Fetching AI-generated squash commit message...');
        const model = process.env.MODEL || 'gpt-4o-mini';
        const suggestions = await generateCommitMessage(model, prompt, maxLength);

        if (!suggestions || suggestions.length === 0) {
            console.log('No valid commit message suggestions generated.');
            return;
        }

        const squashMessage = suggestions[0]; // Take the first suggestion as the squash message (for now it's always 1)
        console.log('Generated squash commit message:', squashMessage);

        console.log('Passing message to apply squash commit...');
        const userResponse = await askUser('\nDo you like this commit message? (yes/no): ');

        if (userResponse === 'yes') {
            console.log(messagesCount > 1 ? 'Squashing all unpushed commits...' : 'Amending the last commit...');
            const operation = messagesCount > 1 ? squashUnpushedCommits : amendLastCommit;

            const remoteBranch = messagesCount > 1 ? await getRemoteBranch() : null;

            if (messagesCount > 1) {
                // Pass both params for squashing
                await operation(squashMessage, remoteBranch);
            } else {
                // Pass only squashMessage for amend
                await operation(squashMessage);
            }
        } else {
            const responses = {
                no: 'Squash operation aborted by the user.',
                default: 'Invalid response. Please run the command again.'
            };
            console.log(responses[userResponse] || responses.default);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

main(); 
