import React from "react";

const DataTabale = ({ columns, data, loading }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {columns.map((col, index) => (
                            <th key={index} className="px-5 py-4 border-b">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="text-sm">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                                Loading data...
                            </td>
                        </tr>
                    ) : (!Array.isArray(data) || data.length === 0) ? ( 
                        <tr>
                            <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                                No data found.
                            </td>
                        </tr>
                    ) : (
                        data.map((result, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-5 py-4 border-b border-gray-100">
                                        {col.render ? col.render(result) : result[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTabale;