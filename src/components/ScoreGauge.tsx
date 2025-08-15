import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
  type: 'profitability' | 'demand' | 'execution';
  className?: string;
}

export const ScoreGauge = ({ score, label, type, className }: ScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getGradientClass = (scoreType: string) => {
    switch (scoreType) {
      case 'success':
        return 'gradient-success';
      case 'warning':
        return 'gradient-warning';
      case 'danger':
        return 'gradient-danger';
      default:
        return 'gradient-primary';
    }
  };

  const scoreColor = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={`hsl(var(--${scoreColor}))`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px hsl(var(--${scoreColor}) / 0.3))`
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {Math.round(animatedScore)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground capitalize">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
        </p>
      </div>
    </div>
  );
};