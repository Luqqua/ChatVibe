
import {
  readCSV,
  analyzeChat,
  defaultBlacklist,
  generateJSON
} from "./analysis.js";
import { displayResults } from "./render.js";
import { validateAndConvert } from "./validateandconvert.js";

const form = document.getElementById("analysis-form");
const downloadButton = document.getElementById("download-btn");

const spinner = document.getElementById("spinner");

form.addEventListener("submit", handleFormSubmit);

async function handleFormSubmit(event) {
  event.preventDefault();

  spinner.style.display = "block";

  try {
    const fileInput = document.getElementById("chat-file");
    if (!fileInput.files.length) {
      alert("Bitte eine JSON- oder CSV-Datei hochladen.");
      return;
    }

    const aggregationInterval = parseInt(document.getElementById("aggregation-interval").value, 10);
    const stdFactor = parseFloat(document.getElementById("std-factor").value);
    const contextBefore = parseInt(document.getElementById("context-before").value, 10);
    const contextAfter = parseInt(document.getElementById("context-after").value, 10);
    const chatDelay = parseInt(document.getElementById("chat-delay").value, 10);
    const slopeThreshold = parseInt(document.getElementById("slope-threshold").value, 10);
    const logicMode = document.getElementById("logic-mode").value; 
    const useAndLogic = (logicMode === "AND");

    const useBlacklist = document.getElementById("use-blacklist").checked;
    const customBlacklistText = document.getElementById("custom-blacklist").value;

    const customBlacklistArray = customBlacklistText
      .split(",")
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0);
    
    const finalBlacklist = new Set();
    if (useBlacklist) {
      for (const word of defaultBlacklist) {
        finalBlacklist.add(word);
      }
    }
    for (const word of customBlacklistArray) {
      finalBlacklist.add(word);
    }
    
    const file = fileInput.files[0];
    const fileContent = await file.text();
    const fileExtension = file.name.split(".").pop().toLowerCase();
    
    const validatedContent = validateAndConvert(fileContent, fileExtension);

    const csvBlob = fileExtension === "json"
      ? new Blob([validatedContent], { type: "text/csv" })
      : file;
    
    const chatData = await readCSV(csvBlob);

    const analysisResults = analyzeChat(
      chatData,
      aggregationInterval,
      stdFactor,
      finalBlacklist,   
      chatDelay,
      contextBefore,
      contextAfter,
      slopeThreshold,
      useAndLogic
    );
 
    displayResults(analysisResults);
 
    const jsonOutput = generateJSON(analysisResults);
 
    downloadButton.style.display = "block";
    downloadButton.onclick = () => downloadJSON(jsonOutput, "twitch_highlights.json");

  } catch (error) {
    console.error("Fehler:", error);
    alert("An error occurred: " + error.message);
  } finally {
    
    spinner.style.display = "none";
  }
}

function downloadJSON(jsonData, filename) {
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
