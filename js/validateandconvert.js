
function validateAndConvert(fileContent, fileType, delimiter = ",") {

    fileContent = removeBOM(fileContent);
  
    if (fileType === "json") {
      try {
        const jsonData = JSON.parse(fileContent);
        return validateAndConvertJSON(jsonData);
      } catch (error) {
        throw new Error("Ungültiges JSON-Format: " + error.message);
      }
    } else if (fileType === "csv") {
      return validateCSV(fileContent, delimiter);
    } else {
      throw new Error("Dateityp nicht unterstützt (erwartet: 'json' oder 'csv').");
    }
  }
  
  
  function validateAndConvertJSON(jsonData) {
    if (!jsonData.comments || !Array.isArray(jsonData.comments)) {
      throw new Error("Ungültiges JSON: 'comments' fehlt oder ist kein Array.");
    }
    const validComments = jsonData.comments.filter(comment => {
      const hasValidTime = comment.content_offset_seconds != null;
      const hasValidName = comment?.commenter?.display_name;
      const hasValidMessage = comment?.message?.body;
      return hasValidTime && hasValidName && hasValidMessage;
    });
    if (!validComments.length) {
      throw new Error("JSON enthält keine gültigen 'comments' (time/name/message fehlen).");
    }
    return convertJSONtoCSV({ comments: validComments });
  }
  
  
  function convertJSONtoCSV(jsonData) {
    const csvHeaders = "time,user_name,message\n";
    const csvRows = jsonData.comments.map(comment => {
      const time = comment.content_offset_seconds || "";
      const userName = (comment.commenter?.display_name || "").toLowerCase();
      const msg = (comment.message?.body || "").replace(/"/g, '""');
      return `${time},${userName},"${msg}"`;
    });
    return csvHeaders + csvRows.join("\n");
  }
  
  
  function validateCSV(csvContent, delimiter = ",") {
    const rows = csvContent.split(/\r?\n/).filter(r => r.trim().length > 0);
    if (!rows.length) {
      throw new Error("CSV ist leer oder enthält keine gültigen Zeilen.");
    }
    const headers = rows[0].split(delimiter);
    const requiredHeaders = ["time", "user_name", "message"];
    for (const rh of requiredHeaders) {
      if (!headers.includes(rh)) {
        throw new Error(`CSV: Fehlende Spalte '${rh}' (erwartet: time, user_name, message).`);
      }
    }
    const timeIndex = headers.indexOf("time");
    const userIndex = headers.indexOf("user_name");
    const msgIndex = headers.indexOf("message");
    const validRows = [];
    validRows.push(headers.join(delimiter));
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const columns = row.split(delimiter);
      if (columns.length < 3) continue;
      const time = columns[timeIndex]?.trim();
      const userName = columns[userIndex]?.trim();
      const message = columns[msgIndex]?.trim();
      if (!time || !userName || !message) continue;
      validRows.push(columns.join(delimiter));
    }
    if (validRows.length < 2) {
      throw new Error("CSV: Keine gültigen Datenzeilen gefunden.");
    }
    return validRows.join("\n");
  }
  
  
  function removeBOM(content) {
    return content.replace(/^\uFEFF/, "");
  }
  
  export { validateAndConvert };
  