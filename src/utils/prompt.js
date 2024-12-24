export const generatePrompt = (files, diff, commitMessage) => {
    return `Generate a concise git commit message written in present tense for the following code diff and the provided current commit message (if useful), based on the specifications below:

1. **Message Requirements**:
   - Maximum length: 50 characters.
   - Exclude unnecessary details (e.g., translations or verbose explanations).
   - Your entire response will be passed directly into git commit.

2. **Files Changed**:
   ${files}

3. **Code Diff**:
   ${diff}

4. **Current Commit Message**:
   ${commitMessage}

5. **Commit Message Format**:
   <type>(<mandatory scope>): <commit message>

6. **Types and Descriptions**:
   - **docs**: Documentation-only changes.
   - **style**: Non-functional changes like formatting, spacing, or missing semi-colons.
   - **refactor**: Code changes that improve readability, maintainability, or reduce technical debt without affecting behavior (e.g., restructuring code, removing unused imports).
   - **perf**: Performance improvements.
   - **test**: Adding or updating tests.
   - **build**: Changes to the build system or external dependencies.
   - **ci**: Updates to CI configuration or scripts.
   - **chore**: Maintenance tasks that don’t modify source or test code behavior (e.g., dependency updates, modifying .gitignore).
   - **revert**: Reverts a previous commit.
   - **feat**: Adds a new feature.
   - **fix**: Fixes a bug.`;
};
