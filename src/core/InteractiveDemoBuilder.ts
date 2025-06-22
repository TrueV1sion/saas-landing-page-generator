import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export interface DemoConfig {
  projectId: string;
  productName: string;
  features: string[];
  flows: Array<{
    name: string;
    steps: string[];
  }>;
}

export interface DemoRecording {
  flow: string;
  video: string;
  gif: string;
}

export class InteractiveDemoBuilder {
  private demoOutputPath: string;

  constructor() {
    this.demoOutputPath = join(process.cwd(), 'generated', 'demos');
  }

  /**
   * Create an interactive demo for the product
   */
  async createDemo(config: DemoConfig): Promise<{
    demoId: string;
    urls: {
      preview: string;
      embed: string;
      standalone: string;
    };
    recordings: DemoRecording[];
  }> {
    const demoId = uuidv4();
    logger.info(`Creating interactive demo: ${demoId}`);

    // Ensure demo directory exists
    await mkdir(join(this.demoOutputPath, demoId), { recursive: true });

    // Create demo components
    const mockupUrl = await this.createMockupUI(config, demoId);
    const recordings = await this.recordDemoFlows(mockupUrl, config.flows);
    await this.generateDemoPlayer(demoId, recordings, config);
    return {
      demoId,
      urls: {
        preview: `/demos/${demoId}/preview`,
        embed: `/demos/${demoId}/embed.js`,
        standalone: `/demos/${demoId}/standalone`,
      },
      recordings,
    };
  }

  /**
   * Create a mockup UI for demo recording
   */
  private async createMockupUI(config: DemoConfig, demoId: string): Promise<string> {
    const mockupHTML = this.generateMockupHTML(config);
    const mockupPath = join(this.demoOutputPath, demoId, 'mockup.html');
    
    await writeFile(mockupPath, mockupHTML);
    
    return `file://${mockupPath}`;
  }

  /**
   * Record demo flows using Playwright MCP
   */
  private async recordDemoFlows(
    mockupUrl: string, 
    flows: Array<{ name: string; steps: string[] }>
  ): Promise<DemoRecording[]> {
    const recordings: DemoRecording[] = [];

    for (const flow of flows) {
      logger.info(`Recording demo flow: ${flow.name}`);
      
      // Here we would use Playwright MCP to record the flow
      // For now, we'll simulate the recording process
      const recording = await this.simulateRecording(flow, mockupUrl);
      
      recordings.push({
        flow: flow.name,
        video: recording.videoPath,
        gif: recording.gifPath,
      });
    }

    return recordings;
  }
  /**
   * Simulate recording process (would use Playwright MCP in production)
   */
  private async simulateRecording(
    flow: { name: string; steps: string[] },
    mockupUrl: string
  ): Promise<{ videoPath: string; gifPath: string }> {
    // In production, this would:
    // 1. Navigate to mockupUrl using playwright-mcp:browser_navigate
    // 2. Execute each step using playwright-mcp:browser_click, browser_type, etc.
    // 3. Capture screenshots at each step
    // 4. Generate video/GIF from screenshots
    
    const timestamp = Date.now();
    return {
      videoPath: `/demos/videos/${flow.name}-${timestamp}.mp4`,
      gifPath: `/demos/gifs/${flow.name}-${timestamp}.gif`,
    };
  }

