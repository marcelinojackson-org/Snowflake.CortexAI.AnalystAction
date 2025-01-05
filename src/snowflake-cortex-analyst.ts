import * as core from '@actions/core';
import { runCortexAnalyst, CortexAnalystMessage } from '@marcelinojackson-org/snowflake-common';

async function main(): Promise<void> {
  try {
    const { semanticModelPath, semanticViewPath } = resolveSemanticPaths();

    const messages = parseMessages(
      core.getInput('messages') || process.env.ANALYST_MESSAGES,
      core.getInput('message') || process.env.ANALYST_MESSAGE
    );

    const includeSql = core.getInput('include-sql') || process.env.ANALYST_INCLUDE_SQL;
    const resultFormat = core.getInput('result-format') || process.env.ANALYST_RESULT_FORMAT;
    const temperature = core.getInput('temperature') || process.env.ANALYST_TEMPERATURE;
    const maxOutputTokens = core.getInput('max-output-tokens') || process.env.ANALYST_MAX_OUTPUT_TOKENS;

    const result = await runCortexAnalyst({
      semanticModelPath,
      semanticViewPath,
      messages,
      includeSql,
      resultFormat,
      temperature,
      maxOutputTokens
    });

    console.log('Cortex Analyst query succeeded ✅');
    if (semanticModelPath) {
      console.log(`Semantic model: ${semanticModelPath}`);
    }
    if (semanticViewPath) {
      console.log(`Semantic view: ${semanticViewPath}`);
    }
    console.log('Response JSON:', JSON.stringify(result.response, null, 2));

    core.setOutput('result-json', JSON.stringify(result.response));
  } catch (error) {
    console.error('Cortex Analyst query failed:');
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
      core.setFailed(error.message);
    } else {
      console.error(error);
      core.setFailed('Unknown error when running Cortex Analyst');
    }
  }
}

function resolveSemanticPaths(): { semanticModelPath?: string; semanticViewPath?: string } {
  const modelInput = core.getInput('semantic-model-path') || process.env.SEMANTIC_MODEL_PATH || '';
  const viewInput = core.getInput('semantic-view-path') || process.env.SEMANTIC_VIEW_PATH || '';
  const semanticModelPath = modelInput.trim();
  const semanticViewPath = viewInput.trim();

  if (!semanticModelPath && !semanticViewPath) {
    throw new Error('Provide `semantic-model-path` or `semantic-view-path` (set env SEMANTIC_MODEL_PATH or SEMANTIC_VIEW_PATH).');
  }

  if (semanticModelPath && semanticViewPath) {
    throw new Error('Provide only one of `semantic-model-path` or `semantic-view-path`, not both.');
  }

  return {
    semanticModelPath: semanticModelPath || undefined,
    semanticViewPath: semanticViewPath || undefined
  };
}

function parseMessages(rawMessages?: string, singleMessage?: string): CortexAnalystMessage[] {
  if (rawMessages && rawMessages.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawMessages);
      if (!Array.isArray(parsed)) {
        throw new Error('messages must be a JSON array.');
      }
      return parsed as CortexAnalystMessage[];
    } catch (err) {
      throw new Error(`Invalid messages JSON: ${(err as Error).message}`);
    }
  }

  const message = (singleMessage || '').trim();
  if (!message) {
    throw new Error('Missing analyst message - provide `message` input, ANALYST_MESSAGE env, or a messages array.');
  }

  return [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: message
        }
      ]
    }
  ];
}

void main();
