---
title: "From Screen to Acrylic: Cutting Arthur Morgan"
week_title: "Week 06 — Digital Fabrication & 3D Printing"
week: 6
day: "01"
date: "2026-09-28"
summary: "Turning a 50 × 50 mm Arthur Morgan graphic into two acrylic laser-cut results through AI-assisted image preparation, vector cleanup, Illustrator repair, and RDWorks."
tags: ["laser cutting", "digital fabrication", "RDWorks", "CO2 laser", "acrylic"]
preview_images:
  - "11_transparent_acrylic_result.jpeg"
  - "10_black_acrylic_result.jpeg"
  - "05_rdworks_vector_layout.png"
  - "09_laser_cutting_closeup.png"
---

# From Screen to Acrylic: Cutting Arthur Morgan

*MONDAY, SEPTEMBER 28 · DIGITAL FABRICATION & LASER CUTTING*

This exercise was about taking an idea that normally exists only on a screen and making it physically manufacturable. I chose **Arthur Morgan from Red Dead Redemption 2** as the subject, developed a fabrication-friendly graphic at **50 × 50 mm**, prepared it for vector-based laser processing, and produced two acrylic outcomes.

The decision was also influenced by the environment around the project. Some of the staff at FORGE are gamers, so I wanted the object to have a stronger chance of being visually appealing beyond the exercise itself. The aim was not simply to cut a picture; it was to understand how an image has to change before a machine can manufacture it.

## 1. Lab Safety & Safety Rules

Laser cutting combines concentrated heat, moving machinery, smoke generation, and electrical equipment. Before operating the machine, I followed the safety guidance displayed in the FORGE fabrication area.

The main precautions observed from the safety board were:

- Wear safety goggles and gloves
- Improper settings may result in fire
- Improper materials may create toxic fumes
- Operate with proper setting
- Switch on blower and chiller while running
- Close the machine door while running
- Report missing tools/supplies and material damage
- Clean up after use
- Ask a technician when needed
- Do not use unauthorized materials
- Do not switch off directly while the machine is running
- Do not use the laser cutter in a way that can hurt anyone
- Do not leave the laser cutter unattended

The lab safety notice also distinguishes authorised materials from banned materials. I used acrylic, which is listed as an authorised material in the displayed FORGE guidance.

![[01_laser_safety_rules.png]]
*Caption: FORGE laser-cutter safety notice showing safety precautions, operating do's and don'ts, authorised materials, and banned materials.*

## 2. Machine Details

The machine used for the exercise was the **1490 CO₂ laser cutter in the FORGE lab**.

| Specification | Observed / documented value |
|---|---|
| Model | 1490 CO2 laser |
| Working Area | 1300 × 900 mm |
| Laser Power | 150 W |
| Machine Power | 1000 W |
| Accuracy | 0.1 mm |
| Working Temperature | 0 °C–40 °C |
| Blowing System | Lower Blowing System |
| Applicable Materials | Acrylic, Plywood, MDF, Foam Board, Cardboard, Paper |
| Control Software | RDWorks V8 |
| Manufacturer | Not identified on the supplied placard |

![[02_laser_machine_details.png]]
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

![[04_gemini_arthur_reference.png]]
*Caption: Initial Arthur Morgan concept generated via Gemini at the requested 50 × 50 mm design scale.*

## 5. Image-to-DXF Conversion

A normal raster image cannot directly become a useful laser-cutting path. The design therefore went through several preparation stages.

The tools involved were:

**Gemini** — used to generate a 50 × 50 mm concept image.

**ChatGPT** — used to adapt the image toward a monochrome / stroke-oriented design suitable for DXF/vector processing.

**CloudConvert** — used in the image-to-DXF workflow.

**Adobe Illustrator** — used for vector cleanup and patching open edges.

**RDWorks V8** — used for machine-job preparation.

![[03_selected_arthur_design.png]]
*Caption: Simplified monochrome Arthur design prepared for vector-based fabrication.*

## 6. File Preparation

After conversion, the vector required manual cleanup before it was safe to send to the laser cutter.

The main preparation work was:

| Preparation step | What I did |
|---|---|
| Vector cleaning | Removed or corrected geometry that could interfere with the final result. |
| Scaling | Prepared the design around the intended 50 × 50 mm size. |
| Closed paths | Repaired open edges so the cutting boundary could be interpreted correctly. |
| Unwanted geometry | Cleaned unnecessary vector elements before machine setup. |
| Final verification | Inspected the vector again in Illustrator before importing it into RDWorks. |

The most important repair involved **open edges**. An open edge can change how a machine interprets a boundary. The black acrylic version was cut before all corrections were complete, resulting in an open-edge issue around the mouth. I patched those areas in Adobe Illustrator for the transparent version.

