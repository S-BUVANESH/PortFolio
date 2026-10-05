---
title: "From Screen to Acrylic: Cutting Arthur Morgan"
week: 6
day: "01"
date: "2026-09-28"
summary: "Turning a 50 × 50 mm Arthur Morgan graphic into two acrylic laser-cut results through AI-assisted image preparation, vector cleanup, Illustrator repair, and RDWorks."
tags: ["laser cutting", "digital fabrication", "RDWorks", "CO2 laser", "acrylic"]
preview_images:
  - "Arthur White.jpeg"
  - "ARTHUR SWartz.jpeg"
  - "RDWorks Final Layout.png"
  - "RDWorks Scan Preview.png"
preview_captions:
  - "Final transparent acrylic result"
  - "Early black acrylic result"
  - "RDWorks final vector layout"
  - "RDWorks scan preview"
---

# From Screen to Acrylic: Cutting Arthur Morgan

*MONDAY, SEPTEMBER 28 · DIGITAL FABRICATION & LASER CUTTING*

This exercise was about taking an idea that normally exists only on a screen and making it physically manufacturable. I chose **Arthur Morgan from Red Dead Redemption 2** as the subject, developed a fabrication-friendly graphic at **50 × 50 mm**, prepared it for vector-based laser processing, and produced two acrylic outcomes.

The decision was also influenced by the environment around the project. Some of the staff at FORGE are gamers, so I wanted the object to have a stronger chance of being visually appealing beyond the exercise itself. The aim was not simply to cut a picture; it was to understand how an image has to change before a machine can manufacture it.

## 1. Lab Safety & Safety Rules

Laser cutting combines concentrated heat, moving machinery, smoke generation, and electrical equipment. Before operating the machine, I followed the safety guidance displayed in the FORGE fabrication area.

The main precautions were:

| Safety area | Practice followed |
|---|---|
| Laser safety | Used the enclosed machine as intended and kept the machine door closed during operation. |
| Exhaust system | Kept the exhaust / ventilation system operating to remove smoke and fumes. |
| Chiller | Ensured the cooling system was operating before running the laser. |
| Earthing | Followed the lab's electrical safety and earthing requirements before operation. |
| Air assist | Used the machine's air-assist / blowing system during processing. |
| General machine safety | Checked the working area, confirmed the selected material was permitted, and did not leave the cutter unattended. |

The lab safety notice also distinguishes authorised materials from banned materials. I used acrylic, which is listed as an authorised material in the displayed FORGE guidance.

![[Laser Cutter Safety Rules.png]]
*Caption: FORGE laser-cutter safety notice showing safety precautions, operating do's and don'ts, authorised materials, and banned materials.*

## 2. Machine Details

The machine used for the exercise was the **1490 CO₂ laser cutter in the FORGE lab**.

| Specification | Observed / documented value |
|---|---|
| Make / Manufacturer | Not identified on the supplied machine placard |
| Model | 1490 CO₂ Laser |
| Working / Bed Area | 1300 × 900 mm |
| Laser Tube / Laser Power | 150 W |
| Control Software | RDWorks V8 |
| Machine Power | 1000 W |
| Listed Cutting Speed Capability | 25 m/min |
| Listed Engraving Speed Capability | 55 m/min |
| Listed Accuracy | 0.1 mm |
| Working Temperature | 0 °C – 40 °C |
| Blowing System | Lower blowing system |
| Listed Materials | Acrylic, plywood, MDF, foam board, cardboard, paper |

The manufacturer name is not visible on the supplied placard, so I have not assigned a manufacturer based on a similar commercial machine. The machine identification above is based on the information physically displayed on the FORGE lab machine.

![[Laser Cutter Machine Details.png]]
*Caption: Machine specification placard for the 1490 CO₂ laser cutter used in the fabrication lab.*

## 3. Materials Used

| Material | Thickness | Source |
|---|---:|---|
| Black acrylic | 2 mm | FORGE lab stock |
| Transparent / clear acrylic | 2 mm | FORGE lab stock |

