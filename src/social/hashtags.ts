/*
 * Hashtags per social template, shown above its editor to copy into Instagram.
 * Groups: the recommended picks (pre-selected), broad high-reach tags, niche tags for the
 * topic, and local tags. Chosen from widely used tags for each topic, not from live reach data;
 * review them now and then. Instagram now allows at most 5 hashtags per post (late 2025).
 */

export const HASHTAG_LIMIT = 5;

export type HashtagGroup = { label: string; note?: string; tags: string[] };
/** `picks` are pre-selected (at most HASHTAG_LIMIT); `groups` are everything on offer. */
export type HashtagSet = { picks: string[]; groups: HashtagGroup[] };

/* ---------- Indian Traders ---------- */

const IT_INDIA: HashtagGroup = {
  label: "India",
  tags: ["#indianstockmarket", "#stockmarketindia", "#tradingindia", "#dalalstreet", "#nse", "#bse", "#sharemarketindia", "#stockmarketnews"],
};

const GLOBAL_MARKET: HashtagSet = {
  picks: ["#stockmarketindia", "#nifty50", "#globalmarkets", "#sharemarket", "#giftnifty"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#stockmarket", "#trading", "#investing", "#stocks", "#sharemarket", "#nifty", "#nifty50", "#sensex"] },
    {
      label: "Market cues",
      note: "What this carousel covers",
      tags: ["#globalmarkets", "#giftnifty", "#dowjones", "#crudeoil", "#dollarindex", "#premarket", "#globalcues", "#openinterest", "#marketupdate", "#banknifty"],
    },
    IT_INDIA,
  ],
};

const SWING_TRADE: HashtagSet = {
  picks: ["#swingtrading", "#stockmarketindia", "#technicalanalysis", "#stockstowatch", "#nifty50"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#stockmarket", "#trading", "#stocks", "#investing", "#sharemarket", "#technicalanalysis", "#nifty50", "#nifty"] },
    {
      label: "Swing trading",
      note: "Setup and chart tags",
      tags: ["#swingtrading", "#swingtrade", "#stockstowatch", "#stockstobuy", "#breakoutstocks", "#chartpatterns", "#priceaction", "#positionaltrading", "#tradesetup", "#riskreward"],
    },
    IT_INDIA,
  ],
};

const OPTION_SELLING: HashtagSet = {
  picks: ["#optionselling", "#optionstrading", "#banknifty", "#nifty50", "#stockmarketindia"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#optionstrading", "#options", "#trading", "#stockmarket", "#nifty", "#nifty50", "#banknifty", "#sensex"] },
    {
      label: "Option selling",
      note: "Strategy tags",
      tags: ["#optionselling", "#optionseller", "#weeklyoptions", "#niftyoptions", "#sensexoptions", "#creditspread", "#ironcondor", "#thetadecay", "#hedging", "#fno"],
    },
    IT_INDIA,
  ],
};

/* ---------- Bethlehem Valley ---------- */

const BV_KERALA: HashtagGroup = {
  label: "Kerala",
  note: "Local reach; add your district",
  tags: ["#keralafarming", "#keralaagriculture", "#keralafarmers", "#krishi", "#kerala", "#keralagram", "#malayali", "#idukki", "#wayanad"],
};

const FARM_BROAD: HashtagGroup = {
  label: "High reach",
  note: "Big general tags",
  tags: ["#farming", "#agriculture", "#organicfarming", "#gardening", "#gardeningtips", "#farmlife", "#plants", "#sustainablefarming"],
};

const FARM_TIP: HashtagSet = {
  picks: ["#farmingtips", "#pepperfarming", "#keralafarming", "#organicfarming", "#krishi"],
  groups: [
    FARM_BROAD,
    {
      label: "Farm tips",
      note: "Pepper, spices and crop care",
      tags: ["#farmingtips", "#agritips", "#pepperfarming", "#blackpepper", "#pepperplant", "#spicefarming", "#kurumulaku", "#plantprotection", "#plantcare", "#organicfertilizer"],
    },
    BV_KERALA,
  ],
};

const STEP_BY_STEP: HashtagSet = {
  picks: ["#farmingtips", "#gardeningtips", "#howto", "#keralafarming", "#krishi"],
  groups: [
    FARM_BROAD,
    {
      label: "How-to",
      note: "Guides and methods",
      tags: ["#howto", "#stepbystep", "#farmingtips", "#agritips", "#learnfarming", "#farmhacks", "#plantpropagation", "#composting", "#grafting", "#pepperfarming"],
    },
    BV_KERALA,
  ],
};

const PROMOTION: HashtagSet = {
  picks: ["#landforsale", "#farmlandforsale", "#keralarealestate", "#farmtools", "#kerala"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#realestate", "#property", "#forsale", "#landforsale", "#farmland", "#agriculture", "#farming", "#kerala"] },
    {
      label: "Property & tools",
      note: "Keep the ones that fit this post",
      tags: ["#farmlandforsale", "#plantationforsale", "#agriculturalland", "#estateforsale", "#pepperplantation", "#farmequipment", "#farmtools", "#farmmachinery", "#tractor", "#agriculturemachinery"],
    },
    { label: "Kerala", note: "Local buyers", tags: ["#keralarealestate", "#keralaproperty", "#propertyinkerala", "#keralaland", "#keralagram", "#malayali", "#idukki", "#wayanad"] },
  ],
};

