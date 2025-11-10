#!/usr/bin/env node

/**
 * FIZ AI TaxBot MCP Server
 *
 * Model Context Protocol server that connects to FIZ AI TaxBot REST API
 * Usage in Claude Desktop:
 *
 * Add to Claude Desktop config (~/.config/Claude/claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "fiz-taxbot": {
 *       "command": "node",
 *       "args": ["/path/to/fiz-ai-taxbot/mcp-server/index.js"],
 *       "env": {
 *         "FIZ_API_KEY": "your_api_key_here",
 *         "FIZ_API_URL": "http://localhost:3000"
 *       }
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Configuration from environment variables
const API_KEY = process.env.FIZ_API_KEY;
const API_URL = process.env.FIZ_API_URL || 'http://localhost:3000';

if (!API_KEY) {
  console.error('❌ FIZ_API_KEY environment variable is required');
  process.exit(1);
}

// Create MCP server
const server = new Server(
  {
    name: 'fiz-taxbot',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'ask_portuguese_tax_question',
        description: 'Ask questions about Portuguese taxes (IVA, IRS, IRC, Social Security, etc.). ' +
                     'Supports Portuguese, Russian, and English. ' +
                     'Provides expert answers based on official Portuguese tax codes.',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'Your tax question in any language (Portuguese, Russian, or English)',
            },
            specialist: {
              type: 'string',
              description: 'Optional: Force a specific specialist (civa, cirs, circ, segsoc, riti, rgit, cis)',
              enum: ['civa', 'cirs', 'circ', 'segsoc', 'riti', 'rgit', 'cis'],
            },
          },
          required: ['question'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'ask_portuguese_tax_question') {
    const { question, specialist } = args;

    try {
      // Call FIZ AI TaxBot REST API
      const response = await fetch(`${API_URL}/api/mcp/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          specialist,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'API request failed');
      }

      const data = await response.json();

      // Check if clarification is needed
      if (data.requiresClarification) {
        const options = data.clarificationOptions
          .map((opt, i) => `${i + 1}. ${opt.id.toUpperCase()}: ${opt.description}`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `${data.response}\n\nPlease choose a specialist:\n${options}\n\nReply with the specialist code (e.g., "civa" or "IRC").`,
            },
          ],
        };
      }

      // Format successful response
      let responseText = data.response;

      if (data.references && data.references.length > 0) {
        responseText += `\n\n📚 References: ${data.references.join(', ')}`;
      }

      if (data.followupQuestions && data.followupQuestions.length > 0) {
        responseText += '\n\n💡 Follow-up questions:';
        data.followupQuestions.forEach((q, i) => {
          responseText += `\n${i + 1}. ${q.question}`;
        });
      }

      responseText += `\n\n🌍 Language: ${data.detectedLanguage || 'pt'}`;
      responseText += `\n⚙️ Specialist: ${data.specialist.toUpperCase()}`;

      if (data.conversationContinued) {
        responseText += '\n♻️ Continued previous conversation';
      }

      return {
        content: [
          {
            type: 'text',
            text: responseText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 FIZ AI TaxBot MCP Server running');
  console.error(`📡 Connected to: ${API_URL}`);
}

main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
