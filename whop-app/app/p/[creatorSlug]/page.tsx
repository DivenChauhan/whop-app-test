import { notFound } from 'next/navigation';
import MessageForm from '@/components/MessageForm';
import { getCreatorByFeedbackLink } from '@/lib/creator';

interface PageProps {
  params: Promise<{
    creatorSlug: string;
  }>;
}

export default async function PublicFeedbackPage({ params }: PageProps) {
  const { creatorSlug } = await params;
  const creator = await getCreatorByFeedbackLink(creatorSlug);

  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Waveform Logo */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-[11px] bg-white rounded-full"></div>
              <div className="w-1 h-[18px] bg-white rounded-full"></div>
              <div className="w-1 h-[29px] bg-white rounded-full"></div>
              <div className="w-1 h-[22px] bg-white rounded-full"></div>
              <div className="w-1 h-[14px] bg-white rounded-full"></div>
            </div>
            <h1 className="text-5xl font-bold !text-white">
              Pulse
            </h1>
          </div>
          <p className="text-xl !text-white">
            Anonymous Feedback Platform
          </p>
        </div>

        {/* Message Form */}
        <MessageForm creatorId={creator.id} creatorName={creator.name} />

        {/* Footer */}
        <div className="mt-8 text-center !text-white text-sm">
          <p>Powered by Pulse • All feedback is completely anonymous</p>
        </div>
      </div>
    </div>
  );
}

