// Media Kit - Hardcoded logos and brand assets

export const mediaKit = {
  logos: [
    {
      id: 'logo-1',
      name: 'Pink Poppy Wide 1',
      url: 'https://static.wixstatic.com/media/a3c153_e8c52ba6d53c437db1c547ea889a6f95~mv2.png/v1/fill/w_472,h_243,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'primary'
    },
    {
      id: 'logo-2',
      name: 'Pink Poppy Banner 1',
      url: 'https://static.wixstatic.com/media/a3c153_54474d50e25f4029b27c930ad7a07153~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-3',
      name: 'Pink Poppy Banner 2',
      url: 'https://static.wixstatic.com/media/a3c153_07fe96cb11e849a7ab11593267f2c3ba~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-4',
      name: 'Pink Poppy Banner 3',
      url: 'https://static.wixstatic.com/media/a3c153_0712cd0c7cdf47d2a2fdbc0e228d3403~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-5',
      name: 'Pink Poppy Wide 2',
      url: 'https://static.wixstatic.com/media/a3c153_7d1ce91ba0a4480c8c4892795bc81cc1~mv2.png/v1/fill/w_472,h_243,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'primary'
    },
    {
      id: 'logo-6',
      name: 'Pink Poppy Banner 4',
      url: 'https://static.wixstatic.com/media/a3c153_20bce9cb61044227a7d94bf8f9399253~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-7',
      name: 'Pink Poppy Banner 5',
      url: 'https://static.wixstatic.com/media/a3c153_779fc41bfe754e2ca985fc317c90533d~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-8',
      name: 'Pink Poppy Banner 6',
      url: 'https://static.wixstatic.com/media/a3c153_9937fd2ab0d340ebad78ab633ac8393e~mv2.png/v1/fill/w_648,h_82,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'banner'
    },
    {
      id: 'logo-9',
      name: 'Pink Poppy Square 1',
      url: 'https://static.wixstatic.com/media/a3c153_d126451c195546c2b40540aed74b779e~mv2.png/v1/fill/w_515,h_288,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'primary'
    },
    {
      id: 'logo-10',
      name: 'Pink Poppy Wide 3',
      url: 'https://static.wixstatic.com/media/a3c153_369261c729de4ad4948212a3a18e1e8e~mv2.png/v1/fill/w_472,h_243,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'primary'
    },
    {
      id: 'logo-11',
      name: 'Pink Poppy Wide 4',
      url: 'https://static.wixstatic.com/media/a3c153_71adcaed13b24ed1ab016ac084258f72~mv2.png/v1/fill/w_472,h_243,al_c,lg_1,q_85,enc_avif,quality_auto/Pink%20Poppy%20Flowers.png',
      category: 'primary'
    }
  ],
  
  categories: [
    { id: 'all', name: 'All' },
    { id: 'primary', name: 'Primary' },
    { id: 'banner', name: 'Banners' }
  ]
};

export function getLogosByCategory(category) {
  if (category === 'all') {
    return mediaKit.logos;
  }
  return mediaKit.logos.filter(logo => logo.category === category);
}

export function getLogoById(id) {
  return mediaKit.logos.find(logo => logo.id === id);
}

export default mediaKit;
