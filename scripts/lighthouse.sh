#!/usr/bin/env bash
# Mobile Lighthouse for the key pages against a production server (default :3001).
# Usage: bash scripts/lighthouse.sh [baseUrl]
set -e
BASE="${1:-http://localhost:3001}"
CHROME="${CHROME_PATH:-C:/Program Files/Google/Chrome/Application/chrome.exe}"
mkdir -p reports
for entry in "home|/" "cars|/cars" "car|/cars/2023-mg-hector-plus-sharp-pro-cvt-delhi"; do
  name="${entry%%|*}"; path="${entry#*|}"
  MSYS_NO_PATHCONV=1 npx --yes lighthouse "$BASE$path" --chrome-path="$CHROME" --chrome-flags="--headless=new" \
    --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo \
    --output=json --output=html --output-path="reports/lh-$name" --quiet >/dev/null 2>&1
  node -e "
const r=require('./reports/lh-$name.report.json');const c=r.categories;
const seoNoRobots=(()=>{const refs=c.seo.auditRefs.filter(a=>a.weight>0&&a.id!=='is-crawlable');const w=refs.reduce((s,a)=>s+a.weight,0);return Math.round(100*refs.reduce((s,a)=>s+a.weight*(r.audits[a.id].score??1),0)/w)})();
console.log('$path'.padEnd(48), Object.entries(c).map(([k,v])=>k+' '+Math.round(v.score*100)).join(' | '), '| seo excl. robots-block', seoNoRobots, '| LCP', r.audits['largest-contentful-paint'].displayValue, '| CLS', r.audits['cumulative-layout-shift'].displayValue, '| TBT', r.audits['total-blocking-time'].displayValue)"
done
