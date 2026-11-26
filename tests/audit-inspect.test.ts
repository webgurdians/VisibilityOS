import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectHtml } from '../lib/audit/inspect.ts';
test('extracts basic declarations',()=>{
 const r=inspectHtml('<title>Example</title><meta content="Description" name="description"><link rel="canonical" href="https://example.com"><script type="application/ld+json">{}</script>');
 assert.equal(r[0].evidence,'Example'); assert.equal(r[1].evidence,'Description'); assert.equal(r[2].status,'pass'); assert.equal(r[4].status,'pass');
});
test('missing declarations and noindex',()=>{
 const r=inspectHtml('<!-- <title>Fake</title> --><meta name="robots" content="noindex">');
 assert.equal(r[0].status,'warning'); assert.equal(r[3].status,'warning');
});
