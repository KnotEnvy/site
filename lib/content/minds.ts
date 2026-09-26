/**
 * Great Minds: what scientists, philosophers and contemplatives actually said
 * about God, in their own words.
 *
 * SOURCING RULE: every quotation here was checked against Wikiquote's sourced
 * sections (or the primary source), and famous lines that turned out to be
 * disputed or misattributed were dropped - Kepler's "thinking God's thoughts
 * after Him", Heisenberg's "bottom of the glass", Pascal's "God-shaped
 * vacuum" are all out. People who were NOT believers (Einstein, Hoyle,
 * Jastrow, Penrose) are quoted accurately and labelled honestly; the case is
 * stronger for it, not weaker.
 */

export type Mind = {
  id: string;
  name: string;
  years: string;
  field: string;
  /** One line on why they matter. */
  known: string;
  quote?: string;
  source?: string;
  /** Plain-language context: belief, or honest caveat. */
  note: string;
  wiki: string;
  /** Position in the constellation, 0..100 on each axis. */
  star?: [number, number];
};

export const FOUNDERS: Mind[] = [
  {
    id: "kepler",
    name: "Johannes Kepler",
    years: "1571–1630",
    field: "Astronomy",
    known: "Discovered the laws of planetary motion.",
    quote: "Geometry is one and eternal, shining in the mind of God.",
    source: "Harmonices Mundi (1618), Book III",
    note: "Trained for the ministry before turning to astronomy, Kepler saw the mathematical order of the heavens as a window into the mind of their Maker.",
    wiki: "Johannes_Kepler",
    star: [8, 62],
  },
  {
    id: "galileo",
    name: "Galileo Galilei",
    years: "1564–1642",
    field: "Physics & astronomy",
    known: "Father of observational astronomy and modern physics.",
    quote: "The intention of the Holy Spirit is to teach us how one goes to heaven, not how heaven goes.",
    source: "Letter to the Grand Duchess Christina (1615), quoting a senior churchman",
    note: "Despite his conflict with church authorities, Galileo remained a believer. His argument was that God wrote two books, Scripture and nature, and they cannot truly contradict each other.",
    wiki: "Galileo_Galilei",
    star: [18, 30],
  },
  {
    id: "pascal",
    name: "Blaise Pascal",
    years: "1623–1662",
    field: "Mathematics & physics",
    known: "Pioneer of probability theory and fluid pressure; built one of the first calculators.",
    quote: "The heart has its reasons, which reason does not know.",
    source: "Pensées (published 1670), §277",
    note: "After a night of overwhelming encounter with God in 1654, Pascal sewed a record of it into his coat and carried it until he died.",
    wiki: "Blaise_Pascal",
    star: [30, 70],
  },
  {
    id: "newton",
    name: "Isaac Newton",
    years: "1643–1727",
    field: "Physics & mathematics",
    known: "Universal gravitation, the laws of motion, and calculus.",
    quote:
      "This most beautiful system of the sun, planets, and comets, could only proceed from the counsel and dominion of an intelligent and powerful Being.",
    source: "Principia, General Scholium (1713; Motte translation, 1729)",
    note: "Newton wrote more about theology and Scripture than about physics.",
    wiki: "Isaac_Newton",
    star: [40, 24],
  },
  {
    id: "boyle",
    name: "Robert Boyle",
    years: "1627–1691",
    field: "Chemistry",
    known: "Founder of modern chemistry; Boyle's law of gases.",
    note: "A devout Christian who left money in his will for the \"Boyle Lectures,\" a series defending the Christian faith that still runs today.",
    wiki: "Robert_Boyle",
    star: [52, 58],
  },
  {
    id: "faraday",
    name: "Michael Faraday",
    years: "1791–1867",
    field: "Physics & chemistry",
    known: "Discovered electromagnetic induction; the reason we have electric motors and generators.",
    quote:
      "I am, I hope, very thankful that in the withdrawal of the powers and things of life, the good hope is left with me, which makes the contemplation of death a comfort — not a fear.",
    source: "Letter to Auguste de la Rive (1861)",
    note: "A lifelong, deeply committed member of a small Christian church, where he served as an elder.",
    wiki: "Michael_Faraday",
    star: [63, 34],
  },
  {
    id: "maxwell",
    name: "James Clerk Maxwell",
    years: "1831–1879",
    field: "Physics",
    known: "Unified electricity, magnetism and light; his equations underpin all modern electronics.",
    quote:
      "Christians whose minds are scientific are bound to study science that their view of the glory of God may be as extensive as their being is capable.",
    source: "Draft reply to the Victoria Institute (1875)",
    note: "Einstein kept a photograph of Maxwell on his study wall.",
    wiki: "James_Clerk_Maxwell",
    star: [75, 66],
  },
  {
    id: "mendel",
    name: "Gregor Mendel",
    years: "1822–1884",
    field: "Biology",
    known: "Discovered the laws of heredity; the father of genetics.",
    note: "An Augustinian friar who did his famous pea-plant experiments in the garden of his monastery, and later became its abbot.",
    wiki: "Gregor_Mendel",
    star: [86, 28],
  },
  {
    id: "planck",
    name: "Max Planck",
    years: "1858–1947",
    field: "Physics · Nobel Prize 1918",
    known: "Originated quantum theory.",
    quote:
      "Both religion and science require a belief in God. For believers, God is in the beginning, and for physicists He is at the end of all considerations.",
    source: "Religion and Natural Science (1937)",
    note: "In a 1944 lecture on the nature of matter, Planck concluded that behind the force holding atoms together there must be a conscious and intelligent mind: \"This Mind is the matrix of all matter.\"",
    wiki: "Max_Planck",
    star: [94, 58],
  },
];

