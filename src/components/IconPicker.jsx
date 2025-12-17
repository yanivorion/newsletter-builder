import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../lib/utils';

// Import icons from react-icons organized by category
import { 
  FaHeart, FaStar, FaThumbsUp, FaFire, FaBolt, FaGem, FaCrown, FaTrophy,
  FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaTiktok, FaDiscord, FaSpotify,
  FaEnvelope, FaPhone, FaComment, FaBell, FaPaperPlane, FaComments,
  FaShoppingCart, FaGift, FaTag, FaPercent, FaStore, FaCreditCard, FaBox,
  FaSun, FaMoon, FaCloud, FaSnowflake, FaUmbrella, FaWind,
  FaCoffee, FaPizzaSlice, FaIceCream, FaBirthdayCake, FaWineGlass, FaAppleAlt, FaGlassCheers,
  FaMusic, FaHeadphones, FaGuitar, FaMicrophone, FaCompactDisc,
  FaPlane, FaCar, FaShip, FaBicycle, FaRocket, FaGlobeAmericas,
  FaCamera, FaVideo, FaImage, FaFilm, FaPalette, FaPaintBrush,
  FaLaptop, FaMobile, FaDesktop, FaGamepad, FaKeyboard, FaMouse,
  FaBook, FaGraduationCap, FaPencilAlt, FaLightbulb, FaBrain, FaFlask,
  FaRunning, FaFootballBall, FaBasketballBall, FaDumbbell, FaSwimmer, FaBiking,
  FaHome, FaBuilding, FaTree, FaMountain, FaWater, FaLeaf,
  FaUsers, FaUserAlt, FaHandshake, FaPeopleArrows, FaUserFriends,
  FaLock, FaShieldAlt, FaKey, FaEye, FaFingerprint,
  FaClock, FaCalendarAlt, FaHourglassHalf, FaStopwatch,
  FaCheck, FaTimes, FaPlus, FaMinus, FaQuestion, FaExclamation,
  FaArrowRight, FaArrowLeft, FaArrowUp, FaArrowDown, FaChevronRight,
  FaSmile, FaLaugh, FaGrinStars, FaSadTear, FaAngry, FaSurprise,
  FaMedal, FaAward, FaRibbon, FaCertificate,
  FaHammer, FaWrench, FaCog, FaTools,
  FaDog, FaCat, FaHorse, FaFish, FaDove, FaPaw
} from 'react-icons/fa';

import {
  MdCelebration, MdLocalOffer, MdNewReleases, MdTrendingUp, MdVerified,
  MdFavorite, MdStars, MdAutoAwesome, MdWorkspacePremium,
  MdRestaurant, MdLocalCafe, MdFastfood, MdLocalBar,
  MdFlight, MdDirectionsCar, MdDirectionsBike, MdTrain,
  MdSchool, MdMenuBook, MdScience,
  MdSportsSoccer, MdSportsBasketball, MdSportsTennis,
  MdPets, MdEmojiNature, MdPark,
  MdEmail, MdNotifications, MdChat,
  MdShoppingBag, MdLocalShipping, MdPayment
} from 'react-icons/md';

import {
  BsEmojiSmile, BsEmojiLaughing, BsEmojiHeartEyes, BsEmojiSunglasses,
  BsLightning, BsLightningFill, BsStars, BsSpotify, BsTiktok, BsWhatsapp,
  BsCart3, BsBag, BsGift, BsTag, BsPercent,
  BsCameraVideo, BsMusicNote, BsHeadphones,
  BsRocket, BsAirplane, BsTruck,
  BsHouseDoor, BsBuilding, BsTree,
  BsPerson, BsPeople, BsPersonHeart
} from 'react-icons/bs';

import {
  HiSparkles, HiStar, HiFire, HiHeart, HiLightningBolt,
  HiGift, HiShoppingCart, HiTag,
  HiMail, HiBell, HiChat,
  HiCamera, HiFilm, HiMusicNote,
  HiHome, HiOfficeBuilding, HiGlobe,
  HiUserGroup, HiUser, HiUsers,
  HiAcademicCap, HiBookOpen, HiLightBulb
} from 'react-icons/hi';

