import React from "react";

export default function LoadingError({ error }) {
  // ✅ Handle different types of error (string, object, Error instance)
  if (!error) return null;

  const renderErrorList = (err) => {
    if (typeof err === "string") {
      return <li>{err}</li>;
    }

    if (err instanceof Error) {
      return <li>{err.message}</li>;
    }

    if (typeof err === "object") {
      return Object.entries(err).map(([key, msg]) => (
        <li key={key}>
          <strong>{key}:</strong>{" "}
          {typeof msg === "object" ? JSON.stringify(msg) : String(msg)}
        </li>
      ));
    }

    return <li>{String(err)}</li>;
  };

  return (
    <div className="text-red-700 p-6 bg-red-50 border border-red-200 rounded-xl shadow-md">
      <h2 className="font-semibold text-lg mb-2">⚠️ Error Loading Data</h2>
      <ul className="list-disc pl-6 space-y-1 text-sm">
        {renderErrorList(error)}
      </ul>
    </div>
  );
}
