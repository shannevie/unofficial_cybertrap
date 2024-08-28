"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import { Button } from "@/components/ui/button";

export default function SelectScan() {
    const [selectedScan, setSelectedScan] = useState("");
    const router = useRouter();
    const target = new URLSearchParams(window.location.search).get("target");

    const handleSelection = (value: string) => {
        setSelectedScan(value);
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        alert(`Selected scan engine: ${selectedScan} for target: ${target}`);
    };

    return (
        <div className="flex items-center justify-center h-screen">
    <div className="p-8 bg-white shadow-lg rounded-md flex-1 flex flex-col max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Select Scan Engine</h2>
        <p className="mb-4 text-gray-600">Target: {target}</p>
        <form onSubmit={handleSubmit} className="space-y-4 flex-grow">
            <RadioGroup value={selectedScan} onValueChange={handleSelection} className="space-y-4">
                {["Full Scan", "Nulcei Scan", "Port Scan", "Subdomain Scan", "Vulnerability Scan", "reNgine Recommended"].map(scan => (
                    <div key={scan} className="flex items-center space-x-3">
                        <RadioGroupItem id={scan} value={scan} className="text-indigo-600 border-gray-300 rounded"/>
                        <label htmlFor={scan} className="text-gray-700">{scan}</label>
                    </div>
                ))}
            </RadioGroup>
            <Button
                type="submit"
                className="w-full py-2 mt-4 text-white bg-green-600 rounded-md hover:bg-green-700"
                disabled={!selectedScan} 
            >
                Submit
            </Button>
        </form>
    </div>
</div>



    );
}
