/**
 * The Evidence page's content: the research on near-death experiences.
 *
 * STANDARD: every figure here traces to a named, published source, and every
 * strong case is paired with the strongest honest objection to it. The site's
 * promise is "no bias, no agenda"; overclaiming even once would break it. When
 * a number could not be verified it was left out rather than rounded up.
 */

/** Frequency of each element among the 62 patients who reported an NDE in the
 *  Dutch prospective study (van Lommel et al., The Lancet, 2001). */
export const CORE_ELEMENTS: { label: string; n: number; pct: number; note: string }[] = [
  { label: "Positive emotions", n: 35, pct: 56, note: "Peace, joy, and a love many say they can't describe." },
  { label: "Awareness of being dead", n: 31, pct: 50, note: "Knowing, calmly, that they had died." },
  { label: "Meeting deceased people", n: 20, pct: 32, note: "Relatives and friends who had already died." },
  { label: "Moving through a tunnel", n: 19, pct: 31, note: "Passage through darkness toward light." },
  { label: "A celestial landscape", n: 18, pct: 29, note: "Places of unearthly beauty and color." },
  { label: "Out-of-body experience", n: 15, pct: 24, note: "Watching their own body and the room from above." },
  { label: "Communication with the light", n: 14, pct: 23, note: "A presence of light experienced as a person." },
  { label: "Observing colors", n: 14, pct: 23, note: "Colors described as beyond the earthly spectrum." },
  { label: "Life review", n: 8, pct: 13, note: "Reliving their life, including its effect on others." },
  { label: "A border", n: 5, pct: 8, note: "A boundary they understood they must not cross." },
];

export const LANCET = {
  title: "Near-death experience in survivors of cardiac arrest: a prospective study in the Netherlands",
  authors: "van Lommel P, van Wees R, Meyers V, Elfferich I",
  journal: "The Lancet",
  year: 2001,
  url: "https://doi.org/10.1016/S0140-6736(01)07100-8",
};

export type Study = {
  year: string;
  who: string;
  title: string;
  finding: string;
  url?: string;
};

export const STUDIES: Study[] = [
  {
    year: "1975",
    who: "Raymond Moody, MD",
    title: "Life After Life",
    finding:
      "A psychiatrist and philosopher gathers some 150 accounts and names the phenomenon. The \"near-death experience\" enters medicine's vocabulary.",
  },
  {
    year: "1982",
    who: "Michael Sabom, cardiologist",
    title: "Recollections of Death",
    finding:
      "A skeptical cardiologist interviews 116 survivors. Thirty-two describe their own resuscitation in checkable detail; when control patients were asked to imagine one, about 80% made major errors.",
  },
  {
    year: "1983",
    who: "Bruce Greyson, psychiatrist",
    title: "The NDE Scale",
    finding:
      "A standardized 16-item scale lets researchers measure NDEs consistently. It is still the field's standard instrument four decades later.",
  },
  {
    year: "2001",
    who: "Pim van Lommel, cardiologist",
    title: "The Lancet study",
    finding:
      "344 consecutive cardiac-arrest survivors in ten Dutch hospitals; 62 (18%) report an NDE. No link is found to the duration of the arrest, the drugs given, or prior fear of death. Follow-ups at two and eight years find lasting change.",
    url: LANCET.url,
  },
  {
    year: "2009",
    who: "Janice Holden, researcher",
    title: "Veridical perception review",
    finding:
      "A review in The Handbook of Near-Death Experiences collects more than 100 published cases in which experiencers described verifiable details of events they should not have been able to perceive.",
  },
  {
    year: "2013",
    who: "Thonnard et al., University of Liège",
    title: "NDE memories vs. real memories",
    finding:
      "Measured with a standard memory questionnaire, NDE memories carried more detail and vividness than memories of real events - \"more real than real,\" and unlike memories of imagined ones.",
    url: "https://doi.org/10.1371/journal.pone.0057620",
  },
  {
    year: "2014",
    who: "Sam Parnia, MD, and colleagues",
    title: "AWARE",
    finding:
      "2,060 cardiac arrests across 15 hospitals. About 9% of the survivors interviewed in depth had an NDE, and one patient's awareness during his arrest was verified against records.",
    url: "https://doi.org/10.1016/j.resuscitation.2014.09.004",
  },
  {
    year: "2023",
    who: "Parnia et al., AWARE II",
    title: "Brain activity during CPR",
    finding:
      "Near-normal brain activity (EEG) was recorded in some patients up to 35–60 minutes into CPR, and survivors again reported lucid \"recalled experiences of death.\"",
    url: "https://doi.org/10.1016/j.resuscitation.2023.109903",
  },
];

