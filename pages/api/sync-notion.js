import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed` });
  }

  try {
    const buf = await buffer(req);
    const rawBody = buf.toString("utf8");

    // Log the webhook payload for debugging
    console.log(
      "Received update from Notion:",
      rawBody.substring(0, 200) + "..."
    );

    // Here you could add verification of Notion's webhook signature
    // if Notion provides one in the future

    // For ISR (Incremental Static Regeneration) in Next.js
    // This revalidates the index page to show updated data
    try {
      // This is only available in production
      if (res.revalidate) {
        await res.revalidate("/");
        console.log("Revalidated index page");
      }
    } catch (err) {
      console.error("Error revalidating:", err);
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res
      .status(500)
      .json({ message: "Error processing webhook", error: error.message });
  }
}
