# Vercel Deployment Configuration

This project is configured for seamless deployment on Vercel with the following optimizations:

## Prerequisites

1. **Environment Variables**: Configure these in your Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   REDIS_URL=your_redis_connection_string
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   JWT_SECRET=your_jwt_secret
   ```

2. **Database**: Ensure you have a PostgreSQL database (Vercel Postgres, Supabase, or Neon recommended)

3. **Redis**: Set up a Redis instance (Upstash Redis recommended for Vercel)

## Deployment Steps

1. **Connect GitHub Repository**:
   ```bash
   vercel link
   vercel git connect
   ```

2. **Configure Environment Variables**:
   - Go to your Vercel project settings
   - Add all required environment variables from `.env.example`

3. **Database Setup**:
   ```bash
   # Run locally first to generate migration files
   npm run db:migrate
   
   # In Vercel, these will run automatically via build command
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

## Build Configuration

The `vercel.json` file includes:
- Node.js serverless function configuration
- Proper routing for API endpoints
- Static file serving for generated landing pages
- Build commands for TypeScript and Prisma
- Memory and timeout optimizations

## Troubleshooting

### Common Issues:

1. **Database Connection**:
   - Ensure `DATABASE_URL` includes `?sslmode=require` for Vercel Postgres
   - Add `?connection_limit=1` to prevent connection pooling issues

2. **Redis Connection**:
   - Use Upstash Redis for serverless compatibility
   - Ensure proper TLS configuration

3. **Build Errors**:
   - Check TypeScript compilation with `npm run build` locally
   - Ensure all dependencies are in `dependencies`, not `devDependencies`

4. **Function Timeouts**:
   - Default timeout is set to 30 seconds
   - Adjust in `vercel.json` if needed for AI operations

## Performance Optimizations

1. **Edge Functions**: Consider moving lightweight endpoints to Edge Functions
2. **ISR**: Implement Incremental Static Regeneration for landing pages
3. **CDN**: Utilize Vercel's CDN for static assets
4. **Image Optimization**: Use Vercel's Image Optimization API

## Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **CORS**: Configure allowed origins properly
3. **Rate Limiting**: Implemented via middleware
4. **Authentication**: JWT-based with secure secret rotation

## Monitoring

1. **Vercel Analytics**: Automatically included
2. **Custom Analytics**: Integrated with the project
3. **Error Tracking**: Configure Sentry or similar
4. **Performance Monitoring**: Use Vercel's built-in tools

## Scaling

The application is designed to scale automatically with Vercel's infrastructure:
- Serverless functions scale to zero
- Automatic regional deployment
- Database connection pooling via Prisma
- Redis caching for performance

## CI/CD Pipeline

GitHub integration provides:
- Automatic preview deployments for PRs
- Production deployments on main branch
- Rollback capabilities
- Environment variable management per branch

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test build locally with `vercel dev`
4. Contact support with deployment ID