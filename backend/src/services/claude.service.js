const config = require('../config');
const logger = require('../config/logger');

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

async function queryClaude(systemPrompt, userPrompt, maxTokens = 2000) {
  if (!config.anthropic.apiKey) {
    logger.warn('Anthropic API key not configured, returning mock response');
    return mockClaudeResponse(systemPrompt, userPrompt);
  }

  try {
    const response = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    logger.error(`Claude query failed: ${error.message}`);
    throw error;
  }
}

async function parseWhatsAppOrder(customerMessage, language = 'hi') {
  const systemPrompt = `You are an order parser for a kirana (grocery) store in India. 
Extract items and quantities from customer messages in Hindi, English, or mixed (Hinglish).
Return ONLY valid JSON with this exact schema:
{
  "items": [{ "name": "string", "qty": number, "unit": "string" }],
  "isOrderComplete": boolean,
  "needsClarification": boolean,
  "clarificationQuestion": "string or null"
}

Examples:
"2 kg atta, 1 litre tata namak" → {"items":[{"name":"atta","qty":2,"unit":"kg"},{"name":"tata namak","qty":1,"unit":"litre"}],"isOrderComplete":true,"needsClarification":false,"clarificationQuestion":null}
"mujhe kuch groceries chahiye" → {"items":[],"isOrderComplete":false,"needsClarification":true,"clarificationQuestion":"Kya aap bata sakte hain ki aapko kya chahiye? Jaise: 2 kg atta, 1 litre tel"}`;

  const userPrompt = `Customer message: "${customerMessage}"
Detected language: ${language}
Parse and return JSON only.`;

  try {
    const result = await queryClaude(systemPrompt, userPrompt, 1000);
    const cleaned = result.replace(/```(?:json)?\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error(`Failed to parse WhatsApp order: ${error.message}`);
    return {
      items: [],
      isOrderComplete: false,
      needsClarification: true,
      clarificationQuestion: 'Maaf karen, main samajh nahi paya. Kripya is tarah bataen: "2 kg atta, 1 litre tata namak, 6 ande"',
    };
  }
}

async function generateDemandForecasts(orderHistory, currentInventory, store) {
  const systemPrompt = `You are a demand forecasting AI for a kirana grocery store in India. 
Analyze order history and provide actionable restocking recommendations.
Respond ONLY in valid JSON with this schema:
{
  "forecasts": [
    {
      "inventory_id": "string",
      "product_name": "string",
      "current_stock": number,
      "predicted_7day_demand": number,
      "recommended_restock_quantity": number,
      "confidence": number (0-1),
      "reasoning": "string (max 100 words)",
      "urgency": "critical|high|medium|low"
    }
  ],
  "weekly_insight": "string (max 200 words)"
}`;

  const userPrompt = `Store: ${store.storeName}
Location: ${store.address}
Analysis period: last 90 days

Order history summary (top 20 products by volume):
${JSON.stringify(orderHistory)}

Current inventory levels:
${JSON.stringify(currentInventory)}

Provide demand forecast for next 7 days.`;

  try {
    const result = await queryClaude(systemPrompt, userPrompt, 4000);
    const cleaned = result.replace(/```(?:json)?\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error(`Failed to generate forecasts: ${error.message}`);
    return { forecasts: [], weekly_insight: 'Unable to generate forecast at this time.' };
  }
}

async function generateDailyReport(ownerName, city, language, dailyMetrics) {
  const systemPrompt = `You are writing a daily business report for a kirana store owner. 
Write 3 bullet points in ${language} summarizing today's performance. 
Be conversational and encouraging. Use simple language, no jargon.
Return raw text, no JSON.`;

  const userPrompt = `Owner: ${ownerName}, City: ${city}
Data: ${JSON.stringify(dailyMetrics)}
Write 3 bullet points in ${language}.`;

  try {
    return await queryClaude(systemPrompt, userPrompt, 1000);
  } catch (error) {
    logger.error(`Failed to generate daily report: ${error.message}`);
    return `📊 Today's Summary:\n• Orders: ${dailyMetrics.totalOrders}\n• Revenue: ₹${dailyMetrics.totalRevenue}\n• Delivered: ${dailyMetrics.deliveredOrders}`;
  }
}

async function generateWeeklyInsights(store, metrics, language) {
  const systemPrompt = `You are an AI business analyst for a kirana store. 
Generate weekly insights in ${language} covering: peak hours, top products, driver performance, revenue comparison.
Return ONLY valid JSON with this schema:
{
  "peakHourAnalysis": "string",
  "topProducts": [{ "name": "string", "revenue": number }],
  "driverRanking": [{ "name": "string", "onTimeRate": number }],
  "operationalSuggestions": ["string"],
  "revenueComparison": { "current": number, "previous": number, "change_percent": number },
  "summary": "string"
}`;

  const userPrompt = `Store: ${store.storeName}
Metrics (last 7 days): ${JSON.stringify(metrics)}
Generate insights in ${language}.`;

  try {
    const result = await queryClaude(systemPrompt, userPrompt, 3000);
    const cleaned = result.replace(/```(?:json)?\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error(`Failed to generate weekly insights: ${error.message}`);
    return null;
  }
}

function mockClaudeResponse(systemPrompt, userPrompt) {
  if (systemPrompt.includes('order parser')) {
    return JSON.stringify({
      items: [{ name: 'atta', qty: 2, unit: 'kg' }, { name: 'tata namak', qty: 1, unit: 'litre' }],
      isOrderComplete: true,
      needsClarification: false,
      clarificationQuestion: null,
    });
  }
  if (systemPrompt.includes('demand forecasting')) {
    return JSON.stringify({
      forecasts: [
        {
          inventory_id: 'mock-id',
          product_name: 'Wheat Flour (Atta)',
          current_stock: 50,
          predicted_7day_demand: 120,
          recommended_restock_quantity: 80,
          confidence: 0.85,
          reasoning: 'Based on 90-day history, atta sales average 17 units/day with weekend spikes.',
          urgency: 'critical',
        },
      ],
      weekly_insight: 'Atta and cooking oil are your fastest-moving items. Consider bulk ordering from distributor.',
    });
  }
  if (systemPrompt.includes('business report')) {
    return '📊 *Today\'s Performance*\n• 45 orders delivered with 92% on-time rate\n• Revenue of ₹12,450 — 15% higher than last week\n• Premium atta and cooking oil were top sellers';
  }
  return JSON.stringify({
    insights: [{ message: 'Your store is performing well. Focus on stock management.' }],
  });
}

module.exports = {
  queryClaude,
  parseWhatsAppOrder,
  generateDemandForecasts,
  generateDailyReport,
  generateWeeklyInsights,
};
