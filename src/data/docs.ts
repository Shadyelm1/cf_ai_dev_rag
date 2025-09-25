import { DocumentChunk } from '../types';

const rawDocs = [
  {
    "title": "CLI",
    "url": "https://developers.cloudflare.com/workers/get-started/guide/",
    "type": "tutorial",
    "content": "Set up and deploy your first Worker with Wrangler, the Cloudflare Developer Platform CLI.\nThis guide will instruct you through setting up and deploying your first Worker.\nPrerequisites: Sign up for a Cloudflare account and install Node.js. Use a Node version manager like Volta or nvm to avoid permission issues and change Node.js versions.\nC3 (create-cloudflare-cli) is a command-line tool designed to help you set up and deploy new applications to Cloudflare.\nTo create a new project, run commands such as `npm create cloudflare@latest -- my-first-worker`, `yarn create cloudflare my-first-worker` or `pnpm create cloudflare@latest my-first-worker`.\nDuring setup, choose the Hello World example, the Worker-only template, the JavaScript language, enable git version control, and choose not to deploy immediately.\nAfter running the setup, move into the project folder with `cd my-first-worker`.\nThe generated project contains files like `wrangler.jsonc` (Wrangler configuration), `index.js` (a minimal 'Hello World!' Worker), `package.json`, `package-lock.json`, and a `node_modules` folder.\nYou can also create projects from existing Git repositories by running `npm create cloudflare@latest -- --template <SOURCE>` where `<SOURCE>` can be a GitHub, Bitbucket, or GitLab repository.\n"
  },
  {
    "title": "Cookie parsing",
    "url": "https://developers.cloudflare.com/workers/examples/extract-cookie-value/",
    "type": "example",
    "content": "Given the cookie name, get the value of a cookie. You can also use cookies for A/B testing.\nDeploying the example creates a repository in your GitHub account and deploys the application to Cloudflare Workers.\nThe example includes implementations in JavaScript, TypeScript, Python, and using the Hono framework. Each implementation defines a Worker that parses the incoming request's cookies and responds with the value of the specified cookie (for example, a cookie named `__uid`) or a message indicating that the cookie does not exist.\n"
  },
  {
    "title": "Fetch API",
    "url": "https://developers.cloudflare.com/workers/runtime-apis/fetch/",
    "type": "api_reference",
    "content": "The Fetch API provides an interface for asynchronously fetching resources via HTTP requests inside a Worker.\nAsynchronous tasks like `fetch` must be executed within a handler; calling `fetch()` in global scope throws an error.\nWorker-to-Worker fetch requests are possible using Service bindings or by enabling the `global_fetch_strictly_public` compatibility flag.\nExample syntax shows how to use `fetch` in module workers, service workers, and Python workers. For example, an async `scheduled` handler can call `fetch('https://example.com')` with custom headers.\nService Workers are deprecated; Cloudflare recommends using Module Workers instead.\nParameters for `fetch(resource, options)` include the resource (Request, string, or URL) and options like the `cache` header. Only `no-store` or `no-cache` values are supported.\nWhen specifying the `Accept-Encoding` header, Cloudflare Workers can request compressed responses (brotli or gzip) and pass them through without decompression if the response body is not read. The brotli_content_encoding flag is required to request brotli from the origin.\n"
  },
  {
    "title": "Cache API",
    "url": "https://developers.cloudflare.com/workers/runtime-apis/cache/",
    "type": "api_reference",
    "content": "The Cache API provides a global cache object for Workers. Cached contents do not replicate outside the originating data center; each data center has its own cache.\nTiered caching is not supported by `cache.put`; use the fetch API for tiered caching. Workers deployed to custom domains and Pages functions can use the Cache API, but operations performed in the dashboard editor or Playground have no impact. The Cache API is not available for Workers behind Cloudflare Access.\nTo access the cache, use `caches.default` to reference the default cache and `await cache.match(request)` to read a cached response. Additional cache instances can be created via `await caches.open('custom:cache')`.\nWhen using the cache API, avoid overriding the hostname in cache requests to prevent unnecessary DNS lookups; always use the Worker hostname.\nResponses passed to `cache.put()` should honor headers such as `Cache-Control`, `Cache-Tag`, `ETag`, `Expires`, and `Last-Modified`. Responses with `Set-Cookie` headers are never cached unless the header is removed or `Cache-Control: private=Set-Cookie` is set on the response.\nMethods include `put(request, response)` to store a response and `match(request, options)` to retrieve a cached response. Invalid parameters (non-GET requests, status 206 responses, or responses with `Vary: *`) will cause errors, and `cache.put` returns a 413 error if caching is disabled or the response is too large.\n"
  },
  {
    "title": "Cron Triggers",
    "url": "https://developers.cloudflare.com/workers/configuration/cron-triggers/",
    "type": "configuration",
    "content": "Cron Triggers allow users to map a cron expression to a Worker using the scheduled() handler so that Workers can be executed on a schedule. They are ideal for running periodic jobs like maintenance tasks or collecting up-to-date data from third-party APIs.\nCron Triggers can be combined with Workflows to trigger multi-step, long-running tasks, and Cron-triggered Workers run on underutilized machines across Cloudflare's network. Triggers execute on UTC time.\nTo respond to a Cron Trigger, add a `scheduled` event listener to your Worker. Examples in JavaScript, TypeScript and Python show how to implement the scheduled handler to log or process jobs.\nAfter adding a scheduled handler, update your Worker project configuration via the Wrangler configuration file (wrangler.jsonc or wrangler.toml). The configuration's `triggers` object defines cron schedules using cron expressions; multiple cron expressions can be specified. Triggers can also be defined per environment.\nTo configure Cron Triggers via the Cloudflare dashboard, navigate to Workers & Pages > select your Worker > Settings > Triggers > Cron Triggers.\nSupported cron expressions follow Quartz-like syntax with five fields (minute, hour, day of month, month, and weekday). Cloudflare supports extensions like ranges, lists, step values, and special characters (L for last day, W for nearest weekday, etc.).\nExamples include `* * * * *` for every minute, `*/30 * * * *` for every 30 minutes, `45 * * * *` for the 45th minute of every hour, `0 17 * * sun` for 17:00 UTC on Sunday, `10 7 * * mon-fri` for 07:10 UTC on weekdays, `0 15 1 * *` for 15:00 UTC on the first day of the month, `0 18 * * friL` for 18:00 UTC on the last Friday of the month, and `59 23 LW * *` for 23:59 UTC on the last weekday of the month.\n"
  }
];

export const sampleDocuments: Omit<DocumentChunk, 'embedding'>[] = rawDocs.map((doc, index) => ({
  id: `cf-doc-${index}`,
  content: doc.content,
  metadata: {
    title: doc.title,
    url: doc.url,
    section: doc.type
  }
}));