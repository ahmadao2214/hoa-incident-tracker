import { Client } from "@notionhq/client";

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function getIncidents() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    // Transform Notion data to match your component's expected format
    return response.results.map((page) => {
      const properties = page.properties;

      return {
        Incident: properties.Incident?.title?.[0]?.plain_text || "",
        Date: properties.Date?.date?.start || "",
        Type: properties.Type?.select?.name || "",
        Location: properties.Location?.select?.name || "",
        Unit:
          properties.Unit?.number ||
          properties.Unit?.rich_text?.[0]?.plain_text ||
          "",
        "Resident Name":
          properties["Resident Name"]?.rich_text?.[0]?.plain_text || "Unknown",
        Notes: properties.Notes?.rich_text?.[0]?.plain_text || "",
        "Estimated Value": properties["Estimated Value"]?.number || null,
      };
    });
  } catch (error) {
    console.error("Error fetching data from Notion:", error);
    throw new Error(`Failed to fetch incidents: ${error.message}`);
  }
}
