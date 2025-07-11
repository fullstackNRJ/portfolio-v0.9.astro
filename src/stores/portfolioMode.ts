import { atom } from 'nanostores';

export type PortfolioMode = 'basic' | 'business' | 'business-product' | 'consultant' | 'dev' | 'story';

export const portfolioMode = atom<PortfolioMode>('basic');

export function setPortfolioMode(mode: PortfolioMode) {
  portfolioMode.set(mode);
}