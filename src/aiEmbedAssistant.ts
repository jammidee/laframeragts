/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2023 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
 * This file is part of Lalulla System.
 * 
 * LaKuboTron Framework is distributed under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LaKuboTron System is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Lalulla System.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Framework Designed by: Jammi Dee (jammi_dee@yahoo.com)
 *
 * File Create Date: 04/16/2024 04:16AM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

import ollama                 from './libs/SimplyOllama';

import {OllamaEmbeddings}     from "@langchain/community/embeddings/ollama"
import { Ollama }             from "@langchain/community/llms/ollama";
import { Chroma }             from "@langchain/community/vectorstores/chroma";
import {PromptTemplate}       from "@langchain/core/prompts";
import {StringOutputParser}   from "@langchain/core/output_parsers"

// interface ChatConfig {
//     // Define the type of chatCfg object
//     messages: any[]; // Update any to the appropriate type
//     tools: any; // Update any to the appropriate type
// }

interface ChatConfig {
    model: string;
    tools: any[];
    tool_choice: 'auto' | 'manual';
    messages: any[];
    temperature: number;
    max_tokens: number;
    stream: boolean;
}

async function aiEmbedAssistant(prompt: any, props: ChatConfig, tools: any): Promise<any> {
    let chatCfg: ChatConfig = { ...props };

    // Add tools
    chatCfg.tools = tools;

    // Add prompt to personality, then query LLM
    chatCfg.messages.push(prompt);
    console.log(`aiEmbedAssistant --> \n\n ${JSON.stringify(chatCfg)}`);

    const embeddings = new OllamaEmbeddings({
        model: process.env.AI_EMBED_MODEL || 'default_model', // default value
        baseUrl: `http://${process.env.AI_EMBED_HOST}:${process.env.AI_EMBED_PORT}`, // default value
        requestOptions: {
            useMMap: true,
            numThread: 6,
            numGpu: 1,
        },
    });

    const ollamaLlm = new Ollama({
        baseUrl: `http://${process.env.AI_EMBED_HOST}:${process.env.AI_EMBED_PORT}`,
        model: process.env.AI_EMBED_MODEL || 'default_model'
    });

    function combineDocuments(docs: any[]): string {
        return docs.map((doc) => doc.pageContent).join('\n\n');
    }

    const vectorStore = await Chroma.fromExistingCollection(
        embeddings, { collectionName: process.env.COLLECTION_NAME || "sophia-collection", url: `http://${process.env.VEC_EMBED_HOST}:${process.env.VEC_EMBED_PORT}` },
    );

    const chromaRetriever = vectorStore.asRetriever();

    const userQuestion = prompt;

    const QuestionPrompt = PromptTemplate.fromTemplate(`For following user question convert it into a standalone question {userQuestion}`);
    const QuestionChain = QuestionPrompt.pipe(ollamaLlm).pipe(new StringOutputParser()).pipe(chromaRetriever);

    const documents = await QuestionChain.invoke({ userQuestion: userQuestion });
    console.log(`The initial result: \n\n ${JSON.stringify(documents)}`);

    const combinedDocs = combineDocuments(documents);

    const questionTemplate = PromptTemplate.fromTemplate(`
      Answer the below question using the context. Strictly use the context and answer in crisp and point to point.
      <context>
        {context}
      </context>
  
      question: {userQuestion}
  
    `);

    const answerChain = questionTemplate.pipe(ollamaLlm);

    const llmResponse = await answerChain.invoke({
        context: combinedDocs,
        userQuestion: userQuestion
    });

    console.log("Printing llm response --> ", llmResponse);

    const response = await ollama.chat(chatCfg);
    return response;
}

export default aiEmbedAssistant;
