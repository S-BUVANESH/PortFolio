---
title: "From STL to Batman: A 3D Printing Study"
week: 6
day: "02"
date: "2026-09-29"
summary: "A two-day digital fabrication study spanning laser cutting in acrylic and FDM 3D printing, from image-to-DXF preparation to a printed Batman model."
tags: ["3d printing", "Bambu H2S", "Bambu Studio", "PLA Basic", "additive manufacturing"]
---

# From STL to Batman: A 3D Printing Study

*TUESDAY, SEPTEMBER 29 · ADDITIVE MANUFACTURING & 3D PRINTING*

The second half of the week moved from subtractive laser fabrication to additive manufacturing. I initially explored a functional wallet model, but the printed geometry was not working as a functional wallet, so I switched to a **Batman 3D model** for the actual print study. That change gave me a model with richer surface detail and a clear way to study how slicer decisions affect a physical print.

## 1. Printer Details

The printer used for the exercise was a **Bambu Lab H2S**, a single-nozzle FDM printer.

| Specification | Bambu Lab H2S |
|---|---|
| Make | Bambu Lab |
| Model | H2S |
| Build Volume | 340 × 320 × 340 mm |
| Included Nozzle | 0.4 mm hardened steel |
| Supported Nozzle Diameters | 0.2 / 0.4 / 0.6 / 0.8 mm |
| Maximum Nozzle Temperature | 350 °C |
| Maximum Heatbed Temperature | 120 °C |
| Maximum Toolhead Speed | 1000 mm/s |
| Maximum Toolhead Acceleration | 20,000 mm/s² |
| Filament Diameter | 1.75 mm |
| Technology | FDM / FFF |
| Supported materials | PLA, PETG, TPU, PVA, BVOH, ABS, ASA, PC, PA, PET, PPS and selected fiber-reinforced filaments |

The H2S supports a broad range of thermoplastic and engineering filaments. For this exercise I used **PLA Basic**.

## 2. Slicer & Material

**Slicer / software:** Bambu Studio  
**Material:** PLA Basic  
**Nozzle:** 0.4 mm hardened steel  

The model was prepared, scaled, oriented and sliced in Bambu Studio before being sent to the printer.

## 3. Printer Limits & Capabilities

### Capabilities observed

- Very high practical print speed.
- Strong surface/detail reproduction.
- Good dimensional accuracy for the model scale used.
- Large build volume relative to many desktop printers.
- Ability to place multiple designs on the build plate and process them in one job.
- Multiple speed modes that let the operator trade speed against noise / process margin.

### Limitations observed

- The setup used for this exercise did not provide the kind of high-capacity multi-colour workflow available on more advanced multi-material systems. The setup had four filament positions available, but the print itself was single-colour.
- At high movement / printing speeds, the printer produced noticeable shaking. The machine remained very fast, but stability and print quality still depend on the geometry and settings.
- Very high headline speeds are not automatically the best choice for every part; geometry, material, cooling, acceleration and flow constraints still matter.

### H2S device speed modes

The printer interface exposes four speed presets. These are **relative device-level speed multipliers**, not the exact mm/s values for the Batman slicer profile:

| Preset | Relative speed |
|---|---:|
| Silent | 50% |
| Normal / Standard | 100% |
| Sport | 124% |
| Ludicrous | 166% |

These are device-level speed presets relative to the standard profile. They should not be confused with the machine's **1000 mm/s maximum toolhead speed** or with a specific Bambu Studio process profile.

## 4. Why the Object Cannot Be Made Subtractively

The Batman model is a highly detailed, organic 3D form with curved surfaces, recesses, overhangs, and many small features. Machining that shape from a solid block using conventional subtractive methods would require substantial multi-axis access, workholding, tool changes and material removal, especially around recessed or difficult-to-reach geometry.

FDM printing is a better fit for this particular prototype because the printer can build those shapes layer by layer without first removing a large block of material.

## 5. STL Definition

**STL (stereolithography format)** represents a 3D object's surface as a collection of **triangular facets**. The triangles approximate the outer surface of the model, giving the slicer a geometric description it can convert into layers and toolpaths.

