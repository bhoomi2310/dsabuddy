import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from "./src/config/prismaClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, '../frontend/src/data/company_questions.json');

const normalizeName = (name) => {
  if (!name) return "";
  let norm = name
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(
      /\bjp\s*morgan\s*chase\b|\bjp\s*morgan\b|\bjpmc\b|\bj\.p\.\s*morgan\s*chase\b|\bj\.p\.\s*morgan\b/g,
      "jpmorganchase",
    )
    .replace(/\bibm\s*india\b|\bibm\b/g, "ibmindia")
    .replace(/\btexas\s*instruments?\b|\bti\b/g, "texasinstrument")
    .replace(/\bfast\s*retailing\s*\(japan\)|\bfast\s*retailing\b/g, "fastretailing")
    .replace(/\bgoogle\s*silicon\b/g, "googlesilicon")
    .replace(/\bde\s*shaw\s*&\s*co\b|\bde\s*shaw\b/g, "deshaw")
    .replace(/\bsamsung\s*bangalore\b|\bsamsung\s*delhi\b|\bsamsung\s*india\b|\bsamsung\b/g, "samsung")
    .replace(/\bbharat\s*petroleum\b/g, "bpcl")
    .replace(/\bnxp\s*semiconductors?\b/g, "nxpsemiconductor")
    .replace(/\bz\s*scal[ae]r\b/g, "zscaler")
    .replace(/\beil\s*psu\b|\beil\b/g, "eil")
    .replace(/\bhcl\s*tech\b|\bhcl\b/g, "hcl")
    .replace(/\bzs\s*associates?\b|\bzs\b/g, "zsassociate")
    .replace(/\bsiemens\s*eda\b|\bsiemens\b/g, "siemens")
    .replace(/\baccenture\s*interview\s*problems\s*all\b|\baccenture\b/g, "accenture")
    .replace(/[^a-z0-9]/g, "");
  return norm;
};