export const COSMOLOGISTS: Mind[] = [
  {
    id: "lemaitre",
    name: "Georges Lemaître",
    years: "1894–1966",
    field: "Physics · Catholic priest",
    known: "Proposed the expanding universe (1927) and the \"primeval atom\" (1931): the Big Bang.",
    quote:
      "I was interested in truth from the point of view of salvation just as much as in truth from the point of view of scientific certainty. It appeared to me that there were two paths to truth, and I decided to follow both of them.",
    source: "Interview in The New York Times Magazine (1933)",
    note: "The theory that the universe had a beginning was first proposed by a priest, and many scientists at first resisted it for exactly that reason.",
    wiki: "Georges_Lemaître",
  },
  {
    id: "einstein",
    name: "Albert Einstein",
    years: "1879–1955",
    field: "Physics · Nobel Prize 1921",
    known: "Relativity. At first he added a term to his equations to keep the universe static and eternal, without a beginning.",
    quote:
      "I'm not an atheist. The problem involved is too vast for our limited minds. We are in the position of a little child entering a huge library filled with books in many languages. The child knows someone must have written these books.",
    source: "Interview with George Sylvester Viereck (1929)",
    note: "To be honest about it: Einstein did not believe in a personal God. He believed in \"Spinoza's God,\" revealed in the order of nature. He refused, all the same, to call himself an atheist.",
    wiki: "Albert_Einstein",
  },
  {
    id: "penzias",
    name: "Arno Penzias",
    years: "1933–2024",
    field: "Physics · Nobel Prize 1978",
    known: "Co-discovered the cosmic microwave background: the afterglow of the beginning.",
    quote:
      "The best data we have are exactly what I would have predicted, had I had nothing to go on but the five books of Moses, the Psalms, the Bible as a whole.",
    source: "Quoted in The New York Times (March 12, 1978)",
    note: "The radiation he and Robert Wilson found in 1965 turned the Big Bang from a theory into the scientific consensus.",
    wiki: "Arno_Allan_Penzias",
  },
  {
    id: "jastrow",
    name: "Robert Jastrow",
    years: "1925–2008",
    field: "Astronomy · NASA",
    known: "Founding director of NASA's Goddard Institute for Space Studies.",
    quote:
      "He has scaled the mountains of ignorance; he is about to conquer the highest peak; as he pulls himself over the final rock, he is greeted by a band of theologians who have been sitting there for centuries.",
    source: "God and the Astronomers (1978)",
    note: "Jastrow described himself as an agnostic. That is exactly what makes his description of the scientist's surprise so striking.",
    wiki: "Robert_Jastrow",
  },
];

export const TUNING_MINDS: Mind[] = [
  {
    id: "hoyle",
    name: "Fred Hoyle",
    years: "1915–2001",
    field: "Astronomy",
    known: "Explained how stars forge the elements; predicted the carbon resonance before it was found.",
    quote:
      "A common sense interpretation of the facts suggests that a superintellect has monkeyed with physics, as well as with chemistry and biology, and that there are no blind forces worth speaking about in nature.",
    source: "Engineering and Science (November 1981)",
    note: "Hoyle was no believer, and coined the name \"Big Bang\" for a theory he spent his career rejecting. His conclusion came from the numbers.",
    wiki: "Fred_Hoyle",
  },
  {
    id: "collins",
    name: "Francis Collins",
    years: "b. 1950",
    field: "Genetics",
    known: "Led the Human Genome Project; directed the U.S. National Institutes of Health.",
    quote:
      "The God of the Bible is also the God of the genome. He can be worshipped in the cathedral or in the laboratory.",
    source: "The Language of God (2006)",
    note: "An atheist through medical school, Collins came to faith at 27 after a patient asked him, \"What do you believe, doctor?\"",
    wiki: "Francis_Collins",
  },
  {
    id: "eddington",
    name: "Arthur Eddington",
    years: "1882–1944",
    field: "Astrophysics",
    known: "Led the 1919 eclipse expedition that confirmed Einstein's relativity.",
    quote: "The stuff of the world is mind-stuff.",
    source: "The Nature of the Physical World (1928)",
    note: "A lifelong Quaker, Eddington argued that the deepest reality physics touches is more like thought than like matter.",
    wiki: "Arthur_Eddington",
  },
];

