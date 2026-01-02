import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { adminUsers, llmProviders, llmModels } from './schema';

config({ path: '.env' });

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('Seeding database...');

  // Insert first admin user
  const [admin] = await db
    .insert(adminUsers)
    .values({
      name: 'Kasun Perera',
      email: 'kasun.p@emarketingeye.com',
      role: 'super_admin',
    })
    .onConflictDoNothing({ target: adminUsers.email })
    .returning();

  if (admin) {
    console.log('Created admin user:', admin.email);
  } else {
    console.log('Admin user already exists');
  }

  // Seed LLM Providers
  console.log('Seeding LLM providers...');

  const providersData = [
    {
      name: 'openai',
      displayName: 'OpenAI',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    },
    {
      name: 'google',
      displayName: 'Google AI',
      logoUrl: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
    },
  ];

  const insertedProviders: { id: string; name: string }[] = [];

  for (const providerData of providersData) {
    const [provider] = await db
      .insert(llmProviders)
      .values(providerData)
      .onConflictDoNothing()
      .returning({ id: llmProviders.id, name: llmProviders.name });

    if (provider) {
      insertedProviders.push(provider);
      console.log(`Created provider: ${providerData.displayName}`);
    } else {
      // Get existing provider ID
      const [existing] = await db
        .select({ id: llmProviders.id, name: llmProviders.name })
        .from(llmProviders)
        .where(eq(llmProviders.name, providerData.name))
        .limit(1);
      if (existing) {
        insertedProviders.push(existing);
        console.log(`Provider already exists: ${providerData.displayName}`);
      }
    }
  }

  // Seed LLM Models
  console.log('Seeding LLM models...');

  const openaiProvider = insertedProviders.find((p) => p.name === 'openai');
  const googleProvider = insertedProviders.find((p) => p.name === 'google');

  const modelsData = [
    // OpenAI Models
    ...(openaiProvider
      ? [
          {
            providerId: openaiProvider.id,
            modelId: 'gpt-4o',
            displayName: 'GPT-4o',
            inputCostPer1k: '0.005',
            outputCostPer1k: '0.015',
          },
          {
            providerId: openaiProvider.id,
            modelId: 'gpt-4o-mini',
            displayName: 'GPT-4o Mini',
            inputCostPer1k: '0.00015',
            outputCostPer1k: '0.0006',
          },
          {
            providerId: openaiProvider.id,
            modelId: 'gpt-4-turbo',
            displayName: 'GPT-4 Turbo',
            inputCostPer1k: '0.01',
            outputCostPer1k: '0.03',
          },
          {
            providerId: openaiProvider.id,
            modelId: 'gpt-3.5-turbo',
            displayName: 'GPT-3.5 Turbo',
            inputCostPer1k: '0.0005',
            outputCostPer1k: '0.0015',
          },
        ]
      : []),
    // Google Models
    ...(googleProvider
      ? [
          {
            providerId: googleProvider.id,
            modelId: 'gemini-1.5-pro',
            displayName: 'Gemini 1.5 Pro',
            inputCostPer1k: '0.00125',
            outputCostPer1k: '0.005',
          },
          {
            providerId: googleProvider.id,
            modelId: 'gemini-1.5-flash',
            displayName: 'Gemini 1.5 Flash',
            inputCostPer1k: '0.000075',
            outputCostPer1k: '0.0003',
          },
          {
            providerId: googleProvider.id,
            modelId: 'gemini-1.0-pro',
            displayName: 'Gemini 1.0 Pro',
            inputCostPer1k: '0.0005',
            outputCostPer1k: '0.0015',
          },
        ]
      : []),
  ];

  let modelCount = 0;
  for (const modelData of modelsData) {
    const [model] = await db
      .insert(llmModels)
      .values({
        ...modelData,
        isActive: false,
      })
      .onConflictDoNothing()
      .returning();

    if (model) {
      modelCount++;
    }
  }
  console.log(`Seeded ${modelCount} new models`);

  await pool.end();
  console.log('Seeding complete!');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