import {
  IoRocket, IoSparkles, IoHeart, IoStar, IoFlash,
  IoGift, IoCart, IoPricetag,
  IoMail, IoNotifications, IoChatbubbles,
  IoAirplane, IoCar, IoBicycle,
  IoHome, IoEarth, IoLeaf,
  IoPeople, IoPerson, IoSchool
} from 'react-icons/io5';

import {
  RiVipCrownFill, RiFireFill, RiSparklingFill, RiMedalFill,
  RiCoupon3Fill, RiShoppingBag3Fill, RiGiftFill,
  RiMailFill, RiNotification3Fill, RiMessage3Fill,
  RiMusic2Fill, RiHeadphoneFill, RiMicFill,
  RiPlantFill, RiSunFill, RiMoonFill,
  RiTeamFill, RiUserStarFill, RiVipDiamondFill
} from 'react-icons/ri';

import {
  GiPartyPopper, 
  GiCupcake, GiCakeSlice, GiChocolateBar, GiCookie, GiDonut,
  GiPalmTree, GiIsland, GiBeachBucket, GiSunflower,
  GiDiamondRing, GiCrystalBall, GiTreasureMap,
  GiMicrophone, GiDrumKit, GiSaxophone,
  GiSoccerBall, GiBasketballBall, GiTennisBall
} from 'react-icons/gi';

