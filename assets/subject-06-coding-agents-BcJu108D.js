import{j as e}from"./vendor-Cs56uELc.js";import{C,a as u,N as k,B as w}from"./subject-01-rag-fundamentals-By1Px9YG.js";import{P as A}from"./subject-03-agent-foundations-TuSBeYGc.js";const S={agent:{fill:"#e0f2fe",stroke:"#0284c7",textFill:"#0c4a6e"},tool:{fill:"#f0fdf4",stroke:"#16a34a",textFill:"#14532d"},store:{fill:"#faf5ff",stroke:"#7c3aed",textFill:"#4c1d95"},external:{fill:"#fff7ed",stroke:"#ea580c",textFill:"#7c2d12"},llm:{fill:"#fdf4ff",stroke:"#a21caf",textFill:"#701a75"},default:{fill:"#f8fafc",stroke:"#64748b",textFill:"#1e293b"}},I={agent:{fill:"#0c4a6e",stroke:"#38bdf8",textFill:"#e0f2fe"},tool:{fill:"#14532d",stroke:"#4ade80",textFill:"#dcfce7"},store:{fill:"#4c1d95",stroke:"#c084fc",textFill:"#ede9fe"},external:{fill:"#7c2d12",stroke:"#fb923c",textFill:"#fff7ed"},llm:{fill:"#701a75",stroke:"#e879f9",textFill:"#fdf4ff"},default:{fill:"#1e293b",stroke:"#94a3b8",textFill:"#e2e8f0"}};function N(r,a,n){if(r.filter(o=>o.x!==void 0&&o.y!==void 0).length===r.length)return r;const i=Math.ceil(Math.sqrt(r.length)),l=a/(i+1),h=n/(Math.ceil(r.length/i)+1);return r.map((o,d)=>({...o,x:o.x??l*(d%i+1),y:o.y??h*(Math.floor(d/i)+1)}))}function _({nodes:r=[],edges:a=[],width:n=640,height:s=320,title:i,dark:l=!1}){const h=N(r,n,s),o=Object.fromEntries(h.map(t=>[t.id,t])),d=l?I:S,p=120,m=40,T=8;return e.jsxs("figure",{className:"my-6 overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-700/60 dark:bg-gray-900",children:[i&&e.jsx("figcaption",{className:"border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500 dark:border-gray-800 dark:text-gray-400",children:i}),e.jsxs("svg",{viewBox:`0 0 ${n} ${s}`,width:"100%",style:{maxWidth:n,display:"block",margin:"0 auto"},"aria-label":i??"Architecture diagram",role:"img",children:[e.jsx("defs",{children:e.jsx("marker",{id:"arrowhead",markerWidth:"8",markerHeight:"6",refX:"8",refY:"3",orient:"auto",children:e.jsx("polygon",{points:"0 0, 8 3, 0 6",fill:l?"#94a3b8":"#64748b"})})}),a.map((t,c)=>{const x=o[t.from],g=o[t.to];if(!x||!g)return null;const f=x.x,j=x.y,y=g.x,b=g.y,P=(f+y)/2,R=(j+b)/2;return e.jsxs("g",{children:[e.jsx("line",{x1:f,y1:j,x2:y,y2:b,stroke:l?"#475569":"#94a3b8",strokeWidth:"1.5",markerEnd:"url(#arrowhead)"}),t.label&&e.jsx("text",{x:P,y:R-5,textAnchor:"middle",fontSize:"10",fill:l?"#94a3b8":"#64748b",children:t.label})]},c)}),h.map(t=>{const c=d[t.type??"default"]??d.default;return e.jsxs("g",{transform:`translate(${t.x-p/2}, ${t.y-m/2})`,children:[e.jsx("rect",{width:p,height:m,rx:T,fill:c.fill,stroke:c.stroke,strokeWidth:"1.5"}),e.jsx("text",{x:p/2,y:m/2+4,textAnchor:"middle",fontSize:"11",fontWeight:"500",fill:c.textFill,children:t.label})]},t.id)})]})]})}const E=[{id:"user",label:"User Input",type:"external",x:60,y:150},{id:"claude",label:"Claude Model",type:"llm",x:220,y:150},{id:"tools",label:"Tool Selection",type:"agent",x:380,y:150},{id:"read",label:"Read/Glob/Grep",type:"tool",x:540,y:80},{id:"bash",label:"Bash/Write",type:"tool",x:540,y:150},{id:"git",label:"Git Operations",type:"tool",x:540,y:220},{id:"result",label:"Tool Results",type:"store",x:380,y:280}],J=[{from:"user",to:"claude",label:"prompt"},{from:"claude",to:"tools",label:"plan"},{from:"tools",to:"read",label:"invoke"},{from:"tools",to:"bash",label:"invoke"},{from:"tools",to:"git",label:"invoke"},{from:"read",to:"result",label:"output"},{from:"bash",to:"result",label:"output"},{from:"git",to:"result",label:"output"},{from:"result",to:"claude",label:"observe"}];function L(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"Claude Code Architecture"}),e.jsxs("p",{children:["Claude Code is Anthropic's agentic AI coding assistant that runs directly in your terminal. Unlike browser-based AI tools, Claude Code operates with ",e.jsx("strong",{children:"full filesystem access"}),": it reads and writes files, executes shell commands, searches code with grep and glob patterns, manages git history, and even spawns parallel sub-agents to tackle independent subtasks concurrently. The model behind Claude Code is ",e.jsx("code",{children:"claude-opus-4-6"}),", optimized for long-horizon reasoning over large codebases."]}),e.jsxs("p",{children:["The key architectural insight is that Claude Code is not a chatbot with file-upload support. It is a full ",e.jsx("em",{children:"agent"}),": a model embedded inside a tool-execution loop that repeats until the task is complete or the model decides it is done. Understanding that loop is the foundation for using Claude Code effectively."]}),e.jsx("h2",{children:"The Agent Loop"}),e.jsx(_,{nodes:E,edges:J,width:640,height:320,title:"Claude Code Agent Loop"}),e.jsxs(C,{title:"Agentic Loop",children:[e.jsx("p",{children:"Every action Claude Code takes passes through a four-phase cycle that repeats until the task is complete:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Perceive"})," — Read files, run shell commands, grep source trees, fetch web pages. The model builds a working picture of the codebase and environment."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Reason"}),' — Given the current context (conversation history + all tool results so far), plan the single best next action. Claude Code thinks in terms of sub-goals: "I need to understand the failing test before I touch the implementation."']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Act"})," — Invoke a tool. Each tool call is atomic: Read a file, run a bash command, write a new file, perform a targeted Edit. Tool calls are sequential by default; sub-agents enable parallelism."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Observe"})," — Receive the tool result and fold it back into context. A failed bash command, a linter warning, or a 200 OK from a test run all become inputs that steer the next planning step."]})]}),e.jsx("p",{children:"The loop terminates when the model emits a plain text response without a tool call, signalling that the task is complete (or that it needs clarification from the user)."})]}),e.jsx("h2",{children:"Installation and Basic Usage"}),e.jsxs("p",{children:["Claude Code is distributed as an npm package and requires Node 18+. After installation, run ",e.jsx("code",{children:"claude"})," inside any project directory."]}),e.jsx(u,{language:"bash",children:`npm install -g @anthropic-ai/claude-code
# Run in your project
claude
# Or with a task
claude "Fix the failing tests in src/auth/"`}),e.jsx("p",{children:"When you pass a task string directly, Claude Code enters non-interactive (headless) mode: it works through the task autonomously and exits. This makes it composable with CI pipelines and shell scripts. Without a task string it opens an interactive REPL where you can have a back-and-forth conversation while Claude Code retains the full conversation context and all tool results."}),e.jsx("h2",{children:"The Tool System"}),e.jsx("p",{children:"Claude Code has a fixed set of built-in tools. The model cannot call arbitrary shell functions; it must choose from this approved list. Each tool has a well-defined input schema and the model must produce valid JSON tool-call arguments."}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Tool"}),e.jsx("th",{children:"What it does"}),e.jsx("th",{children:"Key parameters"})]})}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Read"})}),e.jsx("td",{children:"Read a file from disk (supports offset + limit for large files)"}),e.jsxs("td",{children:[e.jsx("code",{children:"file_path"}),", ",e.jsx("code",{children:"offset"}),", ",e.jsx("code",{children:"limit"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Write"})}),e.jsx("td",{children:"Overwrite or create a file with new content"}),e.jsxs("td",{children:[e.jsx("code",{children:"file_path"}),", ",e.jsx("code",{children:"content"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Edit"})}),e.jsx("td",{children:"Targeted string replacement inside an existing file"}),e.jsxs("td",{children:[e.jsx("code",{children:"file_path"}),", ",e.jsx("code",{children:"old_string"}),", ",e.jsx("code",{children:"new_string"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Bash"})}),e.jsx("td",{children:"Execute an arbitrary shell command and capture stdout/stderr"}),e.jsxs("td",{children:[e.jsx("code",{children:"command"}),", ",e.jsx("code",{children:"timeout"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Glob"})}),e.jsx("td",{children:"Find files matching a glob pattern, sorted by modification time"}),e.jsxs("td",{children:[e.jsx("code",{children:"pattern"}),", ",e.jsx("code",{children:"path"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Grep"})}),e.jsx("td",{children:"Search file contents with ripgrep regex"}),e.jsxs("td",{children:[e.jsx("code",{children:"pattern"}),", ",e.jsx("code",{children:"path"}),", ",e.jsx("code",{children:"glob"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"WebFetch"})}),e.jsx("td",{children:"Fetch a URL and extract text content for analysis"}),e.jsxs("td",{children:[e.jsx("code",{children:"url"}),", ",e.jsx("code",{children:"prompt"})]})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"Agent"})}),e.jsx("td",{children:"Spawn a sub-agent with its own tool loop to handle a sub-task"}),e.jsx("td",{children:e.jsx("code",{children:"prompt"})})]}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("code",{children:"TodoWrite"})}),e.jsx("td",{children:"Maintain a structured task list to track multi-step progress"}),e.jsx("td",{children:e.jsx("code",{children:"todos"})})]})]})]}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"Edit"})," tool is the preferred way to make targeted changes because it only transmits the diff, keeps the rest of the file untouched, and fails loudly if",e.jsx("code",{children:"old_string"})," is not unique — which forces Claude Code to re-read the file before attempting a second edit rather than silently clobbering the wrong occurrence."]}),e.jsx("h2",{children:"CLAUDE.md: Persistent Memory"}),e.jsxs("p",{children:["Claude Code has no persistent memory between sessions beyond your conversation history. The ",e.jsx("strong",{children:"CLAUDE.md"})," file is the designed solution to this limitation. When Claude Code starts, it searches for ",e.jsx("code",{children:"CLAUDE.md"})," in the project root (and optionally ",e.jsx("code",{children:"~/.claude/CLAUDE.md"})," for user-wide rules). The file is prepended to the system prompt, giving Claude Code immediate context about:"]}),e.jsxs("ul",{children:[e.jsx("li",{children:"The project's purpose, tech stack, and architecture decisions"}),e.jsx("li",{children:"Coding conventions and forbidden patterns"}),e.jsx("li",{children:"Security or compliance constraints that must never be violated"}),e.jsx("li",{children:"Testing requirements and how to run the test suite"}),e.jsx("li",{children:"External services and how to reach them in development"})]}),e.jsx("p",{children:"A well-crafted CLAUDE.md dramatically reduces the number of clarifying questions Claude Code asks and prevents it from making decisions that violate project standards. Think of it as an onboarding document written for an AI, not for humans."}),e.jsx(u,{language:"markdown",filename:"CLAUDE.md",children:`# Project Context
This is a FastAPI backend for a healthcare application.

## Tech Stack
- Python 3.11, FastAPI, SQLAlchemy, PostgreSQL
- Testing: pytest, pytest-asyncio

## Rules
- All database queries MUST use parameterized statements (no f-strings in SQL)
- All endpoints MUST validate request bodies with Pydantic models
- PHI fields must be tagged with # PHI comment
- Never log PHI data

## Forbidden Patterns
- No \`eval()\` or \`exec()\`
- No hardcoded credentials
- No \`shell=True\` in subprocess calls`}),e.jsxs(k,{type:"info",children:["CLAUDE.md files are hierarchical. Place a root-level CLAUDE.md for project-wide rules and sub-directory CLAUDE.md files for module-specific context. Claude Code merges all of them in order from root to the working directory. This lets you, for example, define stricter constraints for a ",e.jsx("code",{children:"payments/"})," subdirectory without polluting the top-level file."]}),e.jsx("h2",{children:"Sub-Agent Architecture"}),e.jsxs("p",{children:["Claude Code can spawn parallel sub-agents using the ",e.jsx("code",{children:"Agent"})," tool. A sub-agent is a full, independent Claude Code instance with its own tool loop and context window. Sub-agents are isolated: they do not share state with the parent or with each other. The parent waits for all sub-agents to complete before proceeding."]}),e.jsx("p",{children:"Sub-agents are ideal for tasks that are genuinely independent:"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Running the test suite in one sub-agent while refactoring a module in another"}),e.jsx("li",{children:"Searching three different parts of a large codebase simultaneously"}),e.jsx("li",{children:"Generating documentation for multiple modules in parallel"}),e.jsx("li",{children:"Running linting and type-checking concurrently"})]}),e.jsx("p",{children:"The parent agent collects the results of all sub-agents and synthesizes them. This multi-agent topology can cut wall-clock time significantly on large tasks, though it also multiplies token consumption because each sub-agent has its own context and tool results."}),e.jsxs(A,{title:"Checkpoint-Verify Loop",children:[e.jsx("p",{children:"The most reliable way to use Claude Code on non-trivial tasks is to impose a checkpoint-verify discipline: make the smallest meaningful change, then immediately verify it before proceeding."}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Scope the change"}),' — Instruct Claude Code to work on one logical unit at a time (one function, one endpoint, one migration). Resist the temptation to ask for "refactor the entire auth module" in one shot.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Run the tests"})," — After each change, Claude Code should run",e.jsx("code",{children:"pytest -x"})," (or equivalent). The ",e.jsx("code",{children:"-x"})," flag stops at the first failure, keeping output short and focused."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Run the linter/type-checker"})," — ",e.jsx("code",{children:"ruff check ."})," and",e.jsx("code",{children:"mypy src/"})," catch a different class of bugs than tests. Include them in the verify step."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Read the output"})," — Claude Code observes the tool result. A red test triggers another reason-act-observe cycle focused on the failure message. A green result moves the task forward."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Commit the checkpoint"})," — Once green, commit. Small, green commits give Claude Code a safe rollback point and keep git history readable."]})]}),e.jsx("p",{children:"This pattern prevents error accumulation. A large batch of untested changes can produce cascading failures that are much harder to diagnose than a single failing test in a small delta."})]}),e.jsx(w,{title:"Keeping Tasks Focused and Using --verbose",children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"One task at a time."}),' Claude Code performs best when each session has a single, clearly defined goal. Compound requests ("fix the bug, add tests, update the docs, and bump the version") force Claude Code to context-switch, increasing the risk that it misses a step or that an intermediate failure cascades into subsequent ones.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Describe the desired outcome, not the steps."}),' "The test',e.jsx("code",{children:"test_auth_token_expiry"}),' must pass" is a better prompt than "change the token TTL to 3600 seconds." The outcome-focused prompt lets Claude Code reason about the problem rather than blindly executing a prescription that may be wrong.']}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Use ",e.jsx("code",{children:"--verbose"})," when debugging Claude Code itself."]})," The",e.jsx("code",{children:"--verbose"})," flag prints every tool call and its result to the terminal, making it easy to see exactly what Claude Code read, what commands it ran, and what output it received. This is invaluable when Claude Code is behaving unexpectedly."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Interrupt early, not late."})," If you see Claude Code heading in the wrong direction in the first few tool calls, interrupt (",e.jsx("code",{children:"Ctrl+C"}),") and clarify. Letting a wrong plan run to completion is expensive: the model will have made changes you need to revert, and the conversation context will be full of noise."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keep CLAUDE.md up to date."})," Whenever Claude Code asks a question you wish it already knew, add the answer to CLAUDE.md. The file should evolve as the project evolves."]})]})})]})}const W=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"})),v={critical:{border:"border-red-400/50 dark:border-red-500/40",bg:"bg-red-50/50 dark:bg-red-950/20",headerBg:"bg-red-100/60 dark:bg-red-900/30",headerBorder:"border-red-400/30 dark:border-red-500/30",badge:"bg-red-500 dark:bg-red-600",labelColor:"text-red-600 dark:text-red-400",chipBg:"bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"},high:{border:"border-orange-400/50 dark:border-orange-500/40",bg:"bg-orange-50/50 dark:bg-orange-950/20",headerBg:"bg-orange-100/60 dark:bg-orange-900/30",headerBorder:"border-orange-400/30 dark:border-orange-500/30",badge:"bg-orange-500 dark:bg-orange-600",labelColor:"text-orange-600 dark:text-orange-400",chipBg:"bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"},medium:{border:"border-yellow-400/50 dark:border-yellow-500/40",bg:"bg-yellow-50/50 dark:bg-yellow-950/20",headerBg:"bg-yellow-100/60 dark:bg-yellow-900/30",headerBorder:"border-yellow-400/30 dark:border-yellow-500/30",badge:"bg-yellow-500 dark:bg-yellow-600",labelColor:"text-yellow-700 dark:text-yellow-400",chipBg:"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300"}};function M({title:r="Security Warning",severity:a="high",children:n}){const s=v[a]??v.high;return e.jsxs("aside",{className:`my-6 overflow-hidden rounded-xl border-2 shadow-sm ${s.border} ${s.bg}`,role:"alert","aria-live":"polite",children:[e.jsxs("div",{className:`flex items-center gap-3 border-b px-5 py-3 ${s.headerBg} ${s.headerBorder}`,children:[e.jsx("div",{className:`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.badge}`,children:e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"}),e.jsx("line",{x1:"12",y1:"8",x2:"12",y2:"12"}),e.jsx("line",{x1:"12",y1:"16",x2:"12.01",y2:"16"})]})}),e.jsx("span",{className:`text-xs font-semibold uppercase tracking-wider ${s.labelColor}`,children:r}),e.jsx("span",{className:`ml-auto shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.chipBg}`,children:a.toUpperCase()})]}),e.jsx("div",{className:"px-5 py-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300 [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul>li]:leading-relaxed [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm dark:[&_code]:bg-gray-800",children:n})]})}const O=[{id:"claude",label:"Claude Code",type:"llm",x:80,y:150},{id:"client",label:"MCP Client",type:"agent",x:220,y:150},{id:"server1",label:"JIRA MCP Server",type:"tool",x:420,y:80},{id:"server2",label:"DB Query Server",type:"tool",x:420,y:150},{id:"server3",label:"Vault MCP Server",type:"tool",x:420,y:220},{id:"jira",label:"JIRA API",type:"external",x:580,y:80},{id:"db",label:"PostgreSQL",type:"store",x:580,y:150},{id:"vault",label:"HashiCorp Vault",type:"external",x:580,y:220}],U=[{from:"claude",to:"client",label:"tool call"},{from:"client",to:"server1",label:"JSON-RPC"},{from:"client",to:"server2",label:"JSON-RPC"},{from:"client",to:"server3",label:"JSON-RPC"},{from:"server1",to:"jira",label:"REST"},{from:"server2",to:"db",label:"SQL"},{from:"server3",to:"vault",label:"HTTP API"},{from:"server1",to:"client",label:"result"},{from:"server2",to:"client",label:"result"},{from:"server3",to:"client",label:"result"},{from:"client",to:"claude",label:"tool result"}];function q(){return e.jsxs("div",{className:"section-content",children:[e.jsx("h1",{children:"Model Context Protocol (MCP)"}),e.jsxs("p",{children:["The Model Context Protocol (MCP) is an open standard published by Anthropic for connecting AI models to external tools, data sources, and services. Where Claude Code's built-in tools (Read, Write, Bash, etc.) give it access to the local filesystem and shell, MCP lets you extend Claude Code with ",e.jsx("em",{children:"any"})," capability: querying your JIRA board, fetching secrets from HashiCorp Vault, running SQL against a production replica, calling internal REST APIs, or anything else you can wrap in a small process."]}),e.jsxs("p",{children:["MCP uses ",e.jsx("strong",{children:"JSON-RPC 2.0"})," as its wire protocol. A ",e.jsx("em",{children:"server"})," is any process that speaks this protocol; a ",e.jsx("em",{children:"client"})," (embedded in Claude Code) connects to one or more servers at startup and discovers their capabilities. From Claude Code's perspective, MCP tools appear alongside its built-in tools — the model chooses between them using the same reasoning process."]}),e.jsx("h2",{children:"MCP Architecture"}),e.jsx(_,{nodes:O,edges:U,width:640,height:320,title:"Claude Code MCP Architecture"}),e.jsxs(C,{title:"MCP Server",children:[e.jsx("p",{children:"An MCP server is a local or remote process that exposes one or more of three primitive types over JSON-RPC 2.0:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Tools"})," — Callable actions with a name, description, and JSON Schema for their inputs. Claude Code invokes tools when it wants to take an action: create a JIRA ticket, run a parameterized SQL query, rotate a secret."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Resources"})," — Read-only data sources identified by a URI. Claude Code can read resources to gather context: a ticket's full description, a database schema, an API's OpenAPI spec. Resources are analogous to the Read tool but scoped to external systems."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Prompts"}),' — Reusable, parameterised prompt templates stored on the server. An organization can define a "write a pull-request description" prompt once and have every Claude Code user invoke it consistently, ensuring formatting and content standards.']})]}),e.jsxs("p",{children:["Servers communicate over either ",e.jsx("strong",{children:"stdio"})," (the server is a child process of Claude Code, reading from stdin and writing to stdout) or ",e.jsx("strong",{children:"HTTP + SSE"}),"(the server is a remote service, useful for shared team servers). Stdio is the standard choice for local development because it requires no network configuration and inherits the shell's environment variables automatically."]})]}),e.jsxs(k,{type:"tip",children:[e.jsx("strong",{children:"Tools vs. Resources vs. Prompts at a glance:"})," Use ",e.jsx("em",{children:"tools"})," for anything that performs an action or has side effects (writing a ticket, querying a DB). Use ",e.jsx("em",{children:"resources"})," for read-only structured data that Claude Code should inspect before acting (a ticket's current state, a table's schema). Use ",e.jsx("em",{children:"prompts"})," for standardising how Claude Code frames a class of request, so every developer on the team gets the same quality of output for recurring tasks."]}),e.jsx("h2",{children:"Configuring MCP Servers"}),e.jsx("p",{children:"MCP servers are declared in a JSON configuration file. Claude Code looks for configuration in two places, merged in order:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"~/.claude.json"})," — user-level servers available in every project (e.g., a Vault server for fetching your personal development credentials)"]}),e.jsxs("li",{children:[e.jsx("code",{children:".mcp.json"})," in the project root — project-level servers checked into the repository so the whole team gets the same integrations"]})]}),e.jsx(u,{language:"json",filename:".mcp.json",children:`{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["./mcp-servers/jira-server.js"],
      "env": {
        "JIRA_URL": "https://company.atlassian.net",
        "JIRA_TOKEN": "\${JIRA_API_TOKEN}"
      }
    },
    "postgres": {
      "command": "uvx",
      "args": ["mcp-server-postgres", "--db-url", "\${DATABASE_URL}"]
    }
  }
}`}),e.jsxs("p",{children:["Each entry under ",e.jsx("code",{children:"mcpServers"})," describes how to launch one server:",e.jsx("code",{children:"command"})," + ",e.jsx("code",{children:"args"})," are passed to ",e.jsx("code",{children:"child_process.spawn"}),", and ",e.jsx("code",{children:"env"})," is merged into the child's environment. The ",e.jsxs("code",{children:["$","{VAR}"]}),"syntax performs variable interpolation from the parent shell's environment, keeping secrets out of the config file itself."]}),e.jsxs("p",{children:["The ",e.jsx("code",{children:"uvx"})," runner (from the ",e.jsx("code",{children:"uv"})," Python package manager) is convenient for Python MCP servers: it downloads and caches the package on first run without requiring a global ",e.jsx("code",{children:"pip install"}),". This makes ",e.jsx("code",{children:".mcp.json"}),"fully self-contained for projects with Python-based integrations."]}),e.jsx("h2",{children:"Building a Custom MCP Server in Python"}),e.jsxs("p",{children:["The official MCP Python SDK provides a decorator-based API that maps cleanly onto the JSON-RPC protocol. The following example implements a JIRA integration with two tools:",e.jsx("code",{children:"get_ticket"})," for fetching a single issue and ",e.jsx("code",{children:"search_tickets"})," for JQL queries."]}),e.jsx(u,{language:"python",filename:"jira_mcp_server.py",children:`"""
JIRA MCP Server — exposes JIRA query and retrieval tools to Claude Code.
Install: pip install mcp httpx
Run via Claude Code: configured in .mcp.json (see above)
"""

