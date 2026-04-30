---
layout: ../layouts/MarkdownLayout.astro
title: Roadmap
description: ViFi's shipped vs. planned manifest, hardware BOM, and FDA pathway. Contactless patient monitoring on ~$44 of commodity WiFi hardware per hospital bed.
---

# ViFi Roadmap

Contactless patient monitoring on ~$44 of commodity WiFi hardware per hospital bed. HR is validated on real hardware today; everything else runs on the same CSI stream and the same pair of ESP32-S3 nodes.

---

## Status board

| Capability | Status |
|---|---|
| **Heart rate (HR)** | **Shipped — 4.15 bpm cross-session MAE on real ESP32-S3 hardware** ([results](/results)) |
| Respiratory rate (RR) | Pipeline + synthetic regressor only; awaiting first Vernier paired captures |
| Per-subject calibration + RF fingerprinting | Shipped |
| Multi-subject "walks in the room" detection | Shipped — rolling fingerprint + hysteresis |
| Out-of-distribution suppression | Shipped — Mahalanobis distance, chi-square 99% threshold |
| Confidence-interval suppression | Shipped — quantile XGBoost, configurable width |
| Per-prediction audit log | Shipped — JSONL, daily-rotating, FDA-ready |
| Paired-capture orchestrator | Shipped — one-command 3-logger session |
| Synthetic CSI generator | Shipped (sanity check) |
| Per-packet CSI ingest | Shipped — live API endpoint |
| ESP32 capture + HR logger | Shipped — hands-free 2-min paired capture |
| Presence / occupancy | Shipped (variance threshold) |
| Apnea detection | Stub |
| Transient-event logger | Stub |
| Gait / walking-speed | Stub (WiGait reference) |
| Fall detection | Stub (WiFall reference) |
| 4-receiver multi-node array (deterministic identity) | Stub |

---

## In flight (next 4 weeks)

| Milestone | Target | Deliverable |
|---|---|---|
| Multi-subject HR validation | May 2026 | 10+ subjects, varied HR ranges, target cross-subject MAE <3 bpm |
| Multi-room validation | May 2026 | 3+ rooms, fixed subject, measure setup-specific bias |
| Walk-in detection validation | May 2026 | Run the multi-subject walk-in protocol, validate detector thresholds |
| Respiratory-rate paired captures | May 2026 | Vernier belt arrives; first paired CSI + RR sessions |

---

## Stage 2 (months 2–4)

| Capability | Prior art | Ground truth |
|---|---|---|
| Apnea detection | ApneaApp (UW 2015) | recording pulse oximeter |
| Transient-event logger | none — clinical wedge | same HR/RR stream |
| Improved subcarrier features | per-subcarrier ensemble | — |
| Phase-domain features | PhaseBeat (CFO/SFO calibration) | — |

---

## Stage 3 (months 4–8)

| Capability | Prior art | Ground truth |
|---|---|---|
| Gait / walking speed | WiGait (MIT CSAIL 2018) | timed course, pressure mat |
| Fall detection | WiFall | actors + crash mat |
| 4-receiver multi-patient array | ICA + AoA | 4× ESP32-S3 array |

---

## Stage 4 (months 6–12)

- First hospital pilot (5–10 beds, wellness-grade, pre-FDA)
- IRB submission and approval
- Subject-level cross-validation across diverse demographics

---

## Stage 5 (months 12–18)

- FDA 510(k) Class II submission for vitals monitoring
- ISO 13485 Quality Management System
- Clinical validation study at academic medical center
- Estimated cost: ~$300K (clinical study + consultant + QMS + filing)

---

## Long-term / research (12+ months)

- Heart Rate Variability (beat-to-beat precision; requires phase work)
- Arrhythmia classification (downstream of HRV)
- Sleep staging (overnight recordings + polysomnogram partnership)

---

## Out of scope (wrong physics for WiFi CSI)

| Capability | Why not | Alternative |
|---|---|---|
| Blood oxygen (SpO₂) | Optical sensor, not RF | $5 PPG add-on module |
| Body temperature | IR sensor, not RF | $10 IR thermometer add-on |
| Blood pressure | Open research problem industry-wide | None pursued |
| ECG waveform | Requires direct skin contact | None pursued |

---

## Hardware BOM

### v1 — 2-node room (single Tx + single Rx, statistical identity)

| Item | Qty | ~$ |
|---|---|---|
| ESP32-S3-DevKitC-1U-N8R8 | 2 | 30 |
| Dual-band 2.4/5 GHz RP-SMA antenna | 2 | 8 |
| IPEX1 U.FL → RP-SMA Female pigtail, 8" | 2 | 6 |
| **Total per room (v1)** | | **~$44** |

Replaces a $5,000 ward bedside monitor. **>100× cheaper.** Statistical multi-subject identity via RF fingerprinting (shipped).

### v2 — 4-node room (1 Tx + 3 corner Rx, deterministic spatial identity)

Same per-board cost (~$22). Add 2 more nodes: **~$88 per room**. Multi-perspective CSI fusion gives full 3D triangulation, deterministic multi-subject discrimination, redundancy across boards.

| Config | Boards | ~$ | vs $5K ward monitor |
|---|---|---|---|
| v1 (Tx + Rx) | 2 | $44 | 114× cheaper |
| v2-min (1 Tx + 2 Rx) | 3 | $66 | 76× cheaper |
| **v2 (1 Tx + 3 corner Rx)** | **4** | **$88** | **57× cheaper** |
| v2 + isolated AP (HIPAA-clean deployment) | 4 + AP | $118 | 42× cheaper |

### Per first capture kit (development)

Add Polar H10 chest strap ($90) for HR ground truth during dataset collection.

---

## Regulatory path

**Wellness-grade products first** (presence, falls, gait): no FDA clearance required. Target: first paying hospital customer 9–12 months post-funding.

**Vitals-grade products** (HR, RR, apnea): FDA 510(k) Class II. Target: ~18 months post-funding, ~$300K all-in.

---

## Engineering details

The full code — DSP pipeline, capture orchestrator, training scripts, prediction service, calibration, RF fingerprinting, audit log, and 102-test suite — is kept private during pre-clearance development. **Available for technical review under NDA** for investors, hospital partners, and prospective collaborators. Email [popowitzzm@gmail.com](mailto:popowitzzm@gmail.com).
