import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { Battery, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { toast } from 'react-toastify';

interface BatteryFormData {
  serialNumber: string;
  model: string;
  manufacturer: string;
  capacity: number;
  capacityUnit: 'mAh' | 'Wh';
  voltage: number;
  chemistry: string;
  manufactureDate: string;
  status: string;
  healthStatus: number;
  cycleCount: number;
  currentCharge: number;
  location: string;
  notes: string;
}

const BatteryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BatteryFormData>({
    serialNumber: '',
    model: '',
    manufacturer: '',
    capacity: 0,
    capacityUnit: 'Wh',
    voltage: 0,
    chemistry: 'Li-ion',
    manufactureDate: '',
    status: 'Available',
    healthStatus: 100,
    cycleCount: 0,
    currentCharge: 100,
    location: 'Warehouse',
    notes: '',
  });

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        if (id === 'new') {
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`/api/batteries/${id}`);
        setFormData({
          ...data,
          manufactureDate: new Date(data.manufactureDate).toISOString().split('T')[0],
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch battery data');
        toast.error('Failed to fetch battery data');
      } finally {
        setLoading(false);
      }
    };

    fetchBattery();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (id === 'new') {
        await axios.post('/api/batteries', formData);
        toast.success('Battery created successfully');
      } else {
        await axios.put(`/api/batteries/${id}`, formData);
        toast.success('Battery updated successfully');
      }
      navigate('/batteries');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save battery');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Battery className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            {id === 'new' ? 'Add New Battery' : 'Edit Battery'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Chemistry</label>
              <select
                name="chemistry"
                value={formData.chemistry}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Li-ion">Lithium-ion</option>
                <option value="LiFePO4">LiFePO4</option>
                <option value="Lead-Acid">Lead-Acid</option>
                <option value="NiMH">NiMH</option>
                <option value="NiCd">NiCd</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Capacity</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <select
                  name="capacityUnit"
                  value={formData.capacityUnit}
                  onChange={handleChange}
                  className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="Wh">Wh</option>
                  <option value="mAh">mAh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Voltage</label>
              <input
                type="number"
                name="voltage"
                value={formData.voltage}
                onChange={handleChange}
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacture Date</label>
              <input
                type="date"
                name="manufactureDate"
                value={formData.manufactureDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="In Transit">In Transit</option>
                <option value="Installed">Installed</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Defective">Defective</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Health Status (%)</label>
              <input
                type="number"
                name="healthStatus"
                value={formData.healthStatus}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Charge (%)</label>
              <input
                type="number"
                name="currentCharge"
                value={formData.currentCharge}
                onChange={handleChange}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cycle Count</label>
              <input
                type="number"
                name="cycleCount"
                value={formData.cycleCount}
                onChange={handleChange}
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/batteries')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {id === 'new' ? 'Create Battery' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BatteryEdit;