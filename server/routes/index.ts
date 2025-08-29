import { Application } from 'express';
import userRoutes from './user.routes';
import accountRoutes from './account.routes';
import tradeRoutes from './trade.routes';
import aiRoutes from './ai.routes';
import portfolioRoutes from './portfolio.routes';
import socialRoutes from './social.routes';
import cmsRoutes from './cms.routes';
import authRoutes from './auth.routes';
import paymentRoutes from './payment.routes';
import testRoutes from './test.routes';

export const registerRoutes = (app: Application) => {
  app.use(userRoutes);
  app.use(accountRoutes);
  app.use(tradeRoutes);
  app.use(aiRoutes);
  app.use(portfolioRoutes);
  app.use(socialRoutes);
  app.use(cmsRoutes);
  app.use(authRoutes);
  app.use(paymentRoutes);
  app.use(testRoutes);
};
