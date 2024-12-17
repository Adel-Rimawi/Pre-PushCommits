import { execa } from 'execa';
import { KnownError } from './error.js';

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

const excludeFromDiff = (path) => `:(exclude)${path}`;

const filesToExclude = [
	'package-lock.json',
	'pnpm-lock.yaml',

	// yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
	'*.lock',

    // Maven/Gradle build artifacts
	'*.log',
	'*.iml',
	'target/',
	'.mvn/',
	'build/',
	'out/',

	// IDE and editor configuration files
	'.idea/',
	'.vscode/',
	'.settings/',
	'.classpath',
	'.project',

	// OS-specific files
	'.DS_Store',
	'Thumbs.db',

	// Environment configuration files
	'.env',
	'.env.local',
	'application.properties',
	'application.yml',

	// Docker and deployment-specific files
	'docker-compose.override.yml',
	'docker-compose.yml',

	// Miscellaneous files to exclude
	'*.bak',
	'*.swp',
	'*.tmp',
].map(excludeFromDiff);


export const getDiffBetweenBranches = async (excludeFiles = []) => {
    const diffBase = ['diff', '@{u}..HEAD', '--diff-algorithm=minimal'];

    // Get the list of changed files, excluding specified files
    const { stdout: files } = await execa('git', [
        ...diffBase,
        '--name-only',
        ...filesToExclude,
        ...(excludeFiles.length ? excludeFiles.map(excludeFromDiff) : []),
    ]);

    if (!files) {
        return null;
    }

    // Get the actual diff, excluding specified files
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

// Function to get the commit messages between the upstream and HEAD
export const getCommitMessagesAndCount = async () => {
    try {
        const { stdout: log } = await execa('git', [
            'log',
            '--pretty=format:"- %s"',
            '@{u}..HEAD'
        ]);

        if (!log) {
            return { commitMessages: [], messagesCount: 0 };
        }

        const commitMessages = log.split('\n');
        const messagesCount = log.length;

        return { commitMessages, messagesCount };
    } catch (error) {
        throw new KnownError(`Error retrieving commit messages: ${error.message}`);
    }
};

