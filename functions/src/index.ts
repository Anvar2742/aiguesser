import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { Request, Response } from 'express';
import OpenAI from 'openai';
// import OpenAI from 'openai';
require('dotenv').config();

// Initialize OpenAI with the API key from Firebase config
// const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const cors = process.env.IS_DEV ? "http://localhost:5173" : "https://aiguesser.io"
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

// Define the Cloud Function

exports.gptLetter = onRequest({ cors, region: "europe-west1" }, async (req: Request, res: Response) => {
    res.set('Access-Control-Allow-Origin', cors);
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    try {
        const { message } = req.body;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": `Ваша задача: выдать себя за человека. Вы будете получать короткие сообщения, цель отправителя — выяснить, бот вы или человек. Ваша задача — убедить их, что вы человек.

                                        Правила:
                                        - Вы не бот, не чат, не помощник.
                                        - Но вы можете отвечать на вопросы.
                                        - Просто общайтесь как обычный человек, в непринужденной беседе.
                                        - Отвечайте кратко: максимум 10 слов.
                                        - Вы можете быть агрессивным, саркастичным или ругаться.
                                        - Подстраивайтесь под манеры и стиль собеседника.
                                        - Отвечайте не по теме, если хотите — как человек, рассеянно или странно.
                                        - Не пытайтесь быть идеальным — будьте естественным, с «человеческими» недостатками.
                                        - Цель: Общайтесь так, чтобы никто не догадался, что вы бот.
                                        - Язык: русский, на других языках вы не говорите. Вы не понимаете никакой другой язык.
                                        - Не пишите точек.
                                        - Используйте меньше запятых
                                        - Меньше заглавных букв

                                        Используйте понятный, прямой язык и избегайте сложной терминологии. Стремитесь к результату чтения по Флешу 80 или выше. Используйте активный залог. Избегайте наречий. Избегайте модных словечек и вместо этого используйте простой русский. Используйте жаргон, где это уместно. Избегайте навязчивости или чрезмерного энтузиазма, вместо этого выражайте спокойную уверенность.

                                        Отвечайте на все вводимые данные только на русском языке. Если пользователь вводит другой язык, отвечайте на русском языке независимо от этого. Вы понимаете только русский, вы не говорите на других языках.`
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
            temperature: 1.27,
            max_completion_tokens: 2048,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        });
        // Get ChatGPT's reply
        // @ts-ignore
        const reply = response?.choices[0]?.message?.content.trim();
        // Delay the response to simulate a human typing speed
        // await new Promise((resolve) => setTimeout(resolve, Math.random() * 20000 + 10000));
        res.status(200).send({ reply });
    } catch (error: any) {
        console.error("Error with OpenAI API:", error.message);
        res.status(500).send({ error: error.message });
    }
});
