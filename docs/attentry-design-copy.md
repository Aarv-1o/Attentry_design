# Attentry Design: copy that reads like AI (research, 2026-11-24)

The words an agent writes into a video, a landing page, a store listing or a post. People now
recognize "AI copy" on sight, and it costs trust. This is what the research says goes wrong, why,
what could be checked without AI, and what direction the agent should get before it writes.

Scope note: the target is **generic, puffed-up, pattern-heavy copy**, not "text an AI wrote".
Attentry Design can't and shouldn't detect authorship. It can flag the habits that make copy read
as empty, whoever typed it. Those are the same habits editors flagged long before chatbots.

---

## What goes wrong

**The best catalog is Wikipedia's "Signs of AI writing"** (WikiProject AI Cleanup, built from
thousands of reviewed articles). It is explicitly "descriptive, not prescriptive": signs are
"only potential signs of a problem, not the problem itself", and only many together mean much.
The patterns, grouped:

1. **Puffery about significance.** "stands as", "serves as", "is a testament to", "plays a
   pivotal/crucial/vital role", "underscores its importance", "reflects broader trends",
   "setting the stage for", "evolving landscape", "indelible mark", "deeply rooted". The model
   claims meaning instead of showing a fact.
2. **Participle tails that claim analysis.** A sentence ends in "…, highlighting/underscoring/
   ensuring/reflecting/fostering/enhancing …". The tail adds no fact, only a verdict.
3. **Vague attribution.** "Experts argue", "industry reports", "observers have noted", "several
   sources" when there are none or two.
4. **Formula endings.** "Despite these challenges…", "Future outlook", "In conclusion", "Overall".
5. **AI vocabulary, in clusters.** "delve", "tapestry", "testament", "vibrant", "pivotal",
   "crucial", "robust", "seamless", "intricate", "meticulous", "showcase", "boasts" (for "has"),
   "foster", "align with", "landscape" (abstract), "Additionally," at the start of a sentence.
   One word means nothing; "an edit introducing lots of them, lots of times, is one of the
   strongest tells". The list changes with each model generation (Wikipedia keeps era lists:
   "delve" peaked in 2023–24 and dropped off sharply in 2025; newer models lean on "leverage",
   "multifaceted", "prioritize", "practical", "quietly", "steady").
6. **Avoiding plain "is".** "serves as", "functions as", "represents", "boasts", "features"
   where "is" or "has" would do.
7. **Negative parallelism.** "Not just X, but Y", "It's not X, it's Y", "no X, no Y, just Z",
   "Y rather than X". Humans use these too; AI uses them as a reflex.
8. **The rule of three.** Triads of adjectives or phrases to look thorough: "fast, simple and
   powerful".
9. **Formatting tells.** Title Case Headings, bold scattered through prose, "Term: definition"
   bullet lists, emoji at the start of headings or bullets, em dashes where a comma would do
   (models trained away from em dashes now overuse commas and short sentences instead).
10. **Chat residue.** "I hope this helps", "Certainly!", "Let me know if…", placeholders left
    in ("[insert link]", "2025-XX-XX", "example.com/source1").

**The research behind it:**

- **Excess vocabulary is measurable.** Kobak et al. counted word frequencies in 14 million PubMed
  abstracts (2010–2024): the 2024 excess words were almost all style words (280 of them, two
  thirds verbs, such as "delves", "showcasing", "underscores"), and at least 10% of 2024 abstracts
  were processed with an LLM. Juzek & Ward (COLING 2025) found 21 such focal words, and that
  readers reacted more negatively to "delve" than to other buzzwords.
- **The grammar is different, not just the words.** Reinhart et al. (PNAS, 2025) compared human
  and LLM text on Biber's grammatical features: instruction-tuned models use present participial
  clauses at 2–5 times the human rate and nominalizations 1.5–2 times; GPT-4o uses the agentless
  passive at about half the human rate. Instruction tuning, not the base model, causes most of
  the gap. This is the "…, highlighting X" tail measured.
