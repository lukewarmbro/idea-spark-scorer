import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScoreBreakdown {
  profitability: number;
  demand: number;
  execution: number;
  profitabilityReasoning: string;
  demandReasoning: string;
  executionReasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { idea } = await req.json();

    if (!idea || idea.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Please provide a more detailed business idea (at least 10 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Validating idea:', idea.substring(0, 100) + '...');

    const systemPrompt = `You are an expert business analyst specializing in startup validation. Analyze the given business idea and provide scores from 1-100 for three key areas: profitability, market demand, and execution difficulty.

For each score, provide specific reasoning based on:
- Profitability: Revenue potential, monetization models, pricing power, cost structure
- Demand: Market size, target audience, problem urgency, competitive landscape  
- Execution: Technical complexity, resource requirements, regulatory barriers, time to market

Return your analysis as a JSON object with this exact structure:
{
  "profitability": number (1-100),
  "demand": number (1-100), 
  "execution": number (1-100),
  "profitabilityReasoning": "specific reasoning for profitability score",
  "demandReasoning": "specific reasoning for demand score", 
  "executionReasoning": "specific reasoning for execution score"
}

Be honest and critical in your assessment. Consider real market conditions and provide actionable insights.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this business idea: ${idea}` }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to analyze idea. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from OpenAI
    let scoreBreakdown: ScoreBreakdown;
    try {
      scoreBreakdown = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw AI response:', aiResponse);
      
      // Fallback: try to extract scores with regex
      const profitabilityMatch = aiResponse.match(/"profitability":\s*(\d+)/);
      const demandMatch = aiResponse.match(/"demand":\s*(\d+)/);
      const executionMatch = aiResponse.match(/"execution":\s*(\d+)/);
      
      scoreBreakdown = {
        profitability: profitabilityMatch ? parseInt(profitabilityMatch[1]) : 50,
        demand: demandMatch ? parseInt(demandMatch[1]) : 50,
        execution: executionMatch ? parseInt(executionMatch[1]) : 50,
        profitabilityReasoning: "Analysis completed but detailed reasoning unavailable due to formatting issue.",
        demandReasoning: "Analysis completed but detailed reasoning unavailable due to formatting issue.",
        executionReasoning: "Analysis completed but detailed reasoning unavailable due to formatting issue."
      };
    }

    // Validate scores are within range
    scoreBreakdown.profitability = Math.max(1, Math.min(100, scoreBreakdown.profitability || 50));
    scoreBreakdown.demand = Math.max(1, Math.min(100, scoreBreakdown.demand || 50));
    scoreBreakdown.execution = Math.max(1, Math.min(100, scoreBreakdown.execution || 50));

    console.log('Final score breakdown:', scoreBreakdown);

    return new Response(JSON.stringify(scoreBreakdown), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-idea function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});