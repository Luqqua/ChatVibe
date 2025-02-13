# ChatVibe

**Twitch Chat Analysis Tool for Highlights & KPIs**

ChatVibe is a powerful tool designed to analyze Twitch chat logs and extract highlights, viral moments, and key performance indicators (KPIs) such as message length, chat activity, and community diversity. Optimize your content for platforms like YouTube Shorts and TikTok, and boost your cross-platform reach!

---

## Visit the Live Tool

This repository is **not** intended for cloning. To use ChatVibe, please visit our live tool at:

[**https://chatvibe.net**](https://chatvibe.net)

---

## Features

- **Highlight Detection:**  
  Automatically identifies notable chat moments based on changes in activity.

- **KPI Analysis:**  
  Provides essential metrics:
  - **Activity Score:** Number of messages per minute.
  - **Diversity Score:** Distribution of messages among chat participants.
  - **Average Message Length:** Average number of characters per message.
  - **Chat Engagement Index:** A weighted summary calculated as:  
    `0.6 × (Activity Score / 294) + 0.3 × (Diversity Score) + 0.1 × (Average Length / 30)`  
    *(Where 294 messages/min and 30 characters serve as median benchmarks for top streamers.)*

- **Customizable Settings:**  
  Adjust parameters such as observation interval, activity deviation thresholds, and detection mode (OR/AND) to tailor the analysis to your needs.

---

## How It Works

ChatVibe processes Twitch chat logs provided in CSV or JSON formats to detect significant changes in chat activity using the following parameters:

- **Observation Interval:**  
  The time frame (recommended: 60 seconds) over which chat activity is measured.

- **Activity Deviation from Average:**  
  The factor by which current chat activity must exceed the average (e.g., a factor of 2 for double the average).

- **Detection Mode:**  
  - **OR Mode:** A highlight is detected if either a deviation from the previous interval or from the average is observed.
  - **AND Mode:** A highlight is detected only if both conditions are met.

- **Activity Deviation from Previous Interval:**  
  The difference in the number of messages between consecutive intervals (e.g., an increase of 10 messages).

---

## Supported File Formats

To use ChatVibe, you need a chat log file in CSV or JSON format.

### CSV Format

The CSV file should contain at least the following columns (in lowercase with underscores):

- `time` – Seconds since the start of the stream (numeric value)
- `user_name` – Name of the chat user
- `message` – Content of the chat message

### JSON Format

The JSON file should include a `comments` field that is an array. Each element in the array must contain:

- `content_offset_seconds` – Seconds since the start of the stream
- `commenter.display_name` – Display name of the user
- `message.body` – Content of the chat message

*Note:* If these fields are missing, the file cannot be analyzed.

---

## Use Cases

- **Highlight Identification:**  
  Quickly locate key moments in the chat to review later in your VOD.

- **Streaming Optimization:**  
  Analyze peak chat times and frequently discussed topics to enhance your content.

- **Content Creation:**  
  Leverage insights to create engaging clips for TikTok, YouTube Shorts, and more.

- **Research & Marketing:**  
  Conduct in-depth analyses of Twitch communities to support research or marketing strategies.

---

## About the Creator

ChatVibe was developed by [Luqqua](https://github.com/Luqqua).  
For questions or feedback, feel free to contact: [Luqqua@proton.me](mailto:Luqqua@proton.me).

---

© 2025 All rights reserved.