const companyLogos = {
  "Goldman Sachs": "Goldman Sachs Logo.png",
  LinkedIn: "LinkedIn.png",
  Adobe: "Adobe.png",
  "IBM India": "IBM.png",
  Atlassian: "Atlassian.png",
  Amazon: "Amazon.png",
  Cisco: "Cisco.png",
  "J.P. Morgan Chase": "JPMorganChase.png",
  Samsung: "Samsung.png",
  Expedia: "Expedia.png",
  Uber: "Uber.png",
  Google: "Google.png",
  Sprinklr: "Sprinklr.png",
  Autodesk: "Autodesk.png",
  Myntra: "Myntra.png",
  "Wells Fargo": "WellsFargo.png",
  MasterCard: "Mastercard.png",
  Optum: "Optum.png",
  "Texas Instrument": "TexasInstruments.png",
  NatWest: "Natwest.png",
  "Fast Retailing": "FastRetailing.png",
  MyKaarma: "MyKaarma.png",
  "AB InBev GCC": "ABInBev.png",
  Accenture: "Accenture.png",
  Accolite: "Accolite.png",
  "Adani Group": "AdaniGroup.png",
  Airtel: "Airtel.png",
  "Airtel Payment Bank": "AirtelPaymentBank.png",
  "Alvarez And Marsal": "AlvarezAndMarsal.png",
  Amdocs: "Amdocs.png",
  "Anand Group": "AnandGroup.png",
  Apple: "Apple.png",
  ARM: "ARM.png",
  ArmorCode: "ArmorCode.png",
  "Avant Garde": "AvantGarde.png",
  "Axis Bank": "AxisBank.png",
  "Bain & Company": "Bain&Company.png",
  "Bajaj Auto": "BajajAuto.png",
  BCG: "BCG.png",
  Bechtel: "Bechtel.png",
  Bharatpe: "BharatPe.png",
  BlackRock: "Blackrock.png",
  "BNP Paribas": "BNPParibas.png",
  BPCL: "BPCL.png",
  "Capital Power": "CapitalPower.png",
  ClearTax: "ClearTax.png",
  CoinSwitch: "CoinSwitch.png",
  Cvent: "Cvent.png",
  "DE Shaw": "D.EShaw&Co.png",
  "Deutsche Telekom": "DeutscheTelekom.png",
  DLF: "DLF.png",
  "DP World": "DPWorld.png",
  "DSP Mutual Fund": "DSPMutualFund.png",
  Dunnhumby: "DunnHumby.png",
  "Ebiz Solution": "EbizSolutions.png",
  "Eightfold AI": "EightFoldAI.png",
  EIL: "EIL.png",
  "Energy Infratech": "EnergyInfrastructure.png",
  Engineersmind: "EngineersMind.png",
  EY: "EY.png",
  Flipkart: "Flipkart.png",
  "Floor Daniel": "Fluor.png",
  "Future First": "FutureFirst.png",
  "GAIL PSU": "GailPSU.png",
  Gameskraft: "Gameskraft.png",
  "Ge Vernova": "GeVernova.png",
  GoDaddy: "GoDaddy.png",
  "GoodSpace AI": "GoodSpaceAI.png",
  "Google Silicon": "Google.png",
  "HCL Tech": "HCL.png",
  HeadLamp: "HeadLamp.png",
  Hike: "Hike.png",
  "Hindustan Power": "HindustanPower.png",
  Honda: "Honda.png",
  "HSBC Bank": "HSBC.png",
  IDEMITSU: "Idemitsu.png",
  Infoedge: "InfoEdge.png",
  Intuit: "Intuit.png",
  Kapstan: "Kapstan.png",
  Keysight: "Keysight.png",
  Kimbal: "Kimbal.png",
  KPMG: "KPMG.png",
  "Larsen And Toubro": "LarsenAndToubro.png",
  Macquarie: "Macquarie.png",
  magicpin: "MagicPin.png",
  MakeMyTrip: "MakeMyTrip.png",
  Mamaearth: "MamaEarth.png",
  MAQ: "MAQ.png",
  "Maruti Suzuki": "MarutiSuzuki.png",
  Mckinsey: "McKinsey&Company.png",
  "Media.net": "MediaNet.png",
  Meesho: "Meesho.png",
  Microsoft: "Microsoft.png",
  "Morgan Stanley": "MorganStanley.png",
  Motive: "Motive.png",
  NAB: "NAB.png",
  "Naik AI": "NaikAI.png",
  "NK Securities HFT": "NKSecurities.png",
  NMTRONICS: "NMTronics.png",
  Nvidia: "Nvidia.png",
  "NXP Semiconductors": "NXPSemiconductors.png",
  Nykaa: "Nykaa.png",
  Oracle: "Oracle.png",
  Oyo: "Oyo.png",
  "Paisa Bazar": "PaisaBazaar.png",
  PayPal: "PayPal.png",
  PharmEasy: "PharmEasy.png",
  PhonePe: "PhonePe.png",
  "Policy Bazar": "PolicyBazaar.png",
  Razorpay: "RazorPay.png",
  "Reliance Ltd": "Reliance.png",
  Rockman: "Rockman.png",
  Salesforce: "Salesforce.png",
  Samsara: "Samsara.png",
  Sedemac: "Sedemac.png",
  Shipsy: "Shipsy.png",
  "Siemens EDA": "Siemens.png",
  SiTime: "SiTime.png",
  Sunsire: "Sunrise.png",
  "Super AGI": "SuperAGI.png",
  Synopsys: "Synopsys.png",
  Syrma: "Syrma.png",
  TCIL: "TCIL.png",
  TCS: "TCS.png",
  "Tejas Network": "TejasNetwork.png",
  Thorogood: "Thorogood.png",
  "Times Internet": "TimesInternet.png",
  "Tower Research": "TowerResearch.png",
  Twilio: "Twilio.png",
  UKG: "UKG.png",
  UnivLabs: "UnivLabs.png",
  "Urban Company": "UrbanCompany.png",
  "Vecmocon Tech": "Vecmocon.png",
  Visa: "Visa.png",
  Voltas: "Voltas.png",
  Vyapar: "Vyapar.png",
  Wayfair: "Wayfair.png",
  WinZO: "Winzo.png",
  Wipro: "Wipro.png",
  WorkIndia: "WorkIndia.png",
  Zinnia: "Zinnia.png",
  Zomato: "Zomato.png",
  "Zs Associate": "Zs.png",
  Zscaler: "Zscaler.png",
  Zupee: "Zupee.png",
};

