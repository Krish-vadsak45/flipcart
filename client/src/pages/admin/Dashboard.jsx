import React from "react";

const Dashboard = () => {
  return (
    // Replicating admin_panel/index.php structure
    // Content Wrapper is handled by Layout, this is the inner container
    <div className="w-full px-4 mt-3">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          {/* Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Card Body */}
            <div className="p-4 pt-3">
              {/* Welcome Message */}
              <h3 className="text-center text-2xl font-medium text-gray-700">
                Welcome!
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
