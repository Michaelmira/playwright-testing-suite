import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// register Handsontable's modules
registerAllModules();

export const ExcelEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { store, dispatch } = useGlobalReducer();
    const isNewFile = id === 'new';

    const [name, setName] = useState(isNewFile ? "default" : "");
    const [description, setDescription] = useState("");
    const [data, setData] = useState([
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ]);

    const hotRef = useRef(null);

    useEffect(() => {
        if (!isNewFile) {
            loadFile();
        }
    }, [id]);

    const loadFile = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/files/${id}`,
                {
                    headers: {
                        "Authorization": `Bearer ${store.auth.token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load file");
            }

            const file = await response.json();
            setName(file.name);
            setDescription(file.description);

            // Parse the content string into array data
            try {
                const parsedContent = JSON.parse(file.content);
                setData(Array.isArray(parsedContent) ? parsedContent : []);
            } catch (e) {
                console.error("Error parsing file content:", e);
                setData([]);
            }

        } catch (error) {
            dispatch({
                type: "files/setError",
                payload: "Failed to load file. Please try again."
            });
            navigate("/dashboard");
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            dispatch({
                type: "files/setError",
                payload: "File name is required"
            });
            return;
        }

        try {
            const currentData = hotRef.current.hotInstance.getData();

            // Clean the data and ensure all cells are strings
            const cleanData = currentData.map(row =>
                row.map(cell => {
                    if (cell === null || cell === undefined) return '';
                    return String(cell);
                })
            );

            const requestBody = {
                name: String(name),
                description: String(description),
                content: JSON.stringify(cleanData) // Send as JSON string
            };

            // Debug logging
            console.log("Request body:", requestBody);
            console.log("Request body JSON:", JSON.stringify(requestBody));

            const url = isNewFile
                ? `${import.meta.env.VITE_BACKEND_URL}/api/files`
                : `${import.meta.env.VITE_BACKEND_URL}/api/files/${id}`;

            const method = isNewFile ? "POST" : "PUT";

            console.log(`Making ${method} request to:`, url);

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth.token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            const responseText = await response.text();
            console.log("Raw response:", responseText);

            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse response as JSON:", e);
                throw new Error(`Server returned: ${responseText}`);
            }

            if (!response.ok) {
                console.error("Request failed:", errorData);
                throw new Error(errorData.msg || "Failed to save file");
            }

            navigate("/dashboard");

        } catch (error) {
            console.error("Save error:", error);
            dispatch({
                type: "files/setError",
                payload: error.message || "Failed to save file. Please try again."
            });
        }
    };

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col">
                    <h2>{isNewFile ? "Create New Excel File" : "Edit Excel File"}</h2>
                </div>
            </div>

            {store.files.error && (
                <div className="alert alert-danger" role="alert">
                    {store.files.error}
                </div>
            )}

            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">File Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter file name"
                            data-testid="file-name-input"
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter file description (optional)"
                            data-testid="file-description-input"
                        />
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col">
                    <HotTable
                        ref={hotRef}
                        data={data}
                        colHeaders={true}
                        rowHeaders={true}
                        height="400"
                        licenseKey="non-commercial-and-evaluation"
                        contextMenu={true}
                        className="htCustom"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <button
                        className="btn btn-secondary me-2"
                        onClick={() => navigate("/dashboard")}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        data-testid="save-file-button"
                    >
                        Save
                    </button>
                </div>
                <div className="col-auto">
                    <button
                        className="btn btn-info"
                        onClick={() => {
                            console.log("Current data:", hotRef.current?.hotInstance?.getData());
                            console.log("Name:", name);
                            console.log("Description:", description);
                            console.log("Auth token:", store.auth.token);
                        }}
                    >
                        Debug Info
                    </button>
                </div>
            </div>
        </div>
    );
};