STL became common in 3D printing because it is simple, widely supported, and focused on describing the printable surface geometry rather than the full design history of the CAD model.

## 6. Selected STL File

I initially considered printing a functional wallet, but the first model did not meet the functional outcome I wanted. I therefore switched to a **Batman 3D model** for the actual exercise.

The Batman model was a better print-study subject because it contains:

- curved surfaces,
- fine surface details,
- multiple overhangs,
- cavities and recesses,
- and enough geometric variation to expose the effect of support, infill and layer settings.

The original source model was imported into Bambu Studio for preparation.

![[Batman Bambu Studio Preview.png]]

*Caption: Batman model loaded into Bambu Studio for slicing and layer inspection.*

## 7. Slicer Settings

These are the settings I can verify from the session and the supplied Bambu Studio evidence. Values that were not captured have been left explicitly unrecorded instead of being invented.

| Setting | Final value used / observed |
|---|---:|
| Nozzle temperature | ≈240 °C |
| Bed temperature | 55 °C |
| Layer height | 0.20 mm |
| Infill percentage | 15% |
| Infill pattern | Gyroid |
| Wall / shell count | 2 |
| Print speed | Not recorded |
| Supports | Tree supports |
| Adhesion | Outer brim |

The slicer screenshot shows **212 layers** and a Z height of **42.40 mm**, which is consistent with a 0.20 mm layer height for the configured job.

## 8. Print Time & Material Weight

The final Bambu Studio slicing result provides the estimated material and time data:

| Measurement | Estimated value |
|---|---:|
| Model material | 30.81 g |
| Support material | 5.12 g |
| Total material | **35.93 g** |
| Model print time | **2 h 3 min** |
| Preparation time | **5 min 25 s** |
| Total estimated time | **2 h 9 min** |
| Actual material weight | Pending final printed-part measurement |
| Actual print time | Pending final print record |

![[Bambu Studio Slicing Result.png]]

*Caption: Bambu Studio slicing result showing 35.93 g total estimated filament usage and a 2 h 9 min total estimated print time.*

The original intention was to keep the print comfortably under 50 g. The slicer forecast of **35.93 g** confirmed that the selected geometry and settings stayed within that material constraint.

## 10. Final Result

The final printed Batman photograph has not yet been received, so I have deliberately not inserted a fabricated result image.

> **FINAL RESULT PHOTOGRAPH — awaiting the physical print delivery.**
>
> The section is ready for the actual photograph, caption, and final comparison once the printed part is received.

## 11. Source Files

The final browser-friendly model used for the portfolio is available as:

**Buvanesh.glb** — interactive 3D inspection model.  [Download the GLB](./assets/weekly/Week_06/02_Tuesday/Buvanesh.glb)

The original **STL** and final **G-code / printer file** were not present in the supplied project bundle for this update. They should be added before final faculty submission if they are available.

The interactive model is embedded below so the digital geometry can still be inspected directly in the portfolio.

### Interactive 3D Model


## Reflection

The 3D-printing exercise made the difference between digital geometry and manufacturable geometry very clear. The slicer is effectively the translation layer between a model and the machine: orientation, support, infill, walls, temperature and adhesion all change what the printer can actually produce.

The strongest practical lesson was that speed is impressive, but **repeatable quality still depends on the constraints of the part**. I could see how the H2S moves extremely quickly, yet the machine also vibrates more noticeably when pushed hard. That balance between capability and process control is something I would pay more attention to in future prints.

## References / Credits

- Bambu Lab, *H2S — The Ultimate Single-Nozzle 3D Printer Now Bigger Than Ever* — official technical overview: https://blog.bambulab.com/h2s-the-ultimate-single-nozzle-3d-printer-now-bigger-than-ever/
- Bambu Lab, H2S technical specifications / buying guide: https://bambulab.com/it/support/buying-guide
- Bambu Lab H2S technical specifications: https://bambulab.cn/zh-cn/h2s/tech-specs
- Bambu Studio — slicing and print preparation.
- Batman 3D model — source model used for the physical printing exercise.
- AI-assisted tools were used during parts of the design / preparation workflow where noted above.
