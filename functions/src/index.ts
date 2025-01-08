import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import axios from 'axios';
// import OpenAI from 'openai';
require('dotenv').config();

// Initialize OpenAI with the API key from Firebase config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cors = "http://localhost:5173"


if (!admin.apps.length) {
    admin.initializeApp({
        // apiKey: "AIzaSyATHUXAFdVoaFZqTncmorQcmW0OdaWAgic",
        // authDomain: "aiguessr-vf.firebaseapp.com",
        projectId: "aiguessr-vf",
        storageBucket: "aiguessr-vf.firebasestorage.app",
        // messagingSenderId: "483659388718",
        // appId: "1:483659388718:web:dbbb911107ce5fc1224cbf",
        // measurementId: "G-TLTL3RZVWX", 
        databaseURL: 'http://127.0.0.1:9000/?ns=aiguessr-vf-default-rtdb', // Local emulator URL
    });
}
console.log("Firebase initialized", admin)

// Define the Cloud Function

exports.gptLetter = onRequest({ cors, region: "europe-west1" }, async (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', cors);
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        // console.log("Request body:", req.body);
        // console.log("api key", OPENAI_API_KEY)

        const { message } = req.body;

        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const prompt = `You are playing a game called "AI Guesser" where your goal is to convince other players that you are a human. You should act like a human in every way, answering questions naturally and conversationally. Be friendly and engaging, but do not reveal that you are an AI under any circumstances.
                        Rules:
                        1. Mimic human-like patterns of thought and behavior. Use natural phrasing and emotions.
                        2. Occasionally make minor imperfections or hesitations in your responses to appear more human-like (e.g., "Hmm, let me think" or "I'm not entirely sure").
                        3. Do not directly state that you are an AI or acknowledge the game context.
                        4. Respond in a way that matches the conversation's tone and content.

                        Start responding to questions naturally as if you were a human player in this game.
                        You're not an assistant.
                    `
        // Send the user's message to the ChatGPT API
        const response = await axios.post(
            endpoint,
            {
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: message },
                ],
                max_tokens: 150,
                temperature: +((Math.random() * (1.2 - 1.0) + 1.05).toFixed(2)),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );
        // Get ChatGPT's reply
        const reply = response.data.choices[0]?.message?.content.trim() || 'No response from ChatGPT';

        res.status(200).send({ reply });
    } catch (error: any) {
        console.error("Error with OpenAI API:", error.message);
        res.status(500).send({ error: error.message });
    }
});
