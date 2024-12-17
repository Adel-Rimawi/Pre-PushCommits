import OpenAI from "openai";
import { KnownError } from './error.js';
import 'dotenv/config'; 

export const generateCommitMessage = async (model, prompt, maxLength) => {
    try {
        console.log("ingenerateCommitMessage");

        // Validate API key
        if (!process.env.OPENAI_API_KEY) {
            throw new KnownError('Missing OpenAI API Key. Please set OPENAI_API_KEY in your .env file.');
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, 
        });

        // Call OpenAI API for chat completions
        const response = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            max_tokens: maxLength,
        });

        // Extract and sanitize the response
        const suggestions = response.choices.map((choice) => 
            choice.message.content.trim().replace(/[\n\r]/g, "").replace(/(\w)\.$/, "$1")
        );

        // Deduplicate suggestions
        return Array.from(new Set(suggestions));
    } catch (error) {
        // Handle known API errors
        if (error.response) {
            const status = error.response.status || 'Unknown';
            const statusText = error.response.statusText || 'Unknown';
            const data = error.response.data || 'No details provided';

            throw new KnownError(
                `OpenAI API Error: ${status} - ${statusText}\n${data}`
            );
        }

        // Handle unexpected errors
        throw new KnownError(`Unexpected error: ${error.message || 'No details available.'}`);
    }
};
