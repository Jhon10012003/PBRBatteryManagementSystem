import Badge from './ui/Badge';

interface ShipmentStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const ShipmentStatusBadge = ({ status, size = 'md' }: ShipmentStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'Preparing':
        return 'info';
      case 'In Transit':
        return 'success';
      case 'Delayed':
        return 'warning';
      case 'Delivered':
        return 'default';
      case 'Cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant()} size={size}>
      {status}
    </Badge>
  );
};

export default ShipmentStatusBadge;