export type HardCase = {
  title: string;
  kicker: string;
  what: string;
  why: string;
  caveat: string;
};

export const HARD_CASES: HardCase[] = [
  {
    kicker: "Phoenix, 1991",
    title: "The standstill operation",
    what:
      "To remove a giant brain aneurysm, surgeon Robert Spetzler cooled Pam Reynolds' body to about 10°C (50°F), stopped her heart and drained the blood from her head. Her eyes were taped shut and molded speakers in her ears played loud clicks to monitor her brainstem. Afterward she described the unusual bone saw (\"like an electric toothbrush\") and a conversation about her arteries being too small on one side.",
    why:
      "Her descriptions matched what happened in the room, under conditions in which ordinary seeing and hearing should have been impossible.",
    caveat:
      "Critics, including anesthesiologist Gerald Woerlee, argue her experience happened earlier in the operation, before the standstill, while she was anesthetized but may have been partly aware. The exact timing cannot be settled from the record.",
  },
  {
    kicker: "AWARE, 2014",
    title: "Three minutes, verified",
    what:
      "A 57-year-old man recalled the automated defibrillator's voice saying \"shock the patient,\" and described a man in blue scrubs and a cap who was in the room. Hospital records confirmed the details, and put his awareness at roughly three minutes into his cardiac arrest.",
    why:
      "It is the first case in a large prospective study in which awareness during cardiac arrest was checked against records, well past the point at which the brain is expected to stop functioning.",
    caveat:
      "It is one case. The study's hidden images above the beds could not be tested properly: most arrests happened in rooms that had none.",
  },
  {
    kicker: "Mindsight, 1999",
    title: "The blind who see",
    what:
      "Psychologists Kenneth Ring and Sharon Cooper interviewed blind people who had near-death and out-of-body experiences, including people blind from birth. Many described seeing during the experience: their bodies, the room, other people.",
    why:
      "People who have never had sight have no visual memories to hallucinate from, yet their accounts resemble those of sighted people.",
    caveat:
      "The accounts are retrospective and mostly unverifiable, and \"seeing\" for someone blind from birth is hard to define.",
  },
  {
    kicker: "Recollections of Death, 1982",
    title: "The control group",
    what:
      "Cardiologist Michael Sabom asked cardiac patients who had NOT had an NDE to imagine and describe a resuscitation. About 80% made major errors. The patients who said they had watched their own resuscitation described it in ways that held up.",
    why:
      "It tests the common objection that patients simply reconstruct what they already know about CPR from television.",
    caveat:
      "The groups were small and interviews happened after the fact, so the study is suggestive rather than conclusive.",
  },
];

export type Objection = {
  claim: string;
  explanation: string;
  response: string;
  take: string;
};

