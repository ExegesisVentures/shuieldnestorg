"use client";
import { useState } from "react";

export default function ManualAddressInput({ onAdd }: { onAdd: (addr: string, label?: string)=>void }) {
  const [addr, setAddr] = useState(""); const [label, setLabel] = useState("");
  return (
    <div className="space-y-2">
      <input className="border p-2 w-full" placeholder="Coreum address" value={addr} onChange={e=>setAddr(e.target.value)} />
      <input className="border p-2 w-full" placeholder="Label (optional)" value={label} onChange={e=>setLabel(e.target.value)} />
      <button className="px-3 py-2 bg-black text-white rounded" onClick={()=>onAdd(addr, label)}>Add address</button>
    </div>
  );
}

