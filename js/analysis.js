
export const defaultBlacklist = new Set([
  "der", "ist", "die", "das", "ein", "eine", "einer", "eines",
  "dem", "den", "ihr", "ihre", "ihres", "seinen", "seiner", "sein",
  "ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "uns",
  "euch", "mich", "dich", "mein", "dein", "unser", "euer", "in",
  "an", "auf", "bei", "mit", "nach", "von", "zu", "über", "unter",
  "vor", "hinter", "zwischen", "aber", "und", "oder", "denn", "weil",
  "dass", "ob", "wenn", "als", "doch", "daher", "hier", "da", "dort",
  "wie", "wo", "was", "wer", "welcher", "welche", "welches", "nicht",
  "kein", "nur", "schon", "doch", "auch", "sehr", "jetzt", "immer",
  "noch", "bis", "so", "wohl", "vielleicht",
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "when",
  "then", "while", "of", "at", "by", "for", "with", "about", "against",
  "between", "into", "through", "during", "before", "after", "above",
  "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
  "under", "again", "further", "once", "here", "there", "why", "how",
  "what", "who", "which", "whom", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "have",
  "has", "had", "having", "do", "does", "did", "doing", "not", "no",
  "nor", "only", "own", "same", "so", "than", "too", "very", "can",
  "will", "just"
]);


export function readCSV(file, delimiter = ",") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      let text = e.target.result;

      
      text = text.replace(/^\uFEFF/, "");

      
      const rows = text
        .split(/\r?\n/)
        .filter(row => row.trim().length > 0)
        .map(row => row.split(delimiter));

      if (!rows.length) {
        return reject(new Error("CSV ist leer oder enthält keine gültigen Zeilen."));
      }

      const headers = rows[0];
      if (!headers) {
        return reject(new Error("CSV: Keine Header-Zeile gefunden."));
      }

      
      const timeIndex = headers.indexOf("time");
      const userIndex = headers.indexOf("user_name");
      const colorIndex = headers.indexOf("user_color");
      const messageIndex = headers.indexOf("message");

      
      if (timeIndex === -1 || userIndex === -1 || messageIndex === -1) {
        return reject(
          new Error("CSV muss mindestens 'time', 'user_name' und 'message' als Spalten enthalten.")
        );
      }

      
      const data = rows.slice(1).map(row => ({
        time: (row[timeIndex] || "").trim(),
        userName: (row[userIndex] || "").trim(),
        userColor: colorIndex !== -1 ? (row[colorIndex] || "").trim() : null,
        message: (row[messageIndex] || "").trim()
      }));

      
      const validData = data.filter(d => d.time && d.userName && d.message);
      if (!validData.length) {
        return reject(new Error("CSV: Keine gültigen Zeilen gefunden (time/userName/message fehlen)."));
      }

      resolve(validData);
    };

    reader.onerror = () => reject(new Error("Fehler beim Lesen der CSV-Datei."));
    reader.readAsText(file);
  });
}

export function analyzeChat(
  chatData,
  aggregationInterval,
  stdFactor,
  blacklist,
  chatDelay,
  contextBefore,
  contextAfter,
  slopeThreshold,
  useAndLogic,
  mergeThresholdMs = 60000
) {
  
  applyChatDelay(chatData, chatDelay);

  
  const intervals = generateIntervals(chatData, aggregationInterval);

  
  const intervalCounts = calculateIntervalCounts(intervals);
  const { mean, stdDev, threshold } = calculateThreshold(intervalCounts, stdFactor);

  
  const rawHighlightsCount = detectCountHighlights(
    intervalCounts,
    threshold,
    contextBefore,
    contextAfter,
    aggregationInterval,
    intervals
  );

  
  const rawHighlightsSlope = detectSlopeHighlights(
    intervalCounts,
    slopeThreshold,
    contextBefore,
    contextAfter,
    aggregationInterval,
    intervals
  );

  
  const combinedRaw = combineHighlights(rawHighlightsCount, rawHighlightsSlope, useAndLogic);

  
  const mergedHighlights = mergeHighlights(combinedRaw, mergeThresholdMs);

  
  addTopWordsToHighlights(mergedHighlights, blacklist);

  
  const finalHighlights = buildFinalHighlights(mergedHighlights);

  
  const topWordsOverall = calculateOverallTopWords(chatData, blacklist);

  
  const kpis = calculateKPIs(chatData);

  return {
    highlights: finalHighlights,
    topWordsOverall,
    kpis
  };
}




