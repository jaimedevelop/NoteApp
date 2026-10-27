const { test } = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')

// Load the TypeScript logic without initializing Firebase or contacting a database.
function load(relative) {
    const filename = path.resolve(__dirname, '..', relative)
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText
    const module = { exports: {} }
    const localRequire = name => (name.includes('firebase/database') || name === 'firebase/firestore') ? {} : load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), name + '.ts')))
    new Function('require', 'module', 'exports', compiled)(localRequire, module, module.exports)
    return module.exports
}
const { reorderTasks } = load('src/utils/taskOrder.ts')
const child = (id, parentId, status = 'pending') => ({ id, parentId, status, category: 'Work', date: '2026-10-27', childIds: [] })
const parent = (id, children = []) => ({ ...child(id, null), children, childIds: children.map(c => c.id), collapsed: true })

test('moves between parents beside the target and updates both statuses and links', () => {
    const tasks = [parent('a', [child('one', 'a', 'complete')]), parent('b', [child('two', 'b')])]
    const result = reorderTasks(tasks, 'one', 'two', true)
    assert.deepEqual(result.tasks[0].childIds, [])
    assert.equal(result.tasks[0].status, 'pending')
    assert.deepEqual(result.tasks[1].childIds, ['two', 'one'])
    assert.equal(result.tasks[1].status, 'in_progress')
    assert.equal(result.tasks[1].children[1].parentId, 'b')
    assert.equal(result.updates.get('one').parentId, 'b')
    assert.equal(result.tasks[1].collapsed, false)
    assert.deepEqual(tasks[0].childIds, ['one'])
})
test('accepts an empty main task as a destination', () => {
    const result = reorderTasks([parent('a', [child('one', 'a')]), parent('b')], 'one', 'b', false)
    assert.deepEqual(result.tasks[1].childIds, ['one'])
})
test('preserves sibling and main task reordering', () => {
    const tasks = [parent('a', [child('one', 'a'), child('two', 'a')]), parent('b')]
    assert.deepEqual(reorderTasks(tasks, 'one', 'two', true).tasks[0].childIds, ['two', 'one'])
    assert.deepEqual(reorderTasks(tasks, 'a', 'b', true).tasks.map(t => t.id), ['b', 'a'])
    assert.equal(reorderTasks(tasks, 'a', 'two', true), null)
    assert.equal(reorderTasks(tasks, 'one', 'one', false), null)
})
