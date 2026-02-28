-- Seed initial clients
-- Idempotent: uses ON CONFLICT (slug) DO NOTHING

-- ============================================
-- Zac Garside Clients
-- ============================================

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Woodward Heating, Air & Plumbing',
  'woodward-heating-air-plumbing',
  'CONSTANTCONTACT',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** scott@woodwardheating.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Relentless Digital',
  'relentless-digital',
  'BEEHIIV',
  'Digital Marketing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** jcrouch@relentless-digital.com\n**Send Frequency:** 2x weekly',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Service Business Mastery',
  'service-business-mastery',
  'BEEHIIV',
  'Business Education',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** jcrouch@relentless-digital.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Lace AI',
  'lace-ai',
  'HUBSPOT',
  'AI Technology',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** khill@lace.ai\n**Send Frequency:** 2x weekly',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Ponderosa Garage Door',
  'ponderosa-garage-door',
  'SERVICETITAN',
  'Garage Doors',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** zac@zacgarside.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'My Family HVAC',
  'my-family-hvac',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** jborges@myfamilyhvac.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'F.F. Hitchcock',
  'f-f-hitchcock',
  'SERVICETITAN',
  'Home Services',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 2\n**Contact Email:** john@ffhitchcock.com | mike.loomis@ffhitchcock.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Power Selling Pros',
  'power-selling-pros',
  'BEEHIIV',
  'Sales Training',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** lynzie@powersellingpros.com\n**Send Frequency:** 3x weekly',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Jeff Likes Clean Windows',
  'jeff-likes-clean-windows',
  'MAILCHIMP',
  'Window Cleaning',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** zac@zacgarside.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Belair Engineering',
  'belair-engineering',
  'MAILCHIMP',
  'Engineering',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** belaireng1@icloud.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Dial One Johnson',
  'dial-one-johnson',
  'CONSTANTCONTACT',
  'Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** michelle@dial1plumbing.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Super Clean Windows',
  'super-clean-windows',
  'OTHER',
  'Window Cleaning',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** eric@supercleanwindows.com\n**Send Frequency:** Every other week\n**Note:** Uses Google Doc for email content',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Red Bird Roofing',
  'red-bird-roofing',
  'CONSTANTCONTACT',
  'Roofing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** trevor.frank@redbirdroofing.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Broccoli AI',
  'broccoli-ai',
  'BEEHIIV',
  'AI Technology',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** aj@broccoli.com\n**Send Frequency:** 2x weekly',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Contractor Commerce',
  'contractor-commerce',
  'HUBSPOT',
  'E-commerce',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** predman@contractorcommerce.com, jpragon@contractorcommerce.com\n**Send Frequency:** 2x weekly',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Affordable Comfort',
  'affordable-comfort',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 2\n**Contact Email:** tom@affordablecomfort.ca\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Mantel',
  'mantel',
  'BEEHIIV',
  'Technology',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 3\n**Contact Email:** zac@usemantel.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Double X Digital',
  'double-x-digital',
  'MAILCHIMP',
  'Digital Marketing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** jose@doublexdigital.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'AirWorks Solutions',
  'airworks-solutions',
  'OTHER',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Zac Garside\n**Tier:** Tier 1\n**Contact Email:** bridget@airworkssolutions.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- Andrew Carlson Clients
