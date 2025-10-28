import { supabase } from '@/lib/supabase';

export interface CreatorInfo {
  id: string;
  name: string;
  email: string;
  feedback_link: string;
  company_id: string;
}

/**
 * Get the creator for the current company
 * In production, there should be one creator per company
 * In development, we use a fallback creator
 */
export async function getCreatorForCompany(companyId: string): Promise<CreatorInfo | null> {
  try {
    // First, try to get the creator for this company
    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (creator && !error) {
      return creator;
    }

    // If no creator exists for this company, create one
    // This handles the case where the app is first installed
    if (error?.code === 'PGRST116') { // No rows returned
      console.log(`No creator found for company ${companyId}, creating default creator`);
      
      const defaultCreator = {
        name: 'Company Creator',
        email: `creator@company-${companyId}.com`,
        feedback_link: 'feedback',
        company_id: companyId,
      };

      const { data: newCreator, error: createError } = await supabase
        .from('creators')
        .insert(defaultCreator)
        .select()
        .single();

      if (createError) {
        console.error('Error creating default creator:', createError);
        return null;
      }

      return newCreator;
    }

    console.error('Error fetching creator:', error);
    return null;
  } catch (error) {
    console.error('Error in getCreatorForCompany:', error);
    return null;
  }
}

/**
 * Get creator by feedback link (for public submission pages)
 */
export async function getCreatorByFeedbackLink(feedbackLink: string): Promise<CreatorInfo | null> {
  try {
    const { data: creator, error } = await supabase
      .from('creators')
      .select('*')
      .eq('feedback_link', feedbackLink)
      .single();

    if (error) {
      console.error('Error fetching creator by feedback link:', error);
      return null;
    }

    return creator;
  } catch (error) {
    console.error('Error in getCreatorByFeedbackLink:', error);
    return null;
  }
}
