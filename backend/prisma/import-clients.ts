import { PrismaClient, EmailPlatform, CadenceFrequency } from '@prisma/client';

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function mapPlatform(raw: string): EmailPlatform {
  const p = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (p === 'mailchimp') return 'MAILCHIMP';
  if (p === 'klaviyo') return 'KLAVIYO';
  if (p === 'hubspot') return 'HUBSPOT';
  if (p === 'activecampaign') return 'ACTIVECAMPAIGN';
  if (p === 'constantcontact') return 'CONSTANTCONTACT';
  if (p === 'brevo') return 'BREVO';
  if (p === 'servicetitan') return 'SERVICETITAN';
  if (p === 'beehiiv') return 'BEEHIIV';
  return 'OTHER';
}

function mapFrequency(raw: string): CadenceFrequency | null {
  const f = raw.trim().toLowerCase();
  if (f === 'once a week') return 'WEEKLY';
  if (f === 'every other week') return 'BIWEEKLY';
  if (f === '2x weekly' || f === '3x weekly') return 'CUSTOM';
  return null;
}

interface ClientInput {
  name: string;
  platform: string;
  frequency: string;
  accountManager: string;
  tier: string;
  contactEmail: string;
  industry?: string;
}

const clients: ClientInput[] = [
  // Andrew Carlson clients
  {
    name: 'Farell Electric & Solar',
    platform: 'Constant Contact',
    frequency: 'Every other week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 3',
    contactEmail: 'zac@prolificbranddesign.com',
    industry: 'Electrical & Solar',
  },
  {
    name: 'Pro Garage Doors',
    platform: 'Constant Contact',
    frequency: 'Every other week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 3',
    contactEmail: 'nathan@getprodoors.com',
    industry: 'Garage Doors',
  },
  {
    name: 'Mo Better',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 1',
    contactEmail: 'drew.arnold@garagedoorpartners.com',
    industry: 'Garage Doors',
  },
  {
    name: 'Taggart Plumbing',
    platform: 'Mailchimp',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 3',
    contactEmail: 'expert@taggartplumbing.com',
    industry: 'Plumbing',
  },
  {
    name: 'Blue Ribbon Cooling, Heating, Plumbing and Electrical',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 2',
    contactEmail: 'evan@freeagency.ai',
    industry: 'HVAC & Plumbing',
  },
  {
    name: 'LBA Heating & Air Conditioning',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 3',
    contactEmail: 'brad.mcghee@lbaservices.com',
    industry: 'HVAC',
  },
  {
    name: 'Armor Air',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 3',
    contactEmail: 'jamie.armorair@gmail.com',
    industry: 'HVAC',
  },
  {
    name: 'Go Green Plumbing, Heating, Air & Electrical',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 2',
    contactEmail: 'evan@freeagency.ai',
    industry: 'Plumbing & HVAC',
  },
  {
    name: 'Door Serv Pro',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 2',
    contactEmail: 'alisa@doorservpro.com',
    industry: 'Garage Doors',
  },
  {
    name: 'Bobby L. Greene Plumbing, Heating And Cooling',
    platform: 'ServiceTitan',
    frequency: '',
    accountManager: 'Andrew Carlson',
    tier: 'Tier 2',
    contactEmail: 'evan@freeagency.ai',
    industry: 'Plumbing & HVAC',
  },
  // Pat Garza clients
  {
    name: 'Brody Pennell Heating & Air Conditioning',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'camilo@brodypennell.com',
    industry: 'HVAC',
  },
  {
    name: 'Absolute Airflow Air Conditioning, Heating and Plumbing',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'camilo@absoluteairflow.com',
    industry: 'HVAC & Plumbing',
  },
  {
    name: 'Kahn Air Conditioning',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'camilo@kahnair.com',
    industry: 'HVAC',
  },
  {
    name: 'Bob Jenson Air Conditioning, Heating & Plumbing',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'camilo@bobjenson.com',
    industry: 'HVAC & Plumbing',
  },
  {
    name: 'My Georgia Plumber',
    platform: 'ActiveCampaign',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 1',
    contactEmail: 'j.stevens@mygeorgiaplumber.com',
    industry: 'Plumbing',
  },
  {
    name: "Reed's Plumbing",
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 3',
    contactEmail: 'damian@reedsplumbing.com',
    industry: 'Plumbing',
  },
  {
    name: "Wimpy's Plumbing & Air",
    platform: 'Mail Chimp',
    frequency: 'Every other week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'natalie@freeagency.ai',
    industry: 'Plumbing & HVAC',
  },
  {
    name: 'Salt Air, Inc.',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 3',
    contactEmail: 'brooke@saltairinc.com',
    industry: 'HVAC',
  },
  {
    name: 'Conserva Irrigation of Katy & West Houston',
    platform: 'Constant Contact',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'kyle.lake@conservairrigation.com',
    industry: 'Irrigation',
  },
  {
    name: 'Cool Hand Electric & Air',
    platform: 'Constant Contact',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'Luke@CoolHandElectric.com',
    industry: 'Electrical & HVAC',
  },
  {
    name: 'PDS Plumbing & Air',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'evan@freeagency.ai',
    industry: 'Plumbing & HVAC',
  },
  {
    name: 'G&C Plumbing & Heating',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'stevie@gc.plumbing',
    industry: 'Plumbing',
  },
  {
    name: 'VALUE GARAGE DOOR SERVICE',
    platform: 'Constant Contact',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 1',
    contactEmail: 'jesse@valuegaragedoorservice.com',
    industry: 'Garage Doors',
  },
  {
    name: 'Grasshopper',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'Dylan@gograsshopper.com',
    industry: 'HVAC',
  },
  {
    name: 'Hummingbird Heating, Cooling, Plumbing & Electric',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'dylan@gograsshopper.com',
    industry: 'HVAC & Plumbing',
  },
  {
    name: 'Sweet Life Heating & Cooling',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'dylan@gograsshopper.com',
    industry: 'HVAC',
  },
  {
    name: 'Full Swing Plumbing, Heating, & Air',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Pat Garza',
    tier: 'Tier 2',
    contactEmail: 'dylan@gograsshopper.com',
    industry: 'Plumbing & HVAC',
  },
  {
    name: 'Endless Energy New England',
    platform: 'Service Titan',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'amandap@goendlessenergy.com',
    industry: 'HVAC',
  },
  {
    name: 'Golden West',
    platform: 'Service Titan',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'josez@goldenwestph.com',
    industry: 'Plumbing & HVAC',
  },
  {
    name: 'Argent',
    platform: 'Service Titan',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'Dylan@gograsshopper.com',
    industry: 'Home Services',
  },
  {
    name: 'Touchdown Heating & Cooling',
    platform: '',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'dylan@gograsshopper.com',
    industry: 'HVAC',
  },
  {
    name: 'Eagle Pro Heating, Cooling, & Insulation',
    platform: '',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'dylan@gograsshopper.com',
    industry: 'HVAC',
  },
  {
    name: 'Lickety Split AC, Plumbing & Electric',
    platform: '',
    frequency: '',
    accountManager: 'Pat Garza',
    tier: '',
    contactEmail: 'tom@licketysplitfl.com',
    industry: 'HVAC & Plumbing',
  },
  // Zac Garside clients
  {
    name: 'Relentless Digital',
    platform: 'Beehiiv',
    frequency: '2x weekly',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'jcrouch@relentless-digital.com',
    industry: 'Digital Marketing',
  },
  {
    name: 'Service Business Mastery',
    platform: 'Beehiiv',
    frequency: 'Once a Week',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'jcrouch@relentless-digital.com',
    industry: 'Business Education',
  },
  {
    name: 'Lace AI',
    platform: 'HubSpot',
    frequency: '2x weekly',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'khill@lace.ai',
    industry: 'AI Technology',
  },
  {
    name: 'Ponderosa Garage Door',
    platform: 'Service Titan',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'zac@zacgarside.com',
    industry: 'Garage Doors',
  },
  {
    name: 'My Family HVAC',
    platform: 'Service Titan',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'jborges@myfamilyhvac.com',
    industry: 'HVAC',
  },
  {
    name: 'F.F. Hitchcock',
    platform: 'Service Titan',
    frequency: 'Once a Week',
    accountManager: 'Zac Garside',
    tier: 'Tier 2',
    contactEmail: 'john@ffhitchcock.com | mike.loomis@ffhitchcock.com',
    industry: 'Home Services',
  },
  {
    name: 'Power Selling Pros',
    platform: 'Beehiiv',
    frequency: '3x weekly',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'lynzie@powersellingpros.com',
    industry: 'Sales Training',
  },
  {
    name: 'Jeff Likes Clean Windows',
    platform: 'MailChimp',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'zac@zacgarside.com',
    industry: 'Window Cleaning',
  },
  {
    name: 'Belair Engineering',
    platform: 'Mailchimp',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'belaireng1@icloud.com',
    industry: 'Engineering',
  },
  {
    name: 'Dial One Johnson',
    platform: 'Constant Contact',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'michelle@dial1plumbing.com',
    industry: 'Plumbing',
  },
  {
    name: 'Super Clean Windows',
    platform: 'Google Doc',
    frequency: 'Every other week',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'eric@supercleanwindows.com',
    industry: 'Window Cleaning',
  },
  {
    name: 'Red Bird Roofing',
    platform: 'Constant Contact',
    frequency: 'Once a Week',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'trevor.frank@redbirdroofing.com',
    industry: 'Roofing',
  },
  {
    name: 'Broccoli AI',
    platform: 'Beehiiv',
    frequency: '2x weekly',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'aj@broccoli.com',
    industry: 'AI Technology',
  },
  {
    name: 'Contractor Commerce',
    platform: 'HubSpot',
    frequency: '2x weekly',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'predman@contractorcommerce.com, jpragon@contractorcommerce.com',
    industry: 'E-commerce',
  },
  {
    name: 'Affordable Comfort',
    platform: 'ServiceTitan',
    frequency: 'Once a Week',
    accountManager: 'Zac Garside',
    tier: 'Tier 2',
    contactEmail: 'tom@affordablecomfort.ca',
    industry: 'HVAC',
  },
  {
    name: 'Mantel',
    platform: 'Beehiiv',
    frequency: '',
    accountManager: 'Zac Garside',
    tier: 'Tier 3',
    contactEmail: 'zac@usemantel.com',
    industry: 'Technology',
  },
  {
    name: 'Double X Digital',
    platform: 'MailChimp',
    frequency: '',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'jose@doublexdigital.com',
    industry: 'Digital Marketing',
  },
  {
    name: 'Woodward Heating, Air & Plumbing',
    platform: 'Constant Contact',
    frequency: 'Once a Week',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'scott@woodwardheating.com',
    industry: 'HVAC & Plumbing',
  },
  {
    name: 'AirWorks Solutions',
    platform: '',
    frequency: '',
    accountManager: 'Zac Garside',
    tier: 'Tier 1',
    contactEmail: 'bridget@airworkssolutions.com',
    industry: 'HVAC',
  },
];

