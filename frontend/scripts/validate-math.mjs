import katex from 'katex'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  root: projectRoot,
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  server: {
    middlewareMode: true
  }
})

const failures = []
let expressionCount = 0

const validateString = (value, contentPath) => {
  const mathPattern = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g
  let match

  while ((match = mathPattern.exec(value)) !== null) {
    const displayMode = match[1] !== undefined
    const expression = (match[1] ?? match[2]).trim()
    if (!expression) continue

    expressionCount += 1
    try {
      katex.renderToString(expression, {
        displayMode,
        throwOnError: true,
        trust: false,
        strict: 'error'
      })
    } catch (error) {
      failures.push({
        contentPath,
        expression,
        message: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

const visit = (value, contentPath) => {
  if (typeof value === 'string') {
    validateString(value, contentPath)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(item, `${contentPath}[${index}]`))
    return
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => visit(item, `${contentPath}.${key}`))
  }
}

try {
  const [{ practiceExams }, { blogPosts }] = await Promise.all([
    server.ssrLoadModule('/src/data/practiceExams.js'),
    server.ssrLoadModule('/src/data/blogPosts.js')
  ])

  visit(practiceExams, 'practiceExams')
  visit(blogPosts, 'blogPosts')
} finally {
  await server.close()
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`\n${failure.contentPath}`)
    console.error(failure.expression)
    console.error(failure.message)
  }
  console.error(`\nMath validation failed: ${failures.length}/${expressionCount} expressions invalid.`)
  process.exitCode = 1
} else {
  console.log(`Math validation passed: ${expressionCount} expressions parsed by KaTeX.`)
}
