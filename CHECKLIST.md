Loro Safety & Compliance Checklist

Legend:  
- [P] Planned  
- [I] Implemented (needs verification)  
- [V] Verified (tested & documented)

1) Safety & Crisis
- [P] Crisis disclaimer (Reflections page + global footer)
- [P] Prominent 988/911 routing and international note
- [P] Suicidality/self-harm trigger detection → crisis banner
- [P] Emergency contacts quick-access (local-only)
- [P] Rate-limiting / abuse protection for AI prompts

2) HIPAA / Privacy
- [P] Data classification (PHI vs non-PHI) and storage map
- [P] No PHI sent to third parties without explicit consent
- [P] OpenAI usage boundaries + model config documented
- [P] Local-only journal storage with export/delete
- [P] Data retention policy + user controls (delete/export)
- [P] Access controls: lock screen / inactivity timeout
- [P] Audit trail (high level) of consent + settings

3) Legal / Disclaimers
- [P] “Not medical advice / not a crisis service” banner
- [P] Reflections page inline disclaimer near AI responses
- [P] Terms of Use + Privacy Policy links & acceptance log
- [P] Explainability text for AI outputs (limitations)

4) UX / Trauma-Informed
- [P] Gentle language guidelines (tone, brevity, autonomy)
- [P] “Pause/Hide content” affordance for overwhelming text
- [P] Content warnings toggle (user preference)
- [P] Inclusive language & accessibility checks

5) Security / Engineering
- [P] Secrets out of repo; env handling verified
- [P] CORS policy tightened (prod)
- [P] Input validation & error hygiene (server+client)
- [P] Telemetry/analytics review (minimal, opt-in if any)
- [P] Ports locked; consistent dev scripts; PR checks

---

Workflow for each item
1) Implement → mark [I]  
2) Verify (QA + doc + links to PR) → mark [V] with reference.
