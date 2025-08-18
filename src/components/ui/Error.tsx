import React, { useState } from 'react'

export default function ErrorMessage({errorMessage}: {errorMessage: string}) {
    const [error, setError] = useState(errorMessage);

    return (
        error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
                <button 
                    onClick={() => setError('')}
                    className="float-right font-bold text-red-700 hover:text-red-900"
                >
                    ×
                </button>
            </div>
        )
    )
}
