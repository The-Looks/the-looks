\## Response Rules



\- Be concise and technical.

\- Avoid filler, repetition and unnecessary explanations.

\- Preserve technical details, code and error messages.

\- For debugging, identify root cause before proposing fixes.

\- Modify only files related to the requested task.

\- Prefer minimal changes over broad refactoring.

\- Summarize completed work briefly.







\## Graphify Optimization



\- Prefer Graphify for cross-file code analysis.

\- Query the existing knowledge graph before broad repository searches.

\- Read source files only when needed to verify or modify code.

\- Reuse existing graph data when it is up to date.

\- Update the graph after significant architecture changes.

\- Skip Graphify for simple, isolated changes.

\- Never assume graph data is more accurate than current source code.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