function applyChatDelay(chatData, chatDelay) {
  chatData.forEach(entry => {
    const originalUnix = parseInt(entry.time, 10);
    const correctedUnix = originalUnix - chatDelay;
    entry.time = new Date(correctedUnix * 1000);
  });
}


function generateIntervals(chatData, aggregationInterval) {
  const intervals = {};
  chatData.forEach(entry => {
    const intervalStart =
      Math.floor(entry.time.getTime() / (aggregationInterval * 1000)) *
      (aggregationInterval * 1000);

    if (!intervals[intervalStart]) {
      intervals[intervalStart] = [];
    }
    intervals[intervalStart].push(entry.message);
  });
  return intervals;
}


function calculateIntervalCounts(intervals) {
  const intervalCounts = Object.keys(intervals).map(intervalKey => ({
    interval: parseInt(intervalKey, 10),
    count: intervals[intervalKey].length
  }));
  intervalCounts.sort((a, b) => a.interval - b.interval);
  return intervalCounts;
}


function calculateThreshold(intervalCounts, stdFactor) {
  if (!intervalCounts.length) {
    return { mean: 0, stdDev: 0, threshold: 0 };
  }
  const mean =
    intervalCounts.reduce((sum, item) => sum + item.count, 0) / intervalCounts.length;
  const stdDev = Math.sqrt(
    intervalCounts.reduce((sum, item) => sum + Math.pow(item.count - mean, 2), 0) /
      intervalCounts.length
  );
  const threshold = mean + stdFactor * stdDev;
  return { mean, stdDev, threshold };
}

function detectCountHighlights(
  intervalCounts,
  threshold,
  contextBefore,
  contextAfter,
  aggregationInterval,
  intervals
) {
  return intervalCounts
    .filter(item => item.count > threshold)
    .map(item => {
      const startMS = item.interval - contextBefore * 1000;
      const endMS = item.interval + aggregationInterval * 1000 + contextAfter * 1000;
      return {
        startDate: new Date(startMS),
        endDate: new Date(endMS),
        messages: [...intervals[item.interval]]
      };
    });
}


function detectSlopeHighlights(
  intervalCounts,
  slopeThreshold,
  contextBefore,
  contextAfter,
  aggregationInterval,
  intervals
) {
  const rawHighlightsSlope = [];
  for (let i = 0; i < intervalCounts.length - 1; i++) {
    const current = intervalCounts[i];
    const next = intervalCounts[i + 1];
    const slope = next.count - current.count;
    if (slope >= slopeThreshold) {
      const startMS = next.interval - contextBefore * 1000;
      const endMS = next.interval + aggregationInterval * 1000 + contextAfter * 1000;
      rawHighlightsSlope.push({
        startDate: new Date(startMS),
        endDate: new Date(endMS),
        messages: [...intervals[next.interval]]
      });
    }
  }
  return rawHighlightsSlope;
}


function combineHighlights(rawHighlightsCount, rawHighlightsSlope, useAndLogic) {
  if (useAndLogic) {
    return intersectHighlights(rawHighlightsCount, rawHighlightsSlope);
  } else {
    return [...rawHighlightsCount, ...rawHighlightsSlope];
  }
}


