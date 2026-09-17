# ToolGuard Security & Privacy Model

## Core Security Philosophy
> *"You trusted the tool. Did the tool stay the same?"*

ToolGuard enforces **zero-trust change detection** for AI tools, Model Context Protocol (MCP) agents, and developer tool manifests.

## Data Privacy Principles
1. **Zero Source Code Ingestion**: ToolGuard never uploads source code, environment variables (`.env`), or repository contents.
2. **Deterministic Redaction**: Sensitive credential fields (`apiKey`, `password`, `token`, `secret`, `privateKey`) are masked with `[REDACTED]` prior to baseline computation or synchronization.
3. **Local-First Protection**: Developers can use ToolGuard completely offline using the CLI and VS Code extension without configuring a cloud account.

## Explainable Risk Engine
Risk classifications are rule-based, deterministic, and auditable:

| Rule ID | Change Pattern | Severity | Justification |
| :--- | :--- | :--- | :--- |
| `CAPABILITY_WRITE_ADDED` | `read` → `read, write` | **HIGH** | Tool's ability to modify project data has expanded. |
| `CAPABILITY_EXECUTION_ADDED` | `disabled` → `enabled` | **HIGH** | Arbitrary or shell execution drastically increases attack surface. |
| `CAPABILITY_ADMIN_ADDED` | standard → `admin/root` | **HIGH** | Elevated permissions bypass sandboxing boundaries. |
| `ENDPOINT_EXPANDED` | `local` → `https://remote` | **HIGH** | Tool calls redirected outward enable exfiltration. |
| `AUTH_REQUIREMENT_REMOVED` | `true` → `false` | **HIGH** | Unauthenticated callers can invoke privileged tools. |
| `DESCRIPTION_CHANGED` | AI prompt / description | **REVIEW** | Model instruction alterations can induce prompt injection drift. |

## Security Limitations
ToolGuard does not:
- Guarantee that an initial baseline definition is bug-free or safe.
- Replace runtime process sandboxes (e.g. gVisor, Docker, seccomp).
- Guarantee perfect detection of unlabeled secrets embedded inside arbitrary text strings.
- Automatically determine whether a legitimate engineering modification is malicious without developer review.
