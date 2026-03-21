import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type VTStats = {
  harmless?: number;
  malicious?: number;
  suspicious?: number;
  undetected?: number;
  timeout?: number;
};

type EngineRow = {
  engine: string;
  category: string;
  result: string | null;
  method?: string;
  engine_version?: string;
  engine_update?: string;
};

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function rankEngine(e: { category: string; result: string | null }) {
  const cat = (e.category ?? "").toLowerCase();
  const res = (e.result ?? "").toLowerCase();

  if (cat === "malicious" || res.includes("malware")) return 0;
  if (cat === "suspicious" || res.includes("spam")) return 1;
  if (cat === "harmless") return 2;
  if (res === "unrated") return 3;
  return 4;
}

async function waitForCompletedAnalysis(analysisId: string, apiKey: string) {
  for (let i = 0; i < 25; i++) {
    const res = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
      headers: { accept: "application/json", "x-apikey": apiKey },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      return {
        ok: false,
        status: res.status,
        payload: {
          error: "VirusTotal returned non-JSON while polling analysis",
          raw: text.slice(0, 400),
        },
      };
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        payload: {
          error: "VirusTotal analysis poll failed",
          details: data,
        },
      };
    }

    if (data?.data?.attributes?.status === "completed") {
      return { ok: true, data };
    }

    await delay(2000);
  }

  return {
    ok: false,
    status: 504,
    payload: { error: "VirusTotal analysis timed out" },
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const url = body?.url?.trim();

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing VIRUSTOTAL_API_KEY" },
      { status: 500 }
    );
  }

  const vtRes = await fetch("https://www.virustotal.com/api/v3/urls", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
      "x-apikey": apiKey,
    },
    body: new URLSearchParams({ url }),
    cache: "no-store",
  });

  const text = await vtRes.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "VirusTotal returned non-JSON", raw: text.slice(0, 400) },
      { status: vtRes.status }
    );
  }

  if (!vtRes.ok) {
    return NextResponse.json(
      { error: "VirusTotal request failed", details: data },
      { status: vtRes.status }
    );
  }

  const analysisId = data?.data?.id;
  if (!analysisId) {
    return NextResponse.json(
      { error: "VirusTotal did not return an analysis id" },
      { status: 500 }
    );
  }

  const analysis = await waitForCompletedAnalysis(analysisId, apiKey);

  if (!analysis.ok) {
    return NextResponse.json(analysis.payload, { status: analysis.status });
  }

  const attrs = analysis.data?.data?.attributes ?? {};
  const stats: VTStats | null = attrs?.stats ?? null;
  const results = attrs?.results ?? {};

  const engines: EngineRow[] = Object.entries(results).map(
    ([engine, r]: any) => ({
      engine,
      category: r?.category ?? "unknown",
      result: r?.result ?? null,
      method: r?.method,
      engine_version: r?.engine_version,
      engine_update: r?.engine_update,
    })
  );

  engines.sort((a, b) => {
    const ra = rankEngine(a);
    const rb = rankEngine(b);
    if (ra !== rb) return ra - rb;
    return a.engine.localeCompare(b.engine);
  });

  return NextResponse.json({
    url,
    scanId: analysisId,
    stats,
    engines,
  });
}