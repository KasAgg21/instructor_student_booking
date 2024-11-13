import React from 'react';
import BrowseInstructor from './BrowseInstructor';

const StudentDashboard = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
            <BrowseInstructor />
        </div>
    );
};

export default StudentDashboard;
