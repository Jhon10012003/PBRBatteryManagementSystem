import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Battery, Edit } from 'lucide-react';
import BatteryStatusBadge from '../../components/BatteryStatusBadge';
import BatteryChargeIndicator from '../../components/BatteryChargeIndicator';
import BatteryHealthIndicator from '../../components/BatteryHealthIndicator';

const BatteryDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Battery Details</h1>
        </div>
        <Link
          to={`/batteries/${id}/edit`}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Edit className="h-4 w-4" />
          Edit Battery
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Battery ID</label>
              <p className="mt-1 text-gray-900">{id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <BatteryStatusBadge status="active" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Charge Level</label>
              <div className="mt-1">
                <BatteryChargeIndicator percentage={85} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Health</label>
              <div className="mt-1">
                <BatteryHealthIndicator health={90} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Technical Specifications</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Capacity</label>
              <p className="mt-1 text-gray-900">5000mAh</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Voltage</label>
              <p className="mt-1 text-gray-900">3.7V</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Chemistry</label>
              <p className="mt-1 text-gray-900">Lithium-ion</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Manufacturer</label>
              <p className="mt-1 text-gray-900">Example Battery Co.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryDetail;