import type { WebSearchResult } from "@/inngest/types";

export async function fetchWebSearch(query: string): Promise<WebSearchResult[]> {
  if (!process.env.SERP_API_KEY) {
    console.log("SERP_API_KEY not set, skipping web search");
    return [];
  }

  try {
    // Using SerpAPI for web search
    const response = await fetch(
      `https://serpapi.com/search?q=${encodeURIComponent(query)}&api_key=${process.env.SERP_API_KEY}&num=5`
    );

    if (!response.ok) {
      console.error("SerpAPI error:", response.statusText);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();

    return (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.organic_results?.map((result: any) => ({
        source: "websearch" as const,
        text: result.snippet || "",
        title: result.title || "Untitled",
        url: result.link || "",
        relevance: 0,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching from web search:", error);
    return [];
  }
}