async function main() {
  console.log(`Starting import of ${clients.length} clients...\n`);

  let created = 0;
  let skipped = 0;

  for (const c of clients) {
    const slug = toSlug(c.name);
    const platform = mapPlatform(c.platform);
    const frequency = mapFrequency(c.frequency);

    const contextLines = [
      `**Account Manager:** ${c.accountManager}`,
      c.tier ? `**Tier:** ${c.tier}` : null,
      `**Contact Email:** ${c.contactEmail}`,
      c.frequency ? `**Send Frequency:** ${c.frequency}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const existing = await prisma.client.findUnique({ where: { slug } });

    if (existing) {
      console.log(`  SKIP  ${c.name} (slug "${slug}" already exists)`);
      skipped++;
      continue;
    }

    const client = await prisma.client.create({
      data: {
        name: c.name,
        slug,
        platform,
        industry: c.industry,
        status: 'ACTIVE',
        contextMarkdown: contextLines,
        timezone: 'America/New_York',
      },
    });

    if (frequency) {
      await prisma.cadence.create({
        data: {
          clientId: client.id,
          name: `${c.frequency} Email`,
          frequency,
          isActive: true,
        },
      });
    }

    console.log(`  OK    ${c.name} → ${platform}${frequency ? ` (${c.frequency})` : ''}`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
