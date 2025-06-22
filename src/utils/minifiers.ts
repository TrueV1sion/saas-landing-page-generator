import { logger } from './logger';

export async function minifyHTML(html: string): Promise<string> {
  try {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  } catch (error) {
    logger.error('HTML minification failed:', error);
    return html;
  }
}

export async function minifyCSS(css: string): Promise<string> {
  try {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  } catch (error) {
    logger.error('CSS minification failed:', error);
    return css;
  }
}

export async function minifyJS(js: string): Promise<string> {
  try {
    return js
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,=\(\)])\s*/g, '$1')
      .trim();
  } catch (error) {
    logger.error('JS minification failed:', error);
    return js;
  }
}