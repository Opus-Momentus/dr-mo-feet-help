export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type ArticleSource = {
  label: string;
  url: string;
};

export type Article = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  intro: string;
  sections: ArticleSection[];
  sources: ArticleSource[];
  related: string[];
};

export const articles: Article[] = [
  {
    slug: "feet-and-back-pain",
    category: "Understanding pain",
    title: "Can your feet affect your back?",
    summary:
      "Foot function and back pain can be connected, but a foot position or movement is rarely a complete explanation for low-back pain.",
    readTime: "5 min read",
    intro:
      "It is understandable to wonder whether the way your feet move is contributing to back pain. The foot, ankle, knee, hip and spine work together during standing and walking, so changes in one area may influence how you move. That does not mean your feet are necessarily the cause: low-back pain is often multifactorial, with contributions from activity, sleep, stress, previous injury, general health and other factors.",
    sections: [
      {
        heading: "A connected chain, not a single cause",
        paragraphs: [
          "When the foot contacts the ground, the rest of the lower limb adapts to keep you moving. Differences in foot shape, strength, mobility or comfort can change loading and movement for some people. Research on foot posture and lower-limb mechanics can help explain possible associations, but an association is not proof that one causes the other.",
          "Pain also changes movement. Someone with back pain may walk differently, or someone with a painful foot may alter their stride. The direction of influence is not always clear, and a scan or observation of foot movement alone cannot identify the source of pain.",
        ],
      },
      {
        heading: "What a sensible assessment looks at",
        paragraphs: [
          "A clinician can consider your symptoms, activities, footwear, foot and ankle comfort, strength, balance, hip and back movement, and what makes the pain better or worse. The useful question is usually not “Are my feet the cause?” but “What factors may be changeable and relevant for me?”",
          "A gradual return to comfortable activity, practical strength or mobility work, and support for sleep and overall health may be part of a plan. There is no single exercise or foot correction that works for everyone.",
        ],
      },
      {
        heading: "When to seek urgent help",
        paragraphs: [
          "Seek immediate medical attention for new bowel or bladder changes, numbness around the saddle or genital area, severe or progressive weakness in a leg, significant trauma, or fever with severe back symptoms. These symptoms need prompt assessment rather than self-treatment.",
        ],
      },
    ],
    sources: [
      {
        label: "WHO: Low back pain fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/low-back-pain",
      },
      {
        label: "Foot posture, foot function and low back pain research",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3828513/",
      },
      {
        label: "Mayo Clinic: Back pain symptoms and causes",
        url: "https://www.mayoclinic.org/diseases-conditions/back-pain/symptoms-causes/syc-20369906",
      },
    ],
    related: ["signs-to-notice", "orthotics-and-back-pain"],
  },
  {
    slug: "signs-to-notice",
    category: "Self-awareness",
    title: "Signs to notice when foot and back symptoms overlap",
    summary:
      "Notice patterns in symptoms and function without assuming that every foot or leg sensation comes from the back—or that every back problem starts at the feet.",
    readTime: "4 min read",
    intro:
      "Keeping track of symptoms can make a clinical conversation more useful. Look for patterns over time rather than trying to diagnose yourself from one sensation or one posture. Back pain can be felt in different places, and foot discomfort can have its own local causes.",
    sections: [
      {
        heading: "Patterns worth recording",
        paragraphs: [
          "Note where symptoms are felt, when they started, whether they travel down a leg, and what activities or positions change them. Also record foot-specific clues such as local tenderness, rubbing, a change in footwear tolerance, swelling, or pain that is clearly linked to a particular part of the foot.",
          "A short activity and symptom diary can include walking distance, sitting time, sleep, recent changes in training or work, and what helped. This is information to share with a qualified clinician—not a test that can identify the cause on its own.",
        ],
      },
      {
        heading: "Symptoms that deserve prompt attention",
        paragraphs: [
          "Arrange medical assessment for persistent or worsening pain, new numbness or tingling, or weakness that affects walking or everyday tasks. Seek immediate medical attention for bowel or bladder changes, saddle numbness, severe or progressive leg weakness, significant trauma, or fever with severe symptoms.",
          "The urgency depends on the whole picture, including how quickly symptoms developed and your general health. If you are unsure whether a symptom is urgent, contact an appropriate medical service rather than relying on an online checklist.",
        ],
      },
      {
        heading: "Avoid over-interpreting alignment",
        paragraphs: [
          "Feet naturally vary in shape and movement, and an asymmetry is not automatically a problem. A visible arch, a worn shoe, or a change in walking style may be relevant, but it does not by itself establish the cause of back pain. Assessment should focus on symptoms, function and your goals.",
        ],
      },
    ],
    sources: [
      {
        label: "WHO: Low back pain fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/low-back-pain",
      },
      {
        label: "Mayo Clinic: Back pain symptoms and causes",
        url: "https://www.mayoclinic.org/diseases-conditions/back-pain/symptoms-causes/syc-20369906",
      },
    ],
    related: ["feet-and-back-pain", "finding-the-right-care"],
  },
  {
    slug: "orthotics-and-back-pain",
    category: "Treatment choices",
    title: "Orthotics and back pain: what they can and cannot do",
    summary:
      "Orthotics may be appropriate for some foot problems, but they should not be presented as a general treatment for low-back pain.",
    readTime: "5 min read",
    intro:
      "Orthotics are inserts or devices intended to change support, comfort or load around the foot. They can be useful when prescribed or selected for a specific foot condition or functional need. That is different from claiming that an insert will treat low-back pain for everyone.",
    sections: [
      {
        heading: "A targeted tool, not a universal fix",
        paragraphs: [
          "If you have a painful foot condition, a clinician may discuss footwear, activity changes, exercises or an orthotic as part of a broader plan. The aim should be clear: for example, improving comfort or helping you tolerate a particular activity. Fit, comfort and your response over time matter.",
          "Do not be discouraged from using an orthotic that is helping a diagnosed foot problem simply because it is not a proven stand-alone treatment for low-back pain. The right decision depends on the condition being treated, the device, and how it affects your function.",
        ],
      },
      {
        heading: "What guidelines say about low-back pain",
        paragraphs: [
          "NICE advises not to offer foot orthotics or rocker-sole shoes solely for managing low-back pain. This recommendation does not mean orthotics are never appropriate; it means low-back pain alone is not a sound reason to prescribe them as a routine intervention.",
          "If someone suggests an insert, ask what specific problem it is intended to address, how success will be judged, how long to try it, and what to do if it increases pain. Be cautious of claims that an insert will realign the whole body or cure back pain.",
        ],
      },
      {
        heading: "Build a broader plan",
        paragraphs: [
          "Low-back pain often has more than one contributor. A plan may include staying as active as is comfortable, graded exercise, education and support for relevant physical or psychosocial factors. Seek immediate medical attention for bowel or bladder changes, saddle numbness, severe or progressive leg weakness, significant trauma, or fever with severe symptoms.",
        ],
      },
    ],
    sources: [
      {
        label: "NICE guideline NG59: Recommendations",
        url: "https://www.nice.org.uk/guidance/ng59/chapter/recommendations",
      },
      {
        label: "WHO: Low back pain fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/low-back-pain",
      },
      {
        label: "Foot posture, foot function and low back pain research",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3828513/",
      },
    ],
    related: ["feet-and-back-pain", "finding-the-right-care"],
  },
  {
    slug: "finding-the-right-care",
    category: "Getting support",
    title: "Finding the right care for foot-related back concerns",
    summary:
      "Good care starts with a careful history, a proportionate examination and a plan that matches your symptoms—not with a promise of one perfect correction.",
    readTime: "5 min read",
    intro:
      "You do not need to decide whether your feet or your back are “the problem” before asking for help. A qualified health professional can help sort out what needs attention, what can be monitored, and which treatments fit your goals and preferences.",
    sections: [
      {
        heading: "Who can help?",
        paragraphs: [
          "A primary-care clinician or another appropriately qualified health professional can assess back symptoms and decide whether further care is needed. A physiotherapist may help with movement, activity and exercise planning. A podiatrist may assess a foot-specific condition, footwear and whether an orthotic has a clear role. The appropriate professional depends on the symptoms and local care pathways.",
          "Be wary of anyone who guarantees that a single alignment finding explains all pain, promises a cure, or recommends an expensive device without explaining the intended benefit and alternatives.",
        ],
      },
      {
        heading: "Questions to take to an appointment",
        paragraphs: [
          "Ask what the working explanation is, what other possibilities have been considered, and what you can safely do now. If a device or treatment is suggested, ask what symptom or functional problem it targets, how long to trial it, what improvement would count as meaningful, and when the plan should be reviewed.",
          "Bring a list of medicines and relevant health conditions, plus notes about onset, activity limits, sleep and any numbness or weakness. Clear information helps keep the assessment focused on your whole situation rather than on foot posture alone.",
        ],
      },
      {
        heading: "Know when it is urgent",
        paragraphs: [
          "Seek immediate medical attention for bowel or bladder changes, numbness in the saddle area, severe or progressive weakness in a leg, significant trauma, or fever with severe back symptoms. For other new, persistent or worsening symptoms, arrange timely medical advice. Do not delay urgent assessment while trying a new exercise, shoe or orthotic.",
        ],
      },
    ],
    sources: [
      {
        label: "WHO: Low back pain fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/low-back-pain",
      },
      {
        label: "NICE guideline NG59: Recommendations",
        url: "https://www.nice.org.uk/guidance/ng59/chapter/recommendations",
      },
      {
        label: "Mayo Clinic: Back pain symptoms and causes",
        url: "https://www.mayoclinic.org/diseases-conditions/back-pain/symptoms-causes/syc-20369906",
      },
    ],
    related: ["signs-to-notice", "orthotics-and-back-pain"],
  },
];
