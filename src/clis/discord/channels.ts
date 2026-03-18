import { cli, Strategy } from '../../registry.js';
import type { IPage } from '../../types.js';

export const channelsCommand = cli({
  site: 'discord',
  name: 'channels',
  description: 'List channels in the current Discord server',
  domain: 'localhost',
  strategy: Strategy.UI,
  browser: true,
  args: [],
  columns: ['Index', 'Channel', 'Type'],
  func: async (page: IPage) => {
    const channels = await page.evaluate(`
      (function() {
        const results = [];
        // Discord channel list items
        const items = document.querySelectorAll('[data-list-item-id*="channels___"], [class*="containerDefault_"]');
        
        items.forEach((item, i) => {
          const nameEl = item.querySelector('[class*="name_"], [class*="channelName"]');
          const name = nameEl ? nameEl.textContent.trim() : (item.textContent || '').trim().substring(0, 50);
          
          if (!name || name.length < 1) return;
          
          // Detect channel type from icon or aria-label
          const iconEl = item.querySelector('[class*="icon"]');
          let type = 'Text';
          if (iconEl) {
            const cls = iconEl.className || '';
            if (cls.includes('voice') || cls.includes('speaker')) type = 'Voice';
            else if (cls.includes('forum')) type = 'Forum';
            else if (cls.includes('announcement')) type = 'Announcement';
          }
          
          results.push({ Index: i + 1, Channel: name, Type: type });
        });
        
        return results;
      })()
    `);

    if (channels.length === 0) {
      return [{ Index: 0, Channel: 'No channels found', Type: '—' }];
    }
    return channels;
  },
});
