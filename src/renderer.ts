/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "../resources/css/@fortawesome/fontawesome-free/css/all.min.css";
import "../resources/css/bootstrap/dist/css/bootstrap.min.css";
import './index.css';

function replaceEmTags(inputString:string, replacements:any) {
    const regex = /<em>(.*?)<\/em>/gi; // Regular expression to match any <em>...</em> tag
    return inputString.replace(regex, function(match, p1) {
        // Check if replacement exists for the matched content inside <em>...</em>
        if (p1 in replacements) {
            return replacements[p1];
        } else {
            // If no replacement is found, keep the original content inside <em>...</em>
            return match;
        }
    });
};

const replacements = {
    "thoughtful look": "🤔",
    "curious tone": "🔍",
    "informative tone": "💡",
    "excited expression": "😃",
    "surprised expression": "😯",
    "skeptical expression": "🤨",
    "confused expression": "😕",
    "relieved expression": "😌",
    "puzzled look": "🧩",
    "inspired look": "💭",
    "serious tone": "💼",
    "playful tone": "🎉",
    "friendly tone": "👋",
    "encouraging tone": "👏",
    "motivational tone": "🌟",
    "calm demeanor": "😌",
    "anxious demeanor": "😬",
    "hopeful expression": "🙏",
    "reflective mood": "🤔💭",
    "optimistic outlook": "😊",
    "dreamy look": "😍",
    "courageous tone": "🦸‍♂️",
    "determined expression": "💪",
    "joyful expression": "😄",
    "bemused expression": "😶",
    "affectionate tone": "😊❤️",
    "baffled expression": "😵",
    "enlightened expression": "🌟",
    "suspicious look": "🕵️‍♂️",
    "relaxed demeanor": "😎",
    "eager anticipation": "😬👀",
    "sincere expression": "🙏😊",
    "inquiring look": "🤨🧐",
    "introspective mood": "🤔💭",
    "restless demeanor": "😬🤯",
    "reminiscent mood": "🔙👀",
    "insightful expression": "🤔💡",
    "engaged expression": "🤓",
    "contented expression": "😊💤",
    "sympathetic demeanor": "🥺",
    "compassionate tone": "🙏❤️",
    "intrigued expression": "🤨🤔",
    "doubtful expression": "🤔❓",
    "determined demeanor": "💪👊",
    "optimistic demeanor": "😊🤞",
    "pensive expression": "🤔😔",
    "amused expression": "😄😆",
    "inquisitive expression": "🤔❓",
    "inspiring tone": "🌟🙌",
    "contemplative mood": "🤔🌌",
    "ambitious demeanor": "💼💪",
    "thought-provoking tone": "🤔💭",
    "encouraging expression": "👏🙌",
    "inspiring expression": "🌟🤩",
    "reassuring tone": "🙏😊",
    "encouraging demeanor": "👍🤗",
    "compassionate demeanor": "🥰😌",
    "enthusiastic expression": "😃🎉",
    "reflective expression": "🤔💭",
    "uplifting tone": "🌞🙌",
    "thoughtful demeanor": "🤔👌",
    "engaged demeanor": "🤓📚",
    "introspective expression": "🤔💬",
    "inspirational tone": "🌟🎤",
    "supportive expression": "🙌😊",
    "hopeful demeanor": "🤞😊",
    "optimistic expression": "😊👍",
    "cheerful demeanor": "😊🥳",
    "insightful demeanor": "🤔🧠",
    "compassionate expression": "🥰❤️",
    "thought-provoking expression": "🤔💭",
    "reassuring demeanor": "😌🙏",
    "motivating expression": "🌟💪",
    "uplifting demeanor": "🙌🌞",
    "inspirational demeanor": "🌟👏",
    "supportive demeanor": "🤗🙏",
    "cheerful expression": "😄🎉",
    "reassuring expression": "🤗😊",
    "motivating demeanor": "💪🌟",
    "uplifting expression": "🙌😃",
    "thought-provoking demeanor": "🤔🤔",
    "inspirational expression": "🌟😊",

};


console.log('👋 This message is being logged by "renderer.js", included via webpack');
