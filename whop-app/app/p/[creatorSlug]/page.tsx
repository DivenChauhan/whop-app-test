import { notFound } from 'next/navigation';
import MessageForm from '@/components/FeedbackForm';

interface PageProps {
  params: Promise<{
    creatorSlug: string;
  }>;
}

async function getCreator(slug: string) {
  try {
    // In production, this would be a server-side fetch
    // For now, we'll return mock data
    // TODO: Connect to actual Supabase in production
    return {
      id: 'test-creator-id',
      name: 'Test Creator',
      email: 'test@example.com',
      feedback_link: slug,
    };
  } catch (error) {
    console.error('Error fetching creator:', error);
    return null;
  }
}

export default async function PublicFeedbackPage({ params }: PageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreator(creatorSlug);

  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-9 via-accent-10 to-accent-11 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            📊 Pulse
          </h1>
          <p className="text-xl text-white/90">
            Anonymous Feedback Platform
          </p>
        </div>

        {/* Message Form */}
        <MessageForm creatorId={creator.id} creatorName={creator.name} />

        {/* Footer */}
        <div className="mt-8 text-center text-white/70 text-sm">
          <p>Powered by Pulse • All feedback is completely anonymous</p>
        </div>
      </div>
    </div>
  );
}