// Organized icon categories
const iconCategories = {
  'Popular': [
    { icon: FaHeart, name: 'Heart', keywords: ['love', 'like', 'favorite'] },
    { icon: FaStar, name: 'Star', keywords: ['rating', 'favorite', 'best'] },
    { icon: FaFire, name: 'Fire', keywords: ['hot', 'trending', 'popular'] },
    { icon: HiSparkles, name: 'Sparkles', keywords: ['magic', 'new', 'special'] },
    { icon: FaBolt, name: 'Bolt', keywords: ['lightning', 'fast', 'power'] },
    { icon: FaThumbsUp, name: 'Thumbs Up', keywords: ['like', 'approve', 'good'] },
    { icon: FaGem, name: 'Gem', keywords: ['diamond', 'premium', 'valuable'] },
    { icon: FaCrown, name: 'Crown', keywords: ['king', 'queen', 'royal', 'vip'] },
    { icon: FaTrophy, name: 'Trophy', keywords: ['winner', 'award', 'champion'] },
    { icon: FaRocket, name: 'Rocket', keywords: ['launch', 'fast', 'growth'] },
    { icon: MdVerified, name: 'Verified', keywords: ['check', 'approved', 'authentic'] },
    { icon: MdAutoAwesome, name: 'Auto Awesome', keywords: ['magic', 'ai', 'auto'] },
  ],
  'Celebration': [
    { icon: GiPartyPopper, name: 'Party Popper', keywords: ['celebrate', 'party', 'confetti'] },
    { icon: MdCelebration, name: 'Celebration', keywords: ['party', 'celebrate', 'hooray'] },
    { icon: FaBirthdayCake, name: 'Birthday Cake', keywords: ['birthday', 'celebrate', 'party'] },
    { icon: GiCupcake, name: 'Cupcake', keywords: ['dessert', 'party', 'sweet'] },
    { icon: GiCakeSlice, name: 'Cake Slice', keywords: ['dessert', 'party', 'birthday'] },
    { icon: FaGift, name: 'Gift', keywords: ['present', 'surprise', 'birthday'] },
    { icon: FaMusic, name: 'Music', keywords: ['party', 'dance', 'celebrate'] },
    { icon: FaMedal, name: 'Medal', keywords: ['winner', 'award', 'achievement'] },
    { icon: FaAward, name: 'Award', keywords: ['prize', 'winner', 'achievement'] },
    { icon: FaGlassCheers, name: 'Cheers', keywords: ['toast', 'celebrate', 'party'] },
  ],
  'Emojis': [
    { icon: FaSmile, name: 'Smile', keywords: ['happy', 'emoji', 'face'] },
    { icon: FaLaugh, name: 'Laugh', keywords: ['happy', 'funny', 'lol'] },
    { icon: FaGrinStars, name: 'Star Eyes', keywords: ['amazed', 'wow', 'excited'] },
    { icon: BsEmojiHeartEyes, name: 'Heart Eyes', keywords: ['love', 'adore', 'crush'] },
    { icon: BsEmojiSunglasses, name: 'Cool', keywords: ['cool', 'sunglasses', 'awesome'] },
    { icon: FaSadTear, name: 'Sad', keywords: ['crying', 'sad', 'tear'] },
    { icon: FaSurprise, name: 'Surprised', keywords: ['shocked', 'wow', 'omg'] },
    { icon: BsEmojiSmile, name: 'Smiley', keywords: ['happy', 'smile', 'friendly'] },
    { icon: BsEmojiLaughing, name: 'Laughing', keywords: ['haha', 'funny', 'lol'] },
  ],
  'Social Media': [
    { icon: FaTwitter, name: 'Twitter', keywords: ['x', 'tweet', 'social'] },
    { icon: FaInstagram, name: 'Instagram', keywords: ['ig', 'photo', 'social'] },
    { icon: FaFacebook, name: 'Facebook', keywords: ['fb', 'social', 'meta'] },
    { icon: FaLinkedin, name: 'LinkedIn', keywords: ['professional', 'network', 'jobs'] },
    { icon: FaYoutube, name: 'YouTube', keywords: ['video', 'streaming', 'google'] },
    { icon: BsTiktok, name: 'TikTok', keywords: ['video', 'short', 'viral'] },
    { icon: FaDiscord, name: 'Discord', keywords: ['chat', 'gaming', 'community'] },
    { icon: BsSpotify, name: 'Spotify', keywords: ['music', 'streaming', 'podcast'] },
    { icon: BsWhatsapp, name: 'WhatsApp', keywords: ['chat', 'messaging', 'meta'] },
  ],
  'Shopping': [
    { icon: FaShoppingCart, name: 'Shopping Cart', keywords: ['buy', 'ecommerce', 'checkout'] },
    { icon: BsCart3, name: 'Cart', keywords: ['shopping', 'buy', 'basket'] },
    { icon: BsBag, name: 'Shopping Bag', keywords: ['retail', 'store', 'buy'] },
    { icon: FaGift, name: 'Gift', keywords: ['present', 'reward', 'bonus'] },
    { icon: FaTag, name: 'Tag', keywords: ['price', 'label', 'sale'] },
    { icon: FaPercent, name: 'Percent', keywords: ['discount', 'sale', 'off'] },
    { icon: MdLocalOffer, name: 'Offer', keywords: ['deal', 'discount', 'sale'] },
    { icon: FaStore, name: 'Store', keywords: ['shop', 'retail', 'business'] },
    { icon: FaCreditCard, name: 'Credit Card', keywords: ['payment', 'buy', 'checkout'] },
    { icon: MdLocalShipping, name: 'Shipping', keywords: ['delivery', 'package', 'order'] },
  ],
  'Communication': [
    { icon: FaEnvelope, name: 'Email', keywords: ['mail', 'message', 'inbox'] },
    { icon: FaBell, name: 'Bell', keywords: ['notification', 'alert', 'reminder'] },
    { icon: FaComment, name: 'Comment', keywords: ['chat', 'message', 'talk'] },
    { icon: FaComments, name: 'Comments', keywords: ['chat', 'conversation', 'discuss'] },
    { icon: FaPaperPlane, name: 'Send', keywords: ['message', 'submit', 'telegram'] },
    { icon: FaPhone, name: 'Phone', keywords: ['call', 'contact', 'mobile'] },
    { icon: MdNotifications, name: 'Notifications', keywords: ['alert', 'bell', 'update'] },
    { icon: MdChat, name: 'Chat', keywords: ['message', 'talk', 'support'] },
  ],
  'Food & Drink': [
    { icon: FaCoffee, name: 'Coffee', keywords: ['drink', 'cafe', 'morning'] },
    { icon: FaPizzaSlice, name: 'Pizza', keywords: ['food', 'italian', 'slice'] },
    { icon: FaIceCream, name: 'Ice Cream', keywords: ['dessert', 'sweet', 'summer'] },
    { icon: GiCupcake, name: 'Cupcake', keywords: ['dessert', 'sweet', 'cake'] },
    { icon: GiCakeSlice, name: 'Cake', keywords: ['dessert', 'birthday', 'sweet'] },
    { icon: GiChocolateBar, name: 'Chocolate', keywords: ['sweet', 'candy', 'dessert'] },
    { icon: GiCookie, name: 'Cookie', keywords: ['sweet', 'biscuit', 'snack'] },
    { icon: GiDonut, name: 'Donut', keywords: ['sweet', 'breakfast', 'dessert'] },
    { icon: FaWineGlass, name: 'Wine', keywords: ['drink', 'alcohol', 'celebrate'] },
    { icon: FaAppleAlt, name: 'Apple', keywords: ['fruit', 'healthy', 'food'] },
    { icon: MdRestaurant, name: 'Restaurant', keywords: ['food', 'dining', 'eat'] },
    { icon: MdLocalCafe, name: 'Cafe', keywords: ['coffee', 'drink', 'relax'] },
  ],
  'Music & Entertainment': [
    { icon: FaMusic, name: 'Music', keywords: ['song', 'audio', 'tune'] },
    { icon: FaHeadphones, name: 'Headphones', keywords: ['audio', 'listen', 'music'] },
    { icon: FaGuitar, name: 'Guitar', keywords: ['music', 'instrument', 'rock'] },
    { icon: FaMicrophone, name: 'Microphone', keywords: ['sing', 'podcast', 'voice'] },
    { icon: GiMicrophone, name: 'Mic Retro', keywords: ['sing', 'karaoke', 'voice'] },
    { icon: FaCompactDisc, name: 'CD', keywords: ['music', 'album', 'disc'] },
    { icon: GiDrumKit, name: 'Drums', keywords: ['music', 'instrument', 'beat'] },
    { icon: GiSaxophone, name: 'Saxophone', keywords: ['jazz', 'music', 'instrument'] },
    { icon: FaFilm, name: 'Film', keywords: ['movie', 'cinema', 'video'] },
    { icon: FaGamepad, name: 'Gaming', keywords: ['game', 'play', 'controller'] },
  ],
  'Travel': [
    { icon: FaPlane, name: 'Plane', keywords: ['flight', 'travel', 'vacation'] },
    { icon: FaCar, name: 'Car', keywords: ['drive', 'road', 'vehicle'] },
    { icon: FaShip, name: 'Ship', keywords: ['cruise', 'boat', 'ocean'] },
    { icon: FaBicycle, name: 'Bicycle', keywords: ['bike', 'cycle', 'ride'] },
    { icon: FaGlobeAmericas, name: 'Globe', keywords: ['world', 'earth', 'global'] },
    { icon: GiPalmTree, name: 'Palm Tree', keywords: ['beach', 'tropical', 'vacation'] },
    { icon: GiIsland, name: 'Island', keywords: ['beach', 'tropical', 'vacation'] },
    { icon: GiBeachBucket, name: 'Beach', keywords: ['summer', 'sand', 'vacation'] },
    { icon: FaMountain, name: 'Mountain', keywords: ['hiking', 'nature', 'adventure'] },
    { icon: MdFlight, name: 'Flight', keywords: ['airplane', 'travel', 'trip'] },
  ],
  'Nature & Weather': [
    { icon: FaSun, name: 'Sun', keywords: ['sunny', 'day', 'bright'] },
    { icon: FaMoon, name: 'Moon', keywords: ['night', 'dark', 'sleep'] },
    { icon: FaCloud, name: 'Cloud', keywords: ['weather', 'sky', 'cloudy'] },
    { icon: FaSnowflake, name: 'Snowflake', keywords: ['winter', 'cold', 'snow'] },
    { icon: FaLeaf, name: 'Leaf', keywords: ['nature', 'eco', 'green'] },
    { icon: FaTree, name: 'Tree', keywords: ['nature', 'forest', 'green'] },
    { icon: FaWater, name: 'Water', keywords: ['wave', 'ocean', 'sea'] },
    { icon: GiSunflower, name: 'Sunflower', keywords: ['flower', 'nature', 'summer'] },
    { icon: MdEmojiNature, name: 'Nature', keywords: ['bee', 'flower', 'spring'] },
    { icon: MdPark, name: 'Park', keywords: ['nature', 'outdoors', 'trees'] },
  ],
  'Education': [
    { icon: FaBook, name: 'Book', keywords: ['read', 'learn', 'study'] },
    { icon: FaGraduationCap, name: 'Graduation', keywords: ['school', 'degree', 'graduate'] },
    { icon: FaPencilAlt, name: 'Pencil', keywords: ['write', 'edit', 'draw'] },
    { icon: FaLightbulb, name: 'Lightbulb', keywords: ['idea', 'think', 'innovation'] },
    { icon: FaBrain, name: 'Brain', keywords: ['think', 'smart', 'mind'] },
    { icon: FaFlask, name: 'Flask', keywords: ['science', 'lab', 'experiment'] },
    { icon: MdSchool, name: 'School', keywords: ['education', 'learn', 'study'] },
    { icon: MdMenuBook, name: 'Menu Book', keywords: ['read', 'study', 'learn'] },
    { icon: MdScience, name: 'Science', keywords: ['lab', 'experiment', 'chemistry'] },
  ],
  'Sports & Fitness': [
    { icon: FaRunning, name: 'Running', keywords: ['exercise', 'fitness', 'jog'] },
    { icon: FaFootballBall, name: 'Football', keywords: ['sports', 'nfl', 'game'] },
    { icon: FaBasketballBall, name: 'Basketball', keywords: ['sports', 'nba', 'game'] },
    { icon: FaDumbbell, name: 'Dumbbell', keywords: ['gym', 'workout', 'fitness'] },
    { icon: FaSwimmer, name: 'Swimming', keywords: ['pool', 'exercise', 'water'] },
    { icon: FaBiking, name: 'Cycling', keywords: ['bike', 'exercise', 'ride'] },
    { icon: GiSoccerBall, name: 'Soccer', keywords: ['football', 'sports', 'game'] },
    { icon: GiTennisBall, name: 'Tennis', keywords: ['sports', 'racket', 'game'] },
    { icon: MdSportsSoccer, name: 'Sports', keywords: ['game', 'play', 'athletic'] },
  ],
  'Animals': [
    { icon: FaDog, name: 'Dog', keywords: ['pet', 'puppy', 'animal'] },
    { icon: FaCat, name: 'Cat', keywords: ['pet', 'kitten', 'animal'] },
    { icon: FaHorse, name: 'Horse', keywords: ['animal', 'ride', 'equestrian'] },
    { icon: FaFish, name: 'Fish', keywords: ['pet', 'aquarium', 'sea'] },
    { icon: FaDove, name: 'Dove', keywords: ['bird', 'peace', 'fly'] },
    { icon: FaPaw, name: 'Paw', keywords: ['pet', 'animal', 'print'] },
    { icon: MdPets, name: 'Pets', keywords: ['animal', 'dog', 'cat'] },
  ],
  'Business': [
    { icon: FaUsers, name: 'Team', keywords: ['group', 'people', 'community'] },
    { icon: FaUserAlt, name: 'User', keywords: ['person', 'profile', 'account'] },
    { icon: FaHandshake, name: 'Handshake', keywords: ['deal', 'partnership', 'agreement'] },
    { icon: FaBuilding, name: 'Building', keywords: ['office', 'company', 'business'] },
    { icon: FaHome, name: 'Home', keywords: ['house', 'property', 'real estate'] },
    { icon: FaLaptop, name: 'Laptop', keywords: ['computer', 'work', 'tech'] },
    { icon: FaDesktop, name: 'Desktop', keywords: ['computer', 'monitor', 'work'] },
    { icon: FaCog, name: 'Settings', keywords: ['gear', 'config', 'options'] },
    { icon: FaTools, name: 'Tools', keywords: ['settings', 'repair', 'build'] },
  ],
  'Security': [
    { icon: FaLock, name: 'Lock', keywords: ['secure', 'password', 'private'] },
    { icon: FaShieldAlt, name: 'Shield', keywords: ['protect', 'security', 'safe'] },
    { icon: FaKey, name: 'Key', keywords: ['password', 'access', 'unlock'] },
    { icon: FaEye, name: 'Eye', keywords: ['view', 'watch', 'visible'] },
    { icon: FaFingerprint, name: 'Fingerprint', keywords: ['security', 'biometric', 'identity'] },
    { icon: FaCheck, name: 'Check', keywords: ['done', 'complete', 'yes'] },
  ],
  'Time': [
    { icon: FaClock, name: 'Clock', keywords: ['time', 'watch', 'hour'] },
    { icon: FaCalendarAlt, name: 'Calendar', keywords: ['date', 'schedule', 'event'] },
    { icon: FaHourglassHalf, name: 'Hourglass', keywords: ['time', 'wait', 'loading'] },
    { icon: FaStopwatch, name: 'Stopwatch', keywords: ['timer', 'countdown', 'speed'] },
  ],
  'Arrows': [
    { icon: FaArrowRight, name: 'Arrow Right', keywords: ['next', 'forward', 'direction'] },
    { icon: FaArrowLeft, name: 'Arrow Left', keywords: ['back', 'previous', 'direction'] },
    { icon: FaArrowUp, name: 'Arrow Up', keywords: ['up', 'increase', 'direction'] },
    { icon: FaArrowDown, name: 'Arrow Down', keywords: ['down', 'decrease', 'direction'] },
    { icon: FaChevronRight, name: 'Chevron', keywords: ['next', 'expand', 'more'] },
    { icon: MdTrendingUp, name: 'Trending Up', keywords: ['growth', 'increase', 'chart'] },
  ],
};

