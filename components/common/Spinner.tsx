
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
};

export default Spinner;
