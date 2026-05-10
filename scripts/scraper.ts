import { chromium, Browser, Page } from 'playwright';
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

async function searchGoogle(
  page: Page,
  query: string,
  city: string,
  maxResults: number
): Promise<Array<{ title: string; url: string | null; snippet: string }>> {
  const searchQuery = `${query} ${city}`;
  console.log(`\nSearching: "${searchQuery}"`);

  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  // Wait for results to load
  await delay(3000);

  // Extract search results
  const results = await page.evaluate(() => {
    const items: Array<{ title: string; url: string | null; snippet: string }> = [];
    const resultElements = document.querySelectorAll('div.g, div[data-async-context] .g');

    resultElements.forEach(el => {
      const titleEl = el.querySelector('h3');
      const linkEl = el.querySelector('a[href^="http"]');
      const snippetEl = el.querySelector('div.VwiC3b, span.aCOpRe');

      if (titleEl && linkEl) {
        items.push({
          title: titleEl.textContent?.trim() || '',
          url: linkEl.getAttribute('href'),
          snippet: snippetEl?.textContent?.trim() || ''
        });
      }
    });

    return items;
  });

  // Filter out Google internal links and limit results
  return results
    .filter(r => r.url && !r.url.includes('google.com') && !r.url.includes('yelp.com') && !r.url.includes('facebook.com'))
    .slice(0, maxResults);
}

async function hasContactForm(page: Page, url: string): Promise<{ hasForm: boolean; formUrl: string | null }> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(2000);

    // Check for common contact form indicators
    const hasForm = await page.evaluate(() => {
      const indicators = [
        'form[action*="contact"]',
        'form[action*="submit"]',
        'input[type="email"]',
        'textarea[name*="message"], textarea[name*=" Message"]',
        'input[name*="phone"], input[name*="Phone"]',
        'button[type="submit"], input[type="submit"]',
        '.contact-form',
        '#contact-form',
        'form#contact'
      ];

      return indicators.some(selector => document.querySelector(selector) !== null);
    });

    // Look for contact page link
    const contactUrl = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="contact"], a[href*="Contact"]'));
      const contactLink = links.find(l => {
        const text = l.textContent?.toLowerCase() || '';
        return text.includes('contact') || text.includes('quote') || text.includes('get in touch');
      });
      return contactLink ? contactLink.getAttribute('href') : null;
    });

    if (contactUrl && !contactUrl.startsWith('http')) {
      const baseUrl = new URL(url).origin;
      return { hasForm: true, formUrl: `${baseUrl}${contactUrl.startsWith('/') ? '' : '/'}${contactUrl}` };
    }

    return { hasForm, formUrl: contactUrl };
  } catch {
    return { hasForm: false, formUrl: null };
  }
}

async function extractContactInfo(page: Page, url: string): Promise<{ phone: string | null; email: string | null }> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await delay(1500);

    const text = await page.evaluate(() => document.body.innerText);
    return {
      phone: extractPhone(text),
      email: extractEmail(text)
    };
  } catch {
    return { phone: null, email: null };
  }
}

async function scrapeCategory(
  browser: Browser,
  category: string,
  city: string,
  maxResults: number
): Promise<BusinessLead[]> {
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  const leads: BusinessLead[] = [];

  try {
    const results = await searchGoogle(page, category, city, maxResults);
    console.log(`Found ${results.length} results for "${category} ${city}"`);

    for (const result of results) {
      if (!result.url) continue;

      console.log(`  Checking: ${result.title} (${result.url})`);

      const { hasForm, formUrl } = await hasContactForm(page, result.url);
      const { phone, email } = await extractContactInfo(page, result.url);

      leads.push({
        name: result.title,
        website: result.url,
        phone,
        email,
        hasContactForm: hasForm,
        contactFormUrl: formUrl,
        category,
        city,
        source: 'Google Search'
      });

      console.log(`    Form: ${hasForm ? 'YES' : 'NO'} | Phone: ${phone || 'N/A'} | Email: ${email || 'N/A'}`);

      // Rate limiting
      await delay(2000 + Math.random() * 2000);
    }
  } catch (error) {
    console.error(`Error scraping ${category}:`, error);
  } finally {
    await context.close();
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
  console.log('=== LeadFast Business Scraper ===\n');

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

  console.log(`\nLaunching browser...`);
  const browser = await chromium.launch({ headless: true });

  const allLeads: BusinessLead[] = [];

  for (const category of selectedCategories) {
    console.log(`\n--- Scraping: ${category} ---`);
    const leads = await scrapeCategory(browser, category, city, maxResults);
    allLeads.push(...leads);
  }

  await browser.close();

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

  rl.close();
}

main().catch(console.error);