const getCompanyLogoUrl = (name) => {
  if (!name) return null;
  const normLookup = normalizeName(name);
  const matchingKey = Object.keys(companyLogos).find(
    (k) => normalizeName(k) === normLookup
  );
  const filename = matchingKey ? companyLogos[matchingKey] : null;
  if (filename) {
    const normalizedFilename = filename.replace(/[\s&]+/g, '_');
    return `https://res.cloudinary.com/dufgdskxu/image/upload/${encodeURIComponent(normalizedFilename)}`;
  }
  return null;
};

const mapDifficulty = (diffStr) => {
  const d = (diffStr || "").toUpperCase();
  if (d === "EASY") return "EASY";
  if (d === "MEDIUM") return "MEDIUM";
  if (d === "HARD") return "HARD";
  return "MEDIUM";
};

const mapFrequency = (freqStr) => {
  if (!freqStr) return "OCCASIONAL";
  const num = parseFloat(freqStr);
  if (isNaN(num)) return "OCCASIONAL";
  if (num >= 60) return "VERY_HIGH";
  if (num >= 20) return "HIGH";
  return "OCCASIONAL";
};

const getSlugFromUrl = (url, title) => {
  if (url) {
    const match = url.match(/\/problems\/([a-z0-9-]+)/i);
    if (match && match[1]) return match[1];
  }
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const getDisplayName = (rawName) => {
  const customDisplayNames = {
    deshaw: "DE Shaw",
    jpmorganchase: "J.P. Morgan Chase",
    bpcl: "BPCL",
    ibmindia: "IBM India",
    texasinstrument: "Texas Instruments",
    fastretailing: "Fast Retailing",
    googlesilicon: "Google Silicon",
    samsung: "Samsung",
    nxpsemiconductor: "NXP Semiconductors",
    zscaler: "Zscaler",
    eil: "EIL",
    sedemac: "Sedemac",
    pharmeasy: "PharmEasy",
    "bain and company": "Bain & Company",
    "dsp mutual fund": "DSP Mutual Fund",
  };
  const norm = normalizeName(rawName);
  if (customDisplayNames[norm]) return customDisplayNames[norm];
  return rawName
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

async function main() {
  console.log("Reading company_questions.json from path:", jsonPath);
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }
  
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);
  const companyQuestions = data.companyQuestions;

  console.log("Cleaning existing company & question data...");
  await prisma.placement.deleteMany({});
  await prisma.companyQuestion.deleteMany({});
  await prisma.interviewSet.deleteMany({});
  await prisma.questionTag.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.company.deleteMany({});

  console.log("Seeding companies, questions, tags, and mapping records...");
  const companySlugToIdMap = {};
  
  for (const [companyName, questions] of Object.entries(companyQuestions)) {
    const compSlug = normalizeName(companyName);
    const logoUrl = getCompanyLogoUrl(companyName);

    // Get metadata from companiesMetadata
    const metadata = data.companiesMetadata ? data.companiesMetadata[companyName] : null;

    // 1. Create Company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: compSlug,
        logoUrl,
        questionCount: questions.length,
        eligibilityCriteria: metadata ? metadata.eligibility_criteria : null,
        roundsInfo: metadata ? metadata.rounds_info : null,
        oaPlatform: metadata ? metadata.oa_platform : null,
        topTopics: metadata ? metadata.top_topics_and_questions : [],
        otherInfo: metadata ? metadata.other_relevant_information : null,
      },
    });

    companySlugToIdMap[compSlug] = company.id;

    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    // 2. Loop over questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const difficulty = mapDifficulty(q.difficulty);
      if (difficulty === "EASY") easyCount++;
      else if (difficulty === "MEDIUM") mediumCount++;
      else if (difficulty === "HARD") hardCount++;

      const titleSlug = getSlugFromUrl(q.url, q.title);
      const mappedFreq = mapFrequency(q.frequency);
      const acceptance = q.acceptance ? parseFloat(q.acceptance) : null;

      // 3. Upsert Question record
      const question = await prisma.question.upsert({
        where: {
          sourcePlatform_sourceId: {
            sourcePlatform: "LEETCODE",
            sourceId: titleSlug,
          },
        },
        update: {
          title: q.title,
          displayName: q.title,
          difficulty,
          leetcodeUrl: q.url,
          sourceSlug: titleSlug,
          sourceUrl: q.url,
          frequency: mappedFreq,
          acceptanceRate: acceptance,
        },
        create: {
          title: q.title,
          displayName: q.title,
          difficulty,
          leetcodeUrl: q.url,
          sourcePlatform: "LEETCODE",
          sourceId: titleSlug,
          sourceSlug: titleSlug,
          sourceUrl: q.url,
          frequency: mappedFreq,
          acceptanceRate: acceptance,
        },
      });

      // 4. Create tags and QuestionTag associations
      if (q.tags && Array.isArray(q.tags)) {
        for (const tagName of q.tags) {
          if (!tagName) continue;
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });

          await prisma.questionTag.upsert({
            where: {
              questionId_tagId: {
                questionId: question.id,
                tagId: tag.id,
              },
            },
            update: {},
            create: {
              questionId: question.id,
              tagId: tag.id,
            },
          });
        }
      }

      // 5. Create CompanyQuestion record linking them
      await prisma.companyQuestion.create({
        data: {
          companyId: company.id,
          questionId: question.id,
          frequency: mappedFreq,
          solved: false,
          order: i,
        },
      });
    }

    // 6. Create InterviewSet
    await prisma.interviewSet.create({
      data: {
        companyId: company.id,
        name: `${companyName} Interview Set`,
        tag: "TOP SELECTION",
        lastUpdated: "Just updated",
        easyCount: 0,
        easyTotal: easyCount,
        mediumCount: 0,
        mediumTotal: mediumCount,
        hardCount: 0,
        hardTotal: hardCount,
      },
    });
    
  }

  console.log("Seeding NSUT placements...");
  const placementsPath = path.join(__dirname, '../nsut_placements.json');
  if (fs.existsSync(placementsPath)) {
    const placementsRaw = fs.readFileSync(placementsPath, 'utf8');
    const placementsData = JSON.parse(placementsRaw);
    let skippedCount = 0;
    let seededCount = 0;
    for (const p of placementsData) {
      const normCompany = normalizeName(p.company);
      let companyId = companySlugToIdMap[normCompany];

      if (!companyId) {
        skippedCount++;
        continue;
      }

      await prisma.placement.create({
        data: {
          companyId,
          companyName: getDisplayName(p.company),
          role: p.role,
          ctcLpa: p.ctc_lpa ? parseFloat(p.ctc_lpa) : null,
          stipendMonth: p.stipend_month ? parseFloat(p.stipend_month) : null,
          type: p.type,
          category: p.category,
          eligibleBranches: p.eligible_branches || [],
          minCgpa: p.min_cgpa ? parseFloat(p.min_cgpa) : null,
        },
      });
      seededCount++;
    }
    console.log(`Seeded ${seededCount} placement records. Skipped ${skippedCount} placements for companies with no questions/metadata.`);
  } else {
    console.log("Placements file not found at:", placementsPath);
  }

  console.log("Seeding database complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding companies:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });