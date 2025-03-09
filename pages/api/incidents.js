import { getIncidents } from "../../lib/notion";

export default async function handler(req, res) {
  // Set CORS headers if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const incidents = await getIncidents();
    return res.status(200).json(incidents);
  } catch (error) {
    console.error("Error in incidents API:", error);
    return res.status(500).json({
      message: "Failed to fetch incidents",
      error: error.message,
    });
  }
}
