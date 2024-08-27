import { useState } from "react";

export default function SelectEngine() {
    const [selectedScan, setSelectedScan] = useState("");

    const handleSelection = (event:any) => {
        setSelectedScan(event.target.value);
    };

    const handleSubmit = (event:any) => {
        event.preventDefault();
        alert(`Selected scan engine: ${selectedScan}`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Select scan engine when initiating scan</h2>
            <form onSubmit={handleSubmit}>
                <select 
                    value={selectedScan} 
                    onChange={handleSelection}
                    style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
                >
                    <option value="" disabled>Select scan engine</option>
                    <option value="Full Scan">Full Scan</option>
                    <option value="OSINT">OSINT</option>
                    <option value="Port Scan">Port Scan</option>
                    <option value="Subdomain Scan">Subdomain Scan</option>
                    <option value="Vulnerability Scan">Vulnerability Scan</option>
                    <option value="reNgine Recommended">reNgine Recommended</option>
                </select>
                <button 
                    type="submit" 
                    style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
                >
                    Submit
                </button>
            </form>
        </div>
    );
}
