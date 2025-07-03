// OpenAI API client for image generation with improved error handling
export async function generateOpenAIImage(prompt: string, retries = 2) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Starting OpenAI image generation with prompt:', prompt);

  for (let i = 0; i <= retries; i++) {
    try {
      // Use the correct OpenAI API endpoint for image generation
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
          quality: 'high'
        }),
      });

      console.log('OpenAI image response status:', response.status);

      if (response.status === 429 && i < retries) {
        const waitTime = Math.pow(2, i) * 3000;
        console.log(`OpenAI rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI image error response:', errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI image generation successful');
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        const imageUrl = `data:image/png;base64,${data.data[0].b64_json}`;
        return { ok: true, json: () => Promise.resolve({ url: imageUrl }) };
      } else {
        throw new Error('Invalid OpenAI response structure');
      }
    } catch (error) {
      console.error(`OpenAI image request failed (attempt ${i + 1}):`, error);
      if (i === retries) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

// Helper function to make OpenAI requests with retry logic
export async function makeOpenAIRequest(url: string, body: any, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429 && i < retries) {
        // Rate limited - wait longer and retry
        const waitTime = Math.pow(2, i) * 2000; // Increased wait time: 2s, 4s, 8s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Request failed, retrying... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased retry delay
    }
  }
}