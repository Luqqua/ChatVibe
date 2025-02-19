import { generateJSON } from "./analysis.js";

export function displayResults(analysisResults) {
    const resultsContainer = document.getElementById("results");

    if (!resultsContainer) {
        console.error("FEHLER: 'resultsContainer' wurde nicht gefunden!");
        return;
    }

    resultsContainer.innerHTML = "";

    const outerKpiBox = document.createElement("div");
    outerKpiBox.classList.add("outer-highlights-box"); 
    const kpiHeading = document.createElement("h3");
    kpiHeading.textContent = "KPIs";
    outerKpiBox.appendChild(kpiHeading);

    const kpiRow = document.createElement("div");
    kpiRow.style.display = "flex";
    kpiRow.style.flexWrap = "wrap";
    kpiRow.style.gap = "15px";
    kpiRow.style.marginTop = "10px";

    const activityBox = document.createElement("div");
    activityBox.classList.add("highlight-box");
    activityBox.style.flex = "1 1 calc(30% - 15px)";
    const activityHeader = document.createElement("div");
    activityHeader.classList.add("highlight-header");
    activityHeader.textContent = "Activity Score (Message per minute)";
    activityBox.appendChild(activityHeader);
    const activityContent = document.createElement("p");
    activityContent.textContent = analysisResults.kpis.activity.toFixed(2);
    activityBox.appendChild(activityContent);

    const diversityBox = document.createElement("div");
    diversityBox.classList.add("highlight-box");
    diversityBox.style.flex = "1 1 calc(30% - 15px)";
    const diversityHeader = document.createElement("div");
    diversityHeader.classList.add("highlight-header");
    diversityHeader.textContent = "Diversity Score (Message distribution among chatters, 1 = even)";
    diversityBox.appendChild(diversityHeader);
    const diversityContent = document.createElement("p");
    diversityContent.textContent = analysisResults.kpis.shannonIndex.toFixed(3);
    diversityBox.appendChild(diversityContent);

    const avgLenBox = document.createElement("div");
    avgLenBox.classList.add("highlight-box");
    avgLenBox.style.flex = "1 1 calc(30% - 15px)";
    const avgLenHeader = document.createElement("div");
    avgLenHeader.classList.add("highlight-header");
    avgLenHeader.textContent = "Length Score (Average message lenght)";
    avgLenBox.appendChild(avgLenHeader);
    const avgLenContent = document.createElement("p");
    avgLenContent.textContent = analysisResults.kpis.avgLength.toFixed(1);
    avgLenBox.appendChild(avgLenContent);

    kpiRow.appendChild(activityBox);
    kpiRow.appendChild(diversityBox);
    kpiRow.appendChild(avgLenBox);

    const combinedBox = document.createElement("div");
    combinedBox.classList.add("highlight-box");
    combinedBox.style.marginTop = "15px";
    combinedBox.style.display = "flex";
    combinedBox.style.flexDirection = "column";
    combinedBox.style.alignItems = "center";
    const combinedHeader = document.createElement("div");
    combinedHeader.classList.add("highlight-header");
    combinedHeader.textContent = "Combined KPI";
    combinedBox.appendChild(combinedHeader);
    const combinedContent = document.createElement("p");
    combinedContent.textContent = analysisResults.kpis.combinedKPI.toFixed(3);
    combinedBox.appendChild(combinedContent);

    outerKpiBox.appendChild(kpiRow);
    outerKpiBox.appendChild(combinedBox);
    resultsContainer.appendChild(outerKpiBox);

    const overallBox = document.createElement("div");
    overallBox.classList.add("top-words-box");
    
    const overallHeading = document.createElement("h3");
    overallHeading.textContent = "Top Words Overall";
    overallBox.appendChild(overallHeading);
    
    const innerBox = document.createElement("div");
    innerBox.classList.add("highlight-box");
    
    analysisResults.topWordsOverall.forEach(([word, count]) => {
      const badge = document.createElement("span");
      badge.classList.add("word-badge");
      badge.textContent = `${word} (${count})`;
      innerBox.appendChild(badge);
    });
    
    overallBox.appendChild(innerBox);
    resultsContainer.appendChild(overallBox);
    
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
