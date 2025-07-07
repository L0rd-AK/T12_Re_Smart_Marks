import React from 'react';

const PageLoader: React.FC = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-base-content/70">Loading page...</p>
        </div>
    </div>
);

export default PageLoader;
