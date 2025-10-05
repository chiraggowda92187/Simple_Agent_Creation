import { google } from "@ai-sdk/google"
import { generateText, stepCountIs, tool } from "ai"
import { createGeminiProvider } from "ai-sdk-provider-gemini-cli"
import "dotenv/config"
import { z } from "zod"

const gemini = createGeminiProvider({
    authType: "api-key",
    apiKey: process.env.GOOGLE_GEMINI_API_KEY
})


async function simpleLLMCall() {
    const res = await generateText({
        model: gemini("gemini-2.5-flash"),
        prompt: "What is desire?",

    })
    //@ts-ignore
    console.log(res)
}



async function simpleMathematicalToolCall() {

    const toolSet =  {
            addTwoNumbers: tool({
                description: "This function takes two numbers as arguments and returns the sum of the two numbers. The numbers can be either integer or floating point number",
                inputSchema: z.object({
                    number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
                    number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number"),
                }),
                execute: ({ number1, number2 }) => {
                    return number1 + number2
                }
            }),
            multiplyTwoNumbers: tool({
                description: "This function takes two numbers as arguments and returns the product of the two numbers. The numbers can be either integer or floating point number",
                inputSchema: z.object({
                    number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
                    number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number"),
                }),
                execute: ({ number1, number2 }) => {
                    return number1 * number2
                }
            }),
            calculatePower: tool({
                description: "The power of a number means one number is raised to another number. This function takes two numbers as arguments and returns the result of raising the first number to the power of the second. The numbers can be either integers or floating-point numbers.",
                inputSchema: z.object({
                    number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
                    number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number"),
                }),
                execute: ({ number1, number2 }) => {
                    return Math.pow(number1, number2)
                }
            })
        }
    const res = await generateText({
        model: gemini("gemini-2.5-flash"),
        prompt: "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2. use tool call results to give the final response",
        tools: toolSet,
        stopWhen: stepCountIs(10)
    })
    //@ts-ignore
    console.log(res.content[0])

    // Outputs : { type: 'text', text: 'The final result is 196.' }
}
simpleMathematicalToolCall()