import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axiosConfig';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Battery, Package, AlertCircle, CheckCircle, Activity } from 'lucide-react';
import BatteryStatusBadge from '../components/BatteryStatusBadge';
import ShipmentStatusBadge from '../components/ShipmentStatusBadge';
import BatteryChargeIndicator from '../components/BatteryChargeIndicator';

interface DashboardData {
  batteryCount: number;
  shipmentCount: number;
  criticalBatteries: any[];
  activeShipments: any[];
  alertsCount: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>({
    batteryCount: 0,
    shipmentCount: 0,
    criticalBatteries: [],
    activeShipments: [],
    alertsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get counts
        const [batteriesRes, shipmentsRes, criticalRes, alertsRes] = await Promise.all([
          axios.get('/api/batteries?limit=1'),
          axios.get('/api/shipments?limit=1'),
          axios.get('/api/batteries/critical'),
          axios.get('/api/shipments/alerts'),
        ]);
        
        // Get active shipments
        const activeShipmentsRes = await axios.get('/api/shipments?status=In Transit&limit=5');
        
        setData({
          batteryCount: batteriesRes.data.total || 0,
          shipmentCount: shipmentsRes.data.total || 0,
          criticalBatteries: criticalRes.data.slice(0, 5) || [],
          activeShipments: activeShipmentsRes.data.shipments || [],
          alertsCount: alertsRes.data.length || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" as={Link} to="/batteries">
            View All Batteries
          </Button>
          <Button variant="primary" as={Link} to="/shipments">
            View All Shipments
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Battery className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{data.batteryCount}</h3>
              <p className="text-sm text-gray-500">Total Batteries</p>
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{data.shipmentCount}</h3>
              <p className="text-sm text-gray-500">Total Shipments</p>
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{data.criticalBatteries.length}</h3>
              <p className="text-sm text-gray-500">Critical Batteries</p>
            </div>
          </div>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{data.alertsCount}</h3>
              <p className="text-sm text-gray-500">Active Alerts</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Critical Batteries */}
        <Card title="Batteries Requiring Attention">
          {data.criticalBatteries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.criticalBatteries.map((battery) => (
                <div key={battery._id} className="flex items-center py-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {battery.model} - {battery.serialNumber}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {battery.manufacturer} | <span className="font-medium">Health: {battery.healthStatus}%</span>
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <BatteryStatusBadge status={battery.status} />
                    <BatteryChargeIndicator charge={battery.currentCharge} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      as={Link}
                      to={`/batteries/${battery._id}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center">
              <CheckCircle className="mb-2 h-8 w-8 text-green-500" />
              <p className="text-gray-500">No critical batteries at the moment</p>
            </div>
          )}
        </Card>

        {/* Active Shipments */}
        <Card title="Active Shipments">
          {data.activeShipments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {data.activeShipments.map((shipment) => (
                <div key={shipment._id} className="flex items-center py-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {shipment.shipmentNumber}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {shipment.origin} → {shipment.destination}
                    </p>
                    <p className="text-xs text-gray-400">
                      Carrier: {shipment.carrier}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <ShipmentStatusBadge status={shipment.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      as={Link}
                      to={`/shipments/${shipment._id}`}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center">
              <Package className="mb-2 h-8 w-8 text-blue-500" />
              <p className="text-gray-500">No active shipments at the moment</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;