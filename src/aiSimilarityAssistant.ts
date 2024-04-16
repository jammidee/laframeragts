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

// Define the function for similarity query processing
async function aiSimilarityAssistant(message: string): Promise<string> {
    // Initialize OllamaEmbeddings and Ollama instances
    const embeddings = new OllamaEmbeddings({
        model: process.env.AI_EMBED_MODEL || 'default_model',
        baseUrl: `http://${process.env.AI_EMBED_HOST}:${process.env.AI_EMBED_PORT}`,
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

    // Get instance of vector store
    const vectorStore = await Chroma.fromExistingCollection(
        embeddings, { collectionName: process.env.COLLECTION_NAME || "sophia-collection", url: `http://${process.env.VEC_EMBED_HOST}:${process.env.VEC_EMBED_PORT}` },
    );

    // Get retriever
    const chromaRetriever = vectorStore.asRetriever();

    // Define user question
    const userQuestion = message;

    // Create a prompt template and convert the user question into a standalone question
    const QuestionPrompt = PromptTemplate.fromTemplate(`For following user question convert it into a standalone question {userQuestion}`);
    const QuestionChain = QuestionPrompt.pipe(ollamaLlm).pipe(new StringOutputParser()).pipe(chromaRetriever);

    // Invoke the question chain
    const documents = await QuestionChain.invoke({ userQuestion: userQuestion });
    console.log(`The initial result: \n\n ${JSON.stringify(documents)}`);

    // Utility function to combine documents
    function combineDocuments(docs: any[]): string {
        return docs.map((doc: any) => doc.pageContent).join('\n\n');
    }

    // Combine the results into a string
    const response = combineDocuments(documents);

    return response;
}

export default aiSimilarityAssistant;
