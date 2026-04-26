import { schedule } from "@netlify/functions";

export const handler = schedule("*/5 * * * *", async () => {
  console.log("Running sheetsRetryProcessor...");

  const baseUrl = process.env.URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/sheets/retry`, {
      method: "POST",
    });

    const data = await res.json();
    console.log("Retry response:", data);

    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error triggering retry route:", error);
    return {
      statusCode: 500,
    };
  }
});
