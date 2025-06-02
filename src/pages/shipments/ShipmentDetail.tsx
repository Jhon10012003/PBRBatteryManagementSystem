import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ShipmentStatusBadge from '../../components/ShipmentStatusBadge';
import BatteryStatusBadge from '../../components/BatteryStatusBadge';
import { Package, MapPin, Calendar, Truck, Box, AlertTriangle, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Battery {
  _id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: string;
  healthStatus: number;
  currentCharge: number;
}

interface StatusUpdate {
  status: string;
  location: string;
  notes: string;
  timestamp: string;
  updatedBy: {
    name: string;
  };
}

interface EnvironmentalLog {
  value: number;
  timestamp: string;
  isAlert: boolean;
}

interface ShockEvent {
  magnitude: number;
  timestamp: string;
  isAlert: boolean;
}

interface Shipment {
  _id: string;
  shipmentNumber: string;
  origin: string;
  destination: string;
  status: string;
  carrier: string;
  trackingNumber: string;
  currentLocation: string;
  batteries: Battery[];
  departureDate: string;
  estimatedArrival: string;
  actualArrival: string;
  specialInstructions: string;
  hazardClass: string;
  customsInformation: string;
  temperatureLogs: EnvironmentalLog[];
  humidityLogs: EnvironmentalLog[];
  shockEvents: ShockEvent[];
  statusUpdates: StatusUpdate[];
  assignedTo: {
    name: string;
    email: string;
  };
}

const ShipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/shipments/${id}`);
        setShipment(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch shipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !shipment) {
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

  const hasAlerts = shipment.temperatureLogs.some(log => log.isAlert) ||
    shipment.humidityLogs.some(log => log.isAlert) ||
    shipment.shockEvents.some(event => event.isAlert);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Shipment {shipment.shipmentNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage shipment details
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button
            variant="primary"
            as={Link}
            to={`/shipments/${id}/edit`}
          >
            Edit Shipment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Info */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Shipment Information</h3>
              <ShipmentStatusBadge status={shipment.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Origin</label>
                <div className="mt-1 flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{shipment.origin}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Destination</label>
                <div className="mt-1 flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{shipment.destination}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Departure Date</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{format(new Date(shipment.departureDate), 'PPP')}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Estimated Arrival</label>
                <div className="mt-1 flex items-center">
                  <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{format(new Date(shipment.estimatedArrival), 'PPP')}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Carrier</label>
                <div className="mt-1 flex items-center">
                  <Truck className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{shipment.carrier}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Tracking Number</label>
                <div className="mt-1 flex items-center">
                  <Package className="mr-1 h-4 w-4 text-gray-400" />
                  <span>{shipment.trackingNumber || 'N/A'}</span>
                </div>
              </div>
            </div>

            {hasAlerts && (
              <div className="mt-4 rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Environmental Alerts Detected
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      This shipment has experienced conditions outside normal parameters.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Environmental Data */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Environmental Monitoring</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Temperature History</h4>
                <div className="mt-2 h-32 bg-gray-50">
                  {/* Temperature chart would go here */}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Humidity History</h4>
                <div className="mt-2 h-32 bg-gray-50">
                  {/* Humidity chart would go here */}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Shock Events</h4>
                <div className="mt-2">
                  {shipment.shockEvents.length > 0 ? (
                    <div className="space-y-2">
                      {shipment.shockEvents.map((event, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between rounded-md p-2 ${
                            event.isAlert ? 'bg-red-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <Activity className={`h-4 w-4 mr-2 ${
                              event.isAlert ? 'text-red-500' : 'text-gray-500'
                            }`} />
                            <span className="text-sm">
                              {event.magnitude}g force
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(event.timestamp), 'PPp')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shock events recorded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Batteries */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Batteries ({shipment.batteries.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipment.batteries.map((battery) => (
                    <tr key={battery._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Box className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {battery.serialNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {battery.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {battery.manufacturer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <BatteryStatusBadge status={battery.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          as={Link}
                          to={`/batteries/${battery._id}`}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Status Updates */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status Updates</h3>
            
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {shipment.statusUpdates.map((update, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== shipment.statusUpdates.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            update.status === 'Delivered' ? 'bg-green-500' :
                            update.status === 'Delayed' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}>
                            <Activity className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-500">
                              Status changed to <span className="font-medium text-gray-900">{update.status}</span>
                              {update.location && (
                                <> at <span className="font-medium text-gray-900">{update.location}</span></>
                              )}
                            </p>
                            {update.notes && (
                              <p className="mt-1 text-sm text-gray-500">{update.notes}</p>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={update.timestamp}>
                              {format(new Date(update.timestamp), 'PPp')}
                            </time>
                            <div className="text-xs text-gray-400">
                              by {update.updatedBy.name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentDetail;