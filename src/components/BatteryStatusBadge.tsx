import Badge from './ui/Badge';

interface BatteryStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const BatteryStatusBadge = ({ status, size = 'md' }: BatteryStatusBadgeProps) => {
  const getVariant = () => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'In Transit':
        return 'info';
      case 'Installed':
        return 'default';
      case 'Maintenance':
        return 'warning';
      case 'Defective':
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

export default BatteryStatusBadge;