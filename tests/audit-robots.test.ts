import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateRobots,inspectRobots,inspectSitemap} from '../lib/audit/robots.ts';
test('specific group overrides wildcard and longest rule wins',()=>{const body='User-agent: *\nDisallow: /\nUser-agent: GPTBot\nDisallow: /private\nAllow: /private/public';assert.equal(evaluateRobots(body,'GPTBot','/').status,'allowed');assert.equal(evaluateRobots(body,'GPTBot','/private').status,'disallowed');assert.equal(evaluateRobots(body,'GPTBot','/private/public').status,'allowed');assert.equal(evaluateRobots(body,'Googlebot','/').status,'disallowed');});
test('wildcards and end anchors',()=>{const body='User-agent: *\nDisallow: /*.pdf$';assert.equal(evaluateRobots(body,'GPTBot','/a.pdf').status,'disallowed');assert.equal(evaluateRobots(body,'GPTBot','/a.pdf?q=1').status,'allowed');});
test('failed retrieval is unknown',()=>assert.equal(inspectRobots(503,'').agents[0].status,'unknown'));
test('sitemap detection',()=>{assert.equal(inspectRobots(200,'Sitemap: https://example.com/sitemap.xml').sitemaps.length,1);assert.equal(inspectSitemap(200,'<urlset><url><loc>https://example.com/</loc></url></urlset>').locations,1);assert.equal(inspectSitemap(200,'<html>error</html>').status,'unknown');});
