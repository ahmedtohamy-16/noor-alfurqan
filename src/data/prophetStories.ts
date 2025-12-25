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
    [language: string]: {
      title: string;
      content: string;
      lessons: string[];
    };
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
  {
    id: 'adam',
    name: { ar: 'آدم', en: 'Adam', fr: 'Adam', ur: 'آدم', id: 'Adam', tr: 'Adem' },
    era: 'بداية الخلق',
    order: 1,
    stories: {
      ar: {
        title: 'قصة آدم عليه السلام - أبو البشر',
        content: `آدم عليه السلام هو أول إنسان خلقه الله تعالى، وهو أبو البشرية جمعاء. خلقه الله من طين ثم نفخ فيه من روحه.

أمر الله الملائكة بالسجود لآدم تكريماً له، فسجدوا جميعاً إلا إبليس أبى واستكبر وكان من الكافرين. قال إبليس: "أنا خير منه خلقتني من نار وخلقته من طين".

أسكن الله آدم وزوجته حواء الجنة، وأباح لهما كل ما فيها إلا شجرة واحدة نهاهما عن الاقتراب منها. لكن الشيطان وسوس لهما وأغواهما حتى أكلا من الشجرة.

عندما أكلا من الشجرة، بدت لهما سوآتهما، فأخذا يخصفان عليهما من ورق الجنة. عاتبهما الله على ما فعلا، فتابا إلى الله واستغفراه.

أنزل الله آدم وحواء إلى الأرض ليعمراها، وجعل ذريتهما خلفاء في الأرض. علّم الله آدم الأسماء كلها، وجعله أول نبي على وجه الأرض.`,
        lessons: [
          'التوبة تمحو الذنوب مهما عظمت',
          'الكبر سبب هلاك إبليس',
          'طاعة الله واجبة في كل الأحوال',
          'الإنسان معرض للخطأ لكن عليه التوبة',
        ],
      },
      'ar-eg': {
        title: 'حكاية سيدنا آدم - أبو البشر',
        content: `سيدنا آدم عليه السلام هو أول إنسان ربنا خلقه، وهو أبو البشر كلهم. ربنا خلقه من طين وبعدين نفخ فيه من روحه.

ربنا أمر الملايكة يسجدوا لآدم عشان يكرموه، وكلهم سجدوا إلا إبليس رفض واستكبر. إبليس قال: "أنا أحسن منه، ربنا خلقني من نار وخلقه من طين".

ربنا سكّن آدم ومراته حوا في الجنة، وسابهم ياكلوا من كل حاجة إلا شجرة واحدة منعهم منها. بس الشيطان وسوس ليهم وغواهم لحد ما أكلوا من الشجرة.

لما أكلوا من الشجرة، بانت عورتهم، وابتدوا يغطوا نفسهم بورق الشجر. ربنا عاتبهم على اللي عملوه، فتابوا واستغفروا.

ربنا نزّل آدم وحوا على الأرض عشان يعمروها، وخلى ولادهم خلفا في الأرض. ربنا علّم آدم الأسما كلها، وخلاه أول نبي على الأرض.`,
        lessons: [
          'التوبة بتمسح الذنوب مهما كانت كبيرة',
          'الكبر والغرور سبب هلاك إبليس',
          'طاعة ربنا واجبة في كل وقت',
          'الإنسان ممكن يغلط بس لازم يتوب',
        ],
      },
      'ar-sa': {
        title: 'قصة نبينا آدم عليه السلام - أبو البشر',
        content: `آدم عليه السلام هو أول إنسان خلقه الله سبحانه، وهو أبو البشر كلهم. الله خلقه من طين وبعدين نفخ فيه من روحه.

الله أمر الملائكة يسجدون لآدم تكريم له، وسجدوا كلهم إلا إبليس أبى واستكبر. إبليس قال: "أنا أحسن منه، خلقتني من نار وخلقته من طين".

الله سكّن آدم وزوجته حوا في الجنة، وأباح لهم كل شي إلا شجرة وحدة نهاهم عنها. بس الشيطان وسوس لهم وأغواهم حتى أكلوا من الشجرة.

لما أكلوا من الشجرة، بانت لهم سوآتهم، وصاروا يخصفون عليهم من ورق الجنة. الله عاتبهم على اللي سووه، فتابوا واستغفروا.

الله نزّل آدم وحوا للأرض عشان يعمرونها، وجعل ذريتهم خلفاء في الأرض. الله علّم آدم الأسماء كلها، وجعله أول نبي على وجه الأرض.`,
        lessons: [
          'التوبة تمحو الذنوب مهما كبرت',
          'الكبر سبب هلاك إبليس لعنه الله',
          'طاعة الله واجبة في كل الأوقات',
          'الإنسان يخطئ لكن عليه التوبة',
        ],
      },
      'ar-sy': {
        title: 'قصة سيدنا آدم عليه السلام - أبو البشر',
        content: `سيدنا آدم عليه السلام هو أول إنسان خلقو الله، وهو أبو البشر كلياتن. الله خلقو من طين وبعدين نفخ فيه من روحو.

الله أمر الملايكة يسجدوا لآدم تكريم إلو، وسجدوا كلياتن إلا إبليس رفض واستكبر. إبليس قال: "أنا أحسن منو، خلقتني من نار وخلقتو من طين".

الله سكّن آدم ومرتو حوا بالجنة، وسمحلن ياكلوا من كل شي إلا شجرة وحدة منعن منها. بس الشيطان وسوس إلن وأغوان لحتى أكلوا من الشجرة.

لما أكلوا من الشجرة، بانت عورتن، وصاروا يغطوا حالن بورق الشجر. الله عاتبن على يلي عملوه، فتابوا واستغفروا.

الله نزّل آدم وحوا عالأرض ليعمروها، وخلّى ولادن خلفاء بالأرض. الله علّم آدم الأسماء كلياتا، وخلاه أول نبي على وجه الأرض.`,
        lessons: [
          'التوبة بتمحي الذنوب مهما كانت كبيرة',
          'الكبر والتعالي سبب هلاك إبليس',
          'طاعة الله واجبة بكل الأوقات',
          'الإنسان بيغلط بس لازم يتوب',
        ],
      },
      en: {
        title: 'The Story of Prophet Adam - Father of Humanity',
        content: `Prophet Adam (peace be upon him) was the first human being created by Allah, and he is the father of all mankind. Allah created him from clay and then breathed into him His spirit.

Allah commanded the angels to prostrate to Adam as an honor to him. They all prostrated except Iblis (Satan), who refused out of arrogance. Iblis said: "I am better than him. You created me from fire and created him from clay."

Allah settled Adam and his wife Hawwa (Eve) in Paradise and permitted them everything except one tree, which He forbade them from approaching. However, Satan whispered to them and tempted them until they ate from the tree.

When they ate from the tree, their nakedness became apparent to them, and they began covering themselves with leaves from Paradise. Allah admonished them for what they had done, and they repented and sought forgiveness.

Allah sent Adam and Hawwa down to Earth to inhabit it, and made their descendants successors on Earth. Allah taught Adam all the names and made him the first prophet on Earth.`,
        lessons: [
          'Repentance erases sins no matter how great',
          'Arrogance was the cause of Satan\'s downfall',
          'Obedience to Allah is obligatory at all times',
          'Humans are prone to error but must repent',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Adam - Père de l\'Humanité',
        content: `Le Prophète Adam (paix sur lui) fut le premier être humain créé par Allah, et il est le père de toute l'humanité. Allah l'a créé d'argile puis lui a insufflé de Son esprit.

Allah a ordonné aux anges de se prosterner devant Adam pour l'honorer. Ils se sont tous prosternés sauf Iblis (Satan), qui a refusé par orgueil. Iblis a dit : « Je suis meilleur que lui. Tu m'as créé de feu et tu l'as créé d'argile. »

Allah a installé Adam et son épouse Hawwa (Ève) au Paradis et leur a tout permis sauf un arbre, qu'Il leur a interdit d'approcher. Cependant, Satan leur a murmuré et les a tentés jusqu'à ce qu'ils mangent de l'arbre.

Quand ils ont mangé de l'arbre, leur nudité leur est apparue, et ils ont commencé à se couvrir avec des feuilles du Paradis. Allah les a réprimandés pour ce qu'ils avaient fait, et ils se sont repentis et ont demandé pardon.

Allah a envoyé Adam et Hawwa sur Terre pour l'habiter, et a fait de leurs descendants des successeurs sur Terre. Allah a enseigné à Adam tous les noms et a fait de lui le premier prophète sur Terre.`,
        lessons: [
          'Le repentir efface les péchés, quelle que soit leur gravité',
          'L\'orgueil fut la cause de la chute de Satan',
          'L\'obéissance à Allah est obligatoire en tout temps',
          'Les humains sont sujets à l\'erreur mais doivent se repentir',
        ],
      },
      ur: {
        title: 'حضرت آدم علیہ السلام کی کہانی - ابو البشر',
        content: `حضرت آدم علیہ السلام پہلے انسان تھے جنہیں اللہ تعالیٰ نے پیدا کیا، اور وہ تمام انسانیت کے باپ ہیں۔ اللہ نے انہیں مٹی سے بنایا اور پھر ان میں اپنی روح پھونکی۔

اللہ نے فرشتوں کو حکم دیا کہ آدم کو سجدہ کریں ان کی تکریم کے لیے۔ سب نے سجدہ کیا سوائے ابلیس کے، جس نے تکبر کی وجہ سے انکار کر دیا۔ ابلیس نے کہا: "میں ان سے بہتر ہوں۔ تو نے مجھے آگ سے بنایا اور انہیں مٹی سے۔"

اللہ نے آدم اور ان کی بیوی حوا کو جنت میں بسایا اور انہیں ہر چیز کی اجازت دی سوائے ایک درخت کے، جس سے انہیں منع کیا۔ لیکن شیطان نے انہیں وسوسہ دیا اور بہکایا یہاں تک کہ انہوں نے اس درخت سے کھا لیا۔

جب انہوں نے درخت سے کھایا تو ان کی عریانی ان پر ظاہر ہو گئی، اور وہ جنت کے پتوں سے اپنے آپ کو ڈھانپنے لگے۔ اللہ نے ان کی سرزنش کی جو انہوں نے کیا، تو انہوں نے توبہ کی اور معافی مانگی۔

اللہ نے آدم اور حوا کو زمین پر بھیجا تاکہ وہ اسے آباد کریں، اور ان کی اولاد کو زمین میں خلیفہ بنایا۔ اللہ نے آدم کو تمام نام سکھائے اور انہیں زمین پر پہلا نبی بنایا۔`,
        lessons: [
          'توبہ گناہوں کو مٹا دیتی ہے چاہے وہ کتنے ہی بڑے ہوں',
          'تکبر شیطان کی تباہی کا سبب بنا',
          'اللہ کی اطاعت ہر وقت فرض ہے',
          'انسان غلطی کر سکتا ہے لیکن توبہ ضروری ہے',
        ],
      },
      id: {
        title: 'Kisah Nabi Adam - Bapak Umat Manusia',
        content: `Nabi Adam (alaihissalam) adalah manusia pertama yang diciptakan Allah, dan beliau adalah bapak seluruh umat manusia. Allah menciptakannya dari tanah liat kemudian meniupkan ruh-Nya kepadanya.

Allah memerintahkan para malaikat untuk bersujud kepada Adam sebagai penghormatan kepadanya. Mereka semua bersujud kecuali Iblis, yang menolak karena kesombongannya. Iblis berkata: "Aku lebih baik darinya. Engkau menciptakanku dari api dan menciptakannya dari tanah liat."

Allah menempatkan Adam dan istrinya Hawa di surga dan membolehkan mereka menikmati segalanya kecuali satu pohon, yang Dia larang mereka mendekatinya. Namun, setan membisikkan kepada mereka dan menggoda mereka sampai mereka makan dari pohon itu.

Ketika mereka makan dari pohon itu, aurat mereka tampak bagi mereka, dan mereka mulai menutupi diri dengan daun-daun dari surga. Allah menegur mereka atas apa yang telah mereka lakukan, dan mereka bertobat dan memohon ampunan.

Allah menurunkan Adam dan Hawa ke Bumi untuk menghuninya, dan menjadikan keturunan mereka sebagai khalifah di Bumi. Allah mengajarkan Adam semua nama dan menjadikannya nabi pertama di Bumi.`,
        lessons: [
          'Taubat menghapus dosa sebesar apapun',
          'Kesombongan adalah penyebab kehancuran setan',
          'Ketaatan kepada Allah wajib setiap saat',
          'Manusia bisa berbuat salah tapi harus bertaubat',
        ],
      },
      tr: {
        title: 'Hz. Adem\'in Kıssası - İnsanlığın Babası',
        content: `Hz. Adem (aleyhisselam) Allah'ın yarattığı ilk insandır ve tüm insanlığın babasıdır. Allah onu çamurdan yarattı ve sonra ona ruhundan üfledi.

Allah, meleklere Adem'e secde etmelerini emretti. Hepsi secde etti, ancak İblis kibrinden dolayı reddetti. İblis dedi ki: "Ben ondan daha iyiyim. Beni ateşten yarattın, onu ise çamurdan yarattın."

Allah, Adem ve eşi Havva'yı cennete yerleştirdi ve onlara yaklaşmalarını yasakladığı bir ağaç hariç her şeye izin verdi. Ancak şeytan onlara vesvese verdi ve onları ağaçtan yiyinceye kadar kandırdı.

Ağaçtan yediklerinde, çıplaklıkları kendilerine göründü ve cennet yapraklarıyla örtünmeye başladılar. Allah onları yaptıkları için azarladı ve onlar tövbe edip af dilediler.

Allah, Adem ve Havva'yı yeryüzünü imar etmeleri için dünyaya indirdi ve soylarını yeryüzünde halifeler kıldı. Allah, Adem'e tüm isimleri öğretti ve onu yeryüzündeki ilk peygamber yaptı.`,
        lessons: [
          'Tövbe, ne kadar büyük olursa olsun günahları siler',
          'Kibir, şeytanın helak olmasının sebebiydi',
          'Allah\'a itaat her zaman farzdır',
          'İnsan hata yapabilir ama tövbe etmelidir',
        ],
      },
    },
  },
  {
    id: 'idris',
    name: { ar: 'إدريس', en: 'Idris', fr: 'Idris', ur: 'ادریس', id: 'Idris', tr: 'İdris' },
    era: 'قبل نوح',
    order: 2,
    stories: {
      ar: {
        title: 'قصة إدريس عليه السلام',
        content: `إدريس عليه السلام هو من أوائل الأنبياء بعد آدم عليه السلام. كان من ذرية شيث بن آدم، وقد أعطاه الله علماً واسعاً وحكمة عظيمة.

كان إدريس عليه السلام أول من خط بالقلم، وأول من خاط الثياب ولبسها، وكان الناس قبله يلبسون الجلود. علّم قومه الكتابة والحساب والفلك.

دعا قومه إلى عبادة الله وحده وترك عبادة الأصنام، فآمن به بعضهم وكفر آخرون. صبر على أذى قومه واستمر في دعوته.

رفع الله إدريس مكاناً علياً كما قال تعالى: "ورفعناه مكاناً عليا". وكان صادقاً صابراً كثير العبادة والذكر.

ذُكر إدريس في القرآن الكريم في سورة مريم: "واذكر في الكتاب إدريس إنه كان صديقاً نبياً، ورفعناه مكاناً علياً".`,
        lessons: [
          'العلم والتعلم من صفات الأنبياء',
          'الصبر على الدعوة مهما كانت الصعوبات',
          'الله يرفع درجات الصالحين',
        ],
      },
      'ar-eg': {
        title: 'حكاية سيدنا إدريس عليه السلام',
        content: `سيدنا إدريس عليه السلام كان من أوائل الأنبياء بعد سيدنا آدم. كان من نسل شيث ابن آدم، وربنا إداله علم كتير وحكمة كبيرة.

سيدنا إدريس كان أول واحد كتب بالقلم، وأول واحد خاط هدوم ولبسها، الناس قبله كانوا بيلبسوا جلود الحيوانات. علّم الناس الكتابة والحساب وعلم الفلك.

دعا قومه يعبدوا ربنا لوحده ويسيبوا عبادة الأصنام، بعضهم آمن وبعضهم كفر. صبر على أذية قومه وفضل يدعيهم.

ربنا رفع إدريس مكان عالي زي ما قال في القرآن: "ورفعناه مكاناً عليا". وكان صادق صبور كتير العبادة والذكر.

ربنا ذكر إدريس في القرآن في سورة مريم: "واذكر في الكتاب إدريس إنه كان صديقاً نبياً، ورفعناه مكاناً علياً".`,
        lessons: [
          'العلم والتعلم من صفات الأنبياء',
          'الصبر على الدعوة مهما كانت الصعوبات',
          'ربنا بيرفع درجات الصالحين',
        ],
      },
      en: {
        title: 'The Story of Prophet Idris',
        content: `Prophet Idris (peace be upon him) was one of the earliest prophets after Adam. He was from the lineage of Shith (Seth), son of Adam, and Allah granted him vast knowledge and great wisdom.

Idris was the first to write with a pen, and the first to sew and wear clothes - people before him wore animal skins. He taught his people writing, mathematics, and astronomy.

He called his people to worship Allah alone and abandon idol worship. Some believed while others rejected. He remained patient despite his people's harm and continued his mission.

Allah raised Idris to a high station as He said: "And We raised him to a high station." He was truthful, patient, and devoted to worship and remembrance.

Idris is mentioned in the Quran in Surah Maryam: "And mention in the Book, Idris. Indeed, he was a man of truth and a prophet. And We raised him to a high station."`,
        lessons: [
          'Knowledge and learning are attributes of prophets',
          'Patience in calling to truth despite difficulties',
          'Allah elevates the righteous to high ranks',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Idris',
        content: `Le Prophète Idris (paix sur lui) était l'un des premiers prophètes après Adam. Il était de la lignée de Shith (Seth), fils d'Adam, et Allah lui a accordé une vaste connaissance et une grande sagesse.

Idris fut le premier à écrire avec un stylo, et le premier à coudre et porter des vêtements - les gens avant lui portaient des peaux d'animaux. Il a enseigné à son peuple l'écriture, les mathématiques et l'astronomie.

Il a appelé son peuple à adorer Allah seul et à abandonner l'idolâtrie. Certains ont cru tandis que d'autres ont rejeté. Il est resté patient malgré le mal de son peuple et a continué sa mission.

Allah a élevé Idris à un haut rang comme Il l'a dit : « Et Nous l'avons élevé à un haut rang. » Il était véridique, patient et dévoué au culte et au souvenir.

Idris est mentionné dans le Coran dans la sourate Maryam : « Et mentionne dans le Livre Idris. C'était un véridique et un prophète. Et Nous l'avons élevé à un haut rang. »`,
        lessons: [
          'La connaissance et l\'apprentissage sont des attributs des prophètes',
          'La patience dans l\'appel à la vérité malgré les difficultés',
          'Allah élève les justes à des rangs élevés',
        ],
      },
      ur: {
        title: 'حضرت ادریس علیہ السلام کی کہانی',
        content: `حضرت ادریس علیہ السلام حضرت آدم کے بعد ابتدائی انبیاء میں سے تھے۔ وہ شیث بن آدم کی نسل سے تھے، اور اللہ نے انہیں وسیع علم اور عظیم حکمت عطا کی۔

ادریس پہلے شخص تھے جنہوں نے قلم سے لکھا، اور پہلے جنہوں نے کپڑے سلائے اور پہنے - ان سے پہلے لوگ جانوروں کی کھالیں پہنتے تھے۔ انہوں نے اپنی قوم کو لکھنا، حساب اور علم فلکیات سکھایا۔

انہوں نے اپنی قوم کو صرف اللہ کی عبادت کی دعوت دی اور بت پرستی چھوڑنے کو کہا۔ کچھ نے ایمان لایا جبکہ دوسروں نے انکار کیا۔ وہ اپنی قوم کی تکلیفوں کے باوجود صبر سے رہے اور اپنا مشن جاری رکھا۔

اللہ نے ادریس کو بلند مقام پر اٹھایا جیسا کہ فرمایا: "اور ہم نے اسے بلند مقام پر اٹھایا۔" وہ سچے، صابر اور عبادت و ذکر میں مشغول رہنے والے تھے۔

ادریس کا ذکر قرآن میں سورہ مریم میں آیا ہے: "اور کتاب میں ادریس کا ذکر کرو۔ بیشک وہ سچے اور نبی تھے۔ اور ہم نے اسے بلند مقام پر اٹھایا۔"`,
        lessons: [
          'علم اور سیکھنا انبیاء کی صفات ہیں',
          'مشکلات کے باوجود حق کی دعوت میں صبر',
          'اللہ نیک لوگوں کے درجات بلند کرتا ہے',
        ],
      },
      id: {
        title: 'Kisah Nabi Idris',
        content: `Nabi Idris (alaihissalam) adalah salah satu nabi paling awal setelah Adam. Beliau berasal dari keturunan Syits (Shith) putra Adam, dan Allah menganugerahinya ilmu yang luas dan hikmah yang agung.

Idris adalah orang pertama yang menulis dengan pena, dan orang pertama yang menjahit dan mengenakan pakaian - orang-orang sebelumnya memakai kulit binatang. Beliau mengajarkan umatnya menulis, matematika, dan astronomi.

Beliau menyeru kaumnya untuk menyembah Allah saja dan meninggalkan penyembahan berhala. Sebagian beriman sementara yang lain menolak. Beliau tetap sabar meskipun mendapat gangguan dari kaumnya dan terus menjalankan misinya.

Allah mengangkat Idris ke tempat yang tinggi sebagaimana firman-Nya: "Dan Kami angkat dia ke tempat yang tinggi." Beliau adalah orang yang jujur, sabar, dan tekun dalam ibadah dan zikir.

Idris disebutkan dalam Al-Quran dalam Surah Maryam: "Dan ceritakanlah kisah Idris di dalam Kitab. Sesungguhnya dia adalah seorang yang sangat membenarkan dan seorang nabi. Dan Kami telah mengangkatnya ke tempat yang tinggi."`,
        lessons: [
          'Ilmu dan pembelajaran adalah sifat para nabi',
          'Kesabaran dalam berdakwah meskipun ada kesulitan',
          'Allah mengangkat derajat orang-orang saleh',
        ],
      },
      tr: {
        title: 'Hz. İdris\'in Kıssası',
        content: `Hz. İdris (aleyhisselam), Adem'den sonraki ilk peygamberlerden biriydi. Adem'in oğlu Şit'in soyundandı ve Allah ona geniş ilim ve büyük hikmet verdi.

İdris, kalemle yazan ilk kişiydi ve elbise dikip giyen ilk kişiydi - önceki insanlar hayvan derileri giyerdi. Kavmine yazı, matematik ve astronomi öğretti.

Kavmini yalnız Allah'a ibadet etmeye ve putlara tapmayı bırakmaya çağırdı. Bazıları iman etti, bazıları reddetti. Kavminin eziyetine rağmen sabırlı kaldı ve görevine devam etti.

Allah, İdris'i yüce bir makama yükseltti: "Onu yüce bir mekâna yükselttik." O, doğru sözlü, sabırlı ve ibadete düşkün biriydi.

İdris, Kur'an'da Meryem Suresi'nde anılır: "Kitapta İdris'i de an. Gerçekten o, dosdoğru bir peygamberdi. Onu yüce bir makama yükselttik."`,
        lessons: [
          'İlim ve öğrenme peygamberlerin sıfatlarındandır',
          'Zorluklara rağmen hakka davette sabır',
          'Allah salihlerin derecelerini yükseltir',
        ],
      },
    },
  },
  {
    id: 'nuh',
    name: { ar: 'نوح', en: 'Noah', fr: 'Noé', ur: 'نوح', id: 'Nuh', tr: 'Nuh' },
    era: 'قبل الطوفان',
    order: 3,
    stories: {
      ar: {
        title: 'قصة نوح عليه السلام والطوفان العظيم',
        content: `نوح عليه السلام هو أول رسول أرسله الله إلى أهل الأرض بعد أن انتشر الشرك والفساد. دعا قومه ألف سنة إلا خمسين عاماً كما ذكر القرآن.

بذل نوح جهوداً عظيمة في دعوة قومه، فكان يدعوهم ليلاً ونهاراً، سراً وجهراً، ولكنهم أصروا على كفرهم واستكبارهم.

لما يئس نوح من إيمان قومه، دعا الله عليهم فاستجاب الله دعاءه. أمر الله نوحاً أن يصنع السفينة، وكان قومه يسخرون منه كلما مروا عليه.

عندما جاء أمر الله وفار التنور، حمل نوح في السفينة من كل زوجين اثنين ومن آمن معه وكانوا قليلاً. لم يؤمن ابنه وزوجته فكانا من الهالكين.

أغرق الله الكافرين بالطوفان العظيم، ونجّى نوحاً ومن معه. استوت السفينة على جبل الجودي، وبدأت البشرية من جديد من نسل نوح عليه السلام.`,
        lessons: [
          'الصبر على الدعوة مهما طالت المدة',
          'النسب لا ينفع بدون الإيمان',
          'الله ينصر أولياءه مهما قل عددهم',
          'الاستهزاء بالدين عاقبته وخيمة',
        ],
      },
      'ar-eg': {
        title: 'حكاية سيدنا نوح والطوفان العظيم',
        content: `سيدنا نوح عليه السلام هو أول رسول بعته ربنا لأهل الأرض بعد ما الشرك والفساد انتشروا. فضل يدعي قومه ألف سنة إلا خمسين سنة زي ما القرآن قال.

سيدنا نوح بذل مجهود كبير في دعوة قومه، كان بيدعيهم بالليل والنهار، في السر والعلن، بس هم أصروا على كفرهم وتكبرهم.

لما سيدنا نوح يئس من إيمان قومه، دعا ربنا عليهم وربنا استجاب. ربنا أمر نوح يصنع السفينة، وقومه كانوا بيتريقوا عليه كل ما يعدوا من جنبه.

لما جه أمر ربنا وفار التنور، نوح حمل في السفينة من كل نوع زوجين واللي آمنوا معاه وكانوا قليلين. ابنه ومراته ما آمنوش فكانوا من الهالكين.

ربنا غرّق الكفار بالطوفان العظيم، ونجّى نوح واللي معاه. السفينة استقرت على جبل الجودي، والبشرية بدأت من جديد من نسل نوح عليه السلام.`,
        lessons: [
          'الصبر على الدعوة مهما طالت المدة',
          'القرابة مش هتنفع من غير إيمان',
          'ربنا بينصر أولياءه مهما كانوا قليلين',
          'الاستهزاء بالدين عاقبته وحشة',
        ],
      },
      en: {
        title: 'The Story of Prophet Noah and the Great Flood',
        content: `Prophet Noah (peace be upon him) was the first messenger sent by Allah to the people of Earth after polytheism and corruption had spread. He called his people for 950 years as mentioned in the Quran.

Noah made tremendous efforts in calling his people. He would call them night and day, secretly and openly, but they persisted in their disbelief and arrogance.

When Noah despaired of his people's faith, he prayed to Allah against them and Allah answered his prayer. Allah commanded Noah to build the ark, and his people would mock him whenever they passed by.

When Allah's command came and the oven overflowed, Noah carried in the ark a pair from every species and those who believed with him - they were few. His son and wife did not believe and were among those who perished.

Allah drowned the disbelievers with the great flood and saved Noah and those with him. The ark settled on Mount Judi, and humanity began anew from Noah's descendants.`,
        lessons: [
          'Patience in calling to truth regardless of duration',
          'Lineage does not benefit without faith',
          'Allah supports His allies no matter how few',
          'Mocking religion has dire consequences',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Noé et le Grand Déluge',
        content: `Le Prophète Noé (paix sur lui) fut le premier messager envoyé par Allah aux habitants de la Terre après que le polythéisme et la corruption se soient répandus. Il a appelé son peuple pendant 950 ans comme mentionné dans le Coran.

Noé a fait d'énormes efforts pour appeler son peuple. Il les appelait nuit et jour, secrètement et ouvertement, mais ils ont persisté dans leur mécréance et leur arrogance.

Quand Noé a désespéré de la foi de son peuple, il a prié Allah contre eux et Allah a exaucé sa prière. Allah a ordonné à Noé de construire l'arche, et son peuple se moquait de lui chaque fois qu'ils passaient.

Quand le commandement d'Allah est venu et que le four a débordé, Noé a embarqué dans l'arche un couple de chaque espèce et ceux qui avaient cru avec lui - ils étaient peu nombreux. Son fils et sa femme n'ont pas cru et ont péri.

Allah a noyé les mécréants par le grand déluge et a sauvé Noé et ceux qui étaient avec lui. L'arche s'est posée sur le mont Judi, et l'humanité a recommencé à partir des descendants de Noé.`,
        lessons: [
          'Patience dans l\'appel à la vérité quelle que soit la durée',
          'La lignée ne profite pas sans la foi',
          'Allah soutient Ses alliés peu importe leur nombre',
          'Se moquer de la religion a des conséquences graves',
        ],
      },
      ur: {
        title: 'حضرت نوح علیہ السلام اور عظیم طوفان کی کہانی',
        content: `حضرت نوح علیہ السلام پہلے رسول تھے جنہیں اللہ نے زمین کے لوگوں کی طرف بھیجا جب شرک اور فساد پھیل گیا تھا۔ انہوں نے اپنی قوم کو 950 سال تک دعوت دی جیسا کہ قرآن میں ذکر ہے۔

نوح نے اپنی قوم کو بلانے میں بہت محنت کی۔ وہ رات دن، خفیہ اور کھلے عام انہیں بلاتے رہے، لیکن وہ اپنے کفر اور تکبر پر قائم رہے۔

جب نوح اپنی قوم کے ایمان سے مایوس ہوئے، تو انہوں نے اللہ سے ان کے خلاف دعا کی اور اللہ نے قبول فرمایا۔ اللہ نے نوح کو کشتی بنانے کا حکم دیا، اور جب بھی ان کی قوم گزرتی وہ مذاق اڑاتے۔

جب اللہ کا حکم آیا اور تنور ابل پڑا، نوح نے کشتی میں ہر نوع کا ایک جوڑا اور ایمان لانے والوں کو سوار کیا - وہ کم تھے۔ ان کا بیٹا اور بیوی ایمان نہ لائے اور ہلاک ہونے والوں میں شامل تھے۔

اللہ نے کافروں کو عظیم طوفان سے غرق کیا اور نوح اور ان کے ساتھیوں کو بچایا۔ کشتی جبل جودی پر ٹھہری، اور نوح کی نسل سے انسانیت نے نئی شروعات کی۔`,
        lessons: [
          'حق کی دعوت میں صبر چاہے کتنا ہی وقت لگے',
          'نسب ایمان کے بغیر فائدہ نہیں دیتا',
          'اللہ اپنے دوستوں کی مدد کرتا ہے چاہے وہ کم ہوں',
          'دین کا مذاق اڑانے کا انجام برا ہے',
        ],
      },
      id: {
        title: 'Kisah Nabi Nuh dan Banjir Besar',
        content: `Nabi Nuh (alaihissalam) adalah rasul pertama yang diutus Allah kepada penduduk bumi setelah kemusyrikan dan kerusakan menyebar. Beliau menyeru kaumnya selama 950 tahun sebagaimana disebutkan dalam Al-Quran.

Nuh berusaha keras dalam menyeru kaumnya. Beliau menyeru mereka siang malam, secara rahasia dan terang-terangan, tetapi mereka tetap dalam kekufuran dan kesombongan mereka.

Ketika Nuh berputus asa dari keimanan kaumnya, beliau berdoa kepada Allah melawan mereka dan Allah mengabulkan doanya. Allah memerintahkan Nuh untuk membangun bahtera, dan kaumnya mengejeknya setiap kali mereka lewat.

Ketika perintah Allah datang dan dapur meluap, Nuh mengangkut dalam bahtera sepasang dari setiap jenis dan orang-orang yang beriman bersamanya - mereka sedikit. Putra dan istrinya tidak beriman dan termasuk yang binasa.

Allah menenggelamkan orang-orang kafir dengan banjir besar dan menyelamatkan Nuh dan orang-orang bersamanya. Bahtera berlabuh di Gunung Judi, dan umat manusia dimulai kembali dari keturunan Nuh.`,
        lessons: [
          'Kesabaran dalam berdakwah berapa pun lamanya',
          'Nasab tidak bermanfaat tanpa iman',
          'Allah mendukung wali-Nya walau sedikit jumlahnya',
          'Mengejek agama berakibat buruk',
        ],
      },
      tr: {
        title: 'Hz. Nuh\'un Kıssası ve Büyük Tufan',
        content: `Hz. Nuh (aleyhisselam), şirk ve bozgunculuk yayıldıktan sonra Allah'ın yeryüzü insanlarına gönderdiği ilk rasuldür. Kur'an'da belirtildiği gibi 950 yıl kavmini davet etti.

Nuh, kavmini çağırmakta büyük çaba gösterdi. Onları gece gündüz, gizli ve açık çağırıyordu ama onlar küfür ve kibirlerinde ısrar ettiler.

Nuh kavminin imanından ümidini kesince, Allah'a onlara karşı dua etti ve Allah duasını kabul etti. Allah, Nuh'a gemiyi yapmasını emretti ve kavmi her geçtiklerinde onunla alay ediyorlardı.

Allah'ın emri gelip tandır kaynadığında, Nuh gemiye her türden bir çift ve onunla birlikte iman edenleri aldı - sayıları azdı. Oğlu ve karısı iman etmedi ve helak olanlardan oldular.

Allah, kafirleri büyük tufanla boğdu ve Nuh'u ve beraberindekileri kurtardı. Gemi Cudi Dağı'na oturdu ve insanlık Nuh'un soyundan yeniden başladı.`,
        lessons: [
          'Ne kadar uzun sürerse sürsün davette sabır',
          'Soy, iman olmadan fayda vermez',
          'Allah, az da olsalar dostlarına yardım eder',
          'Dinle alay etmenin sonu kötüdür',
        ],
      },
    },
  },
  {
    id: 'ibrahim',
    name: { ar: 'إبراهيم', en: 'Abraham', fr: 'Abraham', ur: 'ابراہیم', id: 'Ibrahim', tr: 'İbrahim' },
    era: 'بابل والعراق',
    order: 4,
    stories: {
      ar: {
        title: 'قصة إبراهيم عليه السلام - خليل الله',
        content: `إبراهيم عليه السلام هو خليل الرحمن، أبو الأنبياء، ولد في بابل بالعراق في قوم يعبدون الأصنام والكواكب.

منذ صغره بدأ إبراهيم يتفكر في خلق السماوات والأرض، فنظر إلى الكوكب فقال هذا ربي، فلما أفل قال لا أحب الآفلين، ثم رأى القمر ثم الشمس وكلما أفلا علم أنها ليست بآلهة.

تحدى إبراهيم أباه وقومه في عبادة الأصنام، وحطم الأصنام وترك كبيرهم ليسألوه. غضب قومه وقرروا إحراقه، لكن الله جعل النار برداً وسلاماً عليه.

هاجر إبراهيم مع زوجته سارة وابن أخيه لوط. رُزق بإسماعيل من هاجر ثم بإسحاق من سارة. أُمر بذبح إسماعيل فلما همّ بذلك فداه الله بذبح عظيم.

بنى إبراهيم وإسماعيل الكعبة المشرفة، ودعا الله أن يبعث في ذريته رسولاً فاستجاب الله وبعث محمداً صلى الله عليه وسلم من ذريته.`,
        lessons: [
          'استخدام العقل للوصول إلى الحق',
          'التوكل على الله في مواجهة الباطل',
          'الاستسلام لأمر الله مهما كان صعباً',
          'الدعاء للذرية بالصلاح',
        ],
      },
      'ar-eg': {
        title: 'حكاية سيدنا إبراهيم عليه السلام - خليل الله',
        content: `سيدنا إبراهيم عليه السلام هو خليل الرحمن، أبو الأنبياء، اتولد في بابل في العراق وسط ناس بيعبدوا الأصنام والكواكب.

من وهو صغير إبراهيم ابتدى يفكر في خلق السماء والأرض، بص على الكوكب وقال ده ربي، ولما غرب قال أنا مش بحب اللي بيغيبوا، وبعدين شاف القمر والشمس وكل ما يغيبوا عرف إنهم مش آلهة.

إبراهيم تحدى أبوه وقومه في عبادة الأصنام، وكسّر الأصنام وسابلهم الكبير عشان يسألوه. قومه زعلوا وقرروا يحرقوه، بس ربنا خلّى النار تبقى برد وسلام عليه.

إبراهيم هاجر مع مراته سارة وابن أخوه لوط. ربنا رزقه بإسماعيل من هاجر وبعدين إسحاق من سارة. ربنا أمره يدبح إسماعيل، ولما همّ يدبحه ربنا فداه بذبح عظيم.

إبراهيم وإسماعيل بنوا الكعبة، ودعا ربنا يبعت في ذريته رسول، وربنا استجاب وبعت محمد صلى الله عليه وسلم من ذريته.`,
        lessons: [
          'استخدم عقلك عشان توصل للحق',
          'توكل على ربنا في مواجهة الباطل',
          'سلّم لأمر ربنا مهما كان صعب',
          'ادعي لولادك بالصلاح',
        ],
      },
      en: {
        title: 'The Story of Prophet Abraham - Friend of Allah',
        content: `Prophet Abraham (peace be upon him) is the Friend of the Most Merciful, Father of the Prophets. He was born in Babylon, Iraq, among people who worshipped idols and celestial bodies.

From his youth, Abraham pondered the creation of the heavens and earth. He looked at a star and said "This is my Lord," but when it set he said "I do not love things that set." Then he saw the moon and sun, and each time they set, he knew they were not gods.

Abraham challenged his father and people in their idol worship. He smashed the idols and left the largest one so they could ask it. His people became angry and decided to burn him, but Allah made the fire cool and safe for him.

Abraham migrated with his wife Sarah and his nephew Lot. He was blessed with Ishmael from Hagar, then Isaac from Sarah. He was commanded to sacrifice Ishmael, but when he was about to do so, Allah ransomed him with a great sacrifice.

Abraham and Ishmael built the Holy Kaaba, and he prayed that Allah send a messenger from his descendants. Allah answered and sent Muhammad (peace be upon him) from his lineage.`,
        lessons: [
          'Using reason to reach the truth',
          'Trusting Allah when facing falsehood',
          'Submitting to Allah\'s command however difficult',
          'Praying for righteous offspring',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Abraham - Ami d\'Allah',
        content: `Le Prophète Abraham (paix sur lui) est l'Ami du Très Miséricordieux, le Père des Prophètes. Il est né à Babylone, en Irak, parmi un peuple qui adorait les idoles et les astres.

Dès sa jeunesse, Abraham méditait sur la création des cieux et de la terre. Il regarda une étoile et dit « Voilà mon Seigneur », mais quand elle disparut, il dit « Je n'aime pas les choses qui disparaissent. » Puis il vit la lune et le soleil, et chaque fois qu'ils disparaissaient, il sut qu'ils n'étaient pas des dieux.

Abraham défia son père et son peuple dans leur adoration des idoles. Il brisa les idoles et laissa la plus grande pour qu'ils puissent l'interroger. Son peuple se mit en colère et décida de le brûler, mais Allah rendit le feu frais et paisible pour lui.

Abraham émigra avec son épouse Sarah et son neveu Lot. Il fut béni d'Ismaël de Hagar, puis d'Isaac de Sarah. Il reçut l'ordre de sacrifier Ismaël, mais quand il s'apprêtait à le faire, Allah le racheta avec un grand sacrifice.

Abraham et Ismaël construisirent la Sainte Kaaba, et il pria Allah d'envoyer un messager parmi ses descendants. Allah exauça et envoya Muhammad (paix sur lui) de sa lignée.`,
        lessons: [
          'Utiliser la raison pour atteindre la vérité',
          'Faire confiance à Allah face au mensonge',
          'Se soumettre à l\'ordre d\'Allah même si c\'est difficile',
          'Prier pour une descendance pieuse',
        ],
      },
      ur: {
        title: 'حضرت ابراہیم علیہ السلام کی کہانی - خلیل اللہ',
        content: `حضرت ابراہیم علیہ السلام رحمٰن کے خلیل اور انبیاء کے باپ ہیں۔ وہ عراق کے شہر بابل میں پیدا ہوئے جہاں لوگ بتوں اور ستاروں کی پوجا کرتے تھے۔

بچپن سے ہی ابراہیم آسمانوں اور زمین کی تخلیق پر غور کرتے تھے۔ انہوں نے ایک ستارے کو دیکھا اور کہا "یہ میرا رب ہے" لیکن جب وہ ڈوب گیا تو کہا "میں ڈوبنے والوں کو پسند نہیں کرتا۔" پھر انہوں نے چاند اور سورج دیکھا، اور جب بھی وہ غائب ہوتے، جان لیتے کہ یہ خدا نہیں ہیں۔

ابراہیم نے اپنے والد اور قوم کو بت پرستی میں چیلنج کیا۔ انہوں نے بت توڑ دیے اور بڑے بت کو چھوڑ دیا تاکہ اس سے پوچھیں۔ قوم ناراض ہوئی اور انہیں جلانے کا فیصلہ کیا، لیکن اللہ نے آگ کو ٹھنڈا اور سلامتی بنا دیا۔

ابراہیم اپنی بیوی سارہ اور بھتیجے لوط کے ساتھ ہجرت کر گئے۔ انہیں ہاجرہ سے اسماعیل اور سارہ سے اسحاق کی نعمت ملی۔ انہیں اسماعیل کو قربان کرنے کا حکم ملا، لیکن جب وہ کرنے لگے تو اللہ نے ایک بڑی قربانی سے فدیہ دیا۔

ابراہیم اور اسماعیل نے کعبہ تعمیر کیا، اور دعا کی کہ ان کی نسل میں رسول بھیجے۔ اللہ نے قبول کیا اور محمد صلی اللہ علیہ وسلم کو ان کی نسل سے بھیجا۔`,
        lessons: [
          'حق تک پہنچنے کے لیے عقل کا استعمال',
          'باطل کا سامنا کرتے ہوئے اللہ پر توکل',
          'اللہ کے حکم کی تعمیل چاہے مشکل ہو',
          'اولاد کے لیے نیکی کی دعا',
        ],
      },
      id: {
        title: 'Kisah Nabi Ibrahim - Kekasih Allah',
        content: `Nabi Ibrahim (alaihissalam) adalah Kekasih Yang Maha Penyayang, Bapak Para Nabi. Beliau lahir di Babilonia, Irak, di tengah kaum yang menyembah berhala dan benda-benda langit.

Sejak muda, Ibrahim merenungi penciptaan langit dan bumi. Ia melihat bintang dan berkata "Inilah Tuhanku," tetapi ketika bintang itu tenggelam ia berkata "Aku tidak suka yang tenggelam." Kemudian ia melihat bulan dan matahari, dan setiap kali tenggelam, ia tahu mereka bukan tuhan.

Ibrahim menentang ayah dan kaumnya dalam penyembahan berhala. Ia menghancurkan berhala-berhala dan meninggalkan yang terbesar agar mereka bisa bertanya kepadanya. Kaumnya marah dan memutuskan untuk membakarnya, tetapi Allah menjadikan api itu sejuk dan selamat baginya.

Ibrahim berhijrah bersama istrinya Sarah dan keponakannya Luth. Ia dikaruniai Ismail dari Hajar, kemudian Ishaq dari Sarah. Ia diperintahkan untuk menyembelih Ismail, tetapi ketika akan melakukannya, Allah menebusnya dengan sembelihan yang agung.

Ibrahim dan Ismail membangun Ka'bah, dan ia berdoa agar Allah mengutus seorang rasul dari keturunannya. Allah mengabulkan dan mengutus Muhammad (shallallahu alaihi wasallam) dari keturunannya.`,
        lessons: [
          'Menggunakan akal untuk mencapai kebenaran',
          'Bertawakkal kepada Allah saat menghadapi kebatilan',
          'Tunduk pada perintah Allah walau sulit',
          'Mendoakan keturunan yang saleh',
        ],
      },
      tr: {
        title: 'Hz. İbrahim\'in Kıssası - Allah\'ın Dostu',
        content: `Hz. İbrahim (aleyhisselam), Rahman'ın Halil'i (dostu) ve Peygamberlerin Babasıdır. Putlara ve gök cisimlerine tapan bir toplumda, Irak'ın Babil şehrinde doğdu.

İbrahim, gençliğinden itibaren göklerin ve yerin yaratılışını düşünürdü. Bir yıldıza baktı ve "Bu benim Rabbim" dedi, ama batınca "Ben batanları sevmem" dedi. Sonra ayı ve güneşi gördü ve her battıklarında bunların tanrı olmadığını anladı.

İbrahim, babasına ve kavmine put ibadetinde meydan okudu. Putları kırdı ve sorabilsinler diye en büyüğünü bıraktı. Kavmi öfkelendi ve onu yakmaya karar verdi, ama Allah ateşi onun için serin ve selamet kıldı.

İbrahim, eşi Sara ve yeğeni Lut ile hicret etti. Hacer'den İsmail, Sara'dan İshak ile nimetlendi. İsmail'i kurban etmesi emredildi ama yapacakken Allah onu büyük bir kurbanla fidye kıldı.

İbrahim ve İsmail Kabe'yi inşa etti ve soyundan bir peygamber göndermesi için Allah'a dua etti. Allah kabul etti ve soyundan Muhammed'i (sallallahu aleyhi ve sellem) gönderdi.`,
        lessons: [
          'Hakikate ulaşmak için aklı kullanmak',
          'Batıla karşı Allah\'a tevekkül etmek',
          'Ne kadar zor olsa da Allah\'ın emrine teslim olmak',
          'Salih nesil için dua etmek',
        ],
      },
    },
  },
  {
    id: 'yusuf',
    name: { ar: 'يوسف', en: 'Joseph', fr: 'Joseph', ur: 'یوسف', id: 'Yusuf', tr: 'Yusuf' },
    era: 'مصر',
    order: 5,
    stories: {
      ar: {
        title: 'قصة يوسف عليه السلام - أحسن القصص',
        content: `يوسف عليه السلام ابن يعقوب ابن إسحاق ابن إبراهيم. رأى في منامه أحد عشر كوكباً والشمس والقمر يسجدون له، فأخبر أباه فحذره من إخوته.

حسد إخوة يوسف أخاهم لمحبة أبيهم له، فتآمروا عليه وألقوه في الجب، وأخبروا أباهم أن الذئب أكله.

التقطته قافلة وباعوه في مصر لعزيز مصر. راودته امرأة العزيز عن نفسه فاستعصم، فألقي في السجن ظلماً.

في السجن فسّر رؤيا للملك فأخرجه وجعله على خزائن الأرض. جاء إخوته يطلبون الطعام فعرفهم ولم يعرفوه.

بعد أحداث كثيرة اعترف إخوته بخطئهم وجاء أبواه وإخوته وخروا له سجداً تحقيقاً لرؤياه. عفا يوسف عن إخوته وقال: "لا تثريب عليكم اليوم يغفر الله لكم".`,
        lessons: [
          'الصبر على البلاء يعقبه الفرج',
          'العفو عند المقدرة من شيم الكرام',
          'الحسد يؤدي إلى الظلم والندم',
          'الله يحفظ عباده الصالحين',
        ],
      },
      en: {
        title: 'The Story of Prophet Joseph - The Best of Stories',
        content: `Prophet Joseph (peace be upon him) was the son of Jacob, son of Isaac, son of Abraham. He saw in a dream eleven stars, the sun, and the moon prostrating to him. He told his father, who warned him about his brothers.

Joseph's brothers were jealous of him because of their father's love for him. They conspired against him, threw him into a well, and told their father that a wolf had eaten him.

A caravan picked him up and sold him in Egypt to the Aziz (chief minister). The Aziz's wife tried to seduce him, but he resisted, and was unjustly imprisoned.

In prison, he interpreted a dream for the king, who released him and made him in charge of the storehouses. His brothers came seeking food; he recognized them but they did not recognize him.

After many events, his brothers admitted their mistake, and his parents and brothers came and prostrated to him, fulfilling his dream. Joseph forgave his brothers saying: "No blame upon you today. May Allah forgive you."`,
        lessons: [
          'Patience through trials leads to relief',
          'Forgiveness when able is a noble trait',
          'Jealousy leads to injustice and regret',
          'Allah protects His righteous servants',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Joseph - Le Plus Beau des Récits',
        content: `Le Prophète Joseph (paix sur lui) était le fils de Jacob, fils d'Isaac, fils d'Abraham. Il vit en rêve onze étoiles, le soleil et la lune se prosterner devant lui. Il en parla à son père qui le mit en garde contre ses frères.

Les frères de Joseph étaient jaloux de lui à cause de l'amour de leur père pour lui. Ils complotèrent contre lui, le jetèrent dans un puits et dirent à leur père qu'un loup l'avait mangé.

Une caravane le recueillit et le vendit en Égypte au ministre. La femme du ministre tenta de le séduire, mais il résista et fut injustement emprisonné.

En prison, il interpréta un rêve pour le roi, qui le libéra et le mit en charge des réserves. Ses frères vinrent chercher de la nourriture ; il les reconnut mais eux ne le reconnurent pas.

Après de nombreux événements, ses frères reconnurent leur erreur, et ses parents et frères vinrent se prosterner devant lui, réalisant son rêve. Joseph pardonna à ses frères en disant : « Pas de reproche sur vous aujourd'hui. Qu'Allah vous pardonne. »`,
        lessons: [
          'La patience dans les épreuves mène au soulagement',
          'Le pardon quand on peut est une noble qualité',
          'La jalousie mène à l\'injustice et au regret',
          'Allah protège Ses serviteurs pieux',
        ],
      },
      ur: {
        title: 'حضرت یوسف علیہ السلام کی کہانی - احسن القصص',
        content: `حضرت یوسف علیہ السلام یعقوب کے بیٹے تھے، جو اسحاق کے بیٹے تھے، جو ابراہیم کے بیٹے تھے۔ انہوں نے خواب میں گیارہ ستارے، سورج اور چاند کو اپنے سامنے سجدہ کرتے دیکھا۔ انہوں نے والد کو بتایا جنہوں نے بھائیوں سے خبردار کیا۔

یوسف کے بھائی ان سے حسد کرتے تھے کیونکہ والد انہیں زیادہ محبت کرتے تھے۔ انہوں نے سازش کی، انہیں کنویں میں پھینک دیا، اور والد کو بتایا کہ بھیڑیے نے کھا لیا۔

ایک قافلے نے انہیں اٹھایا اور مصر میں عزیز کو بیچ دیا۔ عزیز کی بیوی نے انہیں بہکانے کی کوشش کی، لیکن انہوں نے انکار کیا اور ناحق قید کیے گئے۔

جیل میں انہوں نے بادشاہ کا خواب تعبیر کیا، جس نے انہیں رہا کیا اور خزانوں کا انچارج بنایا۔ بھائی کھانا لینے آئے؛ یوسف نے پہچان لیا لیکن انہوں نے نہیں پہچانا۔

کئی واقعات کے بعد، بھائیوں نے غلطی مانی، اور والدین اور بھائی آئے اور سجدہ کیا، خواب پورا ہوا۔ یوسف نے معاف کیا اور کہا: "آج تم پر کوئی ملامت نہیں۔ اللہ تمہیں معاف کرے۔"`,
        lessons: [
          'آزمائشوں میں صبر راحت لاتا ہے',
          'طاقت ہونے پر معافی بزرگوں کی صفت ہے',
          'حسد ظلم اور پچھتاوے کی طرف لے جاتا ہے',
          'اللہ اپنے نیک بندوں کی حفاظت کرتا ہے',
        ],
      },
      id: {
        title: 'Kisah Nabi Yusuf - Sebaik-baik Kisah',
        content: `Nabi Yusuf (alaihissalam) adalah putra Ya'qub, putra Ishaq, putra Ibrahim. Ia bermimpi melihat sebelas bintang, matahari, dan bulan bersujud kepadanya. Ia memberitahu ayahnya yang memperingatkannya tentang saudara-saudaranya.

Saudara-saudara Yusuf iri padanya karena cinta ayah mereka kepadanya. Mereka berkomplot melawannya, melemparkannya ke dalam sumur, dan memberitahu ayah mereka bahwa serigala telah memakannya.

Sebuah kafilah menemukannya dan menjualnya di Mesir kepada Al-Aziz. Istri Al-Aziz mencoba merayunya, tetapi ia menolak dan dipenjara secara tidak adil.

Di penjara, ia menafsirkan mimpi untuk raja, yang membebaskannya dan menjadikannya penguasa gudang. Saudara-saudaranya datang mencari makanan; ia mengenali mereka tetapi mereka tidak mengenalinya.

Setelah banyak peristiwa, saudara-saudaranya mengakui kesalahan mereka, dan orang tua serta saudara-saudaranya datang bersujud kepadanya, menggenapi mimpinya. Yusuf memaafkan saudara-saudaranya: "Tidak ada cercaan atas kalian hari ini. Semoga Allah mengampuni kalian."`,
        lessons: [
          'Kesabaran dalam ujian membawa kelegaan',
          'Memaafkan saat mampu adalah sifat mulia',
          'Iri hati membawa ketidakadilan dan penyesalan',
          'Allah melindungi hamba-hamba-Nya yang saleh',
        ],
      },
      tr: {
        title: 'Hz. Yusuf\'un Kıssası - Kıssaların En Güzeli',
        content: `Hz. Yusuf (aleyhisselam), İbrahim'in oğlu İshak'ın oğlu Yakup'un oğluydu. Rüyasında on bir yıldız, güneş ve ayın kendisine secde ettiğini gördü. Babasına anlattı, babası kardeşleri hakkında onu uyardı.

Yusuf'un kardeşleri, babalarının onu sevmesi yüzünden kıskandılar. Ona komplo kurdular, kuyuya attılar ve babalarına kurt yedi dediler.

Bir kervan onu aldı ve Mısır'da Aziz'e sattı. Aziz'in karısı onu baştan çıkarmaya çalıştı ama o direndi ve haksız yere hapse atıldı.

Hapishanede kral için rüya yorumladı, kral onu serbest bırakıp hazinelerin başına getirdi. Kardeşleri yiyecek aramaya geldiler; onları tanıdı ama onlar tanımadı.

Birçok olaydan sonra kardeşleri hatalarını kabul etti, anne babası ve kardeşleri gelip secde ettiler, rüyası gerçekleşti. Yusuf kardeşlerini affetti: "Bugün size kınama yok. Allah sizi affetsin."`,
        lessons: [
          'Sıkıntılarda sabır rahata götürür',
          'Güç varken affetmek asil bir özelliktir',
          'Kıskançlık zulme ve pişmanlığa yol açar',
          'Allah salih kullarını korur',
        ],
      },
    },
  },
  {
    id: 'musa',
    name: { ar: 'موسى', en: 'Moses', fr: 'Moïse', ur: 'موسیٰ', id: 'Musa', tr: 'Musa' },
    era: 'مصر وسيناء',
    order: 6,
    stories: {
      ar: {
        title: 'قصة موسى عليه السلام - كليم الله',
        content: `موسى عليه السلام هو كليم الله، ولد في مصر في زمن فرعون الذي كان يقتل أبناء بني إسرائيل. ألهم الله أم موسى أن تضعه في تابوت وتلقيه في اليم.

التقطه آل فرعون، فربّته امرأة فرعون آسية. كبر موسى في قصر فرعون، وذات يوم وجد رجلاً من بني إسرائيل يتقاتل مع مصري، فوكز المصري فمات، ففر إلى مدين.

في مدين تزوج من ابنة الرجل الصالح ومكث عنده عشر سنين. في طريق عودته رأى ناراً فذهب إليها فكلمه الله من الشجرة وأعطاه المعجزات.

عاد موسى إلى فرعون يدعوه إلى الله، فاستكبر فرعون. أنزل الله الآيات والعقوبات ولكن فرعون لم يؤمن. أمر الله موسى بالخروج ببني إسرائيل ليلاً.

لحقهم فرعون وجنوده، ففلق الله البحر لموسى وقومه وأغرق فرعون وجنوده. قال فرعون عند الغرق: "آمنت أنه لا إله إلا الذي آمنت به بنو إسرائيل" لكن كان متأخراً.`,
        lessons: [
          'الله يحفظ أولياءه من كيد الأعداء',
          'التوكل على الله في أشد المواقف',
          'الظالم مهما علا سيهلك',
          'التوبة عند الموت لا تنفع',
        ],
      },
      en: {
        title: 'The Story of Prophet Moses - The One Who Spoke to Allah',
        content: `Prophet Moses (peace be upon him) is the one whom Allah spoke to directly. He was born in Egypt during Pharaoh's time, who was killing the sons of Israel. Allah inspired Moses's mother to place him in a chest and cast it in the river.

Pharaoh's family found him, and Pharaoh's wife Asiya raised him. Moses grew up in Pharaoh's palace. One day he found a man from Israel fighting an Egyptian, struck the Egyptian who died, and fled to Midian.

In Midian he married the daughter of a righteous man and stayed ten years. On his return journey, he saw a fire and went to it. Allah spoke to him from the tree and gave him miracles.

Moses returned to Pharaoh calling him to Allah, but Pharaoh was arrogant. Allah sent signs and punishments, but Pharaoh did not believe. Allah commanded Moses to leave with Israel by night.

Pharaoh and his army pursued them. Allah parted the sea for Moses and his people and drowned Pharaoh and his army. Pharaoh said while drowning: "I believe there is no god except the one Israel believed in" - but it was too late.`,
        lessons: [
          'Allah protects His allies from enemies\' plots',
          'Trust in Allah in the most difficult situations',
          'Oppressors will perish no matter how powerful',
          'Repentance at death does not benefit',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Moïse - Celui qui a Parlé à Allah',
        content: `Le Prophète Moïse (paix sur lui) est celui à qui Allah a parlé directement. Il est né en Égypte à l'époque de Pharaon, qui tuait les fils d'Israël. Allah a inspiré la mère de Moïse de le mettre dans un coffre et de le jeter dans le fleuve.

La famille de Pharaon l'a trouvé, et Asiya, la femme de Pharaon, l'a élevé. Moïse a grandi dans le palais de Pharaon. Un jour, il a trouvé un homme d'Israël se battant avec un Égyptien, a frappé l'Égyptien qui est mort, et s'est enfui à Madian.

À Madian, il a épousé la fille d'un homme pieux et est resté dix ans. Sur le chemin du retour, il a vu un feu et s'en est approché. Allah lui a parlé depuis l'arbre et lui a donné des miracles.

Moïse est retourné vers Pharaon l'appelant à Allah, mais Pharaon était arrogant. Allah a envoyé des signes et des châtiments, mais Pharaon n'a pas cru. Allah a ordonné à Moïse de partir avec Israël de nuit.

Pharaon et son armée les ont poursuivis. Allah a fendu la mer pour Moïse et son peuple et a noyé Pharaon et son armée. Pharaon a dit en se noyant : « Je crois qu'il n'y a pas de dieu sauf celui en qui Israël croit » - mais c'était trop tard.`,
        lessons: [
          'Allah protège Ses alliés des complots des ennemis',
          'Faire confiance à Allah dans les situations les plus difficiles',
          'Les oppresseurs périront peu importe leur puissance',
          'Le repentir à la mort ne profite pas',
        ],
      },
      ur: {
        title: 'حضرت موسیٰ علیہ السلام کی کہانی - کلیم اللہ',
        content: `حضرت موسیٰ علیہ السلام وہ ہیں جن سے اللہ نے براہ راست کلام کیا۔ وہ مصر میں فرعون کے زمانے میں پیدا ہوئے جو بنی اسرائیل کے بیٹوں کو قتل کرتا تھا۔ اللہ نے موسیٰ کی ماں کو الہام کیا کہ اسے صندوق میں رکھ کر دریا میں ڈال دے۔

فرعون کے گھر والوں نے اسے پایا، اور فرعون کی بیوی آسیہ نے پالا۔ موسیٰ فرعون کے محل میں پلے بڑھے۔ ایک دن انہوں نے بنی اسرائیل کے آدمی کو مصری سے لڑتے دیکھا، مصری کو مارا جو مر گیا، اور مدین بھاگ گئے۔

مدین میں انہوں نے ایک نیک آدمی کی بیٹی سے شادی کی اور دس سال رہے۔ واپسی پر انہوں نے آگ دیکھی اور گئے۔ اللہ نے درخت سے کلام کیا اور معجزے عطا کیے۔

موسیٰ فرعون کے پاس اللہ کی طرف بلانے لوٹے، لیکن فرعون متکبر تھا۔ اللہ نے نشانیاں اور عذاب بھیجے، لیکن فرعون نے ایمان نہیں لایا۔ اللہ نے موسیٰ کو حکم دیا کہ رات کو بنی اسرائیل کو لے کر نکلیں۔

فرعون اور لشکر نے پیچھا کیا۔ اللہ نے سمندر چیر دیا اور فرعون کو غرق کیا۔ فرعون نے ڈوبتے ہوئے کہا: "میں ایمان لایا کہ کوئی معبود نہیں سوائے جس پر بنی اسرائیل ایمان لائے" - لیکن دیر ہو چکی تھی۔`,
        lessons: [
          'اللہ اپنے دوستوں کو دشمنوں کی سازشوں سے بچاتا ہے',
          'مشکل ترین حالات میں اللہ پر توکل',
          'ظالم کتنا بھی طاقتور ہو ہلاک ہوگا',
          'موت کے وقت توبہ فائدہ نہیں دیتی',
        ],
      },
      id: {
        title: 'Kisah Nabi Musa - Yang Berbicara dengan Allah',
        content: `Nabi Musa (alaihissalam) adalah yang Allah berbicara langsung kepadanya. Beliau lahir di Mesir pada zaman Firaun yang membunuh anak laki-laki Bani Israil. Allah mengilhami ibu Musa untuk menaruhnya dalam peti dan melemparkannya ke sungai.

Keluarga Firaun menemukannya, dan istri Firaun Asiyah membesarkannya. Musa besar di istana Firaun. Suatu hari ia melihat seorang Bani Israil berkelahi dengan orang Mesir, memukul orang Mesir yang mati, dan melarikan diri ke Madyan.

Di Madyan ia menikahi putri seorang pria saleh dan tinggal sepuluh tahun. Dalam perjalanan pulang, ia melihat api dan menghampirinya. Allah berbicara kepadanya dari pohon dan memberinya mukjizat.

Musa kembali kepada Firaun menyerunya kepada Allah, tetapi Firaun sombong. Allah mengirim tanda-tanda dan hukuman, tetapi Firaun tidak beriman. Allah memerintahkan Musa pergi bersama Bani Israil di malam hari.

Firaun dan pasukannya mengejar. Allah membelah laut untuk Musa dan kaumnya dan menenggelamkan Firaun dan pasukannya. Firaun berkata saat tenggelam: "Aku beriman tidak ada tuhan kecuali yang Bani Israil imani" - tetapi sudah terlambat.`,
        lessons: [
          'Allah melindungi wali-Nya dari tipu daya musuh',
          'Bertawakkal kepada Allah dalam situasi paling sulit',
          'Penindas akan binasa walau sekuat apapun',
          'Taubat saat kematian tidak bermanfaat',
        ],
      },
      tr: {
        title: 'Hz. Musa\'nın Kıssası - Allah\'ın Kelim\'i',
        content: `Hz. Musa (aleyhisselam), Allah'ın doğrudan konuştuğu kişidir. İsrailoğullarının erkek çocuklarını öldüren Firavun döneminde Mısır'da doğdu. Allah, Musa'nın annesine onu sandığa koyup nehre bırakmasını ilham etti.

Firavun ailesi onu buldu ve Firavun'un karısı Asiye yetiştirdi. Musa Firavun'un sarayında büyüdü. Bir gün İsrailden biriyle Mısırlının kavga ettiğini gördü, Mısırlıyı vurdu öldü ve Medyen'e kaçtı.

Medyen'de salih bir adamın kızıyla evlendi ve on yıl kaldı. Dönüş yolunda ateş gördü ve gitti. Allah ağaçtan konuştu ve mucizeler verdi.

Musa, Firavun'a Allah'a davet için döndü ama Firavun kibirlendi. Allah ayetler ve cezalar gönderdi ama Firavun iman etmedi. Allah, Musa'ya İsrailoğullarıyla gece çıkmasını emretti.

Firavun ve ordusu takip etti. Allah denizi Musa ve kavmi için yardı, Firavun'u ve ordusunu boğdu. Firavun boğulurken dedi: "İsrailoğullarının iman ettiğinden başka ilah olmadığına iman ettim" - ama çok geçti.`,
        lessons: [
          'Allah dostlarını düşmanların tuzaklarından korur',
          'En zor durumlarda Allah\'a tevekkül',
          'Zalim ne kadar güçlü olursa olsun helak olur',
          'Ölüm anında tövbe fayda vermez',
        ],
      },
    },
  },
  {
    id: 'isa',
    name: { ar: 'عيسى', en: 'Jesus', fr: 'Jésus', ur: 'عیسیٰ', id: 'Isa', tr: 'İsa' },
    era: 'فلسطين',
    order: 7,
    stories: {
      ar: {
        title: 'قصة عيسى عليه السلام - روح الله',
        content: `عيسى عليه السلام هو كلمة الله وروح منه، ولد من مريم العذراء بدون أب بمعجزة إلهية. جاءه جبريل وبشرها بغلام زكي.

تكلم عيسى في المهد دفاعاً عن أمه، وقال: "إني عبد الله آتاني الكتاب وجعلني نبياً". كانت هذه أولى معجزاته.

أعطاه الله معجزات كثيرة: يخلق من الطين كهيئة الطير فينفخ فيه فيكون طيراً، ويبرئ الأكمه والأبرص ويحيي الموتى بإذن الله.

دعا عيسى بني إسرائيل إلى عبادة الله وحده وترك ما حرّفوه من التوراة. آمن به الحواريون وكفر كثيرون.

أراد اليهود قتله فرفعه الله إليه ولم يُصلب. سيعود عيسى آخر الزمان فيكسر الصليب ويقتل الخنزير ويحكم بشريعة محمد صلى الله عليه وسلم.`,
        lessons: [
          'الله قادر على كل شيء',
          'المعجزات تأتي لتأييد الأنبياء',
          'عيسى عبد الله ورسوله وليس إلهاً',
          'التمسك بالحق رغم المعارضة',
        ],
      },
      en: {
        title: 'The Story of Prophet Jesus - The Spirit of Allah',
        content: `Prophet Jesus (peace be upon him) is Allah's Word and Spirit from Him, born to the Virgin Mary without a father through divine miracle. Gabriel came to her with glad tidings of a pure son.

Jesus spoke in the cradle defending his mother, saying: "Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet." This was his first miracle.

Allah gave him many miracles: he would create from clay the form of a bird and breathe into it and it would become a bird, heal the blind and lepers, and bring the dead to life by Allah's permission.

Jesus called the Children of Israel to worship Allah alone and leave what they had distorted from the Torah. The disciples believed in him, but many rejected.

The Jews wanted to kill him, but Allah raised him up and he was not crucified. Jesus will return at the end of time, break the cross, kill the swine, and rule by the law of Muhammad (peace be upon him).`,
        lessons: [
          'Allah is capable of all things',
          'Miracles come to support the prophets',
          'Jesus is a servant and messenger of Allah, not a god',
          'Holding to truth despite opposition',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Jésus - L\'Esprit d\'Allah',
        content: `Le Prophète Jésus (paix sur lui) est la Parole d'Allah et un Esprit venant de Lui, né de la Vierge Marie sans père par miracle divin. Gabriel est venu à elle avec la bonne nouvelle d'un fils pur.

Jésus a parlé au berceau pour défendre sa mère, disant : « Je suis vraiment le serviteur d'Allah. Il m'a donné le Livre et fait de moi un prophète. » C'était son premier miracle.

Allah lui a donné de nombreux miracles : il créait de l'argile la forme d'un oiseau, soufflait dedans et il devenait oiseau, guérissait l'aveugle-né et les lépreux, et ramenait les morts à la vie par la permission d'Allah.

Jésus a appelé les Enfants d'Israël à adorer Allah seul et à abandonner ce qu'ils avaient falsifié de la Torah. Les disciples ont cru en lui, mais beaucoup ont rejeté.

Les Juifs voulaient le tuer, mais Allah l'a élevé vers Lui et il n'a pas été crucifié. Jésus reviendra à la fin des temps, brisera la croix, tuera le porc et gouvernera selon la loi de Muhammad (paix sur lui).`,
        lessons: [
          'Allah est capable de toute chose',
          'Les miracles viennent pour soutenir les prophètes',
          'Jésus est un serviteur et messager d\'Allah, pas un dieu',
          'S\'accrocher à la vérité malgré l\'opposition',
        ],
      },
      ur: {
        title: 'حضرت عیسیٰ علیہ السلام کی کہانی - روح اللہ',
        content: `حضرت عیسیٰ علیہ السلام اللہ کا کلمہ اور اس کی روح ہیں، کنواری مریم سے بغیر باپ کے الٰہی معجزے سے پیدا ہوئے۔ جبریل ان کے پاس آئے اور پاکیزہ بیٹے کی خوشخبری دی۔

عیسیٰ نے گہوارے میں اپنی ماں کا دفاع کرتے ہوئے بات کی: "بیشک میں اللہ کا بندہ ہوں۔ اس نے مجھے کتاب دی اور نبی بنایا۔" یہ ان کا پہلا معجزہ تھا۔

اللہ نے انہیں بہت سے معجزے دیے: وہ مٹی سے پرندے کی شکل بناتے، پھونکتے اور وہ پرندہ بن جاتا، اندھے اور کوڑھی کو شفا دیتے، اور اللہ کی اجازت سے مردوں کو زندہ کرتے۔

عیسیٰ نے بنی اسرائیل کو صرف اللہ کی عبادت کی دعوت دی اور تورات میں تحریف چھوڑنے کو کہا۔ حواریوں نے ایمان لایا، لیکن بہتوں نے انکار کیا۔

یہودی انہیں قتل کرنا چاہتے تھے، لیکن اللہ نے انہیں اٹھا لیا اور صلیب نہیں دی گئی۔ عیسیٰ آخر زمانے میں واپس آئیں گے، صلیب توڑیں گے، خنزیر ماریں گے، اور محمد صلی اللہ علیہ وسلم کی شریعت سے حکم کریں گے۔`,
        lessons: [
          'اللہ ہر چیز پر قادر ہے',
          'معجزے انبیاء کی تائید کے لیے آتے ہیں',
          'عیسیٰ اللہ کے بندے اور رسول ہیں، خدا نہیں',
          'مخالفت کے باوجود حق پر ثابت قدم رہنا',
        ],
      },
      id: {
        title: 'Kisah Nabi Isa - Ruh Allah',
        content: `Nabi Isa (alaihissalam) adalah Kalimat Allah dan Ruh dari-Nya, lahir dari Perawan Maryam tanpa ayah melalui mukjizat ilahi. Jibril datang kepadanya dengan kabar gembira tentang putra yang suci.

Isa berbicara di buaian membela ibunya, berkata: "Sesungguhnya aku adalah hamba Allah. Dia telah memberiku Kitab dan menjadikanku nabi." Ini adalah mukjizat pertamanya.

Allah memberinya banyak mukjizat: ia menciptakan dari tanah liat bentuk burung dan meniupnya menjadi burung, menyembuhkan orang buta dan kusta, dan menghidupkan orang mati dengan izin Allah.

Isa menyeru Bani Israil untuk menyembah Allah saja dan meninggalkan apa yang telah mereka selewengkan dari Taurat. Para murid beriman kepadanya, tetapi banyak yang menolak.

Yahudi ingin membunuhnya, tetapi Allah mengangkatnya dan ia tidak disalibkan. Isa akan kembali di akhir zaman, mematahkan salib, membunuh babi, dan memerintah dengan syariat Muhammad (shallallahu alaihi wasallam).`,
        lessons: [
          'Allah Mahakuasa atas segala sesuatu',
          'Mukjizat datang untuk mendukung para nabi',
          'Isa adalah hamba dan utusan Allah, bukan tuhan',
          'Berpegang pada kebenaran meski ada penentangan',
        ],
      },
      tr: {
        title: 'Hz. İsa\'nın Kıssası - Ruhullah',
        content: `Hz. İsa (aleyhisselam), Allah'ın Kelimesi ve O'ndan bir Ruhtur, ilahi mucize ile babasız olarak Bakire Meryem'den doğdu. Cebrail ona temiz bir oğul müjdesiyle geldi.

İsa beşikte annesini savunarak konuştu: "Şüphesiz ben Allah'ın kuluyum. O bana Kitab verdi ve beni peygamber yaptı." Bu ilk mucizesiydi.

Allah ona birçok mucize verdi: çamurdan kuş şekli yapar, üflerdi kuş olurdu, körleri ve cüzzamlıları iyileştirir, Allah'ın izniyle ölüleri diriltirdi.

İsa, İsrailoğullarını yalnız Allah'a ibadete ve Tevrat'tan bozdukları şeyleri bırakmaya çağırdı. Havariler iman etti ama birçoğu reddetti.

Yahudiler onu öldürmek istedi ama Allah onu yükseltti ve çarmıha gerilmedi. İsa ahir zamanda dönecek, haçı kıracak, domuzu öldürecek ve Muhammed'in (sallallahu aleyhi ve sellem) şeriatıyla hükmedecek.`,
        lessons: [
          'Allah her şeye kadirdir',
          'Mucizeler peygamberleri desteklemek için gelir',
          'İsa Allah\'ın kulu ve elçisidir, tanrı değil',
          'Muhalefete rağmen hakka sarılmak',
        ],
      },
    },
  },
  {
    id: 'muhammad',
    name: { ar: 'محمد', en: 'Muhammad', fr: 'Muhammad', ur: 'محمد', id: 'Muhammad', tr: 'Muhammed' },
    era: 'مكة والمدينة',
    order: 8,
    stories: {
      ar: {
        title: 'قصة محمد صلى الله عليه وسلم - خاتم الأنبياء',
        content: `محمد صلى الله عليه وسلم هو خاتم الأنبياء والمرسلين، ولد في مكة المكرمة عام الفيل. توفي والده قبل ولادته وتوفيت أمه وهو صغير فكفله جده ثم عمه أبو طالب.

عُرف بالصادق الأمين قبل النبوة. بُعث نبياً وهو في الأربعين من عمره في غار حراء عندما جاءه جبريل بأول آيات القرآن: "اقرأ باسم ربك الذي خلق".

دعا قومه سراً ثلاث سنوات ثم جهراً. أوذي وأصحابه أشد الأذى، حتى هاجروا إلى الحبشة ثم إلى المدينة المنورة.

في المدينة أسس الدولة الإسلامية، وخاض غزوات لنصرة الدين. فتح مكة صلحاً، وحجّ حجة الوداع وخطب فيها خطبته الشهيرة.

توفي صلى الله عليه وسلم وهو في الثالثة والستين من عمره بعد أن أكمل الله به الدين: "اليوم أكملت لكم دينكم وأتممت عليكم نعمتي ورضيت لكم الإسلام ديناً".`,
        lessons: [
          'الصبر والثبات في الدعوة إلى الله',
          'الأخلاق الحسنة أساس الدعوة',
          'الهجرة في سبيل الله عند الضرورة',
          'القدوة الحسنة في جميع جوانب الحياة',
        ],
      },
      en: {
        title: 'The Story of Prophet Muhammad - Seal of the Prophets',
        content: `Prophet Muhammad (peace be upon him) is the Seal of the Prophets and Messengers, born in Mecca in the Year of the Elephant. His father died before his birth and his mother when he was young, so his grandfather then his uncle Abu Talib raised him.

He was known as the Truthful and Trustworthy before prophethood. He was appointed prophet at forty in the Cave of Hira when Gabriel brought the first verses: "Read in the name of your Lord who created."

He called his people secretly for three years then openly. He and his companions faced severe persecution until they migrated to Abyssinia then Medina.

In Medina he established the Islamic state and fought battles to support the religion. He conquered Mecca peacefully, performed the Farewell Pilgrimage and delivered his famous sermon.

He died at sixty-three after Allah completed the religion through him: "Today I have perfected your religion for you, completed My favor upon you, and approved Islam as your religion."`,
        lessons: [
          'Patience and steadfastness in calling to Allah',
          'Good character is the foundation of calling to Islam',
          'Migration for Allah\'s sake when necessary',
          'Being a good example in all aspects of life',
        ],
      },
      fr: {
        title: 'L\'Histoire du Prophète Muhammad - Sceau des Prophètes',
        content: `Le Prophète Muhammad (paix sur lui) est le Sceau des Prophètes et des Messagers, né à La Mecque l'Année de l'Éléphant. Son père est mort avant sa naissance et sa mère quand il était jeune, alors son grand-père puis son oncle Abu Talib l'ont élevé.

Il était connu comme le Véridique et le Digne de Confiance avant la prophétie. Il fut désigné prophète à quarante ans dans la grotte de Hira quand Gabriel apporta les premiers versets : « Lis au nom de ton Seigneur qui a créé. »

Il appela son peuple secrètement pendant trois ans puis ouvertement. Lui et ses compagnons ont subi de sévères persécutions jusqu'à leur migration en Abyssinie puis à Médine.

À Médine, il a établi l'État islamique et mené des batailles pour soutenir la religion. Il a conquis La Mecque pacifiquement, accompli le Pèlerinage d'Adieu et prononcé son célèbre sermon.

Il est mort à soixante-trois ans après qu'Allah ait complété la religion par lui : « Aujourd'hui J'ai parachevé pour vous votre religion, complété Mon bienfait sur vous et agréé l'Islam comme religion pour vous. »`,
        lessons: [
          'Patience et constance dans l\'appel à Allah',
          'Le bon caractère est le fondement de l\'appel à l\'Islam',
          'L\'émigration pour Allah quand nécessaire',
          'Être un bon exemple dans tous les aspects de la vie',
        ],
      },
      ur: {
        title: 'نبی محمد صلی اللہ علیہ وسلم کی کہانی - خاتم الانبیاء',
        content: `نبی محمد صلی اللہ علیہ وسلم انبیاء اور رسولوں کے خاتم ہیں، عام الفیل میں مکہ میں پیدا ہوئے۔ والد پیدائش سے پہلے اور والدہ بچپن میں وفات پا گئیں، پھر دادا اور چچا ابو طالب نے پالا۔

نبوت سے پہلے صادق اور امین کے نام سے معروف تھے۔ چالیس سال کی عمر میں غار حرا میں نبی مقرر ہوئے جب جبریل پہلی آیات لائے: "پڑھو اپنے رب کے نام سے جس نے پیدا کیا۔"

تین سال خفیہ پھر علانیہ دعوت دی۔ آپ اور صحابہ کو شدید ایذا دی گئی یہاں تک کہ حبشہ پھر مدینہ ہجرت کی۔

مدینہ میں اسلامی ریاست قائم کی اور دین کی مدد کے لیے غزوات لڑے۔ مکہ فتح کیا، حجة الوداع ادا کیا اور مشہور خطبہ دیا۔

تریسٹھ سال کی عمر میں وفات پائی جب اللہ نے دین مکمل کیا: "آج میں نے تمہارے لیے دین مکمل کر دیا، اپنی نعمت پوری کر دی اور اسلام کو تمہارے لیے دین پسند کیا۔"`,
        lessons: [
          'اللہ کی طرف دعوت میں صبر اور ثابت قدمی',
          'اچھا کردار دعوت کی بنیاد ہے',
          'ضرورت پڑنے پر اللہ کی خاطر ہجرت',
          'زندگی کے ہر پہلو میں اچھا نمونہ بننا',
        ],
      },
      id: {
        title: 'Kisah Nabi Muhammad - Penutup Para Nabi',
        content: `Nabi Muhammad (shallallahu alaihi wasallam) adalah Penutup Para Nabi dan Rasul, lahir di Mekah pada Tahun Gajah. Ayahnya wafat sebelum kelahirannya dan ibunya saat ia masih kecil, maka kakek lalu pamannya Abu Thalib yang membesarkannya.

Beliau dikenal sebagai Al-Amin (yang terpercaya) sebelum kenabian. Diangkat sebagai nabi pada usia empat puluh di Gua Hira ketika Jibril membawa ayat-ayat pertama: "Bacalah dengan nama Tuhanmu yang menciptakan."

Beliau menyeru kaumnya secara rahasia selama tiga tahun lalu terang-terangan. Beliau dan para sahabat menghadapi penganiayaan berat sampai hijrah ke Habasyah lalu Madinah.

Di Madinah beliau mendirikan negara Islam dan berperang untuk membela agama. Menaklukkan Mekah secara damai, menunaikan Haji Wada' dan menyampaikan khutbahnya yang terkenal.

Beliau wafat pada usia enam puluh tiga setelah Allah menyempurnakan agama melalui beliau: "Pada hari ini telah Aku sempurnakan agamamu untukmu, dan telah Aku cukupkan nikmat-Ku bagimu, dan telah Aku ridai Islam sebagai agamamu."`,
        lessons: [
          'Kesabaran dan keteguhan dalam berdakwah kepada Allah',
          'Akhlak yang baik adalah dasar dakwah',
          'Hijrah di jalan Allah ketika diperlukan',
          'Menjadi teladan yang baik dalam segala aspek kehidupan',
        ],
      },
      tr: {
        title: 'Hz. Muhammed\'in Kıssası - Peygamberlerin Sonuncusu',
        content: `Hz. Muhammed (sallallahu aleyhi ve sellem) Peygamberlerin Sonuncusu ve Mühürüdür, Fil Yılı'nda Mekke'de doğdu. Babası doğumundan önce, annesi küçükken vefat etti, dedesi sonra amcası Ebu Talib yetiştirdi.

Peygamberlikten önce Sadık ve Emin olarak bilinirdi. Kırk yaşında Hira Mağarası'nda Cebrail ilk ayetleri getirdiğinde peygamber olarak görevlendirildi: "Yaratan Rabbinin adıyla oku."

Üç yıl gizlice sonra açıkça davet etti. O ve sahabeleri Habeşistan'a sonra Medine'ye hicret edene kadar şiddetli zulme maruz kaldılar.

Medine'de İslam devletini kurdu ve dini desteklemek için savaşlar yaptı. Mekke'yi barışla fethetti, Veda Haccı'nı yaptı ve meşhur hutbesini verdi.

Altmış üç yaşında Allah dini tamamladığında vefat etti: "Bugün sizin için dininizi kemale erdirdim, üzerinizdeki nimetimi tamamladım ve sizin için din olarak İslam'ı seçtim."`,
        lessons: [
          'Allah\'a davette sabır ve sebat',
          'Güzel ahlak davetin temelidir',
          'Gerektiğinde Allah yolunda hicret',
          'Hayatın her alanında güzel örnek olmak',
        ],
      },
    },
  },
  {
    id: 'hud',
    name: { ar: 'هود', en: 'Hud', fr: 'Houd', ur: 'ہود', id: 'Hud', tr: 'Hud' },
    era: 'قوم عاد',
    order: 9,
    stories: {
      ar: {
        title: 'قصة هود عليه السلام مع قوم عاد',
        content: `هود عليه السلام أُرسل إلى قوم عاد الذين سكنوا الأحقاف في جنوب الجزيرة العربية. كانوا أقوياء البنية، بنوا المباني العالية والقصور الفخمة.

كفر قوم عاد بالله وعبدوا الأصنام، وتجبروا في الأرض. دعاهم هود إلى عبادة الله وحده وترك الأصنام، لكنهم كذبوه واستهزأوا به.

قالوا لهود: "ما نحن بتاركي آلهتنا عن قولك وما نحن لك بمؤمنين". واستمروا في طغيانهم وظلمهم.

أهلك الله قوم عاد بريح صرصر عاتية، سخرها عليهم سبع ليال وثمانية أيام حسوماً. كانت الريح تحمل الناس وترميهم كأنهم أعجاز نخل خاوية.

نجّى الله هوداً والذين آمنوا معه، وجعلهم عبرة للمعتبرين.`,
        lessons: [
          'القوة المادية لا تنفع بدون الإيمان',
          'الطغيان سبب الهلاك',
          'الله ينصر أنبياءه ويهلك المكذبين',
          'التكبر على الرسل عاقبته وخيمة',
        ],
      },
      en: {
        title: 'The Story of Prophet Hud and the People of Aad',
        content: `Prophet Hud (peace be upon him) was sent to the people of Aad who lived in Al-Ahqaf in southern Arabia. They were physically powerful, building tall structures and magnificent palaces.

The people of Aad disbelieved in Allah and worshipped idols, becoming tyrants on earth. Hud called them to worship Allah alone and abandon idols, but they rejected and mocked him.

They said: "We will not abandon our gods for what you say, and we will never believe you." They continued in their tyranny and oppression.

Allah destroyed the people of Aad with a furious violent wind, which He imposed on them for seven nights and eight days. The wind would pick people up and throw them down like hollow palm trunks.

Allah saved Hud and those who believed with him, making them a lesson for those who reflect.`,
        lessons: [
          'Material power is useless without faith',
          'Tyranny leads to destruction',
          'Allah supports His prophets and destroys the deniers',
          'Arrogance towards messengers has dire consequences',
        ],
      },
    },
  },
  {
    id: 'salih',
    name: { ar: 'صالح', en: 'Salih', fr: 'Salih', ur: 'صالح', id: 'Shalih', tr: 'Salih' },
    era: 'قوم ثمود',
    order: 10,
    stories: {
      ar: {
        title: 'قصة صالح عليه السلام مع قوم ثمود',
        content: `صالح عليه السلام أُرسل إلى قوم ثمود الذين سكنوا في منطقة الحِجر شمال الجزيرة العربية. كانوا ينحتون الجبال بيوتاً ويبنون القصور في السهول.

دعا صالح قومه إلى عبادة الله وحده، فكذبوه وطلبوا منه آية. أخرج الله لهم ناقة من الصخر معجزة لهم، وأمرهم ألا يمسوها بسوء.

قال صالح لقومه: "هذه ناقة الله لكم آية فذروها تأكل في أرض الله ولا تمسوها بسوء فيأخذكم عذاب أليم".

لكن قومه عقروا الناقة وتحدوا أمر الله. توعدهم صالح بالعذاب بعد ثلاثة أيام.

جاءتهم الصيحة فأهلكتهم أجمعين، وأصبحوا في ديارهم جاثمين. نجّى الله صالحاً والمؤمنين.`,
        lessons: [
          'المعجزات لا تنفع القوم العنيدين',
          'تحدي أوامر الله يجلب الهلاك',
          'الله يمهل ولا يهمل',
          'الإيمان سبب النجاة',
        ],
      },
      en: {
        title: 'The Story of Prophet Salih and the People of Thamud',
        content: `Prophet Salih (peace be upon him) was sent to the people of Thamud who lived in the Al-Hijr region of northern Arabia. They carved houses out of mountains and built palaces in the plains.

Salih called his people to worship Allah alone, but they rejected him and demanded a sign. Allah brought forth a she-camel from a rock as a miracle, commanding them not to harm it.

Salih told his people: "This is Allah's she-camel, a sign for you. Let her graze on Allah's earth and do not touch her with harm, lest a painful punishment seize you."

But his people hamstrung the she-camel and defied Allah's command. Salih warned them of punishment in three days.

The blast came upon them and destroyed them all, leaving them fallen in their homes. Allah saved Salih and the believers.`,
        lessons: [
          'Miracles do not benefit stubborn people',
          'Defying Allah\'s commands brings destruction',
          'Allah gives respite but never neglects',
          'Faith is the cause of salvation',
        ],
      },
    },
  },
  {
    id: 'lut',
    name: { ar: 'لوط', en: 'Lot', fr: 'Loth', ur: 'لوط', id: 'Luth', tr: 'Lut' },
    era: 'سدوم',
    order: 11,
    stories: {
      ar: {
        title: 'قصة لوط عليه السلام مع قومه',
        content: `لوط عليه السلام ابن أخ إبراهيم عليه السلام، هاجر مع عمه ثم استقر في مدينة سدوم. كان أهل سدوم يرتكبون الفاحشة التي لم يسبقهم بها أحد من العالمين.

دعا لوط قومه إلى ترك هذه الفاحشة والتوبة إلى الله، لكنهم رفضوا وهددوه بالإخراج من المدينة.

جاءت الملائكة إلى لوط في صورة شباب حسان، فخاف عليهم من قومه. جاء قومه يريدون الضيوف، فعرض عليهم لوط بناته للزواج لكنهم رفضوا.

أخبرته الملائكة أنهم رسل الله وأمروه بالخروج مع أهله ليلاً، وألا يلتفت أحد منهم. امرأته كانت من الغابرين لأنها كانت تدل قومها على ضيوفه.

أمطر الله على قوم لوط حجارة من سجيل، وقلب مدينتهم عاليها سافلها، ونجّى لوطاً والمؤمنين معه.`,
        lessons: [
          'الفواحش سبب هلاك الأمم',
          'الصبر على دعوة القوم الفاسدين',
          'النجاة بالإيمان والطاعة',
          'مخالفة الأقارب إذا كانوا على باطل',
        ],
      },
      en: {
        title: 'The Story of Prophet Lot and His People',
        content: `Prophet Lot (peace be upon him) was the nephew of Abraham. He migrated with his uncle and settled in the city of Sodom. The people of Sodom committed an immorality unprecedented in the world.

Lot called his people to abandon this immorality and repent to Allah, but they refused and threatened to expel him from the city.

Angels came to Lot in the form of handsome young men. He feared for them from his people. His people came wanting the guests, but Lot offered his daughters in marriage and they refused.

The angels told him they were Allah's messengers and commanded him to leave with his family at night, and none should look back. His wife was among those destroyed because she would inform her people about his guests.

Allah rained upon the people of Lot stones of baked clay, turning their city upside down, and saved Lot and the believers with him.`,
        lessons: [
          'Immorality causes the destruction of nations',
          'Patience in calling corrupt people',
          'Salvation through faith and obedience',
          'Opposing relatives when they are upon falsehood',
        ],
      },
    },
  },
  {
    id: 'shuayb',
    name: { ar: 'شعيب', en: 'Shuayb', fr: 'Chouaïb', ur: 'شعیب', id: 'Syuaib', tr: 'Şuayb' },
    era: 'مدين',
    order: 12,
    stories: {
      ar: {
        title: 'قصة شعيب عليه السلام مع أهل مدين',
        content: `شعيب عليه السلام أُرسل إلى أهل مدين، وكانوا قوماً يبخسون الناس أشياءهم ويطففون في الميزان والمكيال.

دعاهم شعيب إلى عبادة الله وحده وإلى العدل في المعاملات. قال لهم: "أوفوا الكيل والميزان بالقسط ولا تبخسوا الناس أشياءهم".

رفض قومه دعوته وقالوا: "أصلاتك تأمرك أن نترك ما يعبد آباؤنا أو أن نفعل في أموالنا ما نشاء".

هددوه بالرجم والإخراج من القرية، لكنه صبر واستمر في دعوتهم. توعدهم بعذاب الله إن استمروا في غيهم.

أخذتهم الرجفة وأصبحوا في ديارهم جاثمين. نجّى الله شعيباً والذين آمنوا معه.`,
        lessons: [
          'العدل في المعاملات من أصول الدين',
          'الغش والتطفيف من كبائر الذنوب',
          'الصبر على أذى الدعوة',
          'ربط الدين بالمعاملات اليومية',
        ],
      },
      en: {
        title: 'The Story of Prophet Shuayb and the People of Midian',
        content: `Prophet Shuayb (peace be upon him) was sent to the people of Midian, who cheated people in their dealings and gave short measure and weight.

Shuayb called them to worship Allah alone and to be just in their dealings. He told them: "Give full measure and weight in justice and do not deprive people of their goods."

His people rejected his call and said: "Does your prayer command you that we leave what our fathers worshipped or that we do with our wealth whatever we please?"

They threatened him with stoning and expulsion from the village, but he remained patient and continued calling them. He warned them of Allah's punishment if they persisted.

The earthquake seized them and they lay fallen in their homes. Allah saved Shuayb and those who believed with him.`,
        lessons: [
          'Justice in dealings is fundamental to religion',
          'Cheating and giving short measure are major sins',
          'Patience in the face of persecution',
          'Religion is connected to daily transactions',
        ],
      },
    },
  },
  {
    id: 'ayyub',
    name: { ar: 'أيوب', en: 'Job', fr: 'Job', ur: 'ایوب', id: 'Ayyub', tr: 'Eyyub' },
    era: 'الشام',
    order: 13,
    stories: {
      ar: {
        title: 'قصة أيوب عليه السلام والصبر على البلاء',
        content: `أيوب عليه السلام كان نبياً صالحاً غنياً، له أولاد كثيرون ومال وفير وصحة جيدة. ابتلاه الله بلاء شديداً ليختبر صبره.

فقد أيوب ماله وأولاده، ثم أصابه مرض شديد في جسده. مكث سنوات طويلة في هذا البلاء، لكنه لم يشكُ إلا إلى الله.

تخلى عنه الناس إلا زوجته التي بقيت تخدمه وترعاه. كان أيوب يصبر ويحتسب ولا يتضجر من قضاء الله.

في النهاية دعا ربه: "أني مسني الضر وأنت أرحم الراحمين". فاستجاب الله له وأمره أن يركض برجله فنبعت عين ماء، اغتسل منها فشُفي.

رد الله إليه صحته وأهله ومثلهم معهم، وجعله مثالاً للصابرين. قال تعالى: "إنا وجدناه صابراً نعم العبد إنه أواب".`,
        lessons: [
          'الصبر على البلاء من علامات الإيمان',
          'البلاء اختبار للمؤمن وتكفير للذنوب',
          'الشكوى إلى الله وحده',
          'الفرج يأتي بعد الصبر',
        ],
      },
      en: {
        title: 'The Story of Prophet Job and Patience Through Trials',
        content: `Prophet Job (peace be upon him) was a righteous and wealthy prophet with many children, abundant wealth, and good health. Allah tested him with severe trials.

Job lost his wealth and children, then was struck with a severe illness. He remained in this condition for many years, but he complained only to Allah.

People abandoned him except his wife, who continued to serve and care for him. Job remained patient and sought reward from Allah without complaining about His decree.

Finally he called upon his Lord: "Indeed, adversity has touched me, and You are the Most Merciful of the merciful." Allah answered him and commanded him to strike the ground with his foot, and a spring gushed forth. He washed from it and was healed.

Allah restored his health, family, and doubled his blessings. He made him an example for the patient. Allah said: "Indeed, We found him patient, an excellent servant. Indeed, he was one repeatedly turning to Allah."`,
        lessons: [
          'Patience through trials is a sign of faith',
          'Trials test believers and expiate sins',
          'Complain only to Allah',
          'Relief comes after patience',
        ],
      },
    },
  },
  {
    id: 'yunus',
    name: { ar: 'يونس', en: 'Jonah', fr: 'Jonas', ur: 'یونس', id: 'Yunus', tr: 'Yunus' },
    era: 'نينوى',
    order: 14,
    stories: {
      ar: {
        title: 'قصة يونس عليه السلام وصاحب الحوت',
        content: `يونس عليه السلام أُرسل إلى أهل نينوى، فدعاهم إلى الله فكذبوه. غضب يونس وخرج من المدينة قبل أن يأذن له الله.

ركب يونس السفينة، فهاج البحر واضطربت السفينة. اقترعوا فخرجت القرعة على يونس، فألقوه في البحر.

التقمه الحوت بأمر الله، فبقي في بطنه يسبح الله ويستغفره. دعا في الظلمات: "لا إله إلا أنت سبحانك إني كنت من الظالمين".

استجاب الله دعاءه وأمر الحوت أن يلفظه على الساحل. كان سقيماً فأنبت الله عليه شجرة من يقطين تظلله وتحميه.

عاد يونس إلى قومه فوجدهم قد آمنوا، وكانوا مائة ألف أو يزيدون. متّعهم الله إلى حين.`,
        lessons: [
          'عدم اليأس من هداية الناس',
          'انتظار أمر الله قبل التصرف',
          'الاستغفار والتسبيح سبب النجاة',
          'الله يقبل توبة التائبين',
        ],
      },
      en: {
        title: 'The Story of Prophet Jonah - Companion of the Whale',
        content: `Prophet Jonah (peace be upon him) was sent to the people of Nineveh. He called them to Allah but they rejected him. Jonah became angry and left the city before Allah permitted him.

Jonah boarded a ship, but the sea became turbulent. They cast lots, and the lot fell on Jonah, so they threw him into the sea.

A whale swallowed him by Allah's command. He remained in its belly glorifying Allah and seeking forgiveness. He called out in the darkness: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers."

Allah answered his supplication and commanded the whale to cast him onto the shore. He was ill, so Allah caused a gourd tree to grow over him for shade and protection.

Jonah returned to his people and found they had believed - a hundred thousand or more. Allah granted them enjoyment for a time.`,
        lessons: [
          'Never despair of guiding people',
          'Wait for Allah\'s command before acting',
          'Seeking forgiveness and glorification cause salvation',
          'Allah accepts the repentance of those who repent',
        ],
      },
    },
  },
  {
    id: 'dawud',
    name: { ar: 'داود', en: 'David', fr: 'David', ur: 'داؤد', id: 'Daud', tr: 'Davud' },
    era: 'فلسطين',
    order: 15,
    stories: {
      ar: {
        title: 'قصة داود عليه السلام الملك النبي',
        content: `داود عليه السلام كان نبياً وملكاً على بني إسرائيل. أعطاه الله ملكاً عظيماً وعلماً وحكمة، وآتاه الزبور.

كان داود شجاعاً، قتل جالوت الجبار وهو شاب صغير. ألان الله له الحديد فكان يصنع الدروع والسلاح.

أوتي داود صوتاً جميلاً، فكان إذا سبّح سبّحت معه الجبال والطير. قال تعالى: "يا جبال أوّبي معه والطير".

كان داود يصوم يوماً ويفطر يوماً، وهو أحب الصيام إلى الله. وكان يقوم ثلث الليل.

حكم داود بين الناس بالعدل، وعلّمه الله فصل الخطاب. كان يعمل بيده ويأكل من كسب يده.`,
        lessons: [
          'الجمع بين النبوة والملك فضل من الله',
          'العمل باليد لا يتنافى مع المكانة',
          'تسخير المخلوقات للتسبيح',
          'الحكم بالعدل بين الناس',
        ],
      },
      en: {
        title: 'The Story of Prophet David - The King Prophet',
        content: `Prophet David (peace be upon him) was both a prophet and king over the Children of Israel. Allah granted him great kingdom, knowledge and wisdom, and gave him the Psalms.

David was brave - he killed the giant Goliath as a young man. Allah softened iron for him so he could craft armor and weapons.

David was blessed with a beautiful voice. When he glorified Allah, the mountains and birds would join him. Allah said: "O mountains, repeat the praises with him, and the birds."

David would fast one day and break his fast the next - this is the most beloved fasting to Allah. He would stand in prayer for a third of the night.

David judged between people with justice, and Allah taught him decisive speech. He worked with his own hands and ate from his earnings.`,
        lessons: [
          'Combining prophethood and kingship is a favor from Allah',
          'Manual labor does not contradict high status',
          'Creation joins in glorification of Allah',
          'Judging with justice between people',
        ],
      },
    },
  },
  {
    id: 'sulayman',
    name: { ar: 'سليمان', en: 'Solomon', fr: 'Salomon', ur: 'سلیمان', id: 'Sulaiman', tr: 'Süleyman' },
    era: 'فلسطين',
    order: 16,
    stories: {
      ar: {
        title: 'قصة سليمان عليه السلام ومملكته العظيمة',
        content: `سليمان عليه السلام ورث الملك والنبوة من أبيه داود. دعا الله أن يؤتيه ملكاً لا ينبغي لأحد من بعده، فاستجاب الله له.

سخّر الله له الريح تجري بأمره، والجن يعملون له ما يشاء من محاريب وتماثيل وجفان كالجواب. علّمه منطق الطير والحيوان.

قصة سليمان مع ملكة سبأ شهيرة. أرسل إليها يدعوها للإسلام، فجاءت بعرشها إليه بقدرة الله. أسلمت مع سليمان لله رب العالمين.

بنى سليمان بيت المقدس، وكانت الجن تعمل بين يديه. مات وهو متكئ على عصاه، ولم تعلم الجن بموته حتى أكلت الأرضة عصاه فخرّ.

قال تعالى: "ولسليمان الريح غدوها شهر ورواحها شهر وأسلنا له عين القطر".`,
        lessons: [
          'الملك والسلطان نعمة تستوجب الشكر',
          'استخدام القوة في طاعة الله',
          'الدعوة للإسلام بالحكمة',
          'التواضع مع عظم الملك',
        ],
      },
      en: {
        title: 'The Story of Prophet Solomon and His Great Kingdom',
        content: `Prophet Solomon (peace be upon him) inherited kingship and prophethood from his father David. He asked Allah to grant him a kingdom unlike any after him, and Allah answered.

Allah subjected the wind to Solomon's command, and the jinn worked for him - building sanctuaries, statues, and large basins. He was taught the language of birds and animals.

Solomon's story with the Queen of Sheba is famous. He invited her to Islam, and her throne was brought to him by Allah's power. She submitted to Allah, Lord of the worlds.

Solomon built the Temple in Jerusalem, with jinn working under his command. He died while leaning on his staff, and the jinn did not know of his death until termites ate through it and he collapsed.

Allah said: "And to Solomon the wind - its morning course was a month's journey and its evening course a month's journey. And We caused a spring of liquid copper to flow for him."`,
        lessons: [
          'Kingdom and authority require gratitude',
          'Using power in obedience to Allah',
          'Calling to Islam with wisdom',
          'Humility despite great kingdom',
        ],
      },
    },
  },
  {
    id: 'zakariya',
    name: { ar: 'زكريا', en: 'Zechariah', fr: 'Zacharie', ur: 'زکریا', id: 'Zakaria', tr: 'Zekeriya' },
    era: 'فلسطين',
    order: 17,
    stories: {
      ar: {
        title: 'قصة زكريا عليه السلام واستجابة الدعاء',
        content: `زكريا عليه السلام كان نبياً من أنبياء بني إسرائيل، وكان كفيل مريم أم عيسى. كان يدخل عليها المحراب فيجد عندها رزقاً.

بلغ زكريا من الكبر عتياً، وكانت امرأته عاقراً لا تلد. تمنى الولد ليرث منه النبوة والعلم.

دعا ربه دعاء خفياً: "رب إني وهن العظم مني واشتعل الرأس شيباً ولم أكن بدعائك رب شقياً".

استجاب الله دعاءه وبشّره بغلام اسمه يحيى، لم يجعل الله له من قبل سمياً. تعجب زكريا كيف يكون له ولد وهو كبير وامرأته عاقر.

جعل الله له آية ألا يكلم الناس ثلاث ليال سوياً. رُزق بيحيى وكان باراً تقياً.`,
        lessons: [
          'الله قادر على كل شيء',
          'لا يأس من رحمة الله',
          'الدعاء بإلحاح وخشوع',
          'الإيمان بقدرة الله فوق الأسباب',
        ],
      },
      en: {
        title: 'The Story of Prophet Zechariah and the Answered Prayer',
        content: `Prophet Zechariah (peace be upon him) was a prophet of the Children of Israel and the guardian of Mary, mother of Jesus. He would enter her chamber and find provision with her.

Zechariah had reached old age and his wife was barren. He wished for a child to inherit prophethood and knowledge from him.

He called upon his Lord in private supplication: "My Lord, indeed my bones have weakened and my head is filled with white hair, and I have never been in my supplication to You, my Lord, unhappy."

Allah answered his prayer and gave him glad tidings of a son named John - a name Allah had not given to anyone before. Zechariah wondered how he could have a child when he was old and his wife was barren.

Allah made a sign for him - that he should not speak to people for three nights. He was blessed with John, who was dutiful and righteous.`,
        lessons: [
          'Allah is capable of all things',
          'Never despair of Allah\'s mercy',
          'Supplicating with persistence and humility',
          'Faith in Allah\'s power beyond natural means',
        ],
      },
    },
  },
  {
    id: 'yahya',
    name: { ar: 'يحيى', en: 'John', fr: 'Jean', ur: 'یحییٰ', id: 'Yahya', tr: 'Yahya' },
    era: 'فلسطين',
    order: 18,
    stories: {
      ar: {
        title: 'قصة يحيى عليه السلام',
        content: `يحيى عليه السلام ابن زكريا، وُلد بمعجزة من أب شيخ كبير وأم عاقر. آتاه الله الحكم صبياً وكان نبياً منذ صغره.

كان يحيى حصوراً، أي عفيفاً لا يأتي النساء. وكان باراً بوالديه، لم يكن جباراً ولا عصياً.

عاش يحيى حياة زهد وتقوى، يأكل من ورق الشجر ويبكي من خشية الله. كان يدعو بني إسرائيل إلى التوبة والعودة إلى الله.

صدّق يحيى بعيسى عليه السلام وآمن به قبل أن يُبعث. كان من المقربين إلى الله.

قال تعالى: "يا يحيى خذ الكتاب بقوة وآتيناه الحكم صبياً، وحناناً من لدنا وزكاة وكان تقياً".`,
        lessons: [
          'الهداية منحة من الله',
          'بر الوالدين من أعظم القربات',
          'الزهد في الدنيا طريق الآخرة',
          'التصديق بالأنبياء والإيمان بهم',
        ],
      },
      en: {
        title: 'The Story of Prophet John',
        content: `Prophet John (peace be upon him) was the son of Zechariah, born miraculously to an elderly father and a barren mother. Allah granted him wisdom as a child and he was a prophet from youth.

John was chaste and abstinent. He was dutiful to his parents, neither arrogant nor disobedient.

John lived a life of asceticism and piety, eating leaves from trees and weeping from fear of Allah. He called the Children of Israel to repentance and return to Allah.

John believed in Jesus (peace be upon him) before he was sent as a prophet. He was among those close to Allah.

Allah said: "O John, take the Scripture with determination. And We gave him wisdom while yet a boy, and affection from Us and purity, and he was fearing of Allah."`,
        lessons: [
          'Guidance is a gift from Allah',
          'Honoring parents is among the greatest acts of worship',
          'Asceticism in this world is the path to the Hereafter',
          'Believing in and affirming the prophets',
        ],
      },
    },
  },
];

export const getStoryByLanguage = (prophetId: string, languageId: string): ProphetStory['stories'][string] | null => {
  const prophet = prophetStories.find(p => p.id === prophetId);
  if (!prophet) return null;
  
  // Try exact language match
  if (prophet.stories[languageId]) {
    return prophet.stories[languageId];
  }
  
  // Fallback to standard Arabic if dialect not found
  if (languageId.startsWith('ar-') && prophet.stories['ar']) {
    return prophet.stories['ar'];
  }
  
  // Fallback to Arabic
  return prophet.stories['ar'] || null;
};
