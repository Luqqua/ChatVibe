import { generateJSON } from "./analysis.js";

export function displayResults(analysisResults) {
    const resultsContainer = document.getElementById("results");

    if (!resultsContainer) {
        console.error("FEHLER: 'resultsContainer' wurde nicht gefunden!");
        return;
    }

    resultsContainer.innerHTML = "";

    const outerHighlightsBox = document.createElement("div");
    outerHighlightsBox.classList.add("outer-highlights-box");

    const highlightsHeading = document.createElement("h3");
    highlightsHeading.textContent = "Highlights";
    outerHighlightsBox.appendChild(highlightsHeading);

    const highlightsContainer = document.createElement("div");
    highlightsContainer.classList.add("highlights-container");

    if (!analysisResults.highlights || analysisResults.highlights.length === 0) {
        const noHighlightsMsg = document.createElement("h3");
        noHighlightsMsg.textContent = "No highlights found. Adjust your analysis settings.";
        outerHighlightsBox.appendChild(noHighlightsMsg);
    } else {
        analysisResults.highlights.forEach(highlight => {
            const highlightBox = document.createElement("div");
            highlightBox.classList.add("highlight-box");

            const highlightHeader = document.createElement("div");
            highlightHeader.classList.add("highlight-header");
            highlightHeader.textContent = `${highlight.start} - ${highlight.end}`;
            highlightBox.appendChild(highlightHeader);

            const wordsContainer = document.createElement("div");
            wordsContainer.classList.add("highlight-words");

            highlight.topWords.forEach(([word, count]) => {
                const badge = document.createElement("span");
                badge.classList.add("word-badge");
                badge.textContent = `${word} (${count})`;
                wordsContainer.appendChild(badge);
            });

            highlightBox.appendChild(wordsContainer);
            highlightsContainer.appendChild(highlightBox);
        });
    }

    outerHighlightsBox.appendChild(highlightsContainer);
    resultsContainer.appendChild(outerHighlightsBox);

    const downloadButton = document.createElement("button");
    downloadButton.id = "download-btn";
    downloadButton.textContent = "Download JSON";

    downloadButton.style.marginTop = "20px";
    downloadButton.style.padding = "10px 15px";
    downloadButton.style.cursor = "pointer";
    downloadButton.style.display = "block";
    downloadButton.style.width = "20%"; 
    downloadButton.style.textAlign = "center";

    downloadButton.addEventListener("click", () => {
        const jsonOutput = generateJSON(analysisResults);
        const blob = new Blob([jsonOutput], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "twitch_highlights.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    outerHighlightsBox.appendChild(downloadButton);
}
