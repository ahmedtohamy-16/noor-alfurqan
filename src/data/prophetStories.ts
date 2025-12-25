export interface QuranVerse {
  arabic: string;
  translation?: string;
  reference: string;
}

export interface Hadith {
  text: string;
  source: string;
}

export interface ExtendedStory {
  title: string;
  content: string;
  lessons: string[];
  quranVerses?: QuranVerse[];
  hadiths?: Hadith[];
}

export interface ProphetStory {
  id: string;
  name: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
    id: string;
    tr: string;
  };
  era: string;
  order: number;
  stories: {
    [language: string]: ExtendedStory;
  };
}

export interface Dialect {
  id: string;
  name: string;
  nameAr: string;
}

export interface Language {
  id: string;
  name: string;
  nameNative: string;
  direction: 'rtl' | 'ltr';
}

export const languages: Language[] = [
  { id: 'ar', name: 'Arabic', nameNative: 'العربية الفصحى', direction: 'rtl' },
  { id: 'ar-eg', name: 'Egyptian Arabic', nameNative: 'المصرية', direction: 'rtl' },
  { id: 'ar-sa', name: 'Saudi Arabic', nameNative: 'السعودية', direction: 'rtl' },
  { id: 'ar-sy', name: 'Syrian Arabic', nameNative: 'الشامية', direction: 'rtl' },
  { id: 'ar-ma', name: 'Moroccan Arabic', nameNative: 'المغربية', direction: 'rtl' },
  { id: 'ar-iq', name: 'Iraqi Arabic', nameNative: 'العراقية', direction: 'rtl' },
  { id: 'en', name: 'English', nameNative: 'English', direction: 'ltr' },
  { id: 'fr', name: 'French', nameNative: 'Français', direction: 'ltr' },
  { id: 'ur', name: 'Urdu', nameNative: 'اردو', direction: 'rtl' },
  { id: 'id', name: 'Indonesian', nameNative: 'Bahasa Indonesia', direction: 'ltr' },
  { id: 'tr', name: 'Turkish', nameNative: 'Türkçe', direction: 'ltr' },
];

