import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.development.local') });
dotenv.config({ path: path.join(__dirname, '../.env.development') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CREATOR_ID = '00000000-0000-0000-0000-000000000001';

const testMessages = [
  { message: "Love this product! It's been a game changer for my workflow 🚀", tag: 'feedback', product_category: 'main_product' },
  { message: "When will you add dark mode? Really need this feature!", tag: 'question', product_category: 'feature_request' },
  { message: "Found a bug where the app crashes when I try to export data", tag: 'feedback', product_category: 'bug_report' },
  { message: "Your customer service team is amazing! Shoutout to the support crew", tag: 'feedback', product_category: 'service' },
  { message: "Can you add integration with Slack? Would be super helpful", tag: 'question', product_category: 'feature_request' },
  { message: "Honestly, this saved me 10 hours of work this week. Thank you!", tag: 'feedback', product_category: 'main_product' },
  { message: "Is there a mobile app coming soon? Would love to use this on the go", tag: 'question', product_category: 'feature_request' },
  { message: "The new update is incredible! Performance is way better now", tag: 'feedback', product_category: 'main_product' },
  { message: "How do I cancel my subscription? Can't find the option", tag: 'question', product_category: 'service' },
  { message: "This is exactly what I've been looking for. Best purchase ever!", tag: 'feedback', product_category: 'main_product' },
  { message: "Would be great to have a team plan with more users", tag: 'feedback', product_category: 'feature_request' },
  { message: "The UI is so clean and intuitive. Great design work!", tag: 'feedback', product_category: 'main_product' },
];

async function seedData() {
  console.log('🌱 Starting to seed test data...\n');

  // Insert messages
  console.log('📝 Creating test messages...');
  const { data: messages, error: messageError } = await supabase
    .from('messages')
    .insert(
      testMessages.map(msg => ({
        ...msg,
        creator_id: CREATOR_ID,
        reviewed: false,
      }))
    )
    .select();

  if (messageError) {
    console.error('❌ Error creating messages:', messageError);
    return;
  }

  console.log(`✅ Created ${messages.length} messages\n`);

  // Add reactions to messages to make some "hot"
  console.log('❤️ Adding reactions to messages...');
  
  const reactions = [];
  const emojis = ['👍', '❤️', '🔥', '😱'];

  // Make the first 5 messages "hot" with 5+ reactions each
  for (let i = 0; i < Math.min(5, messages.length); i++) {
    const reactionCount = 5 + Math.floor(Math.random() * 10); // 5-14 reactions
    console.log(`  Adding ${reactionCount} reactions to message ${i + 1}`);
    
    for (let j = 0; j < reactionCount; j++) {
      reactions.push({
        message_id: messages[i].id,
        reaction_type: emojis[Math.floor(Math.random() * emojis.length)],
        user_hash: `user_${Math.random().toString(36).substring(2, 15)}`,
      });
    }
  }

  // Add 1-4 reactions to the remaining messages
  for (let i = 5; i < messages.length; i++) {
    const reactionCount = Math.floor(Math.random() * 4) + 1; // 1-4 reactions
    console.log(`  Adding ${reactionCount} reactions to message ${i + 1}`);
    
    for (let j = 0; j < reactionCount; j++) {
      reactions.push({
        message_id: messages[i].id,
        reaction_type: emojis[Math.floor(Math.random() * emojis.length)],
        user_hash: `user_${Math.random().toString(36).substring(2, 15)}`,
      });
    }
  }

  const { error: reactionError } = await supabase
    .from('reactions')
    .insert(reactions);

  if (reactionError) {
    console.error('❌ Error creating reactions:', reactionError);
    return;
  }

  console.log(`✅ Created ${reactions.length} reactions\n`);

  // Display summary
  console.log('📊 Summary:');
  console.log(`  • ${messages.length} messages created`);
  console.log(`  • ${reactions.length} reactions added`);
  console.log(`  • 5 messages should appear as "Hot" (5+ reactions)`);
  console.log(`  • ${messages.length - 5} messages with 1-4 reactions\n`);
  
  console.log('✨ Seed data created successfully!');
  console.log('🔥 Check your feed page to see the hot posts section!');
}

seedData();

