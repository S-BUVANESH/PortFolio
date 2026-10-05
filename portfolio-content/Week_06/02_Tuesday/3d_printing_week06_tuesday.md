---
title: "From STL to Batman: A 3D Printing Study"
week_title: "Week 06 — Digital Fabrication & 3D Printing"
week: 6
day: "02"
date: "2026-09-29"
summary: "A digital fabrication study using FDM 3D printing on the Bambu Lab H2S, detailing slicer preparation, material settings, and the additive manufacturing process."
tags: ["3d printing", "Bambu H2S", "Bambu Studio", "PLA Basic", "additive manufacturing"]
---

# From STL to Batman: A 3D Printing Study

*TUESDAY, SEPTEMBER 29 · ADDITIVE MANUFACTURING & 3D PRINTING*

The second half of the week moved from subtractive laser fabrication to additive manufacturing. I initially considered printing a functional wallet, but because it did not meet the intended functional outcome, I switched to a **Batman 3D model** for the final print. That change gave me a model with richer surface detail and a clear way to study how slicer decisions affect a physical print.

## 1. Printer Details

The printer used for the exercise was a **Bambu Lab H2S**, a single-nozzle FDM printer.

| Specification | Bambu Lab H2S |
|---|---|
| Make | Bambu Lab |
| Model | H2S |
| Technology | FDM / FFF |

![[01_bambu_h2s.png]]
*Caption: The Bambu Lab H2S 3D printer used for the additive manufacturing study.*

## 2. Slicer & Material

**Slicer / software:** Bambu Studio  
**Material:** PLA Basic  

The model was prepared, scaled, oriented and sliced in Bambu Studio before being sent to the printer.

## 3. Printer Limits & Capabilities

### Capabilities observed

- Very high practical print speed.
- Strong surface/detail reproduction.
- Ability to place multiple designs on the build plate and process them in one job.

### Limitations observed

- The setup used for this exercise did not provide high-capacity multi-colour workflow natively without additional systems. 
- At high movement / printing speeds, the printer produced noticeable shaking. The machine remained very fast, but stability and print quality still depend heavily on the geometry and settings.

The user described the machine as very high-performing, just below top-end class in practical experience.

## 4. Why the Object Cannot Be Made Subtractively

The Batman model is a highly detailed, organic 3D form with curved surfaces, recesses, overhangs, and small features. Machining that shape from a solid block using conventional subtractive methods would require substantial multi-axis access, workholding, tool changes and material removal, especially around recessed or difficult-to-reach geometry.

FDM printing is a better fit for this particular prototype because the printer can build those shapes layer by layer without first removing a large block of material.

## 5. STL Definition

**STL (stereolithography format)** represents a 3D object's surface as a collection of **triangular facets**. The triangles approximate the outer surface of the model, giving the slicer a geometric description it can convert into layers and toolpaths.

STL became common in 3D printing because it is simple, widely supported, and focused on describing the printable surface geometry rather than the full design history of the CAD model.

## 6. Selected STL File

The selected **Batman 3D model** was an excellent print-study subject because it contains:

- curved surfaces,
- fine surface details,
- multiple overhangs,
- cavities and recesses,
- and enough geometric variation to expose the effect of support, infill and layer settings.

The original source model was imported into Bambu Studio for preparation.

![[02_batman_slicing_preview.png]]
*Caption: Batman model loaded into Bambu Studio for slicing and layer inspection.*

## 7. Slicer Settings

The settings extracted directly from the machine-embedded metadata in the 3MF project are recorded below.

> [!WARNING] Data Conflict Notice
> There is a conflict between the recalled parameters and the embedded machine metadata. The user recalled a nozzle temperature of approximately **240 °C** and a **15% Gyroid** infill. However, the exact embedded metadata within the 3MF file indicates **220 °C** and **5% Gyroid** infill. This requires final confirmation before publication, but the embedded data has been recorded below as the current source of truth.

| Setting | 3MF Embedded Value |
|---|---:|
| Nozzle temperature | 220 °C |
| Hot plate temperature | 55 °C |
| Layer height | 0.20 mm |
| Wall loops | 2 |
| Sparse infill density | 5% |
| Sparse infill pattern | Gyroid |
| Support type | tree(auto) |
| Brim | auto brim, 5 mm width |
| Filament | Bambu PLA Basic |
| Nozzle diameter | 0.40 mm |
| Printer profile | 0.20mm Standard @BBL H2S |

## 8. Print Time & Material Weight

The final Bambu Studio slicing result provides the estimated material and time data:

| Measurement | Estimated value |
|---|---:|
| Estimated model weight | 30.81 g |
| Estimated support weight | 5.12 g |
| Estimated total weight | **35.93 g** |
| Model printing time | 2 h 3 min 7 s |
| Prepare time | 5 min 25 s |
| Estimated total time | **2 h 8 min 33 s** |
| Actual material weight | *[Pending final printed-part measurement]* |
| Actual print time | *[Pending final print record]* |

![[03_slicing_result.png]]
*Caption: Bambu Studio slicing result showing 35.93 g total estimated filament usage and a 2 h 9 min total estimated print time.*

## 9. Final Result

> [!NOTE] Evidence Pending
> **FINAL BATMAN PHOTOGRAPH — awaiting the physical print delivery.**
>
> This section is reserved for the actual hero photograph, detailed caption, and final outcome notes once the printed part and measurements are supplied. Do not fabricate visual results.

## 10. Source Files

The source files and browser-friendly model used for the portfolio are available below:

**Interactive 3D Model:**
**Buvanesh.glb** — interactive 3D inspection model. [Download the GLB](./assets/weekly/Week_06/02_Tuesday/Buvanesh.glb)

**STL Source:**
[BUVANESH_Batman.STL](./assets/weekly/Week_06/02_Tuesday/BUVANESH_Batman.stl)
*(External Google Drive Backup: [View/Download](https://drive.google.com/file/d/1NR81ogc_nagGP7wbmjDBktRzYfgnlKDq/view?usp=sharing))*

**3MF Printer Project:**
[Buvanesh_Batman.3mf](./assets/weekly/Week_06/02_Tuesday/Buvanesh_Batman.3mf)

**G-code Extracted Source:**
[Buvanesh_Batman.gcode](./assets/weekly/Week_06/02_Tuesday/Buvanesh_Batman.gcode)
*(External Google Drive Backup: [View/Download](https://drive.google.com/file/d/1b_gJIkJ55NmAXMhaRAUyqJ1ReHow2Je9/view?usp=sharing))*

### Interactive 3D Model


## References / Credits

- Bambu Studio — slicing and print preparation.
- RDWorks V8 — laser control.
- Adobe Illustrator — vector cleanup.
- Gemini & ChatGPT — image preparation workflows.
