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

function rankEngine(e: { category: string; result: string | null }) {
  const cat = (e.category ?? "").toLowerCase();
  const res = (e.result ?? "").toLowerCase();

  if (cat === "malicious" || res.includes("malware")) return 0;
  if (cat === "suspicious" || res.includes("spam")) return 1;
  if (cat === "harmless") return 2;
  if (res === "unrated") return 3;
  return 4;
}

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get("hash");
  if (!hash) {
    return NextResponse.json({ error: "Missing hash" }, { status: 400 });
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing VIRUSTOTAL_API_KEY" },
      { status: 500 }
    );
  }

  const vtUrl = `https://www.virustotal.com/api/v3/files/${encodeURIComponent(hash)}`;

  const vtRes = await fetch(vtUrl, {
    headers: { accept: "application/json", "x-apikey": apiKey },
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

  const attrs = data?.data?.attributes ?? {};
  const stats: VTStats | null = attrs?.last_analysis_stats ?? null;
  const results = attrs?.last_analysis_results ?? {};

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
    hash,
    meaningful_name: attrs?.meaningful_name ?? null,
    type_description: attrs?.type_description ?? null,
    size: typeof attrs?.size === "number" ? attrs.size : null,
    md5: attrs?.md5 ?? null,
    sha1: attrs?.sha1 ?? null,
    sha256: attrs?.sha256 ?? null,
    stats,
    engines,
  });
}