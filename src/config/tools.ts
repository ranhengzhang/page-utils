export interface ToolConfig {
  id: string;
  name: string;
  desc: string;
  icon: string;
  path: string;
  component: () => Promise<unknown>;
}

export const tools: ToolConfig[] = [
  {
    id: 'bili-check',
    name: 'Bili Check',
    desc: '让分 P 视频学习更有条理',
    icon: '📺',
    path: '/tools/bili-check',
    component: () => import('../views/tools/BiliCheck.vue'),
  },
  {
    id: 'img-to-markdown',
    name: 'IMG → Markdown',
    desc: '将 HTML img 标签转换为 Markdown',
    icon: '🖼️',
    path: '/tools/img-to-markdown',
    component: () => import('../views/tools/ImgToMarkdown.vue'),
  },
  {
    id: 'regex-extractor',
    name: 'Regex Extractor',
    desc: '现代化正则表达式提取工具',
    icon: '🔍',
    path: '/tools/regex-extractor',
    component: () => import('../views/tools/RegexExtractor.vue'),
  },
  {
    id: 'ruby-generator',
    name: 'Ruby Generator',
    desc: '振假名生成工具',
    icon: '🇯🇵',
    path: '/tools/ruby-generator',
    component: () => import('../views/tools/RubyGenerator.vue'),
  },
  {
    id: 'review-content-generator',
    name: 'Review Content Generator',
    desc: '审核内容生成工具',
    icon: '📝',
    path: '/tools/review-content-generator',
    component: () => import('../views/tools/ReviewContentGenerator.vue'),
  },
];

export const navItems = [
  { name: '首页', path: '/', icon: '🏠' },
  ...tools.map((tool) => ({
    name: tool.name,
    path: tool.path,
    icon: tool.icon,
  })),
];
