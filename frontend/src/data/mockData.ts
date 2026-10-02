import { Category, Requirement, ProfessionalProfile, ApplicationItem, MyWorkItem } from '../types';

export const V1_CATEGORIES: Category[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Video & Content',
    slug: 'video-content',
    description: 'Video editing, reels, motion graphics, and post-production specialists.',
    icon: 'Film',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-ve', name: 'Video Editor', slug: 'video-editor', description: 'Long-form and YouTube video cuts' },
      { id: 'r-reels', name: 'Reels / Shorts Editor', slug: 'reels-shorts-editor', description: 'Fast-paced vertical mobile edits' },
      { id: 'r-yt', name: 'YouTube Video Editor', slug: 'youtube-video-editor', description: 'High-retention storytelling & pacing' },
      { id: 'r-pod', name: 'Podcast Video Editor', slug: 'podcast-video-editor', description: 'Multi-cam switches & captions' },
      { id: 'r-motion', name: 'Motion Graphics Designer', slug: 'motion-graphics', description: 'Kinetic typography & 2D animation' },
      { id: 'r-anim', name: 'Animator', slug: 'animator', description: 'Character & explanatory animation' },
      { id: 'r-vfx', name: 'VFX Artist', slug: 'vfx-artist', description: 'CGI, visual effects & compositing' },
      { id: 'r-color', name: 'Color Grading Specialist', slug: 'color-grading', description: 'DaVinci Resolve cinematic look' }
    ],
    skills: [
      { id: 's-prem', name: 'Premiere Pro', slug: 'premiere-pro' },
      { id: 's-ae', name: 'After Effects', slug: 'after-effects' },
      { id: 's-dav', name: 'DaVinci Resolve', slug: 'davinci-resolve' },
      { id: 's-cap', name: 'CapCut Pro', slug: 'capcut' },
      { id: 's-sound', name: 'Sound Design', slug: 'sound-design' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'UGC & Creators',
    slug: 'ugc-creators',
    description: 'Authentic product hooks, unboxings, testimonials, and on-camera creators.',
    icon: 'Sparkles',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-ugc', name: 'UGC Creator', slug: 'ugc-creator', description: 'Relatable direct-response creator videos' },
      { id: 'r-content', name: 'Content Creator', slug: 'content-creator', description: 'Multi-platform social video creator' },
      { id: 'r-inf', name: 'Influencer / Creator', slug: 'influencer-creator', description: 'Niche audience creator partnerships' },
      { id: 'r-review', name: 'Product Reviewer', slug: 'product-reviewer', description: 'Honest demonstrations & comparisons' },
      { id: 'r-oncam', name: 'On-Camera Creator', slug: 'on-camera-creator', description: 'Charismatic spokespersons & models' }
    ],
    skills: [
      { id: 's-hook', name: 'Hook Scripting', slug: 'hook-scripting' },
      { id: 's-unbox', name: 'Unboxing & Demo', slug: 'unboxing' },
      { id: 's-skin', name: 'Skincare & Beauty', slug: 'skincare-beauty' },
      { id: 's-techdemo', name: 'Tech Gadget Demos', slug: 'tech-demos' }
    ]
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Design',
    slug: 'design',
    description: 'CTR thumbnails, brand identity, social graphics, and UI/UX design.',
    icon: 'ImageIcon',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-graphic', name: 'Graphic Designer', slug: 'graphic-designer', description: 'Visual branding and promotional art' },
      { id: 'r-thumb', name: 'Thumbnail Designer', slug: 'thumbnail-designer', description: 'High-CTR YouTube and video thumbnails' },
      { id: 'r-socdes', name: 'Social Media Designer', slug: 'social-media-designer', description: 'Carousels, story graphics & posts' },
      { id: 'r-brand', name: 'Logo & Brand Designer', slug: 'logo-brand-designer', description: 'Brand kits, vectors & typography' },
      { id: 'r-deck', name: 'Presentation Designer', slug: 'presentation-designer', description: 'Pitch decks and keynote templates' },
      { id: 'r-uiux', name: 'UI/UX Designer', slug: 'ui-ux-designer', description: 'Figma wireframes & design systems' }
    ],
    skills: [
      { id: 's-figma', name: 'Figma', slug: 'figma' },
      { id: 's-ps', name: 'Photoshop', slug: 'photoshop' },
      { id: 's-ai', name: 'Illustrator', slug: 'illustrator' },
      { id: 's-blender', name: 'Blender 3D', slug: 'blender-3d' }
    ]
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Marketing & Advertising',
    slug: 'marketing-advertising',
    description: 'Performance ads, social management, SEO, and paid growth campaigns.',
    icon: 'TrendingUp',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-digmkt', name: 'Digital Marketer', slug: 'digital-marketer', description: 'Multi-channel acquisition strategies' },
      { id: 'r-smm', name: 'Social Media Manager', slug: 'social-media-manager', description: 'Community growth & content calendar' },
      { id: 'r-perf', name: 'Performance Marketer', slug: 'performance-marketer', description: 'Meta & Google ROAS optimization' },
      { id: 'r-ads', name: 'Ads Specialist', slug: 'ads-specialist', description: 'Targeting, bidding & conversion scaling' },
      { id: 'r-adcreat', name: 'Ad Creative Designer', slug: 'ad-creative-designer', description: 'Direct-response static and video ads' },
      { id: 'r-seo', name: 'SEO Specialist', slug: 'seo-specialist', description: 'Keyword strategy & organic rank growth' }
    ],
    skills: [
      { id: 's-meta', name: 'Meta Ads Manager', slug: 'meta-ads' },
      { id: 's-google', name: 'Google Analytics 4', slug: 'ga4' },
      { id: 's-copyad', name: 'Direct Response Copy', slug: 'dr-copy' }
    ]
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Writing & Content',
    slug: 'writing-content',
    description: 'Video scripts, landing page copy, blogs, and social threads.',
    icon: 'Feather',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-writer', name: 'Content Writer', slug: 'content-writer', description: 'Educational articles & newsletters' },
      { id: 'r-copy', name: 'Copywriter', slug: 'copywriter', description: 'Sales pages, email sequences & headlines' },
      { id: 'r-script', name: 'Script Writer', slug: 'script-writer', description: 'Video storyboards & explainer scripts' },
      { id: 'r-ytscript', name: 'YouTube Script Writer', slug: 'youtube-script-writer', description: 'Retention-focused YouTube structures' }
    ],
    skills: [
      { id: 's-story', name: 'Storyboarding', slug: 'storyboarding' },
      { id: 's-seoart', name: 'SEO Writing', slug: 'seo-writing' }
    ]
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Audio & Voice',
    slug: 'music-audio',
    description: 'Voice-overs, voice acting, podcast mastering, and sound design.',
    icon: 'Mic',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-voice', name: 'Voice-over Artist', slug: 'voice-over-artist', description: 'Commercials, narrations & audiobooks' },
      { id: 'r-actor', name: 'Voice Actor', slug: 'voice-actor', description: 'Character voices & animations' },
      { id: 'r-audedt', name: 'Audio Editor', slug: 'audio-editor', description: 'Noise cleanup, EQ & loudness mastering' }
    ],
    skills: [
      { id: 's-protools', name: 'Pro Tools', slug: 'pro-tools' },
      { id: 's-audacity', name: 'Audacity', slug: 'audacity' }
    ]
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'Photography & Production',
    slug: 'photography',
    description: 'Studio product photography, location shoots, and videography.',
    icon: 'Camera',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-photo', name: 'Photographer', slug: 'photographer', description: 'Commercial lifestyle & portrait shots' },
      { id: 'r-prodphoto', name: 'Product Photographer', slug: 'product-photographer', description: 'High-res e-commerce catalog photos' },
      { id: 'r-video', name: 'Videographer', slug: 'videographer', description: 'On-location commercial shoots' }
    ],
    skills: [
      { id: 's-lighting', name: 'Studio Lighting', slug: 'studio-lighting' },
      { id: 's-lightroom', name: 'Adobe Lightroom', slug: 'lightroom' }
    ]
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Technology',
    slug: 'technology',
    description: 'Full-stack development, mobile apps, WordPress, AI automations, and QA.',
    icon: 'Code',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-web', name: 'Web Developer', slug: 'web-developer', description: 'Modern responsive web applications' },
      { id: 'r-front', name: 'Frontend Developer', slug: 'frontend-developer', description: 'React, TypeScript, Next.js UI' },
      { id: 'r-back', name: 'Backend Developer', slug: 'backend-developer', description: 'Node, .NET Core, APIs & Databases' },
      { id: 'r-full', name: 'Full Stack Developer', slug: 'full-stack-developer', description: 'End-to-end web & mobile systems' },
      { id: 'r-app', name: 'Mobile App Developer', slug: 'mobile-app-developer', description: 'Flutter & React Native cross-platform' },
      { id: 'r-wp', name: 'WordPress Developer', slug: 'wordpress-developer', description: 'Custom themes, WooCommerce & landing pages' },
      { id: 'r-ai', name: 'AI/ML Developer', slug: 'ai-ml-developer', description: 'LLM agents, fine-tuning & automations' }
    ],
    skills: [
      { id: 's-react', name: 'React / Next.js', slug: 'react' },
      { id: 's-net', name: '.NET 10 / C#', slug: 'dotnet' },
      { id: 's-py', name: 'Python', slug: 'python' },
      { id: 's-ts', name: 'TypeScript', slug: 'typescript' }
    ]
  },
  {
    id: '99999999-9999-9999-9999-999999999999',
    name: 'Other',
    slug: 'other',
    description: 'Specialized domain tasks, consulting, translation, operations, and custom services.',
    icon: 'MoreHorizontal',
    dynamicSchemaJson: '[]',
    roles: [
      { id: 'r-consult', name: 'Consultant / Specialist', slug: 'consultant-specialist', description: 'Domain and strategy consulting' },
      { id: 'r-trans', name: 'Translator / Transcriber', slug: 'translator-transcriber', description: 'Multilingual translation and transcription' },
      { id: 'r-assist', name: 'Virtual Assistant / Ops', slug: 'virtual-assistant', description: 'Task execution and operations support' },
      { id: 'r-custom', name: 'General Doer', slug: 'general-doer', description: 'Custom tasks and flexible execution' }
    ],
    skills: [
      { id: 's-res', name: 'Market Research', slug: 'research' },
      { id: 's-doc', name: 'Documentation', slug: 'documentation' },
      { id: 's-data', name: 'Data Entry', slug: 'data-entry' }
    ]
  }
];