  /**
   * Generate interactive demo player
   */
  private async generateDemoPlayer(
    demoId: string,
    recordings: DemoRecording[],
    config: DemoConfig
  ): Promise<void> {
    const playerHTML = this.generatePlayerHTML(demoId, recordings, config);
    const playerPath = join(this.demoOutputPath, demoId, 'player.html');
    
    await writeFile(playerPath, playerHTML);
    
    // Also generate embed script
    const embedScript = this.generateEmbedScript(demoId);
    const embedPath = join(this.demoOutputPath, demoId, 'embed.js');
    
    await writeFile(embedPath, embedScript);
  }
  /**
   * Generate mockup HTML for demo recording
   */
  private generateMockupHTML(config: DemoConfig): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.productName} Interactive Demo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, system-ui, sans-serif; background: #f5f7fa; }
    .demo-app { min-height: 100vh; display: flex; flex-direction: column; }
    .demo-header { background: #fff; padding: 1rem 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .demo-nav { display: flex; align-items: center; justify-content: space-between; }
    .demo-logo { font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .demo-menu { display: flex; gap: 2rem; list-style: none; }
    .demo-menu a { color: #4a5568; text-decoration: none; font-weight: 500; transition: color 0.2s; }
    .demo-menu a:hover { color: #667eea; }
    .demo-sidebar { width: 280px; background: #fff; padding: 2rem; border-right: 1px solid #e2e8f0; }
    .demo-main { flex: 1; padding: 2rem; overflow-y: auto; }
    .demo-container { display: flex; flex: 1; }
    .feature-card { background: #fff; padding: 2rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer; }
    .feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
    .feature-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; color: #2d3748; }
    .feature-description { color: #718096; line-height: 1.6; }
    .demo-button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 0.75rem 2rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
    .demo-button:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }
    .pulse-effect { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); } 100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); } }
  </style>
</head>
<body>
  <div class="demo-app">
    <header class="demo-header">
      <nav class="demo-nav">
        <div class="demo-logo">${config.productName}</div>
        <ul class="demo-menu">
          ${config.features.slice(0, 4).map(f => `<li><a href="#${f.toLowerCase().replace(/\s+/g, '-')}">${f}</a></li>`).join('')}
          <li><button class="demo-button pulse-effect">Get Started</button></li>
        </ul>
      </nav>
    </header>
    <div class="demo-container">
      <aside class="demo-sidebar">
        <h3>Features</h3>
        <ul style="list-style: none; margin-top: 1rem;">
          ${config.features.map(f => `<li style="margin-bottom: 0.75rem;"><a href="#" style="color: #4a5568; text-decoration: none;">${f}</a></li>`).join('')}
        </ul>
      </aside>
      <main class="demo-main">
        ${config.features.map(f => `
          <div class="feature-card" data-feature="${f.toLowerCase().replace(/\s+/g, '-')}">
            <h2 class="feature-title">${f}</h2>
            <p class="feature-description">Experience the power of ${f} in ${config.productName}. Click to explore this feature in action.</p>
          </div>
        `).join('')}
      </main>
    </div>
  </div>
</body>
</html>`;
  }
  /**
   * Generate interactive demo player HTML
   */
  private generatePlayerHTML(
    demoId: string,
    recordings: DemoRecording[],
    config: DemoConfig
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${config.productName} Demo Player</title>
  <style>
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; }
    .demo-player { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .player-header { text-align: center; margin-bottom: 3rem; }
    .player-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem; }
    .flow-selector { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; }
    .flow-button { padding: 0.75rem 1.5rem; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
    .flow-button.active { background: #667eea; color: white; }
    .video-container { position: relative; background: #000; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .video-placeholder { width: 100%; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center; color: white; }
  </style>
</head>
<body>
  <div class="demo-player">
    <div class="player-header">
      <h1 class="player-title">${config.productName} Interactive Demo</h1>
      <p>Experience our key features in action</p>
    </div>
    <div class="flow-selector">
      ${recordings.map((rec, idx) => `
        <button class="flow-button ${idx === 0 ? 'active' : ''}" onclick="switchFlow('${rec.flow}')">
          ${rec.flow.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </button>
      `).join('')}
    </div>
    <div class="video-container">
      <div class="video-placeholder">Demo Recording: ${recordings[0]?.flow || 'No recordings'}</div>
    </div>
  </div>
  <script>
    function switchFlow(flowName) {
      console.log('Switching to flow:', flowName);
      // In production, this would load and play the actual recording
    }
  </script>
</body>
</html>`;
  }
  /**
   * Generate embeddable demo script
   */
  private generateEmbedScript(demoId: string): string {
    return `(function() {
  // SaaS Landing Page Generator - Interactive Demo Embed
  const DEMO_ID = '${demoId}';
  const DEMO_BASE_URL = '${process.env.BASE_URL || 'http://localhost:3000'}';
  
  // Create demo container
  function createDemoWidget(targetId) {
    const container = document.getElementById(targetId);
    if (!container) {
      console.error('Demo container not found:', targetId);
      return;
    }
    
    // Create iframe for demo player
    const iframe = document.createElement('iframe');
    iframe.src = DEMO_BASE_URL + '/demos/' + DEMO_ID + '/player';
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)';
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    
    container.appendChild(iframe);
    
    // Add resize observer for responsive behavior
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const width = entry.contentRect.width;
          iframe.style.height = (width * 0.5625) + 'px'; // 16:9 aspect ratio
        }
      });
      resizeObserver.observe(container);
    }
  }
  
  // Auto-initialize if data attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    const autoContainers = document.querySelectorAll('[data-saas-demo="${demoId}"]');
    autoContainers.forEach(container => {
      createDemoWidget(container.id);
    });
  });
  
  // Expose API
  window.SaaSDemo = window.SaaSDemo || {};
  window.SaaSDemo.init = createDemoWidget;
  window.SaaSDemo.demoId = DEMO_ID;
})();`;
  }
}