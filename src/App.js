import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckSquare,
  ChevronRight,
  BarChart2,
  Cpu,
  ShoppingBag,
  Truck,
  ShieldAlert,
  Award,
  ArrowRight,
  Layout,
  Sparkles,
  Wand2,
  Bot,
  RefreshCw,
  Copy,
  Check,
  X,
  FileText,
  Lightbulb,
  Calculator,
  DollarSign,
  Percent,
  Trello,
  AlertCircle,
  Search,
  Layers,
  TrendingUp,
  Target,
  Crown,
  Zap,
} from "lucide-react";

const EmpireDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [activeView, setActiveView] = useState("course");
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  // AI Lab State
  const [aiTool, setAiTool] = useState("niche");
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Factory (Kanban) State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Batch 1: Gothmas Journals",
      status: "backlog",
      priority: "high",
    },
    {
      id: 2,
      title: "Batch 2: ADHD Planners",
      status: "design",
      priority: "med",
    },
    {
      id: 3,
      title: "Batch 3: Welder Flashcards",
      status: "upload",
      priority: "high",
    },
    {
      id: 4,
      title: "Batch 4: Canning Labels",
      status: "live",
      priority: "low",
    },
  ]);

  // Simulator State
  const [simData, setSimData] = useState({
    startingListings: 0,
    uploadRatePerWeek: 5,
    avgPrice: 12.0,
    conversionRate: 2.5,
    visitsPerListing: 10,
  });

  // Profit Calculator State
  const [calcData, setCalcData] = useState({
    price: 15.0,
    cost: 0.0,
    discount: 0,
    adSpend: 1.0,
    isOffsiteAds: false,
  });

  // --- LOGIC: GAMIFICATION ---
  const calculateLevel = () => {
    // Calculate total possible action items across all modules
    const totalActionItems = modules.reduce(
      (acc, curr) => acc + curr.content.actionItems.length,
      0
    );
    const completed = Object.values(completedTasks).filter(Boolean).length;
    const kanbanDone = tasks.filter((t) => t.status === "live").length;

    // XP Formula: 100 XP per checklist item, 200 XP per launched product batch
    const xp = completed * 100 + kanbanDone * 200;

    // Progress for progress bar
    const progressPercentage = Math.round((completed / totalActionItems) * 100);

    let level = "Novice";
    let icon = <CheckSquare className="w-4 h-4" />;

    if (xp > 500) {
      level = "Merchant";
      icon = <ShoppingBag className="w-4 h-4" />;
    }
    if (xp > 1500) {
      level = "Tycoon";
      icon = <Crown className="w-4 h-4" />;
    }
    if (xp > 3000) {
      level = "Emperor";
      icon = <Zap className="w-4 h-4" />;
    }

    return { xp, level, icon, completed, progressPercentage };
  };

  // --- LOGIC: SIMULATOR ---
  const generateProjection = () => {
    const months = 12;
    const data = [];
    let currentListings = simData.startingListings;

    for (let i = 1; i <= months; i++) {
      // Listings grow by upload rate * 4 weeks
      currentListings += simData.uploadRatePerWeek * 4;

      // Traffic grows as listings accumulate (compounding effect)
      const totalVisits = currentListings * simData.visitsPerListing;

      // Sales = Traffic * Conversion Rate
      const totalSales = totalVisits * (simData.conversionRate / 100);

      // Revenue
      const revenue = totalSales * simData.avgPrice;

      data.push({
        month: i,
        revenue: Math.round(revenue),
        listings: currentListings,
      });
    }
    return data;
  };

  const projection = generateProjection();

  // --- LOGIC: API ---
  const callGeminiAPI = async (prompt) => {
    const apiKey = ""; // Injected at runtime
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const delays = [1000, 2000, 4000];
    for (let i = 0; i <= delays.length; i++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          if (response.status === 429 && i < delays.length) {
            await new Promise((r) => setTimeout(r, delays[i]));
            continue;
          }
          throw new Error(`API Error: ${response.status}`);
        }
        const data = await response.json();
        return (
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "No response generated."
        );
      } catch (error) {
        if (i === delays.length) throw error;
      }
    }
  };

  const handleGenerate = async (overridePrompt = null) => {
    const inputToUse = overridePrompt ? "Context Provided" : aiInput;
    if (!inputToUse.trim()) return;
    setIsAiLoading(true);
    setAiOutput("");
    let prompt = overridePrompt || "";
    if (!overridePrompt) {
      if (aiTool === "niche") {
        prompt = `Act as an expert Etsy market researcher following the 'Micro-Niche Clustering' strategy. The user is interested in: '${aiInput}'. Suggest 3 distinct, high-utility 'Micro-Niche Clusters' that are low-competition. Format with bold headings.`;
      } else if (aiTool === "audit") {
        prompt = `Act as a ruthless Etsy SEO algorithm auditor. Critique this listing title/tags string: "${aiInput}". 1. Give it a Score out of 100. 2. Identify 3 "Dead" keywords (too broad). 3. Suggest 3 "Long-Tail" replacements. 4. Rewrite the title to be perfectly optimized for the 2025 algorithm.`;
      } else if (aiTool === "listing") {
        prompt = `Write a high-converting Etsy listing for: '${aiInput}'. Include Title, Description (Benefit-focused), and 13 Tags.`;
      } else if (aiTool === "tutor") {
        prompt = `Create a step-by-step practical worksheet for an Etsy seller to master: "${aiInput}". The output should be an actionable list of 5 steps.`;
      }
    }
    try {
      const result = await callGeminiAPI(prompt);
      setAiOutput(result);
    } catch (err) {
      setAiOutput("Error: Failed to generate content. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- LOGIC: FACTORY & CALCULATOR ---
  const moveTask = (id, newStatus) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  const addTask = () => {
    const text = prompt("Enter Product Batch Name:");
    if (text)
      setTasks([
        ...tasks,
        { id: Date.now(), title: text, status: "backlog", priority: "med" },
      ]);
  };
  const calculateProfit = () => {
    const listingFee = 0.2;
    const transactionFee =
      calcData.price * 0.065 + (calcData.price * 0.03 + 0.25);
    const offsiteFee = calcData.isOffsiteAds ? calcData.price * 0.15 : 0;
    const totalCosts =
      calcData.cost +
      listingFee +
      transactionFee +
      offsiteFee +
      Number(calcData.adSpend);
    const profit = calcData.price - totalCosts;
    const margin = calcData.price > 0 ? (profit / calcData.price) * 100 : 0;
    return {
      profit: profit.toFixed(2),
      margin: margin.toFixed(1),
      fees: (listingFee + transactionFee + offsiteFee).toFixed(2),
    };
  };
  const stats = calculateProfit();

  // --- FULL COURSE DATA (RESTORED) ---
  const modules = [
    {
      id: 1,
      title: "Market Strategy & Mindset",
      icon: <BarChart2 className="w-5 h-5" />,
      duration: "Week 1",
      description:
        "Understanding the shift from generalist art stores to utility-driven micro-niches.",
      content: {
        overview:
          "The 'Generalist Fallacy' is the primary reason for failure in 2025. Success now relies on 'Micro-Niche Clustering'—serving specific avatars with high-utility products rather than broad aesthetics.",
        keyConcepts: [
          {
            title: "The Visual Search Engine Shift",
            summary: "Etsy is for specific solutions, not just browsing art.",
            details:
              "Etsy's algorithm has evolved. It no longer prioritizes generic 'browsing' behavior. It now heavily favors 'Visual Search' where users have a specific problem in mind. If your product is just 'pretty' without solving a specific visual or functional problem, it is invisible. You must optimize for 'Search Intent'—what is the user actually trying to ACCOMPLISH?",
          },
          {
            title: "Signal-to-Noise Ratio",
            summary: "Generic terms are dead; long-tail specificity is key.",
            details:
              "The 'Noise' on Etsy is AI-generated generic art. To cut through, you need a high 'Signal'. This means using keywords that describe the *exact* use case. Instead of 'Wall Art', use 'Pediatric Dentist Office Decor'. Instead of 'Planner', use 'ADHD Dopamine Menu for Students'. The narrower the focus, the higher the conversion rate.",
          },
          {
            title: "Emerging Aesthetic Hybrids",
            summary: "Combining trends like 'Gothmas' creates blue oceans.",
            details:
              "One of the most powerful strategies for 2025 is 'Aesthetic Blending'. Take a seasonal event (Christmas) and a subculture (Goth) to create 'Gothmas'. Other examples: 'Pinkoween' (Pink + Halloween), 'Cowboy Coastal' (Western + Beach). This reduces competition because you aren't fighting the whole market, just the intersection.",
          },
          {
            title: "The Utility Pivot",
            summary: "Shift focus from decoration to function.",
            details:
              "Decor is a luxury; Utility is a necessity. In a recession or tight economy, people still buy things they *need*. Medical logs, study guides, legal forms, and business templates are 'Recession-Proof'. Your empire should be built on 70% Utility products and 30% Aesthetic products.",
          },
        ],
        actionItems: [
          {
            id: "m1-1",
            text: "Analyze the 'Gothmas' trend for Q4 crossover opportunities.",
          },
          {
            id: "m1-2",
            text: "Identify one 'Blue Ocean' utility niche where demand > supply.",
          },
          {
            id: "m1-3",
            text: "Commit to the 'Micro-Niche Clustering' strategy (10 separate stores).",
          },
        ],
      },
    },
    {
      id: 2,
      title: "The Technical Factory Model",
      icon: <Cpu className="w-5 h-5" />,
      duration: "Week 2",
      description:
        "Building the automation stack to replace manual creation with industrialized production.",
      content: {
        overview:
          "To manage 10 stores, you must move from a 'craftsman' model to a 'factory' model using AI and scripting.",
        keyConcepts: [
          {
            title: "Midjourney Permutations",
            summary: "Using matrix prompts to generate collections.",
            details:
              "Don't generate one image at a time. Use Midjourney's { } permutation feature. Example: '/imagine prompt: a vintage botanical chart of {roses, lilies, ferns, mushrooms} in the style of 1800s lithograph'. This single prompt generates 4 distinct product lines instantly. This is the core of the 'Factory' volume strategy.",
          },
          {
            title: "Data Engineering with ChatGPT",
            summary: "Generating structured CSV data for bulk creation.",
            details:
              "Use LLMs to create the 'Skeleton' of your products. If you are making flashcards, ask ChatGPT to 'Generate a table with 50 rows. Column A: Spanish Word, Column B: English Translation, Column C: Example Sentence.' Export this to CSV. This file becomes the fuel for your design engine.",
          },
          {
            title: "Canva Bulk Create",
            summary: "Mapping CSV data to templates instantly.",
            details:
              "In Canva, design ONE master template. Then use the 'Bulk Create' app on the sidebar. Upload your CSV from ChatGPT. Right-click elements in your design to 'Connect Data'. Click 'Generate', and Canva will instantly build 50 unique pages based on your spreadsheet.",
          },
          {
            title: "Python Batch Processing",
            summary: "Automating watermarks and zip files.",
            details:
              "Managing 1000s of files manually is impossible. We use simple Python scripts (using the Pillow library) to: 1. Open every image in a folder, 2. Overlay your transparent logo (watermark), 3. Save it to a 'Ready to Upload' folder. This reduces hours of work to seconds.",
          },
        ],
        actionItems: [
          {
            id: "m2-1",
            text: "Set up Midjourney v6 and test permutation prompts (e.g., {rose, lily}).",
          },
          {
            id: "m2-2",
            text: "Create a Python script using 'Pillow' to batch watermark images.",
          },
          {
            id: "m2-3",
            text: "Master 'Canva Bulk Create' for generating 50+ pages in minutes.",
          },
          {
            id: "m2-4",
            text: "Bookmark Heritage Type & Smithsonian Open Access for public domain assets.",
          },
        ],
      },
    },
    {
      id: 3,
      title: "Cluster A: Cognitive & Medical",
      icon: <Layout className="w-5 h-5" />,
      duration: "Week 3-4",
      description:
        "Launching high-utility stores for neurodivergence and health management.",
      content: {
        overview:
          "These niches are characterized by high urgency and low price sensitivity. Buyers need these tools for functioning, not just decoration.",
        keyConcepts: [
          {
            title: "Neurodivergent Tools",
            summary: "Dopamine Menus, Gamified Habit Trackers.",
            details:
              "ADHD and Autism support tools are exploding. 'Dopamine Menus' (visual lists of activities that give stimulation) are trending. Visual timers and gamified todo lists help this demographic function. Focus on 'Executive Dysfunction' solutions.",
          },
          {
            title: "Senior Pet Care",
            summary: "QOL Assessment Scales, Medication Logs.",
            details:
              "As pets live longer, owners need medical management. 'Canine Cognitive Dysfunction' trackers help owners decide when it's time to say goodbye. This is an emotional, high-utility niche.",
          },
          {
            title: "Clinical Resources",
            summary: "Adult Aphasia Flashcards, Stroke Recovery.",
            details:
              "Most speech therapy materials are for kids. Adults recovering from strokes need 'dignified' therapy tools—real photos, not cartoons. This is a massive gap in the market.",
          },
          {
            title: "Dark Mode Design",
            summary: "Optimizing for iPad and light sensitivity.",
            details:
              "Many neurodivergent users prefer Dark Mode to reduce eye strain. Ensure your digital planners and PDFs come in a high-contrast Dark Mode version.",
          },
        ],
        actionItems: [
          {
            id: "m3-1",
            text: "Create 'Dopamine Menu' templates for ADHD niche.",
          },
          {
            id: "m3-2",
            text: "Design a 'Canine Cognitive Dysfunction' journal.",
          },
          {
            id: "m3-3",
            text: "Generate realistic (non-cartoon) Aphasia flashcards using AI.",
          },
          {
            id: "m3-4",
            text: "Add strict medical disclaimers to all listings.",
          },
        ],
      },
    },
    {
      id: 4,
      title: "Cluster B: Professional & Trade",
      icon: <Award className="w-5 h-5" />,
      duration: "Week 5-6",
      description:
        "Targeting blue-collar professions and asset management needs.",
      content: {
        overview:
          "Digital-native tradespeople are underserved. This cluster focuses on certification prep and professional identity.",
        keyConcepts: [
          {
            title: "Trade Cert Prep",
            summary: "HVAC EPA 608, Welding AWS CWI.",
            details:
              "Blue collar workers need to pass written exams to advance. They prefer digital flashcards they can use on their phone on the job site. Niche down to specific exam codes (EPA 608, not just 'HVAC').",
          },
          {
            title: "Blue Collar Identity",
            summary: "POD: 'Underwater Welder Wife', 'Wind Tech'.",
            details:
              "Spouses of dangerous trades (Linemen, Underwater Welders, Oil Rig workers) love merchandise that identifies their partner's sacrifice. This is a high-emotion purchase.",
          },
          {
            title: "Asset Protection",
            summary: "TCG Grading Logs, Coin Inventory.",
            details:
              "Collectors view their collections as investment portfolios. They need spreadsheets to track 'Buy Price', 'Current Value', and 'Grading Status' (PSA/BGS) to monitor ROI.",
          },
          {
            title: "Compliance",
            summary: "Market as 'Study Aids', never 'Exam Dumps'.",
            details:
              "Never sell actual exam questions (copyright violation). Sell 'Study Guides' based on public knowledge of the curriculum.",
          },
        ],
        actionItems: [
          {
            id: "m4-1",
            text: "Generate HVAC/Welding flashcard content via ChatGPT.",
          },
          {
            id: "m4-2",
            text: "Design 'Notary Intake Forms' for mobile notaries.",
          },
          {
            id: "m4-3",
            text: "Setup POD patches for specific trades (e.g., Linemen) via Printful.",
          },
          {
            id: "m4-4",
            text: "Build an Excel tracker for TCG/Coin collection ROI.",
          },
        ],
      },
    },
    {
      id: 5,
      title: "Cluster C: Lifestyle & Hobby",
      icon: <ShoppingBag className="w-5 h-5" />,
      duration: "Week 7-8",
      description:
        "Catering to intense hobbies involving collecting and organizing.",
      content: {
        overview:
          "These hobbies have high consumption rates and require deep organization.",
        keyConcepts: [
          {
            title: "Urban Homesteading",
            summary: "Egg Production Charts, Canning Labels.",
            details:
              "The 'Prepper-lite' demographic loves data. Egg trackers (Chicken name vs Eggs laid) and batch tracking for canning safety are popular utilities.",
          },
          {
            title: "Genealogy Shadow Work",
            summary: "'Brick Wall' worksheets, Cemetery Logs.",
            details:
              "Genealogy is huge. 'Brick Wall' worksheets help researchers break through dead ends. Cemetery logs help them track grave visits. Avoid generic family trees; go for the research tools.",
          },
          {
            title: "Dark Academia Junk Journaling",
            summary: "Digi-Kits, Ephemera.",
            details:
              "Junk Journaling is physical scrapbooking using printed digital assets. 'Dark Academia' and 'Gothmas' are the top aesthetics here. High volume, repeat buyers.",
          },
          {
            title: "TTRPG Management",
            summary: "DM Session Logs, World Building Bibles.",
            details:
              "Dungeon Masters spend hours prepping. Give them tools to organize NPCs, loot tables, and session recaps. The aesthetic must be immersive (parchment, fantasy fonts).",
          },
        ],
        actionItems: [
          {
            id: "m5-1",
            text: "Create 'Brick Wall' solutions for advanced Genealogists.",
          },
          { id: "m5-2", text: "Design 'Gothmas' themed junk journal pages." },
          {
            id: "m5-3",
            text: "Build a Dungeon Master 'Session Log' template.",
          },
          {
            id: "m5-4",
            text: "Create functional Canning Labels with batch tracking.",
          },
        ],
      },
    },
    {
      id: 6,
      title: "Logistics & Traffic Automation",
      icon: <Truck className="w-5 h-5" />,
      duration: "Ongoing",
      description:
        "Setting up the self-feeding traffic loop and POD supply chain.",
      content: {
        overview:
          "Automate marketing to prevent burnout and select the right suppliers for physical goods.",
        keyConcepts: [
          {
            title: "Pinterest Automation",
            summary: "RSS Feed -> IFTTT -> Pinterest Pin.",
            details:
              "Don't pin manually. Set up an IFTTT (If This Then That) applet. Trigger: New Item in Etsy RSS Feed. Action: Create Pin on Pinterest Board. This runs forever in the background.",
          },
          {
            title: "Email Retention Loops",
            summary: "EverBee/Alura for post-purchase flows.",
            details:
              "The money is in the return customer. Include a QR code in your digital download that leads to a 'Freebie Library' in exchange for an email. Then send automated flows requesting reviews.",
          },
          {
            title: "POD Strategy",
            summary:
              "Printify (General), Gelato (Paper), Printful (Embroidery).",
            details:
              "Don't put all eggs in one basket. Use Gelato for posters (lower shipping costs globally). Use Printful for high-quality embroidery. Use Printify for standard apparel.",
          },
          {
            title: "Embroidery Opportunity",
            summary: "No minimums for niche patches.",
            details:
              "Embroidered patches are high margin. You can now do POD patches with no minimums. Great for the 'Blue Collar Identity' niche.",
          },
        ],
        actionItems: [
          { id: "m6-1", text: "Connect Etsy RSS feed to Pinterest via IFTTT." },
          {
            id: "m6-2",
            text: "Create a 'Lead Magnet' (freebie) for email capture.",
          },
          {
            id: "m6-3",
            text: "Set up automated review request emails (Day 3 post-purchase).",
          },
        ],
      },
    },
    {
      id: 7,
      title: "Legal & Compliance Guardrails",
      icon: <ShieldAlert className="w-5 h-5" />,
      duration: "Critical",
      description:
        "Protecting your empire from suspension and legal liability.",
      content: {
        overview:
          "Strict adherence to Etsy's policies is non-negotiable for a 10-store portfolio.",
        keyConcepts: [
          {
            title: "Medical Claims",
            summary: "Use 'Educational Purposes Only' disclaimers.",
            details:
              "You cannot claim to 'cure' or 'diagnose' anything. Your 'Anxiety Journal' is for 'Mindfulness', not 'Treating Anxiety'. This distinction saves you from FDA/FTC wrath.",
          },
          {
            title: "Academic Integrity",
            summary: "Label as 'Study Aids', avoid 'Real Test Questions'.",
            details:
              "Selling actual questions from a test is copyright infringement. Selling 'Flashcards based on the textbook concepts' is fair use (usually). Always err on the side of 'Study Aid'.",
          },
          {
            title: "Licensing Assets",
            summary: "Modify Creative Fabrica assets.",
            details:
              "Never upload a Creative Fabrica asset 'as is'. You must modify it (combine elements, add text, change colors) to meet the 'Value Add' requirement of their license.",
          },
        ],
        actionItems: [
          {
            id: "m7-1",
            text: "Audit all medical/health listings for disallowed claims.",
          },
          {
            id: "m7-2",
            text: "Verify all vintage assets are CC0 (Public Domain).",
          },
          {
            id: "m7-3",
            text: "Ensure study aids are original content, not copied exams.",
          },
        ],
      },
    },
  ];

  const userStats = calculateLevel();
  const activeModule = modules.find((m) => m.id === activeModuleId);

  return (
    <div className="flex h-screen bg-slate-50 text-gray-900 font-sans overflow-hidden">
      {/* --- MODAL --- */}
      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setSelectedConcept(null)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="overflow-y-auto pr-2">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {selectedConcept.title}
              </h3>
              <p className="text-lg text-emerald-700 font-medium mb-4">
                {selectedConcept.summary}
              </p>
              <div className="prose prose-slate mb-6">
                <p>{selectedConcept.details}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedConcept(null);
                  setActiveView("ai-lab");
                  setAiTool("tutor");
                  setAiInput(selectedConcept.title);
                }}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors font-bold shadow-md"
              >
                <Wand2 className="w-5 h-5 mr-2" /> Generate Worksheet with AI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-slate-900 text-white flex flex-col shadow-xl z-10 shrink-0">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="text-emerald-400 w-6 h-6" /> Empire OS
          </h1>

          {/* GAMIFICATION CARD */}
          <div className="mt-6 bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                Current Rank
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                {userStats.xp} XP
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                {userStats.icon}
              </div>
              <span className="font-bold text-lg text-white">
                {userStats.level}
              </span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${userStats.progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-2 text-right">
              {userStats.progressPercentage}% Course Complete
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar">
          <div className="px-6 text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2 mt-2">
            Strategy Core
          </div>
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                setActiveModuleId(module.id);
                setActiveView("course");
              }}
              className={`w-full flex items-center px-6 py-3 text-left border-l-4 transition-colors ${
                activeView === "course" && activeModuleId === module.id
                  ? "bg-slate-800 border-emerald-500 text-white"
                  : "border-transparent text-slate-400 hover:bg-slate-800"
              }`}
            >
              <div
                className={`mr-3 ${
                  activeView === "course" && activeModuleId === module.id
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {module.icon}
              </div>
              <span className="text-sm font-medium line-clamp-1">
                {module.title}
              </span>
            </button>
          ))}

          <div className="px-6 text-xs text-slate-500 uppercase tracking-widest font-semibold mb-2 mt-6">
            Empire Tools
          </div>

          <button
            onClick={() => setActiveView("simulator")}
            className={`w-full flex items-center px-6 py-3 text-left border-l-4 transition-colors ${
              activeView === "simulator"
                ? "bg-amber-900/30 border-amber-500 text-amber-100"
                : "border-transparent text-slate-400 hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-3 text-amber-500" />{" "}
            <span className="text-sm font-medium">The Simulator</span>
          </button>

          <button
            onClick={() => setActiveView("factory")}
            className={`w-full flex items-center px-6 py-3 text-left border-l-4 transition-colors ${
              activeView === "factory"
                ? "bg-blue-900/30 border-blue-500 text-blue-100"
                : "border-transparent text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Trello className="w-5 h-5 mr-3 text-blue-500" />{" "}
            <span className="text-sm font-medium">Factory Floor</span>
          </button>

          <button
            onClick={() => setActiveView("profit")}
            className={`w-full flex items-center px-6 py-3 text-left border-l-4 transition-colors ${
              activeView === "profit"
                ? "bg-green-900/30 border-green-500 text-green-100"
                : "border-transparent text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Calculator className="w-5 h-5 mr-3 text-green-500" />{" "}
            <span className="text-sm font-medium">Profit Lab</span>
          </button>

          <button
            onClick={() => setActiveView("ai-lab")}
            className={`w-full flex items-center px-6 py-3 text-left border-l-4 transition-colors ${
              activeView === "ai-lab"
                ? "bg-indigo-900/50 border-indigo-500 text-indigo-100"
                : "border-transparent text-slate-400 hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-5 h-5 mr-3 text-indigo-400" />{" "}
            <span className="text-sm font-medium">AI Workshop</span>
          </button>
        </div>
        <div className="p-4 bg-slate-950 text-xs text-slate-600 text-center">
          v5.0 Platinum • Complete
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* VIEW: COURSE */}
        {activeView === "course" && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-8">
              <header className="flex justify-between items-end border-b pb-6">
                <div>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                    Module {activeModuleId}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">
                    {modules.find((m) => m.id === activeModuleId).title}
                  </h2>
                  <p className="text-slate-500 mt-1">
                    {modules.find((m) => m.id === activeModuleId).description}
                  </p>
                </div>
              </header>
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Executive Summary
                </h3>
                <p className="text-slate-800 leading-relaxed text-lg">
                  {
                    modules.find((m) => m.id === activeModuleId).content
                      .overview
                  }
                </p>
              </section>
              <div className="grid md:grid-cols-2 gap-6">
                {modules
                  .find((m) => m.id === activeModuleId)
                  .content.keyConcepts.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedConcept(c)}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-300 cursor-pointer transition-all group h-full flex flex-col"
                    >
                      <div className="flex justify-between items-start">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                      </div>
                      <h4 className="font-bold text-lg text-slate-800 mb-2">
                        {c.title}
                      </h4>
                      <p className="text-slate-600 text-sm flex-1">
                        {c.summary}
                      </p>
                      <div className="mt-4 text-xs text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Click for Deep Dive & AI Worksheet
                      </div>
                    </div>
                  ))}
              </div>
              <section className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6">
                <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2 text-emerald-600" />{" "}
                  Implementation Checklist
                </h3>
                <div className="space-y-3">
                  {modules
                    .find((m) => m.id === activeModuleId)
                    .content.actionItems.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
                          completedTasks[item.id]
                            ? "bg-emerald-100 border-emerald-200 opacity-75"
                            : "bg-white border-emerald-200 hover:border-emerald-400 shadow-sm"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                          checked={!!completedTasks[item.id]}
                          onChange={() =>
                            setCompletedTasks((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }))
                          }
                        />
                        <span
                          className={`ml-3 text-sm font-medium ${
                            completedTasks[item.id]
                              ? "text-emerald-800 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* VIEW: SIMULATOR */}
        {activeView === "simulator" && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <header className="mb-8 border-b pb-6">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center">
                  <TrendingUp className="w-8 h-8 mr-3 text-amber-500" /> Empire
                  Simulator
                </h2>
                <p className="text-slate-500 mt-2">
                  Project your growth. Input your effort level to see your
                  future revenue curve.
                </p>
              </header>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 lg:col-span-1 h-fit">
                  <h3 className="font-bold text-slate-800 border-b pb-2">
                    Growth Levers
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Uploads Per Week
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={simData.uploadRatePerWeek}
                      onChange={(e) =>
                        setSimData({
                          ...simData,
                          uploadRatePerWeek: Number(e.target.value),
                        })
                      }
                      className="w-full mt-2 accent-amber-500"
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span>1</span>
                      <span className="font-bold text-amber-600">
                        {simData.uploadRatePerWeek} products
                      </span>
                      <span>20</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Avg Price ($)
                    </label>
                    <input
                      type="number"
                      value={simData.avgPrice}
                      onChange={(e) =>
                        setSimData({
                          ...simData,
                          avgPrice: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Conversion Rate (%)
                    </label>
                    <input
                      type="number"
                      value={simData.conversionRate}
                      onChange={(e) =>
                        setSimData({
                          ...simData,
                          conversionRate: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 border rounded mt-1"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Etsy Avg is 1-3%
                    </p>
                  </div>
                </div>

                {/* Graph */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-slate-800">
                      12 Month Revenue Projection
                    </h3>
                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase">
                        Projected MRR (Month 12)
                      </div>
                      <div className="text-3xl font-extrabold text-emerald-600">
                        ${projection[11].revenue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* CSS Bar Chart */}
                  <div className="flex items-end justify-between h-64 w-full gap-2 border-b border-slate-100 pb-2">
                    {projection.map((d) => (
                      <div
                        key={d.month}
                        className="flex-1 flex flex-col items-center group relative"
                      >
                        <div
                          className="w-full bg-emerald-100 rounded-t-sm hover:bg-emerald-200 transition-all relative"
                          style={{
                            height: `${
                              (d.revenue / projection[11].revenue) * 100
                            }%`,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                            ${d.revenue.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2">
                          M{d.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-amber-50 border border-amber-100 rounded-lg p-4 text-sm text-amber-800">
                    <p className="font-bold mb-1">Coach's Insight:</p>
                    By uploading{" "}
                    <strong>{simData.uploadRatePerWeek} products/week</strong>,
                    you will have{" "}
                    <strong>{projection[11].listings} active listings</strong>{" "}
                    in 12 months. To hit $10k/mo, you need to increase either
                    your price or conversion rate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: FACTORY (KANBAN) */}
        {activeView === "factory" && (
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-100">
            <header className="bg-white border-b px-8 py-5 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Trello className="w-6 h-6 mr-2 text-blue-500" /> Production
                  Factory
                </h2>
                <p className="text-gray-500 text-sm">
                  Manage your 10-store batch workflow.
                </p>
              </div>
              <button
                onClick={addTask}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-lg shadow-slate-900/20"
              >
                + New Batch
              </button>
            </header>
            <div className="flex-1 overflow-x-auto p-6">
              <div className="flex gap-6 h-full min-w-[1000px]">
                {["backlog", "design", "upload", "live"].map((status) => (
                  <div
                    key={status}
                    className="flex-1 bg-slate-200/50 rounded-xl p-4 flex flex-col border border-slate-300/50"
                  >
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2 flex justify-between items-center">
                      {status}{" "}
                      <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-[10px] shadow-sm">
                        {tasks.filter((t) => t.status === status).length}
                      </span>
                    </div>
                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                      {tasks
                        .filter((t) => t.status === status)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-grab"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  task.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : task.priority === "med"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm leading-snug">
                              {task.title}
                            </h4>
                            <div className="mt-4 flex gap-1 pt-3 border-t border-slate-50">
                              <button
                                disabled={status === "backlog"}
                                onClick={() =>
                                  moveTask(
                                    task.id,
                                    ["backlog", "design", "upload", "live"][
                                      [
                                        "backlog",
                                        "design",
                                        "upload",
                                        "live",
                                      ].indexOf(status) - 1
                                    ]
                                  )
                                }
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20"
                              >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                              </button>
                              <div className="flex-1"></div>
                              <button
                                disabled={status === "live"}
                                onClick={() =>
                                  moveTask(
                                    task.id,
                                    ["backlog", "design", "upload", "live"][
                                      [
                                        "backlog",
                                        "design",
                                        "upload",
                                        "live",
                                      ].indexOf(status) + 1
                                    ]
                                  )
                                }
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW: PROFIT LAB */}
        {activeView === "profit" && (
          <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <header className="mb-8 border-b pb-6">
                <h2 className="text-3xl font-bold text-slate-800 flex items-center">
                  <Calculator className="w-8 h-8 mr-3 text-green-600" /> Profit
                  Lab
                </h2>
                <p className="text-slate-500 mt-2">
                  Real-time unit economics calculator.
                </p>
              </header>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
                  <h3 className="font-bold text-slate-900 text-lg border-b border-gray-100 pb-2">
                    Input Variables
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        value={calcData.price}
                        onChange={(e) =>
                          setCalcData({
                            ...calcData,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Cost of Goods ($)
                      </label>
                      <input
                        type="number"
                        value={calcData.cost}
                        onChange={(e) =>
                          setCalcData({
                            ...calcData,
                            cost: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Ad Spend/Unit ($)
                      </label>
                      <input
                        type="number"
                        value={calcData.adSpend}
                        onChange={(e) =>
                          setCalcData({
                            ...calcData,
                            adSpend: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div
                    className={`p-8 rounded-xl border-2 shadow-sm ${
                      Number(stats.profit) > 0
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                      Net Profit Per Sale
                    </div>
                    <div
                      className={`text-5xl font-extrabold ${
                        Number(stats.profit) > 0
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      ${stats.profit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: AI WORKSHOP */}
        {activeView === "ai-lab" && (
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 overflow-hidden bg-slate-50">
            <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Select Intelligent Agent
                </h3>
                <div className="space-y-2">
                  <ToolButton
                    active={aiTool === "niche"}
                    onClick={() => {
                      setAiTool("niche");
                      setAiInput("");
                    }}
                    icon={<Bot />}
                    title="Niche Hunter"
                    desc="Find Blue Oceans"
                    color="indigo"
                  />
                  <ToolButton
                    active={aiTool === "audit"}
                    onClick={() => {
                      setAiTool("audit");
                      setAiInput("");
                    }}
                    icon={<ShieldAlert />}
                    title="Listing Auditor"
                    desc="Grade Your SEO"
                    color="red"
                  />
                  <ToolButton
                    active={aiTool === "listing"}
                    onClick={() => {
                      setAiTool("listing");
                      setAiInput("");
                    }}
                    icon={<Wand2 />}
                    title="Listing Architect"
                    desc="Generate SEO Copy"
                    color="emerald"
                  />
                  <ToolButton
                    active={aiTool === "tutor"}
                    onClick={() => {
                      setAiTool("tutor");
                      setAiInput("");
                    }}
                    icon={<BookOpen />}
                    title="Course Tutor"
                    desc="Generate Worksheets"
                    color="blue"
                  />
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  className="w-full h-32 p-3 border border-slate-200 rounded-lg text-sm mb-4 resize-none"
                  placeholder="Enter details..."
                />
                <button
                  onClick={() => handleGenerate()}
                  disabled={isAiLoading || !aiInput}
                  className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 flex justify-center items-center transition-all disabled:opacity-50 shadow-lg shadow-slate-900/10"
                >
                  {isAiLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}{" "}
                  {isAiLoading ? "Processing..." : "Run Agent"}
                </button>
              </div>
            </div>
            <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Bot className="w-4 h-4" /> Agent Output
                </span>
              </div>
              <div className="flex-1 p-8 overflow-y-auto bg-white">
                {aiOutput ? (
                  <div className="prose prose-slate max-w-none whitespace-pre-wrap font-medium">
                    {aiOutput}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                    <p>Waiting for input...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolButton = ({ active, onClick, icon, title, desc, color }) => (
  <button
    onClick={onClick}
    className={`w-full p-3 rounded-lg border text-left flex items-center transition-all ${
      active
        ? `bg-${color}-50 border-${color}-500 ring-1 ring-${color}-500`
        : "border-slate-100 hover:bg-slate-50"
    }`}
  >
    <div
      className={`p-2 rounded-md mr-3 transition-colors ${
        active
          ? `bg-${color}-200 text-${color}-800`
          : "bg-slate-100 text-slate-400"
      }`}
    >
      {icon}
    </div>
    <div>
      <div
        className={`font-bold text-sm ${
          active ? "text-slate-900" : "text-slate-600"
        }`}
      >
        {title}
      </div>
      <div className="text-xs text-slate-400">{desc}</div>
    </div>
  </button>
);

export default EmpireDashboard;
