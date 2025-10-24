import { requireCreator } from '@/lib/auth';
import SettingsContent from './SettingsContent';

// This page is creator-only - protected by authentication
export default async function SettingsPage() {
  // Protect this page - only creators can access
  await requireCreator();
  
  return <SettingsContent />;
}
