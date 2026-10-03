# 🛡️ ToolGuard: Live Demonstration Script & Pitch Guide

> **A 3-Minute Live Demo Walkthrough for Hackathon Judges, Security Teams & Technical Audiences**  
> *Download Microsoft Word formatted version: [`docs/ToolGuard_Live_Demo_Guide.docx`](ToolGuard_Live_Demo_Guide.docx)*

---

## 1. Executive Overview & The 10-Second Pitch

> *"Traditional security tools only scan for known vulnerabilities (CVEs) in third-party packages. They are completely blind to **Capability Drift** — when a trusted developer tool, npm script, or AI agent silently gains admin rights or network exfiltration access. ToolGuard brings **Zero-Trust Capability Security** to developer tools by cryptographically freezing permissions and alerting in real time before unauthorized code executes."*

---

## 2. Pre-Demo Setup Checklist (2 Minutes Before Demo)

- [ ] **Live Web Console URL**: Open [https://toolguard-app.vercel.app](https://toolguard-app.vercel.app) in your browser.
- [ ] **Local IDE (Real-Time Sync)**: Open VS Code / Cursor in any repo with the ToolGuard extension installed (`toolguard-vscode-1.0.0.vsix`).
- [ ] **Terminal Tab**: Have a terminal open in your project directory ready for commands.
- [ ] **1-Click Fallback Mode**: The web dashboard has a 1-click **"⚡ Try Demo"** button if presenting without an active local terminal.

---

## 3. The 4-Step Interactive Live Demo (3 Minutes Total)

### STEP 1: The Trust Anchor — Freeze Baseline (0:00 – 0:45)
**Objective**: Establish the cryptographic baseline of authorized workspace tools.  
**Command**:
```bash
toolguard quickstart
# Or click 'Load Active IDE Project' on Web Dashboard
```
**Presenter Script**:
> *"Every modern project runs npm scripts, MCP server tools, and background tasks. On Day 1, ToolGuard takes a tamper-proof cryptographic snapshot of these tools using canonical SHA-256 fingerprinting. Notice how `dev-runner`, `npm:dev`, and MCP filesystem tools are frozen into `.toolguard/baseline.json`. The status is 100% green and verified SAFE."*

---

### STEP 2: The Attack — Simulate Capability Drift (0:45 – 1:30)
**Objective**: Inject an unauthorized permission escalation or exfiltration endpoint.  
**Command**:
```bash
toolguard threat-test
# Or click 'Simulate Incident' in Web Console / Settings
```
**Presenter Script**:
> *"Now, imagine a compromised dependency or prompt injection alters our script. Notice what happened: `threat-simulation` secretly injected admin rights and an external network endpoint to exfiltrate data. Traditional CVE scanners see zero alerts because no package version changed! But look at ToolGuard: within 50 milliseconds, our VS Code status bar turns RED, the CLI alerts HIGH RISK, and the web console catches it live via real-time IDE sync!"*

---

### STEP 3: The Investigation — Visual AST Diff & Risk Explainer (1:30 – 2:15)
**Objective**: Inspect exactly what changed and understand the security implications.  
**Command**:
```bash
toolguard explain threat-simulation
# Or click 'Review Drift' / 'Inspect Diff' on Web Dashboard
```
**Presenter Script**:
> *"ToolGuard doesn't just throw a vague error code. It provides an automated, transparent security explanation: 'Administrative privileges requested; execution command modified to curl external server'. On the web console, we get a color-coded AST visual diff showing the exact lines of code and permissions that drifted from our trusted baseline."*

---

### STEP 4: The Defense — Git Pre-Commit Gate & 1-Click Restore (2:15 – 3:00)
**Objective**: Demonstrate autonomous prevention and instantaneous recovery.  
**Command**:
```bash
git commit -m "compromised tool"
# Blocks commit!
toolguard restore-test
# Or click 'Reject Threat (Restore)' on Web Dashboard
```
**Presenter Script**:
> *"Even if a developer tries to push this drifted code, ToolGuard's autonomous Git Pre-Commit Security Gate blocks the commit instantly before it ever touches CI/CD or production. To fix it, we click Reject Threat (Restore) (or run `toolguard restore-test`). Instantly, the workspace is clean, the baseline is verified green, and full zero-trust integrity is maintained."*

---

## 4. Feature Comparison Matrix

| Feature / Capability | Traditional Scanners (`npm audit`, Snyk) | ToolGuard Zero-Trust |
| :--- | :--- | :--- |
| **Detection Scope** | Known public CVE databases | Cryptographic SHA-256 capability baselines |
| **Zero-Day Supply Chain Attacks** | ❌ Blind (No CVE assigned yet) | ✅ Detected in <100ms on disk change |
| **MCP & AI Tool Governance** | ❌ Unsupported | ✅ Full discovery & schema hashing |
| **Real-Time IDE Integration** | ⚠️ Delayed background indexing | ✅ Real-time status bar & instant drift alerts |
| **Git Pre-Commit Gate** | ⚠️ Script-only | ✅ Autonomous pre-commit blocking hook |
| **Visual AST Diff** | ❌ Text logs only | ✅ Side-by-side color-coded visual AST diff |
| **Privacy & Zero-Telemetry** | ⚠️ Uploads dependencies / lockfiles | ✅ 100% local-first, credentials auto-redacted |

---

## 5. Frequently Asked Questions (Judge Q&A)

**Q: How does ToolGuard handle normal developer updates when tools change intentionally?**  
> **A:** ToolGuard makes updating permissions as frictionless as Git. When a change is intentional, run `toolguard baseline` in the terminal or click **"Accept & Resolve"** on the web console. This re-calculates the canonical SHA-256 fingerprint and creates a new cryptographic baseline version.

**Q: Does ToolGuard upload proprietary source code or environment variables?**  
> **A:** Never. ToolGuard is 100% local-first. Before hashing or displaying diffs, sensitive tokens, passwords, and private keys are replaced with `[REDACTED]` using deterministic heuristic sanitization.

**Q: Can ToolGuard be bypassed if a developer uses `--no-verify` on Git commits?**  
> **A:** Even if local git hooks are skipped, ToolGuard integrates into CI/CD pipelines (GitHub Actions, GitLab CI, CircleCI) with `toolguard scan --ci --fail-on high`, failing the build before untrusted capabilities enter production.