-- ============================================

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Farell Electric & Solar',
  'farell-electric-solar',
  'CONSTANTCONTACT',
  'Electrical & Solar',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 3\n**Contact Email:** zac@prolificbranddesign.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Pro Garage Doors',
  'pro-garage-doors',
  'CONSTANTCONTACT',
  'Garage Doors',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 3\n**Contact Email:** nathan@getprodoors.com\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Mo Better',
  'mo-better',
  'SERVICETITAN',
  'Garage Doors',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 1\n**Contact Email:** drew.arnold@garagedoorpartners.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Taggart Plumbing',
  'taggart-plumbing',
  'MAILCHIMP',
  'Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 3\n**Contact Email:** expert@taggartplumbing.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Blue Ribbon Cooling, Heating, Plumbing and Electrical',
  'blue-ribbon-cooling-heating-plumbing-and-electrical',
  'SERVICETITAN',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 2\n**Contact Email:** evan@freeagency.ai\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'LBA Heating & Air Conditioning',
  'lba-heating-air-conditioning',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 3\n**Contact Email:** brad.mcghee@lbaservices.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Armor Air',
  'armor-air',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 3\n**Contact Email:** jamie.armorair@gmail.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Go Green Plumbing, Heating, Air & Electrical',
  'go-green-plumbing-heating-air-electrical',
  'SERVICETITAN',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 2\n**Contact Email:** evan@freeagency.ai\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Door Serv Pro',
  'door-serv-pro',
  'SERVICETITAN',
  'Garage Doors',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 2\n**Contact Email:** alisa@doorservpro.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Bobby L. Greene Plumbing, Heating And Cooling',
  'bobby-l-greene-plumbing-heating-and-cooling',
  'SERVICETITAN',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Andrew Carlson\n**Tier:** Tier 2\n**Contact Email:** evan@freeagency.ai',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- Pat Garza Clients