- **AI makes everyone's writing more alike.** Doshi & Hauser (Science Advances, 2024): writers
  given LLM ideas wrote stories rated more creative individually, but the stories were more
  similar to one another. Copy that sounds like everyone else's is the cost.
- **Readers punish it once they notice.** A Journal of Consumer Research study of a million
  TikTok posts found AI disclosure lowers engagement and the negative feeling persists; a Journal
  of Business Research review of eight studies found a 2.23-point drop in click-through with AI
  disclosure. Industry surveys point the same way (trust in AI content falling from 73% to 55% in
  two years, per Capgemini, as reported). Some studies find no effect or a positive one, so the
  claim is "it often costs", not "it always costs".
- **Neither people nor detectors can reliably tell.** Wikipedia cites a 2025 study putting human
  detection "no better than random chance", and warns detectors (GPTZero, Pangram) have
  "non-trivial error rates". False accusations are a real harm.

## Why it happens

- **Regression to the mean.** A model picks the most probable phrasing, so it writes the
  statistically common, positive, generic sentence instead of the specific one (Wikipedia; FIU's
  explanation of em dashes; TechTarget: "AI tries to write well, not communicate well").
- **Instruction tuning and preference training** reward text that sounds helpful, thorough and
  polished: participle tails, nominalizations, triads, confident summaries (Reinhart et al.;
  Juzek & Ward test RLHF as a cause).
- **Banning words doesn't fix it.** Forbid em dashes and the model swaps in commas or semicolons
  (TechTarget); forbid "delve" and the synonyms aren't overused, but the sentence shape is the
  same. Wikipedia: "Please do not merely treat these signs as the problems to be fixed; that could
  just make detection harder." The fix is content (specifics), not a word filter.

## What could be checked (rule ideas, no AI needed)

Attentry-style: deterministic, per piece of copy, each with fixtures it must flag and must not
flag, and suggestions rather than verdicts.

| Rule idea | How it's measured | Why |
|---|---|---|
| **Puffery** | phrases from the significance list ("serves as a testament", "plays a pivotal role", "evolving landscape") | claims meaning instead of stating a fact |
| **Participle tail** | a sentence ending in ", <verb>ing …" with highlighting/underscoring/ensuring/reflecting/fostering | Reinhart: 2–5× the human rate |
| **Vocabulary cluster** | density of the era word lists per 100 words, flagged only above a threshold and only in clusters | Wikipedia: one word is coincidence, many is the tell |
| **Copula avoidance** | "serves as / functions as / boasts / features" where the subject simply is or has | plain verbs read as human |
| **Negative parallelism, repeated** | more than one "not X but Y" / "it's not X, it's Y" in a short piece | reflex use, not the construction itself |
| **Triads, repeated** | more than one list of exactly three adjectives or phrases in a short piece | looks thorough, says little |
| **Vague attribution** | "experts say", "studies show", "industry reports" with no source nearby | unsupported authority |
| **Formula ending** | a last paragraph opening with "In conclusion", "Overall", "Despite these challenges", "Ultimately" | template shape |
| **Uniform rhythm** | low variance of sentence length across a paragraph (all 12–18 words) | PR Daily: sameness; real writing varies |
| **No specifics** | a paragraph with no number, name, place, date or concrete noun | the root cause: generic copy has nothing only this product could say |
| **Formatting tells** | Title Case headings, emoji-led bullets, bold mid-sentence, "Term: definition" lists in prose copy | Wikipedia's style signs |
| **Chat residue / placeholders** | "I hope this helps", "[insert …]", "XX-XX", "example.com", "Lorem" | unambiguous, always worth fixing |

Most useful first: chat residue and placeholders (unambiguous), puffery, no specifics, and the
vocabulary cluster. Rhythm and triads need care to avoid flagging good writing.

**Must not flag** (fixtures): a single "crucial" in a technical sentence; "not X but Y" used once
to correct a real misconception; lists of three that are really three things; quoted text;
technical terms that happen to be on a list ("robust" statistics, "landscape" photos).

