import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
};

interface ProcessedItem {
  category: string;
  refinedText: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
}

interface ProcessResponse {
  items: ProcessedItem[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  let text = '';
  try {
    const body = await req.json();
    text = body.text || '';
  } catch {
    // ignore JSON parsing errors, text remains ''
  }

  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!deepseekApiKey) {
    return new Response(JSON.stringify({
      error: 'DeepSeek API key not configured',
      items: [{ category: 'note', refinedText: text, priority: 'medium' }]
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent second brain assistant. Analyze the user's input and break it down into separate thoughts if needed.

Return a JSON response with "items" array, where each item has:
1. "category": Choose the most appropriate category - common ones (task, reminder, note, idea) OR custom categories.
2. "refinedText": Clean version of the thought
3. "priority": "high", "medium", or "low" (for actionable items)
4. "tags": Array of 1-3 relevant tags (optional)

Return ONLY valid JSON with "items" array, no other text.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    let processedData: ProcessResponse;
    try {
      // Remove markdown code blocks
      let cleanContent = content.trim().replace(/^```(json)?\s*/, '').replace(/\s*```$/, '');
      processedData = JSON.parse(cleanContent);
    } catch {
      processedData = { items: [{ category: 'note', refinedText: text, priority: 'medium' }] };
    }

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-brain-dump function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      items: [{ category: 'note', refinedText: text, priority: 'medium' }]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