The same prepared geometry was used to compare the visual behaviour of different acrylic finishes.

## 4. Selected Design/Image

The selected subject was **Arthur Morgan from Red Dead Redemption 2**.

I chose the subject because I wanted a design that had recognisable character, visual appeal, and a plausible market beyond a classroom exercise. Since gaming is a familiar interest among some FORGE staff, I chose a well-known gaming character rather than a generic geometric pattern.

The target size was **50 × 50 mm**, so the image had to remain readable after being simplified for fabrication.

![[Arthur Morgan Selected Design.png]]
*Caption: Arthur Morgan reference artwork selected as the starting point for the 50 × 50 mm fabrication design.*

## 5. Image-to-DXF Conversion

A normal raster image cannot directly become a useful laser-cutting path. The design therefore went through several preparation stages.

The tools involved were:

**Gemini** — used to generate a 50 × 50 mm concept image.

**ChatGPT** — used to simplify the image into a high-contrast, line-based representation suitable for vectorisation / DXF preparation.

**CloudConvert** — used during the file-format conversion stage.

**Adobe Illustrator** — used to repair and refine the vector geometry before machine preparation.

The workflow was:

```text
Theme selection
      ↓
Red Dead Redemption 2 / Arthur Morgan
      ↓
50 × 50 mm concept image
      ↓
AI-assisted simplification
      ↓
Single-colour / line-based artwork
      ↓
Vector / DXF conversion
      ↓
Adobe Illustrator cleanup
      ↓
RDWorks V8
      ↓
Scan + Cut setup
      ↓
CO₂ laser fabrication
```

![[Arthur Morgan Vector Conversion.png]]
*Caption: Simplified single-colour line artwork prepared for vector-based fabrication.*

The important design decision was eliminating unnecessary colour information and retaining the visual structure as strokes and boundaries that a laser workflow could interpret.

## 6. File Preparation

After conversion, the vector required manual cleanup before it was safe to send to the laser cutter.

The main preparation work was:

| Preparation step | What I did |
|---|---|
| Vector cleaning | Removed or corrected geometry that could interfere with the final result. |
| Scaling | Prepared the design around the intended 50 × 50 mm size. |
| Closed paths | Repaired open edges so the cutting boundary could be interpreted correctly. |
| Unwanted / duplicate geometry | Cleaned unnecessary vector elements before machine setup. |
| Final verification | Inspected the vector again in Illustrator before importing it into RDWorks. |

The most important repair involved **open edges**. An open edge can change how a machine interprets a boundary, so I patched those areas in Adobe Illustrator before the final run.

![[Arthur Morgan Vector Conversion.png]]
*Caption: Vector preparation stage after simplifying the original image into line-based geometry.*

## 7. Nesting & Layout in RDWorks

In RDWorks V8, I imported the DXF, placed the design on the material layout, and separated the fabrication behaviour into cutting and scanning operations.

The working layer assignment was:

| RDWorks layer colour | Operation |
|---|---|
| Red | Cut |
| Blue | Scan / engraving |

The layout was prepared so the vector artwork could produce both a surface-detail layer and an outer physical boundary.

![[RDWorks Final Layout.png]]
*Caption: Final RDWorks layout showing the vector artwork and colour-coded processing paths.*

![[RDWorks Scan Preview.png]]
*Caption: RDWorks preview of the line-based scan / engraving geometry before fabrication.*

## 8. Final Machine Settings

I am recording the settings that can be recovered from the actual session evidence and my notes. Values that were not preserved in the supplied records are explicitly marked rather than guessed.

| Material | Thickness | Operation | Speed | Minimum Power | Maximum Power | Passes | Frequency |
|---|---:|---|---:|---:|---:|---:|---:|
| Acrylic | 2 mm | Cut — Red | ≈100 mm/s* | Not recorded | Not recorded | Not recorded | Not recorded |
| Acrylic | 2 mm | Scan — Blue | ≈100 mm/s* | Not recorded | Not recorded | Not recorded | Not recorded |