export const OBJECTIONS: Objection[] = [
  {
    claim: "It's just the brain starving of oxygen.",
    explanation:
      "Cardiac arrest cuts oxygen to the brain; hypoxia can cause confusion and hallucinations.",
    response:
      "Hypoxia typically produces confusion, agitation and fragmented, poorly remembered experiences. NDEs are reported as unusually clear, calm, structured and vividly remembered. In the Lancet study, the length of the arrest (and so the degree of oxygen loss) did not predict who had an NDE.",
    take: "Oxygen loss is almost certainly part of the physiology. It doesn't explain the clarity.",
  },
  {
    claim: "It's the drugs, or the anesthesia.",
    explanation: "Resuscitation drugs and anesthetics can alter perception.",
    response:
      "NDEs are reported by people who received no drugs at all: drownings, accidents, childbirth. The Lancet study found no link between medication and NDEs. Drug experiences such as ketamine can resemble parts of an NDE, but are usually described as dreamlike and distorted.",
    take: "Some drugs can mimic features. None reproduces the whole experience or its lasting effects.",
  },
  {
    claim: "It's a final surge of the dying brain.",
    explanation:
      "University of Michigan researchers found a burst of gamma waves in dying rats (2013) and in two of four dying patients after ventilator withdrawal (PNAS, 2023).",
    response:
      "This is the most serious recent explanation, and it deserves attention. But a surge lasting seconds to minutes doesn't account for accurate perception of events in the room, and AWARE II recorded near-normal brain activity during CPR itself, which complicates the idea of a single dying flash.",
    take: "It may show when experiences become possible. It doesn't show that the brain produces them.",
  },
  {
    claim: "It's REM intrusion, like vivid dreaming.",
    explanation:
      "Some researchers link NDEs to REM sleep bleeding into wakefulness, which causes sleep paralysis and vivid imagery.",
    response:
      "NDEs happen in unconscious patients during arrest, not at the border of sleep, and experiencers consistently distinguish them from dreams. Memory studies find NDE recollections carry more detail than memories of real events, the opposite of how dreams are remembered.",
    take: "Interesting as a possible predisposition. Weak as a full explanation.",
  },
  {
    claim: "People see what they expect to see.",
    explanation: "Culture and religious background shape what people report.",
    response:
      "Cultural details do vary. But the core (leaving the body, the light, deceased relatives, a border) appears across cultures and religions, in young children with no concept of death, and in lifelong atheists who expected nothing at all.",
    take: "Culture colors the telling. It doesn't seem to create the experience.",
  },
  {
    claim: "The memories are made up afterwards.",
    explanation: "Memory is reconstructive; people could build the story later.",
    response:
      "Prospective studies interview patients soon after resuscitation, and NDE memories prove remarkably stable over decades. People can generally tell a false memory from a real one, and NDE memories behave like memories of real events.",
    take: "The strongest counter to this is the stability and detail of the memories themselves.",
  },
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Are near-death experiences real?",
    a: "The experiences themselves are well documented: prospective studies in hospitals find that roughly 10–20% of cardiac-arrest survivors report one. What is debated is what they are. Researchers disagree on whether they are produced by the dying brain or are evidence that consciousness can continue apart from it.",
  },
  {
    q: "How common are near-death experiences?",
    a: "In the 2001 Lancet study of 344 cardiac-arrest survivors, 18% reported an NDE. The AWARE study (2014) found about 9% among survivors interviewed in depth. Estimates across the general population run into the millions of people.",
  },
  {
    q: "Can lack of oxygen explain near-death experiences?",
    a: "Oxygen deprivation is part of what happens during cardiac arrest, but it usually causes confusion and fragmented memory, while NDEs are described as clear and vividly remembered. In the Lancet study, the length of the arrest did not predict who had an NDE.",
  },
  {
    q: "Do people of all religions have near-death experiences?",
    a: "Yes. People of every faith and none report the same core features: leaving the body, a tunnel, a light experienced as a loving presence, deceased relatives and a border. Cultural details vary; the core does not.",
  },
  {
    q: "Are there negative or frightening near-death experiences?",
    a: "Yes. A minority of NDEs are distressing, with darkness, isolation or threatening beings. They are less often reported, and researchers believe they are under-reported. The home page's third vault collects some of these testimonies.",
  },
  {
    q: "What was the AWARE study?",
    a: "AWARE (2014), led by Dr. Sam Parnia, studied 2,060 cardiac arrests in 15 hospitals. It confirmed that some patients have awareness during cardiac arrest, including one verified case around three minutes into the arrest. AWARE II (2023) recorded near-normal brain activity during CPR in some patients.",
  },
];