-- ============================================

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Brody Pennell Heating & Air Conditioning',
  'brody-pennell-heating-air-conditioning',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** camilo@brodypennell.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Absolute Airflow Air Conditioning, Heating and Plumbing',
  'absolute-airflow-air-conditioning-heating-and-plumbing',
  'SERVICETITAN',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** camilo@absoluteairflow.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Kahn Air Conditioning',
  'kahn-air-conditioning',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** camilo@kahnair.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Bob Jenson Air Conditioning, Heating & Plumbing',
  'bob-jenson-air-conditioning-heating-plumbing',
  'SERVICETITAN',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** camilo@bobjenson.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'My Georgia Plumber',
  'my-georgia-plumber',
  'ACTIVECAMPAIGN',
  'Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 1\n**Contact Email:** j.stevens@mygeorgiaplumber.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Reed''s Plumbing',
  'reeds-plumbing',
  'SERVICETITAN',
  'Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 3\n**Contact Email:** damian@reedsplumbing.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Wimpy''s Plumbing & Air',
  'wimpys-plumbing-air',
  'MAILCHIMP',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** natalie@freeagency.ai\n**Send Frequency:** Every other week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Salt Air, Inc.',
  'salt-air-inc',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 3\n**Contact Email:** brooke@saltairinc.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Conserva Irrigation of Katy & West Houston',
  'conserva-irrigation-of-katy-west-houston',
  'CONSTANTCONTACT',
  'Irrigation',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** kyle.lake@conservairrigation.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Cool Hand Electric & Air',
  'cool-hand-electric-air',
  'CONSTANTCONTACT',
  'Electrical & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** Luke@CoolHandElectric.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'PDS Plumbing & Air',
  'pds-plumbing-air',
  'SERVICETITAN',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** evan@freeagency.ai\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'G&C Plumbing & Heating',
  'g-c-plumbing-heating',
  'SERVICETITAN',
  'Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** stevie@gc.plumbing\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'VALUE GARAGE DOOR SERVICE',
  'value-garage-door-service',
  'CONSTANTCONTACT',
  'Garage Doors',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 1\n**Contact Email:** jesse@valuegaragedoorservice.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Grasshopper',
  'grasshopper',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** Dylan@gograsshopper.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Hummingbird Heating, Cooling, Plumbing & Electric',
  'hummingbird-heating-cooling-plumbing-electric',
  'SERVICETITAN',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** dylan@gograsshopper.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Sweet Life Heating & Cooling',
  'sweet-life-heating-cooling',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** dylan@gograsshopper.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Full Swing Plumbing, Heating, & Air',
  'full-swing-plumbing-heating-air',
  'SERVICETITAN',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Tier:** Tier 2\n**Contact Email:** dylan@gograsshopper.com\n**Send Frequency:** Once a Week',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Endless Energy New England',
  'endless-energy-new-england',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** amandap@goendlessenergy.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Golden West',
  'golden-west',
  'SERVICETITAN',
  'Plumbing & HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** josez@goldenwestph.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Argent',
  'argent',
  'SERVICETITAN',
  'Home Services',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** Dylan@gograsshopper.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Touchdown Heating & Cooling',
  'touchdown-heating-cooling',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** dylan@gograsshopper.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Eagle Pro Heating, Cooling, & Insulation',
  'eagle-pro-heating-cooling-insulation',
  'SERVICETITAN',
  'HVAC',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** dylan@gograsshopper.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "clients" ("id", "name", "slug", "platform", "industry", "timezone", "status", "contextMarkdown", "syncStatus", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Lickety Split AC, Plumbing & Electric',
  'lickety-split-ac-plumbing-electric',
  'OTHER',
  'HVAC & Plumbing',
  'America/New_York',
  'ACTIVE',
  E'**Account Manager:** Pat Garza\n**Contact Email:** tom@licketysplitfl.com',
  'PENDING',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

-- ============================================
-- Cadences (only for clients with a known frequency)
-- Uses subquery to look up client ID by slug
-- Only inserts if no cadence exists yet for the client
-- ============================================

-- Woodward Heating - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'woodward-heating-air-plumbing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Farell Electric & Solar - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'farell-electric-solar'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Pro Garage Doors - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'pro-garage-doors'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Mo Better - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'mo-better'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Taggart Plumbing - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'taggart-plumbing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Blue Ribbon - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'blue-ribbon-cooling-heating-plumbing-and-electrical'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- LBA Heating - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'lba-heating-air-conditioning'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Armor Air - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'armor-air'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Go Green - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'go-green-plumbing-heating-air-electrical'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Door Serv Pro - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'door-serv-pro'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Brody Pennell - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'brody-pennell-heating-air-conditioning'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Absolute Airflow - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'absolute-airflow-air-conditioning-heating-and-plumbing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Kahn Air Conditioning - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'kahn-air-conditioning'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Bob Jenson - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'bob-jenson-air-conditioning-heating-plumbing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- My Georgia Plumber - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'my-georgia-plumber'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Reed's Plumbing - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'reeds-plumbing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Wimpy's Plumbing & Air - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'wimpys-plumbing-air'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Salt Air - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'salt-air-inc'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Conserva Irrigation - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'conserva-irrigation-of-katy-west-houston'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Cool Hand Electric & Air - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'cool-hand-electric-air'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- PDS Plumbing & Air - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'pds-plumbing-air'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- G&C Plumbing & Heating - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'g-c-plumbing-heating'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- VALUE GARAGE DOOR SERVICE - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'value-garage-door-service'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Grasshopper - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'grasshopper'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Hummingbird - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'hummingbird-heating-cooling-plumbing-electric'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Sweet Life - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'sweet-life-heating-cooling'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Full Swing - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'full-swing-plumbing-heating-air'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Relentless Digital - 2x weekly (CUSTOM)
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", '2x weekly Email', 'CUSTOM', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'relentless-digital'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Service Business Mastery - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'service-business-mastery'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Lace AI - 2x weekly (CUSTOM)
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", '2x weekly Email', 'CUSTOM', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'lace-ai'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Ponderosa Garage Door - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'ponderosa-garage-door'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- My Family HVAC - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'my-family-hvac'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- F.F. Hitchcock - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'f-f-hitchcock'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Power Selling Pros - 3x weekly (CUSTOM)
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", '3x weekly Email', 'CUSTOM', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'power-selling-pros'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Jeff Likes Clean Windows - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'jeff-likes-clean-windows'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Belair Engineering - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'belair-engineering'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Dial One Johnson - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'dial-one-johnson'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Super Clean Windows - Biweekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Every other week Email', 'BIWEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'super-clean-windows'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Red Bird Roofing - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'red-bird-roofing'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Broccoli AI - 2x weekly (CUSTOM)
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", '2x weekly Email', 'CUSTOM', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'broccoli-ai'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Contractor Commerce - 2x weekly (CUSTOM)
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", '2x weekly Email', 'CUSTOM', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'contractor-commerce'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");

-- Affordable Comfort - Weekly
INSERT INTO "cadences" ("id", "clientId", "name", "frequency", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", 'Once a Week Email', 'WEEKLY', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "clients" c WHERE c."slug" = 'affordable-comfort'
AND NOT EXISTS (SELECT 1 FROM "cadences" cd WHERE cd."clientId" = c."id");