* The working speed of approximately **100 mm/s** is a recalled session value; the original RDWorks layer-specific numeric entry was not preserved in the available evidence.

The machine placard lists significantly higher **maximum machine capabilities** of 25 m/min cutting and 55 m/min engraving, but those figures are machine specifications and are not being presented here as the actual settings used for this 2 mm acrylic job.

## 9. Cutting Process

The physical process involved:

1. Verifying the prepared geometry.
2. Loading the 2 mm acrylic.
3. Confirming the RDWorks placement and processing colours.
4. Running the scan / engraving layer.
5. Running the cut layer.
6. Checking the resulting acrylic piece.

![[Laser Cutter Machine Details.png]]
*Caption: Laser-cutter identification and working-area information at the fabrication station.*

![[RDWorks Final Layout.png]]
*Caption: Prepared RDWorks job before the laser fabrication step.*

> **Process evidence to be added:** A direct photograph of the laser actively cutting the acrylic was not included in the supplied media bundle. Add the actual cutting-process photograph here before final faculty submission, with a descriptive caption.

## 10. Final Result – Hero Shot

I produced two physical variants from the same digital geometry.

| Variant | Material | Observation |
|---|---|---|
| 01 | Black acrylic | Early result; the open-edge issue caused an unwanted / odd mouth detail. |
| 02 | Transparent acrylic | Corrected vector preparation; cleaner and visually stronger result. |

The black version was made before the Illustrator patch, so the open edge affected the mouth area. After the vector was repaired, the **transparent acrylic** produced the better result.

![[ARTHUR SWartz.jpeg]]
*Caption: Early black-acrylic result showing the effect of the unresolved open-edge region around the mouth.*

![[Arthur White.jpeg]]
*Caption: Final transparent-acrylic result after repairing the vector geometry; the cleaner line structure produced the preferred outcome.*

The comparison also showed something I did not fully anticipate at the start: **transparent acrylic can make laser-engraved detail look more refined because ambient light becomes part of the final visual presentation.**

## 11. Problems Faced & Solutions

| Problem | Identified cause | Solution implemented | Final outcome |
|---|---|---|---|
| Odd / incomplete mouth detail in the first black version | Open edge in the vector geometry | Patched the geometry in Adobe Illustrator before the next run | Cleaner result on the transparent acrylic |
| Raster image was not directly suitable for fabrication | Original source was a multi-tone image rather than machine-ready paths | Simplified the artwork into a line-based, single-colour representation and converted it for vector use | A usable DXF-based fabrication file |
| Visual result changed with acrylic finish | Material appearance affected how engraved detail was perceived | Produced a second transparent-acrylic variant using corrected geometry | Transparent version became the preferred result |

## 12. Reflection

This exercise changed the way I think about digital fabrication. The interesting part was not operating the laser itself; it was understanding that the **digital image had to become machine-readable geometry before the machine could do anything useful with it**.

I learned how image selection, simplification, vector preparation, closed paths, layer assignment, material choice and machine parameters all affect the final physical object.

The most useful practical lesson was the open-edge problem. It showed that a vector file can look correct on screen and still produce a poor physical result. Repairing the geometry in Illustrator and comparing the two acrylic outcomes made that relationship visible.

The transparent acrylic result was also an unexpected takeaway. I initially expected the black version to look stronger, but the transparent material produced a cleaner and more interesting final appearance.

In future, I would spend more time checking the vector geometry before the first machine run and record the complete RDWorks parameter panel so that the final documentation contains exact layer-by-layer settings.

## 13. Source Files

The original working DXF and Adobe Illustrator AI source files were not included in the supplied project bundle for this update.

They should be added here before final faculty submission:

- **DXF source file** — actual working DXF from the laser-cutting job.
- **AI source file** — actual Illustrator file containing the repaired vector artwork.

These links should be tested after the actual files are added.
