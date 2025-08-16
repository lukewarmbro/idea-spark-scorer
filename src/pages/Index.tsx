import { useState } from 'react';
import { IdeaForm } from '@/components/IdeaForm';
import { ScoreResults } from '@/components/ScoreResults';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const Index = () => {
  const [currentScore, setCurrentScore] = useState<Score | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIdeaSubmit = async (idea: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-idea', {
        body: { idea }
      });

      if (error) {
        console.error('Error calling validate-idea function:', error);
        throw new Error(error.message || 'Failed to validate idea');
      }

      // Transform the response to match our Score interface
      const scoreData: Score = {
        profitability: data.profitability,
        demand: data.demand,
        execution: data.execution,
        reasoning: {
          profitability: data.profitabilityReasoning,
          demand: data.demandReasoning,
          execution: data.executionReasoning,
          overall: `Based on the analysis, this idea scores ${Math.round((data.profitability + data.demand + data.execution) / 3)}% overall. The combination of profitability potential, market demand, and execution feasibility provides a comprehensive view of the opportunity.`
        }
      };
      
      setCurrentScore(scoreData);
    } catch (error) {
      console.error('Failed to validate idea:', error);
      // Fall back to mock data if API fails
      const mockScore: Score = {
        profitability: Math.floor(Math.random() * 40) + 60,
        demand: Math.floor(Math.random() * 40) + 60,
        execution: Math.floor(Math.random() * 40) + 60,
        reasoning: {
          profitability: "Unable to connect to validation service. This is a placeholder score.",
          demand: "Unable to connect to validation service. This is a placeholder score.",
          execution: "Unable to connect to validation service. This is a placeholder score.",
          overall: "Service temporarily unavailable. Please try again later."
        }
      };
      setCurrentScore(mockScore);
    }
    
    setIsLoading(false);
  };

  const handleNewIdea = () => {
    setCurrentScore(null);
  };

  if (currentScore) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Your Validation Results
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of your business idea
            </p>
          </div>
          <ScoreResults score={currentScore} onNewIdea={handleNewIdea} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-20">
          <div className="text-center space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-accent px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-accent-foreground">
                  AI-Powered Validation
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                Validate Your
                <span className="gradient-primary bg-clip-text text-transparent"> Business Idea</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Get instant AI-powered scoring on profitability, market demand, and ease of execution. 
                Make confident decisions before you invest your time and money.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Profitability Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Assess revenue potential and business model viability
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-warning/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-foreground">Market Demand</h3>
                <p className="text-sm text-muted-foreground">
                  Evaluate target audience size and market opportunity
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Execution Ease</h3>
                <p className="text-sm text-muted-foreground">
                  Determine technical complexity and resource requirements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-2xl mx-auto px-4 py-16">
        <IdeaForm onSubmit={handleIdeaSubmit} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Get your free validation score • Upgrade for detailed reports and market analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;