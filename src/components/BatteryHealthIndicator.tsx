interface BatteryHealthIndicatorProps {
  health: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

const BatteryHealthIndicator = ({ health, size = 'md' }: BatteryHealthIndicatorProps) => {
  const getColorClass = () => {
    if (health <= 30) return 'text-red-500';
    if (health <= 70) return 'text-amber-500';
    return 'text-green-500';
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-xl';
      default:
        return 'text-base';
    }
  };
  
  return (
    <div className="flex items-center">
      <div className="relative">
        <svg 
          className={`${getSizeClass()} ${getColorClass()}`} 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 3V21M18 12H6" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
      <span className={`ml-2 font-medium ${getSizeClass()} ${getColorClass()}`}>
        Health: {health}%
      </span>
    </div>
  );
};

export default BatteryHealthIndicator;