function IconPicker({ value, onChange, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Popular');

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return iconCategories[activeCategory] || [];
    }

    const query = searchQuery.toLowerCase();
    const results = [];
    
    Object.values(iconCategories).forEach(icons => {
      icons.forEach(iconData => {
        const matchesName = iconData.name.toLowerCase().includes(query);
        const matchesKeyword = iconData.keywords.some(kw => kw.includes(query));
        if (matchesName || matchesKeyword) {
          if (!results.find(r => r.name === iconData.name)) {
            results.push(iconData);
          }
        }
      });
    });
    
    return results;
  }, [searchQuery, activeCategory]);

  const categories = Object.keys(iconCategories);

  return (
    <div className="w-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-8 pl-7 pr-3 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#04D1FC] focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors",
                activeCategory === category
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Icons Grid */}
      <div className="grid grid-cols-6 gap-1.5 max-h-[200px] overflow-y-auto p-1">
        {filteredIcons.map((iconData, index) => {
          const IconComponent = iconData.icon;
          const isSelected = value === iconData.name;
          
          return (
            <button
              key={`${iconData.name}-${index}`}
              onClick={() => {
                onChange(iconData.name, IconComponent);
                onClose?.();
              }}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-lg border transition-all hover:scale-110",
                isSelected
                  ? "bg-[#04D1FC] text-white border-[#04D1FC]"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-[#04D1FC] hover:text-[#04D1FC]"
              )}
              title={iconData.name}
            >
              <IconComponent className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* No Results */}
      {filteredIcons.length === 0 && (
        <div className="text-center py-6 text-zinc-400 text-xs">
          No icons found for "{searchQuery}"
        </div>
      )}

      {/* Results Count */}
      {searchQuery && filteredIcons.length > 0 && (
        <p className="text-[10px] text-zinc-400 mt-2 text-center">
          Found {filteredIcons.length} icons
        </p>
      )}
    </div>
  );
}

// Export the icon map for use in rendering
export const getIconByName = (name) => {
  for (const icons of Object.values(iconCategories)) {
    const found = icons.find(i => i.name === name);
    if (found) return found.icon;
  }
  return null;
};

// Create a flat map of all icons by name for easy lookup
export const iconMap = {};
Object.values(iconCategories).forEach(icons => {
  icons.forEach(iconData => {
    iconMap[iconData.name] = iconData.icon;
  });
});

export { iconCategories };
export default IconPicker;
