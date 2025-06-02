import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-toastify';

interface Battery {
  _id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ShipmentFormData {
  shipmentNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  estimatedArrival: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  currentLocation: string;
  batteries: string[];
  specialInstructions: string;
  hazardClass: string;
  customsInformation: string;
  assignedTo: string;
}

const ShipmentEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [availableBatteries, setAvailableBatteries] = useState<Battery[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<ShipmentFormData>({
    shipmentNumber: '',
    origin: '',
    destination: '',
    departureDate: '',
    estimatedArrival: '',
    carrier: '',
    trackingNumber: '',
    status: 'Preparing',
    currentLocation: '',
    batteries: [],
    specialInstructions: '',
    hazardClass: 'Class 9',
    customsInformation: '',
    assignedTo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [shipmentRes, batteriesRes, usersRes] = await Promise.all([
          axios.get(`/api/shipments/${id}`),
          axios.get('/api/batteries?status=Available'),
          axios.get('/api/users')
        ]);

        const shipment = shipmentRes.data;
        setFormData({
          shipmentNumber: shipment.shipmentNumber,
          origin: shipment.origin,
          destination: shipment.destination,
          departureDate: shipment.departureDate.split('T')[0],
          estimatedArrival: shipment.estimatedArrival.split('T')[0],
          carrier: shipment.carrier,
          trackingNumber: shipment.trackingNumber || '',
          status: shipment.status,
          currentLocation: shipment.currentLocation,
          batteries: shipment.batteries.map((b: Battery) => b._id),
          specialInstructions: shipment.specialInstructions || '',
          hazardClass: shipment.hazardClass,
          customsInformation: shipment.customsInformation || '',
          assignedTo: shipment.assignedTo?._id || '',
        });

        setAvailableBatteries([
          ...shipment.batteries,
          ...batteriesRes.data.batteries
        ]);
        setUsers(usersRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch shipment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.put(`/api/shipments/${id}`, formData);
      toast.success('Shipment updated successfully');
      navigate(`/shipments/${id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update shipment');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBatterySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBatteries = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      batteries: selectedBatteries
    }));
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit Shipment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update shipment information and tracking details
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Shipment Number
              </label>
              <input
                type="text"
                name="shipmentNumber"
                value={formData.shipmentNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Preparing">Preparing</option>
                <option value="In Transit">In Transit</option>
                <option value="Delayed">Delayed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Origin
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destination
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Location
              </label>
              <input
                type="text"
                name="currentLocation"
                value={formData.currentLocation}
                onChange={handleChange}
                className="mt-1  block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Carrier
              </label>
              <input
                type="text"
                name="carrier"
                value={formData.carrier}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tracking Number
              </label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Departure Date
              </label>
              <input
                type="date"
                name="departureDate"
                value={formData.departureDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Arrival
              </label>
              <input
                type="date"
                name="estimatedArrival"
                value={formData.estimatedArrival}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hazard Class
              </label>
              <select
                name="hazardClass"
                value={formData.hazardClass}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Class 9">Class 9 - Miscellaneous</option>
                <option value="Class 8">Class 8 - Corrosive</option>
                <option value="Class 4.1">Class 4.1 - Flammable Solids</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Batteries
            </label>
            <select
              multiple
              name="batteries"
              value={formData.batteries}
              onChange={handleBatterySelection}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              size={5}
            >
              {availableBatteries.map(battery => (
                <option key={battery._id} value={battery._id}>
                  {battery.serialNumber} - {battery.model} ({battery.manufacturer})
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              Hold Ctrl/Cmd to select multiple batteries
            </p>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customs Information
              </label>
              <textarea
                name="customsInformation"
                value={formData.customsInformation}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentEdit;