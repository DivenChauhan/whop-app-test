import { requireCreator } from '@/lib/auth';
import { getCreatorForCompany } from '@/lib/creator';
import DashboardContent from './DashboardContent';
import { notFound } from 'next/navigation';

export default async function DashboardPage() {
  // Protect this page - only creators can access
  const auth = await requireCreator();
  
  if (!auth.companyId) {
    throw new Error('Company ID not found');
  }

  // Get the creator for this company dynamically
  const creator = await getCreatorForCompany(auth.companyId);
  
  if (!creator) {
    notFound();
  }
  
  return <DashboardContent creatorId={creator.id} creatorSlug={creator.feedback_link} />;
}
