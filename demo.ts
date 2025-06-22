import { LandingPageGenerator } from './src/core/LandingPageGenerator';
import { config } from 'dotenv';
import { logger } from './src/utils/logger';

config();

async function runDemo() {
  logger.info('🚀 Starting SaaS Landing Page Generator Demo');
  const generator = new LandingPageGenerator();

  const taskFlowPro = {
    productName: "TaskFlow Pro",
    tagline: "Where Projects Meet Perfection",
    description: "AI-powered project management that adapts to your team's workflow",
    targetAudience: "Tech startups, remote teams, and digital agencies",
    features: [
      "Smart Task Prioritization",
      "Real-time Collaboration",
      "AI Meeting Summaries",
      "Automated Workflow Builder",
      "Advanced Analytics Dashboard",
      "Integration Hub"
    ],
    pricing: {
      model: "subscription" as const,
      tiers: [
        { name: "Starter", price: 29, features: ["5 users", "Basic AI", "10GB"] },
        { name: "Pro", price: 99, features: ["50 users", "Advanced AI", "100GB"] },
        { name: "Enterprise", price: 299, features: ["Unlimited", "Custom AI", "∞ storage"] }
      ]
    },
    competitors: ["Monday.com", "Asana", "Trello"],
    colorScheme: "blue" as const,
    style: "modern" as const
  };

  try {
    logger.info('Generating landing page for TaskFlow Pro...');
    const result = await generator.generateLandingPage(taskFlowPro, {
      enableABTesting: true,
      enableInteractiveDemo: true,
      enableAnalytics: true,
      deploymentTarget: 'vercel'
    });

    logger.info('✅ Landing page generated successfully!');
    logger.info(`Project ID: ${result.projectId}`);
    logger.info(`Pages created: ${result.pages.length}`);
    logger.info(`Analytics: ${result.analytics.dashboardUrl}`);    logger.info(`Deployment: ${result.deployment.status}`);
    
    // Show generated pages
    result.pages.forEach((page, index) => {
      logger.info(`\nVariant ${index + 1}:`);
      logger.info(`URL: ${page.url}`);
      logger.info(`Size: ${page.html.length} bytes`);
    });
  } catch (error) {
    logger.error('Demo failed:', error);
  }
}

// Additional examples you can try:
const examples = {
  // AI Writing Assistant
  aiWriter: {
    productName: "WriteGenius AI",
    description: "Transform your ideas into compelling content with AI",
    targetAudience: "Content creators, marketers, and businesses",
    features: ["AI Content Generation", "SEO Optimization", "Multi-language Support"],
    colorScheme: "purple" as const,
    style: "bold" as const
  },
  
  // Fitness Tracking App
  fitnessApp: {
    productName: "FitTrack Pro",
    description: "Your personal AI fitness coach in your pocket",
    targetAudience: "Fitness enthusiasts and health-conscious individuals",
    features: ["AI Workout Plans", "Nutrition Tracking", "Progress Analytics"],
    colorScheme: "green" as const,
    style: "playful" as const
  }
};

// Run the demo
runDemo().then(() => {
  logger.info('\n🎉 Demo completed! Check the generated folder for output.');
  process.exit(0);
}).catch((error) => {
  logger.error('Demo error:', error);
  process.exit(1);
});