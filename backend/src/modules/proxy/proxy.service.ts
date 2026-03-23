import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly configService: ConfigService) {}

  async proxySite(target: string, path: string, res: Response, token?: string): Promise<void> {
    try {
      if (!target) {
        throw new BadRequestException('target query parameter is required');
      }

      const baseUrl = target.replace(/\/$/, '');
      const fullUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

      this.logger.log(`Proxying site: ${fullUrl}`);

      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        res.status(response.status).send(`Failed to fetch: ${response.statusText}`);
        return;
      }

      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('text/html')) {
        const buffer = Buffer.from(await response.arrayBuffer());
        res.set('Content-Type', contentType);
        res.send(buffer);
        return;
      }

      let html = await response.text();

      const apiUrl = `${this.configService.get<string>('FRONTEND_URL')?.replace('5173', '3001') || 'http://localhost:3001'}/api/v1/proxy`;

      const tokenSuffix = token ? `&token=${encodeURIComponent(token)}` : '';
      html = this.rewriteUrls(html, baseUrl, apiUrl, tokenSuffix);
      html = this.injectLocationOverride(html, fullUrl);
      html = this.injectInspectorScript(html, apiUrl);

      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (error) {
      this.logger.error(`Proxy error: ${(error as Error).message}`);
      if (error instanceof BadRequestException) throw error;
      res.status(502).send(`Proxy error: ${(error as Error).message}`);
    }
  }

  async proxyResource(url: string, res: Response, token?: string): Promise<void> {
    try {
      if (!url) {
        throw new BadRequestException('url query parameter is required');
      }

      this.logger.log(`Proxying resource: ${url}`);

      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        res.status(response.status).send('Resource not found');
        return;
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const apiUrl = `${this.configService.get<string>('FRONTEND_URL')?.replace('5173', '3001') || 'http://localhost:3001'}/api/v1/proxy`;
      const tokenSuffix = token ? `&token=${encodeURIComponent(token)}` : '';

      // For CSS files, rewrite url() references inside the CSS
      if (contentType.includes('text/css')) {
        let css = await response.text();
        const resourceOrigin = new URL(url).origin;

        css = css.replace(
          /url\(["']?(?!data:|blob:)(\/[^"')]+)["']?\)/gi,
          (_, path) => `url("${apiUrl}/resource?url=${encodeURIComponent(resourceOrigin + path)}${tokenSuffix}")`,
        );

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(css);
        return;
      }

      // For JS files, rewrite dynamic import() calls with relative paths
      if (contentType.includes('javascript')) {
        let js = await response.text();
        const resourceBaseUrl = url.substring(0, url.lastIndexOf('/') + 1);

        // Rewrite import("./chunk.js") and import('./chunk.js')
        js = js.replace(
          /import\(["'](\.[^"']+)["']\)/g,
          (_, relativePath) => {
            const resolved = new URL(relativePath, resourceBaseUrl).href;
            return `import("${apiUrl}/resource?url=${encodeURIComponent(resolved)}${tokenSuffix}")`;
          },
        );

        res.set('Content-Type', contentType);
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(js);
        return;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(buffer);
    } catch (error) {
      this.logger.error(`Resource proxy error: ${(error as Error).message}`);
      res.status(502).send('Resource proxy error');
    }
  }

  private rewriteUrls(html: string, baseUrl: string, apiUrl: string, tokenSuffix: string = ''): string {
    const origin = new URL(baseUrl).origin;

    // Rewrite absolute https:// URLs in href/src/action
    html = html.replace(
      /(href|src|action)=["'](https?:\/\/[^"']+)["']/gi,
      (_, attr, url) => `${attr}="${apiUrl}/resource?url=${encodeURIComponent(url)}${tokenSuffix}"`,
    );

    // Rewrite protocol-relative URLs (//cdn.example.com/...)
    html = html.replace(
      /(href|src|action)=["'](?!data:|javascript:|mailto:|#|blob:)(\/\/[^"']+)["']/gi,
      (_, attr, url) => `${attr}="${apiUrl}/resource?url=${encodeURIComponent('https:' + url)}${tokenSuffix}"`,
    );

    // Rewrite root-relative URLs (/path/to/resource)
    html = html.replace(
      /(href|src|action)=["'](?!data:|javascript:|mailto:|#|blob:|https?:\/\/|\/\/)(\/[^"']*)["']/gi,
      (_, attr, path) => `${attr}="${apiUrl}/resource?url=${encodeURIComponent(origin + path)}${tokenSuffix}"`,
    );

    // Rewrite CSS url() references
    html = html.replace(
      /url\(["']?(?!data:|blob:)(\/[^"')]+)["']?\)/gi,
      (_, path) => `url("${apiUrl}/resource?url=${encodeURIComponent(origin + path)}${tokenSuffix}")`,
    );

    return html;
  }

  private injectLocationOverride(html: string, originalUrl: string): string {
    const parsed = new URL(originalUrl);
    const script = `<script>
(function() {
  // Override location so SPA routers (React Router, etc.) see the original URL path
  var origUrl = ${JSON.stringify(originalUrl)};
  var parsed = new URL(origUrl);
  history.replaceState(null, '', parsed.pathname + parsed.search + parsed.hash);
})();
</script>`;

    // Inject as early as possible — right after <head> or at the start
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>' + script);
    } else if (html.includes('<head ')) {
      html = html.replace(/<head[^>]*>/, (match) => match + script);
    } else {
      html = script + html;
    }

    return html;
  }

  private injectInspectorScript(html: string, apiUrl: string): string {
    const inspectorScript = `
<style>
  .siren-highlight {
    outline: 2px solid #4F46E5 !important;
    outline-offset: 2px !important;
    cursor: crosshair !important;
  }
  .siren-selected {
    outline: 3px solid #10B981 !important;
    outline-offset: 2px !important;
  }
</style>
<script>
(function() {
  let inspectMode = false;
  let lastHighlighted = null;

  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SIREN_TOGGLE_INSPECT') {
      inspectMode = event.data.enabled;
      document.body.style.cursor = inspectMode ? 'crosshair' : '';
      if (!inspectMode && lastHighlighted) {
        lastHighlighted.classList.remove('siren-highlight');
        lastHighlighted = null;
      }
    }
  });

  document.addEventListener('mouseover', function(e) {
    if (!inspectMode) return;
    if (lastHighlighted) lastHighlighted.classList.remove('siren-highlight');
    e.target.classList.add('siren-highlight');
    lastHighlighted = e.target;
  });

  document.addEventListener('mouseout', function(e) {
    if (!inspectMode) return;
    e.target.classList.remove('siren-highlight');
  });

  document.addEventListener('click', function(e) {
    if (!inspectMode) return;
    e.preventDefault();
    e.stopPropagation();

    const el = e.target;
    const selectors = [];

    // ID
    if (el.id) {
      selectors.push({ strategy: 'id', value: '#' + el.id, display: 'ID: #' + el.id });
    }

    // data-cy
    if (el.getAttribute('data-cy')) {
      selectors.push({ strategy: 'data-cy', value: '[data-cy="' + el.getAttribute('data-cy') + '"]', display: 'data-cy: ' + el.getAttribute('data-cy') });
    }

    // data-testid
    if (el.getAttribute('data-testid')) {
      selectors.push({ strategy: 'data-testid', value: '[data-testid="' + el.getAttribute('data-testid') + '"]', display: 'data-testid: ' + el.getAttribute('data-testid') });
    }

    // name
    if (el.getAttribute('name')) {
      selectors.push({ strategy: 'name', value: '[name="' + el.getAttribute('name') + '"]', display: 'name: ' + el.getAttribute('name') });
    }

    // placeholder
    if (el.getAttribute('placeholder')) {
      selectors.push({ strategy: 'placeholder', value: '[placeholder="' + el.getAttribute('placeholder') + '"]', display: 'placeholder: ' + el.getAttribute('placeholder') });
    }

    // Classes
    if (el.className && typeof el.className === 'string') {
      var classes = el.className.split(' ').filter(function(c) { return c && !c.startsWith('siren-'); });
      if (classes.length > 0) {
        selectors.push({ strategy: 'class', value: '.' + classes.join('.'), display: 'class: .' + classes.join('.') });
      }
    }

    // CSS (tag + nth-child)
    var tag = el.tagName.toLowerCase();
    var parent = el.parentElement;
    if (parent) {
      var siblings = Array.from(parent.children);
      var index = siblings.indexOf(el) + 1;
      selectors.push({ strategy: 'css', value: tag + ':nth-child(' + index + ')', display: 'CSS: ' + tag + ':nth-child(' + index + ')' });
    }

    // Tag
    selectors.push({ strategy: 'tag', value: tag, display: 'tag: ' + tag });

    // Determine element type
    var elementType = 'other';
    var tagLower = tag;
    if (tagLower === 'input') {
      var inputType = (el.getAttribute('type') || 'text').toLowerCase();
      if (inputType === 'checkbox') elementType = 'checkbox';
      else if (inputType === 'radio') elementType = 'radio';
      else elementType = 'input';
    } else if (tagLower === 'button' || (tagLower === 'input' && el.type === 'submit')) elementType = 'button';
    else if (tagLower === 'select') elementType = 'select';
    else if (tagLower === 'textarea') elementType = 'textarea';
    else if (tagLower === 'a') elementType = 'link';
    else if (tagLower === 'label') elementType = 'label';
    else if (tagLower === 'img') elementType = 'image';
    else if (tagLower === 'table') elementType = 'table';
    else if (['h1','h2','h3','h4','h5','h6'].indexOf(tagLower) !== -1) elementType = 'heading';
    else if (tagLower === 'div') elementType = 'div';
    else if (tagLower === 'span') elementType = 'span';

    window.parent.postMessage({
      type: 'SIREN_ELEMENT_SELECTED',
      elementType: elementType,
      selectors: selectors,
      tagName: tag,
      text: (el.textContent || '').substring(0, 100).trim()
    }, '*');

    el.classList.remove('siren-highlight');
    el.classList.add('siren-selected');

    setTimeout(function() {
      el.classList.remove('siren-selected');
    }, 2000);
  }, true);
})();
</script>`;

    // Inject before </body> or at end
    if (html.includes('</body>')) {
      html = html.replace('</body>', inspectorScript + '</body>');
    } else {
      html += inspectorScript;
    }

    return html;
  }
}