function mergeHighlights(highlights, mergeThresholdMs = 60000) {
  if (!highlights.length) return [];

  highlights.sort((a, b) => a.startDate - b.startDate);
  const merged = [];
  let current = highlights[0];

  for (let i = 1; i < highlights.length; i++) {
    const next = highlights[i];
    const overlapOrClose =
      next.startDate.getTime() <= current.endDate.getTime() + mergeThresholdMs;

    if (overlapOrClose) {
      if (next.endDate > current.endDate) {
        current.endDate = next.endDate;
      }
      current.messages.push(...next.messages);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  return merged;
}


function intersectHighlights(listA, listB) {
  const results = [];
  listA.sort((a, b) => a.startDate - b.startDate);
  listB.sort((a, b) => a.startDate - b.startDate);

  for (const a of listA) {
    for (const b of listB) {
      const overlap = a.startDate <= b.endDate && b.startDate <= a.endDate;
      if (overlap) {
        const combinedStart = new Date(Math.min(a.startDate, b.startDate));
        const combinedEnd = new Date(Math.max(a.endDate, b.endDate));
        const messages = [...a.messages, ...b.messages];
        results.push({
          startDate: combinedStart,
          endDate: combinedEnd,
          messages
        });
      }
    }
  }
  return results;
}


function addTopWordsToHighlights(highlights, blacklist) {
  for (const h of highlights) {
    const wordCounts = {};
    for (const msg of h.messages) {
      const words = cleanText(msg).split(" ");
      for (const w of words) {
        if (w && !blacklist.has(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      }
    }
    h.topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    delete h.messages;
  }
}


function buildFinalHighlights(mergedHighlights) {
  return mergedHighlights.map(h => ({
    start: formatTimestampUTC(h.startDate),
    end: formatTimestampUTC(h.endDate),
    topWords: h.topWords
  }));
}


function calculateOverallTopWords(chatData, blacklist) {
  const overallWordCounts = {};
  for (const entry of chatData) {
    const words = cleanText(entry.message).split(" ");
    for (const w of words) {
      if (w && !blacklist.has(w)) {
        overallWordCounts[w] = (overallWordCounts[w] || 0) + 1;
      }
    }
  }
  return Object.entries(overallWordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}


function calculateKPIs(chatData) {
  if (!chatData.length) {
    return { activity: 0, shannonIndex: 0, avgLength: 0, combinedKPI: 0 };
  }

  
  const times = chatData.map(d => d.time.getTime());
  const minT = times.reduce((acc, curr) => (curr < acc ? curr : acc), Infinity);
  const maxT = times.reduce((acc, curr) => (curr > acc ? curr : acc), -Infinity);
  const totalMs = maxT - minT;
  const totalMinutes = totalMs / 60000;
  const activity = totalMinutes > 0 ? chatData.length / totalMinutes : 0;

  
  const shannonIndex = calculateShannonIndex(chatData);

  
  let totalChars = 0;
  for (const d of chatData) {
    totalChars += d.message.length;
  }
  const avgLength = totalChars / chatData.length;

  
  const normActivity = activity / 294;
  const normLength = avgLength / 30;
  

  
  const combinedKPI =
    0.6 * normActivity +
    0.3 * shannonIndex +
    0.1 * normLength;

  return { activity, shannonIndex, avgLength, combinedKPI };
}


function calculateShannonIndex(chatData) {
  const userCounts = new Map();
  for (const d of chatData) {
    const u = d.userName;
    userCounts.set(u, (userCounts.get(u) || 0) + 1);
  }
  const totalMessages = chatData.length;
  let H = 0;
  for (const count of userCounts.values()) {
    const p = count / totalMessages;
    H -= p * Math.log(p);
  }
  const n = userCounts.size;
  
  if (n > 1) {
    return H / Math.log(n);
  } else {
    return 1;
  }
}


export function cleanText(text) {
  return text.replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, " ").toLowerCase().trim();
}


function formatTimestampUTC(date) {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const seconds = date.getUTCSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}


export function generateJSON(data) {
  return JSON.stringify(data, null, 4);
}