export const prophetStories: ProphetStory[] = [
  // 1. آدم عليه السلام
  {
    id: 'adam',
    name: { ar: 'آدم', en: 'Adam', fr: 'Adam', ur: 'آدم', id: 'Adam', tr: 'Adem' },
    era: 'بداية الخلق',
    order: 1,
    stories: {
      ar: {
        title: 'قصة آدم عليه السلام - أبو البشر',
        content: `آدم عليه السلام هو أول إنسان خلقه الله تعالى، وهو أبو البشرية جمعاء. خلقه الله من طين ثم نفخ فيه من روحه. كان خلق آدم آية من آيات الله العظيمة، إذ صوّره بيده سبحانه وتعالى ونفخ فيه من روحه، فكان ذلك تكريماً عظيماً لهذا المخلوق الذي جعله الله خليفةً في الأرض.

أمر الله الملائكة بالسجود لآدم تكريماً له، فسجدوا جميعاً إلا إبليس أبى واستكبر وكان من الكافرين. قال إبليس متكبراً: "أنا خير منه خلقتني من نار وخلقته من طين"، فكان هذا الكبر سبب طرده من رحمة الله.

أسكن الله آدم وزوجته حواء الجنة، وأباح لهما كل ما فيها من نعيم وخيرات، إلا شجرة واحدة نهاهما عن الاقتراب منها ابتلاءً لهما.

لكن الشيطان لم ييأس من إغوائهما، فوسوس لهما وأغراهما بالخلود والملك الذي لا يبلى، حتى أكلا من الشجرة المحرمة. عندما أكلا منها، بدت لهما سوآتهما، فأخذا يخصفان عليهما من ورق الجنة ستراً لأنفسهما.

عاتبهما الله على ما فعلا، فأدركا خطيئتهما وندما ندماً شديداً، وتابا إلى الله واستغفراه، فتاب الله عليهما إنه هو التواب الرحيم.

أنزل الله آدم وحواء إلى الأرض ليعمراها، وجعل ذريتهما خلفاء في الأرض يعبدون الله ويعمرون الكون. علّم الله آدم الأسماء كلها، وجعله أول نبي على وجه الأرض يدعو ذريته إلى عبادة الله وحده.`,
        lessons: [
          'التوبة تمحو الذنوب مهما عظمت، فباب التوبة مفتوح دائماً',
          'الكبر سبب هلاك إبليس، فهو أول ذنب عُصي الله به',
          'طاعة الله واجبة في كل الأحوال',
          'الإنسان معرض للخطأ لكن عليه التوبة والاستغفار',
          'العلم تكريم من الله للإنسان ويرفع درجته',
          'الشيطان عدو للإنسان يسعى دائماً لإغوائه',
        ],
        quranVerses: [
          {
            arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
            translation: 'And when your Lord said to the angels: I am going to place a vicegerent on earth.',
            reference: 'سورة البقرة - الآية 30'
          },
          {
            arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
            translation: 'And He taught Adam all the names.',
            reference: 'سورة البقرة - الآية 31'
          },
          {
            arabic: 'فَتَلَقَّىٰ آدَمُ مِن رَّبِّهِ كَلِمَاتٍ فَتَابَ عَلَيْهِ ۚ إِنَّهُ هُوَ التَّوَّابُ الرَّحِيمُ',
            translation: 'Then Adam received words from his Lord, and He accepted his repentance.',
            reference: 'سورة البقرة - الآية 37'
          },
        ],
        hadiths: [
          {
            text: 'كُلُّكُمْ لآدَمَ، وَآدَمُ مِنْ تُرَابٍ',
            source: 'رواه الترمذي'
          },
          {
            text: 'خَلَقَ اللهُ آدَمَ عَلَى صُورَتِهِ، طُولُهُ سِتُّونَ ذِرَاعًا',
            source: 'رواه البخاري ومسلم'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Adam - Father of Humanity',
        content: `Prophet Adam (peace be upon him) was the first human being created by Allah, and he is the father of all mankind. Allah created him from clay and then breathed into him His spirit.

Allah commanded the angels to prostrate to Adam as an honor to him. They all prostrated except Iblis (Satan), who refused out of arrogance. Iblis said: "I am better than him. You created me from fire and created him from clay."

Allah settled Adam and his wife Hawwa (Eve) in Paradise and permitted them all its blessings, except for one tree which He forbade them from approaching.

But Satan whispered to them and enticed them until they ate from the forbidden tree. When they ate from it, their nakedness became apparent to them, and they began covering themselves with leaves from Paradise.

Allah admonished them for what they had done, and they realized their sin and felt deep remorse. They repented to Allah and sought His forgiveness, and Allah accepted their repentance.

Allah sent Adam and Hawwa down to Earth to inhabit it, and made their descendants successors on Earth to worship Allah. Allah taught Adam all the names and made him the first prophet on Earth.`,
        lessons: [
          'Repentance erases sins no matter how great',
          'Arrogance was the cause of Satan\'s downfall',
          'Obedience to Allah is obligatory at all times',
          'Humans are prone to error but must repent',
          'Knowledge is an honor from Allah',
          'Satan is an enemy to mankind',
        ],
        quranVerses: [
          {
            arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
            translation: 'And when your Lord said to the angels: I am going to place a vicegerent on earth.',
            reference: 'Surah Al-Baqarah - Verse 30'
          },
        ],
        hadiths: [
          {
            text: 'All of you are from Adam, and Adam was from dust.',
            source: 'Narrated by Tirmidhi'
          },
        ],
      },
    },
  },

  // 2. إدريس عليه السلام
  {
    id: 'idris',
    name: { ar: 'إدريس', en: 'Idris', fr: 'Idris', ur: 'ادریس', id: 'Idris', tr: 'İdris' },
    era: 'ما قبل الطوفان',
    order: 2,
    stories: {
      ar: {
        title: 'قصة إدريس عليه السلام - أول من خط بالقلم',
        content: `إدريس عليه السلام هو من أوائل الأنبياء بعد آدم عليه السلام، وهو جد نوح عليه السلام. كان صادقاً نبياً، رفعه الله مكاناً علياً.

كان إدريس عليه السلام أول من خط بالقلم، وأول من خاط الثياب ولبسها، فكان الناس قبله يلبسون الجلود. علّمه الله علم النجوم والحساب والكتابة.

أمره الله تعالى بدعوة قومه إلى التوحيد وترك عبادة الأصنام. فكان يدعوهم إلى الله ويأمرهم بالمعروف وينهاهم عن المنكر.

آمن به قليل من قومه، أما أكثرهم فكذبوه وأصروا على كفرهم. فاعتزلهم إدريس عليه السلام وانقطع للعبادة.

رفعه الله مكاناً علياً تكريماً له وجزاءً لصبره وإخلاصه في عبادته ودعوته.`,
        lessons: [
          'العلم والمعرفة من أعظم النعم التي يمنحها الله لعباده',
          'الصبر على الدعوة واجب حتى لو قل المؤمنون',
          'الاعتزال للعبادة عند فساد الناس محمود',
          'الله يرفع من يخلص له في العبادة',
          'الدعوة إلى الله مسؤولية كل مسلم',
        ],
        quranVerses: [
          {
            arabic: 'وَاذْكُرْ فِي الْكِتَابِ إِدْرِيسَ ۚ إِنَّهُ كَانَ صِدِّيقًا نَّبِيًّا',
            translation: 'And mention in the Book, Idris. Indeed, he was a truthful prophet.',
            reference: 'سورة مريم - الآية 56'
          },
          {
            arabic: 'وَرَفَعْنَاهُ مَكَانًا عَلِيًّا',
            translation: 'And We raised him to a high station.',
            reference: 'سورة مريم - الآية 57'
          },
        ],
        hadiths: [
          {
            text: 'مررت على إدريس ليلة أسري بي في السماء الرابعة',
            source: 'رواه البخاري ومسلم'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Idris - The First to Write with a Pen',
        content: `Prophet Idris (peace be upon him) was one of the earliest prophets after Adam. He was the grandfather of Noah. He was a truthful prophet whom Allah raised to a high station.

Idris was the first to write with a pen, and the first to sew clothes and wear them, as people before him used to wear animal skins. Allah taught him the knowledge of astronomy, mathematics, and writing.

Allah commanded him to call his people to monotheism and abandon idol worship. He called them to Allah and enjoined what was good and forbade what was evil.

A few of his people believed, but most rejected him and persisted in their disbelief. So Idris isolated himself for worship.

Allah raised him to a high station as an honor for his patience and sincerity in worship and calling to Allah.`,
        lessons: [
          'Knowledge is one of the greatest blessings Allah grants His servants',
          'Patience in calling to Allah is required even when believers are few',
          'Isolating oneself for worship when people are corrupt is praiseworthy',
          'Allah elevates those who are sincere in worship',
          'Calling to Allah is every Muslim\'s responsibility',
        ],
        quranVerses: [
          {
            arabic: 'وَاذْكُرْ فِي الْكِتَابِ إِدْرِيسَ ۚ إِنَّهُ كَانَ صِدِّيقًا نَّبِيًّا',
            translation: 'And mention in the Book, Idris. Indeed, he was a truthful prophet.',
            reference: 'Surah Maryam - Verse 56'
          },
        ],
      },
    },
  },

  // 3. نوح عليه السلام
  {
    id: 'nuh',
    name: { ar: 'نوح', en: 'Noah', fr: 'Noé', ur: 'نوح', id: 'Nuh', tr: 'Nuh' },
    era: 'الطوفان العظيم',
    order: 3,
    stories: {
      ar: {
        title: 'قصة نوح عليه السلام - شيخ المرسلين',
        content: `نوح عليه السلام هو أول رسول أرسله الله إلى أهل الأرض بعد أن انتشر الشرك والفساد. لبث في قومه ألف سنة إلا خمسين عاماً يدعوهم إلى الله.

بدأ قوم نوح بعبادة الأصنام وهي: ود، وسواع، ويغوث، ويعوق، ونسرا. وكانت أسماء رجال صالحين، فلما ماتوا صنعوا لهم تماثيل ثم عبدوها من دون الله.

دعا نوح قومه بكل الوسائل: ليلاً ونهاراً، سراً وجهاراً. أنذرهم عذاب الله ووعدهم بالمغفرة إن آمنوا. لكنهم كذبوه واستهزأوا به.

أوحى الله إلى نوح أن يصنع السفينة. فصنعها بأمر الله، وكان قومه يسخرون منه كلما مروا عليه.

لما اكتملت السفينة، أمره الله أن يحمل فيها من كل زوجين اثنين ومن آمن معه. وفار التنور وانهمر المطر، وارتفع الماء حتى غطى الجبال.

غرق الكافرون ومنهم ابن نوح الذي رفض أن يركب مع أبيه. نجا نوح ومن معه، واستقرت السفينة على جبل الجودي.`,
        lessons: [
          'الصبر على الدعوة مهما طالت المدة',
          'التنويع في أساليب الدعوة',
          'العلاقة بالله أهم من روابط القرابة',
          'عاقبة المستكبرين الهلاك',
          'الله ينجي المؤمنين مهما اشتدت المحن',
          'التوكل على الله في أصعب الظروف',
        ],
        quranVerses: [
          {
            arabic: 'وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا',
            translation: 'And We certainly sent Noah to his people, and he remained among them a thousand years minus fifty years.',
            reference: 'سورة العنكبوت - الآية 14'
          },
          {
            arabic: 'قِيلَ يَا نُوحُ اهْبِطْ بِسَلَامٍ مِّنَّا وَبَرَكَاتٍ عَلَيْكَ',
            translation: 'It was said: O Noah, disembark with peace from Us and blessings.',
            reference: 'سورة هود - الآية 48'
          },
        ],
        hadiths: [
          {
            text: 'نوح أول رسول بعثه الله إلى أهل الأرض',
            source: 'رواه البخاري'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Noah - The Sheikh of Messengers',
        content: `Prophet Noah (peace be upon him) was the first messenger sent by Allah to the people of Earth after polytheism and corruption spread. He remained among his people for 950 years calling them to Allah.

Noah's people began worshipping idols named Wadd, Suwa', Yaghuth, Ya'uq, and Nasr. These were originally names of righteous men, and when they died, statues were made of them and eventually worshipped.

Noah called his people by all means: day and night, secretly and publicly. He warned them of Allah's punishment and promised forgiveness if they believed. But they rejected and mocked him.

Allah revealed to Noah to build the Ark. He built it as Allah commanded, while his people mocked him whenever they passed by.

When the Ark was complete, Allah commanded him to carry pairs of every creature and those who believed with him. The oven burst forth and rain poured down, and water rose until it covered the mountains.

The disbelievers drowned, including Noah's son who refused to board with his father. Noah and those with him were saved, and the Ark came to rest on Mount Judi.`,
        lessons: [
          'Patience in calling to Allah no matter how long it takes',
          'Varying the methods of calling to Allah',
          'Relationship with Allah is more important than family ties',
          'The arrogant face destruction',
          'Allah saves believers no matter how severe the trials',
          'Trust in Allah in the most difficult circumstances',
        ],
        quranVerses: [
          {
            arabic: 'وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَىٰ قَوْمِهِ فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا',
            translation: 'And We certainly sent Noah to his people, and he remained among them a thousand years minus fifty years.',
            reference: 'Surah Al-Ankabut - Verse 14'
          },
        ],
      },
    },
  },

  // 4. هود عليه السلام
  {
    id: 'hud',
    name: { ar: 'هود', en: 'Hud', fr: 'Houd', ur: 'ہود', id: 'Hud', tr: 'Hud' },
    era: 'قوم عاد',
    order: 4,
    stories: {
      ar: {
        title: 'قصة هود عليه السلام - نبي عاد',
        content: `هود عليه السلام أرسله الله إلى قوم عاد الذين سكنوا الأحقاف في جنوب الجزيرة العربية. كانوا قوماً أقوياء شديدي البأس، بنوا قصوراً عظيمة وكانوا أصحاب حضارة متقدمة.

أنعم الله عليهم بالقوة والمال والأولاد، لكنهم كفروا بنعمة الله وعبدوا الأصنام. وكانوا يقولون: "من أشد منا قوة؟"

أرسل الله إليهم هوداً عليه السلام ليدعوهم إلى عبادة الله وحده وترك الأصنام. ذكّرهم بنعم الله عليهم وحذرهم من عذابه.

استكبر قوم عاد وكذبوا هوداً وقالوا: "أجئتنا لنعبد الله وحده ونذر ما كان يعبد آباؤنا؟" واستمروا في طغيانهم.

أنجى الله هوداً ومن آمن معه، وأرسل على قوم عاد ريحاً صرصراً عاتية. سخرها عليهم سبع ليال وثمانية أيام حسوماً، فدمرتهم ولم تبق منهم أحداً.`,
        lessons: [
          'القوة المادية لا تغني عن الله شيئاً',
          'النعم تزول بالكفران',
          'التكبر على الحق سبب الهلاك',
          'الله قادر على إهلاك الظالمين بأضعف مخلوقاته',
          'الاستغفار والتوبة سبب زيادة الخير',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ',
            translation: 'And to \'Aad We sent their brother Hud. He said: O my people, worship Allah; you have no deity other than Him.',
            reference: 'سورة الأعراف - الآية 65'
          },
          {
            arabic: 'فَأَرْسَلْنَا عَلَيْهِمْ رِيحًا صَرْصَرًا فِي أَيَّامٍ نَّحِسَاتٍ',
            translation: 'So We sent upon them a screaming wind during days of misfortune.',
            reference: 'سورة فصلت - الآية 16'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Hud - Prophet to \'Aad',
        content: `Prophet Hud (peace be upon him) was sent by Allah to the people of 'Aad who lived in Al-Ahqaf in southern Arabia. They were a powerful and mighty people who built great palaces and had an advanced civilization.

Allah blessed them with strength, wealth, and children, but they disbelieved in Allah's blessings and worshipped idols. They would say: "Who is mightier than us in strength?"

Allah sent Hud to call them to worship Allah alone and abandon idols. He reminded them of Allah's blessings and warned them of His punishment.

The people of 'Aad were arrogant and rejected Hud. They said: "Have you come to us that we should worship Allah alone and leave what our fathers worshipped?" They continued in their transgression.

Allah saved Hud and those who believed with him, and sent upon the people of 'Aad a fierce, violent wind. He subjected it upon them for seven nights and eight days in succession, destroying them completely.`,
        lessons: [
          'Material strength is useless against Allah',
          'Blessings disappear through ingratitude',
          'Arrogance against truth leads to destruction',
          'Allah can destroy oppressors with His weakest creation',
          'Seeking forgiveness and repentance increases blessings',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ عَادٍ أَخَاهُمْ هُودًا',
            translation: 'And to \'Aad We sent their brother Hud.',
            reference: 'Surah Al-A\'raf - Verse 65'
          },
        ],
      },
    },
  },

  // 5. صالح عليه السلام
  {
    id: 'salih',
    name: { ar: 'صالح', en: 'Salih', fr: 'Salih', ur: 'صالح', id: 'Shaleh', tr: 'Salih' },
    era: 'قوم ثمود',
    order: 5,
    stories: {
      ar: {
        title: 'قصة صالح عليه السلام - نبي ثمود',
        content: `صالح عليه السلام أرسله الله إلى قوم ثمود الذين سكنوا الحجر بين الحجاز والشام. كانوا يسكنون في بيوت نحتوها في الجبال، وكانوا أصحاب حضارة عظيمة.

دعاهم صالح إلى عبادة الله وحده وترك الأصنام، وذكّرهم بنعم الله عليهم وكيف أنه استخلفهم في الأرض بعد قوم عاد.

طلب قوم ثمود من صالح آية تثبت نبوته، فدعا الله فأخرج لهم من الصخرة ناقة عظيمة. وأمرهم الله أن يتركوها تأكل في أرض الله وألا يمسوها بسوء.

لكن قوم ثمود لم يستمعوا للتحذير، فتآمر تسعة رجال منهم على قتل الناقة، فعقروها. فقال لهم صالح: "تمتعوا في داركم ثلاثة أيام"، وهذا وعد غير مكذوب.

بعد ثلاثة أيام جاءتهم الصيحة من السماء، فأصبحوا في ديارهم جاثمين. ونجى الله صالحاً ومن آمن معه.`,
        lessons: [
          'الآيات والمعجزات لا تنفع من أصر على الكفر',
          'الظلم سبب هلاك الأمم',
          'اتباع الظالمين يؤدي إلى الهلاك معهم',
          'العناد والاستكبار من صفات الهالكين',
          'الله يمهل ولا يهمل',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ',
            translation: 'And to Thamud We sent their brother Salih. He said: O my people, worship Allah; you have no deity other than Him.',
            reference: 'سورة الأعراف - الآية 73'
          },
          {
            arabic: 'فَعَقَرُوهَا فَقَالَ تَمَتَّعُوا فِي دَارِكُمْ ثَلَاثَةَ أَيَّامٍ',
            translation: 'But they hamstrung her, so he said: Enjoy yourselves in your homes for three days.',
            reference: 'سورة هود - الآية 65'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Salih - Prophet to Thamud',
        content: `Prophet Salih (peace be upon him) was sent by Allah to the people of Thamud who lived in Al-Hijr between Hijaz and Syria. They lived in houses carved from mountains and had a great civilization.

Salih called them to worship Allah alone and leave idols, reminding them of Allah's blessings and how He made them successors after the people of 'Aad.

The people of Thamud asked Salih for a sign proving his prophethood. He prayed to Allah, and a great she-camel emerged from a rock. Allah commanded them to let her graze in Allah's land and not harm her.

But the people of Thamud did not heed the warning. Nine men conspired to kill the she-camel, and they hamstrung her. Salih said to them: "Enjoy yourselves in your homes for three days," an unfailing promise.

After three days, a mighty blast came upon them from the sky, and they became lifeless in their homes. Allah saved Salih and those who believed with him.`,
        lessons: [
          'Signs and miracles do not benefit those who insist on disbelief',
          'Oppression causes the destruction of nations',
          'Following oppressors leads to destruction with them',
          'Stubbornness and arrogance are traits of the doomed',
          'Allah gives respite but never neglects',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ ثَمُودَ أَخَاهُمْ صَالِحًا',
            translation: 'And to Thamud We sent their brother Salih.',
            reference: 'Surah Al-A\'raf - Verse 73'
          },
        ],
      },
    },
  },

  // 6. إبراهيم عليه السلام
  {
    id: 'ibrahim',
    name: { ar: 'إبراهيم', en: 'Abraham', fr: 'Abraham', ur: 'ابراہیم', id: 'Ibrahim', tr: 'İbrahim' },
    era: 'خليل الرحمن',
    order: 6,
    stories: {
      ar: {
        title: 'قصة إبراهيم عليه السلام - خليل الله',
        content: `إبراهيم عليه السلام هو أبو الأنبياء وخليل الرحمن. نشأ في بيئة يُعبد فيها الأصنام، وكان أبوه آزر يصنعها.

تفكّر إبراهيم في الكون وبحث عن الحقيقة. رأى كوكباً فقال: "هذا ربي"، فلما أفل قال: "لا أحب الآفلين". ثم رأى القمر فقال: "هذا ربي"، فلما أفل قال: "لئن لم يهدني ربي لأكونن من القوم الضالين". ثم رأى الشمس فقال: "هذا ربي هذا أكبر"، فلما أفلت قال: "إني بريء مما تشركون".

دعا إبراهيم قومه إلى الله وحطّم أصنامهم، فغضبوا منه وقرروا إحراقه. بنوا له ناراً عظيمة وألقوه فيها، لكن الله أمر النار أن تكون برداً وسلاماً على إبراهيم.

ابتلى الله إبراهيم بأن أمره بذبح ابنه إسماعيل، فاستجاب إبراهيم وهمّ بتنفيذ الأمر، ففداه الله بذبح عظيم.

بنى إبراهيم وإسماعيل الكعبة، ودعا الله أن يجعل مكة بلداً آمناً وأن يبعث فيهم رسولاً منهم.`,
        lessons: [
          'البحث عن الحقيقة فريضة على كل عاقل',
          'التضحية في سبيل الله أعظم القربات',
          'الله ينجي عباده المخلصين من كل كرب',
          'الاستجابة لأوامر الله دون تردد',
          'بناء بيوت الله من أعظم الأعمال',
          'الدعاء للذرية من سنن الأنبياء',
        ],
        quranVerses: [
          {
            arabic: 'قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ',
            translation: 'We said: O fire, be coolness and safety upon Abraham.',
            reference: 'سورة الأنبياء - الآية 69'
          },
          {
            arabic: 'وَاتَّخَذَ اللَّهُ إِبْرَاهِيمَ خَلِيلًا',
            translation: 'And Allah took Abraham as a close friend.',
            reference: 'سورة النساء - الآية 125'
          },
          {
            arabic: 'فَلَمَّا أَسْلَمَا وَتَلَّهُ لِلْجَبِينِ وَنَادَيْنَاهُ أَن يَا إِبْرَاهِيمُ قَدْ صَدَّقْتَ الرُّؤْيَا',
            translation: 'And when they had both submitted and he put him down upon his forehead, We called to him: O Abraham, you have fulfilled the vision.',
            reference: 'سورة الصافات - الآيات 103-105'
          },
        ],
        hadiths: [
          {
            text: 'إن أول ما يكسى يوم القيامة إبراهيم عليه السلام',
            source: 'رواه البخاري'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Abraham - The Friend of Allah',
        content: `Prophet Abraham (peace be upon him) is the father of prophets and the close friend of Allah. He grew up in an environment where idols were worshipped, and his father Azar made them.

Abraham contemplated the universe and searched for truth. He saw a star and said: "This is my Lord." When it set, he said: "I do not like those that set." Then he saw the moon and said: "This is my Lord." When it set, he said: "If my Lord does not guide me, I will surely be among the misguided." Then he saw the sun and said: "This is my Lord, this is greater." When it set, he said: "I am free from what you associate with Allah."

Abraham called his people to Allah and destroyed their idols. They became angry and decided to burn him. They built a great fire and threw him in, but Allah commanded the fire to be cool and peaceful upon Abraham.

Allah tested Abraham by commanding him to sacrifice his son Ishmael. Abraham submitted and was about to carry out the command when Allah ransomed him with a great sacrifice.

Abraham and Ishmael built the Kaaba, and Abraham prayed for Mecca to be a secure city and for a messenger to be raised among them.`,
        lessons: [
          'Searching for truth is obligatory for every rational person',
          'Sacrifice for Allah is the greatest act of worship',
          'Allah saves His sincere servants from every hardship',
          'Responding to Allah\'s commands without hesitation',
          'Building houses of worship is among the greatest deeds',
          'Praying for offspring is a practice of the prophets',
        ],
        quranVerses: [
          {
            arabic: 'قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ',
            translation: 'We said: O fire, be coolness and safety upon Abraham.',
            reference: 'Surah Al-Anbiya - Verse 69'
          },
        ],
      },
    },
  },

  // 7. لوط عليه السلام
  {
    id: 'lut',
    name: { ar: 'لوط', en: 'Lot', fr: 'Loth', ur: 'لوط', id: 'Luth', tr: 'Lut' },
    era: 'قوم سدوم',
    order: 7,
    stories: {
      ar: {
        title: 'قصة لوط عليه السلام - نبي سدوم',
        content: `لوط عليه السلام هو ابن أخي إبراهيم عليه السلام. آمن بإبراهيم وهاجر معه، ثم أرسله الله إلى أهل سدوم.

كان قوم لوط يرتكبون فاحشة لم يسبقهم بها أحد من العالمين، فكانوا يأتون الرجال شهوة من دون النساء.

دعاهم لوط إلى ترك هذه الفاحشة والتوبة إلى الله، لكنهم رفضوا وهددوه بالطرد. كانوا يقولون: "أخرجوا آل لوط من قريتكم إنهم أناس يتطهرون".

أرسل الله الملائكة إلى لوط على هيئة ضيوف شباب حسان الوجوه. لما علم قوم لوط بذلك جاءوا يريدون الاعتداء عليهم.

أخبر الملائكة لوطاً أنهم رسل ربه، وأمروه أن يخرج بأهله ليلاً ولا يلتفت منهم أحد إلا امرأته التي كانت تعين القوم عليه.

أمطر الله على سدوم حجارة من سجيل، وقلب القرية عاليها سافلها، فهلكوا جميعاً.`,
        lessons: [
          'الفواحش تجلب غضب الله وعقابه',
          'الشذوذ الجنسي من أعظم المنكرات',
          'الله يعاقب المجتمعات التي تنتشر فيها الفاحشة',
          'النجاة مع الصالحين والهلاك مع الظالمين',
          'الدعوة واجبة حتى لو استهزأ القوم',
        ],
        quranVerses: [
          {
            arabic: 'وَلُوطًا إِذْ قَالَ لِقَوْمِهِ أَتَأْتُونَ الْفَاحِشَةَ مَا سَبَقَكُم بِهَا مِنْ أَحَدٍ مِّنَ الْعَالَمِينَ',
            translation: 'And Lot, when he said to his people: Do you commit such immorality as no one has preceded you with from among the worlds?',
            reference: 'سورة الأعراف - الآية 80'
          },
          {
            arabic: 'فَلَمَّا جَاءَ أَمْرُنَا جَعَلْنَا عَالِيَهَا سَافِلَهَا وَأَمْطَرْنَا عَلَيْهَا حِجَارَةً مِّن سِجِّيلٍ مَّنضُودٍ',
            translation: 'So when Our command came, We made the highest part of it the lowest and rained upon it stones of layered hard clay.',
            reference: 'سورة هود - الآية 82'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Lot - Prophet to Sodom',
        content: `Prophet Lot (peace be upon him) was the nephew of Prophet Abraham. He believed in Abraham and migrated with him, then Allah sent him to the people of Sodom.

The people of Lot committed an immorality no one had preceded them with in the world - they approached men with desire instead of women.

Lot called them to abandon this immorality and repent to Allah, but they refused and threatened to expel him. They said: "Expel the family of Lot from your city. Indeed, they are people who keep themselves pure."

Allah sent angels to Lot in the form of handsome young guests. When Lot's people learned of them, they came wanting to assault them.

The angels informed Lot that they were messengers from his Lord and commanded him to leave with his family at night, with none looking back, except his wife who had been aiding the people against him.

Allah rained upon Sodom stones of hard clay and turned the city upside down, destroying them all.`,
        lessons: [
          'Immorality brings Allah\'s wrath and punishment',
          'Homosexuality is among the greatest sins',
          'Allah punishes societies where immorality spreads',
          'Salvation is with the righteous, destruction with the oppressors',
          'Calling to Allah is obligatory even when people mock',
        ],
        quranVerses: [
          {
            arabic: 'وَلُوطًا إِذْ قَالَ لِقَوْمِهِ أَتَأْتُونَ الْفَاحِشَةَ',
            translation: 'And Lot, when he said to his people: Do you commit such immorality?',
            reference: 'Surah Al-A\'raf - Verse 80'
          },
        ],
      },
    },
  },

  // 8. إسماعيل عليه السلام
  {
    id: 'ismail',
    name: { ar: 'إسماعيل', en: 'Ishmael', fr: 'Ismaël', ur: 'اسماعیل', id: 'Ismail', tr: 'İsmail' },
    era: 'مكة المكرمة',
    order: 8,
    stories: {
      ar: {
        title: 'قصة إسماعيل عليه السلام - الذبيح',
        content: `إسماعيل عليه السلام هو ابن إبراهيم الخليل من هاجر. ولد بعد أن دعا إبراهيم ربه أن يهب له من الصالحين.

أمر الله إبراهيم أن يأخذ هاجر وإسماعيل الرضيع إلى وادٍ غير ذي زرع عند البيت الحرام. تركهما هناك بأمر الله ورجع.

نفد الماء والطعام، وجعلت هاجر تسعى بين الصفا والمروة بحثاً عن الماء. سعت سبع مرات، ثم فجّر الله ماء زمزم تحت قدمي إسماعيل.

لما كبر إسماعيل، رأى إبراهيم في المنام أنه يذبحه. أخبر إسماعيل فقال: "يا أبت افعل ما تؤمر ستجدني إن شاء الله من الصابرين". فلما استسلما لأمر الله، فداه الله بكبش عظيم.

بنى إسماعيل مع أبيه إبراهيم الكعبة المشرفة، وكان صادق الوعد، وكان يأمر أهله بالصلاة والزكاة.`,
        lessons: [
          'الصبر على البلاء من صفات المؤمنين',
          'طاعة الوالدين في طاعة الله',
          'التوكل على الله في أشد الظروف',
          'الوفاء بالوعد من أخلاق الأنبياء',
          'بناء بيوت الله شرف عظيم',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ ۖ سَتَجِدُنِي إِن شَاءَ اللَّهُ مِنَ الصَّابِرِينَ',
            translation: 'He said: O my father, do as you are commanded. You will find me, if Allah wills, of the patient.',
            reference: 'سورة الصافات - الآية 102'
          },
          {
            arabic: 'وَاذْكُرْ فِي الْكِتَابِ إِسْمَاعِيلَ ۚ إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا',
            translation: 'And mention in the Book, Ishmael. Indeed, he was true to his promise and was a messenger and a prophet.',
            reference: 'سورة مريم - الآية 54'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Ishmael - The Sacrifice',
        content: `Prophet Ishmael (peace be upon him) was the son of Abraham from Hagar. He was born after Abraham prayed to his Lord to grant him righteous offspring.

Allah commanded Abraham to take Hagar and infant Ishmael to a barren valley near the Sacred House. He left them there by Allah's command and returned.

Water and food ran out, and Hagar began running between Safa and Marwa searching for water. She ran seven times, then Allah caused the water of Zamzam to spring forth beneath Ishmael's feet.

When Ishmael grew up, Abraham saw in a dream that he was sacrificing him. He told Ishmael, who said: "O my father, do as you are commanded. You will find me, if Allah wills, of the patient." When they both submitted to Allah's command, Allah ransomed him with a great ram.

Ishmael built the Kaaba with his father Abraham. He was true to his promise and used to enjoin upon his family prayer and charity.`,
        lessons: [
          'Patience in trials is a trait of believers',
          'Obeying parents in obedience to Allah',
          'Trusting in Allah in the most difficult circumstances',
          'Keeping promises is a prophetic character',
          'Building houses of worship is a great honor',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ يَا أَبَتِ افْعَلْ مَا تُؤْمَرُ',
            translation: 'He said: O my father, do as you are commanded.',
            reference: 'Surah As-Saffat - Verse 102'
          },
        ],
      },
    },
  },

  // 9. إسحاق عليه السلام
  {
    id: 'ishaq',
    name: { ar: 'إسحاق', en: 'Isaac', fr: 'Isaac', ur: 'اسحاق', id: 'Ishaq', tr: 'İshak' },
    era: 'أرض كنعان',
    order: 9,
    stories: {
      ar: {
        title: 'قصة إسحاق عليه السلام',
        content: `إسحاق عليه السلام هو ابن إبراهيم من سارة. بشّر الله سارة به وهي عجوز عقيم، فتعجبت من ذلك، لكن الله على كل شيء قدير.

ولد إسحاق وكان من الصالحين المباركين. ورث النبوة عن أبيه إبراهيم، وكان من الأنبياء الذين اختارهم الله وهداهم.

أنجب إسحاق يعقوب والعيص، وكان يعقوب نبياً من بعده. ومن نسل إسحاق جاء كثير من أنبياء بني إسرائيل.

كان إسحاق من الصابرين الشاكرين، عاش حياته في طاعة الله ودعوة الناس إلى عبادته.

ذكره الله في القرآن مع أبيه إبراهيم وابنه يعقوب كأمثلة على الأنبياء الصالحين الذين اصطفاهم الله.`,
        lessons: [
          'قدرة الله لا حدود لها',
          'البشارة بالخير من نعم الله',
          'النبوة نعمة يختص الله بها من يشاء',
          'الشكر على النعم واجب',
          'الصبر والطاعة من صفات الأنبياء',
        ],
        quranVerses: [
          {
            arabic: 'وَبَشَّرْنَاهُ بِإِسْحَاقَ نَبِيًّا مِّنَ الصَّالِحِينَ',
            translation: 'And We gave him good tidings of Isaac, a prophet from among the righteous.',
            reference: 'سورة الصافات - الآية 112'
          },
          {
            arabic: 'فَبَشَّرْنَاهَا بِإِسْحَاقَ وَمِن وَرَاءِ إِسْحَاقَ يَعْقُوبَ',
            translation: 'So We gave her good tidings of Isaac, and after Isaac, Jacob.',
            reference: 'سورة هود - الآية 71'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Isaac',
        content: `Prophet Isaac (peace be upon him) was the son of Abraham from Sarah. Allah gave Sarah glad tidings of him when she was an elderly barren woman. She was amazed by this, but Allah has power over all things.

Isaac was born and was among the righteous and blessed. He inherited prophethood from his father Abraham and was among the prophets chosen and guided by Allah.

Isaac had Jacob and Esau, and Jacob was a prophet after him. From Isaac's lineage came many prophets of the Children of Israel.

Isaac was among the patient and grateful, living his life in obedience to Allah and calling people to worship Him.

Allah mentioned him in the Quran alongside his father Abraham and his son Jacob as examples of righteous prophets whom Allah chose.`,
        lessons: [
          'Allah\'s power has no limits',
          'Good tidings are among Allah\'s blessings',
          'Prophethood is a blessing Allah bestows on whom He wills',
          'Gratitude for blessings is obligatory',
          'Patience and obedience are prophetic traits',
        ],
        quranVerses: [
          {
            arabic: 'وَبَشَّرْنَاهُ بِإِسْحَاقَ نَبِيًّا مِّنَ الصَّالِحِينَ',
            translation: 'And We gave him good tidings of Isaac, a prophet from among the righteous.',
            reference: 'Surah As-Saffat - Verse 112'
          },
        ],
      },
    },
  },

  // 10. يعقوب عليه السلام
  {
    id: 'yaqub',
    name: { ar: 'يعقوب', en: 'Jacob', fr: 'Jacob', ur: 'یعقوب', id: 'Ya\'qub', tr: 'Yakub' },
    era: 'أرض كنعان',
    order: 10,
    stories: {
      ar: {
        title: 'قصة يعقوب عليه السلام - إسرائيل',
        content: `يعقوب عليه السلام هو ابن إسحاق وحفيد إبراهيم. سماه الله إسرائيل، ومنه انحدر بنو إسرائيل.

رزقه الله اثني عشر ولداً، أشهرهم يوسف وبنيامين. كان يعقوب يحب يوسف حباً شديداً لما رأى فيه من علامات النبوة.

حسد إخوة يوسف أخاهم، فألقوه في غيابة الجب وأخبروا أباهم أن الذئب أكله. حزن يعقوب حزناً شديداً حتى ابيضت عيناه من الحزن وفقد بصره.

لكن يعقوب لم ييأس من رحمة الله، وظل يقول: "إنما أشكو بثي وحزني إلى الله". وكان يوصي أبناءه بالصبر والتقوى.

لما التقى بيوسف في مصر بعد سنين طويلة، ردّ الله إليه بصره، وعاش بقية حياته مع أبنائه في سعادة.`,
        lessons: [
          'الصبر الجميل هو الصبر دون شكوى للناس',
          'لا ييأس من رحمة الله إلا القوم الكافرون',
          'الحسد يفرق بين الإخوة',
          'الشكوى لله وحده لا للناس',
          'العاقبة للمتقين مهما طال الزمن',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ',
            translation: 'He said: I only complain of my suffering and my grief to Allah.',
            reference: 'سورة يوسف - الآية 86'
          },
          {
            arabic: 'وَتَوَلَّىٰ عَنْهُمْ وَقَالَ يَا أَسَفَىٰ عَلَىٰ يُوسُفَ وَابْيَضَّتْ عَيْنَاهُ مِنَ الْحُزْنِ',
            translation: 'And he turned away from them and said: Oh, my sorrow over Joseph, and his eyes became white from grief.',
            reference: 'سورة يوسف - الآية 84'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Jacob - Israel',
        content: `Prophet Jacob (peace be upon him) was the son of Isaac and grandson of Abraham. Allah named him Israel, and from him descended the Children of Israel.

Allah blessed him with twelve sons, the most famous being Joseph and Benjamin. Jacob loved Joseph deeply for the signs of prophethood he saw in him.

Joseph's brothers envied him and threw him into a well, telling their father that a wolf had eaten him. Jacob grieved so deeply that his eyes turned white from sorrow and he lost his sight.

But Jacob never despaired of Allah's mercy, always saying: "I only complain of my suffering and grief to Allah." He used to advise his sons of patience and piety.

When he reunited with Joseph in Egypt after many years, Allah restored his sight, and he lived the rest of his life happily with his sons.`,
        lessons: [
          'Beautiful patience is patience without complaining to people',
          'Only the disbelieving people despair of Allah\'s mercy',
          'Envy divides siblings',
          'Complain to Allah alone, not to people',
          'The good outcome is for the righteous, no matter how long it takes',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ',
            translation: 'He said: I only complain of my suffering and my grief to Allah.',
            reference: 'Surah Yusuf - Verse 86'
          },
        ],
      },
    },
  },

  // 11. يوسف عليه السلام
  {
    id: 'yusuf',
    name: { ar: 'يوسف', en: 'Joseph', fr: 'Joseph', ur: 'یوسف', id: 'Yusuf', tr: 'Yusuf' },
    era: 'مصر القديمة',
    order: 11,
    stories: {
      ar: {
        title: 'قصة يوسف عليه السلام - أحسن القصص',
        content: `يوسف عليه السلام هو ابن يعقوب بن إسحاق بن إبراهيم. رأى في منامه أحد عشر كوكباً والشمس والقمر يسجدون له، فأخبر أباه الذي حذره من إخبار إخوته.

حسد إخوة يوسف أخاهم لمحبة أبيهم له، فتآمروا عليه وألقوه في غيابة الجب. التقطته قافلة وباعوه في مصر.

اشتراه عزيز مصر، وراودته امرأة العزيز عن نفسه فاستعصم. لما أبى، كادت له ودخل السجن ظلماً.

في السجن فسّر رؤى المسجونين، ثم فسّر رؤيا الملك عن السبع البقرات السمان والسبع العجاف، فأعجب به الملك وجعله على خزائن مصر.

جاء إخوته يطلبون الطعام في سنوات القحط، فعرفهم ولم يعرفوه. ثم كشف لهم عن نفسه وعفا عنهم، وجاء أبوه وخرّوا له سجداً، فتحققت رؤياه.`,
        lessons: [
          'الصبر على البلاء مفتاح الفرج',
          'العفة والطهارة من أعظم الأخلاق',
          'الله ينصر عباده الصابرين',
          'العفو عند المقدرة من شيم الكرام',
          'تفسير الأحلام علم من الله',
          'الحسد سبب للفتن بين الأهل',
        ],
        quranVerses: [
          {
            arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
            translation: 'We relate to you the best of stories.',
            reference: 'سورة يوسف - الآية 3'
          },
          {
            arabic: 'قَالَ مَعَاذَ اللَّهِ ۖ إِنَّهُ رَبِّي أَحْسَنَ مَثْوَايَ',
            translation: 'He said: I seek refuge in Allah. Indeed, he is my master who has made good my residence.',
            reference: 'سورة يوسف - الآية 23'
          },
          {
            arabic: 'قَالَ لَا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ ۖ يَغْفِرُ اللَّهُ لَكُمْ',
            translation: 'He said: No blame will there be upon you today. Allah will forgive you.',
            reference: 'سورة يوسف - الآية 92'
          },
        ],
        hadiths: [
          {
            text: 'الكريم ابن الكريم ابن الكريم ابن الكريم يوسف بن يعقوب بن إسحاق بن إبراهيم',
            source: 'رواه البخاري'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Joseph - The Best of Stories',
        content: `Prophet Joseph (peace be upon him) was the son of Jacob son of Isaac son of Abraham. He saw in his dream eleven stars and the sun and moon prostrating to him. He told his father, who warned him not to tell his brothers.

Joseph's brothers envied him for their father's love, so they conspired against him and threw him into a well. A caravan found him and sold him in Egypt.

The Aziz of Egypt bought him, and the Aziz's wife tried to seduce him but he remained chaste. When he refused, she plotted against him and he was unjustly imprisoned.

In prison, he interpreted dreams for fellow prisoners, then interpreted the king's dream about seven fat cows and seven lean ones. The king was impressed and made him treasurer of Egypt.

His brothers came seeking food during years of famine. He recognized them but they did not recognize him. He revealed himself and forgave them. His father came and they fell prostrate to him, fulfilling his dream.`,
        lessons: [
          'Patience in trials is the key to relief',
          'Chastity and purity are the greatest virtues',
          'Allah supports His patient servants',
          'Forgiveness when able is noble',
          'Dream interpretation is knowledge from Allah',
          'Envy causes strife among family',
        ],
        quranVerses: [
          {
            arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
            translation: 'We relate to you the best of stories.',
            reference: 'Surah Yusuf - Verse 3'
          },
        ],
      },
    },
  },

  // 12. شعيب عليه السلام
  {
    id: 'shuayb',
    name: { ar: 'شعيب', en: 'Shuayb', fr: 'Chouaïb', ur: 'شعیب', id: 'Syu\'aib', tr: 'Şuayb' },
    era: 'أهل مدين',
    order: 12,
    stories: {
      ar: {
        title: 'قصة شعيب عليه السلام - خطيب الأنبياء',
        content: `شعيب عليه السلام أرسله الله إلى أهل مدين وأصحاب الأيكة. كانوا يعبدون الأصنام ويطففون الميزان ويبخسون الناس أشياءهم.

دعاهم شعيب إلى عبادة الله وحده وإلى العدل في المعاملات. قال لهم: "أوفوا الكيل والميزان بالقسط ولا تبخسوا الناس أشياءهم".

كان شعيب فصيح اللسان بليغ الحجة، لذلك لُقب بخطيب الأنبياء. استخدم الحكمة والموعظة الحسنة في دعوته.

رفض قومه دعوته وهددوه بالرجم والإخراج من قريتهم. استمروا في طغيانهم وتطفيفهم.

فأخذتهم الرجفة فأصبحوا في ديارهم جاثمين. ونجى الله شعيباً ومن آمن معه.`,
        lessons: [
          'الأمانة في المعاملات التجارية واجبة',
          'التطفيف في الكيل والميزان من كبائر الذنوب',
          'الفصاحة والبلاغة من أدوات الدعوة',
          'العدل أساس الحضارات',
          'الظلم في المعاملات سبب هلاك الأمم',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا ۗ قَالَ يَا قَوْمِ اعْبُدُوا اللَّهَ مَا لَكُم مِّنْ إِلَٰهٍ غَيْرُهُ',
            translation: 'And to Madyan We sent their brother Shuayb. He said: O my people, worship Allah; you have no deity other than Him.',
            reference: 'سورة الأعراف - الآية 85'
          },
          {
            arabic: 'وَيَا قَوْمِ أَوْفُوا الْمِكْيَالَ وَالْمِيزَانَ بِالْقِسْطِ',
            translation: 'And O my people, give full measure and weight in justice.',
            reference: 'سورة هود - الآية 85'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Shuayb - The Orator of Prophets',
        content: `Prophet Shuayb (peace be upon him) was sent by Allah to the people of Madyan and the companions of the thicket. They worshipped idols, cheated in measure, and wronged people in their dealings.

Shuayb called them to worship Allah alone and to be just in their dealings. He said: "Give full measure and weight in justice and do not deprive people of their due."

Shuayb was eloquent and persuasive, which earned him the title "Orator of the Prophets." He used wisdom and good preaching in his call.

His people rejected his call and threatened to stone and expel him from their town. They continued in their transgression and cheating.

Then the earthquake seized them, and they became lifeless in their homes. Allah saved Shuayb and those who believed with him.`,
        lessons: [
          'Honesty in business dealings is obligatory',
          'Cheating in measure and weight is among major sins',
          'Eloquence and persuasion are tools of calling to Allah',
          'Justice is the foundation of civilizations',
          'Oppression in dealings causes nations to perish',
        ],
        quranVerses: [
          {
            arabic: 'وَإِلَىٰ مَدْيَنَ أَخَاهُمْ شُعَيْبًا',
            translation: 'And to Madyan We sent their brother Shuayb.',
            reference: 'Surah Al-A\'raf - Verse 85'
          },
        ],
      },
    },
  },

  // 13. أيوب عليه السلام
  {
    id: 'ayyub',
    name: { ar: 'أيوب', en: 'Job', fr: 'Job', ur: 'ایوب', id: 'Ayyub', tr: 'Eyyüp' },
    era: 'الصبر والابتلاء',
    order: 13,
    stories: {
      ar: {
        title: 'قصة أيوب عليه السلام - الصبر على البلاء',
        content: `أيوب عليه السلام كان نبياً صالحاً أنعم الله عليه بالمال والأولاد والصحة. كان شاكراً لنعم الله، ذاكراً له في السراء والضراء.

ابتلاه الله بفقد ماله وأولاده، ثم ابتلاه بمرض شديد أصاب جسده كله. تفرق عنه الناس ولم يبق معه إلا زوجته الصالحة.

صبر أيوب صبراً عظيماً، لم يشك ولم يتذمر. استمر في حمد الله وشكره رغم كل ما أصابه. مكث في بلائه ثمانية عشر عاماً أو أكثر.

لما دعا ربه قائلاً: "أني مسني الضر وأنت أرحم الراحمين"، استجاب الله له. أمره أن يركض برجله فنبع له ماء بارد شفاه من مرضه.

رد الله عليه أهله ومثلهم معهم، وأعاد إليه صحته وماله، جزاءً على صبره.`,
        lessons: [
          'الصبر على البلاء من أعظم العبادات',
          'البلاء اختبار وتمحيص للمؤمنين',
          'الله يبتلي من يحب',
          'الشكوى لله وحده في الشدائد',
          'جزاء الصابرين عظيم في الدنيا والآخرة',
          'الدعاء في وقت الضيق مستجاب',
        ],
        quranVerses: [
          {
            arabic: 'وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
            translation: 'And Job, when he called to his Lord: Indeed, adversity has touched me, and You are the Most Merciful of the merciful.',
            reference: 'سورة الأنبياء - الآية 83'
          },
          {
            arabic: 'فَاسْتَجَبْنَا لَهُ فَكَشَفْنَا مَا بِهِ مِن ضُرٍّ',
            translation: 'So We responded to him and removed what afflicted him of adversity.',
            reference: 'سورة الأنبياء - الآية 84'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Job - Patience in Adversity',
        content: `Prophet Job (peace be upon him) was a righteous prophet whom Allah blessed with wealth, children, and health. He was grateful for Allah's blessings, remembering Him in ease and hardship.

Allah tested him with the loss of his wealth and children, then with a severe illness that afflicted his entire body. People abandoned him, and only his righteous wife remained.

Job was immensely patient, never complaining or grumbling. He continued praising and thanking Allah despite all that befell him. He remained in his trial for eighteen years or more.

When he called upon his Lord saying: "Indeed, adversity has touched me, and You are the Most Merciful of the merciful," Allah responded. He commanded him to strike the ground with his foot, and cool water sprang forth that healed him.

Allah restored his family and as many again with them, and returned his health and wealth as a reward for his patience.`,
        lessons: [
          'Patience in adversity is among the greatest acts of worship',
          'Trials test and purify believers',
          'Allah tests those He loves',
          'Complain to Allah alone in hardship',
          'The reward for the patient is great in this world and the hereafter',
          'Supplication in times of distress is answered',
        ],
        quranVerses: [
          {
            arabic: 'وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ',
            translation: 'And Job, when he called to his Lord: Indeed, adversity has touched me.',
            reference: 'Surah Al-Anbiya - Verse 83'
          },
        ],
      },
    },
  },

  // 14. ذو الكفل عليه السلام
  {
    id: 'dhul-kifl',
    name: { ar: 'ذو الكفل', en: 'Dhul-Kifl', fr: 'Dhul-Kifl', ur: 'ذوالکفل', id: 'Dzulkifli', tr: 'Zülkifl' },
    era: 'بعد أيوب',
    order: 14,
    stories: {
      ar: {
        title: 'قصة ذي الكفل عليه السلام',
        content: `ذو الكفل عليه السلام هو نبي من أنبياء الله، ذكره الله في القرآن مع الأنبياء الصابرين.

قيل إنه سمي بذي الكفل لأنه تكفل لنبي قبله أن يصوم النهار ويقوم الليل ولا يغضب، ففعل ووفى بما تكفل به.

كان من الصابرين الأخيار الذين اختارهم الله واجتباهم. عُرف بالوفاء بالعهود والالتزام بما يتعهد به.

أثنى الله عليه في القرآن ووصفه بالصبر، وأدخله في زمرة الأخيار من عباده.

قيل إنه من نسل أيوب عليه السلام، وقيل إنه إلياس، ولكن الراجح أنه نبي مستقل.`,
        lessons: [
          'الوفاء بالعهود من أخلاق الأنبياء',
          'الصبر طريق إلى رضا الله',
          'ضبط النفس عن الغضب من الفضائل',
          'قيام الليل من أفضل العبادات',
          'الالتزام بالوعود يرفع الإنسان عند الله',
        ],
        quranVerses: [
          {
            arabic: 'وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ',
            translation: 'And Ishmael and Idris and Dhul-Kifl; all were of the patient.',
            reference: 'سورة الأنبياء - الآية 85'
          },
          {
            arabic: 'وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ',
            translation: 'And remember Ishmael, Elisha, and Dhul-Kifl; and all are among the outstanding.',
            reference: 'سورة ص - الآية 48'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Dhul-Kifl',
        content: `Prophet Dhul-Kifl (peace be upon him) is a prophet of Allah, mentioned in the Quran among the patient prophets.

It is said he was named Dhul-Kifl because he guaranteed a prophet before him that he would fast during the day, pray at night, and not become angry, and he fulfilled what he guaranteed.

He was among the patient and righteous whom Allah chose and selected. He was known for keeping promises and fulfilling commitments.

Allah praised him in the Quran and described him with patience, placing him among the outstanding of His servants.

It is said he was from the lineage of Job, and some say he was Elijah, but the preferred view is that he was an independent prophet.`,
        lessons: [
          'Keeping promises is a prophetic character',
          'Patience is a path to Allah\'s pleasure',
          'Controlling anger is a virtue',
          'Night prayer is among the best acts of worship',
          'Fulfilling commitments elevates one with Allah',
        ],
        quranVerses: [
          {
            arabic: 'وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ ۖ كُلٌّ مِّنَ الصَّابِرِينَ',
            translation: 'And Ishmael and Idris and Dhul-Kifl; all were of the patient.',
            reference: 'Surah Al-Anbiya - Verse 85'
          },
        ],
      },
    },
  },

  // 15. موسى عليه السلام
  {
    id: 'musa',
    name: { ar: 'موسى', en: 'Moses', fr: 'Moïse', ur: 'موسیٰ', id: 'Musa', tr: 'Musa' },
    era: 'مصر الفرعونية',
    order: 15,
    stories: {
      ar: {
        title: 'قصة موسى عليه السلام - كليم الله',
        content: `موسى عليه السلام هو كليم الله، من أولي العزم من الرسل. ولد في زمن فرعون الذي كان يقتل أبناء بني إسرائيل.

ألهمت أم موسى أن تضعه في تابوت وتلقيه في اليم. التقطه آل فرعون فربّته امرأة فرعون آسية، ورفض أن يرضع من أي مرضعة إلا أمه.

لما كبر موسى، وكز رجلاً من قوم فرعون فقتله خطأً، ففر إلى مدين. هناك تزوج ابنة شعيب وعمل عنده سنين.

في طريق عودته إلى مصر، ناداه الله من شاطئ الوادي المقدس طوى. كلّمه الله وأعطاه المعجزات: العصا التي تتحول إلى ثعبان، واليد التي تخرج بيضاء.

أرسله الله إلى فرعون ليطلب منه أن يرسل معه بني إسرائيل. كذّب فرعون وتحدّى موسى، فأراه الآيات الكبرى لكنه استكبر.

خرج موسى ببني إسرائيل من مصر، وتبعهم فرعون بجنوده. شق الله البحر لموسى وأغرق فرعون وجنوده.

أنزل الله على موسى التوراة، وكلّمه على جبل الطور.`,
        lessons: [
          'الله يحفظ أولياءه مهما كادهم الأعداء',
          'التوكل على الله في أحلك الظروف',
          'عاقبة الظالمين الهلاك مهما عظموا',
          'الثبات على الحق أمام الطغاة',
          'معجزات الله تؤيد أنبياءه',
          'الله يكلم من يشاء من عباده',
        ],
        quranVerses: [
          {
            arabic: 'وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا',
            translation: 'And Allah spoke to Moses with direct speech.',
            reference: 'سورة النساء - الآية 164'
          },
          {
            arabic: 'فَأَوْحَيْنَا إِلَىٰ مُوسَىٰ أَنِ اضْرِب بِّعَصَاكَ الْبَحْرَ ۖ فَانفَلَقَ',
            translation: 'So We inspired to Moses: Strike the sea with your staff, and it parted.',
            reference: 'سورة الشعراء - الآية 63'
          },
        ],
        hadiths: [
          {
            text: 'لا تفضلوني على موسى',
            source: 'رواه البخاري ومسلم'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Moses - The One Who Spoke with Allah',
        content: `Prophet Moses (peace be upon him) is the one who spoke directly with Allah, one of the Prophets of Strong Will. He was born when Pharaoh was killing the sons of the Children of Israel.

Moses's mother was inspired to place him in a basket and cast it into the river. Pharaoh's household picked him up, and Pharaoh's wife Asiyah raised him. He refused to nurse from anyone except his own mother.

When Moses grew up, he struck a man from Pharaoh's people and accidentally killed him, so he fled to Madyan. There he married Shuayb's daughter and worked for him for years.

On his way back to Egypt, Allah called to him from the side of the holy valley of Tuwa. Allah spoke to him and gave him miracles: the staff that transforms into a serpent, and the hand that emerges white.

Allah sent him to Pharaoh to request that he let the Children of Israel go. Pharaoh denied and challenged Moses, so he showed him the great signs, but Pharaoh was arrogant.

Moses led the Children of Israel out of Egypt, and Pharaoh followed with his soldiers. Allah parted the sea for Moses and drowned Pharaoh and his soldiers.

Allah revealed the Torah to Moses and spoke to him on Mount Tur.`,
        lessons: [
          'Allah protects His allies no matter how enemies plot',
          'Trust in Allah in the darkest circumstances',
          'Oppressors face destruction no matter how mighty',
          'Standing firm for truth before tyrants',
          'Allah\'s miracles support His prophets',
          'Allah speaks to whom He wills of His servants',
        ],
        quranVerses: [
          {
            arabic: 'وَكَلَّمَ اللَّهُ مُوسَىٰ تَكْلِيمًا',
            translation: 'And Allah spoke to Moses with direct speech.',
            reference: 'Surah An-Nisa - Verse 164'
          },
        ],
      },
    },
  },

  // 16. هارون عليه السلام
  {
    id: 'harun',
    name: { ar: 'هارون', en: 'Aaron', fr: 'Aaron', ur: 'ہارون', id: 'Harun', tr: 'Harun' },
    era: 'مع موسى',
    order: 16,
    stories: {
      ar: {
        title: 'قصة هارون عليه السلام - وزير موسى',
        content: `هارون عليه السلام هو أخو موسى الأكبر، اختاره الله نبياً ووزيراً لموسى. كان أفصح لساناً من موسى.

لما أُرسل موسى إلى فرعون، دعا ربه أن يجعل له وزيراً من أهله هو هارون. استجاب الله دعاءه وأيده بأخيه.

كان هارون مع موسى في مواجهة فرعون وسحرته. وقف معه صامداً أمام كل التحديات.

لما ذهب موسى لميقات ربه أربعين ليلة، استخلف هارون على بني إسرائيل. لكن السامري أضلّهم وصنع لهم العجل.

حاول هارون منعهم لكنهم لم يستمعوا إليه. لما رجع موسى وعاتبه، قال هارون: "يا ابن أم لا تأخذ بلحيتي ولا برأسي إني خشيت أن تقول فرقت بين بني إسرائيل".

توفي هارون قبل موسى، وكان من المحسنين الذين أحسن الله إليهم.`,
        lessons: [
          'التعاون على البر والتقوى مطلوب',
          'الفصاحة والبيان من أدوات الدعوة',
          'القيادة الحكيمة تحافظ على وحدة الأمة',
          'المسؤولية الثقيلة تحتاج إلى معاونين',
          'الرفق بالناس من صفات الأنبياء',
        ],
        quranVerses: [
          {
            arabic: 'وَأَخِي هَارُونُ هُوَ أَفْصَحُ مِنِّي لِسَانًا فَأَرْسِلْهُ مَعِيَ رِدْءًا',
            translation: 'And my brother Aaron is more fluent than me in tongue, so send him with me as support.',
            reference: 'سورة القصص - الآية 34'
          },
          {
            arabic: 'وَلَقَدْ آتَيْنَا مُوسَى وَهَارُونَ الْفُرْقَانَ',
            translation: 'And We had already given Moses and Aaron the criterion.',
            reference: 'سورة الأنبياء - الآية 48'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Aaron - Moses\'s Minister',
        content: `Prophet Aaron (peace be upon him) was Moses's elder brother, chosen by Allah as a prophet and minister to Moses. He was more eloquent in speech than Moses.

When Moses was sent to Pharaoh, he prayed to his Lord to appoint him a minister from his family - Aaron. Allah answered his prayer and supported him with his brother.

Aaron was with Moses in confronting Pharaoh and his sorcerers. He stood firm with him through all challenges.

When Moses went to meet his Lord for forty nights, he left Aaron in charge of the Children of Israel. But the Samaritan led them astray and made them a calf.

Aaron tried to stop them but they did not listen. When Moses returned and blamed him, Aaron said: "O son of my mother, do not seize me by my beard or head. I feared that you would say I caused division among the Children of Israel."

Aaron died before Moses and was among the righteous whom Allah favored.`,
        lessons: [
          'Cooperation in righteousness and piety is required',
          'Eloquence and clarity are tools of calling to Allah',
          'Wise leadership preserves unity of the nation',
          'Heavy responsibility needs helpers',
          'Gentleness with people is a prophetic trait',
        ],
        quranVerses: [
          {
            arabic: 'وَأَخِي هَارُونُ هُوَ أَفْصَحُ مِنِّي لِسَانًا',
            translation: 'And my brother Aaron is more fluent than me in tongue.',
            reference: 'Surah Al-Qasas - Verse 34'
          },
        ],
      },
    },
  },

  // 17. داود عليه السلام
  {
    id: 'dawud',
    name: { ar: 'داود', en: 'David', fr: 'David', ur: 'داؤد', id: 'Daud', tr: 'Davud' },
    era: 'مملكة إسرائيل',
    order: 17,
    stories: {
      ar: {
        title: 'قصة داود عليه السلام - الملك النبي',
        content: `داود عليه السلام كان نبياً وملكاً على بني إسرائيل. آتاه الله الملك والحكمة وفصل الخطاب.

في شبابه، كان داود راعياً للغنم. لما خرج طالوت بجيشه لقتال جالوت وجنوده، كان داود من الذين خرجوا معه.

قتل داود جالوت بحجر من مقلاعه، وكان ذلك نصراً عظيماً لبني إسرائيل. بعدها آتاه الله الملك.

أنزل الله على داود الزبور، وآتاه صوتاً حسناً كانت الجبال تسبح معه والطير. علّمه صنعة الدروع.

كان داود يصوم يوماً ويفطر يوماً، وكان يقوم نصف الليل. كان كثير العبادة، حتى سماه النبي ﷺ بأحب الصيام والقيام إلى الله.

كان حكيماً عادلاً في قضائه بين الناس، أعطاه الله فصل الخطاب.`,
        lessons: [
          'الله يؤتي الملك من يشاء',
          'الشجاعة في مواجهة الباطل مطلوبة',
          'ذكر الله يشمل الكون كله',
          'العمل والعبادة لا يتعارضان',
          'الاعتدال في العبادة أفضل',
          'العدل أساس الحكم',
        ],
        quranVerses: [
          {
            arabic: 'وَآتَيْنَا دَاوُودَ زَبُورًا',
            translation: 'And to David We gave the Psalms.',
            reference: 'سورة النساء - الآية 163'
          },
          {
            arabic: 'وَلَقَدْ آتَيْنَا دَاوُودَ مِنَّا فَضْلًا ۖ يَا جِبَالُ أَوِّبِي مَعَهُ وَالطَّيْرَ',
            translation: 'And We certainly gave David from Us bounty. O mountains, repeat Our praises with him, and the birds as well.',
            reference: 'سورة سبأ - الآية 10'
          },
        ],
        hadiths: [
          {
            text: 'أحب الصيام إلى الله صيام داود، كان يصوم يوماً ويفطر يوماً',
            source: 'رواه البخاري ومسلم'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet David - The King Prophet',
        content: `Prophet David (peace be upon him) was a prophet and king over the Children of Israel. Allah gave him kingdom, wisdom, and the ability to judge decisively.

In his youth, David was a shepherd. When Talut (Saul) went out with his army to fight Goliath and his soldiers, David was among those who went with him.

David killed Goliath with a stone from his sling, which was a great victory for the Children of Israel. After this, Allah gave him the kingdom.

Allah revealed the Psalms (Zabur) to David and gave him a beautiful voice that the mountains and birds would glorify Allah with him. He taught him the craft of making armor.

David would fast one day and break his fast the next, and he would stand in prayer for half the night. He was abundant in worship, so much that the Prophet ﷺ called his fasting and prayer the most beloved to Allah.

He was wise and just in his judgment between people; Allah gave him decisive speech.`,
        lessons: [
          'Allah gives kingdom to whom He wills',
          'Courage in facing falsehood is required',
          'Remembrance of Allah encompasses the entire universe',
          'Work and worship do not conflict',
          'Moderation in worship is best',
          'Justice is the foundation of governance',
        ],
        quranVerses: [
          {
            arabic: 'وَآتَيْنَا دَاوُودَ زَبُورًا',
            translation: 'And to David We gave the Psalms.',
            reference: 'Surah An-Nisa - Verse 163'
          },
        ],
      },
    },
  },

  // 18. سليمان عليه السلام
  {
    id: 'sulayman',
    name: { ar: 'سليمان', en: 'Solomon', fr: 'Salomon', ur: 'سلیمان', id: 'Sulaiman', tr: 'Süleyman' },
    era: 'مملكة إسرائيل',
    order: 18,
    stories: {
      ar: {
        title: 'قصة سليمان عليه السلام - الملك العظيم',
        content: `سليمان عليه السلام هو ابن داود، ورث عنه النبوة والملك. دعا ربه أن يهب له ملكاً لا ينبغي لأحد من بعده، فاستجاب الله له.

سخّر الله له الريح تجري بأمره، والجن يعملون له ما يشاء من محاريب وتماثيل. وعلّمه منطق الطير والنمل والحيوانات.

مرّ سليمان بوادي النمل فسمع نملة تحذر قومها. تبسّم ضاحكاً من قولها وشكر الله على نعمه.

جاءته ملكة سبأ بلقيس بعد أن دعاها للإسلام. لما رأت عظمة ملكه وحكمته، أسلمت لله رب العالمين.

بنى سليمان بيت المقدس وأتم بناءه. وكان مع عظم ملكه شاكراً لله، منيباً إليه.

توفي سليمان وهو متكئ على عصاه، ولم يعلم الجن بموته حتى أكلت الأرضة عصاه فخرّ.`,
        lessons: [
          'الشكر على النعم يزيدها',
          'القوة مع الحكمة نعمة عظيمة',
          'التواضع مع العظمة',
          'الدعوة إلى الله للملوك والعامة',
          'الملك الحقيقي لله وحده',
          'الموت يأتي على الجميع',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَّا يَنبَغِي لِأَحَدٍ مِّن بَعْدِي',
            translation: 'He said: My Lord, forgive me and grant me a kingdom such as will not belong to anyone after me.',
            reference: 'سورة ص - الآية 35'
          },
          {
            arabic: 'وَوَرِثَ سُلَيْمَانُ دَاوُودَ',
            translation: 'And Solomon inherited David.',
            reference: 'سورة النمل - الآية 16'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Solomon - The Great King',
        content: `Prophet Solomon (peace be upon him) was the son of David, inheriting prophethood and kingdom from him. He prayed to his Lord to grant him a kingdom that would not belong to anyone after him, and Allah answered.

Allah subjected the wind to his command and the jinn to work for him, building whatever he wished. He taught him the language of birds, ants, and animals.

Solomon passed by the valley of ants and heard an ant warning its colony. He smiled, laughing at its words, and thanked Allah for His blessings.

The Queen of Sheba, Bilqis, came to him after he invited her to Islam. When she saw the magnificence of his kingdom and wisdom, she submitted to Allah, Lord of the worlds.

Solomon built Bayt al-Maqdis (Jerusalem) and completed its construction. Despite his great kingdom, he was grateful to Allah and turned to Him.

Solomon died while leaning on his staff, and the jinn did not know of his death until termites ate through his staff and he collapsed.`,
        lessons: [
          'Gratitude for blessings increases them',
          'Power with wisdom is a great blessing',
          'Humility despite greatness',
          'Calling to Allah applies to kings and commoners',
          'True sovereignty belongs to Allah alone',
          'Death comes to everyone',
        ],
        quranVerses: [
          {
            arabic: 'قَالَ رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَّا يَنبَغِي لِأَحَدٍ مِّن بَعْدِي',
            translation: 'He said: My Lord, forgive me and grant me a kingdom such as will not belong to anyone after me.',
            reference: 'Surah Sad - Verse 35'
          },
        ],
      },
    },
  },

  // 19. إلياس عليه السلام
  {
    id: 'ilyas',
    name: { ar: 'إلياس', en: 'Elijah', fr: 'Élie', ur: 'الیاس', id: 'Ilyas', tr: 'İlyas' },
    era: 'بني إسرائيل',
    order: 19,
    stories: {
      ar: {
        title: 'قصة إلياس عليه السلام',
        content: `إلياس عليه السلام من أنبياء بني إسرائيل. أرسله الله إلى قومه في بعلبك بالشام.

كان قومه يعبدون صنماً اسمه بعل. دعاهم إلياس إلى ترك عبادة الأصنام والعودة إلى عبادة الله الواحد.

قال لهم: "ألا تتقون؟ أتدعون بعلاً وتذرون أحسن الخالقين؟ الله ربكم ورب آبائكم الأولين."

كذّبه قومه ورفضوا دعوته. استمروا في عبادة الأصنام والإشراك بالله.

سلّم الله على إلياس في القرآن وجعله من المرسلين. كان من الصالحين الذين اختارهم الله لهداية الناس.`,
        lessons: [
          'الدعوة إلى التوحيد رسالة كل الأنبياء',
          'الصبر على تكذيب القوم',
          'التذكير بنعم الله على الناس',
          'مواجهة الشرك بالحكمة',
          'الثبات على الحق رغم العناد',
        ],
        quranVerses: [
          {
            arabic: 'وَإِنَّ إِلْيَاسَ لَمِنَ الْمُرْسَلِينَ',
            translation: 'And indeed, Elijah was from among the messengers.',
            reference: 'سورة الصافات - الآية 123'
          },
          {
            arabic: 'إِذْ قَالَ لِقَوْمِهِ أَلَا تَتَّقُونَ أَتَدْعُونَ بَعْلًا وَتَذَرُونَ أَحْسَنَ الْخَالِقِينَ',
            translation: 'When he said to his people: Will you not fear Allah? Do you call upon Baal and leave the best of creators?',
            reference: 'سورة الصافات - الآيات 124-125'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Elijah',
        content: `Prophet Elijah (peace be upon him) was among the prophets of the Children of Israel. Allah sent him to his people in Baalbek in the Levant.

His people worshipped an idol called Baal. Elijah called them to abandon idol worship and return to worshipping the One God.

He said to them: "Will you not fear Allah? Do you call upon Baal and leave the best of creators? Allah, your Lord and the Lord of your ancient forefathers."

His people denied him and rejected his call. They continued worshipping idols and associating partners with Allah.

Allah sent peace upon Elijah in the Quran and made him among the messengers. He was among the righteous whom Allah chose to guide people.`,
        lessons: [
          'Calling to monotheism is the message of all prophets',
          'Patience when people deny',
          'Reminding people of Allah\'s blessings',
          'Confronting polytheism with wisdom',
          'Standing firm on truth despite stubbornness',
        ],
        quranVerses: [
          {
            arabic: 'وَإِنَّ إِلْيَاسَ لَمِنَ الْمُرْسَلِينَ',
            translation: 'And indeed, Elijah was from among the messengers.',
            reference: 'Surah As-Saffat - Verse 123'
          },
        ],
      },
    },
  },

  // 20. اليسع عليه السلام
  {
    id: 'alyasa',
    name: { ar: 'اليسع', en: 'Elisha', fr: 'Élisée', ur: 'الیسع', id: 'Ilyasa', tr: 'Elyesa' },
    era: 'بني إسرائيل',
    order: 20,
    stories: {
      ar: {
        title: 'قصة اليسع عليه السلام',
        content: `اليسع عليه السلام من أنبياء بني إسرائيل. كان تلميذاً وخليفة لإلياس عليه السلام.

بعد إلياس، تولى اليسع مهمة الدعوة إلى الله وهداية بني إسرائيل. استمر في نهج إلياس في مواجهة الشرك والوثنية.

ذكره الله في القرآن مع الأنبياء الأخيار، وأثنى عليه بأنه من المفضلين على العالمين.

كان اليسع نبياً صالحاً، دعا قومه إلى الله وأرشدهم إلى طريق الهداية والصلاح.

استمرت دعوته حتى توفاه الله، تاركاً أثراً طيباً في بني إسرائيل.`,
        lessons: [
          'استمرارية الدعوة من جيل إلى جيل',
          'التلمذة على أيدي الصالحين',
          'الإخلاص في العمل الدعوي',
          'الصبر في مواجهة الانحراف',
          'ترك الأثر الطيب للأجيال القادمة',
        ],
        quranVerses: [
          {
            arabic: 'وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا ۚ وَكُلًّا فَضَّلْنَا عَلَى الْعَالَمِينَ',
            translation: 'And Ishmael and Elisha and Jonah and Lot - and all We preferred over the worlds.',
            reference: 'سورة الأنعام - الآية 86'
          },
          {
            arabic: 'وَاذْكُرْ إِسْمَاعِيلَ وَالْيَسَعَ وَذَا الْكِفْلِ ۖ وَكُلٌّ مِّنَ الْأَخْيَارِ',
            translation: 'And remember Ishmael, Elisha, and Dhul-Kifl, and all are among the outstanding.',
            reference: 'سورة ص - الآية 48'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Elisha',
        content: `Prophet Elisha (peace be upon him) was among the prophets of the Children of Israel. He was a student and successor of Elijah.

After Elijah, Elisha took on the mission of calling to Allah and guiding the Children of Israel. He continued Elijah's approach in confronting polytheism and idolatry.

Allah mentioned him in the Quran among the righteous prophets and praised him as being among those preferred over the worlds.

Elisha was a righteous prophet who called his people to Allah and guided them to the path of guidance and righteousness.

His call continued until Allah took him, leaving a good legacy among the Children of Israel.`,
        lessons: [
          'Continuity of the call from generation to generation',
          'Learning from the righteous',
          'Sincerity in calling to Allah',
          'Patience in facing deviation',
          'Leaving a good legacy for future generations',
        ],
        quranVerses: [
          {
            arabic: 'وَإِسْمَاعِيلَ وَالْيَسَعَ وَيُونُسَ وَلُوطًا',
            translation: 'And Ishmael and Elisha and Jonah and Lot.',
            reference: 'Surah Al-An\'am - Verse 86'
          },
        ],
      },
    },
  },

  // 21. يونس عليه السلام
  {
    id: 'yunus',
    name: { ar: 'يونس', en: 'Jonah', fr: 'Jonas', ur: 'یونس', id: 'Yunus', tr: 'Yunus' },
    era: 'نينوى',
    order: 21,
    stories: {
      ar: {
        title: 'قصة يونس عليه السلام - صاحب الحوت',
        content: `يونس عليه السلام أرسله الله إلى أهل نينوى في العراق. كانوا قوماً يعبدون الأصنام.

دعاهم يونس إلى عبادة الله وترك الأصنام، لكنهم كذبوه ورفضوا دعوته. غضب يونس وخرج من بينهم قبل أن يأذن له الله.

ركب السفينة فهاج البحر، فأُلقي في الماء فالتقمه الحوت. نادى يونس في بطن الحوت: "لا إله إلا أنت سبحانك إني كنت من الظالمين."

استجاب الله لدعائه وأمر الحوت أن يلفظه على الشاطئ. أنبت الله عليه شجرة من يقطين لتظله.

عاد يونس إلى قومه فوجدهم قد آمنوا. كانوا القوم الوحيدين الذين آمنوا فرفع الله عنهم العذاب.`,
        lessons: [
          'عدم اليأس من رحمة الله',
          'الاستغفار والدعاء في الشدة',
          'التوكل على الله في كل الأحوال',
          'عدم التسرع في ترك الدعوة',
          'التوبة تنفع حتى بعد رؤية العذاب',
          'لا إله إلا الله تفرج الكرب',
        ],
        quranVerses: [
          {
            arabic: 'وَذَا النُّونِ إِذ ذَّهَبَ مُغَاضِبًا فَظَنَّ أَن لَّن نَّقْدِرَ عَلَيْهِ فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
            translation: 'And the man of the fish, when he went off in anger and thought that We would not decree upon him. And he called out within the darknesses: There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
            reference: 'سورة الأنبياء - الآية 87'
          },
          {
            arabic: 'فَاسْتَجَبْنَا لَهُ وَنَجَّيْنَاهُ مِنَ الْغَمِّ ۚ وَكَذَٰلِكَ نُنجِي الْمُؤْمِنِينَ',
            translation: 'So We responded to him and saved him from the distress. And thus do We save the believers.',
            reference: 'سورة الأنبياء - الآية 88'
          },
        ],
        hadiths: [
          {
            text: 'دعوة ذي النون إذ دعا وهو في بطن الحوت: لا إله إلا أنت سبحانك إني كنت من الظالمين، لم يدع بها رجل مسلم في شيء إلا استجاب الله له',
            source: 'رواه الترمذي'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Jonah - The Companion of the Whale',
        content: `Prophet Jonah (peace be upon him) was sent by Allah to the people of Nineveh in Iraq. They were a people who worshipped idols.

Jonah called them to worship Allah and leave idols, but they denied him and rejected his call. Jonah became angry and left them before Allah permitted him.

He boarded a ship, and the sea became turbulent. He was thrown into the water and swallowed by a whale. Jonah called out from the whale's belly: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."

Allah answered his supplication and commanded the whale to cast him onto the shore. Allah caused a gourd plant to grow over him for shade.

Jonah returned to his people and found they had believed. They were the only people who believed after seeing signs of punishment, so Allah removed the punishment from them.`,
        lessons: [
          'Never despair of Allah\'s mercy',
          'Seeking forgiveness and supplication in hardship',
          'Trust in Allah in all circumstances',
          'Not hastening to abandon the call',
          'Repentance benefits even after seeing punishment',
          'La ilaha illa Allah relieves distress',
        ],
        quranVerses: [
          {
            arabic: 'فَنَادَىٰ فِي الظُّلُمَاتِ أَن لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ',
            translation: 'And he called out within the darknesses: There is no deity except You; exalted are You.',
            reference: 'Surah Al-Anbiya - Verse 87'
          },
        ],
      },
    },
  },

  // 22. زكريا عليه السلام
  {
    id: 'zakariya',
    name: { ar: 'زكريا', en: 'Zechariah', fr: 'Zacharie', ur: 'زکریا', id: 'Zakaria', tr: 'Zekeriya' },
    era: 'بيت المقدس',
    order: 22,
    stories: {
      ar: {
        title: 'قصة زكريا عليه السلام',
        content: `زكريا عليه السلام كان نبياً من أنبياء بني إسرائيل وكفيل مريم عليها السلام. كان شيخاً كبيراً وامرأته عاقر.

كان يدخل على مريم المحراب فيجد عندها رزقاً. لما سألها قالت: "هو من عند الله". هنالك دعا زكريا ربه أن يرزقه ذرية طيبة.

نادته الملائكة وهو قائم يصلي في المحراب: "إن الله يبشرك بيحيى مصدقاً بكلمة من الله وسيداً وحصوراً ونبياً من الصالحين."

تعجب زكريا وقال: "رب أنى يكون لي غلام وقد بلغني الكبر وامرأتي عاقر؟" قال الله: "كذلك الله يفعل ما يشاء."

طلب زكريا آية، فجعل الله آيته ألا يكلم الناس ثلاث ليال سوياً. رُزق بيحيى كما وعده الله.`,
        lessons: [
          'الدعاء لله في كل حال',
          'لا يستبعد على الله شيء',
          'الأمل في رحمة الله مهما كبر السن',
          'رؤية آيات الله تحفز على الدعاء',
          'الذرية الصالحة نعمة عظيمة',
        ],
        quranVerses: [
          {
            arabic: 'هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُ ۖ قَالَ رَبِّ هَبْ لِي مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً',
            translation: 'At that, Zechariah called upon his Lord, saying: My Lord, grant me from Yourself a good offspring.',
            reference: 'سورة آل عمران - الآية 38'
          },
          {
            arabic: 'يَا زَكَرِيَّا إِنَّا نُبَشِّرُكَ بِغُلَامٍ اسْمُهُ يَحْيَىٰ لَمْ نَجْعَل لَّهُ مِن قَبْلُ سَمِيًّا',
            translation: 'O Zechariah, indeed We give you good tidings of a boy whose name will be John. We have not assigned to any before him that name.',
            reference: 'سورة مريم - الآية 7'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Zechariah',
        content: `Prophet Zechariah (peace be upon him) was a prophet from the Children of Israel and the guardian of Mary. He was an old man and his wife was barren.

He used to enter upon Mary in the sanctuary and find provisions with her. When he asked her, she said: "It is from Allah." Then Zechariah called upon his Lord to grant him good offspring.

The angels called to him while he was standing in prayer in the sanctuary: "Indeed, Allah gives you good tidings of John, confirming a word from Allah and honorable, abstaining from women, and a prophet from among the righteous."

Zechariah was amazed and said: "My Lord, how will I have a boy when I have reached old age and my wife is barren?" Allah said: "Thus Allah does what He wills."

Zechariah asked for a sign, and Allah made his sign that he would not speak to people for three nights. He was blessed with John as Allah promised.`,
        lessons: [
          'Supplicating to Allah in all circumstances',
          'Nothing is impossible for Allah',
          'Hope in Allah\'s mercy regardless of age',
          'Seeing Allah\'s signs motivates supplication',
          'Righteous offspring is a great blessing',
        ],
        quranVerses: [
          {
            arabic: 'هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُ',
            translation: 'At that, Zechariah called upon his Lord.',
            reference: 'Surah Aal-e-Imran - Verse 38'
          },
        ],
      },
    },
  },

  // 23. يحيى عليه السلام
  {
    id: 'yahya',
    name: { ar: 'يحيى', en: 'John', fr: 'Jean', ur: 'یحییٰ', id: 'Yahya', tr: 'Yahya' },
    era: 'بيت المقدس',
    order: 23,
    stories: {
      ar: {
        title: 'قصة يحيى عليه السلام',
        content: `يحيى عليه السلام هو ابن زكريا، جاء بمعجزة من الله بعد أن كان أبواه كبيرين في السن وأمه عاقر.

سماه الله يحيى، ولم يجعل له من قبل سمياً. آتاه الله الحكم وهو صبي، وكان براً بوالديه تقياً.

أمره الله أن يأخذ الكتاب بقوة، وعلّمه الله الكتاب والحكمة. كان زاهداً عابداً، حصوراً (ممتنعاً عن الشهوات).

كان يحيى نبياً مصدقاً بكلمة من الله (أي بعيسى عليه السلام). بشّر بمجيء عيسى ومهّد له الطريق.

قُتل يحيى ظلماً على يد ملك ظالم، فكان شهيداً في سبيل الله. سلّم الله عليه يوم ولد ويوم يموت ويوم يُبعث حياً.`,
        lessons: [
          'طاعة الوالدين من صفات الأنبياء',
          'الحكمة تُعطى للصغير والكبير',
          'الزهد في الدنيا من صفات الصالحين',
          'التصديق بالحق والتبشير به',
          'الشهادة في سبيل الله رفعة',
        ],
        quranVerses: [
          {
            arabic: 'يَا يَحْيَىٰ خُذِ الْكِتَابَ بِقُوَّةٍ ۖ وَآتَيْنَاهُ الْحُكْمَ صَبِيًّا',
            translation: 'O John, take the Scripture with determination. And We gave him judgement while yet a boy.',
            reference: 'سورة مريم - الآية 12'
          },
          {
            arabic: 'وَسَلَامٌ عَلَيْهِ يَوْمَ وُلِدَ وَيَوْمَ يَمُوتُ وَيَوْمَ يُبْعَثُ حَيًّا',
            translation: 'And peace be upon him the day he was born and the day he dies and the day he is raised alive.',
            reference: 'سورة مريم - الآية 15'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet John',
        content: `Prophet John (peace be upon him) was the son of Zechariah, born miraculously after his parents were old and his mother was barren.

Allah named him John (Yahya), and there had been none before him with that name. Allah gave him wisdom while still a boy, and he was dutiful to his parents and pious.

Allah commanded him to hold fast to the Scripture, and taught him the Book and wisdom. He was an ascetic worshipper, abstaining from worldly desires.

John was a prophet who confirmed a Word from Allah (meaning Jesus). He heralded the coming of Jesus and prepared the way for him.

John was unjustly killed by an oppressive king, becoming a martyr in the cause of Allah. Allah sent peace upon him the day he was born, the day he dies, and the day he will be raised alive.`,
        lessons: [
          'Obedience to parents is a prophetic trait',
          'Wisdom can be given to both young and old',
          'Asceticism is a trait of the righteous',
          'Confirming truth and heralding it',
          'Martyrdom for Allah\'s sake is an elevation',
        ],
        quranVerses: [
          {
            arabic: 'يَا يَحْيَىٰ خُذِ الْكِتَابَ بِقُوَّةٍ',
            translation: 'O John, take the Scripture with determination.',
            reference: 'Surah Maryam - Verse 12'
          },
        ],
      },
    },
  },

  // 24. عيسى عليه السلام
  {
    id: 'isa',
    name: { ar: 'عيسى', en: 'Jesus', fr: 'Jésus', ur: 'عیسیٰ', id: 'Isa', tr: 'İsa' },
    era: 'فلسطين',
    order: 24,
    stories: {
      ar: {
        title: 'قصة عيسى عليه السلام - المسيح',
        content: `عيسى عليه السلام هو المسيح ابن مريم، كلمة الله ألقاها إلى مريم وروح منه. خُلق بكلمة "كن" بدون أب، كما خُلق آدم من تراب.

جاء الملاك جبريل إلى مريم في صورة بشر سوي، وبشّرها بغلام زكي. نفخ فيها من روح الله فحملت بعيسى.

تكلم عيسى في المهد دفاعاً عن أمه، وقال: "إني عبد الله آتاني الكتاب وجعلني نبياً."

أيده الله بمعجزات عظيمة: يخلق من الطين كهيئة الطير فينفخ فيها فتكون طيراً بإذن الله، ويبرئ الأكمه والأبرص، ويحيي الموتى بإذن الله.

أنزل الله عليه الإنجيل، ودعا بني إسرائيل إلى عبادة الله وحده. آمن به الحواريون ونصروه.

أراد اليهود قتله فرفعه الله إليه، وسينزل في آخر الزمان ليقتل الدجال ويحكم بالإسلام.`,
        lessons: [
          'قدرة الله لا حدود لها',
          'عيسى عبد الله ورسوله وليس إلهاً',
          'المعجزات بإذن الله وحده',
          'الدفاع عن الحق واجب',
          'التوحيد رسالة جميع الأنبياء',
          'الله ينجي أنبياءه من أعدائهم',
        ],
        quranVerses: [
          {
            arabic: 'إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ ۖ خَلَقَهُ مِن تُرَابٍ ثُمَّ قَالَ لَهُ كُن فَيَكُونُ',
            translation: 'Indeed, the example of Jesus to Allah is like that of Adam. He created Him from dust; then He said to him: Be, and he was.',
            reference: 'سورة آل عمران - الآية 59'
          },
          {
            arabic: 'إِنَّمَا الْمَسِيحُ عِيسَى ابْنُ مَرْيَمَ رَسُولُ اللَّهِ وَكَلِمَتُهُ أَلْقَاهَا إِلَىٰ مَرْيَمَ وَرُوحٌ مِّنْهُ',
            translation: 'The Messiah, Jesus, the son of Mary, was but a messenger of Allah and His word which He directed to Mary and a soul from Him.',
            reference: 'سورة النساء - الآية 171'
          },
        ],
        hadiths: [
          {
            text: 'أنا أولى الناس بعيسى ابن مريم في الدنيا والآخرة، الأنبياء إخوة لعلات',
            source: 'رواه البخاري'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Jesus - The Messiah',
        content: `Prophet Jesus (peace be upon him) is the Messiah, son of Mary, a Word from Allah cast to Mary and a spirit from Him. He was created by the word "Be" without a father, just as Adam was created from dust.

The angel Gabriel came to Mary in the form of a perfect man and gave her tidings of a pure son. He breathed into her from Allah's spirit and she conceived Jesus.

Jesus spoke in the cradle in defense of his mother, saying: "Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet."

Allah supported him with great miracles: he would create from clay the form of a bird and breathe into it, and it would become a bird by Allah's permission; he would heal the blind and the leper; and he would bring the dead to life by Allah's permission.

Allah revealed to him the Gospel and he called the Children of Israel to worship Allah alone. The disciples believed in him and supported him.

The Jews wanted to kill him, but Allah raised him to Himself. He will descend at the end of time to kill the Antichrist and rule by Islam.`,
        lessons: [
          'Allah\'s power has no limits',
          'Jesus is Allah\'s servant and messenger, not a deity',
          'Miracles occur only by Allah\'s permission',
          'Defending truth is obligatory',
          'Monotheism is the message of all prophets',
          'Allah saves His prophets from their enemies',
        ],
        quranVerses: [
          {
            arabic: 'إِنَّ مَثَلَ عِيسَىٰ عِندَ اللَّهِ كَمَثَلِ آدَمَ',
            translation: 'Indeed, the example of Jesus to Allah is like that of Adam.',
            reference: 'Surah Aal-e-Imran - Verse 59'
          },
        ],
      },
    },
  },

  // 25. محمد صلى الله عليه وسلم
  {
    id: 'muhammad',
    name: { ar: 'محمد ﷺ', en: 'Muhammad ﷺ', fr: 'Muhammad ﷺ', ur: 'محمد ﷺ', id: 'Muhammad ﷺ', tr: 'Muhammed ﷺ' },
    era: 'خاتم النبيين',
    order: 25,
    stories: {
      ar: {
        title: 'قصة محمد ﷺ - خاتم النبيين',
        content: `محمد صلى الله عليه وسلم هو خاتم الأنبياء والمرسلين، أرسله الله رحمة للعالمين. ولد في مكة عام الفيل.

نشأ يتيماً، مات أبوه قبل ولادته وماتت أمه وهو صغير. كفله جده عبد المطلب ثم عمه أبو طالب.

عُرف بالصادق الأمين قبل النبوة. تزوج خديجة بنت خويلد وكانت أول من آمن به من النساء.

نزل عليه الوحي في غار حراء وهو في الأربعين من عمره. أمره الله أن يدعو الناس إلى الإسلام.

صبر على أذى قريش ثلاث عشرة سنة في مكة، ثم هاجر إلى المدينة وأسس الدولة الإسلامية.

فتح مكة وأتم الله به الدين، وتوفي وعمره ثلاث وستون سنة بعد أن بلّغ الرسالة وأدى الأمانة.`,
        lessons: [
          'الصبر على البلاء في سبيل الدعوة',
          'الأخلاق الحسنة أساس الدعوة',
          'الرحمة بالخلق من صفات النبي',
          'التدرج في الدعوة والإصلاح',
          'الوفاء والأمانة من أعظم الصفات',
          'الإسلام دين كامل للبشرية جمعاء',
        ],
        quranVerses: [
          {
            arabic: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
            translation: 'And We have not sent you except as a mercy to the worlds.',
            reference: 'سورة الأنبياء - الآية 107'
          },
          {
            arabic: 'مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ',
            translation: 'Muhammad is not the father of any of your men, but he is the Messenger of Allah and the seal of the prophets.',
            reference: 'سورة الأحزاب - الآية 40'
          },
          {
            arabic: 'لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ',
            translation: 'There has certainly been for you in the Messenger of Allah an excellent example.',
            reference: 'سورة الأحزاب - الآية 21'
          },
        ],
        hadiths: [
          {
            text: 'إنما بُعثت لأتمم مكارم الأخلاق',
            source: 'رواه البيهقي'
          },
          {
            text: 'أنا سيد ولد آدم ولا فخر',
            source: 'رواه الترمذي'
          },
        ],
      },
      en: {
        title: 'The Story of Prophet Muhammad ﷺ - The Seal of Prophets',
        content: `Prophet Muhammad (peace be upon him) is the seal of the prophets and messengers, sent by Allah as a mercy to all the worlds. He was born in Mecca in the Year of the Elephant.

He grew up an orphan; his father died before his birth and his mother died when he was young. His grandfather Abdul-Muttalib and then his uncle Abu Talib cared for him.

He was known as the Truthful and Trustworthy before prophethood. He married Khadijah bint Khuwaylid, who was the first woman to believe in him.

Revelation came to him in the Cave of Hira when he was forty years old. Allah commanded him to call people to Islam.

He patiently endured the persecution of Quraysh for thirteen years in Mecca, then migrated to Medina and established the Islamic state.

He conquered Mecca and Allah completed the religion through him. He died at sixty-three years of age after delivering the message and fulfilling the trust.`,
        lessons: [
          'Patience in trials for the sake of calling to Allah',
          'Good character is the foundation of calling to Allah',
          'Mercy to creation is a prophetic trait',
          'Gradual approach in calling and reform',
          'Loyalty and trustworthiness are the greatest traits',
          'Islam is a complete religion for all humanity',
        ],
        quranVerses: [
          {
            arabic: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
            translation: 'And We have not sent you except as a mercy to the worlds.',
            reference: 'Surah Al-Anbiya - Verse 107'
          },
        ],
      },
    },
  },
];

export function getStoryByLanguage(prophetId: string, languageId: string): ExtendedStory | null {
  const prophet = prophetStories.find(p => p.id === prophetId);
  if (!prophet) return null;
  
  // Try exact language match first
  if (prophet.stories[languageId]) {
    return prophet.stories[languageId];
  }
  
  // For Arabic dialects, fallback to standard Arabic
  if (languageId.startsWith('ar-')) {
    return prophet.stories['ar'] || null;
  }
  
  // Fallback to Arabic
  return prophet.stories['ar'] || null;
}
