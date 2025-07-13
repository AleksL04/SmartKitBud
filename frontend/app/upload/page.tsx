"use client";
import React, { useState } from 'react';

export default function Upload() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        return;
    }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <h1 className="text-3xl font-bold">Upload</h1>
                <input type="file" onChange={handleFileChange} className="file-input file-input-bordered w-full max-w-xs" />
            </main>
        </div>
    );
    }