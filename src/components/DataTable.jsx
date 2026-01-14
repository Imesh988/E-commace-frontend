import React from "react";

const DataTabale = ({columns , data , loading}) => {
    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm
        border border-gray-100">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-semibold
                    text-gray-500 uppercase tracking-wider">

                        {columns.map((col, index) => (
                            <th key={index} className="px-5 py-4 border-b">
                                {col.header}
                            </th>
                        ))}
                        
                    </tr>
                </thead>

                <tbody className="text-sm">
                    {loading ? (
                        <tr></tr>
                    )}                
                </tbody>
            </table>
        </div>
    )
}

export default DataTabale;