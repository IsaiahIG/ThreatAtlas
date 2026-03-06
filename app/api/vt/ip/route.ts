import {NextRequest, NextResponse} from "next/server";

export async function GET (req:NextRequest){

    const ip = req.nextUrl.searchParams.get("ip");

    if(!ip) {
        return NextResponse.json({error: "Missing ip"}, {status:400});
    }


    const apiKey = process.env.VIRUSTOTAL_API_KEY;

    if(!apiKey){
        return NextResponse.json({error: "Server missing VIRUSTOTAL_API_KEY"},
            {status:500}
        );

    }

            const vtUrl = `https//www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(ip)}`;
            const vtRes = await fetch(vtUrl,{
                method: "GET",
                headers: {
                    accept: "application/json", "x-apikey" :apiKey,

                },
            cache:"no-store"

            });

            const data = await vtRes.json();
            return NextResponse.json(data,{status:vtRes.status});

}