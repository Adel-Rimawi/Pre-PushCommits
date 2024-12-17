import { execa } from 'execa';
import { KnownError } from './error.js';

// Step 1: Ensure we are in a Git repository
export const checkGitRepo = async () => {
    const { stdout, failed } = await execa(
        'git',
        ['rev-parse', '--show-toplevel'],
        { reject: false }
    );

    if (failed) {
        throw new KnownError('The current directory must be a Git repository!');
    }

    return stdout;
};

// Utility to exclude files from `git diff`
const excludeFromDiff = (path) => `:(exclude)${path}`;

const filesToExclude = [
    'package-lock.json',
    'pnpm-lock.yaml',
    '*.lock',
    '*.log',
    '*.iml',
    'target/',
    '.mvn/',
    'build/',
    'out/',
    '.idea/',
    '.vscode/',
    '.settings/',
    '.classpath',
    '.project',
    '.DS_Store',
    'Thumbs.db',
    '.env',
    '.env.local',
    'application.properties',
    'application.yml',
    'docker-compose.override.yml',
    'docker-compose.yml',
    '*.bak',
    '*.swp',
    '*.tmp',
].map(excludeFromDiff);

// Step 2: Get current branch and upstream/fallback logic
const getRemoteBranch = async () => {
    const { stdout: localBranch } = await execa('git', ['symbolic-ref', '--short', 'HEAD']);

    try {
        // Try to get upstream branch
        const { stdout: upstream } = await execa('git', [
            'for-each-ref',
            '--format=%(upstream:short)',
            `refs/heads/${localBranch}`,
        ]);
        return upstream.trim();
    } catch {
        // Fallback to origin/<localBranch>
        return `origin/${localBranch}`;
    }
};
export const getDiffBetweenBranches = async (excludeFiles = []) => {
    let remoteBranch = await getRemoteBranch();

    // Strip "origin/" when passing to git fetch
    const fetchTarget = remoteBranch.startsWith('origin/')
        ? remoteBranch.replace('origin/', '')
        : remoteBranch;

    // Fetch the correct branch
    await execa('git', ['fetch', 'origin', fetchTarget]);

    const diffBase = ['diff', `${remoteBranch}..HEAD`, '--diff-algorithm=minimal'];

    const { stdout: files } = await execa('git', [
        ...diffBase,
        '--name-only',
        ...filesToExclude,
        ...(excludeFiles.length ? excludeFiles.map(excludeFromDiff) : []),
    ]);

    if (!files) return null;

    const { stdout: diff } = await execa('git', [
        ...diffBase,
        ...filesToExclude,
        ...(excludeFiles.length ? excludeFiles.map(excludeFromDiff) : []),
    ]);

    return {
        files: files.split('\n').filter(Boolean),
        diff,
    };
};

// Step 4: Get commit messages and count
export const getCommitMessagesAndCount = async () => {
    const remoteBranch = await getRemoteBranch();

    try {
        const { stdout: log } = await execa('git', [
            'log',
            '--pretty=format:"- %s"',
            `${remoteBranch}..HEAD`
        ]);

        if (!log) {
            return { commitMessages: [], messagesCount: 0 };
        }

        const commitMessages = log.split('\n');
        const messagesCount = commitMessages.length;

        return { commitMessages, messagesCount };
    } catch (error) {
        throw new KnownError(`Error retrieving commit messages: ${error.message}`);
    }
};
