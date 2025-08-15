import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Lightbulb } from 'lucide-react';

interface IdeaFormProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

export const IdeaForm = ({ onSubmit, isLoading }: IdeaFormProps) => {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim() && !isLoading) {
      onSubmit(idea.trim());
    }
  };

  return (
    <Card className="p-6 border-card-border shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Describe Your Business Idea
            </h2>
            <p className="text-muted-foreground text-sm">
              Be as detailed as possible for better scoring
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Example: A mobile app that connects dog owners with local dog walkers, featuring real-time GPS tracking, in-app payments, and user reviews..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className="min-h-32 resize-none border-input focus:ring-primary focus:border-primary transition-smooth"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Minimum 20 characters</span>
            <span>{idea.length}/1000</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={idea.length < 20 || isLoading}
          className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing Your Idea...
            </>
          ) : (
            <>
              Get My Validation Score
            </>
          )}
        </Button>
      </form>
    </Card>
  );
};