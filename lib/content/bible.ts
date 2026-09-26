/**
 * Every Scripture passage quoted anywhere on the site, in one place.
 *
 * TEXT SOURCE: the World English Bible (WEB), which is in the public domain,
 * fetched verbatim from bible-api.com. Two deliberate, disclosed adjustments:
 *   1. The WEB renders God's covenant name as "Yahweh". Most English Bibles
 *      (and most readers) know it as "the LORD", so those eight Old Testament
 *      verses use "the LORD" - the same choice the WEB's own British edition
 *      makes. The footer and the Scripture pages say so.
 *   2. Where a quotation starts or stops mid-sentence, the first letter is
 *      capitalised / a leading ellipsis added and trailing commas become full
 *      stops - standard practice for quoting a verse on its own.
 * No other wording is changed. Do NOT paste in text from copyrighted
 * translations (NIV, ESV, NLT...): quote WEB, and LINK to the others.
 */

export type Passage = {
  /** Display reference, e.g. "John 3:16". */
  ref: string;
  text: string;
  /** USFM book code + chapter for linking out, e.g. "JHN.3". */
  chapter: string;
};

const P = (ref: string, chapter: string, text: string): Passage => ({ ref, chapter, text });

export const BIBLE = {
  // --- Life after death -----------------------------------------------------
  "John 11:25-26": P("John 11:25–26", "JHN.11", "Jesus said to her, “I am the resurrection and the life. He who believes in me will still live, even if he dies. Whoever lives and believes in me will never die. Do you believe this?”"),
  "2 Corinthians 5:8": P("2 Corinthians 5:8", "2CO.5", "We are courageous, I say, and are willing rather to be absent from the body, and to be at home with the Lord."),
  "Philippians 1:21-23": P("Philippians 1:21–23", "PHP.1", "For to me to live is Christ, and to die is gain. But if I live on in the flesh, this will bring fruit from my work; yet I don’t know what I will choose. But I am in a dilemma between the two, having the desire to depart and be with Christ, which is far better."),
  "Luke 23:42-43": P("Luke 23:42–43", "LUK.23", "He said to Jesus, “Lord, remember me when you come into your Kingdom.” Jesus said to him, “Assuredly I tell you, today you will be with me in Paradise.”"),
  "Ecclesiastes 12:7": P("Ecclesiastes 12:7", "ECC.12", "…and the dust returns to the earth as it was, and the spirit returns to God who gave it."),
  "1 Corinthians 15:54-55": P("1 Corinthians 15:54–55", "1CO.15", "But when this perishable body will have become imperishable, and this mortal will have put on immortality, then what is written will happen: “Death is swallowed up in victory.” “Death, where is your sting? Hades, where is your victory?”"),
  "Hebrews 9:27": P("Hebrews 9:27", "HEB.9", "Inasmuch as it is appointed for men to die once, and after this, judgment."),
  "1 Thessalonians 4:13-14": P("1 Thessalonians 4:13–14", "1TH.4", "But we don’t want you to be ignorant, brothers, concerning those who have fallen asleep, so that you don’t grieve like the rest, who have no hope. For if we believe that Jesus died and rose again, even so God will bring with him those who have fallen asleep in Jesus."),
  "John 5:24": P("John 5:24", "JHN.5", "Most certainly I tell you, he who hears my word, and believes him who sent me, has eternal life, and doesn’t come into judgment, but has passed out of death into life."),

  // --- Heaven ----------------------------------------------------------------
  "John 14:2-3": P("John 14:2–3", "JHN.14", "In my Father’s house are many homes. If it weren’t so, I would have told you. I am going to prepare a place for you. If I go and prepare a place for you, I will come again, and will receive you to myself; that where I am, you may be there also."),
  "Revelation 21:3-4": P("Revelation 21:3–4", "REV.21", "I heard a loud voice out of heaven saying, “Behold, God’s dwelling is with people, and he will dwell with them, and they will be his people, and God himself will be with them as their God. He will wipe away every tear from their eyes. Death will be no more; neither will there be mourning, nor crying, nor pain, any more. The first things have passed away.”"),
  "Revelation 21:23": P("Revelation 21:23", "REV.21", "The city has no need for the sun, neither of the moon, to shine, for the very glory of God illuminated it, and its lamp is the Lamb."),
  "Revelation 22:5": P("Revelation 22:5", "REV.22", "There will be no night, and they need no lamp light; for the Lord God will illuminate them. They will reign forever and ever."),
  "1 Corinthians 2:9": P("1 Corinthians 2:9", "1CO.2", "But as it is written, “Things which an eye didn’t see, and an ear didn’t hear, which didn’t enter into the heart of man, these God has prepared for those who love him.”"),
  "Philippians 3:20-21": P("Philippians 3:20–21", "PHP.3", "For our citizenship is in heaven, from where we also wait for a Savior, the Lord Jesus Christ; who will change the body of our humiliation to be conformed to the body of his glory, according to the working by which he is able even to subject all things to himself."),
  "2 Corinthians 12:2-4": P("2 Corinthians 12:2–4", "2CO.12", "I know a man in Christ, fourteen years ago (whether in the body, I don’t know, or whether out of the body, I don’t know; God knows), such a one caught up into the third heaven. I know such a man (whether in the body, or outside of the body, I don’t know; God knows), how he was caught up into Paradise, and heard unspeakable words, which it is not lawful for a man to utter."),
  "Matthew 6:19-21": P("Matthew 6:19–21", "MAT.6", "Don’t lay up treasures for yourselves on the earth, where moth and rust consume, and where thieves break through and steal; but lay up for yourselves treasures in heaven, where neither moth nor rust consume, and where thieves don’t break through and steal; for where your treasure is, there your heart will be also."),
  "Revelation 22:1-2": P("Revelation 22:1–2", "REV.22", "He showed me a river of water of life, clear as crystal, proceeding out of the throne of God and of the Lamb, in the middle of its street. On this side of the river and on that was the tree of life, bearing twelve kinds of fruits, yielding its fruit every month. The leaves of the tree were for the healing of the nations."),

  // --- Hell & judgment ------------------------------------------------------
  "Matthew 25:46": P("Matthew 25:46", "MAT.25", "These will go away into eternal punishment, but the righteous into eternal life."),
  "Luke 16:22-26": P("Luke 16:22–26", "LUK.16", "The beggar died, and he was carried away by the angels to Abraham’s bosom. The rich man also died, and was buried. In Hades, he lifted up his eyes, being in torment, and saw Abraham far off, and Lazarus at his bosom. He cried and said, ‘Father Abraham, have mercy on me, and send Lazarus, that he may dip the tip of his finger in water, and cool my tongue! For I am in anguish in this flame.’ But Abraham said, ‘Son, remember that you, in your lifetime, received your good things, and Lazarus, in the same way, bad things. But here he is now comforted, and you are in anguish. Besides all this, between us and you there is a great gulf fixed, that those who want to pass from here to you are not able, and that no one may cross over from there to us.’"),
  "Matthew 10:28": P("Matthew 10:28", "MAT.10", "Don’t be afraid of those who kill the body, but are not able to kill the soul. Rather, fear him who is able to destroy both soul and body in Gehenna."),
  "2 Thessalonians 1:9": P("2 Thessalonians 1:9", "2TH.1", "…who will pay the penalty: eternal destruction from the face of the Lord and from the glory of his might."),
  "Revelation 20:12": P("Revelation 20:12", "REV.20", "I saw the dead, the great and the small, standing before the throne, and they opened books. Another book was opened, which is the book of life. The dead were judged out of the things which were written in the books, according to their works."),
  "2 Peter 3:9": P("2 Peter 3:9", "2PE.3", "The Lord is not slow concerning his promise, as some count slowness; but is patient with us, not wishing that any should perish, but that all should come to repentance."),
  "Romans 2:4": P("Romans 2:4", "ROM.2", "Or do you despise the riches of his goodness, forbearance, and patience, not knowing that the goodness of God leads you to repentance?"),
  "John 3:17-18": P("John 3:17–18", "JHN.3", "For God didn’t send his Son into the world to judge the world, but that the world should be saved through him. He who believes in him is not judged. He who doesn’t believe has been judged already, because he has not believed in the name of the one and only Son of God."),
  "Daniel 12:2": P("Daniel 12:2", "DAN.12", "Many of those who sleep in the dust of the earth will awake, some to everlasting life, and some to shame and everlasting contempt."),

  // --- Salvation --------------------------------------------------------------
  "John 3:16": P("John 3:16", "JHN.3", "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life."),
  "Romans 3:23": P("Romans 3:23", "ROM.3", "For all have sinned, and fall short of the glory of God."),
  "Romans 6:23": P("Romans 6:23", "ROM.6", "For the wages of sin is death, but the free gift of God is eternal life in Christ Jesus our Lord."),
  "Ephesians 2:8-9": P("Ephesians 2:8–9", "EPH.2", "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God, not of works, that no one would boast."),
  "Romans 5:8": P("Romans 5:8", "ROM.5", "But God commends his own love toward us, in that while we were yet sinners, Christ died for us."),
  "Romans 10:9-10": P("Romans 10:9–10", "ROM.10", "…that if you will confess with your mouth that Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved. For with the heart, one believes unto righteousness; and with the mouth confession is made unto salvation."),
  "John 14:6": P("John 14:6", "JHN.14", "Jesus said to him, “I am the way, the truth, and the life. No one comes to the Father, except through me.”"),
  "Revelation 3:20": P("Revelation 3:20", "REV.3", "Behold, I stand at the door and knock. If anyone hears my voice and opens the door, then I will come in to him, and will dine with him, and he with me."),
  "Isaiah 59:2": P("Isaiah 59:2", "ISA.59", "But your iniquities have separated you and your God, and your sins have hidden his face from you, so that he will not hear."),
  "John 1:12": P("John 1:12", "JHN.1", "But as many as received him, to them he gave the right to become God’s children, to those who believe in his name."),
  "1 John 5:13": P("1 John 5:13", "1JN.5", "These things I have written to you who believe in the name of the Son of God, that you may know that you have eternal life, and that you may continue to believe in the name of the Son of God."),
  "Romans 8:1": P("Romans 8:1", "ROM.8", "There is therefore now no condemnation to those who are in Christ Jesus, who don’t walk according to the flesh, but according to the Spirit."),

  // --- Made new ----------------------------------------------------------------
  "2 Corinthians 5:17": P("2 Corinthians 5:17", "2CO.5", "Therefore if anyone is in Christ, he is a new creation. The old things have passed away. Behold, all things have become new."),
  "Ezekiel 36:26": P("Ezekiel 36:26", "EZK.36", "I will also give you a new heart, and I will put a new spirit within you. I will take away the stony heart out of your flesh, and I will give you a heart of flesh."),
  "Romans 12:2": P("Romans 12:2", "ROM.12", "Don’t be conformed to this world, but be transformed by the renewing of your mind, so that you may prove what is the good, well-pleasing, and perfect will of God."),
  "Galatians 2:20": P("Galatians 2:20", "GAL.2", "I have been crucified with Christ, and it is no longer I that live, but Christ lives in me. That life which I now live in the flesh, I live by faith in the Son of God, who loved me, and gave himself up for me."),
  "Galatians 5:22-23": P("Galatians 5:22–23", "GAL.5", "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faith, gentleness, and self-control. Against such things there is no law."),
  "Ephesians 3:20": P("Ephesians 3:20", "EPH.3", "Now to him who is able to do exceedingly abundantly above all that we ask or think, according to the power that works in us…"),
  "Philippians 4:13": P("Philippians 4:13", "PHP.4", "I can do all things through Christ, who strengthens me."),
  "Isaiah 40:31": P("Isaiah 40:31", "ISA.40", "But those who wait for the LORD will renew their strength. They will mount up with wings like eagles. They will run, and not be weary. They will walk, and not faint."),
  "Philippians 1:6": P("Philippians 1:6", "PHP.1", "…being confident of this very thing, that he who began a good work in you will complete it until the day of Jesus Christ."),

  // --- Hope in suffering -----------------------------------------------------
  "Psalm 23:4": P("Psalm 23:4", "PSA.23", "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me."),
  "Romans 8:18": P("Romans 8:18", "ROM.8", "For I consider that the sufferings of this present time are not worthy to be compared with the glory which will be revealed toward us."),
  "Romans 8:38-39": P("Romans 8:38–39", "ROM.8", "For I am persuaded that neither death, nor life, nor angels, nor principalities, nor things present, nor things to come, nor powers, nor height, nor depth, nor any other created thing, will be able to separate us from God’s love, which is in Christ Jesus our Lord."),
  "Isaiah 41:10": P("Isaiah 41:10", "ISA.41", "Don’t you be afraid, for I am with you. Don’t be dismayed, for I am your God. I will strengthen you. Yes, I will help you. Yes, I will uphold you with the right hand of my righteousness."),
  "Matthew 11:28-30": P("Matthew 11:28–30", "MAT.11", "Come to me, all you who labor and are heavily burdened, and I will give you rest. Take my yoke upon you, and learn from me, for I am gentle and humble in heart; and you will find rest for your souls. For my yoke is easy, and my burden is light."),
  "2 Corinthians 4:16-18": P("2 Corinthians 4:16–18", "2CO.4", "Therefore we don’t faint, but though our outward man is decaying, yet our inward man is renewed day by day. For our light affliction, which is for the moment, works for us more and more exceedingly an eternal weight of glory; while we don’t look at the things which are seen, but at the things which are not seen. For the things which are seen are temporal, but the things which are not seen are eternal."),
  "Psalm 34:18": P("Psalm 34:18", "PSA.34", "The LORD is near to those who have a broken heart, and saves those who have a crushed spirit."),
  "John 16:33": P("John 16:33", "JHN.16", "I have told you these things, that in me you may have peace. In the world you have oppression; but cheer up! I have overcome the world."),
  "Psalm 30:5": P("Psalm 30:5", "PSA.30", "For his anger is but for a moment. His favor is for a lifetime. Weeping may stay for the night, but joy comes in the morning."),
  "Lamentations 3:22-23": P("Lamentations 3:22–23", "LAM.3", "It is because of the LORD’s loving kindnesses that we are not consumed, because his compassion doesn’t fail. They are new every morning. Great is your faithfulness."),
  "Joshua 1:9": P("Joshua 1:9", "JOS.1", "Haven’t I commanded you? Be strong and courageous. Don’t be afraid. Don’t be dismayed, for the LORD your God is with you wherever you go."),

  // --- Wonder, creation, light (The Ascent, Great Minds) ---------------------
  "Isaiah 9:2": P("Isaiah 9:2", "ISA.9", "The people who walked in darkness have seen a great light. Those who lived in the land of the shadow of death, on them the light has shined."),
  "Psalm 19:1": P("Psalm 19:1", "PSA.19", "The heavens declare the glory of God. The expanse shows his handiwork."),
  "Psalm 139:14": P("Psalm 139:14", "PSA.139", "I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well."),
  "Psalm 147:4": P("Psalm 147:4", "PSA.147", "He counts the number of the stars. He calls them all by their names."),
  "Isaiah 43:1": P("Isaiah 43:1", "ISA.43", "But now the LORD who created you, Jacob, and he who formed you, Israel says: “Don’t be afraid, for I have redeemed you. I have called you by your name. You are mine.”"),
  "John 1:5": P("John 1:5", "JHN.1", "The light shines in the darkness, and the darkness hasn’t overcome it."),
  "Romans 1:20": P("Romans 1:20", "ROM.1", "For the invisible things of him since the creation of the world are clearly seen, being perceived through the things that are made, even his everlasting power and divinity; that they may be without excuse."),
  "Genesis 1:1": P("Genesis 1:1", "GEN.1", "In the beginning, God created the heavens and the earth."),
  "Psalm 46:10": P("Psalm 46:10", "PSA.46", "Be still, and know that I am God. I will be exalted among the nations. I will be exalted in the earth."),
  "Hebrews 11:3": P("Hebrews 11:3", "HEB.11", "By faith, we understand that the universe has been framed by the word of God, so that what is seen has not been made out of things which are visible."),
  "Jeremiah 29:13": P("Jeremiah 29:13", "JER.29", "You shall seek me, and find me, when you search for me with all your heart."),
  "Colossians 1:17": P("Colossians 1:17", "COL.1", "He is before all things, and in him all things are held together."),
  "Job 38:4": P("Job 38:4", "JOB.38", "Where were you when I laid the foundations of the earth? Declare, if you have understanding."),
  "1 John 1:5": P("1 John 1:5", "1JN.1", "This is the message which we have heard from him and announce to you, that God is light, and in him is no darkness at all."),
  "Matthew 7:7": P("Matthew 7:7", "MAT.7", "Ask, and it will be given you. Seek, and you will find. Knock, and it will be opened for you."),
  "2 Corinthians 4:6": P("2 Corinthians 4:6", "2CO.4", "…seeing it is God who said, “Light will shine out of darkness,” who has shone in our hearts, to give the light of the knowledge of the glory of God in the face of Jesus Christ."),
  "Luke 15:24": P("Luke 15:24", "LUK.15", "…for this, my son, was dead, and is alive again. He was lost, and is found."),
  "Isaiah 60:1": P("Isaiah 60:1", "ISA.60", "Arise, shine; for your light has come, and the LORD’s glory has risen on you."),
  "Acts 17:27-28": P("Acts 17:27–28", "ACT.17", "…that they should seek the Lord, if perhaps they might reach out for him and find him, though he is not far from each one of us. ‘For in him we live, and move, and have our being.’ As some of your own poets have said, ‘For we are also his offspring.’"),
  "Proverbs 25:2": P("Proverbs 25:2", "PRO.25", "It is the glory of God to conceal a thing, but the glory of kings is to search out a matter."),
  "1 John 4:18": P("1 John 4:18", "1JN.4", "There is no fear in love; but perfect love casts out fear, because fear has punishment. He who fears is not made perfect in love."),
  "Hebrews 12:1": P("Hebrews 12:1", "HEB.12", "Therefore let us also, seeing we are surrounded by so great a cloud of witnesses, lay aside every weight and the sin which so easily entangles us, and let us run with perseverance the race that is set before us."),
  "Psalm 8:3-4": P("Psalm 8:3–4", "PSA.8", "When I consider your heavens, the work of your fingers, the moon and the stars, which you have ordained; what is man, that you think of him? What is the son of man, that you care for him?"),
  "Isaiah 55:8-9": P("Isaiah 55:8–9", "ISA.55", "“For my thoughts are not your thoughts, and your ways are not my ways,” says the LORD. “For as the heavens are higher than the earth, so are my ways higher than your ways, and my thoughts than your thoughts.”"),
  "John 8:12": P("John 8:12", "JHN.8", "Again, therefore, Jesus spoke to them, saying, “I am the light of the world. He who follows me will not walk in the darkness, but will have the light of life.”"),
  "Micah 6:8": P("Micah 6:8", "MIC.6", "He has shown you, O man, what is good. What does the LORD require of you, but to act justly, to love mercy, and to walk humbly with your God?"),
  "Psalm 119:11": P("Psalm 119:11", "PSA.119", "I have hidden your word in my heart, that I might not sin against you."),
  "Psalm 119:105": P("Psalm 119:105", "PSA.119", "Your word is a lamp to my feet, and a light for my path."),
  "2 Timothy 3:16-17": P("2 Timothy 3:16–17", "2TI.3", "Every Scripture is God-breathed and profitable for teaching, for reproof, for correction, and for instruction in righteousness, that the man of God may be complete, thoroughly equipped for every good work."),
  "Hebrews 4:12": P("Hebrews 4:12", "HEB.4", "For the word of God is living and active, and sharper than any two-edged sword, piercing even to the dividing of soul and spirit, of both joints and marrow, and is able to discern the thoughts and intentions of the heart."),
} as const satisfies Record<string, Passage>;

export type VerseKey = keyof typeof BIBLE;

export function verse(key: VerseKey): Passage {
  return BIBLE[key];
}

/** Bible.com translation ids for "read it in context" links. */
const TRANSLATIONS = { NIV: 111, ESV: 59, NLT: 116, KJV: 1 } as const;

/** Link to the whole chapter on Bible.com (free, any translation). */
export function chapterUrl(p: Passage, version: keyof typeof TRANSLATIONS = "NIV") {
  return `https://www.bible.com/bible/${TRANSLATIONS[version]}/${p.chapter}.${version}`;
}

export const TRANSLATION_NOTE =
  "Scripture quotations are from the World English Bible (public domain), with God’s covenant name rendered “the LORD” as in most English translations.";
