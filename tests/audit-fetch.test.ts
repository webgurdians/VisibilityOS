import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicIPv4,validateUrl} from '../lib/audit/fetch-public.ts';
test('rejects non-public addresses',()=>{for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','192.168.1.1','100.64.0.1','172.16.0.1','::1','198.51.100.1','203.0.113.1']) assert.equal(publicIPv4(ip),false,ip);assert.equal(publicIPv4('8.8.8.8'),true);});
test('rejects unsafe URLs',()=>{for(const u of ['file:///etc/passwd','http://127.0.0.1','http://2130706433','http://[::1]','https://user:pass@example.com','https://example.com:8080','http://foo.local']) assert.throws(()=>validateUrl(u));assert.equal(validateUrl('https://example.com/#x').href,'https://example.com/');});
