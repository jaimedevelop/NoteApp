const { test } = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')
const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/utils/appointmentLayout.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const loaded = { exports: {} }
new Function('module', 'exports', compiled)(loaded, loaded.exports)
const { appointmentPlacement, positionAppointments } = loaded.exports
const task = (id, startMinute, endMinute) => ({ id, startMinute, endMinute })

test('dropping a tray task onto an appointment keeps an hour and splits both widths', () => {
  const existing = task('existing', 540, 600)
  const placed = appointmentPlacement({ id: 'new' }, 555)
  assert.deepEqual(placed, { start: 555, end: 615, valid: true })
  const layout = positionAppointments([existing, task('new', placed.start, placed.end)])
  assert.deepEqual(layout.map(({ lane, laneCount }) => [lane, laneCount]), [[0, 2], [1, 2]])
})
test('moving an appointment preserves duration and supports three overlapping lanes', () => {
  const placed = appointmentPlacement(task('moved', 300, 390), 555)
  assert.equal(placed.end, 645)
  assert.equal(placed.valid, true)
  const layout = positionAppointments([task('a', 540, 600), task('b', 550, 610), task('moved', 555, placed.end)])
  assert.deepEqual(layout.map(({ lane, laneCount }) => [lane, laneCount]), [[0, 3], [1, 3], [2, 3]])
})
test('reuses lanes at touching endpoints and restores full width after a group', () => {
  const layout = positionAppointments([task('d', 650, 700), task('c', 600, 650), task('b', 570, 630), task('a', 540, 600)])
  assert.deepEqual(layout.map(({ lane, laneCount }) => [lane, laneCount]), [[0, 2], [1, 2], [0, 2], [0, 1]])
})
test('respects day boundaries without shortening a moved appointment', () => {
  assert.equal(appointmentPlacement(task('a', 540, 600), 1410).valid, false)
  assert.deepEqual(appointmentPlacement({ id: 'new' }, 1425), { start: 1425, end: 1440, valid: true })
  assert.equal(appointmentPlacement({ id: 'new' }, -15).valid, false)
})
