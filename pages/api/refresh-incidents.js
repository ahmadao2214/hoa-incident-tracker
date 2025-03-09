// This endpoint is meant to be called by a cron job to refresh the data
// Vercel cron jobs can be configured to call this endpoint periodically

export default async function handler(req, res) {
  // Check for a secret key to prevent unauthorized calls
  const secretKey = req.headers["x-cron-secret"] || req.query.secret;

  if (secretKey !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // For ISR (Incremental Static Regeneration) in Next.js
    // This revalidates the index page to show updated data
    if (res.revalidate) {
      await res.revalidate("/");
      console.log("Revalidated index page via cron job");
    }

    return res.status(200).json({
      success: true,
      message: "Data refresh triggered successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error refreshing data:", error);
    return res.status(500).json({
      success: false,
      message: "Error refreshing data",
      error: error.message,
    });
  }
}