import asyncio
import os
from typing import Any

import httpx
import mcp.server.stdio
import mcp.types as types
from mcp.server import Server

JIRA_URL = os.environ["JIRA_URL"]          # e.g. https://company.atlassian.net
JIRA_TOKEN = os.environ["JIRA_TOKEN"]      # Personal Access Token or API token

# ── Server initialisation ────────────────────────────────────────────────────

server = Server("jira-tools")

def _jira_client() -> httpx.AsyncClient:
    """Return an authenticated httpx client for the JIRA REST API v3."""
    return httpx.AsyncClient(
        base_url=f"{JIRA_URL}/rest/api/3",
        headers={
            "Authorization": f"Bearer {JIRA_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        timeout=15.0,
    )

# ── Tool definitions ─────────────────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="get_ticket",
            description=(
                "Fetch a single JIRA issue by its key (e.g. 'ENG-1234'). "
                "Returns the summary, description, status, assignee, priority, "
                "and all comments. Use this before updating or referencing a ticket."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "ticket_key": {
                        "type": "string",
                        "description": "JIRA issue key, e.g. 'ENG-1234'",
                        "pattern": "^[A-Z]+-[0-9]+$",
                    }
                },
                "required": ["ticket_key"],
                "additionalProperties": False,
            },
        ),
        types.Tool(
            name="search_tickets",
            description=(
                "Search JIRA issues using JQL (JIRA Query Language). "
                "Returns up to 50 matching issues with key, summary, status, and assignee. "
                "Example JQL: 'project = ENG AND status = "In Progress" AND assignee = currentUser()'"
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "jql": {
                        "type": "string",
                        "description": "A valid JQL query string",
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (1–50, default 20)",
                        "minimum": 1,
                        "maximum": 50,
                        "default": 20,
                    },
                },
                "required": ["jql"],
                "additionalProperties": False,
            },
        ),
    ]

