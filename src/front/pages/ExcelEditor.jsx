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

    const [name, setName] = useState("");
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
            setData(JSON.parse(file.content));

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

        const currentData = hotRef.current.hotInstance.getData();

        try {
            const url = isNewFile
                ? `${import.meta.env.VITE_BACKEND_URL}/api/files`
                : `${import.meta.env.VITE_BACKEND_URL}/api/files/${id}`;

            const method = isNewFile ? "POST" : "PUT";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.auth.token}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    content: currentData
                })
            });

            if (!response.ok) {
                throw new Error("Failed to save file");
            }

            navigate("/dashboard");

        } catch (error) {
            dispatch({
                type: "files/setError",
                payload: "Failed to save file. Please try again."
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
            </div>
        </div>
    );
}; 