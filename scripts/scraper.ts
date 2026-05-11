import { createWriteStream } from 'fs';
import * as readline from 'readline';

interface BusinessLead {
  name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  hasContactForm: boolean;
  contactFormUrl: string | null;
  category: string;
  city: string;
  source: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractPhone(text: string): string | null {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
}

function extractEmail(text: string): string | null {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

async function fetchHTML(url: string, timeout = 15000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
      },
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function isAggregator(url: string): boolean {
  const aggregators = [
    'yelp.com', 'facebook.com', 'bbb.org', 'angi.com', 'homeadvisor.com',
    'thumbtack.com', 'houzz.com', 'buildzoom.com', 'nextdoor.com',
    'wikipedia.org', 'yellowpages.com', 'superpages.com', 'manta.com',
    'chamberofcommerce.com', 'porch.com', 'craftjack.com', 'networx.com',
    'fixr.com', 'tackk.com', 'alignable.com', 'bark.com', 'groupon.com',
    'porchlightpro.com', 'contractors.com', 'modernize.com', 'smith.ai',
    'credible.com', 'lawnlove.com', 'homeyou.com', 'renovationfind.com',
    'trustedpros.ca', 'threebestrated.com', 'expertise.com', 'hirethebest.com'
  ];
  return aggregators.some(a => url.includes(a));
}

function isRealBusinessSite(url: string): boolean {
  if (!url.startsWith('http')) return false;
  if (isAggregator(url)) return false;
  // Exclude social media and known platforms
  const blocked = ['linkedin.com', 'twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'youtube.com', 'reddit.com', 'quora.com', 'pinterest.com'];
  return !blocked.some(b => url.includes(b));
}

async function extractRealWebsiteFromAggregator(url: string, title: string): Promise<string | null> {
  const html = await fetchHTML(url, 10000);
  if (!html) return null;

  // Yelp: look for the business website link
  // Usually in a link with text "Website" or class containing "website"
  const websiteMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*>(?:\s*<[^>]+>)*\s*(?:Website|Visit Website|Official Site)/i);
  if (websiteMatch) return websiteMatch[1];

  // BBB: look for business website
  const bbbMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*class="[^"]*website/i);
  if (bbbMatch) return bbbMatch[1];

  // Thumbtack/Angi: look for external links
  const externalMatch = html.match(/href="(https?:\/\/[^"]+)"[^>]*target="_blank"/i);
  if (externalMatch && isRealBusinessSite(externalMatch[1])) return externalMatch[1];

  // Generic: look for any link that looks like a business website
  const allLinks = Array.from(html.matchAll(/href="(https?:\/\/[^"]+)"/g));
  for (const match of allLinks) {
    const link = match[1];
    if (isRealBusinessSite(link)) return link;
  }

  return null;
}

