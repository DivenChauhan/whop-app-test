import { requireCreator } from '@/lib/auth';
import DashboardContent from './DashboardContent';

// This page is creator-only - protected by authentication
const CREATOR_ID = '00000000-0000-0000-0000-000000000001';
const CREATOR_SLUG = 'testcreator';

export default async function DashboardPage() {
  // Protect this page - only creators can access
  await requireCreator();
  
  return <DashboardContent creatorId={CREATOR_ID} creatorSlug={CREATOR_SLUG} />;
}
