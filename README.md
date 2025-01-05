# Snowflake.CortexAI.AnalystAction

GitHub Action that sends natural-language questions to Snowflake Cortex Analyst (Semantic Models) and returns the JSON response.

## Inputs & environment

| Input / Env | Required? | Description |
|-------------|-----------|-------------|
| `semantic-model-path` / `SEMANTIC_MODEL_PATH` | ✅* | Stage path to the semantic model YAML (e.g. `@"SNOWFLAKE_SAMPLE_CORTEXAI_DB"."SEMANTIC"."SEMANTIC_MODELS"/tpch_sales_semantic_model.yaml`). |
| `semantic-view-path` / `SEMANTIC_VIEW_PATH` | ✅* | Cortex Analyst semantic view path (e.g. `/databases/.../semanticView/EMPLOYEE_DETAILS_WITHOUT_SALARY_SV`). Provide either a model path or a view path. |
| `message` / `ANALYST_MESSAGE` | Yes (unless `messages` is provided) | Natural language question for Cortex Analyst. |
| `messages` / `ANALYST_MESSAGES` | No | JSON array of Cortex Analyst message objects. If provided, `message` is ignored. |
| `include-sql` / `ANALYST_INCLUDE_SQL` | No | `true/false` to include generated SQL in the response. |
| `result-format` / `ANALYST_RESULT_FORMAT` | No | Result formatting hint (markdown, json, etc.). |
| `temperature` / `ANALYST_TEMPERATURE` | No | Optional generation temperature. |
| `max-output-tokens` / `ANALYST_MAX_OUTPUT_TOKENS` | No | Optional limit on generated tokens. |
| `SNOWFLAKE_ACCOUNT_URL`, `SNOWFLAKE_PAT` **or** `SNOWFLAKE_PASSWORD` | **Yes** | Credentials used to call the Cortex Analyst REST API. Store them as secrets. |

> Example semantic view path: `/databases/SNOWFLAKE_SAMPLE_CORTEXAI_DB/schemas/HRANALYTICS/semanticView/EMPLOYEE_DETAILS_WITHOUT_SALARY_SV`

## Basic usage

```yaml
- name: Ask Cortex Analyst
  uses: marcelinojackson-org/Snowflake.CortexAI.AnalystAction@v1
  with:
    semantic-model-path: '@"SNOWFLAKE_SAMPLE_CORTEXAI_DB"."SEMANTIC"."SEMANTIC_MODELS"/tpch_sales_semantic_model.yaml'
    message: "What were total sales by nation in 1995?"
  env:
    SNOWFLAKE_ACCOUNT_URL: ${{ secrets.SNOWFLAKE_ACCOUNT_URL }}
    SNOWFLAKE_PAT: ${{ secrets.SNOWFLAKE_PAT }}
```

## Advanced usage

```yaml
- name: Ask Cortex Analyst (advanced)
  id: analyst
  uses: marcelinojackson-org/Snowflake.CortexAI.AnalystAction@v1
  with:
    semantic-view-path: '/databases/SNOWFLAKE_SAMPLE_CORTEXAI_DB/schemas/HRANALYTICS/semanticView/EMPLOYEE_DETAILS_WITHOUT_SALARY_SV'
    messages: >
      [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "Provide total sales by nation for 1995." }
          ]
        }
      ]
    include-sql: true
    result-format: json
    temperature: 0.1
    max-output-tokens: 1024
  env:
    SNOWFLAKE_ACCOUNT_URL: ${{ secrets.SNOWFLAKE_ACCOUNT_URL }}
    SNOWFLAKE_PAT: ${{ secrets.SNOWFLAKE_PAT }}

- name: View response
  run: echo '${{ steps.analyst.outputs.result-json }}' | jq .
```

Setting `include-sql: true` with `result-format: json` tells Cortex Analyst to return the generated statement (`response.sql`) **and** execute it, so `result-json` contains both the SQL text and the actual row set.

## Outputs

- `result-json`: stringified JSON response returned by Cortex Analyst.
