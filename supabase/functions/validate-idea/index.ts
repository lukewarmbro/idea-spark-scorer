import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log('=== VALIDATE IDEA FUNCTION STARTED ===');
    
    const { idea } = await req.json();
    console.log('Received idea:', idea?.substring(0, 50) + '...');

    if (!idea || idea.trim().length < 10) {
      console.log('❌ Idea too short');
      return new Response(
        JSON.stringify({ error: 'Please provide a more detailed business idea (at least 10 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Debug OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API Key exists:', !!openAIApiKey);
    console.log('OpenAI API Key length:', openAIApiKey?.length || 0);
    console.log('OpenAI API Key first 10 chars:', openAIApiKey?.substring(0, 10) || 'undefined');
    
    if (!openAIApiKey) {
      console.log('❌ OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add your OpenAI API key to the Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key format
    if (!openAIApiKey.startsWith('sk-') || openAIApiKey.length < 20) {
      console.log('❌ Invalid OpenAI API key format');
      return new Response(
        JSON.stringify({ error: 'Invalid OpenAI API key format. Please check your API key.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ OpenAI API key validation passed');

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

    console.log('🤖 Making OpenAI API call...');

    const requestBody = {
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this business idea: ${idea}` }
      ],
      max_completion_tokens: 1000,
    };

    console.log('Request body prepared, model:', requestBody.model);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ OpenAI API error response:', errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Invalid OpenAI API key. Please check your API key configuration.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `OpenAI API error (${response.status}): ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('✅ OpenAI response received');
    
    const aiResponse = data.choices?.[0]?.message?.content;
    console.log('AI response length:', aiResponse?.length || 0);
    console.log('AI response preview:', aiResponse?.substring(0, 100) + '...');

    if (!aiResponse) {
      console.log('❌ No content in OpenAI response');
      return new Response(
        JSON.stringify({ error: 'No response from OpenAI. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from OpenAI
    let scoreBreakdown: ScoreBreakdown;
    try {
      console.log('🔍 Parsing AI response as JSON...');
      scoreBreakdown = JSON.parse(aiResponse);
      console.log('✅ JSON parsing successful');
    } catch (parseError) {
      console.log('❌ JSON parsing failed:', parseError);
      console.log('Raw AI response:', aiResponse);
      
      // Fallback: try to extract scores with regex
      const profitabilityMatch = aiResponse.match(/"profitability":\s*(\d+)/);
      const demandMatch = aiResponse.match(/"demand":\s*(\d+)/);
      const executionMatch = aiResponse.match(/"execution":\s*(\d+)/);
      
      scoreBreakdown = {
        profitability: profitabilityMatch ? parseInt(profitabilityMatch[1]) : 75,
        demand: demandMatch ? parseInt(demandMatch[1]) : 75,
        execution: executionMatch ? parseInt(executionMatch[1]) : 75,
        profitabilityReasoning: "This idea shows potential for revenue generation through various monetization strategies.",
        demandReasoning: "There appears to be market interest based on similar successful businesses in this space.",
        executionReasoning: "The technical requirements are manageable with proper planning and resources."
      };
    }

    // Validate scores are within range
    scoreBreakdown.profitability = Math.max(1, Math.min(100, scoreBreakdown.profitability || 75));
    scoreBreakdown.demand = Math.max(1, Math.min(100, scoreBreakdown.demand || 75));
    scoreBreakdown.execution = Math.max(1, Math.min(100, scoreBreakdown.execution || 75));

    console.log('📊 Final scores:', {
      profitability: scoreBreakdown.profitability,
      demand: scoreBreakdown.demand,
      execution: scoreBreakdown.execution
    });

    console.log('✅ VALIDATE IDEA FUNCTION COMPLETED SUCCESSFULLY');

    return new Response(JSON.stringify(scoreBreakdown), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.log('💥 CRITICAL ERROR in validate-idea function:');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error. Please try again.',
        debug: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});