import { ANTHROPIC_API_KEY } from './secrets';

const ORDER_QUERY = '(subject:confirmation OR subject:confirmed OR subject:receipt OR subject:placed OR subject:shipped OR subject:thanks OR subject:thank) subject:order newer_than:180d';

export async function fetchOrderEmails(accessToken) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(ORDER_QUERY)}&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (res.status === 401) throw new Error('token_expired');
  const json = await res.json();
  if (json.error) throw new Error(`Gmail API: ${json.error.message}`);
  if (!json.messages?.length) return [];

  const results = await Promise.all(
    json.messages.slice(0, 30).map(m => fetchEmailProducts(accessToken, m.id))
  );

  return results.flat().filter(Boolean);
}

// Non-retail senders to exclude
const EXCLUDED_DOMAINS = [
  'godaddy', 'namecheap', 'squarespace', 'shopify', 'wix', 'wordpress',
  'google', 'apple', 'microsoft', 'amazon.com', 'aws', 'digitalocean',
  'paypal', 'stripe', 'venmo', 'cashapp', 'zelle',
  'uber', 'lyft', 'doordash', 'grubhub', 'instacart',
  'airbnb', 'expedia', 'booking', 'hotels', 'delta', 'united', 'southwest',
  'netflix', 'spotify', 'hulu', 'hbomax', 'disneyplus',
  'github', 'notion', 'slack', 'zoom', 'dropbox',
  'insurance', 'geico', 'progressive', 'statefarm',
];

async function fetchEmailProducts(accessToken, messageId) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  if (!json.payload) return [];

  const headers = json.payload.headers || [];
  const get = name => headers.find(h => h.name === name)?.value || '';
  const from = get('From');
  const subject = get('Subject');
  const date = get('Date');

  const nameMatch = from.match(/^"?([^"<]+)"?\s*</);
  const domainMatch = from.match(/@([^.>]+)\./);
  const brand = (nameMatch?.[1] || domainMatch?.[1] || '').trim().toUpperCase();
  const formattedDate = formatDate(date);
  const purchasedAt = date ? new Date(date).toISOString() : null;

  // Skip non-retail senders
  const fromLower = from.toLowerCase();
  if (EXCLUDED_DOMAINS.some(d => fromLower.includes(d))) return [];

  console.log('[gmail] processing:', from, '|', subject);

  const plainRaw = getRawBody(json.payload, 'text/plain');
  const htmlRaw = getRawBody(json.payload, 'text/html');
  const plain = plainRaw ? decodeBase64url(plainRaw) : '';
  const html = htmlRaw ? decodeBase64url(htmlRaw) : '';

  // 1. Schema.org JSON-LD — free, instant, clean structured data
  if (html) {
    const products = extractFromSchemaOrg(html, brand, formattedDate, purchasedAt, messageId);
    console.log('[gmail] schema.org results:', products.length, products.map(p => p.name));
    if (products.length > 0) return products;
  }

  // 2. Claude — handles any brand, any format
  console.log('[gmail] trying Claude for:', brand, subject);
  const strippedHtml = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#\d+;/g, '')        // strip numeric entities like &#847;
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/https?:\/\/\S+/g, '') // strip URLs
    .replace(/\s{2,}/g, ' ')
    .trim();
  // Use plain text only if it contains price info — otherwise HTML is richer
  const plainHasPrices = /\$[\d,]+/.test(plain);
  const textForLLM = (plain && plainHasPrices) ? plain : strippedHtml;

  // Extract product page URLs from HTML for microlink image fallback
  const productPagePatterns = ['/itm/', '/product/', '/products/', '/p/', '/dp/', '/item/', '/shop/'];
  const isUsableUrl = url => {
    if (!url.startsWith('http') || url.length > 1500) return false;
    const bad = ['unsubscribe', 'optout', 'tracking', 'account', 'help', 'support', 'privacy', 'terms', 'facebook', 'instagram', 'twitter', 'pinterest', 'youtube'];
    return !bad.some(b => url.toLowerCase().includes(b));
  };
  const allUrls = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]).filter(isUsableUrl);
  const productUrl = allUrls.find(u => productPagePatterns.some(p => u.toLowerCase().includes(p))) || allUrls[0] || null;

  const llmProducts = await extractFromLLM(textForLLM, subject, brand, formattedDate, purchasedAt, messageId);
  console.log('[gmail] Claude results:', llmProducts.length, llmProducts.map(p => p.name));
  if (llmProducts.length > 0) {
    // Attach product URLs so microlink can fetch real product images in the background
    llmProducts.forEach((p, i) => {
      p.productUrl = allUrls[i] || productUrl || null;
      p.imageUrl = null; // let microlink fetch from productUrl
    });
    return llmProducts;
  }

  return [];
}

