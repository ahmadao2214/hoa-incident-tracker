import IncidentTimeline from "../components/IncidentTimeline";
import Head from "next/head";

export default function Home() {
  return (
    <div>
      <Head>
        <title>HOA Incident Tracker</title>
        <meta name="description" content="Track and manage HOA incidents" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <IncidentTimeline />
      </main>
    </div>
  );
}
