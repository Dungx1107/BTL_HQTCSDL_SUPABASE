import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Dummy documents to seed
const documents = [
  {
    title: "Laptop Pro",
    content: "High performance laptop for developers with 32GB RAM and 1TB SSD. Perfect for fast computing tasks.",
  },
  {
    title: "4K Monitor",
    content: "32-inch 4K UHD Monitor for crystal clear display and wide viewing angles. Great for graphic design.",
  },
  {
    title: "Mechanical Keyboard",
    content: "RGB mechanical keyboard with blue switches. Tactile feedback for typing and gaming.",
  },
  {
    title: "Wireless Mouse",
    content: "Ergonomic wireless mouse with ultra-fast tracking and long battery life.",
  },
  {
    title: "Noise Cancelling Headphones",
    content: "Over-ear headphones with active noise cancellation (ANC). Perfect for deep focus.",
  }
];

async function seed() {
  console.log("Loading AI Model (Xenova/all-MiniLM-L6-v2)...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Generating vectors and inserting into Database...");

  for (const doc of documents) {
    // Generate embedding (384 dimensions)
    const output = await extractor(doc.content, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    // Insert into Supabase
    const { error } = await supabase.from('documents').insert({
      title: doc.title,
      content: doc.content,
      embedding: embedding
    });

    if (error) {
      console.error(`Failed to insert ${doc.title}:`, error);
    } else {
      console.log(`✅ Inserted document: ${doc.title}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