// Context-based HTML parser — works for any HTML structure
function findBestImageInSlice(htmlSlice) {
  const imgTags = [...htmlSlice.matchAll(/<img[^>]+>/gi)];
  for (let i = imgTags.length - 1; i >= 0; i--) {
    const tag = imgTags[i][0];
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1] || '';
    const alt = (tag.match(/alt=["']([^"']*)["']/i)?.[1] || '').toLowerCase();
    const width = parseInt(tag.match(/width=["']?(\d+)/i)?.[1] || '0');
    const height = parseInt(tag.match(/height=["']?(\d+)/i)?.[1] || '0');
    if (!src.startsWith('http')) continue;
    if (src.match(/\.(css|js|html|htm|php|svg|ico|woff|ttf|mp4|webm)(\?|$)/i)) continue;
    if (src.length > 2000) continue;
    if (width > 0 && width < 80) continue;
    if (height > 0 && height < 80) continue;
    if (/\b(logo|icon|banner|header|footer|brand|nav|menu|social|facebook|instagram|twitter|email)\b/i.test(alt)) continue;
    const bad = ['logo', 'icon', 'spacer', 'pixel', 'track', 'header', 'footer', 'banner', 'brand', 'social', 'facebook', 'instagram', 'twitter', 'badge', 'seal', 'rating', 'star', 'venmo', 'paypal'];
    if (bad.some(p => src.toLowerCase().includes(p))) continue;
    return src;
  }
  return null;
}

function parseByPriceContext(html, brand, date, purchasedAt, messageId) {
  // Build a price→image map using the ORIGINAL html (before comment stripping)
  // so that images inside MSO conditional comments are found
  const origPriceRegex = /\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g;
  const imageByPrice = {};
  let origMatch;
  while ((origMatch = origPriceRegex.exec(html)) !== null) {
    const origPrice = '$' + origMatch[1].replace(/,/g, '').replace(/\s/g, '');
    if (imageByPrice[origPrice] !== undefined) continue;
    const before = html.slice(Math.max(0, origMatch.index - 5000), origMatch.index);
    const after = html.slice(origMatch.index, Math.min(html.length, origMatch.index + 2000));
    imageByPrice[origPrice] = findBestImageInSlice(before) || findBestImageInSlice(after);
  }

  // Remove style/script blocks and HTML comments first to avoid false matches
  const clean = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const priceRegex = /\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g;
  const products = [];
  let match;

  while ((match = priceRegex.exec(clean)) !== null) {
    const price = '$' + match[1].replace(/\s/g, '');
    const priceVal = parseFloat(match[1].replace(',', ''));

    // Skip unrealistic prices
    if (priceVal < 1 || priceVal > 10000) continue;

    // Check immediately surrounding text for fee/summary keywords (keep window tight to avoid false positives from section headers)
    const surrounding = clean
      .slice(Math.max(0, match.index - 150), match.index + 100)
      .replace(/<[^>]+>/g, ' ');
    if (/\b(total|subtotal|tax|sales tax|import charge|shipping|delivery|discount|promo|save|credit|estimated|handling|fee|duty|vat|gst|order summary|you paid|amount charged|charged to|payment method|balance|refund|import)\b/i.test(surrounding)) continue;

    // Look back up to 3000 chars — emails have large image HTML between columns
    const before = clean.slice(Math.max(0, match.index - 3000), match.index);
    // Also look 800 chars after — some layouts put name after price
    const after = clean.slice(match.index + price.length, match.index + price.length + 800);

    const chunks = (before + after)
      .replace(/<[^>]+>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&zwnj;/g, '')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/&#\d+;/g, '')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 3)
      .filter(l => !/^https?:\/\//.test(l))
      .filter(l => !/^\d+$/.test(l))
      .filter(l => !/^(price|cost|amount|unit price|your price|item price|sale price|reg\.?|retail):?$/i.test(l))
      .filter(l => !/\b(qty|quantity|size|color|sku|style|view|shop|edit|remove|dear|hello|unsubscribe|privacy|terms|rewards|points|earn|redeem|member|loyalty|account|sign in|sign up|manage|returns|exchanges|exchange|return|contact|customer|service|help|faq|store|track|address|billing|street|avenue|blvd|suite|apt|floor|estimated|charges|padding|margin|border|display|width|height|center|align|font|weight|color|background|radius|block|inline|flex|none|auto|solid|relative|absolute)\b/i.test(l))
      .filter(l => l.split(/\s+/).length >= 2 || l.length > 20)  // reject single short words — real product names have multiple words
      .filter(l => !/^\d+\s+\w/.test(l))  // street address line (e.g. "123 Main St")
      .filter(l => !/\b[A-Z]{2}\s+\d{5}/.test(l))  // state + zip (e.g. "NY 10001")
      .filter(l => !/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(l));  // person name (e.g. "Tess Perese")

    // Only use non-variant names — don't fall back to color/combo variants
    const isVariant = l =>
      /\s\/\s/.test(l) ||
      /\bcombo\b/i.test(l) ||
      /^(white|black|navy|blue|red|green|pink|grey|gray|ivory|tan|camel|nude|brown|yellow|purple|orange|cream|coral|sage|olive|denim)\b/i.test(l);

    const productName = [...chunks].reverse().find(l => l.length > 8 && l.length < 150 && !/\$/.test(l) && !isVariant(l));

    if (productName) {
      const cleaned = cleanProductName(productName);
      if (cleaned.length > 3) {
        // Extract product URL — look before AND after the price
        const nearbyHtml = clean.slice(Math.max(0, match.index - 3000), match.index + 3000);
        const anchorMatches = [...nearbyHtml.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
        const isUsableUrl = url => {
          if (!url.startsWith('http')) return false;
          if (url.length > 1500) return false;
          const bad = ['unsubscribe', 'optout', 'opt-out', 'tracking-pixel', 'open.aspx', 'view-in-browser', 'viewemail', 'mirror', 'account', 'help', 'support', 'privacy', 'terms', 'facebook', 'instagram', 'twitter', 'pinterest', 'youtube', 'linkedin', '/ulk/', '/usr/'];
          if (bad.some(b => url.toLowerCase().includes(b))) return false;
          return true;
        };

        // Prefer direct product page URLs (e.g. /itm/, /product/, /p/, /dp/)
        const productPagePatterns = ['/itm/', '/product/', '/products/', '/p/', '/dp/', '/item/', '/shop/'];
        const allUsable = anchorMatches.filter(isUsableUrl);
        const productUrl =
          allUsable.find(url => productPagePatterns.some(p => url.toLowerCase().includes(p))) ||
          allUsable[0] ||
          null;

        products.push({
          id: `${messageId}-${products.length}`,
          brand,
          name: cleaned,
          price,
          date,
          purchasedAt,
          imageUrl: imageByPrice[price.replace(/,/g, '')] || null,
          productUrl,
        });
      }
    }
  }

  // Filter out cards where the product name looks like a fee, order number, or garbage
  const filtered = dedupe(products).filter(p => {
    const name = p.name;
    if (/\b(taxes?|shipping|delivery|handling|fee|charge|import|duty|total|subtotal|discount|refund|credit|insurance|rewards|points|earn|redeem|address|billing|estimated)\b/i.test(name)) return false;
    if (/^\d+\s+\w/.test(name)) return false;  // street address
    if (/\b[A-Z]{2}\s+\d{5}/.test(name)) return false;  // state + zip
    if (/^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name)) return false;  // person name
    if (/\b(order|confirmation|invoice|receipt|transaction)\b/i.test(name)) return false;
    // Filter names that contain raw HTML
    if (/<[a-z]/i.test(name) || /<!--/.test(name) || /\bclass=|align=|width=|href=/.test(name)) return false;
    // Filter names that are mostly numbers (order IDs, tracking numbers)
    const digits = (name.match(/\d/g) || []).length;
    if (digits / name.length > 0.4) return false;
    // Filter very short or all-caps short strings (likely codes)
    if (name.length < 6) return false;
    return true;
  });

  return filtered;
}

// Plain text parser
function extractFromText(body, brand, date, purchasedAt, messageId) {
  const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const priceRegex = /\$[\d,]+\.?\d{0,2}/;
  const products = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const priceMatch = line.match(priceRegex);
    if (!priceMatch) continue;
    if (/\b(total|subtotal|tax|shipping|discount|promo|save|credit|gift card|handling)\b/i.test(line)) continue;

    let productName = null;

    const beforePrice = line.slice(0, line.indexOf(priceMatch[0])).trim();
    if (beforePrice.length > 5 && !/\b(total|subtotal|tax|shipping)\b/i.test(beforePrice)) {
      productName = beforePrice;
    }

    if (!productName) {
      for (let j = i - 1; j >= Math.max(0, i - 6); j--) {
        const candidate = lines[j];
        if (
          candidate.length > 5 &&
          candidate.length < 200 &&
          !candidate.match(priceRegex) &&
          !candidate.match(/^\d+$/) &&
          !candidate.match(/^https?:\/\//) &&
          !candidate.match(/\b(qty|quantity|color|size|sku|style|dear|hello|thank|confirm|ship|bill|total|subtotal)\b/i)
        ) {
          productName = candidate;
          break;
        }
      }
    }

    if (productName) {
      const cleaned = cleanProductName(productName);
      if (cleaned.length > 3) {
        products.push({
          id: `${messageId}-${products.length}`,
          brand,
          name: cleaned,
          price: priceMatch[0],
          date,
          purchasedAt,
        });
      }
    }
  }

  return dedupe(products).slice(0, 10);
}

function getRawBody(payload, mimeType) {
  if (payload.mimeType === mimeType && payload.body?.data) return payload.body.data;
  if (payload.parts) {
    for (const part of payload.parts) {
      const found = getRawBody(part, mimeType);
      if (found) return found;
    }
  }
  return null;
}

function decodeBase64url(data) {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return atob(padded);
  } catch {
    return '';
  }
}

function cleanProductName(name) {
  return name
    .replace(/^(product name|item name|item|description|product)[:\s]*/i, '')
    .replace(/[\*\|•·–—]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSubject(subject) {
  return subject
    .replace(/#?\w*\d{5,}\w*/g, '')
    .replace(/order (confirmation|confirmed|receipt|update)/gi, '')
    .replace(/your (order|purchase)/gi, '')
    .replace(/[:#\-|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

// Schema.org JSON-LD parser — works for Gap, Adidas, many major retailers
function extractFromSchemaOrg(html, brand, date, purchasedAt, messageId) {
  const products = [];
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const orders = Array.isArray(data) ? data : [data];
      for (const obj of orders) {
        const order = obj['@type'] === 'Order' ? obj : obj['@graph']?.find(n => n['@type'] === 'Order');
        if (!order) continue;
        const items = order.orderedItem || [];
        for (const item of items) {
          const product = item.orderedItem || item;
          const name = product.name;
          if (!name || name.length < 4) continue;
          const price = item.orderQuantity
            ? null
            : (product.offers?.price || item.orderItemPrice || null);
          const image = Array.isArray(product.image) ? product.image[0] : product.image;
          const imageUrl = typeof image === 'string' ? image : image?.url || null;
          products.push({
            id: `${messageId}-schema-${products.length}`,
            brand,
            name: cleanProductName(name),
            price: price ? `$${parseFloat(price).toFixed(2)}` : '',
            date,
            purchasedAt,
            imageUrl: imageUrl || null,
            productUrl: product.url || null,
          });
        }
      }
    } catch {}
  }
  return products;
}

// Claude LLM fallback — handles any email format
async function extractFromLLM(plainText, subject, brand, date, purchasedAt, messageId) {
  try {
    // Take beginning + end — product info may be anywhere in the email
    const body = plainText.length > 8000
      ? plainText.slice(0, 4000) + '\n...\n' + plainText.slice(-3000)
      : plainText.slice(0, 8000);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Extract the ordered products from this order confirmation email. Return ONLY a JSON array, no explanation.

Each item: {"name": "product name", "price": "$XX.XX", "imageUrl": null}
- Only include actual products ordered, not fees/shipping/taxes
- Skip if no clear product name found
- imageUrl is always null (we can't get images from text)

Subject: ${subject}
Brand: ${brand}
Body:
${body}

JSON array:`,
        }],
      }),
    });
    const json = await res.json();
    const text = json.content?.[0]?.text?.trim();
    if (!text) return [];
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const items = JSON.parse(match[0]);
    return items
      .filter(item => item.name && item.name.length > 3)
      .map((item, i) => ({
        id: `${messageId}-llm-${i}`,
        brand,
        name: cleanProductName(item.name),
        price: item.price || '',
        date,
        purchasedAt,
        imageUrl: null,
        productUrl: null,
      }));
  } catch (e) {
    console.log('[gmail] LLM fallback error:', e.message);
    return [];
  }
}

function dedupe(products) {
  const seen = new Set();
  return products.filter(p => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
