import { dim } from 'kolorist';
// import { version } from '../../package.json' assert { type: 'json' }; // read about this error later in code > error to look into

export class KnownError extends Error {} // will change to TS later 

const indent = '    ';

export const handleCliError = (error) => {
	if (error instanceof Error && !(error instanceof KnownError)) {
		if (error.stack) {
			console.error(dim(error.stack.split('\n').slice(1).join('\n')));
		}
		// console.error(`\n${indent}${dim(`ChangeLog v${version}`)}`);
		console.error(
			`\n${indent}Please open a Bug report with the information above in JIRA:`
		);
	}
};