## 7. Nesting & Layout in RDWorks

In RDWorks V8, I imported the DXF, placed the design on the material layout, and separated the fabrication behaviour into cutting and scanning operations.

The working layer assignment was:

| RDWorks layer colour | Operation |
|---|---|
| Black | Cut |
| Blue | Scan |

The layout was prepared so the vector artwork could produce both a surface-detail layer (scan) and an outer physical boundary (cut).

![[05_rdworks_vector_layout.png]]
*Caption: Final RDWorks layout showing the vector artwork and colour-coded processing paths.*

![[06_rdworks_scan_preview.png]]
*Caption: RDWorks preview of the line-based scan / engraving geometry before fabrication.*

## 8. Final Machine Settings

The settings used during the session are explicitly drawn from the exact RDWorks machine preparation parameters:

| Material | Thickness | Operation | Speed | Minimum Power | Maximum Power | Passes | Frequency |
|---|---:|---|---:|---:|---:|---:|---:|
| Acrylic | 2.00 mm | Cut (Perimeter) | 100.00 mm/s | 30.0% | 30.0% | 1 | 20,000 Hz |
| Acrylic | 2.00 mm | Scan (Engrave) | 100.00 mm/s | 30.0% | 30.0% | 1 | 20,000 Hz |

![[07_actual_laser_settings.png]]
*Caption: Actual laser settings showing 100.00 mm/s speed and 30% power for both scan and cut operations.*

## 9. Cutting Process

The physical process involved:

1. Verifying the prepared geometry.
2. Loading the 2 mm acrylic.
3. Confirming the RDWorks placement and processing colours.
4. Running the scan / engraving layer.
5. Running the cut layer.
6. Checking the resulting acrylic piece.

![[08_laser_machine_process.png]]
*Caption: Observing the 1490 CO₂ laser cutter during operation in the FORGE lab.*

![[09_laser_cutting_closeup.png]]
*Caption: Direct closeup of the laser actively processing the acrylic surface.*

## 10. Final Result – Hero Shot

I produced two physical variants from the same digital geometry.

| Variant | Material | Observation |
|---|---|---|
| 01 | Black acrylic | Early result; an open-edge issue caused a defect around the mouth. |
| 02 | Transparent / clear acrylic | Corrected vector preparation; cleaner and visually stronger preferred result. |

The black version was made before the Illustrator patch, so the open edge affected the mouth area. After the vector was repaired, the **transparent acrylic** produced the better result.

![[10_black_acrylic_result.jpeg]]
*Caption: Early black-acrylic result showing the effect of the unresolved open-edge region around the mouth.*

![[11_transparent_acrylic_result.jpeg]]
*Caption: Final transparent-acrylic result after repairing the vector geometry; the cleaner line structure produced the preferred outcome.*

The comparison also showed something I did not fully anticipate at the start: **transparent acrylic can make laser-engraved detail look more refined because ambient light becomes part of the final visual presentation.**

## 11. Problems Faced & Solutions

| Problem | Identified cause | Solution implemented | Final outcome |
|---|---|---|---|
| Defect around the mouth in the first black version | Open edge in the vector geometry | Patched the geometry in Adobe Illustrator | Cleaner result on the transparent acrylic |
| Raster image was not directly suitable for fabrication | Original source was a multi-tone image rather than machine-ready paths | Simplified the artwork into a line-based, single-colour representation and converted it for vector use | A usable DXF-based fabrication file |
| Visual result changed with acrylic finish | Material appearance affected how engraved detail was perceived | Produced a second transparent-acrylic variant using corrected geometry | Transparent version became the preferred result |

## 12. Reflection

This exercise changed the way I think about digital fabrication. The interesting part was not operating the laser itself; it was understanding that the **digital image had to become machine-readable geometry before the machine could do anything useful with it**.

I learned how image selection, simplification, vector preparation, closed paths, layer assignment, material choice and machine parameters all affect the final physical object.

The most useful practical lesson was the open-edge problem. It showed that a vector file can look correct on screen and still produce a poor physical result. Repairing the geometry in Illustrator and comparing the two acrylic outcomes made that relationship visible.

The transparent acrylic result was also an unexpected takeaway. I initially expected the black version to look stronger, but the transparent material produced a cleaner and more interesting final appearance.

## 13. Source Files

The laser cutting process was captured on video and is available for review:

[Laser Cutting Process Video (Google Drive)](https://drive.google.com/file/d/1NFqGuHHW9DXqUykg3XHzzrZwrXTYDvEW/view?usp=sharing)