## Direction before writing (what the agent hears)

Same idea as the direction cards: say what good copy needs before it's written, then check after.

- **Start from a fact only this product has**: a number, a real user's words, a before and after,
  a named feature. If you can't name one, don't write the sentence yet.
- **Say it the way the reader would say it.** Use the words people use in reviews and questions,
  not category words ("seamless", "powerful", "robust").
- **Plain verbs.** "is", "has", "does". No "serves as", "boasts", "stands as".
- **One claim per sentence, shown, not labeled.** Instead of "…, highlighting its commitment to
  quality", say what was done.
- **Vary the rhythm.** A short sentence after a long one. Read it aloud; rewrite what you wouldn't
  say out loud (copywriters' read-aloud test).
- **Cut the frame.** No "In today's fast-paced world", no "Overall", no "In conclusion".
- **Use a device once.** One contrast, one list of three, one dash per piece at most.
- **Match the brand's own examples.** If the project has a voice guide or past copy (for
  Attentry: the go-to line and the tagline), reuse its words and rhythm.

## Limits

- **Not a detector, and must never say "this was written by AI".** It flags patterns; humans
  write them too (Wikipedia: "LLMs are trained on human writing"; false accusations drive people
  away).
- **The lists age.** Each model generation has new favorites; the rules need dated word lists and
  updates, like Wikipedia's era lists.
- **Gaming makes it worse.** Swapping flagged words for synonyms keeps the problem. Findings should
  push toward specifics, not synonyms.
- **Quality isn't measurable in full.** These rules catch emptiness and habits, not whether the
  copy persuades. Same limit as the video rules (Murch: emotion and story can't be measured).

## Sources

- Wikipedia, "Signs of AI writing" (WikiProject AI Cleanup): https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
- Coverage: TechCrunch, https://techcrunch.com/2025/11/20/the-best-guide-to-spotting-ai-writing-comes-from-wikipedia/ ; The Decoder, https://the-decoder.com/heres-how-to-spot-ai-writing-according-to-wikipedia-editors/
- Kobak et al., "Delving into ChatGPT usage in academic writing through excess vocabulary": https://arxiv.org/abs/2406.07016
- Juzek & Ward, "Why Does ChatGPT 'Delve' So Much?" (COLING 2025): https://aclanthology.org/2025.coling-main.426 ; https://arxiv.org/abs/2412.11385
- Reinhart et al., "Do LLMs write like humans? Variation in grammatical and rhetorical styles" (PNAS 2025): https://arxiv.org/abs/2410.16107
- Doshi & Hauser, "Generative AI enhances individual creativity but reduces the collective diversity of novel content" (Science Advances 2024): https://pmc.ncbi.nlm.nih.gov/articles/PMC11244532
- AI disclosure and engagement: SSIR, https://ssir.org/articles/entry/ai-disclosures-social-media-disengagement ; MarTech, https://martech.org/consumers-like-ai-content-until-they-know-its-ai/ ; NIM, https://www.nim.org/publikationen/detail/transparency-without-trust ; MediaCat, https://mediacat.uk/ai-disclosure-when-it-does-and-doesnt-hurt-brands/amp/
- Em dashes and sameness: FIU, https://news.fiu.edu/2026/why-does-ai-use-so-many-em-dashes-an-expert-explains ; McGill OSS, https://www.mcgill.ca/oss/node/11993 ; TechTarget, https://www.techtarget.com/ai/opinion/Why-AI-writing-cant-be-great ; PR Daily, https://www.prdaily.com/4-reasons-your-writing-accidentally-sounds-ai-generated-and-how-to-fix-it/
- Editing practice: Contently, https://contently.com/2025/10/14/how-to-edit-the-ai-isms-out-of-your-content-no-detectors-needed/ ; PR Daily, https://www.prdaily.com/5-steps-for-editing-ai-generated-copy/ ; https://www.prdaily.com/edit-your-robots-obvious-signs-copy-is-ai-generated/
