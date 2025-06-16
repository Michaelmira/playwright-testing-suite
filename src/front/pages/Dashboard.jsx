import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Dashboard = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    // Load files when component mounts
    useEffect(() => {
        loadFiles();
    }, [store.files.sortField, store.files.sortOrder]);

    const loadFiles = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/files?sort_field=${store.files.sortField}&sort_order=${store.files.sortOrder}`,
                {
                    headers: {
                        "Authorization": `Bearer ${store.auth.token}`
                    }
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    dispatch({ type: "auth/logout" });
                    navigate("/");
                    return;
                }
                throw new Error("Failed to load files");
            }

            const data = await response.json();
            dispatch({ type: "files/setList", payload: data });

        } catch (error) {
            dispatch({
                type: "files/setError",
                payload: "Failed to load files. Please try again."
            });
        }
    };

    const handleSort = (field) => {
        const newOrder = field === store.files.sortField && store.files.sortOrder === 'asc' ? 'desc' : 'asc';
        dispatch({
            type: "files/setSorting",
            payload: { sortField: field, sortOrder: newOrder }
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/files/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${store.auth.token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete file");
            }

            // Reload files after deletion
            loadFiles();

        } catch (error) {
            dispatch({
                type: "files/setError",
                payload: "Failed to delete file. Please try again."
            });
        }
    };

    const handleLogout = () => {
        dispatch({ type: "auth/logout" });
        navigate("/");
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Excel Files</h2>
                <div>
                    <button
                        className="btn btn-success me-2"
                        onClick={() => navigate("/excel/new")}
                        data-testid="create-file-button"
                    >
                        Create New File
                    </button>
                    <button
                        className="btn btn-outline-danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {store.files.error && (
                <div className="alert alert-danger" role="alert">
                    {store.files.error}
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th
                                onClick={() => handleSort('name')}
                                style={{ cursor: 'pointer' }}
                                data-testid="sort-by-name"
                            >
                                Name {store.files.sortField === 'name' && (
                                    store.files.sortOrder === 'asc' ? '↑' : '↓'
                                )}
                            </th>
                            <th>Description</th>
                            <th
                                onClick={() => handleSort('date')}
                                style={{ cursor: 'pointer' }}
                                data-testid="sort-by-date"
                            >
                                Created Date {store.files.sortField === 'date' && (
                                    store.files.sortOrder === 'asc' ? '↑' : '↓'
                                )}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {store.files.list.map((file) => (
                            <tr key={file.id}>
                                <td>{file.name}</td>
                                <td>{file.description}</td>
                                <td>{new Date(file.created_date).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-primary me-2"
                                        onClick={() => navigate(`/excel/${file.id}`)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(file.id)}
                                        data-testid={`delete-file-${file.id}`}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {store.files.list.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center">
                                    No files found. Create your first Excel file!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 