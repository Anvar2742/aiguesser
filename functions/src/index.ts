import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import OpenAI from 'openai';
require('dotenv').config();
import { prompts } from './prompts';


// Initialize OpenAI with the API key from Firebase config
// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cors = process.env.IS_DEV ? "http://localhost:5173" : "https://aiguessr-vf.web.app"
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: "aiguessr-vf",
        storageBucket: "aiguessr-vf.firebasestorage.app",
        databaseURL: 'http://127.0.0.1:9000/?ns=aiguessr-vf-default-rtdb', // Local emulator URL
    });
}

// Define the Cloud Function

exports.gptLetter = onRequest({ cors, region: "europe-west1" }, async (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', cors);
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        const { message } = req.body;
        const startTime = Date.now();

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": prompts.main
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": message
                        }
                    ]
                },
            ],
            response_format: {
                "type": "text"
            },
            tools: [
                {
                    "type": "function",
                    "function": {
                        "name": "get_user_tone",
                        "description": "Analyzes the user's input to determine their tone",
                        "parameters": {
                            "type": "object",
                            "required": [
                                "user_input",
                                "context"
                            ],
                            "properties": {
                                "user_input": {
                                    "type": "string",
                                    "description": "The text input provided by the user for tone analysis"
                                },
                                "context": {
                                    "type": "string",
                                    "description": "Optional additional context that might influence tone interpretation"
                                }
                            },
                            "additionalProperties": false
                        },
                        "strict": true
                    }
                }
            ],
            tool_choice: "auto",
            temperature: 1,
            max_completion_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        const endTime = Date.now();
        const gptResponseTime = endTime - startTime;

        // Calculate delay to simulate human typing
        const baseDelay = Math.random() * 8000 + 5000; // Random delay between 4-6 seconds
        const totalDelay = Math.max(baseDelay, gptResponseTime);
        // Get ChatGPT's reply
        // @ts-ignore
        const reply = response?.choices[0]?.message?.content.trim();
        // Delay the response to simulate a human typing speed
        console.log(totalDelay)
        await new Promise((resolve) => setTimeout(resolve, totalDelay));
        res.status(200).send({ reply });
    } catch (error: any) {
        console.error("Error with OpenAI API:", error.message);
        res.status(500).send({ error: error.message });
    }
});