# ── Tool handlers ────────────────────────────────────────────────────────────

@server.call_tool()
async def call_tool(
    name: str, arguments: dict[str, Any]
) -> list[types.TextContent]:

    if name == "get_ticket":
        return await _get_ticket(arguments["ticket_key"])

    if name == "search_tickets":
        return await _search_tickets(
            jql=arguments["jql"],
            max_results=arguments.get("max_results", 20),
        )

    # Unknown tool — return a structured error so Claude Code understands
    return [types.TextContent(
        type="text",
        text=f'{{"error": "Unknown tool: {name}. Available tools: get_ticket, search_tickets"}}',
    )]


async def _get_ticket(ticket_key: str) -> list[types.TextContent]:
    async with _jira_client() as client:
        resp = await client.get(
            f"/issue/{ticket_key}",
            params={
                "fields": "summary,description,status,assignee,priority,comment",
            },
        )

    if resp.status_code == 404:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "Ticket {ticket_key} not found. Verify the key and try again."}}',
        )]

    if resp.status_code != 200:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "JIRA API returned HTTP {resp.status_code}", "detail": "{resp.text[:200]}"}}',
        )]

    data = resp.json()
    fields = data["fields"]

    # Flatten comments to plain text to keep the response compact
    comments = [
        {
            "author": c["author"]["displayName"],
            "created": c["created"],
            "body": c["body"],
        }
        for c in (fields.get("comment", {}).get("comments") or [])
    ]

    result = {
        "key": ticket_key,
        "summary": fields.get("summary"),
        "status": fields["status"]["name"],
        "priority": fields["priority"]["name"] if fields.get("priority") else None,
        "assignee": fields["assignee"]["displayName"] if fields.get("assignee") else "Unassigned",
        "description": fields.get("description"),
        "comments": comments,
    }

    import json
    return [types.TextContent(type="text", text=json.dumps(result, indent=2))]


