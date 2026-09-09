"use client";

import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false, loading: () => <div className="flex h-[430px] items-center justify-center bg-[#e9e2d3] text-sm text-[#66756f]">Loading Sri Lanka map…</div> });

export default InteractiveMap;
