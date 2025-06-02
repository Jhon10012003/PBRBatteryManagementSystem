import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { Battery, Plus, Search } from 'lucide-react';
import BatteryStatusBadge from '../../components/BatteryStatusBadge';
import BatteryChargeIndicator from '../../components/BatteryChargeIndicator';
import BatteryHealthIndicator from '../../components/BatteryHealthIndicator';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

interface Battery {
  _id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: string;
  healthStatus: number;
  currentCharge: number;
  lastCheckedDate: string;
}

const BatteryList = () => {
  const [batteries, setBatteries] = useState<Battery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBatteries = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/batteries');
        setBatteries(data.batteries);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch batteries');
        toast.error('Failed to fetch batteries');
      } finally {
        setLoading(false);
      }
    };

    fetchBatteries();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this battery?')) {
      return;
    }

    try {
      await axios.delete(`/api/batteries/${id}`);
      setBatteries(batteries.filter(battery => battery._id !== id));
      toast.success('Battery deleted successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete battery');
    }
  };

  const filteredBatteries = batteries.filter((battery) =>
    battery.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    battery.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    battery.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

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
          <Plus className="mr-2 h-4 w-4 inline" />
          Add New Battery
        </Link>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search batteries..."
              className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Model
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
              {filteredBatteries.map((battery) => (
                <tr key={battery._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <Battery className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">{battery.serialNumber}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{battery.model}</div>
                      <div className="text-sm text-gray-500">{battery.manufacturer}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <BatteryStatusBadge status={battery.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <BatteryChargeIndicator charge={battery.currentCharge} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <BatteryHealthIndicator health={battery.healthStatus} size="sm" />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(battery.lastCheckedDate).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/batteries/${battery._id}`}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        as={Link}
                        to={`/batteries/${battery._id}/edit`}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(battery._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BatteryList;