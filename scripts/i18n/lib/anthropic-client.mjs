/**
 * Anthropic Client
 *
 * Wrapper for Anthropic API calls with retry logic and error handling.
 * Used for generating and translating content.
 */

import { createAPIError } from './error-handler.mjs';

const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const DEFAULT_MAX_TOKENS = 4000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Anthropic API Client
 */
export class AnthropicClient {
  constructor(apiKey = process.env.ANTHROPIC_API_KEY) {
    if (!apiKey) {
      throw createAPIError(
        'ANTHROPIC_API_KEY environment variable is not set.\n\n' +
        'Set it in .env.local:\nANTHROPIC_API_KEY=your-api-key-here',
        2
      );
    }
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  /**
   * Generate content using Claude API
   *
   * @param {string} prompt - The prompt to send
   * @param {Object} options - Generation options
   * @param {string} options.model - Model to use
   * @param {number} options.maxTokens - Max tokens to generate
   * @param {number} options.maxRetries - Max retry attempts
   * @returns {Promise<Object>} Generated content as JSON object
   */
  async generate(prompt, options = {}) {
    const {
      model = DEFAULT_MODEL,
      maxTokens = DEFAULT_MAX_TOKENS,
      maxRetries = DEFAULT_MAX_RETRIES
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this._makeRequest({
          model,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        // Extract content from response
        const content = response.content[0].text;

        // Try to parse as JSON
        try {
          return JSON.parse(content);
        } catch (parseError) {
          // If not JSON, look for JSON within the response
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                           content.match(/```\s*([\s\S]*?)\s*```/) ||
                           content.match(/({[\s\S]*})/);

          if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
          }

          throw createAPIError(
            `API returned non-JSON response:\n\n${content.substring(0, 500)}...`,
            4
          );
        }

      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          console.log(`\n⚠️  API call failed (attempt ${attempt}/${maxRetries}). Retrying in ${RETRY_DELAY_MS}ms...`);
          await this._sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
          continue;
        }
      }
    }

    // All retries failed
    throw createAPIError(
      `Failed after ${maxRetries} attempts.\n\n` +
      `Last error: ${lastError.message || lastError}`,
      4
    );
  }

  /**
   * Make HTTP request to Anthropic API
   *
   * @private
   * @param {Object} body - Request body
   * @returns {Promise<Object>} API response
   */
  async _makeRequest(body) {
    try {
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API request failed with status ${response.status}:\n` +
          `${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();

    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error(`Network error: ${error.message}\n\nCheck your internet connection.`);
      }
      throw error;
    }
  }

  /**
   * Sleep for specified milliseconds
   *
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
