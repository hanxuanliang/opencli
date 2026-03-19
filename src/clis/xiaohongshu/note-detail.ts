import { cli, Strategy } from '../../registry.js';

cli({
  site: 'xiaohongshu',
  name: 'note-detail',
  description: '获取小红书笔记详情',
  domain: 'www.xiaohongshu.com',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    { name: 'note_id', type: 'string', required: true },
  ],
  columns: ['noteId', 'title', 'author', 'publishTime', 'likes', 'collects', 'comments', 'tags', 'content'],
  func: async (page, kwargs) => {
    const noteId = String(kwargs.note_id);
    
    await page.goto('https://www.xiaohongshu.com/explore/' + noteId);
    await page.wait(8);

    const result = await page.evaluate(`
      (() => {
        const state = window.__INITIAL_STATE__;
        if (!state) return null;
        
        const noteMap = state.note?.noteDetailMap || {};
        const keys = Object.keys(noteMap);
        if (keys.length === 0) return null;
        
        const note = noteMap[keys[0]].note;
        const interact = note.interactInfo || {};
        
        return {
          noteId: note.noteId || note.note_id || keys[0],
          title: note.title || '',
          author: note.user?.nickname || '',
          publishTime: note.time || '',
          likes: String(interact.likedCount || '0'),
          collects: String(interact.collectedCount || '0'),
          comments: String(interact.commentCount || '0'),
          tags: note.tagList ? note.tagList.map((t) => '#' + (t.name || t)).join(', ') : '',
          content: note.desc || ''
        };
      })()
    `);

    if (!result) {
      throw new Error('无法获取笔记详情');
    }

    return [result];
  },
});
