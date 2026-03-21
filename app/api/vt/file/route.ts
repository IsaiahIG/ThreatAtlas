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
  const incomingForm = await req.formData();
  const uploaded = incomingForm.get("file");
  const password = incomingForm.get("password");

  if (!uploaded || typeof uploaded === "string") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const file = uploaded as File;

  if (file.size > 32 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Files larger than 32MB require the VirusTotal upload_url flow" },
      { status: 400 }
    );
  }

  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing VIRUSTOTAL_API_KEY" },
      { status: 500 }
    );
  }

  const vtForm = new FormData();
  vtForm.append("file", new Blob([await file.arrayBuffer()]), file.name);

  if (typeof password === "string" && password.trim()) {
    vtForm.append("password", password.trim());
  }

  const vtRes = await fetch("https://www.virustotal.com/api/v3/files", {
    method: "POST",
    headers: {
      accept: "application/json",
      "x-apikey": apiKey,
    },
    body: vtForm,
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

  let reportAttrs: any = {};
  const itemLink = analysis.data?.data?.links?.item;

  if (itemLink) {
    const reportRes = await fetch(itemLink, {
      headers: { accept: "application/json", "x-apikey": apiKey },
      cache: "no-store",
    });

    const reportText = await reportRes.text();

    try {
      const reportData = JSON.parse(reportText);
      if (reportRes.ok) {
        reportAttrs = reportData?.data?.attributes ?? {};
      }
    } catch {}
  }

  return NextResponse.json({
    fileName: file.name,
    analysisId,
    meaningful_name: reportAttrs?.meaningful_name ?? file.name,
    type_description: reportAttrs?.type_description ?? null,
    size: typeof reportAttrs?.size === "number" ? reportAttrs.size : file.size,
    md5: reportAttrs?.md5 ?? null,
    sha1: reportAttrs?.sha1 ?? null,
    sha256: reportAttrs?.sha256 ?? null,
    stats,
    engines,
  });
}