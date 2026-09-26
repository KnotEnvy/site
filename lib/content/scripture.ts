import { THEMES, type ThemeMeta } from "@/lib/content/themes";
import type { VerseKey } from "@/lib/content/bible";

/**
 * The Scripture study guide.
 *
 * Each theme is a small, self-contained Bible study: a key verse, the question
 * it answers, and a run of passages each with its CONTEXT (who wrote it, to
 * whom, why), what it MEANS, an optional NDE ECHO, and a question to REFLECT
 * on. Written to be broadly faithful across Christian traditions: where
 * believers genuinely differ (the nature of Hell, for instance) the study says
 * so rather than picking a side.
 *
 * NDE echoes are deliberately modest. Testimony is not Scripture and never
 * adds to it; an echo only notes where a common report happens to line up
 * with what a passage already says.
 */

export type Study = {
  key: VerseKey;
  heading: string;
  context: string;
  meaning: string;
  echo?: string;
  reflect: string;
};

export type Theme = ThemeMeta & {
  keyVerse: VerseKey;
  intro: string;
  studies: Study[];
  summary: string;
  discuss: string[];
  /** Whole chapters worth reading next, as USFM book.chapter + label. */
  further: { label: string; chapter: string }[];
};

type ThemeBody = Omit<Theme, keyof ThemeMeta>;

