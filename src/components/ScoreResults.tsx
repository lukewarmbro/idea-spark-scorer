import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from './ScoreGauge';
import { TrendingUp, Users, Settings, FileText } from 'lucide-react';

interface Score {
  profitability: number;
  demand: number;
  execution: number;
  reasoning: {
    profitability: string;
    demand: string;
    execution: string;
    overall: string;
  };
}

interface ScoreResultsProps {
  score: Score;
  onNewIdea: () => void;
}

export const ScoreResults = ({ score, onNewIdea }: ScoreResultsProps) => {
  const averageScore = Math.round((score.profitability + score.demand + score.execution) / 3);
  
  const getOverallGrade = (score: number) => {
    if (score >= 85) return { grade: 'A+', color: 'success', message: 'Outstanding potential!' };
    if (score >= 80) return { grade: 'A', color: 'success', message: 'Excellent opportunity' };
    if (score >= 75) return { grade: 'B+', color: 'success', message: 'Very promising' };
    if (score >= 70) return { grade: 'B', color: 'warning', message: 'Good potential' };
    if (score >= 65) return { grade: 'B-', color: 'warning', message: 'Decent opportunity' };
    if (score >= 60) return { grade: 'C+', color: 'warning', message: 'Some potential' };
    if (score >= 55) return { grade: 'C', color: 'warning', message: 'Average potential' };
    return { grade: 'D', color: 'danger', message: 'Needs improvement' };
  };

  const overall = getOverallGrade(averageScore);

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <Card className="p-8 border-card-border shadow-lg text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Overall Validation Score</h2>
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-${overall.color} text-${overall.color}-foreground text-3xl font-bold shadow-lg`}>
            {overall.grade}
          </div>
          <div>
            <p className="text-xl font-semibold text-foreground">{averageScore}/100</p>
            <p className="text-muted-foreground">{overall.message}</p>
          </div>
        </div>
      </Card>

      {/* Individual Scores */}
      <Card className="p-6 border-card-border shadow-lg">
        <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Detailed Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScoreGauge
            score={score.profitability}
            label="Profitability"
            type="profitability"
          />
          <ScoreGauge
            score={score.demand}
            label="Market Demand"
            type="demand"
          />
          <ScoreGauge
            score={score.execution}
            label="Ease of Execution"
            type="execution"
          />
        </div>
      </Card>

      {/* Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-card-border shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <h4 className="font-semibold text-foreground">Profitability Analysis</h4>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {score.reasoning.profitability}
          </p>
        </Card>

        <Card className="p-6 border-card-border shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-warning" />
            </div>
            <h4 className="font-semibold text-foreground">Market Demand</h4>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {score.reasoning.demand}
          </p>
        </Card>

        <Card className="p-6 border-card-border shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Execution Difficulty</h4>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {score.reasoning.execution}
          </p>
        </Card>

        <Card className="p-6 border-card-border shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground">Overall Assessment</h4>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {score.reasoning.overall}
          </p>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onNewIdea}
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
        >
          Validate Another Idea
        </Button>
        <Button className="gradient-primary text-primary-foreground font-semibold transition-smooth hover:shadow-glow">
          Get Full Validation Report ($9.99)
        </Button>
      </div>
    </div>
  );
};