"use client";
import React, { useState } from 'react';

export default function Upload() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
        return;
    }

    const handleFileUpload = async() => {
        if (!selectedFile) {
            alert('No file selected!');
            return;
        }
        const formData = new FormData();
        formData.append('image', selectedFile, selectedFile?.name || 'default.png');
        try {
        const response = await fetch('/functions/v1/scan-receipt', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            alert(`File uploaded successfully: ${JSON.stringify(result)}`);
        } else {
            const errorText = await response.text();
            alert(`Failed to upload file: ${errorText}`);
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred while uploading the file.');
    }
        return
    }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-3xl font-bold">Upload</h1>
                <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs hover:underline" />
                {selectedFile && (
                    <div className="mt-4">
                        <p className="text-lg">Selected file: {selectedFile.name}</p>
                        <p className="text-sm text-gray-500">Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                )}
                <button className="btn btn-primary mt-4" onClick={handleFileUpload}>
                    Upload File
                </button>
            </main>
        </div>
    );
    }