const BODIES: Record<string, ThemeBody> = {
  "life-after-death": {
    keyVerse: "John 11:25-26",
    intro:
      "Every one of us will face this question personally. The Bible's answer is neither vague nor morbid: death is real, it is an enemy, and it is not the end.",
    studies: [
      {
        key: "John 11:25-26",
        heading: "The resurrection is a person",
        context:
          "Jesus says this to Martha outside the tomb of her brother Lazarus, who has been dead four days. Minutes later, He calls Lazarus out of the grave.",
        meaning:
          "Jesus doesn't point Martha to a doctrine; He points her to Himself. Life after death isn't a mechanism, it's a relationship that death cannot break. \"Will still live, even if he dies\": physical death is real, but it is not the final word for those who trust Him.",
        reflect: "Jesus asks Martha directly: \"Do you believe this?\" How would you answer Him today?",
      },
      {
        key: "2 Corinthians 5:8",
        heading: "Absent from the body, at home with the Lord",
        context:
          "Paul writes to the church in Corinth about the body as a \"tent\" that will one day be folded up (2 Corinthians 5:1–8).",
        meaning:
          "For Paul there is no gap of nothingness. Leaving the body means arriving \"at home.\" It is the language of homecoming, not of annihilation.",
        echo:
          "People revived from cardiac arrest very often describe this exact sequence: separation from the body, then an overwhelming sense of coming home.",
        reflect: "What would change about how you live today if death meant homecoming?",
      },
      {
        key: "Luke 23:42-43",
        heading: "“Today”",
        context:
          "One of the two criminals crucified beside Jesus, with hours to live, asks only to be remembered.",
        meaning:
          "No ritual, no good works, no time left to make amends: only trust. And the answer is immediate: \"today.\" It is the clearest picture in Scripture of how grace works, and of how soon the next life begins.",
        reflect: "What does the thief's story say to someone who thinks it's too late for them?",
      },
      {
        key: "Philippians 1:21-23",
        heading: "Far better",
        context: "Paul writes from prison, knowing he may be executed.",
        meaning:
          "Paul is torn, not between hope and despair, but between two good things: serving people here, or being with Christ, \"which is far better.\" Faith doesn't make him careless with life. It makes him fearless about death.",
        reflect: "Is there anything you would call \"far better\" than this life? What would it take to believe that?",
      },
      {
        key: "Ecclesiastes 12:7",
        heading: "The spirit returns to God",
        context:
          "The closing poem of Ecclesiastes, the Bible's most searching and skeptical book, reflecting on old age and death.",
        meaning:
          "Even here the conclusion is clear: the body returns to the ground it came from, but the spirit, the person, returns to the God who gave it. You are more than your biology.",
        echo:
          "The consistent report that awareness continues while the body lies still is, at the very least, what this verse would lead you to expect.",
        reflect: "If your spirit returns to God, what do you hope to bring with you?",
      },
      {
        key: "Hebrews 9:27",
        heading: "Appointed once",
        context:
          "The writer contrasts human death with Christ's once-for-all sacrifice (Hebrews 9:24–28).",
        meaning:
          "One life, one death, then judgment. The Bible offers no reincarnation and no second lap. That makes this life weightier, and it makes the very next verse urgent: Christ was offered once to bear the sins of many.",
        reflect: "Why might it be a mercy, and not only a warning, that we get one life?",
      },
      {
        key: "1 Corinthians 15:54-55",
        heading: "Where is your sting?",
        context:
          "The Bible's longest chapter on resurrection. Paul argues that everything stands or falls on whether Jesus actually rose.",
        meaning:
          "Christian hope isn't only a soul drifting to Heaven; it is resurrection, a whole person made new. Death is \"swallowed up,\" and Paul taunts it like a beaten enemy.",
        reflect: "What is death's \"sting\" for you: fear, loss, the unknown? Read these verses aloud over it.",
      },
      {
        key: "1 Thessalonians 4:13-14",
        heading: "Grief with hope",
        context:
          "New believers in Thessalonica were distraught about friends who had died before Jesus' return.",
        meaning:
          "Paul doesn't forbid grief. He names two kinds: grief with no hope, and grief held inside a promise. Christians still weep at funerals, but they are saying goodbye for now.",
        reflect: "Who have you lost? What would it mean to grieve them with hope?",
      },
    ],
    summary:
      "Put together: death is real, and it is an enemy. But for those who belong to Christ it is a doorway. Absent from the body is at home with the Lord: immediately (\"today\"), consciously (\"far better\"), and finally in a resurrected, renewed life in which death itself is defeated.",
    discuss: [
      "Which of these passages surprised you most, and why?",
      "How do the thief on the cross and the apostle Paul arrive at the same hope from opposite ends of life?",
      "What difference does resurrection (a renewed body) make, compared with a soul simply living on?",
    ],
    further: [
      { label: "John 11 · Lazarus", chapter: "JHN.11" },
      { label: "1 Corinthians 15 · The resurrection", chapter: "1CO.15" },
      { label: "2 Corinthians 5 · Our earthly tent", chapter: "2CO.5" },
    ],
  },

  heaven: {
    keyVerse: "Revelation 21:3-4",
    intro:
      "Forget harps and fluffy clouds. The Bible's picture of Heaven is solid, bright and deeply personal, and it is centered not on a place but on a Person.",
    studies: [
      {
        key: "John 14:2-3",
        heading: "A place prepared",
        context:
          "Jesus' last evening with His disciples before the crucifixion. They are frightened and confused.",
        meaning:
          "Heaven is described as a home with room for you, prepared personally. And the best part isn't the rooms. It's \"that where I am, you may be there also.\"",
        reflect: "What does it mean to you that Heaven is being prepared for you, by name?",
      },
      {
        key: "2 Corinthians 12:2-4",
        heading: "Caught up",
        context:
          "Paul, reluctantly and in the third person, describes an experience from fourteen years earlier, during years marked by violent persecution.",
        meaning:
          "He doesn't know whether he was in his body or out of it, and he heard things he could not put into words. It is one of the most striking passages in Scripture for anyone who has read near-death accounts.",
        echo:
          "\"Whether in the body or out of the body, I don't know,\" and realities beyond words: those are two of the most common things NDE survivors say. They were outside their bodies, and human language fails them.",
        reflect: "Why do you think Paul was so reluctant to talk about this?",
      },
      {
        key: "Revelation 21:3-4",
        heading: "No more tears",
        context:
          "John's vision of the new heaven and new earth: the Bible's final picture of the future.",
        meaning:
          "The center of Heaven isn't gold streets; it is God Himself living with His people. And the first thing He does there is personal: He wipes away tears. Every grief you carry has an appointment with His hand.",
        reflect: "Which tears would you want Him to wipe away?",
      },
      {
        key: "Revelation 21:23",
        heading: "No need of the sun",
        context: "John describes the light of the New Jerusalem.",
        meaning:
          "Heaven's light isn't borrowed from a star. It comes from God's own glory, and \"its lamp is the Lamb.\"",
        echo:
          "The single most reported feature of heavenly NDEs is a light brighter than the sun that does not hurt the eyes, and is experienced as love. Scripture describes a city lit by exactly that.",
        reflect: "What does it tell you about God that the light of Heaven is His own presence?",
      },
      {
        key: "1 Corinthians 2:9",
        heading: "Beyond imagination",
        context:
          "Paul, loosely quoting Isaiah 64:4, writes about the wisdom God has revealed in the gospel.",
        meaning:
          "In context Paul means God's plan of rescue, hidden for ages and now revealed. But the principle reaches further: God's best is beyond anything we can picture. Every description of Heaven, even the Bible's, is a sketch of something larger.",
        reflect: "What is the most beautiful thing you have ever seen? Now imagine it is only a sketch.",
      },
      {
        key: "Philippians 3:20-21",
        heading: "Citizens of Heaven",
        context:
          "Philippi was a Roman colony, and its people prized their Roman citizenship. Paul borrows the image.",
        meaning:
          "Christians live here as citizens of somewhere else, and the future includes a renewed body \"conformed to the body of his glory.\" Heaven is not ghostly. It is more solid than this world, not less.",
        reflect: "How would you live differently this week as a citizen of Heaven living abroad?",
      },
      {
        key: "Revelation 22:1-2",
        heading: "The river and the tree",
        context:
          "The Bible's final chapter echoes its first: the tree of life from Eden appears again.",
        meaning:
          "The story that began in a garden ends in a garden-city. What was lost is restored, and more: the leaves are \"for the healing of the nations.\"",
        reflect: "What needs healing in you, and in the world, that you long to see made right?",
      },
      {
        key: "Matthew 6:19-21",
        heading: "Treasure there",
        context: "Part of the Sermon on the Mount, Jesus' longest recorded teaching.",
        meaning:
          "Heaven isn't only a future destination; it reorders your calendar and your wallet now. Your heart follows your treasure.",
        reflect: "Where is your treasure right now, and so, where is your heart?",
      },
    ],
    summary:
      "Heaven in Scripture is a real, prepared home, lit by God's own presence, where death, mourning and pain are over and God Himself lives with His people. It is more solid than this world, beyond what we can imagine, and it begins to shape our lives even now.",
    discuss: [
      "What images of Heaven did you grow up with, and how do these passages compare?",
      "Why do you think the Bible describes Heaven mostly in terms of relationship rather than scenery?",
      "Paul's experience in 2 Corinthians 12 sounds a lot like modern NDEs. What should we make of that, and what shouldn't we?",
    ],
    further: [
      { label: "Revelation 21 · All things new", chapter: "REV.21" },
      { label: "Revelation 22 · The river of life", chapter: "REV.22" },
      { label: "John 14 · Many homes", chapter: "JHN.14" },
    ],
  },

  "hell-and-judgment": {
    keyVerse: "2 Peter 3:9",
    intro:
      "No one should speak about Hell casually, and Jesus never did. He spoke of it more than anyone else in the Bible, and always as something He came to rescue people from. Read these slowly, and read them beside the mercy that surrounds them.",
    studies: [
      {
        key: "Matthew 25:46",
        heading: "Two destinies",
        context: "The close of Jesus' parable of the sheep and the goats.",
        meaning:
          "Jesus uses the same word, eternal, for both destinies. Christians have understood the details of \"eternal punishment\" differently, but not this: the direction of a life lived now carries permanent weight.",
        reflect: "Why do you think Jesus used the same word for both outcomes?",
      },
      {
        key: "Luke 16:22-26",
        heading: "The great gulf",
        context:
          "Jesus' story of a rich man and a beggar named Lazarus, told to religious leaders who \"were lovers of money\" (Luke 16:14).",
        meaning:
          "Whether it is a parable or an account, the point is sharp: after death there is a \"great gulf fixed.\" The rich man is conscious, remembers, and cannot cross. Notice that even there he still treats Lazarus as someone to run his errands.",
        echo:
          "Distressing NDEs are a minority, but they are well documented. Many describe darkness, isolation and an unbridgeable distance. The third vault on the home page holds those testimonies.",
        reflect: "What does the rich man's attitude, even after death, suggest about how Hell relates to the heart?",
      },
      {
        key: "Matthew 10:28",
        heading: "Fear rightly",
        context: "Jesus sends out His twelve disciples, warning them they will be persecuted.",
        meaning:
          "Jesus reorders our fears. People can harm only the body. \"Gehenna\" was the valley outside Jerusalem associated in the Old Testament with child sacrifice (Jeremiah 7:31); Jesus uses it as the picture of final ruin.",
        reflect: "What do you fear most? How does Jesus' ranking of fears change that?",
      },
      {
        key: "2 Thessalonians 1:9",
        heading: "Away from His presence",
        context: "Paul encourages persecuted believers that God will one day set everything right.",
        meaning:
          "At its heart, Hell in Scripture is separation: \"from the face of the Lord and from the glory of his might.\" If God is the source of all light, life and love, then to be cut off from Him is to be cut off from every good thing.",
        echo:
          "People who report distressing NDEs most often describe an absence: emptiness, darkness, and being utterly alone.",
        reflect: "If every good thing comes from God, what would it mean to be without Him entirely?",
      },
      {
        key: "Revelation 20:12",
        heading: "The books were opened",
        context: "John's vision of the final judgment.",
        meaning:
          "Every life is recorded and every person is accountable. But notice there is another book: the book of life. Judgment by our record alone would condemn everyone. The book of life is the hope.",
        echo:
          "The \"life review\", reliving one's whole life including its effect on others, was reported in 13% of the NDEs in the Dutch study published in The Lancet in 2001.",
        reflect: "If your life were reviewed today, what would you most want to have been different?",
      },
      {
        key: "John 3:17-18",
        heading: "Not to condemn",
        context: "These verses follow straight on from John 3:16.",
        meaning:
          "Jesus did not come to send people to Hell. Humanity was already heading away from God. He came to rescue. Condemnation is not God's goal; it is the default He interrupts.",
        reflect: "How does it change the picture to see Jesus as a rescuer rather than a judge looking for reasons?",
      },
      {
        key: "2 Peter 3:9",
        heading: "Patient, not wanting any to perish",
        context: "People were mocking that Jesus had not returned as promised.",
        meaning:
          "The delay is mercy. Every day that history continues is God holding the door open a little longer.",
        reflect: "If God is holding the door open, what is keeping you, or someone you love, from walking through?",
      },
      {
        key: "Romans 2:4",
        heading: "Kindness that leads home",
        context: "Paul warns religious people who were quick to judge others.",
        meaning:
          "God's goodness isn't permission to ignore Him. It is the invitation. This whole study exists not to frighten, but to wake up.",
        reflect: "Where have you seen God's kindness in your life, even before you were looking for Him?",
      },
    ],
    summary:
      "In Jesus' teaching Hell is real, it is permanent, and at its core it is separation from God. But every passage about judgment is surrounded by mercy: God is patient, not wanting anyone to perish, and Jesus came not to condemn but to save. The warning exists so that no one has to go there.",
    discuss: [
      "Why is it important to read the passages about judgment alongside the passages about mercy?",
      "Christians have held different views on what Hell is like. What do all of these passages agree on?",
      "How would you talk about this subject with someone who is afraid, or angry?",
    ],
    further: [
      { label: "Luke 16 · The rich man and Lazarus", chapter: "LUK.16" },
      { label: "Matthew 25 · The sheep and the goats", chapter: "MAT.25" },
      { label: "2 Peter 3 · The patience of God", chapter: "2PE.3" },
    ],
  },

  salvation: {
    keyVerse: "John 3:16",
    intro:
      "If Heaven and Hell are real, the most important question in the world is how anyone is made right with God. The Bible's answer is surprisingly simple, and it is not \"try harder.\"",
    studies: [
      {
        key: "Romans 3:23",
        heading: "Everyone falls short",
        context:
          "Paul concludes a long argument that religious and irreligious people alike stand guilty before God.",
        meaning:
          "\"Sin\" means missing the mark. Not some of us: all. It is the great equalizer. The best person you know and the worst person you have heard of need the same rescue.",
        reflect: "Is it hard or a relief to hear that everyone falls short?",
      },
      {
        key: "Isaiah 59:2",
        heading: "The wall",
        context: "The prophet explains why God seems distant from His people.",
        meaning:
          "The problem isn't that God is weak or far away. It is that sin builds a wall. Hell is that separation made permanent; salvation is the wall coming down.",
        reflect: "Where do you feel distance from God? What might be standing in the way?",
      },
      {
        key: "Romans 6:23",
        heading: "Wages, or a gift",
        context: "Paul contrasts two masters: sin, and God.",
        meaning:
          "Wages are earned; gifts are received. Death is what sin pays out. Eternal life can't be earned at all. It is a free gift.",
        reflect: "Why is it sometimes harder to accept a gift than to earn a wage?",
      },
      {
        key: "Romans 5:8",
        heading: "Love went first",
        context: "Paul describes the kind of love shown at the cross.",
        meaning:
          "God didn't wait for us to clean ourselves up. The cross came first. Love went first.",
        reflect: "What does it mean to you that God loved you before you changed anything?",
      },
      {
        key: "John 3:16",
        heading: "The whole story in one sentence",
        context:
          "Jesus is speaking at night with Nicodemus, a respected religious teacher who came with honest questions.",
        meaning:
          "Loved, gave, believe, life. The whole Bible in a sentence. And \"whoever\" leaves no one out.",
        reflect: "Read the verse again and put your own name in place of \"the world.\"",
      },
      {
        key: "Ephesians 2:8-9",
        heading: "By grace, through faith",
        context: "Paul reminds non-Jewish believers where their new life came from.",
        meaning:
          "Grace is the source, faith is the hand that receives it, and even that is a gift. Nobody in Heaven will boast. Everyone will be grateful.",
        reflect: "What are you tempted to lean on instead of grace?",
      },
      {
        key: "Romans 10:9-10",
        heading: "Believe and say it",
        context: "Paul explains how the message of Christ is received.",
        meaning:
          "Salvation is not a secret formula. It is trusting that Jesus is Lord and that God raised Him from the dead: believed in the heart and spoken out loud.",
        reflect: "Have you ever said it out loud? What would it mean to?",
      },
      {
        key: "John 14:6",
        heading: "The way",
        context: "The night before the cross, Thomas asks Jesus how they can know the way.",
        meaning:
          "Jesus doesn't claim to show the way; He claims to be it. It is an exclusive claim, and an inclusive invitation: anyone at all can come through Him.",
        reflect: "Why do you think Jesus answered a question about directions with a statement about Himself?",
      },
      {
        key: "Revelation 3:20",
        heading: "The knock",
        context: "The risen Jesus speaks to a comfortable, lukewarm church.",
        meaning:
          "The picture isn't you storming Heaven's gates. It is Christ knocking at yours. The handle is on your side.",
        reflect: "If He is knocking, what would opening the door look like for you?",
      },
    ],
    summary:
      "Everyone has fallen short, and sin separates us from God. But God loved us first: in Jesus He paid what we owed and offers eternal life as a free gift. It is received, not earned, by trusting Jesus, believed in the heart and confessed with the mouth. The door is open, and He is knocking.",
    discuss: [
      "Why do so many people assume Heaven is earned by being good enough?",
      "What is the difference between believing facts about Jesus and trusting Him?",
      "Which verse in this study would you share with a friend, and why?",
    ],
    further: [
      { label: "John 3 · Born again", chapter: "JHN.3" },
      { label: "Romans 5 · Peace with God", chapter: "ROM.5" },
      { label: "Ephesians 2 · Saved by grace", chapter: "EPH.2" },
    ],
  },

  "made-new": {
    keyVerse: "2 Corinthians 5:17",
    intro:
      "The good news isn't only about where you go when you die. It is about who you become while you live, and the Bible promises nothing less than a new creation.",
    studies: [
      {
        key: "Ezekiel 36:26",
        heading: "A heart transplant",
        context:
          "God speaks through the prophet Ezekiel to exiles in Babylon, promising to restore them.",
        meaning:
          "God doesn't offer to polish a heart of stone. He replaces it. Real change starts on the inside, and it starts with Him. (The Ascent's \"Broken Open\" chapter pictures this verse.)",
        reflect: "Where has your heart grown hard? What would it mean to let God replace it rather than fix it?",
      },
      {
        key: "2 Corinthians 5:17",
        heading: "A new creation",
        context: "Paul explains why he no longer sees anyone \"according to the flesh\" (5:16).",
        meaning:
          "Not a renovation: a new creation, the language of God making the world. Your past is real, but it is no longer your identity.",
        reflect: "What old label have you been living under that God says has passed away?",
      },
      {
        key: "Romans 12:2",
        heading: "Metamorphosis",
        context: "After eleven chapters on what God has done, Paul turns to how to live.",
        meaning:
          "The Greek word translated \"transformed\" is the one English borrows as metamorphosis. It happens by the renewing of the mind, which is why time in Scripture matters so much.",
        reflect: "What is shaping your mind most right now? What would renewing it look like this week?",
      },
      {
        key: "Galatians 2:20",
        heading: "Christ lives in me",
        context: "Paul defends the gospel of grace against people adding rules to it.",
        meaning:
          "The new life isn't you straining to be like Jesus. It is Jesus living His life through you, by faith, because He loved you and gave Himself for you.",
        reflect: "What is the difference between trying to be good and letting Christ live in you?",
      },
      {
        key: "Galatians 5:22-23",
        heading: "Fruit, not effort",
        context: "Paul contrasts life driven by selfish desire with life led by the Spirit.",
        meaning:
          "Nine qualities, one fruit. Fruit isn't manufactured; it grows when a branch stays connected to the vine (John 15:5).",
        reflect: "Which of the nine do you most long to see grow in you?",
      },
      {
        key: "Isaiah 40:31",
        heading: "Wings like eagles",
        context: "Written to exiles who felt that God had forgotten them (Isaiah 40:27).",
        meaning:
          "Waiting on the LORD isn't passive. It is where strength is renewed, for the soaring days, the running days and the long walking days too.",
        reflect: "Which season are you in: soaring, running or walking?",
      },
      {
        key: "Ephesians 3:20",
        heading: "Exceedingly abundantly",
        context: "Paul closes a prayer for the church in Ephesus.",
        meaning:
          "Paul runs out of words stacking superlatives. The power at work is \"the power that works in us\", which means your future self is not limited by your present self.",
        reflect: "What have you stopped asking God for because it seemed too big?",
      },
      {
        key: "Philippians 4:13",
        heading: "Strength for anything",
        context: "Paul writes from prison about learning contentment in hunger and in plenty (4:11–12).",
        meaning:
          "It isn't a promise to win every game. It is a promise of strength to stay content and faithful in any circumstance, which is a far greater power.",
        reflect: "Where do you need strength to be content rather than strength to escape?",
      },
      {
        key: "Philippians 1:6",
        heading: "He finishes what He starts",
        context: "Paul thanks God for the believers in Philippi.",
        meaning:
          "Transformation is a process, and God doesn't abandon His projects. You are a work in progress with a guaranteed finish.",
        reflect: "What would it free you from, to trust that God will complete what He began in you?",
      },
    ],
    summary:
      "God doesn't just forgive; He transforms. He gives a new heart and a new spirit, makes us a new creation, and renews our minds. His own life grows in us like fruit, and His power in us is greater than anything we could ask or imagine. And He always finishes what He starts.",
    discuss: [
      "Have you seen someone genuinely changed by faith? What was different?",
      "Why do you think lasting change has to start with the heart rather than behavior?",
      "Which picture helps you most: a new heart, a new creation, metamorphosis, or fruit?",
    ],
    further: [
      { label: "Ezekiel 36 · A new heart", chapter: "EZK.36" },
      { label: "Romans 12 · A renewed mind", chapter: "ROM.12" },
      { label: "Galatians 5 · The fruit of the Spirit", chapter: "GAL.5" },
    ],
  },

  hope: {
    keyVerse: "Psalm 23:4",
    intro:
      "Believing in Heaven has never meant pretending pain isn't real. Some of the Bible's strongest hope was written from prisons, from exile and from grief. If you are hurting right now, start here.",
    studies: [
      {
        key: "Psalm 23:4",
        heading: "Through the valley",
        context: "A psalm of David, a shepherd before he was a king.",
        meaning:
          "Notice the pronouns change: \"he leads me\" becomes \"you are with me\" right in the valley. God is most personal in the darkest place. And it is a valley: you walk through it.",
        reflect: "What valley are you walking through? Say the verse again, slowly, to Him.",
      },
      {
        key: "Psalm 34:18",
        heading: "Near the brokenhearted",
        context: "David wrote this psalm after a humiliating escape from danger.",
        meaning:
          "God doesn't wait for you to feel better before He comes close. He is nearest to the broken.",
        reflect: "Can you let yourself believe He is near right now, before anything is fixed?",
      },
      {
        key: "Matthew 11:28-30",
        heading: "Rest",
        context: "Jesus speaks to crowds weighed down by religious rules and hard lives.",
        meaning:
          "His invitation is to the exhausted, not to the impressive. He is \"gentle and humble in heart.\"",
        reflect: "What burden would you hand Him today if you really believed He is gentle?",
      },
      {
        key: "Isaiah 41:10",
        heading: "Don't be afraid",
        context: "God speaks to His people, small and threatened among powerful nations.",
        meaning:
          "Five promises in one verse: I am with you. I am your God. I will strengthen you. I will help you. I will uphold you.",
        reflect: "Which of the five promises do you need most today?",
      },
      {
        key: "John 16:33",
        heading: "I have overcome",
        context: "Jesus speaks to His disciples on the night before His crucifixion.",
        meaning:
          "Jesus never promised a life without trouble. He promised peace inside it, and a victory that is already won.",
        reflect: "What would \"peace in the middle of it\" look like in your situation?",
      },
      {
        key: "Romans 8:18",
        heading: "Not worth comparing",
        context:
          "Paul, who was beaten, shipwrecked and imprisoned for his faith (2 Corinthians 11:23–27), writes about suffering.",
        meaning:
          "Paul isn't minimizing suffering; he is weighing it against eternity, and the scale is not close.",
        reflect: "What would it look like to hold your pain honestly, and also hold this promise?",
      },
      {
        key: "2 Corinthians 4:16-18",
        heading: "Renewed day by day",
        context: "Paul describes the physical toll of his ministry.",
        meaning:
          "Bodies age and wear out, but the inner person can be renewed day by day. \"Light affliction\" is a stunning phrase from a man who had nearly been killed more than once.",
        reflect: "What unseen, eternal thing can you fix your eyes on today?",
      },
      {
        key: "Romans 8:38-39",
        heading: "Nothing can separate",
        context: "The triumphant close of Romans 8.",
        meaning:
          "Paul lists everything that could possibly come between you and God, including death itself, and crosses each one off.",
        reflect: "What have you feared might separate you from God's love? Add it to Paul's list, and cross it off.",
      },
    ],
    summary:
      "God doesn't promise a life without pain. He promises His presence in it: near the brokenhearted, strength for the afraid, rest for the exhausted, and a glory ahead that outweighs everything we suffer. Nothing, not even death, can separate us from His love.",
    discuss: [
      "Why do you think so many of these promises were written by people who were suffering?",
      "What is the difference between hope and optimism?",
      "How can you be present with someone who is grieving without rushing them?",
    ],
    further: [
      { label: "Psalm 23 · The Lord is my shepherd", chapter: "PSA.23" },
      { label: "Romans 8 · No condemnation, no separation", chapter: "ROM.8" },
      { label: "2 Corinthians 4 · Treasure in jars of clay", chapter: "2CO.4" },
    ],
  },
};

