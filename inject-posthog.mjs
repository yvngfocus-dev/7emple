import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';

const SNIPPET = `  <!-- PostHog Analytics -->
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+" (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureFlagEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset people.set people.set_once".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_SyzuUcRONLpEjdvoPEpTgihoijrWAWfxPMXRxPaaXmQ', {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only'
    });
  </script>
</head>`;

function processDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'brand_assets', 'images'].includes(entry.name)) {
      processDir(full);
    } else if (entry.isFile() && extname(entry.name) === '.html') {
      const src = readFileSync(full, 'utf8');
      if (src.includes('posthog.init')) { console.log(`  skip (already has snippet): ${full}`); continue; }
      const updated = src.replace('</head>', SNIPPET);
      if (updated === src) { console.log(`  skip (no </head> found): ${full}`); continue; }
      writeFileSync(full, updated, 'utf8');
      console.log(`✓ ${full}`);
    }
  }
}

processDir('.');