const FEATURES: HashtagSet = {
  picks: ["#agritech", "#smartfarming", "#farmingtips", "#keralafarming", "#organicfarming"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#farming", "#agriculture", "#agritech", "#organicfarming", "#gardening", "#farmlife", "#innovation", "#sustainablefarming"] },
    {
      label: "Features & tech",
      note: "Products, tools and methods",
      tags: ["#agritech", "#smartfarming", "#modernfarming", "#dripirrigation", "#farmequipment", "#farmtools", "#precisionagriculture", "#agriinnovation", "#farmsolutions", "#farmingtips"],
    },
    BV_KERALA,
  ],
};

/** A cover leads a carousel on any farm topic: broad farm tags plus "swipe / learn" tags. */
const COVER: HashtagSet = {
  picks: ["#farmingtips", "#keralafarming", "#organicfarming", "#agriculture", "#krishi"],
  groups: [
    FARM_BROAD,
    {
      label: "Guides & carousels",
      note: "Add the topic tag of this post too",
      tags: ["#farmingtips", "#agritips", "#learnfarming", "#howto", "#farmingguide", "#pepperfarming", "#spicefarming", "#smartfarming", "#farmtools", "#plantcare"],
    },
    BV_KERALA,
  ],
};

const PESTICIDE: HashtagSet = {
  picks: ["#plantprotection", "#pestcontrol", "#cropprotection", "#keralafarming", "#farmingtips"],
  groups: [
    { label: "High reach", note: "Big general tags", tags: ["#agriculture", "#farming", "#pestcontrol", "#plantprotection", "#organicfarming", "#gardening", "#farmers", "#farmlife"] },
    {
      label: "Crop protection",
      note: "Keep the ones that match the product type",
      tags: ["#cropprotection", "#pesticides", "#insecticide", "#fungicide", "#herbicide", "#biopesticide", "#ipm", "#integratedpestmanagement", "#plantdisease", "#pestmanagement"],
    },
    BV_KERALA,
  ],
};

/** The page's first post: the brand tag plus broad farming and Kerala tags. */
const WELCOME: HashtagSet = {
  picks: ["#bethlehemvalley", "#keralafarming", "#farmingtips", "#agriculture", "#krishi"],
  groups: [
    FARM_BROAD,
    {
      label: "Launch & community",
      note: "For the first post",
      tags: ["#bethlehemvalley", "#newpage", "#farmerscommunity", "#farmersfriend", "#farmingtips", "#pepperfarming", "#plantation", "#farmtools", "#cropcare", "#dailyupdates"],
    },
    BV_KERALA,
  ],
};

/** Illustrated idea carousels (income ideas, farming methods …). */
const CARICATURE: HashtagSet = {
  picks: ["#farmingideas", "#keralafarming", "#krishi", "#agribusiness", "#farmingtips"],
  groups: [
    FARM_BROAD,
    {
      label: "Ideas & business",
      note: "Keep the ones that fit the series",
      tags: ["#farmingideas", "#agribusiness", "#agripreneur", "#farmincome", "#smartfarming", "#organicfarming", "#farmtourism", "#valueaddedproducts", "#hydroponics", "#plantnursery"],
    },
    BV_KERALA,
  ],
};

export const HASHTAGS: Record<string, HashtagSet> = {
  Instagram_BV_Caricature: CARICATURE,
  Instagram_BV_Welcome: WELCOME,
  Instagram_BV_PesticideGuide: PESTICIDE,
  Instagram_BV_Cover: COVER,
  Instagram_GlobalMarket_All: GLOBAL_MARKET,
  Instagram_SwingTrade: SWING_TRADE,
  Instagram_SwingTradeFundamentals: SWING_TRADE,
  Instagram_WeeklyOptionSelling: OPTION_SELLING,
  Instagram_WeeklyOptionSellingV2: OPTION_SELLING,
  Instagram_BV_FarmTip: FARM_TIP,
  Instagram_BV_FarmNotes: FARM_TIP,
  Instagram_BV_StepByStep: STEP_BY_STEP,
  Instagram_BV_Promotion: PROMOTION,
  Instagram_BV_AgriPromo: PROMOTION,
  Instagram_BV_Azolla: FARM_TIP,
  Instagram_BV_Features: FEATURES,
};

/** "#Farm Tips" / "farm_tips" → "#farmtips" / "#farm_tips" (Instagram tags: letters, digits, _). */
export function normalizeTag(raw: string) {
  const t = raw
    .trim()
    .replace(/^#+/, "")
    .replace(/[^\p{L}\p{N}_]/gu, "")
    .toLowerCase();
  return t ? `#${t}` : "";
}
