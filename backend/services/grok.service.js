const axios = require('axios');
const { generateQuizPrompt, validateGrokResponse, extractJSON } = require('../utils/promptEngineering');

/**
 * GROK LLM Service
 * Handles all interactions with the GROK API
 */

class GrokService {
  constructor() {
    this.apiUrl = process.env.GROK_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
    this.model = process.env.GROK_MODEL || 'llama-3.3-70b-versatile'; // Groq's latest model
    this.maxRetries = 3;
    this.timeout = 60000; // 60 seconds
    
    console.log('🔑 GROK Service initialized');
    console.log('API URL:', this.apiUrl);
  }
  
  // Lazy load API key to ensure dotenv has loaded
  getApiKey() {
    return process.env.GROK_API_KEY;
  }

  /**
   * Generate quiz using GROK LLM
   */
  async generateQuiz(quizParams) {
    const {
      topic,
      difficultyLevel,
      numberOfQuestions,
      additionalDescription
    } = quizParams;

    // Generate the prompt using our advanced prompt engineering
    const prompt = generateQuizPrompt(
      topic,
      difficultyLevel,
      numberOfQuestions,
      additionalDescription
    );

    console.log('🤖 Generating quiz with GROK...');
    console.log(`📚 Topic: ${topic}`);
    console.log(`🎯 Difficulty: ${difficultyLevel}`);
    console.log(`📝 Questions: ${numberOfQuestions}`);

    let attempt = 0;
    let lastError = null;

    // Retry logic for robustness
    while (attempt < this.maxRetries) {
      attempt++;
      try {
        const response = await this.callGrokAPI(prompt);
        const quizData = this.parseResponse(response, numberOfQuestions);
        
        console.log('✅ Quiz generated successfully');
        return quizData;

      } catch (error) {
        lastError = error;
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.maxRetries) {
          const delay = attempt * 2000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw this.createGrokError(
      `Failed to generate quiz after ${this.maxRetries} attempts: ${lastError.message}`,
      500,
      { originalError: lastError.message }
    );
  }

  /**
   * Call GROK API with proper configuration
   */
  async callGrokAPI(prompt) {
    const apiKey = this.getApiKey();
    
    if (!apiKey) {
      throw this.createGrokError(
        'GROK API key is not configured',
        500,
        { hint: 'Set GROK_API_KEY in .env file' }
      );
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert quiz generator. You always return valid JSON with no additional text or markdown formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7, // Balance between creativity and consistency
          max_tokens: 8000, // Sufficient for large quizzes
          response_format: { type: 'json_object' } // Request JSON response
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: this.timeout
        }
      );

      return response.data;

    } catch (error) {
      console.error('❌ GROK API Call Error:', error.message);
      if (error.response) {
        // GROK API returned an error
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        throw this.createGrokError(
          error.response.data.error?.message || 'GROK API Error',
          error.response.status,
          {
            statusCode: error.response.status,
            details: error.response.data
          }
        );
      } else if (error.request) {
        // No response received
        console.error('No response received from GROK');
        throw this.createGrokError(
          'No response from GROK API - check network connection',
          503,
          { hint: 'Verify GROK_API_URL is correct' }
        );
      } else {
        // Request setup error
        throw this.createGrokError(error.message, 500);
      }
    }
  }

  /**
   * Parse and validate GROK API response
   */
  parseResponse(apiResponse, expectedQuestions) {
    // Extract content from GROK response structure
    const content = apiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw this.createGrokError(
        'Invalid GROK API response structure',
        500,
        { receivedKeys: Object.keys(apiResponse) }
      );
    }

    // Extract and parse JSON
    let quizData;
    try {
      quizData = extractJSON(content);
    } catch (error) {
      throw this.createGrokError(
        'Failed to parse GROK response as JSON',
        500,
        { 
          parseError: error.message,
          responsePreview: content.substring(0, 200) + '...'
        }
      );
    }

    // Validate the quiz data structure
    const validation = validateGrokResponse(quizData, expectedQuestions);
    if (!validation.isValid) {
      throw this.createGrokError(
        'GROK response validation failed',
        500,
        { 
          errors: validation.errors,
          receivedData: quizData
        }
      );
    }

    return quizData;
  }

  /**
   * Create a standardized error object
   */
  createGrokError(message, statusCode = 500, details = {}) {
    const error = new Error(message);
    error.isGrokError = true;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }

  /**
   * Utility: Sleep function for retry delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test GROK API connection
   */
  async testConnection() {
    try {
      const response = await this.callGrokAPI('Respond with: {"status": "ok"}');
      return {
        success: true,
        message: 'GROK API connection successful',
        model: this.model
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        details: error.details
      };
    }
  }
}

// Export singleton instance
module.exports = new GrokService();