export const MOCK_OPPORTUNITIES: Requirement[] = [
  {
    id: 'opp-tsk-727',
    taskId: 'TSK-000727',
    title: 'Full Stack Development - Full Stack Web Application',
    description: 'End-to-end development of a web application from frontend (React) to backend (Node.js) with database integration. Must follow MVC architecture, include admin panel, and deploy on cloud (AWS/GCP).',
    categoryId: 'cat-tech',
    categoryName: 'Technology',
    categorySlug: 'technology',
    opportunityType: 'Freelance',
    vacanciesCount: 1,
    locationType: 'Remote',
    clientName: 'Praveen Polavarapu',
    clientCompany: 'Polavarapu Tech Ventures',
    clientRating: 0.0,
    clientReviewsCount: 0,
    clientAvatar: 'P',
    budgetMin: 8000,
    budgetMax: 8000,
    currency: 'INR',
    expectedDeliveryDays: 10,
    expectedTimeline: '1-2 weeks',
    requiredLanguages: ['English'],
    requiresOnCamera: false,
    requiresProductShipment: false,
    dynamicAttributesJson: JSON.stringify({ architecture: 'MVC', cloud: 'AWS/GCP' }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 6,
    createdAtUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    rolesNeeded: ['Full Stack Developer', 'Backend Developer'],
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'PostgreSQL', 'Docker', 'REST APIs'],
    responsibilities: [
      'Design and build responsive React client frontend',
      'Implement secure Node.js REST API backend with authentication',
      'Set up database schemas in MongoDB & PostgreSQL',
      'Deploy containerized application on AWS/GCP'
    ],
    deliverables: [
      'Complete React + Node.js Source Code Repository',
      'Docker Compose deployment configuration',
      'API Documentation & Admin Panel dashboard',
      '2 Weeks bug fixing support post handoff'
    ],
    attachments: [
      { id: 'att-1', name: 'Project_Architecture_Overview.pdf', size: '2.4 MB', type: 'pdf' },
      { id: 'att-2', name: 'Database_Schema_v1.png', size: '850 KB', type: 'image' },
      { id: 'att-3', name: 'UI_Wireframes_Spec.zip', size: '4.8 MB', type: 'archive' }
    ]
  },
  {
    id: 'opp-1',
    taskId: 'TSK-000842',
    title: 'High-Retention Reels & Shorts Editor for Skincare D2C Brand',
    description: 'We need an energetic editor to transform raw UGC videos into high-converting 30-45s vertical reels. Must understand fast hook pacing, kinetic captions, and upbeat sound design.',
    categoryId: 'cat-video',
    categoryName: 'Video & Content',
    categorySlug: 'video-content',
    opportunityType: 'Task',
    vacanciesCount: 2,
    locationType: 'Remote',
    clientName: 'Ananya Sharma',
    clientCompany: 'GlowSkin Organics',
    clientRating: 4.9,
    clientReviewsCount: 14,
    clientAvatar: 'A',
    budgetMin: 12000,
    budgetMax: 20000,
    currency: 'INR',
    expectedDeliveryDays: 3,
    expectedTimeline: '3-5 days',
    requiredLanguages: ['English', 'Hindi'],
    requiresOnCamera: false,
    requiresProductShipment: false,
    dynamicAttributesJson: JSON.stringify({ video_duration: '30-45s', aspect_ratio: '9:16', deliverables_count: 5 }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 8,
    createdAtUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
    rolesNeeded: ['Reels / Shorts Editor', 'Video Editor'],
    requiredSkills: ['Premiere Pro', 'After Effects', 'Sound Design', 'CapCut Pro'],
    responsibilities: [
      'Create 5 engaging short-form reels from raw unboxing and routine footage',
      'Add dynamic subtitle animations and SFX callouts',
      'Deliver final color-corrected MP4s in 9:16 vertical format'
    ],
    deliverables: [
      '5 Master 1080x1920 MP4 Video Files',
      'Thumbnail frame grabs for each reel',
      'Up to 2 revision iterations included'
    ],
    attachments: [
      { id: 'att-4', name: 'Brand_Style_Guide.pdf', size: '3.1 MB', type: 'pdf' },
      { id: 'att-5', name: 'Sample_Reel_RoughCut.mp4', size: '14.2 MB', type: 'video' }
    ]
  },
  {
    id: 'opp-2',
    title: 'UGC Video Creator for Skincare Routine & Unboxing Hooks',
    description: 'Looking for a natural, charismatic creator to film 3 aesthetic UGC unboxing and routine demo videos. Free product kit will be shipped directly to your address.',
    categoryId: 'cat-ugc',
    categoryName: 'UGC & Creators',
    categorySlug: 'ugc-creators',
    opportunityType: 'Freelance',
    vacanciesCount: 1,
    locationType: 'Remote',
    clientName: 'Ananya Sharma',
    clientCompany: 'GlowSkin Organics',
    budgetMin: 15000,
    budgetMax: 25000,
    currency: 'INR',
    expectedDeliveryDays: 5,
    requiredLanguages: ['Telugu', 'English'],
    requiresOnCamera: true,
    requiresProductShipment: true,
    dynamicAttributesJson: JSON.stringify({ shooting_location: 'Home/Bathroom Aesthetic', hooks_count: 3 }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 12,
    createdAtUtc: new Date(Date.now() - 3600000 * 8).toISOString(),
    rolesNeeded: ['UGC Creator', 'On-Camera Creator'],
    requiredSkills: ['On-Camera UGC', 'Hook Scripting', 'Skincare & Beauty'],
    responsibilities: [
      'Film high-definition 4K raw clips following our creative brief',
      'Deliver 3 different hook variations per video concept',
      'Maintain authentic lighting and clean audio'
    ],
    deliverables: [
      '3 Edited UGC Videos (30-60s each)',
      '9 B-roll clips and raw hook variations',
      'Usage rights for social media advertising'
    ]
  },
  {
    id: 'opp-3',
    title: 'Frontend React / TypeScript UI Developer (Paid Internship)',
    description: 'Join our product team to build responsive glassmorphism interfaces and reusable component libraries. Ideal for students or junior developers looking for hands-on experience.',
    categoryId: 'cat-tech',
    categoryName: 'Technology',
    categorySlug: 'technology',
    opportunityType: 'Internship',
    vacanciesCount: 2,
    locationType: 'Remote',
    clientName: 'Rahul Mehta',
    clientCompany: 'NextGen Media Labs',
    budgetMin: 18000,
    budgetMax: 25000,
    currency: 'INR',
    expectedDeliveryDays: 30,
    requiredLanguages: ['English'],
    requiresOnCamera: false,
    requiresProductShipment: false,
    dynamicAttributesJson: JSON.stringify({ commitment_hours: '20 hrs/week', duration: '3 Months' }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 19,
    createdAtUtc: new Date(Date.now() - 3600000 * 18).toISOString(),
    rolesNeeded: ['Frontend Developer', 'UI Developer'],
    requiredSkills: ['React / Next.js', 'TypeScript', 'CSS Glassmorphism'],
    responsibilities: [
      'Implement pixel-perfect UI designs from Figma wireframes',
      'Connect frontend components to REST APIs and WebSockets',
      'Optimize web performance and mobile responsiveness'
    ],
    deliverables: [
      'Clean Git pull requests with TypeScript code',
      'Weekly component milestones',
      'Internship Certificate & Letter of Recommendation upon completion'
    ]
  },
  {
    id: 'opp-4',
    title: 'High-CTR YouTube Thumbnail Designer for Tech Channel (500k Subs)',
    description: 'Looking for a skilled thumbnail artist who understands click-through rate psychology, vibrant color separation, expressive face cutouts, and 3D mockups.',
    categoryId: 'cat-design',
    categoryName: 'Design',
    categorySlug: 'design',
    opportunityType: 'Freelance',
    vacanciesCount: 1,
    locationType: 'Remote',
    clientName: 'Karthik Rao',
    clientCompany: 'TechVision Studio',
    budgetMin: 8000,
    budgetMax: 15000,
    currency: 'INR',
    expectedDeliveryDays: 2,
    requiredLanguages: ['English'],
    requiresOnCamera: false,
    requiresProductShipment: false,
    dynamicAttributesJson: JSON.stringify({ thumbnails_per_week: 3 }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 14,
    createdAtUtc: new Date(Date.now() - 3600000 * 24).toISOString(),
    rolesNeeded: ['Thumbnail Designer', 'Graphic Designer'],
    requiredSkills: ['Photoshop', 'Blender 3D', 'Figma'],
    responsibilities: [
      'Design 3 A/B test thumbnail variations per weekly tech video',
      'Incorporate 3D gadget renders and bold typography',
      'Turn around drafts within 24 hours of video lock'
    ],
    deliverables: [
      '3 Ultra HD 1280x720 PNG/JPG thumbnails',
      'Source PSD/Figma files'
    ]
  },
  {
    id: 'opp-5',
    title: 'Direct-Response YouTube Script Writer for Personal Finance Channel',
    description: 'Write engaging 10-12 minute video scripts covering investing, budgeting, and fintech apps. Strong storytelling hooks and factual research required.',
    categoryId: 'cat-writing',
    categoryName: 'Writing & Content',
    categorySlug: 'writing-content',
    opportunityType: 'Job',
    vacanciesCount: 1,
    locationType: 'Remote',
    clientName: 'Vikram Malhotra',
    clientCompany: 'WealthCraft Media',
    budgetMin: 25000,
    budgetMax: 40000,
    currency: 'INR',
    expectedDeliveryDays: 7,
    requiredLanguages: ['English', 'Hindi'],
    requiresOnCamera: false,
    requiresProductShipment: false,
    dynamicAttributesJson: JSON.stringify({ scripts_per_month: 4 }),
    isPublicListing: true,
    status: 'Open',
    proposalsCount: 6,
    createdAtUtc: new Date(Date.now() - 3600000 * 30).toISOString(),
    rolesNeeded: ['YouTube Script Writer', 'Copywriter'],
    requiredSkills: ['Storyboarding', 'Direct Response Copy'],
    responsibilities: [
      'Research trending finance topics and conduct data verification',
      'Structure video scripts with 3-second visual hooks and retention loops',
      'Provide visual cues and B-roll notes for the editing team'
    ],
    deliverables: [
      'Complete formatted script in Google Docs',
      'Timestamped B-roll guidance notes'
    ]
  }
];

export const MOCK_DOERS: ProfessionalProfile[] = [
  {
    id: 'pro-priya',
    userId: 'u-priya',
    displayName: 'Priya Reddy',
    slug: 'priya-reddy',
    headline: 'UGC Video Creator • On-Camera Spokesperson • Telugu & English',
    bio: 'Passionate creator creating authentic skincare, wellness, and lifestyle hooks that drive genuine brand trust and conversions. 40+ completed brand collaborations.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    experienceLevel: 'Experienced',
    yearsOfExperience: 3,
    availabilityStatus: 'AvailableNow',
    hourlyRate: 1500,
    currency: 'INR',
    turnaroundDays: 3,
    languages: ['Telugu', 'English', 'Hindi'],
    appearsOnCamera: true,
    acceptsProductShipments: true,
    averageRating: 4.95,
    completedProjectsCount: 42,
    isVerified: true,
    roles: [
      { id: 'r-ugc', name: 'UGC Creator', categorySlug: 'ugc-creators' },
      { id: 'r-oncam', name: 'On-Camera Creator', categorySlug: 'ugc-creators' },
      { id: 'r-reels', name: 'Reels / Shorts Editor', categorySlug: 'video-content' }
    ],
    skills: [
      { id: 's-hook', name: 'Hook Scripting' },
      { id: 's-unbox', name: 'Unboxing & Demo' },
      { id: 's-skin', name: 'Skincare & Beauty' },
      { id: 's-cap', name: 'CapCut Pro' }
    ],
    portfolio: [
      {
        id: 'p1',
        title: 'GlowSkin Organics Vitamin C Serum Hook',
        description: 'Authentic 3-step skincare routine showcasing glow results with natural bathroom lighting.',
        categorySlug: 'ugc-creators',
        rolePerformed: 'UGC Creator & Scriptwriter',
        toolsUsed: ['iPhone 15 Pro Max', 'Ring Light', 'CapCut'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
        mediaType: 'Video'
      },
      {
        id: 'p2',
        title: 'Ayurvedic Hair Oil Unboxing & Application Demo',
        description: 'Bilingual Telugu and English demonstration highlighting product texture and ingredients.',
        categorySlug: 'ugc-creators',
        rolePerformed: 'Creator & Voiceover',
        toolsUsed: ['Softbox Lighting', 'Rode Wireless Go'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&auto=format&fit=crop&q=80',
        mediaType: 'Video'
      }
    ],
    reviews: [
      {
        id: 'rev-1',
        clientName: 'Ananya Sharma',
        clientCompany: 'GlowSkin Organics',
        overallRating: 5,
        communicationRating: 5,
        qualityRating: 5,
        timelinessRating: 5,
        comment: 'Priya delivered outstanding UGC clips for our campaign! The Telugu hooks performed exceptionally well on Meta ads with a 3.4x ROAS.',
        createdAtUtc: new Date(Date.now() - 86400000 * 5).toISOString()
      }
    ],
    reviewCount: 38
  },
  {
    id: 'pro-arjun',
    userId: 'u-arjun',
    displayName: 'Arjun Verma',
    slug: 'arjun-verma',
    headline: 'High-Retention Video Editor • YouTube Pacing • Shorts & Reels Pro',
    bio: 'Editor for creators with over 25M+ combined views. Specialize in viral storytelling, fast-paced retention cuts, kinetic typography, and immersive soundscapes.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    experienceLevel: 'Senior',
    yearsOfExperience: 5,
    availabilityStatus: 'AvailableNow',
    hourlyRate: 1800,
    currency: 'INR',
    turnaroundDays: 2,
    languages: ['English', 'Hindi'],
    appearsOnCamera: false,
    acceptsProductShipments: false,
    averageRating: 4.98,
    completedProjectsCount: 68,
    isVerified: true,
    roles: [
      { id: 'r-ve', name: 'Video Editor', categorySlug: 'video-content' },
      { id: 'r-yt', name: 'YouTube Video Editor', categorySlug: 'video-content' },
      { id: 'r-reels', name: 'Reels / Shorts Editor', categorySlug: 'video-content' }
    ],
    skills: [
      { id: 's-prem', name: 'Premiere Pro' },
      { id: 's-ae', name: 'After Effects' },
      { id: 's-sound', name: 'Sound Design' },
      { id: 's-dav', name: 'DaVinci Resolve' }
    ],
    portfolio: [
      {
        id: 'p3',
        title: 'Tech Breakdown: The Future of AI Agents',
        description: '12-minute documentary style video with 3D map animations, custom sound design, and kinetic typography.',
        categorySlug: 'video-content',
        rolePerformed: 'Lead Editor',
        toolsUsed: ['Premiere Pro', 'After Effects', 'Audition'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        mediaType: 'Video'
      }
    ],
    reviews: [
      {
        id: 'rev-2',
        clientName: 'Karthik Rao',
        clientCompany: 'TechVision Studio',
        overallRating: 5,
        communicationRating: 5,
        qualityRating: 5,
        timelinessRating: 5,
        comment: 'Arjun is by far the best editor we have worked with. Retained our viewers above 60% average percentage viewed.',
        createdAtUtc: new Date(Date.now() - 86400000 * 12).toISOString()
      }
    ],
    reviewCount: 54
  },
  {
    id: 'pro-sarah',
    userId: 'u-sarah',
    displayName: 'Sarah Chen',
    slug: 'sarah-chen',
    headline: 'CTR Thumbnail Designer • 3D Blender Artist • Figma UI Creator',
    bio: 'Designing clickable, psychology-backed thumbnails and visuals for creators and startups. Proven 14%+ click-through rate averages.',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    experienceLevel: 'Mid',
    yearsOfExperience: 4,
    availabilityStatus: 'AvailableNow',
    hourlyRate: 1200,
    currency: 'INR',
    turnaroundDays: 1,
    languages: ['English'],
    appearsOnCamera: false,
    acceptsProductShipments: false,
    averageRating: 4.92,
    completedProjectsCount: 35,
    isVerified: true,
    roles: [
      { id: 'r-thumb', name: 'Thumbnail Designer', categorySlug: 'design' },
      { id: 'r-graphic', name: 'Graphic Designer', categorySlug: 'design' }
    ],
    skills: [
      { id: 's-ps', name: 'Photoshop' },
      { id: 's-blender', name: 'Blender 3D' },
      { id: 's-figma', name: 'Figma' }
    ],
    portfolio: [
      {
        id: 'p4',
        title: 'Cyberpunk Gaming Championship Visuals',
        description: 'Vibrant 3D lighting composition with layered depth and high-contrast color grading.',
        categorySlug: 'design',
        rolePerformed: '3D & Graphics Designer',
        toolsUsed: ['Blender', 'Photoshop'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80',
        mediaType: 'Image'
      }
    ],
    reviewCount: 29
  },
  {
    id: 'pro-vikram',
    userId: 'u-vikram',
    displayName: 'Vikram Nair',
    slug: 'vikram-nair',
    headline: 'Full-Stack Developer • React, TypeScript & .NET Core Builder',
    bio: 'CS student & freelance full-stack builder creating fast, responsive web applications and API microservices. Passionate about clean code and modern UX.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    experienceLevel: 'Mid',
    yearsOfExperience: 2,
    availabilityStatus: 'AvailableNow',
    hourlyRate: 1400,
    currency: 'INR',
    turnaroundDays: 4,
    languages: ['English', 'Malayalam', 'Hindi'],
    appearsOnCamera: false,
    acceptsProductShipments: false,
    averageRating: 4.96,
    completedProjectsCount: 22,
    isVerified: true,
    roles: [
      { id: 'r-web', name: 'Web Developer', categorySlug: 'technology' },
      { id: 'r-front', name: 'Frontend Developer', categorySlug: 'technology' },
      { id: 'r-back', name: 'Backend Developer', categorySlug: 'technology' }
    ],
    skills: [
      { id: 's-react', name: 'React / Next.js' },
      { id: 's-ts', name: 'TypeScript' },
      { id: 's-net', name: '.NET 10 / C#' }
    ],
    reviewCount: 18
  }
];

export const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    requirementId: 'opp-1',
    requirementTitle: 'High-Retention Reels & Shorts Editor for Skincare D2C Brand',
    categoryName: 'Video & Content',
    clientName: 'Ananya Sharma',
    clientCompany: 'GlowSkin Organics',
    proposedPrice: 15000,
    estimatedDays: 3,
    status: 'Shortlisted',
    createdAtUtc: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'app-2',
    requirementId: 'opp-3',
    requirementTitle: 'Frontend React / TypeScript UI Developer (Paid Internship)',
    categoryName: 'Technology',
    clientName: 'Rahul Mehta',
    clientCompany: 'NextGen Media Labs',
    proposedPrice: 20000,
    estimatedDays: 30,
    status: 'Pending',
    createdAtUtc: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const MOCK_MY_WORK: MyWorkItem[] = [
  {
    id: 'work-1',
    title: 'GlowSkin Organics Vitamin C UGC Reel Shoot',
    clientName: 'Ananya Sharma',
    clientCompany: 'GlowSkin Organics',
    agreedPrice: 15000,
    currency: 'INR',
    deadlineUtc: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: 'InProgress',
    requiresShipment: true,
    courierName: 'BlueDart Express',
    trackingNumber: 'BD-882941039',
    productShippedAtUtc: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAtUtc: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'work-2',
    title: 'TechVision Studio Viral Pacing YouTube Edit',
    clientName: 'Karthik Rao',
    clientCompany: 'TechVision Studio',
    agreedPrice: 18000,
    currency: 'INR',
    deadlineUtc: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'Submitted',
    requiresShipment: false,
    createdAtUtc: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];
