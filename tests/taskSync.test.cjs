const { test } = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
function load(file, imports = {}) {
    const compiled = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText
    const module = { exports: {} }
    new Function('require', 'module', 'exports', compiled)(name => imports[name] ?? {}, module, module.exports)
    return module.exports
}
const { WriteQueue } = load('src/utils/writeQueue.ts')
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }

test('dependent writes wait for creation while other categories save concurrently', async () => {
    const queue = new WriteQueue(), gate = deferred(), events = []
    const create = queue.enqueue('work', async () => { events.push('create'); await gate.promise })
    const edit = queue.enqueue('work', async () => { events.push('edit') })
    await queue.enqueue('personal', async () => { events.push('independent') })
    assert.deepEqual(events, ['create', 'independent'])
    gate.resolve()
    await Promise.all([create, edit])
    assert.deepEqual(events, ['create', 'independent', 'edit'])
})
test('a rejected save does not discard subsequent queued saves', async () => {
    const queue = new WriteQueue(), events = []
    const failed = queue.enqueue('work', async () => { throw new Error('offline') })
    const next = queue.enqueue('work', async () => { events.push('saved') })
    await assert.rejects(failed, /offline/)
    await next
    assert.deepEqual(events, ['saved'])
})

function serviceFixture(initial) {
    const records = new Map(Object.entries(initial))
    const calls = { reads: 0, commits: 0 }
    const snapshot = ref => ({ id: ref.id, exists: () => records.has(ref.id), data: () => records.get(ref.id) })
    const transaction = {
        get: async ref => { calls.reads++; return snapshot(ref) },
        set: (ref, value) => records.set(ref.id, value),
        update: (ref, value) => {
            const next = { ...value }
            if (next.childIds?.union) next.childIds = [...new Set([...(records.get(ref.id)?.childIds ?? []), next.childIds.union])]
            records.set(ref.id, { ...records.get(ref.id), ...next })
        },
    }
    const service = load('src/services/taskService.ts', {
        'firebase/firestore': { collection: () => ({}), doc: (_col, id) => ({ id }),
            runTransaction: async (_db, fn) => fn(transaction), serverTimestamp: () => null,
            arrayUnion: id => ({ union: id }),
            writeBatch: () => ({ ...transaction, commit: async () => { calls.commits++ } }) },
        '../firebase/database': { db: {}, updateTask: async (_uid, id, updates) => { transaction.update({ id }, updates); calls.commits++ } },
    })
    return { records, service, calls }
}
test('subtask creation preserves sibling links and derives parent status in the transaction', async () => {
    const { records, service } = serviceFixture({ parent: { childIds: ['one'] }, one: { status: 'complete' } })
    await service.createSubTask('user', 'parent', { title: 'Two', status: 'pending' }, 'two')
    await service.createSubTask('user', 'parent', { title: 'Three', status: 'pending' }, 'three')
    assert.deepEqual(records.get('parent').childIds, ['one', 'two', 'three'])
    assert.equal(records.get('parent').status, 'in_progress')
    assert.equal(records.get('two').parentId, 'parent')
})
test('status writes derive the parent from the new status and current siblings', async () => {
    const { records, service } = serviceFixture({ parent: { childIds: ['one', 'two'] },
        one: { parentId: 'parent', status: 'pending' }, two: { parentId: 'parent', status: 'complete' } })
    await service.updateTask('user', 'one', { status: 'complete' })
    assert.equal(records.get('parent').status, 'complete')
    await service.updateTask('user', 'two', { status: 'pending' })
    assert.equal(records.get('parent').status, 'in_progress')
})

test('ledger parent status changes use one write with no transaction reads', async () => {
    const { records, service, calls } = serviceFixture({ parent: { status: 'pending' } })
    await service.updateTask('user', 'parent', { status: 'complete' }, { parentId: null })
    assert.equal(records.get('parent').status, 'complete')
    assert.deepEqual(calls, { reads: 0, commits: 1 })
})
test('ledger child status and derived parent status commit together without server reads', async () => {
    const { records, service, calls } = serviceFixture({ parent: { status: 'pending' }, child: { status: 'pending' } })
    await service.updateTask('user', 'child', { status: 'complete' }, { parentId: 'parent', parentStatus: 'complete' })
    assert.equal(records.get('child').status, 'complete')
    assert.equal(records.get('parent').status, 'complete')
    assert.deepEqual(calls, { reads: 0, commits: 1 })
})
test('ledger subtask creation uses atomic append without reading every sibling', async () => {
    const { records, service, calls } = serviceFixture({ parent: { childIds: ['existing'] } })
    await service.createSubTask('user', 'parent', { title: 'New', status: 'pending' }, 'new', 'pending')
    assert.deepEqual(records.get('parent').childIds, ['existing', 'new'])
    assert.deepEqual(calls, { reads: 0, commits: 1 })
})
