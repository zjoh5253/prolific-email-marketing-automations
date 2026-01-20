import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Simple encryption for seed data (use actual encryption service in production)
function encryptCredentials(data: object): { encryptedData: string; iv: string; authTag: string } {
  const key = Buffer.from(
    process.env.ENCRYPTION_KEY ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    'hex'
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
}

async function main() {
  console.log('Starting database seed...\n');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@prolific.com' },
    update: {},
    create: {
      email: 'admin@prolific.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', adminUser.email);

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@prolific.com' },
    update: {},
    create: {
      email: 'manager@prolific.com',
      passwordHash,
      firstName: 'Manager',
      lastName: 'User',
      role: 'MANAGER',
    },
  });
  console.log('Created manager user:', managerUser.email);

  // Create sample clients (without defaultFromName/defaultFromEmail which don't exist in schema)
  const clients = [
    {
      name: 'Acme Corporation',
      slug: 'acme-corp',
      platform: 'MAILCHIMP' as const,
      industry: 'TECHNOLOGY',
      timezone: 'America/New_York',
    },
    {
      name: 'Global Retail Co',
      slug: 'global-retail',
      platform: 'KLAVIYO' as const,
      industry: 'RETAIL',
      timezone: 'America/Los_Angeles',
    },
    {
      name: 'HealthPlus Clinic',
      slug: 'healthplus',
      platform: 'MAILCHIMP' as const,
      industry: 'HEALTHCARE',
      timezone: 'America/Chicago',
    },
    {
      name: 'EduLearn Academy',
      slug: 'edulearn',
      platform: 'HUBSPOT' as const,
      industry: 'EDUCATION',
      timezone: 'America/Denver',
    },
    {
      name: 'FinanceFirst Bank',
      slug: 'financefirst',
      platform: 'ACTIVECAMPAIGN' as const,
      industry: 'FINANCE',
      timezone: 'America/New_York',
    },
  ];

  const createdClients = [];

  for (const clientData of clients) {
    const client = await prisma.client.upsert({
      where: { slug: clientData.slug },
      update: {},
      create: {
        ...clientData,
        status: 'ONBOARDING',
      },
    });

    // Create placeholder encrypted credentials
    const credentialData = encryptCredentials({ apiKey: 'placeholder-api-key' });

    await prisma.clientCredential.upsert({
      where: { clientId: client.id },
      update: {},
      create: {
        clientId: client.id,
        ...credentialData,
        isValid: false,
      },
    });

    createdClients.push(client);
    console.log(`Created client: ${client.name} (${client.platform})`);
  }

  // Create context snippets for first client
  const acmeClient = createdClients[0];
  const contextSnippets = [
    {
      clientId: acmeClient.id,
      type: 'BRAND_VOICE' as const,
      title: 'Brand Voice Guidelines',
      content:
        'Acme Corporation uses a professional yet approachable tone. We avoid jargon and speak directly to our customers. Our voice is confident, helpful, and innovative.',
    },
    {
      clientId: acmeClient.id,
      type: 'AUDIENCE_PERSONA' as const,
      title: 'Primary Audience',
      content:
        'Our primary audience consists of small to medium business owners, aged 35-55, who are technology-forward but value simplicity and reliability.',
    },
    {
      clientId: acmeClient.id,
      type: 'PRODUCT_INFO' as const,
      title: 'Main Product Line',
      content:
        'Our flagship products include cloud-based project management tools, team collaboration software, and enterprise security solutions.',
    },
  ];

  for (const snippet of contextSnippets) {
    await prisma.contextSnippet.create({ data: snippet });
  }
  console.log(`Created ${contextSnippets.length} context snippets for ${acmeClient.name}`);

  // Create sample campaigns for first client (using platformCampaignId)
  const campaigns = [
    {
      clientId: acmeClient.id,
      platformCampaignId: 'mc-campaign-001',
      name: 'January Newsletter',
      subjectLine: 'Start 2024 Strong with Acme',
      previewText: 'New features and updates to boost your productivity',
      fromName: 'Acme Marketing',
      fromEmail: 'marketing@acme.com',
      status: 'SENT' as const,
      sentAt: new Date('2024-01-15T10:00:00Z'),
      metrics: {
        sent: 5000,
        delivered: 4850,
        uniqueOpens: 1200,
        totalOpens: 1800,
        uniqueClicks: 350,
        totalClicks: 520,
        bounces: 150,
        unsubscribes: 25,
        complaints: 2,
        openRate: 24.74,
        clickRate: 7.22,
        bounceRate: 3.0,
        unsubscribeRate: 0.5,
      },
    },
    {
      clientId: acmeClient.id,
      platformCampaignId: 'mc-campaign-002',
      name: 'February Product Launch',
      subjectLine: 'Introducing: Acme Cloud Pro',
      previewText: 'The future of cloud computing is here',
      fromName: 'Acme Marketing',
      fromEmail: 'marketing@acme.com',
      status: 'SENT' as const,
      sentAt: new Date('2024-02-01T14:00:00Z'),
      metrics: {
        sent: 5200,
        delivered: 5050,
        uniqueOpens: 1560,
        totalOpens: 2340,
        uniqueClicks: 520,
        totalClicks: 780,
        bounces: 150,
        unsubscribes: 18,
        complaints: 1,
        openRate: 30.89,
        clickRate: 10.3,
        bounceRate: 2.88,
        unsubscribeRate: 0.35,
      },
    },
    {
      clientId: acmeClient.id,
      platformCampaignId: 'mc-campaign-003',
      name: 'March Spring Sale',
      subjectLine: 'Spring into Savings - 30% Off',
      previewText: 'Limited time offer on all plans',
      fromName: 'Acme Marketing',
      fromEmail: 'marketing@acme.com',
      status: 'SCHEDULED' as const,
      scheduledAt: new Date('2024-03-15T09:00:00Z'),
    },
    {
      clientId: acmeClient.id,
      platformCampaignId: 'mc-campaign-004',
      name: 'Customer Appreciation Email',
      subjectLine: 'Thank You for Being Amazing',
      previewText: 'A special message from our CEO',
      fromName: 'John Smith, CEO',
      fromEmail: 'ceo@acme.com',
      status: 'DRAFT' as const,
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.upsert({
      where: {
        clientId_platformCampaignId: {
          clientId: campaign.clientId,
          platformCampaignId: campaign.platformCampaignId,
        },
      },
      update: {},
      create: campaign,
    });
  }
  console.log(`Created ${campaigns.length} sample campaigns for ${acmeClient.name}`);

  // Create audience lists for first client (using platformListId and matching schema fields)
  const lists = [
    {
      clientId: acmeClient.id,
      platformListId: 'list-001',
      name: 'Main Newsletter',
      memberCount: 5200,
      growthRate30d: 2.5,
      churnRate30d: 0.8,
      engagementTier: 'HIGH',
    },
    {
      clientId: acmeClient.id,
      platformListId: 'list-002',
      name: 'VIP Customers',
      memberCount: 850,
      growthRate30d: 1.2,
      churnRate30d: 0.3,
      engagementTier: 'PREMIUM',
    },
    {
      clientId: acmeClient.id,
      platformListId: 'list-003',
      name: 'Trial Users',
      memberCount: 1200,
      growthRate30d: 5.8,
      churnRate30d: 2.1,
      engagementTier: 'MEDIUM',
    },
  ];

  for (const list of lists) {
    await prisma.audienceList.upsert({
      where: {
        clientId_platformListId: {
          clientId: list.clientId,
          platformListId: list.platformListId,
        },
      },
      update: {},
      create: list,
    });
  }
  console.log(`Created ${lists.length} audience lists for ${acmeClient.name}`);

  // Create sample alerts (using correct enum values)
  const alerts = [
    {
      clientId: acmeClient.id,
      type: 'SYNC_FAILURE' as const,
      severity: 'WARNING' as const,
      title: 'Sync Warning',
      message: 'Some campaigns could not be synced due to API timeout',
      isRead: false,
      isDismissed: false,
    },
    {
      clientId: createdClients[1].id,
      type: 'CREDENTIAL_FAILURE' as const,
      severity: 'CRITICAL' as const,
      title: 'Credentials Need Attention',
      message: 'API credentials have not been verified. Please update your Klaviyo API key.',
      isRead: false,
      isDismissed: false,
    },
    {
      clientId: acmeClient.id,
      type: 'ANOMALY_DETECTED' as const,
      severity: 'INFO' as const,
      title: 'Open Rate Above Average',
      message: 'Your February campaign had a 30.89% open rate, well above your 26.5% average!',
      isRead: true,
      isDismissed: false,
    },
  ];

  for (const alert of alerts) {
    await prisma.alert.create({ data: alert });
  }
  console.log(`Created ${alerts.length} sample alerts`);

  // Create industry benchmarks
  const benchmarks = [
    { industry: 'TECHNOLOGY', metric: 'open_rate', value: 21.29, sampleSize: 1000 },
    { industry: 'TECHNOLOGY', metric: 'click_rate', value: 2.45, sampleSize: 1000 },
    { industry: 'TECHNOLOGY', metric: 'bounce_rate', value: 1.13, sampleSize: 1000 },
    { industry: 'TECHNOLOGY', metric: 'unsubscribe_rate', value: 0.24, sampleSize: 1000 },
    { industry: 'RETAIL', metric: 'open_rate', value: 18.39, sampleSize: 1500 },
    { industry: 'RETAIL', metric: 'click_rate', value: 2.69, sampleSize: 1500 },
    { industry: 'RETAIL', metric: 'bounce_rate', value: 0.75, sampleSize: 1500 },
    { industry: 'RETAIL', metric: 'unsubscribe_rate', value: 0.23, sampleSize: 1500 },
    { industry: 'HEALTHCARE', metric: 'open_rate', value: 21.48, sampleSize: 800 },
    { industry: 'HEALTHCARE', metric: 'click_rate', value: 2.49, sampleSize: 800 },
    { industry: 'HEALTHCARE', metric: 'bounce_rate', value: 0.89, sampleSize: 800 },
    { industry: 'HEALTHCARE', metric: 'unsubscribe_rate', value: 0.27, sampleSize: 800 },
    { industry: 'EDUCATION', metric: 'open_rate', value: 28.49, sampleSize: 600 },
    { industry: 'EDUCATION', metric: 'click_rate', value: 4.38, sampleSize: 600 },
    { industry: 'EDUCATION', metric: 'bounce_rate', value: 0.94, sampleSize: 600 },
    { industry: 'EDUCATION', metric: 'unsubscribe_rate', value: 0.17, sampleSize: 600 },
    { industry: 'FINANCE', metric: 'open_rate', value: 27.12, sampleSize: 700 },
    { industry: 'FINANCE', metric: 'click_rate', value: 2.72, sampleSize: 700 },
    { industry: 'FINANCE', metric: 'bounce_rate', value: 0.57, sampleSize: 700 },
    { industry: 'FINANCE', metric: 'unsubscribe_rate', value: 0.21, sampleSize: 700 },
  ];

  for (const benchmark of benchmarks) {
    await prisma.industryBenchmark.upsert({
      where: {
        industry_metric: {
          industry: benchmark.industry,
          metric: benchmark.metric,
        },
      },
      update: { value: benchmark.value, sampleSize: benchmark.sampleSize },
      create: benchmark,
    });
  }
  console.log(`Created ${benchmarks.length} industry benchmarks`);

  // Create cadence for first client
  await prisma.cadence.create({
    data: {
      clientId: acmeClient.id,
      name: 'Weekly Newsletter',
      frequency: 'WEEKLY',
      dayOfWeek: 2, // Tuesday
      timeOfDay: '10:00',
      isActive: true,
    },
  });
  console.log(`Created cadence for ${acmeClient.name}`);

  // Create notification settings (matching schema fields)
  await prisma.notificationSetting.create({
    data: {
      emailEnabled: true,
      emailRecipients: [adminUser.email],
      slackEnabled: false,
      alertTypes: ['SYNC_FAILURE', 'CREDENTIAL_FAILURE', 'CREDENTIAL_EXPIRING'],
      minSeverity: 'WARNING',
    },
  });
  console.log(`Created notification settings`);

  console.log('\nDatabase seeding completed!\n');
  console.log('Login credentials:');
  console.log('  Email: admin@prolific.com');
  console.log('  Password: admin123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