export const STUDY_THEMES: Theme[] = THEMES.map((meta) => ({ ...meta, ...BODIES[meta.slug] }));

export function themeBySlug(slug: string): Theme | undefined {
  return STUDY_THEMES.find((t) => t.slug === slug);
}

/** Seven days through the heart of the story, one chapter or two a day. */
export const READING_PLAN: { day: number; title: string; read: string; chapter: string; prompt: string }[] = [
  { day: 1, title: "Born again", read: "John 3", chapter: "JHN.3", prompt: "What did Nicodemus misunderstand, and what did Jesus offer him?" },
  { day: 2, title: "The resurrection and the life", read: "John 11", chapter: "JHN.11", prompt: "Jesus wept before He raised Lazarus. Why does that matter?" },
  { day: 3, title: "Lost and found", read: "Luke 15", chapter: "LUK.15", prompt: "Which character in the three stories do you most relate to?" },
  { day: 4, title: "Two deaths, two destinies", read: "Luke 16", chapter: "LUK.16", prompt: "What kept the rich man from seeing Lazarus while they were both alive?" },
  { day: 5, title: "Why the resurrection changes everything", read: "1 Corinthians 15", chapter: "1CO.15", prompt: "Paul says if Christ was not raised, faith is useless. Why so strong?" },
  { day: 6, title: "A new creation", read: "2 Corinthians 5", chapter: "2CO.5", prompt: "What does it mean to be an \"ambassador\" for Christ?" },
  { day: 7, title: "All things new", read: "Revelation 21", chapter: "REV.21", prompt: "Which promise in this chapter do you most look forward to?" },
];

/** Short, well-loved verses for the memorisation exercise. */
export const MEMORY_VERSES: VerseKey[] = [
  "John 3:16",
  "2 Corinthians 5:17",
  "Romans 6:23",
  "Isaiah 41:10",
  "Psalm 119:105",
];
