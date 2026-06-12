import { MetadataRoute } from 'next';
import { collections, dbConnect } from "@/lib/dbConnect";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://anti-ragging-bd.org';

  try {
    // Fetch all public reports from MongoDB
    const reports = await dbConnect(collections.REPORTS)
      .find(
        { isRaggingIncident: true },
        {
          projection: {
            postId: 1,
            createdAt: 1,
          },
        }
      )
      .toArray();

    // Map every report to its dynamic URL entry
    const reportEntries = reports.map((report) => ({
      url: `${baseUrl}/post/${report.postId}`,
      lastModified: report.createdAt ? new Date(report.createdAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Define static pages
    const staticEntries = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
    ];

    return [...staticEntries, ...reportEntries];
  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    // Fallback static entry on database connection error
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1.0,
      },
    ];
  }
}