export const CONVERTS: Mind[] = [
  {
    id: "lewis",
    name: "C. S. Lewis",
    years: "1898–1963",
    field: "Literature · Oxford & Cambridge",
    known: "Author of Mere Christianity and The Chronicles of Narnia.",
    quote:
      "I believe in Christianity as I believe that the sun has risen: not only because I see it, but because by it I see everything else.",
    source: "\"Is Theology Poetry?\" (1945)",
    note: "An atheist until his thirties, Lewis was argued toward faith by friends including J. R. R. Tolkien, and became its most famous 20th-century defender.",
    wiki: "C._S._Lewis",
  },
  {
    id: "flew",
    name: "Antony Flew",
    years: "1923–2010",
    field: "Philosophy",
    known: "For half a century, one of the world's most influential atheist philosophers.",
    quote: "We must follow the argument wherever it leads.",
    source: "His lifelong principle, borrowed from Plato's Socrates",
    note: "In 2004 Flew announced that he now believed in God, a Creator, citing the complexity of DNA. His 2007 book was titled There Is a God. (He stopped short of Christianity.)",
    wiki: "Antony_Flew",
  },
  {
    id: "mcgrath",
    name: "Alister McGrath",
    years: "b. 1953",
    field: "Biophysics → theology · Oxford",
    known: "Earned an Oxford doctorate in molecular biophysics.",
    note: "A convinced atheist as a young science student, McGrath came to faith at Oxford and went on to become one of the leading scholars of science and religion.",
    wiki: "Alister_McGrath",
  },
  {
    id: "strobel",
    name: "Lee Strobel",
    years: "b. 1952",
    field: "Journalism",
    known: "Former legal editor of the Chicago Tribune.",
    note: "An atheist who set out to disprove the resurrection after his wife's conversion. His investigation became The Case for Christ, and his own faith.",
    wiki: "Lee_Strobel",
  },
];

export const CONTEMPLATIVES: { name: string; years: string; words: string; source: string; note: string; wiki: string }[] = [
  {
    name: "Augustine of Hippo",
    years: "354–430",
    words: "You have made us for yourself, and our heart is restless until it rests in you.",
    source: "Confessions, Book I",
    note: "A brilliant, restless young philosopher who tried every answer his world offered before this one.",
    wiki: "Augustine_of_Hippo",
  },
  {
    name: "Blaise Pascal",
    years: "23 November 1654",
    words: "FIRE. God of Abraham, God of Isaac, God of Jacob, not of the philosophers and scholars. Certainty. Certainty. Feeling. Joy. Peace.",
    source: "The Memorial, found sewn into his coat",
    note: "One of the finest mathematical minds in history, describing two hours in which he met God.",
    wiki: "Pascal's_Memorial",
  },
  {
    name: "Brother Lawrence",
    years: "c. 1614–1691",
    words: "The time of business does not with me differ from the time of prayer.",
    source: "The Practice of the Presence of God",
    note: "A monastery cook who learned to pray among the pots and pans, and whose letters have been read for three centuries.",
    wiki: "Brother_Lawrence",
  },
  {
    name: "Julian of Norwich",
    years: "1343–c. 1416",
    words: "All shall be well, and all shall be well, and all manner of thing shall be well.",
    source: "Revelations of Divine Love",
    note: "The first book in English known to have been written by a woman, born of visions she received when she was close to death.",
    wiki: "Julian_of_Norwich",
  },
  {
    name: "Sadhu Sundar Singh",
    years: "1889–c. 1929",
    words: "Raised in a devout Sikh family and steeped in India's spiritual traditions, he prayed at fifteen that the true God would reveal Himself before morning.",
    source: "His own account of the night of his conversion, 1904",
    note: "That night he reported a vision of Christ. He spent the rest of his life as a wandering Christian sadhu, walking India and the Himalayas barefoot in a saffron robe.",
    wiki: "Sadhu_Sundar_Singh",
  },
];

/** The dials in the fine-tuning explorer. `window` is the half-width of the
 *  life-permitting band on a -1..1 slider - drawn generously; the real ones
 *  are far narrower than any slider could show. */
export const DIALS = [
  {
    id: "gravity",
    label: "Gravity",
    detail: "About 10³⁶ times weaker than the electromagnetic force between two protons.",
    low: "Too weak: gas never collapses into stars. The universe stays dark and cold.",
    high: "Too strong: stars are small, fierce and short-lived, burning out before life could begin.",
    ok: "Stars ignite and burn steadily for billions of years.",
    window: 0.12,
  },
  {
    id: "strong",
    label: "Strong nuclear force",
    detail: "The glue that binds protons and neutrons in every atomic nucleus.",
    low: "A few percent weaker: nuclei beyond hydrogen fall apart. No carbon, no oxygen, no chemistry.",
    high: "A few percent stronger: hydrogen fuses too easily and is used up early. No long-lived stars, no water.",
    ok: "Stars forge carbon and oxygen - the stuff of planets and people.",
    window: 0.08,
  },
  {
    id: "lambda",
    label: "Cosmological constant",
    detail: "The energy of empty space that drives cosmic expansion.",
    low: "Too far negative: the universe collapses back on itself before galaxies can form.",
    high: "Too large: space flies apart so fast that matter never clumps into galaxies or stars.",
    ok: "Galaxies form, and stay together long enough for planets and life.",
    window: 0.05,
  },
] as const;
