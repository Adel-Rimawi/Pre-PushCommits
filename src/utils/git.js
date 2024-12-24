import { execa } from 'execa';
import { KnownError } from './error.js';

// Step 1: Ensure we are in a Git repository
export const checkRepo = async () => {
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


export const getStaged = async (excludeFiles = []) => {
    await checkRepo();
    console.log('Fetching changes...');
    // Prepare the diff base for staged changes only
    const diffBase = ['diff', '--cached', '--diff-algorithm=minimal'];

    // Fetch the list of staged files
    const { stdout: files } = await execa('git', [
        ...diffBase,
        '--name-only',
        ...(excludeFiles.length ? excludeFiles.map(excludeFromDiff) : []),
    ]);

    if (!files) return null;

    // Fetch the detailed diff of staged changes
    const { stdout: diff } = await execa('git', [
        ...diffBase,
        ...(excludeFiles.length ? excludeFiles.map(excludeFromDiff) : []),
    ]);

    return {
        files: files.split('\n').filter(Boolean),
        diff,
    };
};

