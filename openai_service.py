import json
import os
import logging
from openai import OpenAI

# the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
# do not change this unless explicitly requested by the user
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

def validate_business_idea(business_idea):
    """
    Validate a business idea using OpenAI GPT-4o
    Returns scores and reasoning for profitability, demand, and execution ease
    """
    try:
        prompt = f"""
        Please analyze the following business idea and provide scores and detailed reasoning for three key criteria:

        Business Idea: {business_idea}

        Evaluate the idea on:
        1. Profitability (0-10): How likely is this idea to generate significant revenue and profit?
        2. Market Demand (0-10): How strong is the potential market demand for this product/service?
        3. Execution Ease (0-10): How easy would it be to execute and implement this idea?

        For each criterion, provide:
        - A score from 0-10 (where 10 is excellent)
        - Detailed reasoning explaining the score
        - Specific strengths and weaknesses
        - Actionable recommendations for improvement

        Respond with a JSON object in this exact format:
        {{
            "profitability": {{
                "score": number,
                "reasoning": "detailed explanation",
                "strengths": ["strength1", "strength2"],
                "weaknesses": ["weakness1", "weakness2"],
                "recommendations": ["recommendation1", "recommendation2"]
            }},
            "demand": {{
                "score": number,
                "reasoning": "detailed explanation",
                "strengths": ["strength1", "strength2"],
                "weaknesses": ["weakness1", "weakness2"],
                "recommendations": ["recommendation1", "recommendation2"]
            }},
            "execution": {{
                "score": number,
                "reasoning": "detailed explanation",
                "strengths": ["strength1", "strength2"],
                "weaknesses": ["weakness1", "weakness2"],
                "recommendations": ["recommendation1", "recommendation2"]
            }},
            "overall_assessment": "brief overall summary and final thoughts",
            "overall_score": number
        }}
        """

        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert business analyst and entrepreneur with deep experience in evaluating business ideas across various industries. Provide thorough, honest, and actionable feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=2000
        )

        result = json.loads(response.choices[0].message.content)
        
        # Validate and sanitize the response
        for criterion in ['profitability', 'demand', 'execution']:
            if criterion in result:
                # Ensure scores are within valid range
                result[criterion]['score'] = max(0, min(10, result[criterion]['score']))
                
                # Ensure all required fields exist
                for field in ['reasoning', 'strengths', 'weaknesses', 'recommendations']:
                    if field not in result[criterion]:
                        result[criterion][field] = []
        
        # Calculate overall score if not provided
        if 'overall_score' not in result:
            scores = [result[criterion]['score'] for criterion in ['profitability', 'demand', 'execution'] if criterion in result]
            result['overall_score'] = round(sum(scores) / len(scores), 1) if scores else 0
        
        return result
        
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse OpenAI response as JSON: {e}")
        raise Exception("Failed to parse AI response. Please try again.")
    
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        raise Exception(f"Failed to validate business idea: {str(e)}")
