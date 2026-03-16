import ConceptBlock from '../../../components/content/ConceptBlock.jsx'
import BestPracticeBlock from '../../../components/content/BestPracticeBlock.jsx'
import NoteBlock from '../../../components/content/NoteBlock.jsx'
import SDKExample from '../../../components/content/SDKExample.jsx'
import PatternBlock from '../../../components/content/PatternBlock.jsx'
import WarningBlock from '../../../components/content/WarningBlock.jsx'

export default function CodeGenerationPatterns() {
  return (
    <article className="prose-content">
      <h2>Code Generation Patterns</h2>
      <p>
        Code generation is the most visible capability of a coding agent, but the quality of
        generated code depends heavily on how the task is framed, what context is injected, and
        what constraints guide the output. A model that generates excellent code when given rich
        context and clear constraints will generate mediocre, unidiomatic code when given a
        bare natural-language description. This section covers the patterns and techniques
        that consistently produce high-quality, production-ready generated code.
      </p>

      <ConceptBlock term="Context Injection">
        <p>
          The practice of providing the model with relevant existing code, conventions, types,
          and examples alongside the generation task. Context injection is the single most
          impactful factor in code generation quality. A model that sees the project's existing
          patterns, naming conventions, and import style will generate code that fits naturally
          into the codebase; a model that generates in a vacuum produces code that must be
          heavily adapted.
        </p>
      </ConceptBlock>

      <ConceptBlock term="Template-Based vs Free-Form Generation">
        <p>
          Template-based generation constrains the output structure using a skeleton or scaffold —
          the model fills in specific sections (function body, type definitions, test cases) while
          the overall structure is fixed. Free-form generation gives the model full latitude over
          structure and content. Template-based generation produces more predictable, consistent
          output; free-form generation is needed when the structure itself is part of the task.
        </p>
      </ConceptBlock>

      <h2>Context Injection Strategies</h2>

      <div className="my-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Strategy</th>
              <th className="px-4 py-3 text-left font-semibold">What to Inject</th>
              <th className="px-4 py-3 text-left font-semibold">When to Use</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {[
              ['File context', 'The full file where code will be inserted', 'Function/method additions to existing files'],
              ['Similar examples', '2–3 existing functions/classes that follow the same pattern', 'Generating new boilerplate that must match project conventions'],
              ['Type definitions', 'Relevant interfaces, TypedDicts, Pydantic models', 'Any generation that involves typed data structures'],
              ['Import graph', 'What modules are available and their public APIs', 'Preventing hallucinated imports or incorrect API calls'],
              ['Test examples', 'Existing test patterns for the project', 'Generating tests that use the project\'s test utilities'],
              ['Error/style conventions', 'How errors are raised, logged, formatted in the project', 'Ensuring consistent error handling patterns'],
              ['Database schema', 'Table definitions, ORM models', 'Generating DB query code, migrations, or model methods'],
            ].map(([strategy, what, when]) => (
              <tr key={strategy}>
                <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{strategy}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{what}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-500 text-xs">{when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PatternBlock
        name="Context-Rich Code Generation"
        category="Code Generation"
        whenToUse="When generating code that must fit into an existing codebase and follow established patterns — the dominant case in production coding agents."
      >
        <p>
          Collect the relevant context programmatically before calling the model. Inject the
          target file, type definitions, and a similar existing function as examples. This
          pattern alone can improve generated code quality by dramatically reducing the model's
          need to invent conventions.
        </p>
        <SDKExample
          title="Context-Rich Generation Request"
          tabs={{
            python: `import anthropic
from pathlib import Path

client = anthropic.Anthropic()

def generate_function(
    target_file: str,
    function_spec: str,
    example_files: list[str] | None = None,
    type_files: list[str] | None = None,
) -> str:
    """Generate a new function with rich project context."""

    # Collect target file content
    target_content = Path(target_file).read_text()

    # Collect example functions from similar files
    examples = ""
    for ef in (example_files or []):
        content = Path(ef).read_text()
        examples += f"\\n# Example from {ef}:\\n{content}\\n"

    # Collect type definitions
    types = ""
    for tf in (type_files or []):
        content = Path(tf).read_text()
        types += f"\\n# Types from {tf}:\\n{content}\\n"

    prompt = f"""You are adding a new function to an existing Python module.
Study the existing code carefully — match its style, conventions, imports, and error handling exactly.

## Target file (where you will add the function):
python
{target_content}


## Relevant type definitions:
{types if types else "(none provided)"}

## Examples of similar functions in this codebase:
{examples if examples else "(none provided)"}

## Function to implement:
{function_spec}

Output ONLY the new function code (no surrounding class or module code).
Do not repeat existing functions. Match the project's exact style."""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text

# Usage
new_function = generate_function(
    target_file="src/auth/token_service.py",
    function_spec="""
    async def refresh_token(self, refresh_token: str) -> TokenPair:
        Validate the refresh token, issue a new access token and rotate
        the refresh token. Raise TokenExpiredError if the refresh token
        is expired. Raise TokenInvalidError if it cannot be verified.
    """,
    example_files=["src/auth/token_service.py"],
    type_files=["src/auth/models.py", "src/auth/exceptions.py"],
)
print(new_function)`,
            typescript: `import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const client = new Anthropic();

async function generateFunction(opts: {
  targetFile: string;
  functionSpec: string;
  exampleFiles?: string[];
  typeFiles?: string[];
}): Promise<string> {
  const targetContent = fs.readFileSync(opts.targetFile, 'utf8');

  const examples = (opts.exampleFiles ?? [])
    .map(f => // Example from \${f}:\\n\${fs.readFileSync(f, 'utf8')})
    .join('\\n\\n');

  const types = (opts.typeFiles ?? [])
    .map(f => // Types from \${f}:\\n\${fs.readFileSync(f, 'utf8')})
    .join('\\n\\n');

  const prompt = You are adding a new function to an existing TypeScript module.
Study the existing code carefully — match its style, conventions, imports, and error handling exactly.

## Target file:
\\\\\\typescript
\${targetContent}
\\\\\\

## Relevant type definitions:
\${types || '(none provided)'}

## Examples of similar functions:
\${examples || '(none provided)'}

## Function to implement:
\${opts.functionSpec}

Output ONLY the new function code. Match the project's exact style.;

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

const newFunction = await generateFunction({
  targetFile: 'src/auth/tokenService.ts',
  functionSpec: 
    async refreshToken(refreshToken: string): Promise<TokenPair>
    Validate the refresh token, issue a new access token and rotate
    the refresh token. Throw TokenExpiredError if expired.
    Throw TokenInvalidError if verification fails.
  ,
  exampleFiles: ['src/auth/tokenService.ts'],
  typeFiles: ['src/auth/models.ts', 'src/auth/errors.ts'],
});
console.log(newFunction);`,
          }}
        />
      </PatternBlock>

      <h2>Template-Based Generation</h2>
      <p>
        Template-based generation uses a structured scaffold where the model fills in specific
        sections. This is ideal for highly repetitive patterns like CRUD endpoints, data models,
        migration files, and test suites where the structure is always the same but the content
        varies. Templates dramatically reduce the chance of structural errors.
      </p>

      <SDKExample
        title="Template-Based REST Endpoint Generation"
        tabs={{
          python: `import anthropic
from string import Template

client = anthropic.Anthropic()

FASTAPI_ENDPOINT_TEMPLATE = '''
# ========== {resource_name} Endpoints ==========
# Resource: {resource_description}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.models.{module_name} import {model_name}
from app.schemas.{module_name} import {schema_name}Create, {schema_name}Update, {schema_name}Response
from app.crud.{module_name} import {crud_name}

router = APIRouter(prefix="/{url_prefix}", tags=["{tag}"])

@router.get("/", response_model=list[{schema_name}Response])
async def list_{resource_plural}(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """List all {resource_plural}."""
    # TODO: implement

@router.post("/", response_model={schema_name}Response, status_code=status.HTTP_201_CREATED)
async def create_{resource_name}(
    data: {schema_name}Create,
    db: AsyncSession = Depends(get_db),
):
    """Create a new {resource_name}."""
    # TODO: implement

@router.get("/{{id}}", response_model={schema_name}Response)
async def get_{resource_name}(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a single {resource_name} by ID."""
    # TODO: implement

@router.patch("/{{id}}", response_model={schema_name}Response)
async def update_{resource_name}(
    id: int,
    data: {schema_name}Update,
    db: AsyncSession = Depends(get_db),
):
    """Update a {resource_name}."""
    # TODO: implement

@router.delete("/{{id}}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_{resource_name}(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a {resource_name}."""
    # TODO: implement
'''

def generate_crud_endpoints(resource_spec: dict) -> str:
    """Fill in the TODO sections of a CRUD template."""
    template_vars = {
        "resource_name": resource_spec["name"].lower(),
        "resource_plural": resource_spec["plural"].lower(),
        "resource_description": resource_spec["description"],
        "module_name": resource_spec["name"].lower(),
        "model_name": resource_spec["name"],
        "schema_name": resource_spec["name"],
        "crud_name": f"{resource_spec['name'].lower()}_crud",
        "url_prefix": resource_spec["plural"].lower(),
        "tag": resource_spec["plural"],
    }
    scaffold = FASTAPI_ENDPOINT_TEMPLATE.format(**template_vars)

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=3000,
        messages=[{
            "role": "user",
            "content": (
                f"Complete all TODO sections in this FastAPI router. "
                f"Resource details:\\n{resource_spec}\\n\\n"
                f"Scaffold to complete (implement the TODO sections):\\n{scaffold}"
            ),
        }],
    )
    return response.content[0].text

result = generate_crud_endpoints({
    "name": "Product",
    "plural": "Products",
    "description": "E-commerce product with name, price, stock_quantity, and category_id",
    "fields": "name: str, price: Decimal, stock_quantity: int, category_id: int",
})
print(result)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

function buildExpressScaffold(resource: {
  name: string;
  plural: string;
  description: string;
}): string {
  const { name, plural } = resource;
  const nameLower = name.toLowerCase();
  const pluralLower = plural.toLowerCase();

  return // ========== \${name} Router ==========
import { Router, Request, Response, NextFunction } from 'express';
import { \${name}Service } from '../services/\${nameLower}Service';
import { Create\${name}Dto, Update\${name}Dto } from '../dtos/\${nameLower}.dto';
import { validateDto } from '../middleware/validate';

export const \${nameLower}Router = Router();
const service = new \${name}Service();

// GET /\${pluralLower}
\${nameLower}Router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement list with pagination
});

// GET /\${pluralLower}/:id
\${nameLower}Router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement get by id, return 404 if not found
});

// POST /\${pluralLower}
\${nameLower}Router.post('/', validateDto(Create\${name}Dto), async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement create, return 201
});

// PATCH /\${pluralLower}/:id
\${nameLower}Router.patch('/:id', validateDto(Update\${name}Dto), async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement update, return 404 if not found
});

// DELETE /\${pluralLower}/:id
\${nameLower}Router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  // TODO: implement delete, return 204
});
;
}

async function generateCrudRouter(resource: {
  name: string;
  plural: string;
  description: string;
  fields: string;
}): Promise<string> {
  const scaffold = buildExpressScaffold(resource);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: Complete all TODO sections in this Express router.
Resource: \${JSON.stringify(resource, null, 2)}

Scaffold (implement TODO sections only, keep existing code):
\${scaffold},
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

const router = await generateCrudRouter({
  name: 'Product',
  plural: 'Products',
  description: 'E-commerce product',
  fields: 'name: string, price: number, stockQuantity: number, categoryId: string',
});
console.log(router);`,
        }}
      />

      <h2>Multi-File Generation</h2>
      <p>
        Many tasks require generating multiple coordinated files — a model, its schema, CRUD
        layer, router, and tests. Generating these files in a single prompt risks losing coherence
        across files. A better pattern is to generate files sequentially, feeding each completed
        file as context for the next.
      </p>

      <SDKExample
        title="Sequential Multi-File Generation"
        tabs={{
          python: `import anthropic
from pathlib import Path

client = anthropic.Anthropic()

def generate_feature_files(feature_spec: str, output_dir: str) -> dict[str, str]:
    """Generate a complete feature (model, schema, service, router) sequentially."""
    generated = {}
    context = f"Feature specification:\\n{feature_spec}\\n\\n"

    file_plan = [
        ("model.py", "SQLAlchemy ORM model"),
        ("schema.py", "Pydantic v2 schemas (Create, Update, Response)"),
        ("service.py", "Business logic service using the model and schemas above"),
        ("router.py", "FastAPI router using the service above"),
        ("test_service.py", "pytest tests for the service"),
    ]

    for filename, description in file_plan:
        prompt = (
            f"{context}"
            f"Generate the {description} for this feature.\\n"
            f"Filename: {filename}\\n"
            f"Output ONLY the raw Python code, no markdown."
        )

        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        code = response.content[0].text.strip()
        generated[filename] = code

        # Feed generated file as context for next generation
        context += f"\\n# Generated {filename}:\\n{code}\\n"

        # Write to disk
        out_path = Path(output_dir) / filename
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(code)
        print(f"Generated: {filename} ({len(code.splitlines())} lines)")

    return generated

files = generate_feature_files(
    feature_spec="""
    BlogPost feature:
    - Fields: title (str), body (str), author_id (int FK->users), published_at (datetime|null)
    - A post is published when published_at is set
    - Only the author can update or delete their post
    - Support paginated listing with optional author filter
    """,
    output_dir="src/blog",
)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';

const client = new Anthropic();

async function generateFeatureFiles(
  featureSpec: string,
  outputDir: string
): Promise<Record<string, string>> {
  const generated: Record<string, string> = {};
  let context = Feature specification:\\n\${featureSpec}\\n\\n;

  const filePlan: [string, string][] = [
    ['entity.ts', 'TypeORM entity'],
    ['dto.ts', 'NestJS DTOs (Create, Update, Response) with class-validator decorators'],
    ['service.ts', 'NestJS service using the entity and DTOs above'],
    ['controller.ts', 'NestJS controller using the service above'],
    ['service.spec.ts', 'Jest unit tests for the service'],
  ];

  for (const [filename, description] of filePlan) {
    const prompt = \${context}Generate the \${description} for this feature.
Filename: \${filename}
Output ONLY raw TypeScript code, no markdown.;

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const code = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    generated[filename] = code;

    // Feed this file as context for the next
    context += \\n// Generated \${filename}:\\n\${code}\\n;

    // Write to disk
    const outPath = path.join(outputDir, filename);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, code);
    console.log(Generated: \${filename} (\${code.split('\\n').length} lines));
  }

  return generated;
}

await generateFeatureFiles(
  BlogPost feature:
- Fields: title, body, authorId (FK->users), publishedAt (Date|null)
- A post is published when publishedAt is set
- Only the author can update or delete their post
- Support paginated listing with optional author filter,
  'src/blog'
);`,
        }}
      />

      <WarningBlock title="Hallucinated Imports and APIs">
        <p>
          Models frequently generate code that imports modules or calls functions that do not
          exist, especially for less common libraries. Always run a static type-check
          (<code>mypy</code>, <code>tsc --noEmit</code>) and linter immediately after generation.
          Injecting the actual library documentation or type stubs as context reduces this
          significantly. For critical integrations, include the library's actual source or
          type definitions in the prompt.
        </p>
      </WarningBlock>

      <h2>Self-Correcting Generation</h2>
      <p>
        Rather than accepting generated code as final, run it through static analysis and feed
        errors back to the model for correction. This self-correction loop dramatically improves
        the correctness of generated code without requiring human review of every output.
      </p>

      <SDKExample
        title="Generation with Self-Correction Loop"
        tabs={{
          python: `import anthropic
import subprocess
from pathlib import Path
import tempfile

client = anthropic.Anthropic()

def generate_and_verify(task: str, max_corrections: int = 3) -> str:
    """Generate Python code and self-correct until it passes mypy and flake8."""
    messages = [{"role": "user", "content": f"Write Python code for:\\n{task}\\nOutput ONLY raw Python code."}]

    for attempt in range(max_corrections + 1):
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2048,
            system="You are a Python developer. Output ONLY raw Python code, no markdown.",
            messages=messages,
        )
        code = response.content[0].text.strip()
        messages.append({"role": "assistant", "content": code})

        # Write to temp file and run checks
        with tempfile.NamedTemporaryFile(suffix=".py", mode="w", delete=False) as f:
            f.write(code)
            tmp_path = f.name

        errors = []

        # mypy type check
        mypy = subprocess.run(
            ["mypy", tmp_path, "--ignore-missing-imports"],
            capture_output=True, text=True,
        )
        if mypy.returncode != 0:
            errors.append(f"Type errors (mypy):\\n{mypy.stdout}")

        # flake8 style check
        flake8 = subprocess.run(
            ["flake8", tmp_path, "--max-line-length=100"],
            capture_output=True, text=True,
        )
        if flake8.returncode != 0:
            errors.append(f"Style errors (flake8):\\n{flake8.stdout}")

        Path(tmp_path).unlink()

        if not errors:
            print(f"Passed on attempt {attempt + 1}")
            return code

        if attempt < max_corrections:
            error_text = "\\n\\n".join(errors)
            messages.append({
                "role": "user",
                "content": f"Fix these errors and output the corrected code only:\\n{error_text}",
            })
            print(f"Attempt {attempt + 1}: errors found, correcting...")

    return code  # Return best attempt even if not fully clean

result = generate_and_verify("""
A function that fetches JSON from a URL with retry logic (max 3 retries,
exponential backoff), returns a typed dict, and raises a custom FetchError
on permanent failure.
""")
print(result)`,
          typescript: `import Anthropic from '@anthropic-ai/sdk';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const client = new Anthropic();

async function generateAndVerify(
  task: string,
  maxCorrections = 3
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [
    {
      role: 'user',
      content: Write TypeScript code for:\\n\${task}\\nOutput ONLY raw TypeScript code.,
    },
  ];

  for (let attempt = 0; attempt <= maxCorrections; attempt++) {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      system: 'You are a TypeScript developer. Output ONLY raw TypeScript code, no markdown.',
      messages,
    });

    const code = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    messages.push({ role: 'assistant', content: code });

    // Write to temp file and type-check
    const tmpFile = path.join(os.tmpdir(), gen_\${Date.now()}.ts);
    fs.writeFileSync(tmpFile, code);

    const errors: string[] = [];

    try {
      execSync(npx tsc \${tmpFile} --noEmit --strict --target ES2022 --moduleResolution node 2>&1, {
        encoding: 'utf8',
      });
    } catch (e: any) {
      errors.push(Type errors (tsc):\\n\${e.stdout});
    }

    try {
      execSync(npx eslint \${tmpFile} --rule 'no-unused-vars: error' 2>&1, { encoding: 'utf8' });
    } catch (e: any) {
      errors.push(Lint errors (eslint):\\n\${e.stdout});
    }

    fs.unlinkSync(tmpFile);

    if (errors.length === 0) {
      console.log(Passed on attempt \${attempt + 1});
      return code;
    }

    if (attempt < maxCorrections) {
      const errorText = errors.join('\\n\\n');
      messages.push({
        role: 'user',
        content: Fix these errors and output the corrected code only:\\n\${errorText},
      });
      console.log(Attempt \${attempt + 1}: errors found, correcting...);
    }
  }

  return messages[messages.length - 1].content as string;
}

const result = await generateAndVerify(
A function that fetches JSON from a URL with retry logic (max 3 retries,
exponential backoff), returns a typed result, and throws a custom FetchError
on permanent failure.
);
console.log(result);`,
        }}
      />

      <BestPracticeBlock title="Code Generation Best Practices">
        <ul>
          <li>Always inject the target file and related type definitions as context — it is the single biggest quality lever.</li>
          <li>Use template-based generation for repetitive patterns (CRUD, migrations, test boilerplate) to ensure structural consistency.</li>
          <li>Generate multi-file features sequentially, feeding each completed file as context for the next to maintain coherence.</li>
          <li>Run static analysis (mypy, tsc, eslint) immediately after generation and feed errors back for self-correction.</li>
          <li>Never accept generated code without running tests — correctness is not guaranteed by plausible appearance.</li>
          <li>For library-specific generation (ORMs, frameworks), include the library's type stubs or a usage example in the prompt.</li>
        </ul>
      </BestPracticeBlock>

      <NoteBlock type="tip" title="Measuring Generation Quality">
        <p>
          Track three metrics for every code generation task: (1) type-check pass rate on first
          attempt, (2) test pass rate after generation, and (3) number of correction iterations
          required. Improvements in context injection strategy show up immediately in these
          metrics. A generation pipeline that passes type checks on the first attempt more than
          80% of the time is well-tuned; below 50% indicates insufficient context.
        </p>
      </NoteBlock>
    </article>
  )
}
