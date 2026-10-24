import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLocal, readLocal, writeLocal } from '../src/storage.ts';

test('malformed local data falls back to safe preferences and never restores a game state', () => {
  for (const raw of [null, '', '{', 'null', '[]', '7', '"text"']) {
    assert.deepEqual(parseLocal(raw), {muted:false, trace:[]});
  }
  assert.deepEqual(parseLocal(JSON.stringify({muted:'true', mode:'won', coreHealth:99, wards:[{r:999}]})), {muted:false, trace:[]});
  assert.deepEqual(parseLocal(JSON.stringify({muted:true, trace:'bad'})), {muted:true, trace:[]});
});

test('local evidence rejects malformed entries and bounds the retained trace', () => {
  const valid = {event:'commit', time:3, wave:1, rematch:false, site:'A', r:2};
  const data = parseLocal(JSON.stringify({trace:[null, {}, {event:'bad',time:'3',wave:1}, {event:'bad',time:3}, valid]}));
  assert.deepEqual(data.trace, [valid]);
  const many = Array.from({length:600}, (_,i) => ({...valid, time:i}));
  const bounded = parseLocal(JSON.stringify({trace:many}));
  assert.equal(bounded.trace.length, 500);
  assert.equal(bounded.trace[0].time, 100);
  assert.equal(bounded.trace.at(-1)?.time, 599);
});

test('unavailable storage cannot block starting or playing the game', () => {
  assert.deepEqual(readLocal(), {muted:false, trace:[]});
  assert.doesNotThrow(() => writeLocal(true, []));
});
