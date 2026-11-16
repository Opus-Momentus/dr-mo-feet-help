/* ==========================================================
   EDIT THIS FILE to change what appears on the site.
   type: "service" or "product"
   ========================================================== */

const CHAIN = [
  { joint: "Feet", text: "Arch shape and big toe movement decide how force enters the leg. A collapsing arch can rotate the shin inward." },
  { joint: "Ankles", text: "Stiff or unstable ankles shift the load up to the knees and hips as you walk, run or stand." },
  { joint: "Knees", text: "Inward or outward knee drift changes hip position and how the thigh muscles work." },
  { joint: "Hips", text: "Tight or weak hips tilt the pelvis. The lower back then works harder to keep you upright." },
  { joint: "Lower back", text: "The lumbar spine absorbs the leftover load. Pain here often reflects problems further down the chain." }
];

const CATEGORIES = ["Assessment", "Treatment", "Insoles and orthotics", "Footwear", "Self-care", "Exercise"];

const LISTINGS = [
  { type: "service", category: "Assessment", name: "Podiatrist foot assessment",
    description: "Checks arch type, joint movement and pressure points, and advises on footwear or orthotics.",
    feet: "Finds foot mechanics that may add load to your back.", tags: ["podiatry", "arch", "assessment"], url: "#" },
  { type: "service", category: "Assessment", name: "Gait analysis",
    description: "Video or pressure-plate review of how you walk or run.",
    feet: "Shows how your feet, knees and hips move together.", tags: ["gait", "walking", "running"], url: "#" },
  { type: "service", category: "Treatment", name: "Physiotherapist",
    description: "Hands-on care and a progressive plan for lower back pain.",
    feet: "Can link hip and ankle stiffness to your back symptoms.", tags: ["physio", "rehab", "back"], url: "#" },
  { type: "service", category: "Treatment", name: "Osteopath or chiropractor",
    description: "Manual therapy and movement advice for spine and hip stiffness.",
    feet: "Looks at the pelvis and legs as part of back care.", tags: ["manual therapy", "spine"], url: "#" },
  { type: "service", category: "Insoles and orthotics", name: "Custom orthotics clinic",
    description: "Insoles made from a scan or cast of your feet.",
    feet: "Changes how your foot meets the ground in every step.", tags: ["custom", "orthotics", "insoles"], url: "#" },
  { type: "service", category: "Exercise", name: "Foot and hip strength classes",
    description: "Small-group sessions for foot, calf and hip control.",
    feet: "Builds the muscles that hold your arch and pelvis steady.", tags: ["strength", "classes", "pilates"], url: "#" },
  { type: "product", category: "Insoles and orthotics", name: "Off-the-shelf arch support insoles",
    description: "Ready-to-fit insoles with firm arch support and a deep heel cup.",
    feet: "A low-cost way to test whether more arch support helps.", tags: ["insoles", "arch", "support"], url: "#" },
  { type: "product", category: "Footwear", name: "Supportive everyday shoes",
    description: "Stable heel, flexible forefoot, room for the toes and a removable insole.",
    feet: "Daily footwear sets your baseline load.", tags: ["shoes", "support", "walking"], url: "#" },
  { type: "product", category: "Footwear", name: "Cushioned standing shoes",
    description: "Shock-absorbing soles for long shifts on hard floors.",
    feet: "Reduces impact travelling up to the spine.", tags: ["standing", "work", "cushion"], url: "#" },
  { type: "product", category: "Self-care", name: "Massage ball for the soles",
    description: "Small firm ball for rolling the underside of the foot.",
    feet: "Eases foot tension that can restrict movement above.", tags: ["massage", "plantar", "self-care"], url: "#" },
  { type: "product", category: "Self-care", name: "Anti-fatigue standing mat",
    description: "Cushioned mat for a desk or kitchen.",
    feet: "Softens hard floors during long standing.", tags: ["standing", "desk", "mat"], url: "#" },
  { type: "product", category: "Exercise", name: "Toe spacers and resistance bands",
    description: "Tools for toe spreading and foot-strength exercises.",
    feet: "Trains the small foot muscles that support the arch.", tags: ["toes", "bands", "strength"], url: "#" }
];
