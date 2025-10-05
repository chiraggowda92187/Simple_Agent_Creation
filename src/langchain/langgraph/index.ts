import { tool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "ai";
import "dotenv/config"
import pg from "pg"
import { z } from "zod";
import { MongoClient } from "mongodb";




// -> MODELS ( CURRENTLY GEMINI )
// 1. Gemini Model
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_GEMINI_API_KEY
})


// -> STORES ( POSTGRES, IN MEMORY, MONGODB )
// 1. Postgre memory
const { Pool } = pg
const PostGreSqlCheckPointer = new PostgresSaver(new Pool({
    connectionString: "postgre db Url"
}))
// 2. By Default in memory
const inMemoryCheckPointer = new MemorySaver()

// 3. Mongo DB Checkpointer
const client = new MongoClient("Connection Url")
const mongoDBCheckPointer = new MongoDBSaver(client);




// -> CONFIG TO PASS IN INVOKE
// Config to save the threads in the db
const config = {
    configurable: {
        thread_id: "1"
    }
}

// -> TOOLS DEFINITION ( CURRENTLY SUM, PRODUCT, POWER)
// Defining the toolsset
const toolSet : any[] = [
    tool(
        ({ number1, number2 }) => {
            return number1 + number2
        }, {
        name: "addTwoNumbers",
        description: "This function takes two numbers as arguments and returns the sum of the two numbers. The numbers can be either integer or floating point number",
        schema: z.object({
            number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
            number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number")
        })
    }),
    tool(
        ({ number1, number2 }) => {
            return number1 * number2
        }, {
        name: "multiplyTwoNumbers",
        description: "This function takes two numbers as arguments and returns the product of the two numbers. The numbers can be either integer or floating point number",
        schema: z.object({
            number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
            number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number")
        })
    }),
    tool(
        ({ number1, number2 }) => {
            return Math.pow(number1, number2)
        }, {
        name: "calculatePower",
        description: "The power of a number means one number is raised to another number. This function takes two numbers as arguments and returns the result of raising the first number to the power of the second. The numbers can be either integers or floating-point numbers.",
        schema: z.object({
            number1: z.number().describe("The first parameter. The first parameter can be integer or floating point number"),
            number2: z.number().describe("The second parameter. The second parameter can be integer or floating point number")
        })
    })
]

async function simpleLanggraphLLMCall() {
    const agent = createReactAgent({
        llm: model,
        // tools: toolSet,
        // checkpointSaver: inMemoryCheckPointer
    })
    const res = await agent.invoke({
        messages: [{
            role: "user",
            content: "What is desire?"
        }]
    }, config)
    console.log(res)
}
// simpleLanggraphLLMCall()


// -> FINAL Langgraph llm call with tools and memory
async function simpleLanggraphLLMCallWithTools() {
    const agent = createReactAgent({
        llm: model,
        tools: toolSet,
        checkpointSaver: inMemoryCheckPointer
    })
    const res = await agent.invoke({
        messages: [{
            role: "user",
            content: "First calculate 3 + 4, then multiply the result by 2, then raise it to the power of 2. use tool call results to give the final response"
        }]
    }, config)
    console.log(res)
}
simpleLanggraphLLMCallWithTools()