async def _search_tickets(jql: str, max_results: int) -> list[types.TextContent]:
    async with _jira_client() as client:
        resp = await client.post(
            "/search",
            json={
                "jql": jql,
                "maxResults": max_results,
                "fields": ["key", "summary", "status", "assignee"],
            },
        )

    if resp.status_code != 200:
        return [types.TextContent(
            type="text",
            text=f'{{"error": "JQL search failed with HTTP {resp.status_code}", "detail": "{resp.text[:200]}"}}',
        )]

    data = resp.json()
    issues = [
        {
            "key": issue["key"],
            "summary": issue["fields"]["summary"],
            "status": issue["fields"]["status"]["name"],
            "assignee": (
                issue["fields"]["assignee"]["displayName"]
                if issue["fields"].get("assignee")
                else "Unassigned"
            ),
        }
        for issue in data.get("issues", [])
    ]

    import json
    return [types.TextContent(
        type="text",
        text=json.dumps({"total": data.get("total", 0), "issues": issues}, indent=2),
    )]

# ── Entrypoint ───────────────────────────────────────────────────────────────

async def main() -> None:
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )

if __name__ == "__main__":
    asyncio.run(main())`}),e.jsxs(M,{severity:"high",children:[e.jsx("strong",{children:"Never embed secrets in MCP server code or configuration."}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Always read credentials from environment variables (as shown above). The",e.jsx("code",{children:".mcp.json"})," ",e.jsx("code",{children:"env"})," block uses ",e.jsxs("code",{children:["$","{VAR}"]}),"interpolation — it reads from the shell, not from the file. Commit",e.jsx("code",{children:".mcp.json"})," to git; never commit ",e.jsx("code",{children:".env"})," files or any file containing real tokens."]}),e.jsx("li",{children:"Never log the full request body or response body from external APIs. JIRA descriptions, Vault secret values, and database rows may contain PII, credentials, or other sensitive data. Log only the HTTP status code and the tool name."}),e.jsxs("li",{children:["Validate all inputs with JSON Schema (as shown in ",e.jsx("code",{children:"inputSchema"})," above)",e.jsx("em",{children:"before"})," forwarding them to external systems. An LLM can produce unexpected values; the MCP server is the last line of defence before those values reach your production APIs."]}),e.jsxs("li",{children:["Scope JIRA tokens to the minimum required permissions. A read-only token is sufficient for ",e.jsx("code",{children:"get_ticket"})," and ",e.jsx("code",{children:"search_tickets"}),". Create a separate token with write permissions only if you add tools that create or update issues."]})]})]}),e.jsx("h2",{children:"The Internal Tool Registry Pattern"}),e.jsxs(A,{title:"Internal Tool Registry Pattern",children:[e.jsx("p",{children:"As the number of MCP servers in an organization grows, managing them individually on each developer's machine becomes error-prone. Teams end up with different server versions, inconsistent tool schemas, and no central visibility into what tools exist. The Internal Tool Registry Pattern solves this by treating MCP servers as shared infrastructure."}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Create a dedicated repository"})," (e.g.,",e.jsx("code",{children:"internal/mcp-servers"}),") that contains all approved MCP servers for the organization. Each server lives in its own subdirectory with a",e.jsx("code",{children:"package.json"})," or ",e.jsx("code",{children:"pyproject.toml"}),", a changelog, and semantic versioning tags."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Publish servers to an internal package registry"})," (npm private registry, PyPI private index, or a simple GitHub release with a tarball). Developers reference the server by package name and version in ",e.jsx("code",{children:".mcp.json"}),", not by a local path."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Gate changes through code review."})," Any modification to a tool's schema or behaviour is a breaking change for every Claude Code user who depends on it. Require at least one review from a security engineer before merging changes to servers that touch production systems."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Document tools for Claude, not for humans."})," The",e.jsx("code",{children:"description"})," field in each tool definition is read by the model, not shown in a UI. Write descriptions that explain ",e.jsx("em",{children:"when"})," to use the tool, what the inputs mean, and what errors to expect. A well-written description reduces incorrect tool invocations."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Version the shared ",e.jsx("code",{children:".mcp.json"})," template."]})," Ship a",e.jsx("code",{children:".mcp.json.template"})," with the registry repo. Developers copy it to their projects and fill in their environment-specific variable names. Infrastructure changes that require an update to the template are communicated via changelog, not Slack messages."]})]})]}),e.jsx(w,{title:"MCP Server Design Principles",children:e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"One tool, one responsibility."})," Resist the urge to create a",e.jsx("code",{children:"jira_do_everything"})," tool that takes an ",e.jsx("code",{children:"action"})," enum. Instead, define ",e.jsx("code",{children:"get_ticket"}),", ",e.jsx("code",{children:"create_ticket"}),",",e.jsx("code",{children:"add_comment"}),", and ",e.jsx("code",{children:"transition_status"})," as separate tools. The model selects tools by name and description; a coarse-grained tool with a vague description leads to misuse."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Validate all inputs with JSON Schema before acting."})," Declare",e.jsx("code",{children:"additionalProperties: false"})," and ",e.jsx("code",{children:"required"})," arrays in every",e.jsx("code",{children:"inputSchema"}),". Reject invalid inputs with a structured JSON error response rather than an uncaught exception — a clean error message helps Claude Code self-correct on the next attempt."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Return structured JSON, not prose."})," Claude Code parses tool results as text, but structured JSON makes it far easier for the model to extract specific fields and reason about them. Return ",e.jsxs("code",{children:["{",'"error": "...", "code": "NOT_FOUND"',"}"]}),"on failure and ",e.jsxs("code",{children:["{",'"data": ...',"}"]})," on success. Consistency across tools reduces the model's cognitive load."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Write error messages that tell Claude Code what to do next."})," Instead of ",e.jsx("code",{children:'"HTTP 403"'}),", return ",e.jsx("code",{children:'"Access denied: the JIRA_TOKEN does not have permission to view project ENG. Ask your JIRA admin to grant Browse Projects access."'})," The model will surface this to the user or attempt an alternative approach."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Keep server startup fast."})," Claude Code launches MCP servers at startup and waits for them to report ready before accepting the first prompt. Defer expensive initialisation (opening database connections, warming caches) to the first actual tool call, not to server startup."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Test servers independently of Claude Code."})," Write unit tests that call your tool handler functions directly with known inputs and assert on the returned JSON. This is far faster than debugging a server by running Claude Code end-to-end."]})]})})]})}const $=Object.freeze(Object.defineProperty({__proto__:null,default:q},Symbol.toStringTag,{value:"Module"}));export{_ as A,M as S,$ as a,W as s};
