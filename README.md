# laframeragts
Lalulla Boiler Template using ElectronJS with support to Typescript for Retrieval Augmented Generation (RAG)

# Laframeragts

Laframeragts is an Electron application template meticulously crafted to expedite the initiation of new Electron projects using NLP and AI for Retrieval Augmented Generation (RAG). This boilerplate equips developers with pre-configured common initializations and processes, empowering them to jumpstart their projects with enhanced efficiency.

## Project Overview

Laframeragts is an ElectronJS boilerplate specifically tailored for desktop application development, NLP, and AI for RAG.

## Goal / Purpose

The overarching goal of Laframerag is to deliver an application framework that can be seamlessly compiled for various operating systems and platforms while maintaining optimal functionality.

## Key Benefits

1. **Faster Development:** Leverage a well-organized and pre-coded foundation to accelerate the development of Electron applications.
   
2. **Write Once, Deploy Many:** Develop your application once and deploy it across different platforms, eliminating the need for platform-specific development efforts.

3. **Cost Savings:** By reducing development time and enabling cross-platform deployment, Laframerag contributes to cost savings in the overall development lifecycle.

## Laframerag Features

- **Boilerplate Code:** Start your Electron project with a structured and readily deployable codebase.

- **Common Initializations:** Pre-configured settings and setups for frequently used features in Electron applications.

- **Streamlined Development:** Save valuable time on repetitive tasks, enabling you to focus on the unique and innovative aspects of your application.

## Available Libraries

Laframerag is enriched with the following libraries to elevate your Electron app development experience:

1. **Serial Port Library:** Seamlessly integrate serial port functionality into your Electron application for effective communication with external devices.

2. **QR Code Reading Library:** Simplify QR code scanning in your app with a pre-built library, facilitating easy reading and processing of QR codes.

3. **Video Capture Library:** Integrate video capture capabilities into your Electron app for tasks such as recording or processing video streams.

4. **Login Module:** Embed a robust and secure login module into your application, saving you the effort of implementing authentication from scratch.

5. **Configuration Module:** Effortlessly manage application settings with the pre-built configuration module, allowing users to customize their experience.

## Getting Started

To harness the power of Laframerag as the foundation for your new Electron app, follow these straightforward steps:

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/laframerag.git

## Sophia's Components
Sophia uses the following technologies to implement:
1. **Ollama** The main library used for the AI queries.
2. **Langchain** Used for the embeddings
3. **Chromadb** Vector database used for embeddings
4. **ElectronJS** Framework used by the application
5. **MySQL** The backend database to be used for control and storage.

## Predefined Models
1. **Master Model** This is the default model usually this is set to llama2
2. **Image Model** This is the model to be used when analyzing images. Usually is set to llava
3. **Embedding Model** This is the model that will handle embeddings. Usually is set to llama2.
4. **Other Models** User can select them for their own use.


## Operating Modes

Sophia operating in 2 modes:
1. **Standalone Mode** This mode all the models, database and vector database/embeddings are located in one machine. This requires a powerful machine because it will house the require models in the back-end. These models are the master models, image model and embed mode.
In standalone mode, all the heavy lifting is on the machine where Sophia is installed.
2. **Distributed Mode** This mode allows user to distribute models to different machines thus improving the performance.
You can modify the .env to adjust the **HOST:PORT** address of the pre-assigned models.

## Pre-Assigning of Models

Sophia is a chatbot that uses multiple models during conversation. There are pre-defined models that need to be available and downloaded from Ollama befire the system can be used.

1. **Master** - this is the main model used. You can select your preferred model but by default this is assigned to **llama2**.
2. **Image** - this can be assigned to any models the process images or supports image analysis. Basically, this is assigned to llava. See AI_IMAGE_MODEL in the .env
3. **Embed** - the model to be used during embedding. When you select **Embeddings**, the special assigned model to embeddings will be used. See **AI_EMBED_MODEL** in the .env.
4. **Tools** - this is assigned to model that is capable of handling tooling.

## Auto-Detects

1. ***Personality*** - auto-detect defaults to **AI_MASTER_MODEL**.
2. ***Expertise*** - auto-detect allows model to analyze the tone of the user.
3. ***Style*** - auto-detect allows g=model to analyze the tone of the user.

**Uploading an image** - when the user uploads an image, the **AI_IMAGE_MODEL** is selected and the chat textbox is automatically filled with a pre-defined text that is editable or customizable.

## UI Objects
- **Text Box** - place here the prompt to be used by the LLM.
- **Send Button / Heart Icon** - Send buttons send prompt to the model, heart means the request is being processed.
- **Personality Dropdown** - contains list of LLM models or the alias of LLM model. Example: ***Embeddings*** - this is an alias for llama2. ***Toolings*** - this is an alias for mistral.
- **Expertise Dropdown** - contains list of expertise the model will be prime using ***system*** prompt.
- **Style Dropdown** - contains list of chat style the model will be prime using ***system*** prompt.
- **Eyes Icon** - use for uploading image and analyzing it using **AI_IMAGE_MODEL**. Usually this is assigned to ***llava***.
- **Camera Icon** - used for taking picture and analyze it using **AI_IMAGE_MODEL**. Usually this is assigned to ***llava***.
- **Chip Icon** - used for ***Embeddings*** of document. The system will ask for a document and it will perform embeddings out of it.



## Prompt Composition
1. **Persona** - is the behavior of the agent. Tne **model** used, the **expertise** and the **style** being used. These parameters can change anytime during the course of the conversation.
2. **History** - is a collection of user query and assistant response used as part of the reference in the incoming conversation.

**Personality** is the combination of Persona and History. Every time the user query, the Persona changes and the History grows.

## Processing of Chat History
1. **In Context** - all the query of the user and the reply from the agent is recorded in history to be used as a context.
2. **Out of Context** - user query is not recorded. Same with the agent reply. This is a one-shot approach. You cannot ask the assistant based on its previous response becuase it does not keep track of it.




# Installation

## 1. Install Ollama
Visit Ollama website and download ollama
## 2. Download Models
Download the models that Sophia needs. Basically these are **llama2**, **mistral**, **llava**.
## 3. Install Python
Download the latest python for windows.
## 4. Install ChromaDB
Install ChromaDB via python.
## 5. Install Sophia
Run Sophia installer.
## 6. Install requirements of tooling
