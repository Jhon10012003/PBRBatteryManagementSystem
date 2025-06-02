import React from 'react';
import { Link } from 'react-router-dom';
import { Battery } from 'lucide-react';
import BatteryStatusBadge from '../../components/BatteryStatusBadge';
import BatteryChargeIndicator from '../../components/BatteryChargeIndicator';
import BatteryHealthIndicator from '../../components/BatteryHealthIndicator';

const BatteryList = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Battery Inventory</h1>
        </div>
        <Link
          to="/batteries/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add New Battery
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Charge Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Placeholder row - replace with actual data mapping */}
              <tr>
                <td className="whitespace-nowrap px-6 py-4">BAT-001</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <BatteryStatusBadge status="active" />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <BatteryChargeIndicator percentage={85} />
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <BatteryHealthIndicator health={90} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  2024-01-20 15:30
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <Link
                    to="/batteries/BAT-001"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatteryList;