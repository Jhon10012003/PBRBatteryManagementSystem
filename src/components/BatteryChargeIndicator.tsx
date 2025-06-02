interface BatteryChargeIndicatorProps {
  charge: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

const BatteryChargeIndicator = ({ charge, size = 'md' }: BatteryChargeIndicatorProps) => {
  const getColorClass = () => {
    if (charge <= 20) return 'bg-red-500';
    if (charge <= 50) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-16';
      case 'lg':
        return 'h-6 w-32';
      default:
        return 'h-4 w-24';
    }
  };
  
  const getTextSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="flex items-center">
      <div className={`relative overflow-hidden rounded-full bg-gray-200 ${getSizeClass()}`}>
        <div
          className={`absolute left-0 top-0 h-full ${getColorClass()}`}
          style={{ width: `${charge}%` }}
        ></div>
      </div>
      <span className={`ml-2 font-medium ${getTextSizeClass()}`}>{charge}%</span>
    </div>
  );
};

export default BatteryChargeIndicator;