async function searchDuckDuckGo(
  query: string,
  city: string,
  maxResults: number
): Promise<Array<{ title: string; url: string | null; isAggregator: boolean }>> {
  const searchQuery = `${query} ${city}`;
  console.log(`\nSearching: "${searchQuery}"`);

  const html = await fetchHTML(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`);
  if (!html) {
    console.log('  Failed to fetch results');
    return [];
  }

  const results: Array<{ title: string; url: string | null; isAggregator: boolean }> = [];

  // Parse DuckDuckGo HTML results
  const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null && results.length < maxResults * 2) {
    let url = match[1];
    if (url.startsWith('/')) {
      const redirectMatch = url.match(/uddg=([^&]+)/);
      if (redirectMatch) {
        url = decodeURIComponent(redirectMatch[1]);
      }
    }
    const title = match[2].replace(/<[^>]+>/g, '').trim();

    if (url && url.startsWith('http')) {
      results.push({
        title,
        url,
        isAggregator: isAggregator(url)
      });
    }
  }

  console.log(`  Found ${results.length} raw results`);
  return results;
}

async function hasContactForm(url: string): Promise<{ hasForm: boolean; formUrl: string | null }> {
  const html = await fetchHTML(url, 10000);
  if (!html) return { hasForm: false, formUrl: null };

  const indicators = [
    'form[action*="contact"]', 'form[action*="submit"]', 'input[type="email"]',
    'textarea', 'button[type="submit"]', '.contact-form', '#contact-form',
    'form#contact', 'input[name*="name"]', 'input[name*="phone"]'
  ];

  const hasForm = indicators.some(selector => {
    return html.includes(selector) || (html.toLowerCase().includes('contact') && html.toLowerCase().includes('form'));
  });

  const contactRegex = /href="([^"]*contact[^"]*)"|href="([^"]*quote[^"]*)"/i;
  const contactMatch = html.match(contactRegex);

  if (contactMatch) {
    const contactPath = contactMatch[1] || contactMatch[2];
    try {
      const baseUrl = new URL(url).origin;
      return { hasForm: true, formUrl: `${baseUrl}${contactPath.startsWith('/') ? '' : '/'}${contactPath}` };
    } catch {
      return { hasForm, formUrl: null };
    }
  }

  return { hasForm, formUrl: null };
}

async function extractContactInfo(url: string): Promise<{ phone: string | null; email: string | null }> {
  const html = await fetchHTML(url, 10000);
  if (!html) return { phone: null, email: null };

  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  return {
    phone: extractPhone(text),
    email: extractEmail(text)
  };
}

async function scrapeCategory(
  category: string,
  city: string,
  maxResults: number
): Promise<BusinessLead[]> {
  const leads: BusinessLead[] = [];
  const seenUrls = new Set<string>();

  try {
    const results = await searchDuckDuckGo(category, city, maxResults);

    if (results.length === 0) {
      console.log('  No results found.');
      return leads;
    }

    let realSitesFound = 0;

    for (const result of results) {
      if (!result.url) continue;

      let realUrl = result.url;
      let name = result.title;

      // If it's an aggregator, try to extract the real business website
      if (result.isAggregator) {
        console.log(`  Aggregator found: ${result.url.substring(0, 60)}... extracting real website...`);
        const extracted = await extractRealWebsiteFromAggregator(result.url, result.title);
        if (extracted && isRealBusinessSite(extracted)) {
          realUrl = extracted;
          console.log(`    Extracted: ${realUrl.substring(0, 80)}`);
        } else {
          console.log(`    Could not extract real website, skipping.`);
          continue;
        }
      }

      // Skip duplicates
      if (seenUrls.has(realUrl)) continue;
      seenUrls.add(realUrl);

      console.log(`  Checking: ${name.substring(0, 60)} (${realUrl.substring(0, 60)}...)`);

      const { hasForm, formUrl } = await hasContactForm(realUrl);
      const { phone, email } = await extractContactInfo(realUrl);

      leads.push({
        name,
        website: realUrl,
        phone,
        email,
        hasContactForm: hasForm,
        contactFormUrl: formUrl,
        category,
        city,
        source: 'DuckDuckGo Search'
      });

      realSitesFound++;
      console.log(`    Form: ${hasForm ? 'YES' : 'NO'} | Phone: ${phone || 'N/A'} | Email: ${email || 'N/A'}`);

      if (realSitesFound >= maxResults) break;

      // Rate limiting
      await delay(1500 + Math.random() * 1000);
    }
  } catch (error) {
    console.error(`Error scraping ${category}:`, error);
  }

  return leads;
}

function saveToCSV(leads: BusinessLead[], filename: string): void {
  const stream = createWriteStream(filename);

  // Header
  stream.write('Name,Website,Phone,Email,Has Contact Form,Contact Form URL,Category,City,Source\n');

  // Rows
  for (const lead of leads) {
    const row = [
      `"${lead.name.replace(/"/g, '""')}"`,
      lead.website || '',
      lead.phone || '',
      lead.email || '',
      lead.hasContactForm ? 'Yes' : 'No',
      lead.contactFormUrl || '',
      lead.category,
      lead.city,
      lead.source
    ].join(',');

    stream.write(row + '\n');
  }

  stream.end();
  console.log(`\nSaved ${leads.length} leads to ${filename}`);
}

async function main(): Promise<void> {
  console.log('=== LeadFast Business Scraper (Real Websites) ===\n');

  const city = await ask('Enter city/region (e.g., "New Jersey" or "Edison NJ"): ');
  const maxResultsInput = await ask('Max results per category (default 10): ');
  const maxResults = parseInt(maxResultsInput) || 10;

  const categories = [
    'solar installers',
    'fence builders',
    'deck contractors',
    'pool builders',
    'landscaping services',
    'painting contractors',
    'flooring installers',
    'window replacement',
    'home inspectors',
    'concrete contractors',
    'cleaning services',
    'junk removal',
    'moving companies',
    'roofing contractors'
  ];

  console.log('\nCategories to search:');
  categories.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));

  const selection = await ask('\nEnter category numbers to search (comma-separated, or "all"): ');

  let selectedCategories: string[];
  if (selection.toLowerCase() === 'all') {
    selectedCategories = categories;
  } else {
    const indices = selection.split(',').map(s => parseInt(s.trim()) - 1);
    selectedCategories = indices
      .filter(i => i >= 0 && i < categories.length)
      .map(i => categories[i]);
  }

  if (selectedCategories.length === 0) {
    console.log('No categories selected. Exiting.');
    rl.close();
    return;
  }

  console.log(`\nStarting search (extracting real business websites)...`);

  const allLeads: BusinessLead[] = [];

  for (const category of selectedCategories) {
    console.log(`\n--- Scraping: ${category} ---`);
    const leads = await scrapeCategory(category, city, maxResults);
    allLeads.push(...leads);
  }

  // Save results
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `leads-${city.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.csv`;
  saveToCSV(allLeads, filename);

  // Summary
  const withForms = allLeads.filter(l => l.hasContactForm).length;
  const withPhone = allLeads.filter(l => l.phone).length;
  const withEmail = allLeads.filter(l => l.email).length;

  console.log('\n=== Summary ===');
  console.log(`Total leads found: ${allLeads.length}`);
  console.log(`With contact forms: ${withForms}`);
  console.log(`With phone: ${withPhone}`);
  console.log(`With email: ${withEmail}`);
  console.log(`\nOutput: ${filename}`);

  if (allLeads.length === 0) {
    console.log('\n⚠️  No leads found. Try a broader city name like "New Jersey" instead of a specific town.');
  }

  rl.close();
}

main().catch(console.error);
